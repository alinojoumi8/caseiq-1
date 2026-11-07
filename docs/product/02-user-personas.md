---
title: Case IQ — User Personas
status: draft
owner: Product
last_updated: 2026-02-14
version: 1.0
---

# 02 — User Personas

Four primary personas and two secondary personas. Each persona is written to be *decision-useful*:
read the **"What this means for the build"** block before making design or scope calls.

> **Fictional personas.** All names, matters, and details below are invented for specification
> purposes. They are not based on any real person or legal matter.

---

## Persona priority map

| Persona | Priority | Pays? | Acquired via | Primary output |
|---|---|---|---|---|
| **A. Self-represented litigant (SRL)** | **P0** | Per matter | Search, legal-aid referrals, community | Understanding + Lawyer Brief |
| **B. Client with a lawyer** | **P1** | Per matter | Their lawyer, or self-serve | Organised handover package |
| **C. Solo/small-firm lawyer or paralegal** | **P2** | Seat subscription | SRL referrals, bar community | Faster matter onboarding |
| **D. Legal team** | **P3** | Team contract | Direct sales | Shared evidence workspace |
| E. Support worker / advocate (secondary) | P4 | Assists A | Legal aid, duty counsel | Help someone else organise |
| F. Expert / investigator (secondary) | P5 | Per matter | Referral | Structured record review |

---

## A. Self-Represented Litigant — PRIMARY PERSONA

### A.1 Profile

**Name:** Maria Santos (fictional) · **Age:** 44 · **Location:** Ontario, Canada
**Situation:** Respondent in a family proceeding and, separately, a wrongful-dismissal claim
against a former employer.

Maria has 1,400 pages of material in a Downloads folder, a shared drive from her former
lawyer, a phone full of text messages, and eleven months of bank statements. She has had one
45-minute consultation with a lawyer who told her she "needs to get organised" before they can
help her. She cannot afford $400/hour to have someone read her own documents back to her.

### A.2 Goals

1. Understand what her own file actually says — including the parts that are bad for her.
2. Find the contradictions in the other side's and the witnesses' accounts.
3. Hand a lawyer something usable in one meeting instead of ten.
4. Not miss a deadline or an important document.
5. Feel less alone and less overwhelmed.

### A.3 Frustrations

- "I know the truth but I can't find the page that proves it."
- Search inside 1,400 PDFs returns noise; she cannot tell which hits matter.
- She has read the same affidavit four times and still cannot say what changed between versions.
- She is terrified of relying on an AI and being wrong in front of a judge.
- Legal language makes her feel stupid; she stops reading.

### A.4 Behavioural realities

| Reality | Implication |
|---|---|
| Uses a phone for ~70% of browsing | Upload and viewing must work on mobile; heavy editing may be desktop-preferred but must not be blocked |
| Not technical; has never used a database | No "collections," no "schemas," no "pipelines" on any screen she sees |
| Highly motivated, time-poor, often stressed | Sessions are short and emotional; the product must resume cleanly and never lose work |
| Distrustful of AI after reading about hallucinations | The citation-first design is the *sales pitch*, not just a safety feature |
| Cost-sensitive, but will pay for a specific outcome | Price per matter, visible up front, no surprise overage |
| May be sharing a device or in an unsafe home | Session security, quick-exit, and notification discretion matter |
| May have documents they should not have | We must not encourage or facilitate improper use; neutral intake language |

### A.5 Jobs to be done

| When… | I want to… | So I can… |
|---|---|---|
| I have 1,400 pages and no idea where to start | dump them all in and be told what I have | stop panicking and start working |
| I remember something happened but not when | see everything in date order with sources | find the document that proves it |
| A witness says something different now | see both statements side by side with dates | understand what actually changed |
| I meet my lawyer next week | hand over an organised, cited package | use the hour on strategy, not filing |
| I am asked "what's your position?" | answer guided questions in my own words | produce a clear statement without legal training |

### A.6 What this means for the build

- **Onboarding must survive a 1,400-page upload by a non-technical user on a phone.** Upload
  must be resumable, must accept a ZIP, and must show honest progress. → `03-user-journeys.md` J1
- **The first screen after processing must show value in under 60 seconds.** That screen is the
  Timeline, not a settings page. → `04-feature-specification.md` F5
- **Every screen needs a "why am I looking at this" sentence.** No bare data tables.
- **Never show a confidence score, a model name, or a token count to Maria.** Show
  "Stated directly in a document" instead of `HIGH`.
- **Provide a "help me prepare for my lawyer" path as a first-class navigation item**, not a
  buried export.
- **Design for partial understanding.** She will use the Timeline without ever opening the
  Relationship Graph. Each feature must stand alone.
- **Abstention must be reassuring in tone.** "Your papers don't answer this yet" — never
  "Error: insufficient context."

---

## B. Client Working With a Lawyer

### B.1 Profile

