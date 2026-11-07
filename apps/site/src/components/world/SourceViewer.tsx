'use client';

import { useEffect, useId, useRef } from 'react';
import { en } from '@/content/en';
import type { PageKind } from '@/content/examples';
import { CloseIcon } from './icons';

export interface ViewerPage {
  kind: PageKind;
  /** Where it comes from, shown at the top of the page. */
  source: string;
  /** Verbatim quote. It is outlined on the page. */
  quote: string;
  /** For example "page 1". */
  page: string;
}

interface SourceViewerProps {
  open: boolean;
  onClose: () => void;
  page: ViewerPage;
}

/**
 * Accessible modal dialog that shows a synthetic document page with the quoted words outlined (a shape, not just a tint).
 * Built on the native <dialog>: showModal() gives a focus trap and inert background, Esc closes it, and focus returns
 * to whatever opened it. Surrounding lines are drawn as grey bars so no text is invented.
 */
export function SourceViewer({ open, onClose, page }: SourceViewerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      opener.current = document.activeElement as HTMLElement | null;
      dlg.showModal();
    } else if (!open && dlg.open) {
      dlg.close();
    }
  }, [open]);

  const quoted = (
    <p className="doc__quote">
      <mark>“{page.quote}”</mark>
    </p>
  );

  return (
    <dialog
      ref={ref}
      className="viewer"
      aria-labelledby={titleId}
      data-layer-open={open ? '' : undefined}
      data-lenis-prevent
      onClose={() => {
        onClose();
        opener.current?.focus?.();
      }}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <div className="viewer__head">
        <h2 id={titleId} className="viewer__title">
          {en.ui.exampleDocument}
        </h2>
        <button type="button" className="icon-btn" onClick={() => ref.current?.close()} aria-label={en.ui.close}>
          <CloseIcon />
        </button>
      </div>
      <div className="viewer__body">
        <div className="doc">
          <p className="doc__source">{page.source}</p>
          <SyntheticBody kind={page.kind} quoted={quoted} />
          <p className="doc__foot">{page.page}</p>
        </div>
        <div className="viewer__note">
          <span className="thread-pill">{en.example.label}</span>
        </div>
      </div>
    </dialog>
  );
}

function Bars({ widths }: { widths: number[] }) {
  return (
    <div className="doc__bars" aria-hidden="true">
      {widths.map((w, i) => (
        <i key={i} style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

function SyntheticBody({ kind, quoted }: { kind: PageKind; quoted: React.ReactNode }) {
  if (kind === 'statement') {
    return (
      <>
        <Bars widths={[44, 30]} />
        <div className="doc__rows" aria-hidden="true">
          {[0, 1, 2].map((r) => (
            <div key={r} className="doc__row">
              <i />
              <i />
            </div>
          ))}
        </div>
        {quoted}
        <div className="doc__rows" aria-hidden="true">
          {[0, 1].map((r) => (
            <div key={r} className="doc__row">
              <i />
              <i />
            </div>
          ))}
        </div>
      </>
    );
  }
  if (kind === 'receipt') {
    return (
      <>
        <Bars widths={[38, 52]} />
        {quoted}
        <Bars widths={[70, 58, 64]} />
      </>
    );
  }
  if (kind === 'text') {
    return (
      <>
        <Bars widths={[62, 48]} />
        {quoted}
        <Bars widths={[54, 70, 36]} />
      </>
    );
  }
  return (
    <>
      <Bars widths={[34, 46, 28]} />
      <Bars widths={[96, 90, 94, 62]} />
      {quoted}
      <Bars widths={[92, 97, 80]} />
    </>
  );
}
