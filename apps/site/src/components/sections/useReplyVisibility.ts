'use client';

import { useEffect, useState } from 'react';

const FIELD = 'input, textarea, select, [contenteditable="true"]';

/**
 * Should a sticky "Get my case in order" call to action be showing?
 * Yes unless the hero's own reply bar is FULLY in view (so a whole, tappable button is always on screen; a bar showing only its top edge does not count),
 * unless the intake or the footer (anything marked data-reply-bar-hide) is on screen, or a form field has focus.
 */
export function useReplyVisibility(targetId: string): boolean {
  const [pastHero, setPastHero] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(targetId);
    if (!hero) return;
    const heroObs = new IntersectionObserver(
      ([entry]) => {
        setPastHero(entry.intersectionRatio < 1);
      },
      { threshold: [0, 1] },
    );
    heroObs.observe(hero);

    const hideTargets = Array.from(document.querySelectorAll('[data-reply-bar-hide]'));
    const visible = new Set<Element>();
    const hideObs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setBlocked(visible.size > 0);
    });
    hideTargets.forEach((el) => hideObs.observe(el));

    const onIn = (e: FocusEvent) => setTyping((e.target as Element | null)?.matches?.(FIELD) ?? false);
    const onOut = () => setTyping(false);
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      heroObs.disconnect();
      hideObs.disconnect();
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, [targetId]);

  return pastHero && !blocked && !typing;
}
