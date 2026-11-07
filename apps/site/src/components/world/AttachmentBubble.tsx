import type { ButtonHTMLAttributes } from 'react';
import { PdfIcon } from './icons';

interface BaseProps {
  /** File name shown in bold, for example "Timeline.pdf". */
  name: string;
  /** Optional mono line under the name. */
  meta?: string;
  className?: string;
}

type ButtonProps = BaseProps & { onClick: ButtonHTMLAttributes<HTMLButtonElement>['onClick'] } & Pick<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'aria-haspopup' | 'aria-expanded' | 'aria-controls'
  >;
type StaticProps = BaseProps & { onClick?: undefined };

/**
 * A file attachment in the thread: PDF icon plus file name.
 * With onClick it is a button (for example, to open the paged preview); without, it is a plain bubble.
 */
export function AttachmentBubble(props: ButtonProps | StaticProps) {
  const { name, meta, className = '' } = props;
  const inner = (
    <>
      <span className="attach__icon">
        <PdfIcon />
      </span>
      <span>
        <span className="attach__name">{name}</span>
        {meta ? <span className="attach__meta" style={{ display: 'block' }}>{meta}</span> : null}
      </span>
    </>
  );
  if (props.onClick) {
    const { onClick, ['aria-haspopup']: haspopup, ['aria-expanded']: expanded, ['aria-controls']: controls } = props;
    return (
      <button type="button" className={`attach ${className}`.trim()} onClick={onClick} aria-haspopup={haspopup} aria-expanded={expanded} aria-controls={controls}>
        {inner}
      </button>
    );
  }
  return <div className={`attach ${className}`.trim()}>{inner}</div>;
}
