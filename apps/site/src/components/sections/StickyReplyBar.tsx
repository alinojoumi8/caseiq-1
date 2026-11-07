'use client';

import { en } from '@/content/en';
import { ArrowRightIcon } from '@/components/world/icons';
import { useReplyVisibility } from './useReplyVisibility';

/**
 * Phone only: whenever the hero's own reply bar is out of view, one compact row (about 56px) sticks to the bottom:
 * the action, and the first reassurance underneath it. It hides while the intake or the footer is on screen and while
 * a form field has focus, so it never covers an input. When hidden it leaves the tab order.
 */
export function StickyReplyBar({ targetId }: { targetId: string }) {
  const visible = useReplyVisibility(targetId);

  return (
    <div className="sticky-reply" data-visible={visible} aria-hidden={visible ? undefined : true}>
      <a className="sticky-reply__link" href="#start" data-cta="sticky" tabIndex={visible ? undefined : -1}>
        <span className="sticky-reply__text">
          <b>{en.hero.cta}</b>
          <small>{en.hero.reassure[0]}</small>
        </span>
        <span className="send__arrow">
          <ArrowRightIcon />
        </span>
      </a>
    </div>
  );
}