**Name:** David Okafor (fictional) · **Age:** 58 · **Location:** Ontario, Canada
**Situation:** Plaintiff in a commercial dispute. He *has* counsel, but counsel is expensive and
David wants to be a useful client rather than a billing generator.

### B.2 Goals

1. Give his lawyer a head start before the first substantive meeting.
2. Track what he has already sent versus what is still outstanding.
3. Understand his own case well enough to make informed decisions and to sanity-check advice.
4. Reduce his legal spend without reducing quality.

### B.3 Frustrations

- He emails his lawyer 30 PDFs with no cover note, and gets billed for the lawyer's sorting time.
- He cannot tell whether the lawyer has actually read something.
- He keeps re-explaining the same background in every call.

### B.4 Jobs to be done

| When… | I want to… | So I can… |
|---|---|---|
| I have a new batch of records | organise and summarise them before sending | not pay for clerical work |
| My lawyer asks for something | know whether I already have it and where | respond same-day |
| I want a second opinion on my understanding | see the evidence organised neutrally | test my own assumptions |

### B.5 Relationship to Persona A

**This is the same product.** The differences are:

| Dimension | A (SRL) | B (with counsel) |
|---|---|---|
| Default output | Lawyer Brief | Lawyer Brief + handover log |
| Emphasis | Understand, self-advocate | Package, coordinate |
| People involved | Just them | Them + their lawyer as a viewer role |
| Terminology | Maximum plain English | Slightly more legal vocabulary tolerated |

### B.6 What this means for the build

- **A read-only "counsel" role must exist from the MVP**, because it is what makes the SRL →
  lawyer referral loop work, and it is far cheaper to build than full collaboration.
- **Track "what has been shared with counsel and when."** This is a small feature with
  outsized perceived value. → Feature F14.
- **Nothing in the product may suggest the user should distrust their lawyer or replace them.**

---

## C. Solo / Small-Firm Lawyer or Paralegal

### C.1 Profile

**Name:** Priya Raman (fictional) · **Role:** Sole practitioner, litigation and family
**Situation:** Takes on legal-aid certificates and modest-retainer matters. Frequently receives
disclosure or client records as an unsorted dump, often days before a deadline.

### C.2 Goals

1. Get oriented in a new matter's records in hours, not days.
2. Not miss the one document that changes the theory of the case.
3. Build a chronology she can rely on and cite in a settlement conference brief.
4. Justify her fees with a documented, defensible work product.

### C.3 Frustrations

- Existing e-discovery tools are priced and designed for Bay Street, not a two-person firm.
- Junior-associate chronology work is the first thing cut when a budget is tight.
- She cannot trust a black-box summary; she needs to see the page.
- She is professionally exposed if she relies on an unverified AI output.

### C.4 Jobs to be done

| When… | I want to… | So I can… |
|---|---|---|
| I receive 900 pages of disclosure | get a sourced chronology and entity list fast | form a theory |
| I prepare for a settlement conference | export a cited chronology | file something defensible |
| A client sends me their "organised" file | verify the AI's extractions quickly | trust it or discard it |
| I need to check a witness's consistency | see all their statements in order | prepare cross-examination |

### C.5 Professional and ethical constraints (these are hard requirements)

- **Duty of technological competence.** She is responsible for the output she adopts. Therefore
  every AI assertion must be **individually verifiable in one click**, and her verifications must
  be recorded.
- **Confidentiality.** She cannot upload client material to a tool with unclear retention or
  training practices. See `12-security-architecture.md` and `13-privacy-and-legal-risks.md`.
- **Candour and verification.** She needs to be able to distinguish, in any export, what was
  machine-suggested and unverified versus what she personally reviewed and adopted.
- **Conflicts.** She needs ethical walls between matters within her own account.

### C.6 What this means for the build

- **"Reviewed and adopted by me" must be a distinct, recorded state** on every AI extraction.
  This is a professional-liability requirement, not a nicety. → Feature F11, and schema
  `review_state` in `10-database-schema.md`.
- **Verification must be fast.** A reviewer who can verify 100 extractions in ten minutes will
  use the product. One who needs an hour will not.
- **Never hide the model, the prompt version, or the extraction timestamp from a professional
  user.** Persona C gets the "technical detail" disclosure that Persona A does not.
- **Price and package for a two-person firm.** Seats plus matter allowance, not enterprise
  minimums.
- **Ethical walls are a P2 requirement, not a P4 one**, once more than one matter exists in an
  account.

---

## D. Legal Team / Firm Collaboration

### D.1 Profile

**Name:** Northgate Litigation Group (fictional) · **Size:** 9 lawyers, 4 paralegals
**Situation:** Runs several large matters concurrently. Needs shared, permissioned workspaces,
external-counsel access, and an audit trail.

### D.2 Goals

1. Shared, consistent evidence workspace across a matter team.
2. External counsel and experts get scoped, revocable access.
3. Full audit trail of who saw, changed, verified, or exported what.
4. Retention and destruction policy compliance.
5. Firm-wide consistency in how chronologies are built.

