'use client';

import type { ReactNode, Ref } from 'react';
import { AlertIcon, CheckIcon } from './icons';

/** The same message, as an inline error under a field. Icon and text, never colour alone. */
export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p className="field-err" id={id}>
      <AlertIcon />
      {children}
    </p>
  );
}

export function TextField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  type = 'text',
  inputMode,
  autoComplete,
  maxLength,
  required,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  inputMode?: 'email' | 'tel' | 'text';
  autoComplete?: string;
  maxLength?: number;
  required?: boolean;
}) {
  const errId = `${id}-err`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-required={required ? true : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
      />
      {error ? <FieldError id={errId}>{error}</FieldError> : null}
    </div>
  );
}

export function Check({
  id,
  name,
  checked,
  onChange,
  error,
  required,
  children,
}: {
  id: string;
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const errId = `${id}-err`;
  return (
    <div className="check">
      <div className="check__row">
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-required={required ? true : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
        />
        <label htmlFor={id}>{children}</label>
      </div>
      {error ? <FieldError id={errId}>{error}</FieldError> : null}
    </div>
  );
}

/** Quick-reply chips that are really radio inputs: native arrow keys, one tab stop, a check mark when chosen. */
export function ChipRadios({
  idPrefix,
  name,
  options,
  value,
  onChange,
  onPick,
  invalid,
}: {
  idPrefix: string;
  name: string;
  options: readonly { value: string; label: string }[];
  value: string | undefined;
  onChange: (v: string) => void;
  /** Runs on every click of a chip, even one that is already chosen. The caller decides whether it came from a pointer. */
  onPick?: (v: string) => void;
  invalid?: boolean;
}) {
  return (
    <div className="opts">
      {options.map((o) => (
        <span className="opt" key={o.value}>
          <input
            type="radio"
            id={`${idPrefix}-${o.value}`}
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            onClick={() => onPick?.(o.value)}
            data-invalid={invalid ? true : undefined}
          />
          <label className="chip" htmlFor={`${idPrefix}-${o.value}`}>
            <CheckIcon className="chip__check" />
            {o.label}
          </label>
        </span>
      ))}
    </div>
  );
}

/** A group of chips with its own legend, for the small choices inside a step. */
export function RadioGroup({
  idPrefix,
  name,
  legend,
  options,
  value,
  onChange,
}: {
  idPrefix: string;
  name: string;
  legend: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="sub">
      <legend>{legend}</legend>
      <ChipRadios idPrefix={idPrefix} name={name} options={options} value={value} onChange={onChange} />
    </fieldset>
  );
}

/** A field a person never sees or reaches. If it has a value, a program filled it in. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="hp" aria-hidden="true">
      <input type="text" name="company" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/** The error summary: a heading, then one link per problem that moves focus to the field. */
export function ErrorSummary({
  id,
  entries,
  fieldId,
  onFocusField,
  heading,
  submitMessage,
  innerRef,
}: {
  id: string;
  entries: readonly (readonly [string, string])[];
  fieldId: (key: string) => string;
  onFocusField: (key: string) => void;
  heading: string;
  /** The send-failed message. A node, so the contact email in it can be a link. */
  submitMessage: ReactNode;
  innerRef: Ref<HTMLDivElement>;
}) {
  const fields = entries.filter(([k]) => k !== '_submit');
  const submitFailed = entries.some(([k]) => k === '_submit');
  return (
    <div className="err-sum" ref={innerRef} tabIndex={-1} role="group" aria-labelledby={id}>
      <p id={id} className="err-sum__title">
        <AlertIcon />
        <span>{fields.length > 0 ? heading : submitMessage}</span>
      </p>
      {fields.length > 0 ? (
        <ul>
          {fields.map(([key, msg]) => (
            <li key={key}>
              <a
                href={`#${fieldId(key)}`}
                onClick={(e) => {
                  e.preventDefault();
                  onFocusField(key);
                }}
              >
                {msg}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      {fields.length > 0 && submitFailed ? <p className="err-sum__submit">{submitMessage}</p> : null}
    </div>
  );
}
