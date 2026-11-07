import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { en } from '../src/content/en';
import { legal } from '../src/content/legal';
import { robotsMeta } from '../src/lib/buildMode';
import { legalPageForMode } from '../src/lib/legalPage';
import { consentText } from '../src/lib/placeholders';
import { MIN_FILL_MS, intakeSchema, waitlistSchema } from '../src/lib/schemas';
import {
  SITE_DATA_URL,
  intakeConsentWording,
  postSiteData,
  requestRecord,
  sendRequest,
  sendWaitlist,
  waitlistConsentWording,
  waitlistRecord,
} from '../src/lib/siteData';

// ───────────────────────── The Site Data manifest ─────────────────────────

const manifestPath = fileURLToPath(new URL('../herenow/data.json', import.meta.url));
const manifestText = readFileSync(manifestPath, 'utf8');
const manifest = JSON.parse(manifestText) as {
  collections: Record<
    string,
    {
      fields: Record<string, { type: string; required?: boolean; maxLength?: number; trim?: boolean; default?: unknown }>;
      access: Record<string, string>;
      rateLimit?: string;
    }
  >;
};

const FIELD_NAME = /^[a-z][a-z0-9_]*$/;
const RESERVED = ['id', 'site_slug', 'collection', 'data', 'status', 'created_at', 'updated_at', 'created_by_account_id'];
const FIELD_TYPES = ['string', 'number', 'integer', 'boolean', 'url', 'email', 'datetime', 'array', 'object'];
const ACCESS_VALUES = ['public', 'owner', 'none'];
const FIELD_KEYS = ['type', 'required', 'default', 'maxLength', 'trim'];

