import type { ElementType, HTMLAttributes } from 'react';

export type BubbleVariant = 'received' | 'sent' | 'yours' | 'gap';

interface BubbleProps extends HTMLAttributes<HTMLElement> {
  variant?: BubbleVariant;
  /** Draws the speech tail. Tails are built with ::before/::after; set --tail-ground if the bubble sits on a non-ground surface. */
  tail?: boolean;
  as?: ElementType;
}

/**
 * A chat bubble.
 *  - received: grey, tail on the left
 *  - sent: blue, tail on the right (text is always large and bold so white-on-blue keeps its contrast)
 *  - yours: white, violet italic. The person's own words.
 *  - gap: dashed outline, no fill. Something the papers do not show.
 */
export function Bubble({ variant = 'received', tail = false, as: Tag = 'div', className = '', ...rest }: BubbleProps) {
  const classes = ['bubble', variant !== 'received' ? `bubble--${variant}` : '', tail ? 'bubble--tail' : '', className]
    .filter(Boolean)
    .join(' ');
  return <Tag className={classes} {...rest} />;
}
