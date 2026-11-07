// Lead delivery adapter (brief §5).
//  1. RESEND_API_KEY and LEAD_TO_EMAIL set: send a plain-text summary through Resend's HTTP API (no SDK).
//  2. Development without those: append one JSON line to .data/leads.jsonl (gitignored).
//  3. Anything else: report "not configured", and the route answers 503.
// A lead counts as delivered only when one of the first two actually succeeded. The caller must never show success otherwise.
// The payload is never logged.
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export type LeadKind = 'intake' | 'waitlist';

export interface Lead {
  kind: LeadKind;
  /** ISO time the server received the form. */
  receivedAt: string;
  /** What the person agreed to, and which wording they saw (CASL). */
  consent: {
    at: string;
    version: string;
    privacy?: boolean;
    updates?: boolean;
    launchEmails?: boolean;
  };
  /** Validated form fields. Honeypot and timing fields are already removed. */
  data: Record<string, unknown>;
}

export type DeliveryResult =
  | { ok: true; via: 'resend' | 'file' }
  | { ok: false; reason: 'not_configured' | 'failed' };

const RESEND_URL = 'https://api.resend.com/emails';

export function resendConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.RESEND_API_KEY && env.LEAD_TO_EMAIL);
}

function line(label: string, value: unknown): string {
  if (value === undefined || value === null || value === '') return '';
  return `${label}: ${typeof value === 'boolean' ? (value ? 'yes' : 'no') : String(value)}\n`;
}

/** A plain-text summary for the team inbox. */
export function formatLeadText(lead: Lead): string {
  const d = lead.data;
  const head = lead.kind === 'intake' ? 'New Case IQ intake request' : 'New Case IQ early-access sign-up';
  let body = `${head}\nReceived: ${lead.receivedAt}\n\n`;
  for (const [k, v] of Object.entries(d)) body += line(k, v);
  body += `\nConsent recorded: ${lead.consent.at}\nConsent wording version: ${lead.consent.version}\n`;
  if (lead.consent.privacy !== undefined) body += line('Agreed to privacy notice', lead.consent.privacy);
  if (lead.consent.updates !== undefined) body += line('Agreed to occasional updates', lead.consent.updates);
  if (lead.consent.launchEmails !== undefined) body += line('Agreed to launch emails', lead.consent.launchEmails);
  return body;
}

async function sendWithResend(lead: Lead, env: NodeJS.ProcessEnv): Promise<DeliveryResult> {
  const replyTo = typeof lead.data.email === 'string' ? lead.data.email : undefined;
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.LEAD_FROM_EMAIL || 'Case IQ <onboarding@resend.dev>',
        to: [env.LEAD_TO_EMAIL],
        subject: lead.kind === 'intake' ? 'New Case IQ intake request' : 'New Case IQ early-access sign-up',
        text: formatLeadText(lead),
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok ? { ok: true, via: 'resend' } : { ok: false, reason: 'failed' };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}

async function appendToFile(lead: Lead, env: NodeJS.ProcessEnv): Promise<DeliveryResult> {
  try {
    const dir = env.LEAD_DATA_DIR || path.join(process.cwd(), '.data');
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, 'leads.jsonl'), JSON.stringify(lead) + '\n', 'utf8');
    console.info(`[leads] stored 1 ${lead.kind} lead in .data/leads.jsonl (development only)`);
    return { ok: true, via: 'file' };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}

export async function deliverLead(lead: Lead, env: NodeJS.ProcessEnv = process.env): Promise<DeliveryResult> {
  if (resendConfigured(env)) return sendWithResend(lead, env);
  if (env.NODE_ENV === 'development') return appendToFile(lead, env);
  return { ok: false, reason: 'not_configured' };
}
