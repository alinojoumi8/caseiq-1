'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { en } from '@/content/en';
import { heroExamples, qaExamples, timelineExamples } from '@/content/examples';
import { AttachmentBubble } from '@/components/world/AttachmentBubble';
import { Bubble } from '@/components/world/Bubble';
import { ChevronIcon, CloseIcon, PageIcon } from '@/components/world/icons';
import { PageTag } from '@/components/world/PageTag';
import { RailNode } from '@/components/world/TimelineRail';

const pv = en.get.preview;
const COUNT = pv.pages.length;

const FACTS = [1, 3, 6]; // the three key facts: timeline items by number
const dayMonth = (date: string) => date.slice(0, date.lastIndexOf(' '));
const year = (date: string) => date.slice(date.lastIndexOf(' ') + 1);

/** The five example pages, in the order of pv.pages. Every line is an existing example line; nothing here is new. */
function PageContent({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="brief__list">
        {timelineExamples
          .filter((t) => FACTS.includes(t.n))
          .map((t) => (
            <div key={t.n} className="brief__fact">
              <p className="brief__what">
                <span>
                  {t.date} · {t.what}
                </span>
                <PageTag variant="pill">{t.source}</PageTag>
              </p>
              <blockquote className="quote-text">“{t.quote}”</blockquote>
            </div>
          ))}
      </div>
    );
  }
  if (index === 1) {
    return (
      <ol className="brief__list brief__rail">
        {timelineExamples.map((t) => (
          <li key={t.n} className="brief__row">
            <span className="rail-label">
              <time dateTime={t.iso}>
                <b>{dayMonth(t.date)}</b>
                <span>{year(t.date)}</span>
              </time>
            </span>
            <RailNode kind={t.computerRead ? 'dashed' : 'solid'} />
            <span className="brief__row-main">
              <span className="brief__row-what">{t.what}</span>
              <PageTag variant="plain" muted>
                {t.source}
              </PageTag>
              {t.computerRead ? <span className="brief__check">{en.pile.computerRead}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    );
  }
  if (index === 2) {
    return (
      <ol className="brief__list brief__sources">
        {timelineExamples.map((t) => (
          <li key={t.n}>
            <PageIcon />
            <span className="brief__row-main">
              <PageTag variant="pill">{t.source}</PageTag>
              <span className="brief__row-what">{t.what}</span>
              {t.computerRead ? <span className="brief__check">{en.pile.computerRead}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    );
  }
  if (index === 3) {
    return (
      <div className="brief__list">
        <Bubble variant="gap">
          <b>{en.proof.gap}:</b> {heroExamples[0].gap}
        </Bubble>
        <Bubble variant="gap">{en.pile.gap}</Bubble>
      </div>
    );
  }
  const ask = qaExamples.find((q) => q.id === 'q3');
  return (
    <div className="brief__list">
      <div className="thread-item">
        <p className="thread-label">{en.proof.yourWords}</p>
        <Bubble variant="yours">{ask?.question}</Bubble>
      </div>
    </div>
  );
}

/**
 * The "Summary for my lawyer" attachment and its paged preview.
 * The attachment is a button. The preview is a native modal dialog (focus trap, inert background, Esc closes, focus returns),
 * with previous/next, a page indicator, the D-3 header, the five page titles and the Example label.
 * While it is open it carries data-layer-open so Esc-twice Quick exit does not fire.
 */
export function SummaryPreview({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const dlgRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const dlgId = useId();

  useEffect(() => {
    const dlg = dlgRef.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      opener.current = document.activeElement as HTMLElement | null;
      dlg.showModal();
    } else if (!open && dlg.open) {
      dlg.close();
    }
  }, [open]);

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + COUNT) % COUNT), []);

  function onKeyDown(e: KeyboardEvent<HTMLDialogElement>) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    }
  }

  const title = pv.pages[index];

  return (
    <>
      <AttachmentBubble
        className="get-attach"
        name={name}
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dlgId}
      />
      <dialog
        ref={dlgRef}
        id={dlgId}
        className="viewer viewer--brief"
        aria-labelledby={titleId}
        data-layer-open={open ? '' : undefined}
        data-lenis-prevent
        onKeyDown={onKeyDown}
        onClose={() => {
          setOpen(false);
          opener.current?.focus?.();
        }}
        onClick={(e) => {
          // A click on the backdrop lands on the dialog element itself.
          if (e.target === dlgRef.current) dlgRef.current?.close();
        }}
      >
        <div className="viewer__head">
          <h2 id={titleId} className="viewer__title">
            {pv.label}
          </h2>
          <button type="button" className="icon-btn" onClick={() => dlgRef.current?.close()} aria-label={en.ui.close}>
            <CloseIcon />
          </button>
        </div>
        <div className="viewer__body">
          <div className="doc">
            <p className="brief__hdr">
              <b>{pv.label}</b> · {pv.header}
            </p>
            <div key={index} className="brief__page">
              <h3 className="brief__title">{title}</h3>
              <PageContent index={index} />
            </div>
          </div>

          <div className="brief__nav">
            <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label={`${en.ui.preview.prev}: ${pv.pages[(index + COUNT - 1) % COUNT]}`}>
              <ChevronIcon dir="left" />
            </button>
            <p className="brief__count" aria-live="polite" aria-atomic="true">
              <span className="sr-only">
                {en.ui.preview.page} {index + 1} {en.ui.preview.of} {COUNT}: {title}
              </span>
              <span aria-hidden="true">
                {index + 1} / {COUNT}
              </span>
              <span className="brief__dots" aria-hidden="true">
                {pv.pages.map((p, i) => (
                  <i key={p} data-on={i === index} />
                ))}
              </span>
            </p>
            <button type="button" className="icon-btn" onClick={() => go(1)} aria-label={`${en.ui.preview.next}: ${pv.pages[(index + 1) % COUNT]}`}>
              <ChevronIcon dir="right" />
            </button>
          </div>

          <div className="viewer__note">
            <span className="thread-pill">{en.example.label}</span>
          </div>
        </div>
      </dialog>
    </>
  );
}
