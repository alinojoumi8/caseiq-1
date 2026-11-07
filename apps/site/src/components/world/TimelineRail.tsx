import type { ReactNode } from 'react';

export type NodeKind = 'solid' | 'dashed' | 'gap';

/** The dot on the rail. Solid = a page backs it. Dashed = check the original. Gap = not in your papers yet. */
export function RailNode({ kind = 'solid', className = '' }: { kind?: NodeKind; className?: string }) {
  const k = kind === 'solid' ? '' : kind === 'dashed' ? 'node--dashed' : 'node--gap';
  return <span aria-hidden="true" className={`node ${k} ${className}`.trim()} />;
}

/** Two-line mono label beside a node, for example "12 Jan" over "page 1". */
export function RailLabel({ title, sub }: { title: string; sub: string }) {
  return (
    <span className="rail-label">
      <b>{title}</b>
      <span>{sub}</span>
    </span>
  );
}

/** A vertical timeline. Server-renders the finished state; Phase 2 may animate rows in. */
export function TimelineRail({ children, label, className = '' }: { children: ReactNode; label?: string; className?: string }) {
  return (
    <ol className={`tl ${className}`.trim()} aria-label={label}>
      {children}
    </ol>
  );
}

interface TimelineItemProps {
  node?: NodeKind;
  /** Mono date on the left, for example "12 Jan 2025". */
  date: string;
  /** ISO date for the <time> element, when the item has one. */
  iso?: string;
  children: ReactNode;
  className?: string;
}

export function TimelineItem({ node = 'solid', date, iso, children, className = '' }: TimelineItemProps) {
  return (
    <li className={`tl-item ${className}`.trim()} data-node={node}>
      <div className="tl-date rail-label">
        {iso ? (
          <time dateTime={iso}>
            <b>{date}</b>
          </time>
        ) : (
          <b>{date}</b>
        )}
      </div>
      <div className="tl-node">
        <RailNode kind={node} />
      </div>
      <div className="tl-body">{children}</div>
    </li>
  );
}
