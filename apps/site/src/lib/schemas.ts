// Zod schemas shared by the browser forms and the API routes (brief §5).
// Error messages are the copy deck's, taken from en.ts, so the browser and the server say the same thing.
// Relative imports on purpose: the tests load this file without the @/ alias.
import { z } from 'zod';
import { en } from '../content/en';

export const CASE_TYPES = ['job', 'housing', 'money', 'family', 'sued', 'other'] as const;
export const LOCATIONS = ['ontario', 'elsewhere'] as const;
export const DATE_WINDOWS = ['within2w', 'within3m', 'later', 'notSure'] as const;
export const LAWYER_STATES = ['no', 'yes', 'before', 'looking'] as const;
export const PAPER_AMOUNTS = ['few', 'folder', 'box', 'phone'] as const;
export const CONTACT_METHODS = ['email', 'call', 'text'] as const;
export const VOICEMAIL = ['yes', 'no'] as const;
export const PROVINCES = ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'] as const;

/** Version of the consent wording (CASL). Bump it whenever the privacy-notice or updates wording changes. */
export const CONSENT_VERSION = '2026-10-31.1';

/** Submissions that arrive sooner than this after the form opened are rejected. */
export const MIN_FILL_MS = 3000;

const NANP_CHARS = /^[+\d\s().-]+$/;
/** Loose North American phone check: ten digits, or eleven starting with 1. Blank is fine. */
export function isLooseNanp(value: string): boolean {
  const v = value.trim();
  if (v === '') return true;
  if (!NANP_CHARS.test(v)) return false;
  const digits = v.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}

const choose = { error: en.ui.err.choose };

export const caseTypeField = z.enum(CASE_TYPES, choose);
export const locationField = z.enum(LOCATIONS, choose);
export const dateWindowField = z.enum(DATE_WINDOWS, choose);
export const hasLawyerField = z.enum(LAWYER_STATES, choose);
export const paperAmountField = z.enum(PAPER_AMOUNTS, choose);

export const intakeSchema = z.object({
  caseType: caseTypeField,
  location: locationField,
  dateWindow: dateWindowField,
  hasLawyer: hasLawyerField,
  paperAmount: paperAmountField,
  firstName: z.string({ error: en.err.name }).trim().min(1, { error: en.err.name }).max(60, { error: en.err.name }),
  email: z
    .string({ error: en.err.email })
    .trim()
    .min(1, { error: en.err.email })
    .max(254, { error: en.err.emailInvalid })
    .pipe(z.email({ error: en.err.emailInvalid })),
  phone: z
    .string()
    .max(40, { error: en.err.phoneInvalid })
    .refine(isLooseNanp, { error: en.err.phoneInvalid })
    .optional(),
  contactMethod: z.enum(CONTACT_METHODS, choose),
  /** Asked only when the method is a phone call. The default is no. */
  voicemail: z.enum(VOICEMAIL, choose).default('no'),
  consentPrivacy: z.literal(true, { error: en.err.consent }),
  consentUpdates: z.boolean().default(false),
  /** Honeypot. A person never sees this field, so it must be empty. */
  company: z.string().max(200).optional(),
  /** Epoch milliseconds when the form opened in the browser. Used for the time check. */
  openedAt: z.number().int().nonnegative(),
})
  // A call or a text needs a number to call or text.
  .refine((d) => d.contactMethod === 'email' || (d.phone ?? '').trim() !== '', {
    path: ['phone'],
    error: en.err.phoneRequired,
  });

export const waitlistSchema = z.object({
  email: z
    .string({ error: en.err.email })
    .trim()
    .min(1, { error: en.err.email })
    .max(254, { error: en.err.emailInvalid })
    .pipe(z.email({ error: en.err.emailInvalid })),
  province: z.enum(PROVINCES, { error: en.ui.err.province }),
  language: z.string().trim().max(40).optional(),
  isProfessional: z.boolean().default(false),
  consentLaunchEmails: z.literal(true, { error: en.ui.err.consentEmails }),
  /** The case type carried over from the intake when the visitor is outside Ontario. */
  caseType: caseTypeField.optional(),
  company: z.string().max(200).optional(),
  openedAt: z.number().int().nonnegative(),
});

export type IntakeInput = z.input<typeof intakeSchema>;
export type IntakeData = z.output<typeof intakeSchema>;
export type WaitlistInput = z.input<typeof waitlistSchema>;
export type WaitlistData = z.output<typeof waitlistSchema>;

/** First message for each top-level field, for inline errors and the error summary. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_');
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

/** True when the form was filled in faster than a person could, or a hidden field was filled. */
export function looksAutomated(input: { company?: string; openedAt: number }, now: number): boolean {
  if (input.company && input.company.trim() !== '') return true;
  const elapsed = now - input.openedAt;
  return elapsed < MIN_FILL_MS;
}
