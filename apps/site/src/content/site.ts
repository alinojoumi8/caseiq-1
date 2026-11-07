// Values only the founder can supply. While one is null, the fragment of copy that needs it is left out of the page,
// so a placeholder never renders. Launch is blocked until every value is set and every conditional claim is confirmed:
// `npm run lint:launch` fails while any field is null, or while an en.ts claim marker (a comment such as "// ⚠K1")
// names an ID that is not in confirmedClaims.
// Pricing is not here on purpose: the founder prices each case as a flat fee, so no starting price is ever published.
// Keep this file free of imports so the scripts can load it directly.

export interface SiteConfig {
  /** Days to a first timeline, for example 7. Needed by the founding point, How it works step 3 and FAQ 4. */
  turnaroundDays: number | null;
  /** Contact email address. Needed by the "Prefer email?" line, the success and error messages, the CASL consent texts and the legal pages. */
  contactEmail: string | null;
  /** Mailing address for the CASL consent texts and the legal pages. */
  mailingAddress: string | null;
  /** Legal entity name. Needed by the copyright line, the CASL sender line and the legal pages. */
  legalEntity: string | null;
  /** Claim IDs the founder has confirmed (claim register B and C), for example ['K1', 'C10']. */
  confirmedClaims: string[];
}

export const siteConfig: SiteConfig = {
  turnaroundDays: null,
  contactEmail: 'caseiq@agentmail.to',
  mailingAddress: '5255 Yonge Street, Unit 1104, Toronto, ON M2N 6P4',
  legalEntity: 'Case IQ Inc.',
  confirmedClaims: ['K3', 'K7'],
};
