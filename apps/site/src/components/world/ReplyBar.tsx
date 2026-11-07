import { ArrowRightIcon } from './icons';

interface ReplyBarProps {
  /** Text in the bar's input position. */
  helper: string;
  /** The call to action. */
  label: string;
  href?: string;
  id?: string;
  className?: string;
  /** Which call to action this is, for analytics when it opens the conversation sheet (hero, sticky...). */
  cta?: string;
  /** Extra attributes for the link, for example tabIndex when a hidden copy must leave the tab order. */
  linkProps?: Record<string, unknown>;
}

/**
 * The reply bar: a message field that is really the call to action.
 * The whole bar is ONE link (it moves the visitor to the intake); the send pill inside it is a styled span.
 * The accessible name is the bar's own visible text (helper, then action), so the visible words are always inside the name.
 */
export function ReplyBar({ helper, label, href = '#start', id, className = '', cta, linkProps }: ReplyBarProps) {
  return (
    <a className={`reply-bar ${className}`.trim()} id={id} href={href} data-cta={cta} {...linkProps}>
      <span className="reply-bar__helper">{helper}</span>
      <span className="send">
        {label}
        <span className="send__arrow">
          <ArrowRightIcon />
        </span>
      </span>
    </a>
  );
}
