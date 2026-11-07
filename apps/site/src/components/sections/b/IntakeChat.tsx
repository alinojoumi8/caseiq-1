'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, ReactNode, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { en } from '@/content/en';
import { siteConfig } from '@/content/site';
import { useCaseType } from '@/components/CaseTypeContext';
import { useConversation } from '@/components/ConversationContext';
import { track } from '@/lib/analytics';
import { IS_HERENOW } from '@/lib/buildMode';
import { sendRequest } from '@/lib/siteData';
import { consentText, nextBusinessDay, submitError, successBody } from '@/lib/placeholders';
import {
  caseTypeField,
  dateWindowField,
  fieldErrors,
  hasLawyerField,
  intakeSchema,
  locationField,
  paperAmountField,
  type IntakeInput,
} from '@/lib/schemas';
import { Bubble } from '@/components/world/Bubble';
import { EmailText } from '@/components/world/EmailText';
import { ArrowUpIcon, ChevronIcon } from '@/components/world/icons';
import { Check, ChipRadios, ErrorSummary, FieldError, Honeypot, RadioGroup, TextField } from './formParts';
import { postLead } from './postLead';
import { motionBehavior, revealStep } from './revealStep';
import { NoBreak } from '@/components/world/NoBreak';

type ChoiceKey = 'caseType' | 'location' | 'dateWindow' | 'hasLawyer' | 'paperAmount';
const CHOICE_KEYS: readonly ChoiceKey[] = ['caseType', 'location', 'dateWindow', 'hasLawyer', 'paperAmount'];
const CHOICE_SCHEMAS = {
  caseType: caseTypeField,
  location: locationField,
  dateWindow: dateWindowField,
  hasLawyer: hasLawyerField,
  paperAmount: paperAmountField,
} as const;

// An answer that shows a note stays on its step until the visitor moves on, so the note can be read and its link used.
const HOLDS_STEP: Partial<Record<ChoiceKey, readonly string[]>> = {
  location: ['elsewhere'],
  dateWindow: ['within2w'],
  hasLawyer: ['yes', 'before'],
};
/** After a tap or a click the chosen answer shows for this long, then the next question arrives. */
const ADVANCE_MS = 320;

interface ChoiceStep {
  id: ChoiceKey;
  question: string;
  helper?: string;
  options: readonly { value: string; label: string }[];
}
const choiceSteps = en.intake.steps.slice(0, 5) as unknown as readonly ChoiceStep[];
const contactStep = en.intake.steps[5];
const [PRIVACY_BEFORE, PRIVACY_AFTER] = contactStep.consentPrivacy.split('privacy notice');
const LAST = 5;

type Status = 'idle' | 'sending' | 'sent';
type Focus = 'legend' | 'summary' | 'success' | null;
type Method = 'email' | 'call' | 'text';

interface Contact {
  firstName: string;
  email: string;
  phone: string;
  method: Method;
  voicemail: 'yes' | 'no';
  consentPrivacy: boolean;
  consentUpdates: boolean;
  company: string;
}

// Safe defaults: reach me by email, and no voicemail. Nothing is ticked for consent.
const emptyContact: Contact = {
  firstName: '',
  email: '',
  phone: '',
  method: 'email',
  voicemail: 'no',
  consentPrivacy: false,
  consentUpdates: false,
  company: '',
};

function without<T extends Record<string, string>>(obj: T, key: string): T {
  if (!(key in obj)) return obj;
  const copy: Record<string, string> = { ...obj };
  delete copy[key];
  return copy as T;
}

interface IntakeChatProps {
  /** Where the composer is drawn: the dock at the bottom of the sheet, outside this form. Null until the dock has mounted. */
  dockEl: HTMLElement | null;
  /** Called when the visitor is outside Ontario and chooses the early-access list. The case type travels with them. */
  onJoinWaitlist: (caseType: string | null) => void;
}

/**
 * The intake. It looks like a thread: our question arrives as a received bubble, the options are quick-reply chips,
 * and the answer is echoed as a sent bubble. Underneath it is a real form: one fieldset and legend per step, radio inputs,
 * labelled fields on the last step, an error summary, and focus moved to each new question.
 * A tap or click on a chip moves to the next question. The keyboard never does: arrow keys only change the choice,
 * and Enter or Next moves on.
 */
