'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { track } from '@/lib/analytics';

/** Where the intake stands, as far as the page outside the sheet needs to know. Never holds an answer. */
export interface ConversationProgress {
  /** Zero-based: 0 is question 1. */
  step: number;
  status: 'idle' | 'sending' | 'sent';
  /** The first name the visitor typed, kept only to greet them in the launcher once the request is sent. */
  name: string;
}

export interface OpenOptions {
  /** Which call to action asked: hero, nav, menu, strip, sticky, founding, final, footer or hash. Goes to analytics. */
  from?: string;
  /** Question 1's answer, chosen from the launcher. Recorded only if the visitor is still on question 1. */
  caseType?: string;
  /** Open with the early-access list expanded. */
  waitlist?: boolean;
}

/** What the parts inside the sheet hand back to the provider, so a click outside it can steer them. */
export interface SheetHandlers {
  /** Intake: record the answer to question 1 and move to question 2. Returns true if it did. */
  start?: (caseType: string) => boolean;
  /** Intake: focus the current question's legend, or the success message once sent. */
  focusCurrent?: () => void;
  /** Early-access list: expand it and focus its heading. */
  showWaitlist?: () => void;
}

interface ConversationValue {
  progress: ConversationProgress;
  open: (opts?: OpenOptions) => void;
  close: () => void;
  report: (p: ConversationProgress) => void;
  attach: (h: SheetHandlers) => void;
  dialogRef: RefObject<HTMLDialogElement | null>;
  /** The control that had focus when the sheet opened. Read and cleared by the sheet when it closes. */
  takeOpener: () => Opener | null;
  /** The intake's step while the sheet is open, for the close event. */
  currentStep: () => number;
}

/** The control that opened the sheet, and whether it sat in the phone menu (which closes itself behind the sheet). */
export interface Opener {
  el: HTMLElement;
  inMenu: boolean;
}

const Ctx = createContext<ConversationValue | null>(null);

const FIRST: ConversationProgress = { step: 0, status: 'idle', name: '' };

/**
 * Holds the one conversation sheet's controls for the home page. Anything on the page (the launcher, the document-level
 * link handler) calls open(); the intake reports its step and status back so the launcher can show where the visitor is.
 * Everything is React state. Nothing goes to the URL, storage or analytics beyond the step number.
 */
export function ConversationProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ConversationProgress>(FIRST);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const handlers = useRef<SheetHandlers>({});
  const opener = useRef<Opener | null>(null);
  const stepRef = useRef(0);

  const report = useCallback((p: ConversationProgress) => {
    stepRef.current = p.step;
    setProgress((prev) => (prev.step === p.step && prev.status === p.status && prev.name === p.name ? prev : p));
  }, []);

  const attach = useCallback((h: SheetHandlers) => {
    handlers.current = { ...handlers.current, ...h };
  }, []);

  const open = useCallback((opts: OpenOptions = {}) => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const active = document.activeElement;
    opener.current =
      active instanceof HTMLElement && active !== document.body && !dlg.contains(active)
        ? { el: active, inMenu: active.closest('.nav__panel') !== null }
        : null;

    if (!dlg.open) {
      // The page's scrollbar goes away while the sheet is open. Padding the same width keeps everything behind it where it is.
      const root = document.documentElement;
      root.style.setProperty('--sbw', `${Math.max(0, window.innerWidth - root.clientWidth)}px`);
      dlg.showModal();
      // The same marker the other dialogs carry while open, so Esc closes this layer before Quick exit's double-Esc counts.
      dlg.setAttribute('data-layer-open', '');
    }

    const h = handlers.current;
    const advanced = opts.caseType ? (h.start?.(opts.caseType) ?? false) : false;
    if (opts.waitlist) h.showWaitlist?.();
    else if (!advanced) h.focusCurrent?.();
    track('convo_open', { from: opts.from ?? 'other', step: stepRef.current + 1 });
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const takeOpener = useCallback(() => {
    const el = opener.current;
    opener.current = null;
    return el;
  }, []);

  const currentStep = useCallback(() => stepRef.current, []);

  const value = useMemo<ConversationValue>(
    () => ({ progress, open, close, report, attach, dialogRef, takeOpener, currentStep }),
    [progress, open, close, report, attach, takeOpener, currentStep],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** The conversation sheet's controls, or null on a page that has no sheet (the film's text page). */
export function useOptionalConversation(): ConversationValue | null {
  return useContext(Ctx);
}

export function useConversation(): ConversationValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useConversation must be used inside ConversationProvider');
  return v;
}
