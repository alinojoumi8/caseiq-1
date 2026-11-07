import { describe, expect, it } from 'vitest';
import { en } from '../src/content/en';
import { legal } from '../src/content/legal';
import { siteConfig, type SiteConfig } from '../src/content/site';
import {
  consentText,
  copyrightLine,
  emailLine,
  faqItems,
  fillSentences,
  foundingPoints,
  legalParas,
  nextBusinessDay,
  senderLine,
  stepBody,
  submitError,
  successBody,
} from '../src/lib/placeholders';

const empty: SiteConfig = {
  turnaroundDays: null,
  contactEmail: null,
  mailingAddress: null,
  legalEntity: null,
  confirmedClaims: [],
};
const full: SiteConfig = {
  turnaroundDays: 7,
  contactEmail: 'hello@example.ca',
  mailingAddress: '1 Example St, Toronto ON',
  legalEntity: 'Case IQ Inc.',
  confirmedClaims: [],
};

describe('while the site values are unset', () => {
  it('leaves the turnaround point out of the founding points', () => {
    expect(foundingPoints(en.founding.points, empty)).toEqual([
      'Free first conversation',
      'Flat price, agreed before we start. Never hourly.',
    ]);
  });

  it('leaves the turnaround sentence out of How it works step 3', () => {
    const step = en.how.steps[2];
    expect(stepBody(step, empty)).toBe(step.body);
    expect(stepBody(step, empty)).not.toContain('{');
  });

  it('switches FAQ 4 to its no-days answer', () => {
    const items = faqItems(en.faq.items, empty);
    expect(items.find((i) => i.id === 'time')!.a).toBe('We’ll tell you how long it will take in your free conversation, before you decide.');
  });

  it('drops the email line, the email fallbacks and the sender line', () => {
    expect(emailLine(en.final.email, empty)).toBeNull();
    expect(submitError(en.err, empty)).toBe('Your request wasn’t sent. Your answers are still here. Please try again.');
    expect(successBody(en.success.body, 'email', 'Monday', empty)).toBe(
      'A person on our team will reply by email within one business day. Please don’t send any documents until we’ve talked.',
    );
    expect(senderLine('Case IQ', empty)).toBe('');
    expect(consentText(en.waitlist.consent, 'Case IQ', empty)).toBe(en.waitlist.consent);
  });

  it('uses the brand name in the copyright line', () => {
    expect(copyrightLine(en.footer.copyright, 'Case IQ', empty)).toBe('© 2026 Case IQ');
  });

  it('uses the brand name in the sender line while the legal entity is unset', () => {
    expect(senderLine('Case IQ', { ...empty, contactEmail: 'hello@example.ca' })).toBe('Case IQ, hello@example.ca');
  });

  it('turns the legal-page contact lines into "to be confirmed", and drops the entity line', () => {
    expect(legalParas(['{entityLine}', '{contactLine}', '{addressLine}', 'x'], legal, empty)).toEqual([
      'Our contact email address is to be confirmed.',
      'Our mailing address is to be confirmed.',
      'x',
    ]);
  });

  it('never leaves a bracket or a token in any resolved string', () => {
    const resolved = [
      ...foundingPoints(en.founding.points, empty),
      ...en.how.steps.map((s) => stepBody(s, empty)),
      ...faqItems(en.faq.items, empty).flatMap((i) => [i.q, i.a]),
      submitError(en.err, empty),
      successBody(en.success.body, 'text message', 'Tuesday', empty),
      consentText(en.intake.steps[5].consentUpdates, 'Case IQ', empty),
      consentText(en.waitlist.consent, 'Case IQ', empty),
      copyrightLine(en.footer.copyright, 'Case IQ', empty),
    ];
    for (const text of resolved) expect(text).not.toMatch(/[[\]{}]|___/);
  });
});