export function IntakeChat({ onJoinWaitlist, dockEl }: IntakeChatProps) {
  const uid = useId();
  const formId = `${uid}-form`;
  const { picked } = useCaseType();
  const { report, attach } = useConversation();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<ChoiceKey, string>>>({});
  const [contact, setContact] = useState<Contact>(emptyContact);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [sentInfo, setSentInfo] = useState({ name: '', method: '', day: '' });

  const openedAt = useRef<number | null>(null);
  const started = useRef(false);
  const wantFocus = useRef<Focus>(null);
  const viaPointer = useRef(false);
  const advanceTimer = useRef<number | null>(null);
  const legendRef = useRef<HTMLLegendElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    openedAt.current = Date.now();
    return () => {
      if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  // Moves focus once the state change that asked for it has rendered.
  useEffect(() => {
    const target = wantFocus.current;
    if (!target) return;
    wantFocus.current = null;
    if (target === 'legend') {
      // The question takes focus without scrolling; the step is then brought above the composer (smooth unless motion is reduced).
      legendRef.current?.focus({ preventScroll: true });
      revealStep(legendRef.current, motionBehavior());
      return;
    }
    (target === 'summary' ? summaryRef.current : successRef.current)?.focus();
  }, [step, errors, status]);

  // The closing section's launcher shows where the visitor is, so the step and status are reported out (never an answer).
  useEffect(() => {
    report({ step, status, name: sentInfo.name });
  }, [report, step, status, sentInfo.name]);

  // The hero chip pre-fills step 1 until the visitor picks something themselves.
  const valueOf = (k: ChoiceKey): string | undefined => answers[k] ?? (k === 'caseType' ? (picked ?? undefined) : undefined);
  const labelOf = (k: ChoiceKey, v: string | undefined) =>
    choiceSteps[CHOICE_KEYS.indexOf(k)].options.find((o) => o.value === v)?.label;

  // An answer that shows a note: the step (note included) is brought above the composer, so the note is read before the visitor moves on.
  const noteShown =
    (step === 1 && valueOf('location') === 'elsewhere') ||
    (step === 2 && valueOf('dateWindow') === 'within2w') ||
    (step === 3 && (valueOf('hasLawyer') === 'yes' || valueOf('hasLawyer') === 'before'));
  useEffect(() => {
    if (!noteShown) return;
    revealStep(legendRef.current, motionBehavior());
  }, [noteShown, step]);

  const fieldId = (key: string): string => {
    const i = CHOICE_KEYS.indexOf(key as ChoiceKey);
    return i !== -1 ? `${uid}-${key}-${choiceSteps[i].options[0].value}` : `${uid}-${key}`;
  };

  function cancelAdvance() {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }

  function markStarted() {
    if (started.current) return;
    started.current = true;
    track('intake_start');
  }

  function choose(key: ChoiceKey, value: string) {
    markStarted();
    setAnswers((a) => ({ ...a, [key]: value }));
    setErrors((e) => without(e, key));
  }

  /** A click on a chip. Only a pointer (mouse or touch) moves on by itself, and not when the answer shows a note. */
  function pickAnswer(key: ChoiceKey, value: string) {
    cancelAdvance();
    if (!viaPointer.current || status !== 'idle') return;
    if (HOLDS_STEP[key]?.includes(value)) return;
    const at = CHOICE_KEYS.indexOf(key);
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null;
      goTo(at + 1, key === 'caseType' ? value : undefined);
    }, ADVANCE_MS);
  }

  function setField<K extends keyof Contact>(key: K, value: Contact[K]) {
    markStarted();
    setContact((c) => ({ ...c, [key]: value }));
    setErrors((e) => without(e, key));
  }

  function fail(errs: Record<string, string>) {
    setErrors(errs);
    wantFocus.current = 'summary';
    track('intake_error', { step: step + 1, fields: Object.keys(errs).length });
  }

  /** Moves to a later step. The pre-filled case type becomes a real answer once the visitor moves on. */
  function goTo(nextStep: number, caseType?: string) {
    const prefilled = caseType ?? picked ?? undefined;
    if (nextStep === 1 && prefilled) setAnswers((a) => ({ ...a, caseType: a.caseType ?? prefilled }));
    setErrors({});
    wantFocus.current = 'legend';
    track('intake_step', { step: nextStep + 1 });
    setStep(nextStep);
  }

  /** A chip tapped in the closing section's launcher: answer question 1 and move to question 2, as a tap on the chip here would. */
  function startWith(caseType: string): boolean {
    if (step !== 0 || status !== 'idle') return false;
    cancelAdvance();
    choose('caseType', caseType);
    goTo(1, caseType);
    return true;
  }

  /** The sheet has just opened: focus goes to the current question, or to the confirmation once the request is sent. */
  function focusCurrent() {
    if (status === 'sent') {
      successRef.current?.focus();
      return;
    }
    legendRef.current?.focus({ preventScroll: true });
    revealStep(legendRef.current, 'auto');
  }

  // Handed to the provider after every render, so the sheet's opener always reaches the current step.
  useEffect(() => {
    attach({ start: startWith, focusCurrent });
  });

  function next() {
    cancelAdvance();
    const key = CHOICE_KEYS[step];
    if (step === 1 && valueOf('location') === 'elsewhere') {
      onJoinWaitlist(valueOf('caseType') ?? null);
      return;
    }
    if (!CHOICE_SCHEMAS[key].safeParse(valueOf(key)).success) {
      fail({ [key]: en.ui.err.choose });
      return;
    }
    goTo(step + 1);
  }

  function back() {
    if (step === 0) return;
    cancelAdvance();
    setErrors({});
    wantFocus.current = 'legend';
    setStep(step - 1);
  }

  async function submit() {
    if (status !== 'idle') return;
    const payload: IntakeInput = {
      caseType: valueOf('caseType') as IntakeInput['caseType'],
      location: valueOf('location') as IntakeInput['location'],
      dateWindow: valueOf('dateWindow') as IntakeInput['dateWindow'],
      hasLawyer: valueOf('hasLawyer') as IntakeInput['hasLawyer'],
      paperAmount: valueOf('paperAmount') as IntakeInput['paperAmount'],
      firstName: contact.firstName,
      email: contact.email,
      phone: contact.phone.trim() ? contact.phone : undefined,
      contactMethod: contact.method,
      voicemail: contact.method === 'call' ? contact.voicemail : 'no',
      consentPrivacy: contact.consentPrivacy as true,
      consentUpdates: contact.consentUpdates,
      company: contact.company,
      openedAt: openedAt.current ?? 0,
    };
    const parsed = intakeSchema.safeParse(payload);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      const earlier = CHOICE_KEYS.findIndex((k) => errs[k]);
      if (earlier !== -1) setStep(earlier);
      fail(errs);
      return;
    }
    setErrors({});
    setStatus('sending');
    // The here.now build has no server: the request goes to Site Data, and the bot checks run here (see lib/siteData.ts).
    // The flag is read as the literal expression here (not through IS_HERENOW) so the bundler folds it wherever this code lands: the here.now export must not carry the /api/ path, and it fails its own check if it does.
    const ok = process.env.NEXT_PUBLIC_HERENOW === '1' ? await sendRequest(parsed.data) : await postLead('/api/intake', payload);
    if (ok) {
      setSentInfo({
        name: contact.firstName.trim(),
        method: en.success.methods[contact.method],
        day: nextBusinessDay(new Date()),
      });
      wantFocus.current = 'success';
      setStatus('sent');
      track('intake_submit');
    } else {
      setStatus('idle');
      track('intake_error', { step: LAST + 1, kind: 'submit' });
      wantFocus.current = 'summary';
      setErrors({ _submit: submitError(en.err) });
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step < LAST) next();
    else void submit();
  }

  const progressId = `${uid}-progress`;
  const helperId = `${uid}-helper`;
  const errorEntries = Object.entries(errors);
  const sent = status === 'sent';
  const elsewhere = step === 1 && valueOf('location') === 'elsewhere';
  const progress = en.intake.progress.replace('{n}', String(step + 1));
  const current = step < LAST ? choiceSteps[step] : null;
  // Next looks quieter until the current question has an answer (it stays focusable; pressing it says what is missing).
  const answered = step < LAST ? Boolean(valueOf(CHOICE_KEYS[step])) : true;
  const needsPhone = contact.method !== 'email';
  const phoneLabel = needsPhone ? contactStep.fields.phone.replace(/\s*\(optional\)/i, '') : contactStep.fields.phone;

  return (
    <form
      id={formId}
      className="chat"
      onSubmit={onSubmit}
      noValidate
      onPointerDownCapture={() => {
        viaPointer.current = true;
      }}
      onKeyDownCapture={() => {
        viaPointer.current = false;
      }}
    >
      <div className="msg msg--rx">
        <Bubble tail>{en.intake.intro}</Bubble>
      </div>

      {/* Steps already answered: our question, then the visitor's answer. */}
      {choiceSteps.slice(0, sent ? LAST : step).map((s) => (
        <div className="chat__done" key={s.id}>
          <div className="msg msg--rx">
            <Bubble tail>{s.question}</Bubble>
          </div>
          <div className="msg msg--sent">
            <Bubble variant="sent" tail>
              {labelOf(s.id, valueOf(s.id))}
            </Bubble>
          </div>
        </div>
      ))}

      {sent ? (
        <div className="msg msg--rx" ref={successRef} tabIndex={-1} role="status">
          <Bubble tail className="chat__success">
            <h3 className="chat__success-title">{en.success.title.replace('{firstName}', sentInfo.name)}</h3>
            <p>
              <EmailText text={successBody(en.success.body, sentInfo.method, sentInfo.day)} email={siteConfig.contactEmail} />
            </p>
            <p>{en.success.tip}</p>
          </Bubble>
        </div>
      ) : (
        <>
          <p className="thread-pill chat__progress" id={progressId}>
            {progress}
          </p>

          {errorEntries.length > 0 ? (
            <ErrorSummary
              id={`${uid}-sum`}
              entries={errorEntries}
              fieldId={fieldId}
              onFocusField={(key) => document.getElementById(fieldId(key))?.focus()}
              heading={en.ui.err.summary}
              submitMessage={<EmailText text={submitError(en.err)} email={siteConfig.contactEmail} />}
              innerRef={summaryRef}
            />
          ) : null}

          {current ? (
            <ChoiceFieldset
              key={current.id}
              uid={uid}
              step={current}
              value={valueOf(current.id)}
              error={errors[current.id]}
              onChoose={(v) => choose(current.id, v)}
              onPick={(v) => pickAnswer(current.id, v)}
              legendRef={legendRef}
              describedBy={`${progressId}${current.helper ? ` ${helperId}` : ''}`}
              helperId={helperId}
            >
              <div className="notes" aria-live="polite">
                {step === 1 && valueOf('location') === 'elsewhere' ? (
                  <div className="msg msg--rx">
                    <Bubble>
                      <NoBreak>{en.intake.steps[1].elsewhere.note}</NoBreak>
                    </Bubble>
                  </div>
                ) : null}
                {step === 2 && valueOf('dateWindow') === 'within2w' ? (
                  <div className="msg msg--rx">
                    <Bubble>
                      {en.intake.steps[2].soon.note}{' '}
                      <a className="link" href="#limits">
                        {en.intake.steps[2].soon.action}
                      </a>
                    </Bubble>
                  </div>
                ) : null}
                {step === 3 && (valueOf('hasLawyer') === 'yes' || valueOf('hasLawyer') === 'before') ? (
                  <div className="msg msg--rx">
                    <Bubble>{en.intake.steps[3].withLawyer}</Bubble>
                  </div>
                ) : null}
              </div>
            </ChoiceFieldset>
          ) : (
            <fieldset className="step" aria-describedby={progressId}>
              <legend className="step__legend" ref={legendRef} tabIndex={-1}>
                <Bubble as="span" tail>
                  {contactStep.question}
                </Bubble>
              </legend>
              <div className="sheet">
                <TextField
                  id={fieldId('firstName')}
                  name="firstName"
                  label={contactStep.fields.firstName}
                  value={contact.firstName}
                  onChange={(v) => setField('firstName', v)}
                  error={errors.firstName}
                  autoComplete="given-name"
                  maxLength={60}
                />
                <TextField
                  id={fieldId('email')}
                  name="email"
                  label={contactStep.fields.email}
                  type="email"
                  inputMode="email"
                  value={contact.email}
                  onChange={(v) => setField('email', v)}
                  error={errors.email}
                  autoComplete="email"
                />
                <RadioGroup
                  idPrefix={`${uid}-contactMethod`}
                  name="contactMethod"
                  legend={contactStep.method.legend}
                  options={contactStep.method.options}
                  value={contact.method}
                  onChange={(v) => {
                    setField('method', v as Method);
                    setErrors((e) => without(e, 'phone'));
                  }}
                />
                <TextField
                  id={fieldId('phone')}
                  name="phone"
                  label={phoneLabel}
                  type="tel"
                  inputMode="tel"
                  value={contact.phone}
                  onChange={(v) => setField('phone', v)}
                  error={errors.phone}
                  autoComplete="tel"
                  required={needsPhone}
                />
                {contact.method === 'call' ? (
                  <RadioGroup
                    idPrefix={`${uid}-voicemail`}
                    name="voicemail"
                    legend={contactStep.voicemail.legend}
                    options={contactStep.voicemail.options}
                    value={contact.voicemail}
                    onChange={(v) => setField('voicemail', v as Contact['voicemail'])}
                  />
                ) : null}
                <p className="sheet__note">{contactStep.note}</p>
                <Check
                  id={fieldId('consentPrivacy')}
                  name="consentPrivacy"
                  checked={contact.consentPrivacy}
                  onChange={(v) => setField('consentPrivacy', v)}
                  error={errors.consentPrivacy}
                  required
                >
                  {PRIVACY_BEFORE}
                  <a className="link" href={IS_HERENOW ? '/privacy/' : '/privacy'} target="_blank" rel="noopener noreferrer">
                    privacy notice
                    <span className="sr-only"> ({en.ui.external})</span>
                  </a>
                  {PRIVACY_AFTER}
                </Check>
                <Check
                  id={fieldId('consentUpdates')}
                  name="consentUpdates"
                  checked={contact.consentUpdates}
                  onChange={(v) => setField('consentUpdates', v)}
                >
                  {consentText(contactStep.consentUpdates, en.brand.name)}
                </Check>
                <p className="sheet__small">{contactStep.small}</p>
                <Honeypot value={contact.company} onChange={(v) => setField('company', v)} />
              </div>
            </fieldset>
          )}

          {/* The composer is the sheet's input bar: it is drawn in the dock at the bottom of the thread (outside this form, so the early-access list can sit above it), and its send button submits this form. */}
          {dockEl
            ? createPortal(
                <div className="composer">
                  {step > 0 ? (
                    <button type="button" className="btn-outline composer__back" aria-label={en.intake.back} onClick={back}>
                      <span className="composer__back-icon" aria-hidden="true">
                        <ChevronIcon dir="left" size={20} />
                      </span>
                      <span className="composer__back-text">{en.intake.back}</span>
                    </button>
                  ) : null}
                  {elsewhere ? (
                    <button type="button" className="send composer__go" onClick={() => onJoinWaitlist(valueOf('caseType') ?? null)}>
                      <span className="composer__label">
                        <NoBreak>{en.intake.steps[1].elsewhere.action}</NoBreak>
                      </span>
                      <span className="send__arrow">
                        <ChevronIcon dir="right" size={20} />
                      </span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      form={formId}
                      className={`send composer__go${step === LAST ? ' composer__go--long' : ''}`}
                      aria-disabled={status === 'sending' || (!answered && step < LAST) ? true : undefined}
                      data-busy={status === 'sending'}
                      data-quiet={!answered && step < LAST ? 'true' : undefined}
                    >
                      <span className="composer__label">{step === LAST ? contactStep.submit : en.intake.next}</span>
                      <span className="send__arrow">{step === LAST ? <ArrowUpIcon /> : <ChevronIcon dir="right" size={20} />}</span>
                    </button>
                  )}
                </div>,
                dockEl,
              )
            : null}
        </>
      )}
    </form>
  );
}

