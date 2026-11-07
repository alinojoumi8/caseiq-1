// Submitting the two forms to here.now Site Data (the here.now build, see src/lib/buildMode.ts).
//
// here.now hosts static files only. Site Data stores each submission as a record in a collection declared in
// herenow/data.json (published as .herenow/data.json). The records are private: only the owner's account can read them.
//
// The mapping functions are pure so the tests can check every field. Relative imports on purpose: the tests load this
// file without the @/ alias.
import { en } from '../content/en';
import { consentText } from './placeholders';
import { looksAutomated, type IntakeData, type WaitlistData } from './schemas';

/** The collection endpoints. Root-relative, because both forms live on the home page. */
export const SITE_DATA_URL = {
  requests: '/.herenow/data/requests',
  waitlist: '/.herenow/data/waitlist',
} as const;

export type SiteDataValue = string | boolean;
export type SiteDataRecord = Record<string, SiteDataValue>;

/**
 * The consent wording on the request form, exactly as shown: the privacy-notice line, then the updates line with the sender line.
 * Both are recorded because the person saw both; consent_privacy and consent_updates say which they ticked.
 */
export function intakeConsentWording(): string {
  const contact = en.intake.steps[5];
  return [contact.consentPrivacy, consentText(contact.consentUpdates, en.brand.name)].join('\n');
}

/** The consent wording on the early-access list, exactly as shown (with the sender line). */
export function waitlistConsentWording(): string {
  return consentText(en.waitlist.consent, en.brand.name);
}

/**
 * Maps a validated request form to a `requests` record. Fields are snake_case, as declared in herenow/data.json.
 * Optional fields are left out when empty, never sent as null. The voicemail answer is kept only when the person chose a phone call.
 */
export function requestRecord(data: IntakeData, consent: string = intakeConsentWording()): SiteDataRecord {
  const phone = (data.phone ?? '').trim();
  return {
    case_type: data.caseType,
    location: data.location,
    date_window: data.dateWindow,
    has_lawyer: data.hasLawyer,
    paper_amount: data.paperAmount,
    first_name: data.firstName,
    email: data.email,
    ...(phone ? { phone } : {}),
    contact_method: data.contactMethod,
    ...(data.contactMethod === 'call' ? { voicemail: data.voicemail } : {}),
    consent_privacy: data.consentPrivacy,
    consent_updates: data.consentUpdates,
    consent_text: consent,
  };
}

/** Maps a validated early-access sign-up to a `waitlist` record. */
export function waitlistRecord(data: WaitlistData, consent: string = waitlistConsentWording()): SiteDataRecord {
  const language = (data.language ?? '').trim();
  return {
    email: data.email,
    province: data.province,
    ...(language ? { language } : {}),
    professional: data.isProfessional,
    ...(data.caseType ? { case_type: data.caseType } : {}),
    consent_launch: data.consentLaunchEmails,
    consent_text: consent,
  };
}

/**
 * POSTs one record. Resolves true only on a 2xx answer. A 400, 403, 429, any 5xx, or a network failure all resolve false,
 * and the caller shows its normal send-failed message. The response body is never read or shown.
 */
export async function postSiteData(
  url: string,
  record: SiteDataRecord,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    // A retry of the same submit must not store the record twice.
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') headers['Idempotency-Key'] = crypto.randomUUID();
    const res = await fetchImpl(url, { method: 'POST', headers, body: JSON.stringify(record) });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * The bot checks, moved to the browser because there is no server to run them. A filled honeypot, or a form sent under
 * three seconds after it appeared, shows the normal success state without sending anything.
 */
export function shouldSkipSend(input: { company?: string; openedAt: number }, now: number): boolean {
  return looksAutomated(input, now);
}

/** Sends a validated request form to Site Data. A bot-like submit resolves true without sending. */
export async function sendRequest(
  data: IntakeData,
  now: number = Date.now(),
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (shouldSkipSend(data, now)) return true;
  return postSiteData(SITE_DATA_URL.requests, requestRecord(data), fetchImpl);
}

/** Sends a validated early-access sign-up to Site Data. A bot-like submit resolves true without sending. */
export async function sendWaitlist(
  data: WaitlistData,
  now: number = Date.now(),
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (shouldSkipSend(data, now)) return true;
  return postSiteData(SITE_DATA_URL.waitlist, waitlistRecord(data), fetchImpl);
}
