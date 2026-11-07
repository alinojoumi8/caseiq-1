'use client';

import { Fragment, useId } from 'react';
import { en } from '@/content/en';
import { useConversation } from '@/components/ConversationContext';
import { Bubble } from '@/components/world/Bubble';
import { NoBreak } from '@/components/world/NoBreak';
import { ArrowRightIcon, ChevronIcon } from '@/components/world/icons';

const first = en.intake.steps[0];
// The helper breaks after its dot when the card is wide: "6 quick questions ·" over "A person replies within one business day".
const helperParts = en.world.replyPlaceholder.split(' · ');
const sentName = (name: string) => en.success.title.replace('{firstName}', name);

/**
 * The closing section's right-hand card: question 1 of the thread, laid out the way the sheet shows it. Tapping a chip opens
 * the sheet with that answer already recorded and the thread on question 2. Once the visitor is partway through, or has sent
 * the request, the card says so and opens the sheet where they left off.
 */
export function ConversationLauncher() {
  const { progress, open } = useConversation();
  const hintId = useId();
  const sent = progress.status === 'sent';
  const partway = !sent && progress.step > 0;

  return (
    <div className="launch" data-state={sent ? 'sent' : partway ? 'partway' : 'new'}>
      {sent ? (
        <>
          <div className="msg msg--rx">
            <Bubble tail>
              <b className="launch__title">{sentName(progress.name)}</b>
              <span className="launch__sub">{en.success.tip}</span>
            </Bubble>
          </div>
          <div className="launch__reopen">
            <button type="button" className="btn-outline launch__outline" data-convo-return="" onClick={() => open({ from: 'final' })}>
              {en.convo.reopen}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="thread-pill launch__pill">{en.intake.progress.replace('{n}', String(progress.step + 1))}</p>
          {partway ? (
            <div className="msg msg--rx">
              <Bubble tail>{en.convo.resume}</Bubble>
            </div>
          ) : (
            <>
              <div className="msg msg--rx">
                <Bubble>{first.question}</Bubble>
              </div>
              <div className="msg msg--rx">
                <Bubble tail>{first.helper}</Bubble>
              </div>
              <span id={hintId} className="sr-only">
                {en.convo.chipHint}
              </span>
              <div className="launch__chips">
                {first.options.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    className="chip launch__chip"
                    aria-describedby={hintId}
                    aria-haspopup="dialog"
                    onClick={() => open({ from: 'final', caseType: o.value })}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="reply-bar launch__bar">
            <span className="reply-bar__helper">
              {helperParts.map((part, i) => (
                <Fragment key={part}>
                  {i > 0 ? ' ' : null}
                  <span className="launch__part">{i < helperParts.length - 1 ? `${part} ·` : part}</span>
                </Fragment>
              ))}
            </span>
            <button type="button" className="send" data-convo-return="" aria-haspopup="dialog" onClick={() => open({ from: 'final' })}>
              {partway ? en.convo.resumeCta : en.cta.primary}
              <span className="send__arrow">
                <ArrowRightIcon />
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** The early-access link under the closing section's text: opens the sheet with the list expanded. */
export function EarlyAccessLink() {
  const { open } = useConversation();
  return (
    <button type="button" className="wl-toggle" aria-haspopup="dialog" onClick={() => open({ from: 'final', waitlist: true })}>
      <span>
        <NoBreak>{en.waitlist.toggle}</NoBreak>
      </span>
      <ChevronIcon dir="right" />
    </button>
  );
}
