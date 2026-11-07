'use client';

import { useId, useRef } from 'react';
import type { KeyboardEvent } from 'react';

export interface QuickReplyOption<T extends string = string> {
  id: T;
  label: string;
}

interface QuickRepliesProps<T extends string> {
  label: string;
  options: readonly QuickReplyOption<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}

/**
 * Quick-reply chips with radio-group semantics: one tab stop, arrow keys move and select, Home/End jump.
 * The group is named by its visible label.
 */
export function QuickReplies<T extends string>({ label, options, value, onChange, className = '' }: QuickRepliesProps<T>) {
  const labelId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function move(from: number, delta: number) {
    const next = (from + delta + options.length) % options.length;
    onChange(options[next].id);
    refs.current[next]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        move(index, 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        move(index, -1);
        break;
      case 'Home':
        e.preventDefault();
        move(0, 0);
        break;
      case 'End':
        e.preventDefault();
        move(options.length - 1, 0);
        break;
    }
  }

  return (
    <div className={`qr ${className}`.trim()} role="radiogroup" aria-labelledby={labelId}>
      <b id={labelId} className="qr__label">
        {label}
      </b>
      {options.map((opt, i) => {
        const selected = opt.id === value;
        return (
          <button
            key={opt.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className="chip"
            onClick={() => onChange(opt.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