describe('herenow/data.json (the Site Data manifest)', () => {
  it('is valid JSON, within the here.now limits, and declares exactly requests and waitlist', () => {
    expect(statSync(manifestPath).size).toBeLessThan(64 * 1024);
    expect(Object.keys(manifest.collections).sort()).toEqual(['requests', 'waitlist']);
    expect(Object.keys(manifest.collections).length).toBeLessThanOrEqual(10);
    for (const c of Object.values(manifest.collections)) expect(Object.keys(c.fields).length).toBeLessThanOrEqual(50);
  });

  // PRIVACY GUARD. These records hold people's names and emails. If this test fails, a visitor could read other visitors' data.
  it('PRIVACY GUARD: reads are owner-only on every collection, never public', () => {
    for (const [name, c] of Object.entries(manifest.collections)) {
      expect(
        c.access.read,
        `collection "${name}" has access.read "${c.access.read}". It MUST be "owner": these records contain names and email addresses.`,
      ).toBe('owner');
    }
  });

  it('lets the public insert only: update and delete stay with the owner, and each collection is rate limited', () => {
    for (const [name, c] of Object.entries(manifest.collections)) {
      expect(c.access, name).toEqual({ read: 'owner', insert: 'public', update: 'owner', delete: 'owner' });
      expect(c.rateLimit, name).toBe('10/hour/ip');
      expect(Object.keys(c).sort(), `${name} must not opt into publicMutation`).toEqual(['access', 'fields', 'rateLimit']);
    }
  });

  it('uses only valid collection and field names, none of them reserved', () => {
    for (const [name, c] of Object.entries(manifest.collections)) {
      expect(name).toMatch(FIELD_NAME);
      expect(name.length).toBeLessThanOrEqual(64);
      for (const field of Object.keys(c.fields)) {
        expect(field, `${name}.${field}`).toMatch(FIELD_NAME);
        expect(field.length).toBeLessThanOrEqual(64);
        expect(RESERVED, `${name}.${field} is a reserved name`).not.toContain(field);
      }
    }
  });

  it('uses only supported types, access values and field options, and caps every string', () => {
    for (const [name, c] of Object.entries(manifest.collections)) {
      for (const v of Object.values(c.access)) expect(ACCESS_VALUES).toContain(v);
      for (const [field, def] of Object.entries(c.fields)) {
        expect(FIELD_TYPES, `${name}.${field}`).toContain(def.type);
        for (const key of Object.keys(def)) expect(FIELD_KEYS, `${name}.${field}.${key}`).toContain(key);
        if (def.type === 'string') {
          expect(def.maxLength, `${name}.${field} needs a maxLength`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('requires what the forms always collect', () => {
    const r = manifest.collections.requests.fields;
    for (const f of ['case_type', 'location', 'date_window', 'has_lawyer', 'paper_amount', 'first_name', 'email', 'contact_method', 'consent_privacy', 'consent_text']) {
      expect(r[f]?.required, `requests.${f}`).toBe(true);
    }
    expect(r.email.type).toBe('email');
    expect(r.phone.required).toBeFalsy();
    expect(r.voicemail.required).toBeFalsy();
    expect(r.consent_updates.type).toBe('boolean');
    const w = manifest.collections.waitlist.fields;
    for (const f of ['email', 'province', 'consent_launch', 'consent_text']) expect(w[f]?.required, `waitlist.${f}`).toBe(true);
    expect(w.email.type).toBe('email');
    expect(w.language.required).toBeFalsy();
    expect(w.case_type.required).toBeFalsy();
    expect(w.professional.type).toBe('boolean');
  });
});

// ───────────────────────── Mapping the forms to records ─────────────────────────

const intakeInput = {
  caseType: 'housing',
  location: 'ontario',
  dateWindow: 'within3m',
  hasLawyer: 'no',
  paperAmount: 'folder',
  firstName: '  Sam ',
  email: ' sam@example.com ',
  phone: '',
  contactMethod: 'email',
  voicemail: 'no',
  consentPrivacy: true,
  consentUpdates: false,
  company: '',
  openedAt: 1_000,
};
const parseIntake = (over: Record<string, unknown> = {}) => intakeSchema.parse({ ...intakeInput, ...over });

const waitlistInput = {
  email: 'pat@example.com',
  province: 'NS',
  language: '',
  isProfessional: false,
  consentLaunchEmails: true,
  company: '',
  openedAt: 1_000,
};
const parseWaitlist = (over: Record<string, unknown> = {}) => waitlistSchema.parse({ ...waitlistInput, ...over });

describe('requestRecord', () => {
  it('maps a request by email to snake_case fields, trimmed, with no phone and no voicemail', () => {
    expect(requestRecord(parseIntake(), 'WORDING')).toEqual({
      case_type: 'housing',
      location: 'ontario',
      date_window: 'within3m',
      has_lawyer: 'no',
      paper_amount: 'folder',
      first_name: 'Sam',
      email: 'sam@example.com',
      contact_method: 'email',
      consent_privacy: true,
      consent_updates: false,
      consent_text: 'WORDING',
    });
  });

  it('keeps the voicemail answer only when the person chose a phone call', () => {
    const call = requestRecord(parseIntake({ contactMethod: 'call', phone: '416-555-0199', voicemail: 'yes' }));
    expect(call.voicemail).toBe('yes');
    expect(call.contact_method).toBe('call');
    expect(call.phone).toBe('416-555-0199');
    expect(requestRecord(parseIntake({ contactMethod: 'call', phone: '416-555-0199', voicemail: 'no' })).voicemail).toBe('no');
    // A text or an email never carries a voicemail answer, even if one was left in the form state.
    for (const contactMethod of ['text', 'email']) {
      const rec = requestRecord(parseIntake({ contactMethod, phone: '416-555-0199', voicemail: 'yes' }));
      expect(rec, contactMethod).not.toHaveProperty('voicemail');
    }
    // A request that never answered the voicemail question (the default is no) still leaves it out unless it is a call.
    expect(requestRecord(parseIntake({ voicemail: undefined }))).not.toHaveProperty('voicemail');
  });

  it('leaves out an empty phone, and sends the consent flags as booleans', () => {
    const rec = requestRecord(parseIntake({ phone: '   ', consentUpdates: true }));
    expect(rec).not.toHaveProperty('phone');
    expect(rec.consent_privacy).toBe(true);
    expect(rec.consent_updates).toBe(true);
  });

  it('never sends the honeypot or the timing field, and only fields the manifest declares', () => {
    const rec = requestRecord(parseIntake({ contactMethod: 'call', phone: '416-555-0199', voicemail: 'yes', consentUpdates: true }));
    expect(rec).not.toHaveProperty('company');
    expect(rec).not.toHaveProperty('opened_at');
    const declared = Object.keys(manifest.collections.requests.fields);
    for (const key of Object.keys(rec)) expect(declared, key).toContain(key);
    for (const [key, def] of Object.entries(manifest.collections.requests.fields)) {
      if (def.required) expect(rec, `required field ${key}`).toHaveProperty(key);
    }
  });

  it('records the consent wording exactly as the form shows it', () => {
    const contact = en.intake.steps[5];
    const wording = intakeConsentWording();
    expect(wording).toContain(contact.consentPrivacy);
    expect(wording).toContain(consentText(contact.consentUpdates, en.brand.name));
    expect(requestRecord(parseIntake()).consent_text).toBe(wording);
    expect(wording.length).toBeLessThanOrEqual(manifest.collections.requests.fields.consent_text.maxLength as number);
  });

  it('fits every field cap in the manifest', () => {
    const rec = requestRecord(parseIntake({ contactMethod: 'call', phone: '416-555-0199', voicemail: 'yes' }));
    for (const [key, value] of Object.entries(rec)) {
      const cap = manifest.collections.requests.fields[key].maxLength;
      if (cap && typeof value === 'string') expect(value.length, key).toBeLessThanOrEqual(cap);
    }
  });
});

describe('waitlistRecord', () => {
  it('maps a sign-up, leaving out an empty language and a missing case type', () => {
    expect(waitlistRecord(parseWaitlist(), 'WORDING')).toEqual({
      email: 'pat@example.com',
      province: 'NS',
      professional: false,
      consent_launch: true,
      consent_text: 'WORDING',
    });
  });

  it('carries language, the professional box and the case type when they are given', () => {
    expect(
      waitlistRecord(parseWaitlist({ language: ' French ', isProfessional: true, caseType: 'family' }), 'W'),
    ).toEqual({
      email: 'pat@example.com',
      province: 'NS',
      language: 'French',
      professional: true,
      case_type: 'family',
      consent_launch: true,
      consent_text: 'W',
    });
  });

  it('records the consent wording exactly as the form shows it, and only declared fields', () => {
    const wording = waitlistConsentWording();
    expect(wording).toContain(en.waitlist.consent);
    expect(wording).toBe(consentText(en.waitlist.consent, en.brand.name));
    const rec = waitlistRecord(parseWaitlist({ language: 'French', isProfessional: true, caseType: 'job' }));
    expect(rec.consent_text).toBe(wording);
    const declared = Object.keys(manifest.collections.waitlist.fields);
    for (const key of Object.keys(rec)) expect(declared, key).toContain(key);
    for (const [key, def] of Object.entries(manifest.collections.waitlist.fields)) {
      if (def.required) expect(rec, `required field ${key}`).toHaveProperty(key);
    }
    expect(wording.length).toBeLessThanOrEqual(manifest.collections.waitlist.fields.consent_text.maxLength as number);
  });
});

// ───────────────────────── Sending ─────────────────────────

const response = (status: number, body: unknown = {}) => new Response(JSON.stringify(body), { status });
const fakeFetch = (impl: () => Promise<Response>) => vi.fn(impl) as unknown as typeof fetch & ReturnType<typeof vi.fn>;

describe('postSiteData', () => {
  it('posts one flat JSON record to the Site Data URL and resolves true on 2xx', async () => {
    const f = fakeFetch(async () => response(201, { record: { id: 'rec_x' } }));
    expect(await postSiteData(SITE_DATA_URL.requests, { email: 'a@b.ca' }, f)).toBe(true);
    const [url, init] = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/.herenow/data/requests');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ email: 'a@b.ca' });
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('resolves false for 400, 403, 429 and 5xx, and for a network failure, without reading the error text', async () => {
    for (const status of [400, 403, 404, 429, 500, 502, 503]) {
      const f = fakeFetch(async () => response(status, { error: 'secret server detail' }));
      expect(await postSiteData(SITE_DATA_URL.waitlist, {}, f), String(status)).toBe(false);
    }
    const down = fakeFetch(async () => {
      throw new TypeError('Failed to fetch');
    });
    expect(await postSiteData(SITE_DATA_URL.waitlist, {}, down)).toBe(false);
  });

  it('points at the two collections with root-relative URLs', () => {
    expect(SITE_DATA_URL).toEqual({ requests: '/.herenow/data/requests', waitlist: '/.herenow/data/waitlist' });
  });
});

describe('sendRequest and sendWaitlist (bot checks run in the browser)', () => {
  const NOW = 1_000_000;
  const human = { openedAt: NOW - MIN_FILL_MS - 1, company: '' };

  it('sends a normal submit to the right collection', async () => {
    const f = fakeFetch(async () => response(201));
    expect(await sendRequest(parseIntake(human), NOW, f)).toBe(true);
    expect(await sendWaitlist(parseWaitlist(human), NOW, f)).toBe(true);
    const calls = (f as unknown as ReturnType<typeof vi.fn>).mock.calls as [string, RequestInit][];
    expect(calls.map((c) => c[0])).toEqual(['/.herenow/data/requests', '/.herenow/data/waitlist']);
  });

  it('shows success without sending when the honeypot is filled', async () => {
    const f = fakeFetch(async () => response(201));
    expect(await sendRequest(parseIntake({ ...human, company: 'Acme' }), NOW, f)).toBe(true);
    expect(await sendWaitlist(parseWaitlist({ ...human, company: 'Acme' }), NOW, f)).toBe(true);
    expect(f).not.toHaveBeenCalled();
  });

  it('shows success without sending when the form was sent under three seconds after it appeared', async () => {
    const f = fakeFetch(async () => response(201));
    const fast = { openedAt: NOW - (MIN_FILL_MS - 1), company: '' };
    expect(await sendRequest(parseIntake(fast), NOW, f)).toBe(true);
    expect(await sendWaitlist(parseWaitlist(fast), NOW, f)).toBe(true);
    expect(f).not.toHaveBeenCalled();
  });

  it('reports a failure when the server refuses a real submit', async () => {
    for (const status of [400, 403, 429, 500]) {
      const f = fakeFetch(async () => response(status));
      expect(await sendRequest(parseIntake(human), NOW, f), String(status)).toBe(false);
      expect(await sendWaitlist(parseWaitlist(human), NOW, f), String(status)).toBe(false);
    }
  });
});

// ───────────────────────── Privacy notice variants and noindex ─────────────────────────

describe('privacy notice by build mode', () => {
  const changed = ['Where it goes', 'Where it is stored', 'Cookies and tracking'];

  it('leaves the default build exactly as it is', () => {
    expect(legalPageForMode(legal.privacy, 'default')).toBe(legal.privacy);
  });

  it('swaps in the here.now wording for three sections in the here.now build, using the exact strings', () => {
    const page = legalPageForMode(legal.privacy, 'herenow');
    const section = (h: string) => page.sections.find((s) => s.h === h)!;
    expect(section('Where it goes').paras).toEqual([
      'Your answers are saved with here.now, the service that hosts this website. People on our team read them there.',
      'We do not share your answers with anyone else, except services that store them for us, or when a court or the law requires it.',
    ]);
    expect(section('Where it is stored').paras).toEqual([
      'To be confirmed. Your answers are stored by here.now, the service that hosts this website. We have not yet confirmed in which country.',
    ]);
    expect(section('Where it is stored').tbc).toBe(true);
    expect(section('Cookies and tracking').paras).toEqual([
      "This website does not use cookies, advertising trackers or third-party scripts. The service that hosts it, here.now, gives us visit counts: pages viewed, countries, and the sites visitors came from. It doesn't show us your IP address. If that changes, we will update this notice first.",
    ]);
  });

  it('changes nothing else: same headings in the same order, and every other section untouched', () => {
    const page = legalPageForMode(legal.privacy, 'herenow');
    expect(page.sections.map((s) => s.h)).toEqual(legal.privacy.sections.map((s) => s.h));
    legal.privacy.sections.forEach((base, i) => {
      if (changed.includes(base.h)) expect(page.sections[i]).not.toEqual(base);
      else expect(page.sections[i]).toBe(base);
    });
    expect({ ...page, sections: undefined }).toEqual({ ...legal.privacy, sections: undefined });
  });

  it('has a base section for every variant, so none is silently ignored', () => {
    const headings = legal.privacy.sections.map((s) => s.h);
    expect(legal.privacyHerenow.sections.map((s) => s.h)).toEqual(changed);
    for (const h of changed) expect(headings).toContain(h);
  });

  it('does not touch the terms or accessibility pages', () => {
    expect(legalPageForMode(legal.terms, 'herenow')).toBe(legal.terms);
    expect(legalPageForMode(legal.accessibility, 'herenow')).toBe(legal.accessibility);
  });

  it('no longer says the answers are emailed, or that the site has no analytics, in the here.now build', () => {
    const text = JSON.stringify(legalPageForMode(legal.privacy, 'herenow'));
    expect(text).not.toContain('email delivery service');
    expect(text).not.toContain('does not use analytics services');
  });
});

describe('robots meta by build mode', () => {
  it('is noindex, nofollow in the here.now build and absent in the default build', () => {
    expect(robotsMeta('herenow')).toBe('noindex, nofollow');
    expect(robotsMeta('default')).toBeNull();
  });
});
