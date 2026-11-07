---
title: Case IQ — MVP Scope
status: draft
owner: Product
last_updated: 2026-02-14
version: 1.0
---

# 05 — MVP Scope

This document defines the smallest version of Case IQ that is genuinely useful, and defends
every inclusion and exclusion. It **challenges the preliminary MVP list** rather than accepting
it.

---

## 1. The MVP thesis

> **The MVP is a single, narrow, provable claim:**
> *"Upload your legal documents. Get an organised, cited chronology and a summary of your case
> that you can hand to a lawyer — and verify every single statement in one click."*

Nothing else. If a feature does not serve that sentence, it is not MVP.

### 1.1 The MVP hypothesis to test

| # | Hypothesis | How we know we were right | How we know we were wrong |
|---|---|---|---|
| H1 | A non-technical person can upload 500+ real-world non-legal-grade files without help | ≥ 85% of signups reach a processed matter; ≥ 90% of documents reach READY | Onboarding completion < 60% |
| H2 | The extracted chronology is useful enough to act on | ≥ 60% of users review ≥ 20 events; median TTFDC < 30 min | Review queue abandonment > 70% |
| H3 | Users trust the citations | ≥ 50% of users click ≥ 5 citations; citation integrity ≥ 99.5% | Citation click-through < 15% |
| H4 | The Lawyer Brief is worth paying for | ≥ 35% of active matters generate a brief | Brief generation < 10% |
| H5 | Unit economics work | Blended cost per 500-page matter within the plan's gross margin target | Cost per matter > 3× plan price |

**The MVP exists to test these five hypotheses. Feature completeness is not a goal.**

---

## 2. Review of the preliminary proposed MVP

The brief proposed these 12 items. Each is assessed below. **Verdict** is one of
**KEEP** · **MERGE** · **RESEQUENCE** · **CUT to Phase 2** · **ADD**.

| # | Proposed | Verdict | Reasoning |
|---|---|---|---|
| 1 | Account system | **KEEP (table stakes)** | Not a differentiator and not a risk. Build the minimum: email/password, OAuth, MFA/TOTP, sessions. Do **not** build team management, SSO, SCIM, or org hierarchies in MVP. |
| 2 | Case creation | **KEEP (table stakes)** | Minimum viable: title, case type, optional court details. Everything else is settings, added later. |
| 3 | Document uploads | **KEEP — highest risk item** | This is where MVPs of this class die. Real user files are corrupt, scanned, password-protected, oddly named, and delivered as nested ZIPs. Budget more here than instinct suggests. |
| 4 | PDF/document parsing | **MERGE with 5** | Parsing and summarising are not separable stages; splitting them creates a fake interface. One pipeline (F05/F07) with explicit stages. |
| 5 | AI document summaries | **MERGE, RESEQUENCE LATER** | Per-document summaries are lower value than a *matter-level* chronology and are a cost multiplier on 2,000 documents. Keep a cheap one-line "what is this document" label per document (needed for the library UI); defer rich per-document summaries to Phase 2. **This is a cost decision as much as a scope decision.** |
| 6 | Entity extraction | **RESEQUENCE EARLIER** | The timeline needs people to be useful; entity extraction is a dependency of the timeline, not a parallel workstream. Move before timeline. |
| 7 | Master timeline | **KEEP — the centrepiece** | This is the product's core artifact and the fastest path to value. It should be the **first** thing a user sees with real content. |
| 8 | People profiles | **KEEP, REDUCED** | Full profiles (with communications, transactions, related people) depend on modules that are not in MVP. MVP profile = identity, aliases, evidenced roles, documents, events, statements. Cut the rest. |
| 9 | Evidence-linked AI chat | **KEEP, but SEQUENCED LATE** | High value, highest hallucination risk, highest cost per interaction. It must ship **after** the citation-verification infrastructure exists, not before. Shipping chat before the citation system is how this product destroys its own trust proposition. |
| 10 | Contradiction detection | **CUT to Phase 2** | Three reasons: (a) it depends on statement modelling, which depends on the extraction and entity work landing first; (b) it is the highest-precision-risk feature in the product, and a false "inconsistency" accusation is the most damaging possible error; (c) it needs the full text of statements across the whole record, which is only reliable after Phase 1 proves extraction quality. **Deliberately deferred, deliberately not deleted.** |
| 11 | Case story builder | **CUT to Phase 2** | It is high-value but it is a *wrapper* over a working evidence model. Building it before the evidence model is solid means building it twice. It also does not depend on AI quality, so it can be added cheaply later — which is exactly why it is safe to defer. |
| 12 | Lawyer brief export | **KEEP — do not defer under any circumstances** | This is the growth loop, the monetisation event, and the reason a self-represented litigant's lawyer becomes a customer. If schedule pressure forces a cut, cut the AI chat before the brief. |

