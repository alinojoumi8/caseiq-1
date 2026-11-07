'use client';

import type { RefObject } from 'react';
import { rollMedia } from '@/content/roll';
import { EASE, ScrollTrigger as ScrollTriggerPlugin, easeOut, gsap, useGSAP, type ScrollTrigger } from '@/lib/motion/gsap';
import { Q_INLINE, Q_PINNED } from '@/lib/motion/queries';
import {
  DUPES_OUT,
  DUPLICATE_TILES,
  GAP_IN,
  PILE_TOP,
  PIN_VH,
  RECEIPT_IN,
  ROW_DUR,
  ROW_START,
  ROW_STEP,
  ROW_TILE_W,
  SHRINK_FROM,
  SLOTS,
  STRIP_EMPTIES,
  TILE_FOR_ROW,
  rowTileStart,
  stripRow,
} from './pileScene';

type Scene = ReturnType<typeof gsap.timeline>;

// Curves for a tile in flight, as functions of the flight's progress (0 to 1). Written once, so nothing is allocated per frame.
/** The flight's arc: 0 at both ends, 1 at the top. */
const arc = (u: number) => Math.sin(Math.PI * easeOut(u));
/** A tile keeps its size for the first 70% of its flight and shrinks onto the node only at landing. */
const shrink = (u: number) => (u < SHRINK_FROM ? 0 : easeOut((u - SHRINK_FROM) / (1 - SHRINK_FROM)));
/** It holds full strength, then fades in the last 7%. */
const fade = (u: number) => (u < 0.93 ? 0 : (u - 0.93) / 0.07);
/** Travel with a bump: the eased distance minus a hop of `lift` px, for a trip of `dist()` px. A tween to `dist()` follows it. */
const hop = (lift: number, dist: () => number) => (u: number) => easeOut(u) - (lift / (dist() || 1)) * arc(u);

/** Fades an element between two points of a window (fractions of it), straight. */
function fadeIn(tl: Scene, el: Element | null, at: number, from: number, to: number) {
  if (el) tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: to - from, ease: 'none' }, at + from);
}

/**
 * A timeline row arrives: its date, node, card and page tag, over a window of the scene.
 * `a` is where the window starts and `d` how long it is, in the scene's own units; the parts sit at fractions of it.
 */
function landRow(tl: Scene, li: Element, a: number, d: number) {
  const date = li.querySelector('.tl-date');
  const node = li.querySelector('.tl-node');
  const body = li.querySelector('.tl-body');
  const tag = li.querySelector('.pile-tag');
  const mark = li.querySelector('.mark-check');
  const at = (f: number) => a + f * d;
  const span = (from: number, to: number) => (to - from) * d;

  if (date) tl.fromTo(date, { opacity: 0 }, { opacity: 1, duration: span(0.7, 1), ease: 'none' }, at(0.7));
  if (node) {
    tl.fromTo(node, { scale: 0.5 }, { scale: 1, duration: span(0.75, 1), ease: EASE }, at(0.75));
    tl.fromTo(node, { opacity: 0 }, { opacity: 1, duration: span(0.75, 0.9), ease: 'none' }, at(0.75));
  }
  if (body) {
    tl.fromTo(body, { opacity: 0 }, { opacity: 1, duration: span(0.5, 0.9), ease: 'none' }, at(0.5));
    tl.fromTo(body, { y: 8 }, { y: 0, duration: span(0.5, 1), ease: EASE }, at(0.5));
  }
  if (tag) {
    tl.fromTo(tag, { opacity: 0 }, { opacity: 1, duration: span(0.8, 1), ease: 'none' }, at(0.8));
    tl.fromTo(tag, { scale: 0.8 }, { scale: 1, duration: span(0.8, 1), ease: EASE }, at(0.8));
  }
  if (mark) tl.fromTo(mark, { opacity: 0 }, { opacity: 1, duration: span(0.8, 1), ease: 'none' }, at(0.8));
}

/** The gap row arrives over a window of the scene, from `a` for `d`. */
function landGap(tl: Scene, li: Element, a: number, d: number) {
  const date = li.querySelector('.tl-date');
  const node = li.querySelector('.tl-node');
  const body = li.querySelector('.tl-body');
  fadeIn(tl, date, a, 0, d);
  if (node) {
    tl.fromTo(node, { scale: 0.6 }, { scale: 1, duration: d, ease: EASE }, a);
    tl.fromTo(node, { opacity: 0 }, { opacity: 1, duration: d, ease: 'none' }, a);
  }
  if (body) {
    tl.fromTo(body, { opacity: 0 }, { opacity: 1, duration: d, ease: 'none' }, a);
    tl.fromTo(body, { y: 10 }, { y: 0, duration: d, ease: EASE }, a);
  }
}