describe('once the site values are set', () => {
  it('fills the days, the email and the sender line', () => {
    expect(foundingPoints(en.founding.points, full)).toEqual([
      'Free first conversation',
      'Flat price, agreed before we start. Never hourly.',
      'First timeline in about 7 days',
    ]);
    expect(stepBody(en.how.steps[2], full)).toContain('about 7 days.');
    const items = faqItems(en.faq.items, full);
    expect(items.find((i) => i.id === 'time')!.a).toContain('about 7 days after we have your papers');
    expect(emailLine(en.final.email, full)).toBe('Prefer email? Write to hello@example.ca');
    expect(submitError(en.err, full)).toBe('Your request wasn’t sent. Your answers are still here. Please try again, or email us at hello@example.ca.');
    expect(successBody(en.success.body, 'phone call', 'Tuesday', full)).toBe(
      'A person on our team will reply by phone call within one business day. Nothing by Tuesday? Write to hello@example.ca. Please don’t send any documents until we’ve talked.',
    );
    expect(consentText(en.waitlist.consent, 'Case IQ', full)).toMatch(/Case IQ Inc\., 1 Example St, Toronto ON, hello@example\.ca$/);
    expect(copyrightLine(en.footer.copyright, 'Case IQ', full)).toBe('© 2026 Case IQ Inc.');
  });

  it('puts the legal entity first in the sender line, in place of the brand', () => {
    expect(senderLine('Case IQ', full)).toBe('Case IQ Inc., 1 Example St, Toronto ON, hello@example.ca');
    expect(senderLine('Case IQ', { ...full, legalEntity: null })).toBe('Case IQ, 1 Example St, Toronto ON, hello@example.ca');
  });

  it('fills the entity, contact and address lines on the legal pages', () => {
    expect(legalParas(['{entityLine}', '{contactLine}', '{addressLine}', 'x'], legal, full)).toEqual([
      'Case IQ Inc. runs this website.',
      'Write to hello@example.ca.',
      'Our mailing address is 1 Example St, Toronto ON.',
      'x',
    ]);
  });

  it('keeps the entity line when only the legal entity is set, and the contact lines "to be confirmed"', () => {
    expect(legalParas(['{entityLine}', '{contactLine}', '{addressLine}'], legal, { ...empty, legalEntity: 'Case IQ Inc.' })).toEqual([
      'Case IQ Inc. runs this website.',
      'Our contact email address is to be confirmed.',
      'Our mailing address is to be confirmed.',
    ]);
  });
});

describe('the pricing copy', () => {
  const costAnswer = (cfg: SiteConfig) => faqItems(en.faq.items, cfg).find((i) => i.id === 'cost')!.a;

  it('says the price depends on the need and the complexity, whatever the config', () => {
    for (const cfg of [empty, full, siteConfig]) {
      expect(costAnswer(cfg)).toContain('The price depends on what you need and how complex your case is.');
    }
  });

  it('never states a starting price', () => {
    for (const cfg of [empty, full, siteConfig]) {
      expect(costAnswer(cfg)).not.toMatch(/\$|start at/i);
      expect(foundingPoints(en.founding.points, cfg).join(' ')).not.toMatch(/\$|from \d/i);
    }
  });

  it('gives the flat-price founding point as one fixed text, whatever the config', () => {
    for (const cfg of [empty, full, siteConfig]) {
      expect(foundingPoints(en.founding.points, cfg)[1]).toBe('Flat price, agreed before we start. Never hourly.');
    }
  });
});

describe('helpers', () => {
  it('keeps a question and its answer together when it drops a sentence', () => {
    expect(fillSentences('One. Nothing by {day}? Write to {email}. Two.', { day: 'Monday', email: null })).toBe('One. Two.');
  });

  it('names the next business day', () => {
    // 2026-11-02 is a Monday.
    expect(nextBusinessDay(new Date(2026, 10, 2))).toBe('Tuesday');
    expect(nextBusinessDay(new Date(2026, 10, 5))).toBe('Friday');
    expect(nextBusinessDay(new Date(2026, 10, 6))).toBe('Monday');
    expect(nextBusinessDay(new Date(2026, 10, 7))).toBe('Monday');
    expect(nextBusinessDay(new Date(2026, 10, 8))).toBe('Monday');
  });
});
