// FAQPage JSON-LD, generated from the same content as the visible accordion.
// Conditional-claim markers and founder placeholders must never reach search engines:
//  - "⚠" markers (and the claim id that follows) are removed;
//  - any sentence that holds a [bracketed placeholder] is dropped whole, so no half sentence ("in about  days") is left behind.

export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

const MARKER = /\s*⚠\s*[A-Z]?\d*(?:\s*\(counsel review\))?/g;

export function cleanForJsonLd(text: string): string {
  const withoutMarkers = text.replace(MARKER, '');
  const sentences = withoutMarkers.split(/(?<=[.!?])\s+/);
  return sentences
    .filter((s) => !/[[\]]/.test(s))
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function buildFaqJsonLd(items: readonly FaqItem[]) {
  const mainEntity = items
    .map((it) => ({ name: cleanForJsonLd(it.q), text: cleanForJsonLd(it.a) }))
    .filter((it) => it.name && it.text)
    .map((it) => ({
      '@type': 'Question',
      name: it.name,
      acceptedAnswer: { '@type': 'Answer', text: it.text },
    }));
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity };
}

/** Safe to place inside a script tag: "<" is escaped so the content cannot close the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