/** A scene is as long as the scroll it is scrubbed over: its timeline runs from 0 to 1. */
function sceneTimeline(scrollTrigger: ScrollTrigger.Vars): Scene {
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger });
  tl.set({}, {}, 1); // pad to exactly 1, whatever the last piece's end is
  return tl;
}

/**
 * Wide and tall screens: the stage pins while the page scrolls past, and the scene runs over 1.1 viewport heights.
 * The pin is CSS (the stage is sticky inside a track as tall as the stage plus the pinned distance); ScrollTrigger scrubs
 * the scene over that distance, so the page never moves differently from how it would without the stage.
 */
function pinnedScene(pile: HTMLElement) {
  const stage = pile.querySelector<HTMLElement>('.pile__stage')!;
  const flight = TILE_FOR_ROW.map(() => ({ x: 0, y: 0 }));
  let pin = 0;

  // How tall the track is and how far each tile has to travel to reach its rail node, measured from the layout.
  const measure = () => {
    pin = Math.round(window.innerHeight * PIN_VH);
    pile.style.height = `${stage.offsetHeight + pin}px`;
    TILE_FOR_ROW.forEach((tile, i) => {
      const slot = stage.querySelector(`[data-slot="${tile}"]`);
      const cell = stage.querySelector<HTMLElement>(`[data-row="${i}"] .tl-node`);
      const node = cell?.firstElementChild as HTMLElement | null | undefined;
      if (!slot || !cell || !node) return;
      const s = slot.getBoundingClientRect();
      const c = cell.getBoundingClientRect();
      // The cell scales about its own centre as the row lands, so its centre does not move; the node sits a fixed offset from the cell's top.
      const nodeX = c.left + c.width / 2;
      const nodeY = c.top + c.height / 2 - cell.offsetHeight / 2 + node.offsetTop + node.offsetHeight / 2;
      flight[i].x = nodeX - (s.left + s.width / 2);
      flight[i].y = nodeY - (s.top + s.height / 2);
    });
  };
  pile.dataset.mode = 'pinned';
  measure();

  const tl = sceneTimeline({
    trigger: pile,
    start: `top ${PILE_TOP}px`,
    end: () => `+=${pin}`,
    scrub: true,
    invalidateOnRefresh: true,
    onRefreshInit: measure,
  });

  // The camera-roll tiles fly to their rail nodes, one row after another, each landing as its row arrives.
  TILE_FOR_ROW.forEach((tile, i) => {
    const start = ROW_START + i * ROW_STEP;
    const el = stage.querySelector(`.pile-slot .pile-tile[data-tile="${tile}"]`);
    tl.to(el, { x: () => flight[i].x, duration: ROW_DUR, ease: EASE }, start);
    tl.to(el, { y: () => flight[i].y, duration: ROW_DUR, ease: hop(34, () => flight[i].y) }, start);
    tl.to(el, { rotation: i % 2 ? 7 : -7, duration: ROW_DUR, ease: arc }, start);
    tl.to(el, { scale: 0.16, duration: ROW_DUR, ease: shrink }, start);
    tl.to(el, { opacity: 0, duration: ROW_DUR, ease: fade }, start);
    landRow(tl, stage.querySelector(`[data-row="${i}"]`)!, start, ROW_DUR);
  });

  // The duplicates are set aside where they lie.
  const dupes = stage.querySelectorAll(DUPLICATE_TILES.map((t) => `.pile-slot .pile-tile[data-tile="${t}"]`).join(', '));
  tl.to(dupes, { opacity: 0, scale: 0.9, duration: DUPES_OUT[1] - DUPES_OUT[0] }, DUPES_OUT[0]);

  // The gap, then the "checked by a person" receipt.
  landGap(tl, stage.querySelector('.pile-row--gap')!, GAP_IN[0], GAP_IN[1] - GAP_IN[0]);
  const receipt = stage.querySelector('.receipt');
  fadeIn(tl, receipt, RECEIPT_IN[0], 0, RECEIPT_IN[1] - RECEIPT_IN[0]);
  tl.fromTo(receipt, { y: 8 }, { y: 0, duration: RECEIPT_IN[1] - RECEIPT_IN[0], ease: EASE }, RECEIPT_IN[0]);

  return () => {
    pile.dataset.mode = 'static';
    pile.style.removeProperty('height');
  };
}