### D.3 Jobs to be done

| When… | I want to… | So I can… |
|---|---|---|
| Onboarding a matter | establish roles and walls immediately | avoid conflicts and leaks |
| Engaging an expert | grant scoped, time-limited access | share only what is needed |
| Closing a matter | export and then destroy per policy | meet retention obligations |
| Auditing a disputed chronology | see every change and who made it | defend the work product |

### D.4 What this means for the build

- **The permission model must be designed correctly on day one even though the UI ships later.**
  Retrofitting row-level security into a populated multi-tenant schema is one of the most
  expensive mistakes available to this project. → `12-security-architecture.md` §5.
- **Audit logging must be append-only and complete from the first commit** — it cannot be
  back-filled.
- **Document-level sensitivity (`normal` / `confidential` / `privileged`) must exist in the
  schema from MVP**, even if the UI that sets it is minimal.
- **Export must be watermarkable and logged.**

---

## E. Support Worker / Advocate (secondary)

**Profile:** Duty counsel, settlement-conference support worker, legal-aid clinic volunteer,
family member helping a relative.

**Characteristics:** Works on someone else's matter with consent, often under time pressure,
handling several clients at once, sometimes with no legal training.

**What this means for the build:**
- A **guest/assisted access model with explicit, revocable, logged consent** is required before
  this persona can be supported. Do not ship shared logins.
- Assume multiple unrelated cases in one account; **case switching must be obvious and safe** so
  the wrong client's documents are never shown.
- Multilingual UI is valuable here (see `14-ux-specification.md` §9).

---

## F. Expert / Investigator (secondary)

**Profile:** Forensic accountant, investigator, or expert witness retained on a matter.

**Characteristics:** Needs structured, filterable, citable access to a defined subset of the
record; will be cross-examined on their methodology; needs to export their own work product with
provenance intact.

**What this means for the build:**
- **Filtered, scoped exports** (e.g. "every transaction in this date range with sources") are a
  distinct requirement from the Lawyer Brief, and matter a lot to the financial-evidence module.
- **Provenance must survive export** — a CSV export of transactions must carry document, page,
  and quote columns, not just values. → `11-api-specification.md` §9.
- Any automated figure (e.g. a total of traced funds) must be **reproducible and displayed with
  its constituent line items**, never as a bare number.

---

## Cross-persona requirement matrix

Which capabilities each persona forces. `M` = must have, `S` = should have, `—` = not needed.

| Capability | A (SRL) | B (client) | C (lawyer) | D (team) | E (advocate) | F (expert) |
|---|---|---|---|---|---|---|
| Simple upload incl. ZIP from phone | M | M | S | S | M | S |
| Plain-English UI & terminology | M | M | S | — | M | — |
| Visible provenance on every assertion | M | M | M | M | M | M |
| One-click source inspection | M | M | M | M | M | M |
| Lawyer Brief export | M | M | S | S | S | — |
| "Reviewed and adopted" state | — | S | M | M | — | S |
| Read-only counsel/external role | S | M | S | M | — | M |
| Ethical walls between matters | — | — | S | M | M | M |
| Audit log of access and change | S | S | M | M | M | S |
| Privilege / sensitivity marking | — | S | M | M | — | S |
| Immutable original + hash | S | S | M | M | S | M |
| Scoped structured export w/ provenance | — | S | M | M | — | M |
| Technical detail disclosure (model, prompt) | — | — | M | M | — | M |
| Reproducible aggregate figures | — | — | S | S | — | M |

---

## Anti-personas (who we are NOT building for)

Naming these prevents scope drift. If a feature exists only to serve one of these, it is out of
scope.

| Anti-persona | Why not |
|---|---|
| **Enterprise e-discovery buyer** (AmLaw 100 litigation support) | Needs predictive coding, TB-scale ingestion, review-probability workflows, and a sales motion we cannot fund. We would lose to Relativity and Everlaw on their terms. |
| **Law firm billable-hour maximiser** | Our value proposition reduces billable sorting work. We cannot serve both. |
| **Someone seeking a legal answer without evidence** | "Just tell me if I'll win." We must decline clearly and repeatedly. |
| **Someone wanting to fabricate or alter evidence** | No editing of source text, no date alteration, immutable originals, full audit trail. |
| **Someone surveilling another person** | No covert collection, no third-party monitoring features. Consent model required. |
| **A court or tribunal as a system of record** | We are a workspace, not a court filing system. No e-filing integration in the roadmap through Phase 3. |

---

## Related documents

- `01-product-vision.md` — the principles these personas inform
- `03-user-journeys.md` — these personas walking through the product
- `13-privacy-and-legal-risks.md` — the professional obligations in C.5 and D.3
- `20-business-model.md` — how each persona pays
- `sample-case/personas-and-cast.md` — the fictional cast used in the sample dataset
