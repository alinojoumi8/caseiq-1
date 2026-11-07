'use client';

import { Fragment, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { en } from '@/content/en';
import { qaExamples, type AnswerPart, type QaExample } from '@/content/examples';
import { Quiet } from '@/components/layout/Quiet';
import { lazyPiece, useMotionAllowed } from '@/lib/motion/lazy';
import { Bubble } from '@/components/world/Bubble';
import { PageTag } from '@/components/world/PageTag';
import { QuoteCard } from '@/components/world/QuoteCard';

// The arrival is played by AskMotion, loaded after the page has hydrated so GSAP stays out of the first paint. It is mounted only
// while motion is allowed, and if its code fails to load a fresh answer simply appears.
const AskMotion = lazyPiece(() => import('./AskMotion'));

type QaId = QaExample['id'];

/** Turns the answer parts into paragraphs, quote cards and inline quotes. Quotes are Source Serif, references are mono. */
function Answer({ parts }: { parts: readonly AnswerPart[] }) {
  const blocks: ReactNode[] = [];
  let run: ReactNode[] = [];
  let n = 0;
  const flush = () => {
    if (run.length) blocks.push(<p key={`p${n++}`} className="ans__p">{run}</p>);
    run = [];
  };
  for (const part of parts) {
    if (part.t === 'text') {
      if (!part.cont) flush();
      const lead = run.length && !/^[,.;:]/.test(part.text) ? ' ' : '';
      run.push(<Fragment key={`t${n++}`}>{lead + part.text}</Fragment>);
    } else if (part.inline) {
      run.push(
        <Fragment key={`q${n++}`}>
          {run.length ? ' ' : ''}
          <span className="qi">“{part.text}”</span> <PageTag variant="pill">{part.source}</PageTag>
        </Fragment>,
      );
    } else {
      flush();
      blocks.push(
        <QuoteCard key={`c${n++}`} className="ans__card" reference={<PageTag>{part.source}</PageTag>} quote={part.text}>
          {part.caution ? <p className="caution">{part.caution}</p> : null}
        </QuoteCard>,
      );
    }
  }
  flush();
  return <>{blocks}</>;
}

/** One question and its answer. A fresh one is tagged data-fresh, and AskMotion plays it in. */
function Exchange({ qa, animate }: { qa: QaExample; animate: boolean }) {
  // The refusal is one sentence with its redirect inside it, so it has no chips.
  const parts: readonly AnswerPart[] = qa.kind === 'decline' ? [{ t: 'text', text: en.ask.refusal }] : qa.parts;
  return (
    <div className="xchg" data-fresh={animate ? '' : undefined}>
      <div className="msg msg--sent" style={{ transformOrigin: '100% 100%' }}>
        <Bubble variant="sent" tail>
          <span className="sr-only">{en.ui.ask.you}: </span>
          {qa.question}
        </Bubble>
      </div>
      <div className="ans-row">
        <p className="ans__sender">{en.ask.sender}</p>
        <div className="msg msg--rx">
          <Bubble tail className="ans">
            <span className="sr-only">{en.ui.ask.us}: </span>
            <Answer parts={parts} />
          </Bubble>
        </div>
      </div>
    </div>
  );
}

/**
 * The Q&A thread. The three questions are suggested replies: choosing one sends it as a sent bubble and Case IQ answers
 * in a received bubble. It starts with the first answer showing, so the section is never empty. Answers are announced politely.
 */
export function AskThread() {
  const labelId = useId();
  const logRef = useRef<HTMLDivElement>(null);
  const motion = useMotionAllowed();
  const [order, setOrder] = useState<QaId[]>(['q1']);
  const [fresh, setFresh] = useState<{ id: QaId; run: number } | null>(null);
  const latest = order[order.length - 1];

  function ask(id: QaId) {
    if (id === latest) return;
    setOrder((prev) => [...prev.filter((x) => x !== id), id]);
    setFresh((f) => ({ id, run: (f?.run ?? 0) + 1 }));
  }

  return (
    <div className="convo" role="group" aria-labelledby={labelId}>
      <div className="convo__head">
        <span className="thread-pill">{en.example.label}</span>
        <p id={labelId} className="convo__label">
          {en.ask.prompt}
        </p>
      </div>
      <div ref={logRef} className="convo__log" aria-live="polite" aria-relevant="additions text">
        {order.map((id) => {
          const qa = qaExamples.find((q) => q.id === id)!;
          const isFresh = fresh?.id === id;
          return <Exchange key={isFresh ? `${id}-${fresh.run}` : id} qa={qa} animate={isFresh} />;
        })}
      </div>
      {motion ? (
        <Quiet>
          <AskMotion scope={logRef} run={fresh?.run ?? 0} />
        </Quiet>
      ) : null}
      <div className="convo__replies" role="group" aria-label={en.ui.ask.suggested}>
        {qaExamples.map((q) => (
          <button
            key={q.id}
            type="button"
            className="chip chip--ask"
            aria-current={q.id === latest ? 'true' : undefined}
            onClick={() => ask(q.id)}
          >
            {q.question}
          </button>
        ))}
      </div>
    </div>
  );
}
