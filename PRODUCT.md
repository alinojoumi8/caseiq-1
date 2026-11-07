# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, deployed on Vercel. Chosen by the user on 2026-10-31. It matches the planned app's stack (`docs/product/24-architecture-decisions.md` ADR-002, ADR-014). The marketing site lives in `apps/site/`, beside the future app in `apps/web/`.

## Users

**Primary.** People in Ontario handling a court or tribunal case with little or no legal help (self-represented litigants). Typically:
- They are mid-case, holding hundreds to thousands of pages: email exports, text and WhatsApp exports, screenshots, photos, bank statements, handwritten notes and court papers.
- Most use a phone, and are often reading late at night.
- They are stressed, short of time and short of money.
- Hallucination stories have made them wary of AI.
- Some share a device or are not safe at home.

**Their job.** Understand what their own papers say, find the page that shows what happened, and hand a lawyer, a legal clinic or a hearing something usable.

**Secondary audiences:**
- People paying a lawyer, who want less of their money going to sorting.
- People helping someone else, with that person's consent.
- Lawyers and paralegals, who receive organized clients (professional waitlist).

Fictional personas: `docs/product/02-user-personas.md`.

## Product Purpose

Case IQ turns a chaotic pile of legal documents into an organized, evidence-linked case, so a person can understand their own matter and explain it clearly.

**Stage:** pre-launch. The app is fully specified in `docs/product/` but not built. The first offer is:
- hands-on, AI-assisted help for **founding clients in Ontario**, starting with a free first conversation;
- an **early-access list** for everyone else (other provinces, not ready yet, professionals).

**Success for the marketing site:**
- qualified founding-client requests and waitlist sign-ups;
- learning which case types, urgency levels and paper volumes actually arrive.

## Positioning

Every fact Case IQ shows is traceable to the exact page and words in the person's own papers. Anything the papers don't support is labelled "not in your papers yet" instead of being guessed.

- **Unlike general AI chatbots**, it never states what the papers don't support.
- **Unlike law-firm software**, it is made and priced for one person with thousands of pages and no legal team.

It never advises, predicts outcomes, judges anyone's credibility, or drafts or files court documents.

## Operating Context

**Case types:** employment, housing (landlord–tenant), small claims, civil, family, human rights, insurance and benefits.
- Family involves children's data, which is more sensitive.
- No criminal matters yet.

**Evidence types:** email exports, SMS and WhatsApp exports, screenshots, scanned letters, photos of handwritten notes, bank statements and court papers.

**Founding-client deliverables:**
- a dated timeline, with a page reference on every fact;
- a list of what the papers don't show yet;
- the person's own account, kept visibly separate from what the papers say;
- papers that disagree, shown side by side without judging;
- handwriting transcribed, with "check the original" flags;
- signatures shown side by side, with no opinion on whether they are genuine;
- a brief for a lawyer or clinic (not for filing);
- a hearing-ready numbered index.

**Courts and AI:** Ontario's Superior Court AI practice directions hold lawyers *and litigants* responsible for the accuracy of court materials prepared with AI.

## Capabilities and Constraints

- **Hard limits:**
  - not a law firm;
  - no legal advice;
  - no outcome predictions;
  - no credibility judgements;
  - no drafting or filing of court documents;
  - never speaks for anyone at a hearing.
- **Copy rules:**
  - voice, banned vocabulary and terminology map: `docs/product/14-ux-specification.md` §5–6;
  - required disclosures D-1 to D-12: `docs/product/13-privacy-and-legal-risks.md` §9.
- Our own service is never described with the words "lawyer", "legal advice" or "representation".
- Signature work is framed as side-by-side comparison for a forensic document examiner. The word "forged" is never used.
- Court readiness is framed as organizing, labelling and indexing. The person, or their lawyer, files.
- **Undecided (must not be invented):**
  - founding-client price;
  - reply-time commitment;
  - capacity;
  - secure file-intake method;
  - AI providers and their data terms;
  - data residency;
  - domain;
  - lead email address.

## Brand Commitments

- **Name: Case IQ.** Kept by the founder knowingly. An unrelated Ottawa company, Case IQ (formerly i-Sight), uses the same name, and caseiq.com and caseiq.ca are not available.
- **Voice:**
  - calm, plain and respectful;
  - a neutral observer of the record;
  - reading level of grade 6–8;
  - Canadian English;
  - consumer vocabulary: "your papers", "your case", "the people involved";
  - no hype, no exclamation marks, no fear tactics.
- **Product UI meanings.** These are binding wherever the marketing site depicts product UI (`docs/product/15-design-system.md`):
  - the person's own words are violet italic;
  - verbatim document text is serif with its quotation marks;
  - page references and figures are monospace;
  - red means system failure only;
  - green marks the person's own completed steps only;
  - amber marks allegations and computer-read caution only, never decoration;
  - shape carries meaning before colour does.
- **Product faces:** Inter, Source Serif 4, JetBrains Mono.
- **Indigo** is the product's brand ramp. Whether the marketing world inherits it is decided in the direction round.

## Evidence on Hand

- **Verified facts** (2026-10-31), with sources and allowed wording: `docs/marketing/claim-register.md`. Sources:
  - NSRLP Intake Report 2023–25;
  - Ontario Superior Court AI practice directions;
  - Legal Aid Ontario eligibility;
  - Canadian Lawyer 2024 fee survey.
- **Product spec:** `docs/product/` (24 documents), the fictional sample case (`docs/product/sample-case/`), and fictional personas.
- **Absent, and never to be fabricated:**
  - customers, testimonials, client or usage counts;
  - partner logos, press;
  - prices;
  - certifications, security audits;
  - accuracy benchmarks;
  - data-residency claims.

## Product Principles

1. **Show, don't claim.** Every fact is traced to its page. Saying "your papers don't show this yet" is a feature.
2. **Organize, never advise.** The person decides. They or their lawyer file.
3. **Describe, never characterize.** Papers that disagree are shown side by side, and nobody is called a liar.
4. **Calm over alarm.** The bar is a stressed person reading on a phone at night.
5. **Honest limits are first-class.** What we don't do is published, alongside free legal help.

## Accessibility & Inclusion

- WCAG 2.2 AA is required.
- Reading level of grade 6–8, designed for the phone first, reduced motion respected, usable at 320 px width and 200% zoom.
- Quick exit on every page, and the person's choice of how to be contacted, for anyone sharing a device or unsafe at home.
- English first; French is planned.