### 2.1 Net changes to the proposed list

**Additions (missing and non-negotiable):**

| Added | Why it is MVP, not later |
|---|---|
| **A1. Citation system built as infrastructure first** (F16) | The core promise. If it is retrofitted, it will be retrofitted badly. It must be a first-class subsystem with its own verification, not a field on a summary table. |
| **A2. Extraction review queue + corrections with version history** (F11, F24) | AI *will* be wrong at MVP quality. Without a correction path the product is unusable and untrustworthy. Corrections are also the mechanism by which we learn. |
| **A3. "What we couldn't do" honesty panel** (F23) | Procurement-grade trust signal and the primary diagnostic for ingestion quality. Cheap to build, disproportionate value. |
| **A4. Tenant isolation, permissions, and audit log from commit one** (F03, F41) | Row-level security and append-only audit logs cannot be back-filled into a populated multi-tenant schema. Retrofitting them is the single most expensive mistake available to this project. |
| **A5. Real deletion, including embeddings** (F40) | "Deleted files remain in embeddings" is a named red-team risk with privacy consequences. It is far cheaper to build the purge path with the schema than to hunt embeddings later. |
| **A6. Evidence viewer with deep links** (F15) | "Verify in one click" is the product. The viewer is the product surface that delivers it. |

**Confirmations of things the brief implied but should be stated explicitly:**

- Search (F17) is MVP and probably earlier than expected, because without it users cannot find
  anything in a large matter and will conclude the product does not work.
- The evidence viewer is MVP because citations are worthless if you cannot see the source.

---

## 3. MVP definition

### 3.1 The six MVP pillars

Each pillar has an owner-facing success statement and a hard exit criterion.

| # | Pillar | Success statement | Exit criterion |
|---|---|---|---|
| **P1** | **Get files in and read them** | "It handled my messy files." | ≥ 90% of documents in the test corpus reach READY; zero original bytes modified |
| **P2** | **Tell me what's in there** | "It found the story and the people." | ≥ 1 verifiable event per 15 pages of text-bearing content; entity precision ≥ 0.95 |
| **P3** | **Let me verify everything** | "I can see the page behind every claim." | Unsupported-assertion escape rate = 0; citation integrity ≥ 99.5% |
| **P4** | **Let me fix it** | "When it's wrong, I can correct it and it stays corrected." | No correction ever destroys the original; revert works |
| **P5** | **Let me search it** | "I can find anything." | Keyword p95 < 800ms on 2,000 docs; hybrid beats pure modes on the eval set |
| **P6** | **Let me hand it to my lawyer** | "My lawyer took me seriously." | Brief exports to PDF+DOCX with citations, legend, and disclaimer on every page |

### 3.2 MVP feature list — the definitive scope

Per-feature detail lives in `04-feature-specification.md`. This is the **only** authoritative MVP
list. Anything not on it is not in the MVP.

**In MVP (19 features)**

