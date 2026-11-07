import type { ReactNode } from 'react';

interface QuoteCardProps {
  /** Where it comes from, set in mono above the quote. */
  reference?: ReactNode;
  /** Verbatim document text. Quotation marks are added here. */
  quote: string;
  /** Footer slot, for example a "See the page" button. */
  children?: ReactNode;
  className?: string;
}

/** A white screenshot card holding verbatim text: Source Serif quote, quotation marks, slate surface, 3px rule. */
export function QuoteCard({ reference, quote, children, className = '' }: QuoteCardProps) {
  return (
    <figure className={`quote-card ${className}`.trim()}>
      {reference ? <figcaption className="quote-card__ref">{reference}</figcaption> : null}
      <blockquote className="quote-text">
        “{quote}”
      </blockquote>
      {children}
    </figure>
  );
}
