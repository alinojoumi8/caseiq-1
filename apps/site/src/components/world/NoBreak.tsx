import { Fragment } from 'react';

/** "early-access" is one term: it must never wrap at its hyphen. A nowrap span (not a U+2011 hyphen, which Bricolage may not draw). */
const TERM = /(early-access)/g;

export function NoBreak({ children }: { children: string }) {
  return (
    <>
      {children.split(TERM).map((part, i) =>
        part === 'early-access' ? (
          <span className="nowrap" key={i}>
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