| ID | Feature | Why it is irreducible |
|---|---|---|
| F01 | Accounts, sessions, Organizations (minimal) | Cannot have users without it |
| F02 | Matter creation and settings (minimal) | Cannot hold a case without it |
| F03 | Roles and permissions (basic: owner/member/viewer) | Security foundation; cannot be retrofitted |
| F04 | Secure document upload | Pillar P1 |
| F05 | Document processing pipeline | Pillar P1 |
| F07 | Text extraction and OCR | Pillar P1 |
| F08 | Duplicate detection | Real disclosure is 20-40% duplicates; without it the timeline is garbage |
| F09 | Document classification (basic taxonomy) | Drives extraction schemas and the library UI |
| F06 | Document library | Users must see and manage what they uploaded |
| F10 | Entity extraction | Pillar P2; dependency of timeline |
| F11 | Extraction review queue | Pillar P4 |
| F12 | Master timeline | Pillar P2 — the centrepiece |
| F13 | Person profiles (reduced) | Pillar P2 |
| F15 | Evidence viewer | Pillar P3 |
| F16 | Citation system | Pillar P3 — the moat |
| F17 | Search (hybrid) | Pillar P5 |
| F20 | Citation verification agent | Pillar P3 — non-negotiable, ships **with** F19, not after |
| F19 | Evidence-cited AI chat | Pillar P2/P3 — the trust showcase |
| F21 | Case summary | Feeds the dashboard and the brief |
| F22 | Lawyer Brief + export | Pillar P6 — the growth loop |
| F23 | Processing status and transparency panel | Trust + diagnostics |
| F24 | User corrections and version history | Pillar P4 |
| F25 | Notes and annotations | Needed for review workflow; cheap |
| F39 | Share links (basic, read-only, expiring) | The referral loop needs a zero-friction way to show counsel |
| F40 | Matter archival and permanent deletion | Privacy obligation + red-team mitigation |
| F41 | Audit log (append-only, internal) | Cannot be retrofitted |
| F48 | Onboarding wizard | Determines whether any of the above is ever reached |
| F50 | Matter-level AI provider policy | Required before any professional user will upload |

That is **27 features**, which is more than the "12" in the brief. The brief's list conflated
features with epics and omitted the safety infrastructure. The MVP is *narrower in modules* and
*deeper in foundation* than the brief proposed.

### 3.3 MVP explicitly excluded

| Excluded | Phase | Reason |
|---|---|---|
| Allegation matrix (F26) | 2 | Requires statement modelling maturity. High value, real risk. |
| Contradiction engine (F27) | 2 | Highest precision risk in the product; needs Phase 1 extraction quality first |
| Statement evolution (F28) | 2 | Depends on F27's statement model |
| Witness profiles (F31) | 2 | Depends on F28 |
| Communication threading (F30) | 2 | Real value but a large parser surface; email/chat exports can be ingested as plain files in MVP |
| Financial ledger (F32) | 3 | Highest OCR-corruption risk; needs the balance-verification work. **Critically: shipping money extraction without balance verification would be irresponsible.** |
| Fund tracing (F33) | 3 | Depends on F32 |
| Relationship graph (F34) | 3 | Expensive to build well; the table/list equivalents carry most of the value |
| Story builder (F35) | 2 | A wrapper over the evidence model; cheaper and safer to add once the model is stable |
| Deadlines (F36, F37) | 2 | Useful but not load-bearing |
| Comments/threads (F38) | 3 | Single-user MVP; share links cover the collaboration need |
| Full matter export (F42) | 3 | Privacy-important but not needed for first value |
| Bundles (F43) | 4 | |
| Audio/video (F44) | Later | Separate privacy review required |
| Multilingual UI (F45) | 3 | English-first; framework put in place in MVP, translations later |
| Admin console (F46) | 3 | Minimal org settings only |
| Billing/metering (F47) | 3 | **Exception:** manual invoicing for design partners; see §5 |
| Notifications (F49) | 2 | Only "processing complete" email in MVP |

### 3.4 MVP success metrics — the release gate

The MVP is not "done" when the features exist. It is done when these hold on the test corpus.

| Metric | MVP gate |
|---|---|
| Documents reaching READY | ≥ 90% of the standard corpus |
| Original bytes modified | 0 (hard gate) |
| Unsupported-assertion escape rate | 0 (hard gate) |
| Citation integrity rate | ≥ 99.5% |
| Extraction precision — distinct people | ≥ 0.95 |
| Timeline event usefulness (human-reviewed) | ≥ 80% judged "a real, relevant event" |
| Keyword search p95 @ 2,000 docs | < 800ms |
| Chat abstention correctness on the abstention set | ≥ 90% |
| Legal-advice refusal on the adversarial set | 100% |
| Brief export with citations on every statement | 100% |
| Cross-tenant data leakage | 0 (hard gate) |
| Median TTFDC for a 500-page matter | < 30 minutes |

**Any hard gate failing blocks release regardless of schedule.**

---

## 4. Phasing beyond MVP

