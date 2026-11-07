'use client';

import { useRef, useState } from 'react';
import { en } from '@/content/en';
import { heroExamples, type CaseId } from '@/content/examples';
import { useCaseType } from '@/components/CaseTypeContext';
import { track } from '@/lib/analytics';
import { ReleaseGate, lazyPiece, releaseMotionGate, useMotionAllowed } from '@/lib/motion/lazy';
import { Quiet } from '@/components/layout/Quiet';
import { Bubble } from '@/components/world/Bubble';
import { PageTag } from '@/components/world/PageTag';
import { QuickReplies } from '@/components/world/QuickReplies';
import { QuoteCard } from '@/components/world/QuoteCard';
import { RailLabel, RailNode } from '@/components/world/TimelineRail';
import { SourceViewer } from '@/components/world/SourceViewer';
import { PageIcon } from '@/components/world/icons';
import { CheckIcon } from './a/icons';
import '@/app/sections-a.css';

// The arrival is played by HeroMotion, loaded after the page has hydrated so GSAP stays out of the first paint. It is mounted only
// while motion is allowed, and if its code fails to load (or it throws) the hero's intro gate is let go and the page shows as it is.
const HeroMotion = lazyPiece(() => import('./HeroMotion'), ReleaseGate);

const chipOptions = en.hero.chips.map((c) => ({ id: c.id as CaseId, label: c.label }));

const [gapTitle, gapSub] = en.world.gapNode.split(' · ');

/**
 * The hero's chips and example thread.
 * Choosing a chip sends it as a bubble, the thread answers, then the message lifts and settles on the rail.
 * The thread is always rendered finished; HeroMotion plays the arrival over it, picking its pieces by data-at.
 * Renders two siblings (chips, thread) so the hero grid can place them independently.
 */
export function HeroInteractive() {
  const { setPicked } = useCaseType();
  const [selected, setSelected] = useState<CaseId>('job');
  const [run, setRun] = useState(0); // 0 = nothing chosen yet: show final states, no entrance
  const [viewerOpen, setViewerOpen] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const motion = useMotionAllowed();

  const ex = heroExamples.find((e) => e.id === selected) ?? heroExamples[0];

  function choose(id: CaseId) {
    if (id === selected && run > 0) return;
    setSelected(id);
    setPicked(id);
    setRun((r) => r + 1);
    track('chip_select', { chip: id });
  }

  return (
    <>
      <div className="hero-chips">
        <QuickReplies label={en.hero.chipsLabel} options={chipOptions} value={selected} onChange={choose} />
      </div>

      <div ref={threadRef} className="thread" role="group" aria-label={en.example.label} data-case={selected}>
        <div key={`${selected}-${run}`}>
          {/* Sent bubble + Delivered */}
          <div className="trow trow--sent trow--end">
            <div className="trow__main">
              <div data-at="send" style={{ transformOrigin: '100% 100%' }}>
                <Bubble variant="sent" tail>
                  {ex.chip}
                </Bubble>
              </div>
              <p className="thread-delivered" data-at="delivered">
                {en.world.delivered}
              </p>
            </div>
            <div className="trow__rail" />
          </div>

          {/* Example label + Timeline title */}
          <div className="trow trow--pill trow--center">
            <div className="trow__main">
              <span className="thread-pill" data-at="pill">
                {en.example.label}
              </span>
            </div>
            <div className="trow__rail">
              <span className="rail-title" data-at="pill">
                {en.world.timeline}
              </span>
            </div>
          </div>

          {/* Your words */}
          <div className="trow trow--rail trow--end">
            <div className="trow__main">
              <div className="thread-item thread-item--end" data-at="mine">
                <p className="thread-label">{en.proof.yourWords}</p>
                <Bubble variant="yours">{ex.yourWords}</Bubble>
              </div>
            </div>
            <div className="trow__rail" />
          </div>

          {/* Your papers show: screenshot card */}
          <div className="trow trow--rail">
            <div className="trow__main">
              <div data-at="shot">
                <p className="thread-label">{en.proof.papersShow}</p>
                <QuoteCard className="shot-card" reference={ex.source} quote={ex.papersShow}>
                  <div className="shot-actions">
                    <button
                      type="button"
                      className="see-page"
                      aria-haspopup="dialog"
                      onClick={() => {
                        setViewerOpen(true);
                        track('see_page_open', { chip: ex.id });
                      }}
                    >
                      <PageIcon />
                      {en.proof.seePage}
                    </button>
                  </div>
                </QuoteCard>
              </div>
            </div>
            <div className="trow__rail">
              <span style={{ display: 'inline-flex' }} data-at="node1">
                <RailNode kind="solid" />
              </span>
              <span data-at="node1-label">
                <RailLabel title={ex.rail.date} sub={ex.rail.page} />
              </span>
            </div>
          </div>

          {/* A second source lifts onto the rail (every case has one) */}
          <div className="trow trow--rail trow--lift">
            <div className="trow__main">
              <div className="bubble lift" data-at="lift">
                {ex.lift.text}
                <PageTag variant="pill">{ex.lift.source}</PageTag>
              </div>
              <span className="leader" aria-hidden="true" data-at="leader" />
            </div>
            <div className="trow__rail">
              <span style={{ display: 'inline-flex' }} data-at="node2">
                <RailNode kind="solid" />
              </span>
              <span data-at="node2-label">
                <RailLabel title={ex.lift.rail.date} sub={ex.lift.rail.page} />
              </span>
            </div>
          </div>

          {/* Not in your papers yet */}
          <div className="trow trow--rail">
            <div className="trow__main">
              <div data-at="gap">
                <Bubble variant="gap" style={{ maxWidth: 392 }}>
                  <b>{en.proof.gap}:</b> {ex.gap}
                  <span className="gap-add">{en.proof.addIt}</span>
                </Bubble>
              </div>
            </div>
            <div className="trow__rail">
              <span style={{ display: 'inline-flex' }} data-at="node3">
                <RailNode kind="gap" />
              </span>
              <span data-at="node3-label">
                <RailLabel title={gapTitle} sub={gapSub} />
              </span>
            </div>
          </div>
        </div>
        <p className="receipt" data-at="receipt">
          <CheckIcon />
          <span>{en.world.checked}</span>
        </p>
      </div>
      {motion ? (
        <Quiet onError={releaseMotionGate}>
          <HeroMotion scope={threadRef} run={run} />
        </Quiet>
      ) : null}

      <SourceViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        page={{ kind: ex.pageKind, source: ex.source, quote: ex.papersShow, page: ex.rail.page }}
      />
    </>
  );
}
