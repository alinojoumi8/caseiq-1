import { describe, expect, it } from 'vitest';
import { en } from '../src/content/en';
import { claims } from '../src/content/claims';
import { heroExamples, qaExamples, timelineExamples } from '../src/content/examples';

const words = (s: string) => s.trim().split(/\s+/).length;

describe('content', () => {
  it('resolves every cite id used in en.ts', () => {
    const used = [en.ask.fact1.cite, en.ask.fact2.cite];
    for (const id of used) expect(claims[id]).toBeDefined();
  });

  it('keeps every citation quote to 25 words or fewer', () => {
    for (const c of Object.values(claims)) {
      expect(words(c.quote)).toBeLessThanOrEqual(25);
    }
  });

  it('keeps the F10 sentence out of the F9 citation', () => {
    expect(JSON.stringify(claims.F9)).not.toContain('inadvertence');
  });

  it('has one hero example per chip, in order', () => {
    expect(heroExamples.map((e) => e.id)).toEqual(en.hero.chips.map((c) => c.id));
    for (const e of heroExamples) expect(e.chip).toBe(en.hero.chips.find((c) => c.id === e.id)?.label);
  });

  it('has six timeline items and three answers', () => {
    expect(timelineExamples).toHaveLength(6);
    expect(qaExamples.map((q) => q.id)).toEqual(['q1', 'q2', 'q3']);
  });

  it('renders no founder note until real content exists', () => {
    expect(en.founding.person).toBeNull();
  });

  it('labels examples', () => {
    expect(en.example.label).toBe('Example, not a real case');
  });
});
