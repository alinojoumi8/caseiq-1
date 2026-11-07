import { describe, expect, it } from 'vitest';
import { en } from '../src/content/en';
import {
  CASE_TYPES,
  CONSENT_VERSION,
  CONTACT_METHODS,
  DATE_WINDOWS,
  LAWYER_STATES,
  LOCATIONS,
  MIN_FILL_MS,
  PAPER_AMOUNTS,
  PROVINCES,
  VOICEMAIL,
  fieldErrors,
  intakeSchema,
  isLooseNanp,
  looksAutomated,
  waitlistSchema,
} from '../src/lib/schemas';

const intake = {
  caseType: 'housing',
  location: 'ontario',
  dateWindow: 'within3m',
  hasLawyer: 'no',
  paperAmount: 'folder',
  firstName: 'Sam',
  email: 'sam@example.com',
  phone: '',
  contactMethod: 'email',
  voicemail: 'no',
  consentPrivacy: true,
  consentUpdates: false,
  company: '',
  openedAt: 1_000,
};

const waitlist = {
  email: 'sam@example.com',
  province: 'BC',
  language: '',
  isProfessional: false,
  consentLaunchEmails: true,
  company: '',
  openedAt: 1_000,
};

/** The message for one field, or undefined when the parse succeeded. */
function errorFor(result: ReturnType<typeof intakeSchema.safeParse>, field: string): string | undefined {
  return result.success ? undefined : fieldErrors(result.error)[field];
}

describe('intake schema', () => {
  it('accepts a complete request', () => {
    expect(intakeSchema.safeParse(intake).success).toBe(true);
  });

  it('keeps the enums in step with the options in en.ts', () => {
    const values = (i: number) => (en.intake.steps[i] as { options: readonly { value: string }[] }).options.map((o) => o.value);
    expect(values(0)).toEqual([...CASE_TYPES]);
    expect(values(1)).toEqual([...LOCATIONS]);
    expect(values(2)).toEqual([...DATE_WINDOWS]);
    expect(values(3)).toEqual([...LAWYER_STATES]);
    expect(values(4)).toEqual([...PAPER_AMOUNTS]);
    const contact = en.intake.steps[5];
    expect(contact.method.options.map((o) => o.value)).toEqual([...CONTACT_METHODS]);
    expect(contact.voicemail.options.map((o) => o.value)).toEqual([...VOICEMAIL]);
  });

  it('requires a first name of 1 to 60 characters, with the deck message', () => {
    expect(errorFor(intakeSchema.safeParse({ ...intake, firstName: '   ' }), 'firstName')).toBe(en.err.name);
    expect(intakeSchema.safeParse({ ...intake, firstName: 'x'.repeat(61) }).success).toBe(false);
    expect(intakeSchema.safeParse({ ...intake, firstName: 'x'.repeat(60) }).success).toBe(true);
  });

  it('separates a missing email from an incomplete one', () => {
    expect(errorFor(intakeSchema.safeParse({ ...intake, email: '' }), 'email')).toBe(en.err.email);
    expect(errorFor(intakeSchema.safeParse({ ...intake, email: 'sam@' }), 'email')).toBe(en.err.emailInvalid);
  });

  it('treats the phone as optional and checks it loosely', () => {
    expect(intakeSchema.safeParse({ ...intake, phone: undefined }).success).toBe(true);
    expect(intakeSchema.safeParse({ ...intake, phone: '(416) 555-0199' }).success).toBe(true);
    expect(intakeSchema.safeParse({ ...intake, phone: '+1 416 555 0199' }).success).toBe(true);
    expect(errorFor(intakeSchema.safeParse({ ...intake, phone: '555-01' }), 'phone')).toBe(en.err.phoneInvalid);
    expect(isLooseNanp('')).toBe(true);
    expect(isLooseNanp('call me')).toBe(false);
  });

  it('needs a phone number when the method is a call or a text, and not for email', () => {
    for (const contactMethod of ['call', 'text']) {
      expect(errorFor(intakeSchema.safeParse({ ...intake, contactMethod, phone: '' }), 'phone')).toBe(en.err.phoneRequired);
      expect(errorFor(intakeSchema.safeParse({ ...intake, contactMethod, phone: undefined }), 'phone')).toBe(en.err.phoneRequired);
      expect(intakeSchema.safeParse({ ...intake, contactMethod, phone: '416 555 0199' }).success).toBe(true);
    }
    expect(intakeSchema.safeParse({ ...intake, contactMethod: 'email', phone: '' }).success).toBe(true);
  });

  it('has a voicemail answer that defaults to no and has no emailOnly option', () => {
    const { voicemail: _omit, ...rest } = intake;
    void _omit;
    const parsed = intakeSchema.safeParse(rest);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.voicemail).toBe('no');
    expect(intakeSchema.safeParse({ ...intake, voicemail: 'emailOnly' }).success).toBe(false);
    expect([...VOICEMAIL]).toEqual(['yes', 'no']);
    expect(en.intake.steps[5].voicemail.legend).toBe('Can we leave a voicemail?');
    expect(en.ask.sender).toBe('The person helping you · example');  });

  it('needs the privacy consent to be literally true', () => {
    for (const v of [false, 'true', 1, undefined]) {
      const r = intakeSchema.safeParse({ ...intake, consentPrivacy: v });
      expect(r.success).toBe(false);
      expect(errorFor(r, 'consentPrivacy')).toBe(en.err.consent);
    }
  });

  it('defaults the updates consent to false', () => {
    const rest: Record<string, unknown> = { ...intake };
    delete rest.consentUpdates;
    expect(intakeSchema.parse(rest).consentUpdates).toBe(false);
  });

  it('rejects values outside the enums', () => {
    expect(intakeSchema.safeParse({ ...intake, caseType: 'criminal' }).success).toBe(false);
    expect(intakeSchema.safeParse({ ...intake, contactMethod: 'carrier pigeon' }).success).toBe(false);
  });
});

