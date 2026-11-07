'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { claims, type ClaimId } from '@/content/claims';
import { en } from '@/content/en';
import { track } from '@/lib/analytics';
import { ExternalIcon, SourceIcon } from './icons';

// Only one popover is open at a time: the open id lives in a tiny module store.
let openId: string | null = null;
const listeners = new Set<() => void>();
function setOpenId(id: string | null) {
  if (openId === id) return;
  openId = id;
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
const getSnapshot = () => openId;
const getServerSnapshot = () => null;

const SHEET_QUERY = '(max-width: 639px)';

/**
 * "Where this comes from" chip. A small inline button that opens a popover with the source's title, publisher,
 * date, locator, a quote of 25 words or fewer and an external link. Esc closes it and returns focus to the chip.
 */
export function CiteChip({ id }: { id: ClaimId }) {
  const claim = claims[id];
  const uid = useId();
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const open = current === uid;
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [sheet, setSheet] = useState(false);

  const place = useCallback(() => {
    const btn = btnRef.current;
    const pop = popRef.current;
    if (!btn || !pop) return;
    const isSheet = window.matchMedia(SHEET_QUERY).matches;
    setSheet(isSheet);
    if (isSheet) return;
    const r = btn.getBoundingClientRect();
    const w = pop.offsetWidth;
    const h = pop.offsetHeight;
    const margin = 12;
    const left = Math.min(Math.max(margin, r.left), window.innerWidth - w - margin);
    let top = r.bottom + 8;
    if (top + h > window.innerHeight - margin) top = Math.max(margin, r.top - h - 8);
    setPos({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    popRef.current?.focus();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpenId(null);
        btnRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpenId(null);
    };
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpenId(null);
    };
    const reflow = () => place();
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('focusin', onFocusIn);
    window.addEventListener('resize', reflow);
    window.addEventListener('scroll', reflow, { passive: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('focusin', onFocusIn);
      window.removeEventListener('resize', reflow);
      window.removeEventListener('scroll', reflow);
    };
  }, [open, place]);

  // Close if this chip unmounts while open.
  useEffect(() => () => {
    if (openId === uid) setOpenId(null);
  }, [uid]);

  const popId = `${uid}-pop`;
  const titleId = `${uid}-title`;

  return (
    <span className="cite">
      <button
        ref={btnRef}
        type="button"
        className="cite__btn"
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        aria-haspopup="dialog"
        aria-label={`${en.ui.cite.chip}: ${claim.title}`}
        onClick={() => {
          if (open) {
            setOpenId(null);
          } else {
            setOpenId(uid);
            track('cite_open', { claim: id });
          }
        }}
      >
        <SourceIcon />
        {en.ui.cite.chip}
      </button>
      {open ? (
        <div
          ref={popRef}
          id={popId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="cite__pop"
          data-layer-open=""
          data-lenis-prevent
          data-sheet={sheet}
          style={sheet ? undefined : { top: pos?.top ?? 0, left: pos?.left ?? 0, visibility: pos ? 'visible' : 'hidden' }}
        >
          <p id={titleId} className="cite__title">
            {claim.title}
          </p>
          <p className="cite__meta">
            {claim.publisher} · <span className="tnum">{claim.date}</span>
          </p>
          <div className="cite__row">
            <span className="cite__k">{en.ui.cite.where}</span>
            <span className="cite__loc">{claim.locator}</span>
          </div>
          <div className="cite__row">
            <span className="cite__k">{en.ui.cite.quote}</span>
            <blockquote className="quote-text" style={{ marginTop: 0, fontSize: 17 }}>
              “{claim.quote}”
            </blockquote>
          </div>
          <a className="cite__go" href={claim.url} target="_blank" rel="noopener noreferrer">
            {en.ui.cite.open}
            <ExternalIcon />
            <span className="sr-only"> ({en.ui.cite.newTab})</span>
          </a>
        </div>
      ) : null}
    </span>
  );
}
