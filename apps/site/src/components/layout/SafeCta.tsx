'use client';

import { en } from '@/content/en';
import { ArrowRightIcon } from '@/components/world/icons';
import { useReplyVisibility } from '@/components/sections/useReplyVisibility';

/**
 * Tablet and desktop: once the hero's reply bar has scrolled away, a compact "Get my case in order" joins the sticky
 * top strip, beside Quick exit. Hidden (and out of the tab order) while the hero, the intake or the footer is on screen.
 */
export function SafeCta({ targetId }: { targetId: string }) {
  const visible = useReplyVisibility(targetId);
  return (
    <a className="safe__cta" href="#start" data-cta="strip" data-visible={visible} aria-hidden={visible ? undefined : true} tabIndex={visible ? undefined : -1}>
      {en.hero.cta}
      <ArrowRightIcon size={14} />
    </a>
  );
}