/**
 * Phones and narrow windows: no pin. Each row has its own scene, scrubbed from the moment the row enters the viewport
 * (its top at 96% of the screen) to when it reaches the reading zone (62%): its tile lifts onto the node, and the compact
 * roll strip above the first row empties as rows land.
 */
function inlineScenes(pile: HTMLElement) {
  pile.dataset.mode = 'inline';
  const nodeX = () => (window.innerWidth <= 520 ? 56 : 76) + 8 + 14; // centre of the node column
  const scrub = (li: Element) => ({ trigger: li, start: 'top 96%', end: 'top 62%', scrub: true, invalidateOnRefresh: true });

  pile.querySelectorAll('.pile-row').forEach((li) => {
    const gap = li.classList.contains('pile-row--gap');
    if (gap) {
      landGap(sceneTimeline(scrub(li)), li, 0.2, 0.8);
      return;
    }
    const row = Number((li as HTMLElement).dataset.row);
    const tl = sceneTimeline(scrub(li));
    landRow(tl, li, 0, 1);

    // The row's source tile starts at the row's left edge at full thumbnail size (about 72px), flies to the node, and only
    // shrinks in the last 30% of the motion. Its flight takes the first 80% of the scene.
    const tile = li.querySelector('.pile-tile--row');
    const { scale, centreY } = rowTileStart(row);
    const dy = 12 - centreY; // the tile's top edge starts level with the row's top
    const flight = 0.8;
    tl.fromTo(tile, { x: 0 }, { x: () => nodeX() - ROW_TILE_W / 2, duration: flight, ease: EASE }, 0);
    tl.fromTo(tile, { y: 0 }, { y: dy, duration: flight, ease: hop(8, () => dy) }, 0);
    tl.fromTo(tile, { rotation: row % 2 ? 6 : -6 }, { rotation: 0, duration: flight, ease: EASE }, 0);
    tl.fromTo(tile, { scale }, { scale: scale * 0.16, duration: flight, ease: shrink }, 0);
    tl.fromTo(tile, { opacity: 1 }, { opacity: 0, duration: flight, ease: fade }, 0);

    // Its slot in the strip empties as the row lands; the two duplicates go with rows 3 and 4.
    const wraps = SLOTS.filter((n) => stripRow(n) === row).map((n) => pile.querySelector(`.pile-strip__wrap[data-strip="${n}"]`));
    tl.fromTo(wraps, { opacity: 1 }, { opacity: 0, duration: STRIP_EMPTIES[1] - STRIP_EMPTIES[0], ease: 'none' }, STRIP_EMPTIES[0]);
  });

  return () => {
    pile.dataset.mode = 'static';
  };
}

/**
 * The S4 scene, played over the finished timeline that PileStage renders. It renders nothing.
 * gsap.matchMedia picks the scene: pinned on a wide, tall screen with motion allowed, one scene per row on a narrow screen,
 * and none for reduced motion or a short wide screen, which keep the finished timeline (data-mode static). Everything made
 * here is undone when the screen stops matching and when the page unmounts.
 */
export default function PileMotion({ scope }: { scope: RefObject<HTMLDivElement | null> }) {
  useGSAP(
    () => {
      const pile = scope.current;
      if (!pile) return;
      const mm = gsap.matchMedia();
      mm.add({ pinned: Q_PINNED, inline: Q_INLINE }, (ctx) => {
        const { pinned } = ctx.conditions as { pinned: boolean; inline: boolean };
        return pinned ? pinnedScene(pile) : inlineScenes(pile);
      });
      // The roll's photos are background images of tiles that are not drawn until the scene starts; asking for them now means they are there.
      Object.values(rollMedia.tiles).forEach((t) => {
        new Image().src = t.src;
      });
      // The stage's pictures (the roll's photos) change its height as they load, and the triggers were measured before that. A picture's
      // load event does not bubble, so it is heard in the capture phase; the triggers are measured again once, a moment after the last one.
      let measure: number | undefined;
      const onLoad = () => {
        window.clearTimeout(measure);
        measure = window.setTimeout(() => ScrollTriggerPlugin.refresh(), 150);
      };
      pile.addEventListener('load', onLoad, true);
      return () => {
        pile.removeEventListener('load', onLoad, true);
        window.clearTimeout(measure);
        mm.revert();
      };
    },
    { scope },
  );
  return null;
}
