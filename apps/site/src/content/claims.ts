// Citation data for third-party facts (claim register section A).
// Phase 1 carries F2 and F9. Phase 2 adds the others only if the copy uses them.
// Each quote is 25 words or fewer and was checked against the source text.
// Keep this file free of imports so scripts/copy-lint.mjs can load it directly.

export const claims = {
  F2: {
    id: 'F2',
    title: 'SRL Intake Report 2023–2025',
    publisher: 'National Self-Represented Litigants Project (NSRLP)',
    date: 'March 2026',
    locator: 'p. 25 (question added April 2024)',
    url: 'https://representingyourselfcanada.com/srl-intake-report-2023-2025/',
    // Checked against the report PDF, page 25. 16 words.
    quote: 'out of a total of 237 respondents to this question, 43.46% (n = 103) answered “Yes,”',
  },
  F9: {
    id: 'F9',
    title: 'Consolidated Civil Provincial Practice Direction',
    publisher: 'Ontario Superior Court of Justice',
    date: 'Last updated 19 October 2026', // VERIFY against the live page before launch
    locator: 'Part J, item 12',
    url: 'https://www.ontariocourts.ca/scj/filing-procedures/provincial/consolidated-civil-provincial-practice-direction/',
    // 15 words, copied from the live page.
    quote: 'Without exception, however, it is the responsibility of all counsel and litigants to guarantee accuracy',
  },
} as const;

export type ClaimId = keyof typeof claims;
export type Claim = (typeof claims)[ClaimId];
