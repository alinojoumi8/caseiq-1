import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/deliver', () => ({ deliverLead: vi.fn() }));

import { deliverLead } from '../src/lib/deliver';
import { RATE_LIMIT, resetRateLimit } from '../src/lib/leadRequest';
import { CONSENT_VERSION } from '../src/lib/schemas';
import { POST as postIntake } from '../src/app/api/intake/route';
import { POST as postWaitlist } from '../src/app/api/waitlist/route';

const deliver = vi.mocked(deliverLead);

const intakeBody = () => ({
  caseType: 'job',
  location: 'ontario',
  dateWindow: 'later',
  hasLawyer: 'before',
  paperAmount: 'phone',
  firstName: 'Sam',
  email: 'sam@example.com',
  phone: '416-555-0199',
  contactMethod: 'text',
  voicemail: 'yes',
  consentPrivacy: true,
  consentUpdates: true,
  company: '',
  openedAt: Date.now() - 20_000,
});

const waitlistBody = () => ({
  email: 'pat@example.com',
  province: 'NS',
  language: 'French',
  isProfessional: true,
  consentLaunchEmails: true,
  caseType: 'family',
  company: '',
  openedAt: Date.now() - 20_000,
});

function req(path: string, body: unknown, ip = '203.0.113.7') {
  return new Request(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  resetRateLimit();
  deliver.mockReset();
  deliver.mockResolvedValue({ ok: true, via: 'file' });
});

describe('POST /api/intake', () => {
  it('delivers a valid request with the consent time and wording version, and answers 200', async () => {
    const res = await postIntake(req('/api/intake', intakeBody()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(deliver).toHaveBeenCalledTimes(1);
    const lead = deliver.mock.calls[0][0];
    expect(lead.kind).toBe('intake');
    expect(lead.consent.version).toBe(CONSENT_VERSION);
    expect(Number.isNaN(Date.parse(lead.consent.at))).toBe(false);
    expect(lead.consent).toMatchObject({ privacy: true, updates: true });
    expect(lead.data).toMatchObject({ firstName: 'Sam', email: 'sam@example.com', phone: '416-555-0199', caseType: 'job' });
    // Spam fields and consent flags are not mixed into the lead data.
    expect(lead.data).not.toHaveProperty('company');
    expect(lead.data).not.toHaveProperty('openedAt');
    expect(lead.data).not.toHaveProperty('consentPrivacy');
  });

  it('returns 400 with field messages for invalid input and delivers nothing', async () => {
    const res = await postIntake(req('/api/intake', { ...intakeBody(), email: 'nope', consentPrivacy: false, firstName: '' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(Object.keys(body.fields)).toEqual(expect.arrayContaining(['email', 'consentPrivacy', 'firstName']));
    expect(deliver).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON', async () => {
    const res = await postIntake(req('/api/intake', '{not json'));
    expect(res.status).toBe(400);
    expect(deliver).not.toHaveBeenCalled();
  });

  it('rejects a filled honeypot without delivering, and never says ok', async () => {
    const res = await postIntake(req('/api/intake', { ...intakeBody(), company: 'Acme Ltd' }));
    expect(res.status).toBe(400);
    expect((await res.json()).ok).toBe(false);
    expect(deliver).not.toHaveBeenCalled();
  });

  it('rejects a form sent less than 3 seconds after it opened', async () => {
    const res = await postIntake(req('/api/intake', { ...intakeBody(), openedAt: Date.now() - 500 }));
    expect(res.status).toBe(400);
    expect(deliver).not.toHaveBeenCalled();
  });

  it('limits each address to 5 requests in 10 minutes', async () => {
    for (let i = 0; i < RATE_LIMIT.max; i++) {
      expect((await postIntake(req('/api/intake', intakeBody(), '198.51.100.9'))).status).toBe(200);
    }
    const blocked = await postIntake(req('/api/intake', intakeBody(), '198.51.100.9'));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('retry-after')).toBeTruthy();
    // Another address is unaffected.
    expect((await postIntake(req('/api/intake', intakeBody(), '198.51.100.10'))).status).toBe(200);
  });

  it('answers 503 and not ok when nothing is configured to receive the lead', async () => {
    deliver.mockResolvedValue({ ok: false, reason: 'not_configured' });
    const res = await postIntake(req('/api/intake', intakeBody()));
    expect(res.status).toBe(503);
    expect((await res.json()).ok).toBe(false);
  });

  it('answers 502 and not ok when delivery fails', async () => {
    deliver.mockResolvedValue({ ok: false, reason: 'failed' });
    const res = await postIntake(req('/api/intake', intakeBody()));
    expect(res.status).toBe(502);
    expect((await res.json()).ok).toBe(false);
  });
});

describe('POST /api/waitlist', () => {
  it('delivers a valid sign-up with the carried case type and launch consent', async () => {
    const res = await postWaitlist(req('/api/waitlist', waitlistBody()));
    expect(res.status).toBe(200);
    const lead = deliver.mock.calls[0][0];
    expect(lead.kind).toBe('waitlist');
    expect(lead.consent).toMatchObject({ launchEmails: true, version: CONSENT_VERSION });
    expect(lead.data).toMatchObject({ email: 'pat@example.com', province: 'NS', isProfessional: true, caseType: 'family', language: 'French' });
  });

  it('rejects an unticked consent box and a missing province', async () => {
    const res = await postWaitlist(req('/api/waitlist', { ...waitlistBody(), consentLaunchEmails: false, province: '' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(Object.keys(body.fields)).toEqual(expect.arrayContaining(['consentLaunchEmails', 'province']));
    expect(deliver).not.toHaveBeenCalled();
  });

  it('rejects a filled honeypot and a too-fast form', async () => {
    expect((await postWaitlist(req('/api/waitlist', { ...waitlistBody(), company: 'x' }))).status).toBe(400);
    expect((await postWaitlist(req('/api/waitlist', { ...waitlistBody(), openedAt: Date.now() }))).status).toBe(400);
    expect(deliver).not.toHaveBeenCalled();
  });

  it('answers 503 when nothing is configured, and keeps its own rate limit', async () => {
    deliver.mockResolvedValue({ ok: false, reason: 'not_configured' });
    expect((await postWaitlist(req('/api/waitlist', waitlistBody()))).status).toBe(503);
    // The intake allowance is separate.
    expect((await postIntake(req('/api/intake', intakeBody()))).status).toBe(503);
  });
});
