// Shared request handling for /api/intake and /api/waitlist:
// rate limit, parse, validate with the shared zod schema, spam checks, build the lead, deliver it.
// Success is returned only when deliverLead says the lead was sent or stored.
import type { z } from 'zod';
import { deliverLead, type Lead, type LeadKind } from './deliver';
import {
  CONSENT_VERSION,
  intakeSchema,
  fieldErrors,
  looksAutomated,
  waitlistSchema,
  type IntakeData,
  type WaitlistData,
} from './schemas';

export const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 } as const;
const MAX_BODY_BYTES = 20_000;

// Best-effort only. This map lives in one server instance's memory. On serverless hosting each instance has its own
// copy and instances are recycled, so a determined sender can get past it. Put a real limiter in front before launch.
const hits = new Map<string, number[]>();

export function resetRateLimit() {
  hits.clear();
}

/** Records one request and returns true when this IP has used up its allowance for this route. */
export function isRateLimited(key: string, now: number): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 2000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= RATE_LIMIT.windowMs)) hits.delete(k);
  }
  return false;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim() || 'unknown';
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

function json(status: number, body: Record<string, unknown>, extra: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...extra } });
}

function stripSpam<T extends { company?: string; openedAt: number }>(data: T): Omit<T, 'company' | 'openedAt'> {
  const rest = { ...data } as Partial<T>;
  delete rest.company;
  delete rest.openedAt;
  return rest as Omit<T, 'company' | 'openedAt'>;
}

function intakeLead(d: IntakeData, now: Date): Lead {
  const { consentPrivacy, consentUpdates, phone, ...rest } = stripSpam(d);
  return {
    kind: 'intake',
    receivedAt: now.toISOString(),
    consent: { at: now.toISOString(), version: CONSENT_VERSION, privacy: consentPrivacy, updates: consentUpdates },
    data: { ...rest, ...(phone && phone.trim() ? { phone: phone.trim() } : {}) },
  };
}

function waitlistLead(d: WaitlistData, now: Date): Lead {
  const { consentLaunchEmails, language, ...rest } = stripSpam(d);
  return {
    kind: 'waitlist',
    receivedAt: now.toISOString(),
    consent: { at: now.toISOString(), version: CONSENT_VERSION, launchEmails: consentLaunchEmails },
    data: { ...rest, ...(language ? { language } : {}) },
  };
}

async function handle<S extends z.ZodType<{ company?: string; openedAt: number }>>(
  req: Request,
  kind: LeadKind,
  schema: S,
  build: (data: z.output<S>, now: Date) => Lead,
): Promise<Response> {
  const nowMs = Date.now();
  if (isRateLimited(`${kind}:${clientIp(req)}`, nowMs)) {
    return json(429, { ok: false, error: 'rate_limited' }, { 'Retry-After': String(RATE_LIMIT.windowMs / 1000) });
  }

  let raw: unknown;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY_BYTES) return json(413, { ok: false, error: 'too_large' });
    raw = JSON.parse(text);
  } catch {
    return json(400, { ok: false, error: 'invalid' });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) return json(400, { ok: false, error: 'invalid', fields: fieldErrors(parsed.error) });

  // Honeypot filled, or sent faster than a person could. The answer is the same generic refusal either way.
  if (looksAutomated(parsed.data, nowMs)) return json(400, { ok: false, error: 'rejected' });

  const result = await deliverLead(build(parsed.data, new Date(nowMs)));
  if (result.ok) return json(200, { ok: true });
  return result.reason === 'not_configured'
    ? json(503, { ok: false, error: 'unavailable' })
    : json(502, { ok: false, error: 'delivery_failed' });
}

export const handleIntake = (req: Request) => handle(req, 'intake', intakeSchema, intakeLead);
export const handleWaitlist = (req: Request) => handle(req, 'waitlist', waitlistSchema, waitlistLead);