function ChoiceFieldset({
  uid,
  step,
  value,
  error,
  onChoose,
  onPick,
  legendRef,
  describedBy,
  helperId,
  children,
}: {
  uid: string;
  step: ChoiceStep;
  value: string | undefined;
  error?: string;
  onChoose: (v: string) => void;
  onPick: (v: string) => void;
  legendRef: RefObject<HTMLLegendElement | null>;
  describedBy: string;
  helperId: string;
  children?: ReactNode;
}) {
  const label = step.options.find((o) => o.value === value)?.label;
  const errId = `${uid}-${step.id}-err`;
  return (
    <fieldset className="step" aria-describedby={`${describedBy}${error ? ` ${errId}` : ''}`}>
      <legend className="step__legend" ref={legendRef} tabIndex={-1}>
        <Bubble as="span" tail={!step.helper}>
          {step.question}
        </Bubble>
      </legend>
      {step.helper ? (
        <p className="msg msg--rx" id={helperId}>
          <Bubble as="span" tail>
            {step.helper}
          </Bubble>
        </p>
      ) : null}
      <ChipRadios
        idPrefix={`${uid}-${step.id}`}
        name={step.id}
        options={step.options}
        value={value}
        onChange={onChoose}
        onPick={onPick}
        invalid={Boolean(error)}
      />
      {error ? <FieldError id={errId}>{error}</FieldError> : null}
      {label ? (
        <div className="msg msg--sent">
          <Bubble variant="sent" tail>
            {label}
          </Bubble>
        </div>
      ) : null}
      {children}
    </fieldset>
  );
}
