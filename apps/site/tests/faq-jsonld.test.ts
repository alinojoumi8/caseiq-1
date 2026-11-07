import { describe, expect, it } from 'vitest';
import { en } from '../src/content/en';
import { buildFaqJsonLd, cleanForJsonLd, serializeJsonLd } from '../src/components/sections/b/faqJsonLd';

describe('FAQ JSON-LD', () => {
  const ld = buildFaqJsonLd(en.faq.items);
  const json = JSON.stringify(ld);

  it('is a FAQPage with a question per FAQ item, in deck order', () => {
    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity).toHaveLength(en.faq.items.length);
    expect(ld.mainEntity.map((q) => q.name)).toEqual(en.faq.items.map((i) => i.q));
    expect(ld.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
  });

  it('never carries a conditional-claim marker or a bracketed founder placeholder', () => {
    expect(json).not.toContain('⚠');
    for (const q of ld.mainEntity) {
      expect(q.name).not.toMatch(/[[\]]/);
      expect(q.acceptedAnswer.text).not.toMatch(/[[\]]/);
    }
    expect(json).not.toContain('$___');
    expect(json).not.toContain('[X]');
    expect(json).not.toContain('[domain]');
  });

  it('gives the cost answer in full with the flat-fee sentence, and drops the sentence that held a placeholder', () => {
    const cost = ld.mainEntity.find((q) => q.name === 'What does it cost?')!;
    expect(cost.acceptedAnswer.text).toBe(
      'Your first conversation is free. If we work together, we agree on a flat price before we start, never an hourly rate. The price depends on what you need and how complex your case is.',
    );
    const time = ld.mainEntity.find((q) => q.name === 'How long does it take?')!;
    expect(time.acceptedAnswer.text).not.toMatch(/about\s+days/);
    expect(time.acceptedAnswer.text).toContain('If your hearing is close, tell us in the form.');
  });

  it('strips markers and placeholders from arbitrary text', () => {
    expect(cleanForJsonLd('Free first conversation ⚠K1 · and more ⚠P5 (counsel review)')).toBe('Free first conversation · and more');
    expect(cleanForJsonLd('Write to hello@[domain]. We reply fast.')).toBe('We reply fast.');
    expect(cleanForJsonLd('Prices start at [$___].')).toBe('');
  });

  it('skips a question whose whole answer was a placeholder', () => {
    const out = buildFaqJsonLd([{ id: 'x', q: 'Price?', a: '[Prices start at $___.]' }]);
    expect(out.mainEntity).toHaveLength(0);
  });

  it('escapes "<" so the content cannot close the script tag', () => {
    expect(serializeJsonLd({ a: '</script><b>' })).not.toContain('</script>');
  });
});
