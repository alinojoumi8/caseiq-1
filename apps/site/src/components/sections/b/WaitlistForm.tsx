'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, RefObject } from 'react';
import { en } from '@/content/en';
import { siteConfig } from '@/content/site';
import { track } from '@/lib/analytics';
import { sendWaitlist } from '@/lib/siteData';
import { consentText, submitError } from '@/lib/placeholders';
import { fieldErrors, waitlistSchema, type WaitlistInput } from '@/lib/schemas';
import { Bubble } from '@/components/world/Bubble';
import { NoBreak } from '@/components/world/NoBreak';
import { EmailText } from '@/components/world/EmailText';
import { ArrowUpIcon } from '@/components/world/icons';
import { Check, ErrorSummary, FieldError, Honeypot, TextField } from './formParts';
import { postLead } from './postLead';

type Status = 'idle' | 'sending' | 'sent';
type Focus = 'summary' | 'success' | null;

function without(obj: Record<string, string>, key: string): Record<string, string> {
  if (!(key in obj)) return obj;
  const copy = { ...obj };
  delete copy[key];
  return copy;
}

interface WaitlistFormProps {
  /** The case type carried over from the intake when the visitor is outside Ontario. */
  carriedCaseType: string | null;
  /** The block heading, so the intake can move focus here. */
  headingRef: RefObject<HTMLHeadingElement | null>;
}

/** The early-access list: email, province or territory, language (optional) and the professional checkbox. Consent is unticked by default. */
export function WaitlistForm({ carriedCaseType, headingRef }: WaitlistFormProps) {
  const uid = useId();
  const w = en.waitlist;
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('');
  const [language, setLanguage] = useState('');
  const [isProfessional, setIsProfessional] = useState(false);
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');

  const openedAt = useRef<number | null>(null);
  const wantFocus = useRef<Focus>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  useEffect(() => {
    const target = wantFocus.current;
    if (!target) return;
    wantFocus.current = null;
    (target === 'summary' ? summaryRef.current : successRef.current)?.focus();
  }, [errors, status]);

  const fieldId = (key: string) => `${uid}-${key}`;
  const clear = (key: string) => setErrors((e) => without(e, key));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status !== 'idle') return;
    const payload: WaitlistInput = {
      email,
      province: province as WaitlistInput['province'],
      language: language.trim() ? language : undefined,
      isProfessional,
      consentLaunchEmails: consent as true,
      caseType: (carriedCaseType ?? undefined) as WaitlistInput['caseType'],
      company,
      openedAt: openedAt.current ?? 0,
    };
    const parsed = waitlistSchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      wantFocus.current = 'summary';
      track('intake_error', { form: 'waitlist', fields: Object.keys(errs).length });
      return;
    }
    setErrors({});
    setStatus('sending');
    // The here.now build has no server: the sign-up goes to Site Data, and the bot checks run here (see lib/siteData.ts).
    // Read as the literal expression so the bundler folds it wherever this code lands (see IntakeChat).
    const ok = process.env.NEXT_PUBLIC_HERENOW === '1' ? await sendWaitlist(parsed.data) : await postLead('/api/waitlist', payload);
    if (ok) {
      wantFocus.current = 'success';
      setStatus('sent');
      track('waitlist_submit');
    } else {
      setStatus('idle');
      wantFocus.current = 'summary';
      setErrors({ _submit: submitError(en.err) });
    }
  }

  const entries = Object.entries(errors);
  const provinceErr = errors.province;

  return (
    <div className="wl">
      <h3 className="wl__h" ref={headingRef} tabIndex={-1}>
        <NoBreak>{w.h}</NoBreak>
      </h3>
      {status === 'sent' ? (
        <div className="msg msg--rx" ref={successRef} tabIndex={-1} role="status">
          <Bubble tail>{w.success}</Bubble>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate aria-label={w.h}>
          <p className="wl__body">{w.body}</p>
          {entries.length > 0 ? (
            <ErrorSummary
              id={`${uid}-sum`}
              entries={entries}
              fieldId={fieldId}
              onFocusField={(key) => document.getElementById(fieldId(key))?.focus()}
              heading={en.ui.err.summary}
              submitMessage={<EmailText text={submitError(en.err)} email={siteConfig.contactEmail} />}
              innerRef={summaryRef}
            />
          ) : null}
          <TextField
            id={fieldId('email')}
            name="email"
            label={w.fields.email}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(v) => {
              setEmail(v);
              clear('email');
            }}
            error={errors.email}
          />
          <div className="field">
            <label htmlFor={fieldId('province')}>{w.fields.province}</label>
            <select
              id={fieldId('province')}
              name="province"
              autoComplete="address-level1"
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                clear('province');
              }}
              aria-invalid={provinceErr ? true : undefined}
              aria-describedby={provinceErr ? `${fieldId('province')}-err` : undefined}
            >
              <option value="">{en.ui.chooseOne}</option>
              {w.provinces.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            {provinceErr ? <FieldError id={`${fieldId('province')}-err`}>{provinceErr}</FieldError> : null}
          </div>
          <TextField
            id={fieldId('language')}
            name="language"
            label={w.fields.language}
            value={language}
            onChange={setLanguage}
            maxLength={40}
          />
          <Check id={fieldId('isProfessional')} name="isProfessional" checked={isProfessional} onChange={setIsProfessional}>
            {w.fields.professional}
          </Check>
          <Check
            id={fieldId('consentLaunchEmails')}
            name="consentLaunchEmails"
            checked={consent}
            onChange={(v) => {
              setConsent(v);
              clear('consentLaunchEmails');
            }}
            error={errors.consentLaunchEmails}
            required
          >
            {consentText(w.consent, en.brand.name)}
          </Check>
          <Honeypot value={company} onChange={setCompany} />
          <div className="composer composer--wl">
            <button type="submit" className="send composer__go" aria-disabled={status === 'sending'} data-busy={status === 'sending'}>
              {w.submit}
              <span className="send__arrow">
                <ArrowUpIcon />
              </span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