### Phase 2 — Make it useful for real legal work (the "analysis" release)

**Goal:** Move from "organised" to "understood." This is where the product becomes defensible
and where the SRL → lawyer value is strongest.

Features: F26 Allegation matrix · F27 Contradiction engine · F28 Statement evolution ·
F29 Gap analysis · F30 Communication threading · F31 Witness profiles · F35 Story builder ·
F36 Deadlines · F37 .ics export · F49 Notifications · rich per-document summaries.

**Entry criteria:** MVP gates met; extraction precision ≥ 0.95 measured on the extended corpus;
at least 10 design-partner matters processed end to end.

**Exit criteria:** ≥ 70% precision on flagged conflicts; zero credibility-language failures in
copy lint; allegations module used in ≥ 40% of active matters.

**Why this order:** every Phase 2 analysis feature consumes the statement/evidence model built in
Phase 1. Building them earlier would mean building them against a moving target.

### Phase 3 — Money and structure (the "professional" release)

**Goal:** Serve lawyers and experts with the features they specifically demand.

Features: F32 Financial ledger **with balance verification** · F33 Fund tracing ·
F34 Relationship graph · F14 Organization profiles · F38 Comments/threads ·
F42 Full matter export · F45 Multilingual UI · F47 Billing and metering · F46 Admin console.

**Entry criteria:** Phase 2 exit criteria met; ≥ 5 practising lawyers using the product weekly.

**Exit criteria:** Balance-verification catches ≥ 95% of injected amount errors on the labelled
set; graph performs at 300 nodes/800 edges ≥ 40fps.

**Why this order:** the financial module is the highest-consequence module in the product. A
misread dollar amount that reaches a lawyer's brief is the worst outcome the product can produce.
It ships only once balance-arithmetic verification exists and is proven.

### Phase 4 — Teams and scale (the "firm" release)

Features: F43 Bundles · ethical walls UI · external-counsel and expert access management ·
matter-level retention policy enforcement · full admin and compliance reporting · SSO/SCIM ·
support-access controls · SOC 2 Type II readiness.

**Entry criteria:** at least one 5+ seat firm committed; security review passed; retention
enforcement proven.

### Later / experimental

F44 Audio and video transcription (requires its own DPIA and consent design) · real-time
collaborative editing · mobile applications · predictive coding / technology-assisted review ·
automated redaction assistance · court e-filing integration · self-hosted/on-premise deployment ·
fine-tuned domain extraction models · a locally-hosted model tier for maximum-sensitivity matters.

---

## 5. What the MVP deliberately does *not* include, and why that is defensible

The hardest MVP conversation is about things that are obviously valuable. Each exclusion below
is a real product decision, not an oversight.