describe('waitlist schema', () => {
  it('accepts a complete sign-up and an optional carried case type', () => {
    expect(waitlistSchema.safeParse(waitlist).success).toBe(true);
    expect(waitlistSchema.safeParse({ ...waitlist, caseType: 'job' }).success).toBe(true);
    expect(waitlistSchema.safeParse({ ...waitlist, caseType: 'nope' }).success).toBe(false);
  });

  it('covers all 13 provinces and territories, in step with en.ts', () => {
    expect(PROVINCES).toHaveLength(13);
    expect(en.waitlist.provinces.map((p) => p.value)).toEqual([...PROVINCES]);
    expect(waitlistSchema.safeParse({ ...waitlist, province: 'ZZ' }).success).toBe(false);
  });

  it('needs the launch-email consent to be literally true', () => {
    const r = waitlistSchema.safeParse({ ...waitlist, consentLaunchEmails: false });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error).consentLaunchEmails).toBe(en.ui.err.consentEmails);
  });

  it('defaults the professional box to false', () => {
    const rest: Record<string, unknown> = { ...waitlist };
    delete rest.isProfessional;
    expect(waitlistSchema.parse(rest).isProfessional).toBe(false);
  });
});

describe('spam checks', () => {
  it('flags a filled honeypot', () => {
    expect(looksAutomated({ company: 'Acme', openedAt: 0 }, 60_000)).toBe(true);
    expect(looksAutomated({ company: '   ', openedAt: 0 }, 60_000)).toBe(false);
  });

  it('flags a submission sent in under three seconds, or from the future', () => {
    expect(MIN_FILL_MS).toBe(3000);
    expect(looksAutomated({ openedAt: 10_000 }, 12_999)).toBe(true);
    expect(looksAutomated({ openedAt: 10_000 }, 13_000)).toBe(false);
    expect(looksAutomated({ openedAt: 20_000 }, 10_000)).toBe(true);
  });

  it('has a consent wording version', () => {
    expect(CONSENT_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}\.\d+$/);
  });
});
