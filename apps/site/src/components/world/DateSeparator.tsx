import type { ReactNode } from 'react';

interface DateSeparatorProps {
  id?: string;
  children: ReactNode;
  level?: 2 | 3;
}

/** A centred thread date separator that works as the section heading. */
export function DateSeparator({ id, children, level = 2 }: DateSeparatorProps) {
  const Tag = level === 2 ? 'h2' : 'h3';
  return (
    <Tag id={id} className="date-sep">
      <span>{children}</span>
    </Tag>
  );
}
