import type { HTMLAttributes } from 'react';

interface PageTagProps extends HTMLAttributes<HTMLSpanElement> {
  /** pill: white tag that can sit on a bubble. plain: bare mono text. */
  variant?: 'plain' | 'pill';
  muted?: boolean;
}

/** A page reference in JetBrains Mono. Not pressable, so it is ink, never the action colour. */
export function PageTag({ variant = 'plain', muted = false, className = '', ...rest }: PageTagProps) {
  const classes = ['page-tag', variant === 'pill' ? 'page-tag--pill' : '', muted ? 'page-tag--muted' : '', className]
    .filter(Boolean)
    .join(' ');
  return <span className={classes} {...rest} />;
}
