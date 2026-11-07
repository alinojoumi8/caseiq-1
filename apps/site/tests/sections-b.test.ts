import { describe, expect, it } from 'vitest';
import { en } from '../src/content/en';
import { legal } from '../src/content/legal';
import { qaExamples } from '../src/content/examples';
import { siteConfig } from '../src/content/site';

describe('copy deck v3.1 sync', () => {
  it('has the v3.1 strings', () => {
    expect(en.world.delivered).toBe('Example only. You haven’t contacted us.');
    expect(en.hero.chipsLabel).toBe('What kind of case is it? Tap one to see an example.');
    expect(en.intake.intro).toBe(
      'These are set questions, not a live chat. Nothing is sent until you press “Request my free conversation” at the end.',
    );
    expect(en.intake.intro).toContain(en.intake.steps[5].submit);
    expect(en.ask.fact2.text).toContain('in its AI practice direction for civil cases');
    expect(en.bar.status).toBe('Taking our first clients in Ontario, a few at a time');
    expect(en.waitlist.toggle).toBe('Not in Ontario, or not ready yet? Join the early-access list');
    expect(en.waitlist).not.toHaveProperty('disclaimer');
    expect(en.ask.prompt).toContain('In the service, the person helping you answers, with the page.');
    expect(en.err.phoneRequired).toBe('Please enter a phone number, or choose email.');
    expect(en.intake.steps[3].withLawyer).toContain('or leave those messages out for now.');
    expect(en.founding.body).toContain('in your timeline and summary');
    expect(en.world.checked).toBe('Checked by a person on our team');
    const seen = en.faq.items.find((i) => i.id === 'seen')!;
    expect(seen.a).toContain('or when a court or the law requires it');
  });

  it('keeps the world.checked receipt out of the Q&A answers', () => {
    expect(JSON.stringify(qaExamples)).not.toContain(en.world.checked);
  });

  it('lists the six free legal help resources, each with a verified https link', () => {
    expect(en.limits.help.items).toHaveLength(6);
    for (const r of en.limits.help.items) expect(r.url).toMatch(/^https:\/\//);
  });

  it('has the refusal as one sentence with the redirect inside it', () => {
    expect(en.ask.refusal).toContain('or add this to your questions for a lawyer.');
    expect(en.ask.refusal).not.toContain('help you organize');
  });
});

describe('site config', () => {
  it('carries the founder values supplied so far, and leaves the turnaround unset so nothing is invented', () => {
    expect(siteConfig).toEqual({
      turnaroundDays: null,
      contactEmail: 'caseiq@agentmail.to',
      mailingAddress: '5255 Yonge Street, Unit 1104, Toronto, ON M2N 6P4',
      legalEntity: 'Case IQ Inc.',
      confirmedClaims: ['K3', 'K7'],
    });
  });

  it('has no starting price', () => {
    expect(siteConfig).not.toHaveProperty('priceFrom');
  });
});

describe('legal pages', () => {
  it('carry the draft banner text', () => {
    expect(legal.banner.title).toBe('Draft, pending legal review');
  });

  it('keep the terms list in step with what we do not do', () => {
    const section = legal.terms.sections.find((s) => s.h === 'What we do not do');
    expect(section && 'items' in section ? section.items : []).toEqual([...en.limits.dont]);
  });

  it('mark retention, storage location and AI providers as to be confirmed', () => {
    const tbc = legal.privacy.sections.filter((s) => 'tbc' in s && s.tbc).map((s) => s.h);
    expect(tbc).toEqual(['Where it is stored', 'How long we keep it', 'AI services']);
  });

  it('names WCAG 2.2 AA and the contact address on the accessibility page', () => {
    expect(legal.accessibility.intro).toContain('2.2');
    expect(legal.accessibility.intro).toContain('AA');
    expect(JSON.stringify(legal.accessibility)).toContain('{contactLine}');
  });

  it('end the privacy and terms pages with the entity, contact and address lines', () => {
    const last = (s: { sections: readonly { h: string; paras?: readonly string[] }[] }) => s.sections.find((x) => x.h === 'Contact')?.paras;
    expect(last(legal.privacy)).toEqual(['{entityLine}', '{contactLine}', '{addressLine}']);
    expect(last(legal.terms)).toEqual(['{entityLine}', '{contactLine}', '{addressLine}']);
  });
});
