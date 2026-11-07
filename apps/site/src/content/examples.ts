// Synthetic example data from copy deck v3.2. Everything here is made up and is labelled "Example" wherever it appears.
// Quotes are stored without quotation marks; components add them.
// Keep this file free of imports so scripts/copy-lint.mjs can load it directly.

export type CaseId = 'job' | 'housing' | 'money' | 'family';
export type PageKind = 'email' | 'text' | 'receipt' | 'statement';

export interface RailMark {
  date: string; // short rail label, derived from the reference line
  page: string;
}

export interface HeroExample {
  id: CaseId;
  chip: string; // matches en.hero.chips
  yourWords: string;
  papersShow: string; // verbatim
  source: string; // "Where it comes from"
  rail: RailMark;
  gap: string;
  pageKind: PageKind;
  // The second source that lifts onto the rail (deck v3.2, "Lift message"). Every chip has one.
  lift: { text: string; source: string; rail: RailMark };
}

export const heroExamples: readonly HeroExample[] = [
  {
    id: 'job',
    chip: 'Job or workplace',
    yourWords: 'My manager said my job was safe.',
    papersShow: 'Your role is not affected by the restructuring.',
    source: 'Email from your manager · 12 Jan 2025 · page 1',
    rail: { date: '12 Jan', page: 'page 1' },
    gap: 'A notice or letter about the restructuring',
    pageKind: 'email',
    lift: {
      text: 'They posted your old job online today',
      source: 'Text from a coworker · 3 Feb 2025 · page 4',
      rail: { date: '3 Feb', page: 'page 4' },
    },
  },
  {
    id: 'housing',
    chip: 'Housing',
    yourWords: 'I told my landlord about the mould in March.',
    papersShow: 'The mould in the bathroom is back. Can you send someone this week?',
    source: 'Text to your landlord · 3 Mar 2025, 9:14 p.m. · page 12',
    rail: { date: '3 Mar', page: 'page 12' },
    gap: 'A reply from your landlord before May',
    pageKind: 'text',
    lift: {
      text: 'Still no one has come about the mould.',
      source: 'Text to your landlord · 18 Mar 2025 · page 14',
      rail: { date: '18 Mar', page: 'page 14' },
    },
  },
  {
    id: 'money',
    chip: 'Money owed',
    yourWords: 'I paid the contractor a $4,000 deposit.',
    papersShow: '$4,000.00 sent',
    source: 'E-transfer receipt (PDF) · 18 Jun 2025 · page 1',
    rail: { date: '18 Jun', page: 'page 1' },
    gap: 'Anything showing what the $4,000 was for',
    pageKind: 'receipt',
    lift: {
      text: 'Back on site next week.',
      source: 'Text from the contractor · 2 Jul 2025 · page 3',
      rail: { date: '2 Jul', page: 'page 3' },
    },
  },
  {
    id: 'family',
    chip: 'Family & separation',
    yourWords: 'I paid half the mortgage every month after we separated.',
    papersShow: 'Transfer to joint account · $1,150.00',
    source: 'Bank statement (PDF download) · April 2025 · page 2 (and 4 more months)',
    rail: { date: 'Apr', page: 'page 2' },
    gap: 'The statement for September',
    pageKind: 'statement',
    lift: {
      text: 'August mortgage, my half',
      source: 'E-transfer note · Aug 2025 · page 1',
      rail: { date: 'Aug', page: 'page 1' },
    },
  },
] as const;

// ───────────── S4: the six timeline items (Example) ─────────────
export interface TimelineExample {
  n: number;
  iso: string;
  date: string;
  what: string;
  quote: string;
  source: string;
  // Computer-read items carry a dashed "check the original" mark.
  computerRead?: boolean;
}

export const timelineExamples: readonly TimelineExample[] = [
  { n: 1, iso: '2025-01-12', date: '12 Jan 2025', what: 'Email from your manager', quote: 'Your role is not affected by the restructuring.', source: 'Email · page 1' },
  { n: 2, iso: '2025-01-20', date: '20 Jan 2025', what: 'Your meeting notes', quote: 'Manager said no more cuts this year', source: 'Your notes · page 1', computerRead: true },
  { n: 3, iso: '2025-01-28', date: '28 Jan 2025', what: 'Letter from your employer', quote: 'Your position has been eliminated, effective today.', source: 'Letter · page 1' },
  { n: 4, iso: '2025-02-03', date: '3 Feb 2025', what: 'Text from a coworker', quote: 'They posted your old job online today', source: 'Texts · page 4' },
  { n: 5, iso: '2025-02-03', date: '3 Feb 2025', what: 'Job posting (screenshot)', quote: 'Operations Coordinator, full-time', source: 'Screenshot · image 1' },
  { n: 6, iso: '2025-02-10', date: '10 Feb 2025', what: 'Severance offer', quote: 'four weeks’ pay', source: 'Letter · page 2' },
] as const;

// ───────────── S8: three example questions ─────────────
// A text part starts a new paragraph unless it sets cont, which continues the paragraph before it.
// A quote is a block (a card of its own) unless it sets inline, which sets it inside the sentence.
export type AnswerPart =
  | { t: 'text'; text: string; cont?: boolean }
  | { t: 'quote'; text: string; source: string; caution?: string; inline?: boolean };

export interface QaExample {
  id: 'q1' | 'q2' | 'q3';
  question: string;
  kind: 'cited' | 'gap' | 'decline';
  parts: readonly AnswerPart[];
  // Illustrative chips on the refusal. Never interactive.
  chips?: readonly string[];
}

export const qaExamples: readonly QaExample[] = [
  {
    id: 'q1',
    question: 'When was I told my job was safe?',
    kind: 'cited',
    parts: [
      { t: 'text', text: 'Your papers mention this twice.' },
      { t: 'text', text: 'An email from your manager on 12 January 2025 says:' },
      { t: 'quote', text: 'Your role is not affected by the restructuring.', source: 'Email · page 1' },
      { t: 'text', text: 'Your notes from the 20 January meeting say:' },
      {
        t: 'quote',
        text: 'Manager said no more cuts this year.',
        source: 'Your notes · page 1',
        caution: 'Read by computer. Check it against the original.',
      },
    ],
  },
  {
    id: 'q2',
    question: 'Did they give me a reason in writing?',
    kind: 'gap',
    parts: [
      { t: 'text', text: 'Your papers don’t answer this yet. The letter of 28 January says your position was' },
      { t: 'quote', text: 'eliminated', source: 'Letter · page 1', inline: true },
      { t: 'text', text: ', but none of your papers explains why. If you have something that does, add it.', cont: true },
    ],
  },
  {
    id: 'q3',
    question: 'Will I win?',
    kind: 'decline',
    // The refusal text is en.ask.refusal: one sentence with its redirect inside it.
    parts: [],
  },
] as const;