| Excluded from MVP | The honest reason | What we do instead for the first users |
|---|---|---|
| **Billing system** | Building metering, plans, invoicing, and dunning before we know the cost curve or the willingness to pay is wasted work that will be rebuilt. | Manual invoicing for 10–25 design partners. Meter costs internally from day one (F47's metering events are recorded even though the UI is absent). |
| **Contradiction detection** | A false accusation of inconsistency is the single most damaging error this product can produce. It needs statement modelling and a precision-validated evaluation set that only exist after Phase 1. | Manual "statements by this person" view in the person profile — the raw material, without the automated judgement. |
| **Relationship graph** | Graphs demo extremely well and are used rarely. The list/table equivalents (documents involving X, people connected to Y) carry most of the actual value. | Linked lists and cross-reference tables on person and organization profiles. |
| **Story builder** | It is the highest-empathy feature and the easiest to build *once* the evidence model is stable — which makes it the safest thing to defer. | The Lawyer Brief's "Client's Position" section accepts free text the user writes directly. |
| **Multi-user collaboration** | The MVP user is one person with a problem. Collaboration is a professional-tier need. | Scoped read-only share links for counsel. |
| **Mobile apps** | Responsive web covers viewing, reviewing, and approving on a phone. Native apps are a distribution strategy, not a product need. | Strict responsive design with a mobile-first review flow. |
| **Financial module** | Shipping money figures before balance-arithmetic verification is irresponsible. | Documents of type `bank_statement` are classified and searchable; no amounts are asserted. |
| **Automatic legal deadline calculation** | Requires jurisdiction-specific rules and constitutes legal advice. | Deadlines are recorded from documents with a citation, labelled "verify this date". |

---

## 6. MVP risk register

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Real-world file diversity breaks ingestion | **High** | **Critical** | Build a 500-file adversarial corpus *before* the pipeline; make "unsupported/locked/corrupt" a first-class state; test continuously | Ingest |
| Extraction quality too low to be useful | Medium | Critical | Measure on a labelled set from day one; ship the review queue as the fallback UX; treat precision as a release gate | AI |
| Citation verification too slow or too expensive | Medium | High | Two-tier design: deterministic check on everything, model check only where it matters; cache by quote hash | AI |
| Unit costs exceed price on large matters | **High** | **High** | Per-matter cost ceiling; cheap model tier for extraction; strict born-digital/OCR gating; measure via design partners before pricing | Product |
| Perceived as legal advice → UPL exposure | Medium | **Critical** | Copy lint, refusal templates, disclaimers, "not for filing" footer, no outcome language, legal review before public launch | Legal |
| Trust destroyed by one visible hallucination | Medium | Critical | Citation verification as a release gate; no unsupported assertion may render; abstention is a designed outcome | AI |
| Users cannot get past upload | Medium | Critical | Resumable upload, honest progress, partial results, onboarding instrumentation | Product |
| Scope creep into Phase 2 features | **High** | Medium | This document is the scope contract; new MVP features require removing one | Product |

---

## 7. MVP build order (thin vertical slices)

The MVP is built as **six vertical slices**, each of which ends in something a real user could
touch. This order is chosen so that the highest-risk assumptions are tested earliest.

| Slice | Contains | Ends when | Proves |
|---|---|---|---|
| **S0 — Skeleton** | F01, F02, F03, F41, F40, schema, RLS, audit log, local dev environment | A user can sign up, create a matter, and the audit log records it | Foundations that cannot be retrofitted |
| **S1 — Get it in** | F04, F05, F07, F23, F48 | 180 real files upload from a phone and reach READY, with honest status | H1 — the riskiest UX |
| **S2 — See it** | F15, F16, F06, F09, F17 | A user can browse, search, and open any document page; citations resolve | P3 infrastructure before any generation exists |
| **S3 — Understand it** | F10, F12, F13, F11, F24, F25 | A user sees a cited timeline, reviews it, and corrects it | H2, H3, H4 |
| **S4 — Ask it** | F19, F20, F21, F50 | Cited chat with verified citations and working abstention | H3 — hallucination control |
| **S5 — Hand it over** | F22, F39 | A lawyer receives a cited, verified brief | H4 — the growth loop |

**Deliberate ordering note:** S2 (citations and search) precedes S4 (chat). This is the opposite
of the instinct to "get a demo working," and it is the single most important sequencing decision
in the plan. Building the citation substrate first makes the no-unsupported-assertion guarantee
structural rather than aspirational.

---

## 8. MVP definition of done

The MVP ships when **all** of the following are true:

1. All 27 MVP features pass their acceptance criteria in `04-feature-specification.md`.
2. All hard gates in §3.4 pass.
3. The adversarial corpus (500 files) processes at ≥ 90% READY.
4. The security test suite passes: cross-tenant isolation, privilege enforcement, RLS without
   tenant context, signed-URL expiry, upload hardening, and prompt-injection resistance.
5. The privacy deliverables are complete: privacy policy, DPA templates, subprocessor list,
   deletion receipts, retention disclosure, and a completed DPIA.
6. Legal review of all user-facing copy has been completed and signed off.
7. Ten design-partner users have completed the full journey on their own real matters, unaided.
8. Median TTFDC < 30 minutes on a 500-page matter, measured in production.
9. A rollback plan exists and has been rehearsed.
10. The cost dashboard reconciles with provider invoices within the documented tolerance.

---

## Related documents

- `04-feature-specification.md` — full feature definitions and acceptance criteria
- `19-roadmap.md` — the phased plan with objectives, dependencies, and acceptance criteria per phase
- `22-development-plan.md` — sequencing, team, and timeline
- `epics/` — the engineering task breakdown for the MVP slices
- `17-ai-evaluation-framework.md` — how the quality gates in §3.4 are measured
- `20-business-model.md` — the cost curve that constrains MVP scope
