'use client';

import { Fragment, useRef, type CSSProperties } from 'react';
import { en } from '@/content/en';
import { timelineExamples, type TimelineExample } from '@/content/examples';
import { Quiet } from '@/components/layout/Quiet';
import { lazyPiece, useMotionAllowed } from '@/lib/motion/lazy';
import { Bubble } from '@/components/world/Bubble';
import { PageTag } from '@/components/world/PageTag';
import { QuoteCard } from '@/components/world/QuoteCard';
import { RailNode, TimelineRail } from '@/components/world/TimelineRail';
import { CheckIcon } from './icons';
import { SLOTS, TILE_FOR_ROW, rowTileStart, sizeOf, stripFit } from './pileScene';

// The scene is played by PileMotion, loaded after the page has hydrated so GSAP stays out of the first paint. It is mounted only
// while motion is allowed, and if its code fails to load the finished timeline simply stays as it is.
const PileMotion = lazyPiece(() => import('./PileMotion'));

/** Splits "12 Jan 2025" into the short date and the year so the rail label fits its column. */
function splitDate(date: string) {
  const i = date.lastIndexOf(' ');
  return { day: date.slice(0, i), year: date.slice(i + 1) };
}

const [gapTitle, gapSub] = en.world.gapNode.split(' · ');

function RowView({ item, index }: { item: TimelineExample; index: number }) {
  const { tw, th, centreY } = rowTileStart(index);
  const { day, year } = splitDate(item.date);
  const kind = item.computerRead ? 'dashed' : 'solid';

  return (
    <li className="tl-item pile-row" data-node={kind} data-row={index}>
      <div className="tl-date rail-label">
        <time dateTime={item.iso}>
          <b>{day}</b>
          <span>{year}</span>
        </time>
      </div>
      <div className="tl-node">
        <RailNode kind={kind} />
      </div>
      {/* Phones: the row's own source tile, which lifts onto the node. The size and start are set here; PileMotion moves it. */}
      <i
        className="pile-tile pile-tile--row"
        aria-hidden="true"
        data-tile={TILE_FOR_ROW[index]}
        style={{ '--tw': `${tw}px`, '--th': `${th}px`, '--sy': `${centreY}px` } as CSSProperties}
      />
      <div className="tl-body">
        <QuoteCard
          reference={
            <>
              <span>{item.what}</span>
              <span className="pile-tag">
                <PageTag variant="pill">{item.source}</PageTag>
              </span>
            </>
          }
          quote={item.quote}
        >
          {item.computerRead ? <p className="mark-check">{en.pile.computerRead}</p> : null}
        </QuoteCard>
      </div>
    </li>
  );
}

function GapView() {
  return (
    <li className="tl-item pile-row pile-row--gap" data-node="gap">
      <div className="tl-date rail-label">
        <b>{gapTitle}</b>
        <span>{gapSub}</span>
      </div>
      <div className="tl-node">
        <RailNode kind="gap" />
      </div>
      <div className="tl-body pile-gap-body">
        <Bubble variant="gap">{en.pile.gap}</Bubble>
      </div>
    </li>
  );
}

/**
 * The S4 stage: heading, body, the camera roll and the timeline rail.
 * It renders the finished timeline (empty dashed roll slots, every row in place), which is also what the server sends, what
 * reduced motion keeps and what short wide screens show. PileMotion sets data-mode and plays the scene on top of it:
 *  pinned  wide, tall screen: the stage pins while the page scrolls past and the roll's tiles fly to their rail nodes, then the gap and the receipt arrive.
 *  inline  phone or narrow screen: no pinning; each row's tile lifts onto the rail as the row scrolls into view.
 * Scrolling is never captured: the page moves exactly as it would without the stage, and the stage lets go at the end.
 * The tiles are always in the markup; CSS shows them only in the mode that uses them.
 */
export function PileStage() {
  const pileRef = useRef<HTMLDivElement>(null);
  const motion = useMotionAllowed();

  // Chronologically the gap belongs right after the 20 January notes.
  const gapAfter = 1;

  return (
    <>
      <div ref={pileRef} className="pile" data-mode="static">
        <div className="pile__stage">
          <div className="pile__side">
            <h2 id="pile-h" className="h-section">
              {en.pile.h2}
            </h2>
            <p className="pile-body">{en.pile.body}</p>
            <div className="pile__roll" aria-hidden="true">
              <div className="pile-roll">
                {SLOTS.map((n) => (
                  <div key={n} className="pile-slot" data-slot={n}>
                    <i className="pile-tile" data-tile={n} />
                  </div>
                ))}
              </div>
              <div className="roll-cap">{en.world.roll}</div>
            </div>
            <p className="pile__meta">
              <span className="thread-pill">{en.example.label}</span>
              <span>{en.pile.caption}</span>
            </p>
          </div>

          <div className="pile__rail">
            <div className="pile-strip" aria-hidden="true">
              <div className="pile-strip__row">
                {SLOTS.map((n) => {
                  const [tw, th] = sizeOf(n);
                  return (
                    <div key={n} className="pile-strip__slot">
                      <i className="pile-strip__wrap" data-strip={n}>
                        <i
                          className="pile-tile pile-tile--mini"
                          data-tile={n}
                          style={{ width: tw, height: th, transform: stripFit(n, tw, th) }}
                        />
                      </i>
                    </div>
                  );
                })}
              </div>
              <div className="roll-cap">{en.world.roll}</div>
            </div>
            <p className="pile__rail-title" aria-hidden="true">
              {en.world.timeline}
            </p>
            <TimelineRail label={en.world.timeline}>
              {timelineExamples.map((item, i) => (
                <Fragment key={item.n}>
                  <RowView item={item} index={i} />
                  {i === gapAfter ? <GapView /> : null}
                </Fragment>
              ))}
            </TimelineRail>
            <p className="receipt">
              <CheckIcon />
              <span>{en.world.checked}</span>
            </p>
          </div>
        </div>
      </div>
      {/* A sibling, not a child: when the page comes back from another route React re-runs this effect before it re-attaches a parent's ref. */}
      {motion ? (
        <Quiet>
          <PileMotion scope={pileRef} />
        </Quiet>
      ) : null}
    </>
  );
}
