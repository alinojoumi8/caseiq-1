import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { deliverLead, formatLeadText, type Lead } from '../src/lib/deliver';

const lead: Lead = {
  kind: 'intake',
  receivedAt: '2026-10-31T12:00:00.000Z',
  consent: { at: '2026-10-31T12:00:00.000Z', version: '2026-10-31.1', privacy: true, updates: false },
  data: { firstName: 'Sam', email: 'sam@example.com', caseType: 'job' },
};

const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv;

afterEach(() => vi.unstubAllGlobals());

describe('deliverLead', () => {
  it('sends through Resend when the key and the destination are set', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const r = await deliverLead(lead, env({ RESEND_API_KEY: 're_test', LEAD_TO_EMAIL: 'team@example.com', NODE_ENV: 'production' }));
    expect(r).toEqual({ ok: true, via: 'resend' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer re_test');
    const sent = JSON.parse(init.body);
    expect(sent.to).toEqual(['team@example.com']);
    expect(sent.subject).not.toMatch(/sam/i);
    expect(sent.text).toContain('Consent wording version: 2026-10-31.1');
  });

  it('reports failure when Resend refuses or the network fails', async () => {
    const e = env({ RESEND_API_KEY: 'k', LEAD_TO_EMAIL: 'a@b.ca' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('no', { status: 422 })));
    expect(await deliverLead(lead, e)).toEqual({ ok: false, reason: 'failed' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    expect(await deliverLead(lead, e)).toEqual({ ok: false, reason: 'failed' });
  });

  it('appends to leads.jsonl in development', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'caseiq-leads-'));
    try {
      const e = env({ NODE_ENV: 'development', LEAD_DATA_DIR: dir });
      expect(await deliverLead(lead, e)).toEqual({ ok: true, via: 'file' });
      await deliverLead(lead, e);
      const lines = (await readFile(path.join(dir, 'leads.jsonl'), 'utf8')).trim().split('\n');
      expect(lines).toHaveLength(2);
      expect(JSON.parse(lines[0]).consent.version).toBe('2026-10-31.1');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('is not configured in production without the Resend variables, and never writes a file', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'caseiq-leads-'));
    try {
      const r = await deliverLead(lead, env({ NODE_ENV: 'production', LEAD_DATA_DIR: dir }));
      expect(r).toEqual({ ok: false, reason: 'not_configured' });
      await expect(readFile(path.join(dir, 'leads.jsonl'), 'utf8')).rejects.toThrow();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('writes a plain-text summary', () => {
    const text = formatLeadText(lead);
    expect(text).toContain('New Case IQ intake request');
    expect(text).toContain('email: sam@example.com');
    expect(text).toContain('Agreed to occasional updates: no');
  });
});
