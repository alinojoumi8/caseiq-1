---
title: Case IQ — Product Specification Index
status: draft
owner: Product
last_updated: 2026-02-14
version: 1.0
---

# Case IQ — Product Specifications

**Master index.** This directory contains the complete, implementation-ready specification set for
Case IQ. Another engineering team — or an AI coding agent — should be able to begin implementation
from these documents without having to redesign the product.

> ## ⚠️ Two things to know before you read anything else
>
> **1. This is a specification set. No application code has been written.** That is deliberate. The
> provenance model, the tenancy model, and the citation mechanism cannot be safely retrofitted, and
> getting them wrong is the most expensive mistake available to this project.
>
> **2. Read `research-amendments.md` before implementing anything.** Twelve material amendments
> arrived *after* the core specs were drafted — several are corrections, not additions. Where an
> amendment contradicts a numbered spec, **the amendment wins** until the spec is updated.

---

## What Case IQ is

A legal case organisation and case-understanding platform. It turns a chaotic pile of legal
documents into an organised, evidence-linked workspace so a person can understand their own matter
and explain it clearly to a lawyer.

**The core guarantee:** every assertion the system shows a user is traceable to the exact place in
the uploaded evidence that supports it — or it is not shown as a fact at all.

**It is not a lawyer.** It organises, connects, summarises, preserves, and communicates. It never
advises, never predicts, and never judges a person's credibility.

---

## Read this first, by role

| If you are… | Read in this order |
|---|---|
| **An engineer about to build** | `05-mvp-scope.md` §7 → `epics/README.md` → `06-system-architecture.md` → `research-amendments.md` |
| **An AI/ML engineer** | `07-ai-architecture.md` → `09-evidence-provenance.md` → `research-amendments.md` (A1, A4, A9, A10) → `17-ai-evaluation-framework.md` |
| **An ingestion engineer** | `08-document-ingestion.md` → `research-amendments.md` (A4, A5) → `sample-case/` |
| **A security engineer** | `12-security-architecture.md` → `research-amendments.md` (A6, A7) → `16-testing-strategy.md` §7 |
| **A product manager** | `01-product-vision.md` → `03-user-journeys.md` → `05-mvp-scope.md` → `21-competitive-analysis.md` |
| **A designer** | `14-ux-specification.md` → `wireframes/` → `15-design-system.md` |
| **A QA engineer** | `16-testing-strategy.md` → `17-ai-evaluation-framework.md` → `sample-case/` |
| **Legal or privacy counsel** | `13-privacy-and-legal-risks.md` → `23-open-questions.md` → `21-competitive-analysis.md` §10 |
| **A founder or investor** | `01-product-vision.md` → `05-mvp-scope.md` → `20-business-model.md` → `21-competitive-analysis.md` |
| **Reviewing the architecture** | `24-architecture-decisions.md` → `06-system-architecture.md` → `research-amendments.md` |
| **Worried about what could go wrong** | `18-red-team-risks.md` |

---

## The specification set

### Foundation and product definition

| # | Document | What it settles |
|---|---|---|
| [01](01-product-vision.md) | **Product Vision** | The seven assertion classes, the five verbs, twelve product principles, the north-star metric, what the product will never do |
| [02](02-user-personas.md) | **User Personas** | Four primary personas, two secondary, two anti-personas, and the cross-persona requirement matrix |
| [03](03-user-journeys.md) | **User Journeys** | Thirteen journeys J1–J13, each with entry conditions, failure modes, and testable acceptance criteria |
| [04](04-feature-specification.md) | **Feature Specification** | 50 features (F01–F50) with dependencies and acceptance criteria; twelve global criteria G-01–G-12 |
| [05](05-mvp-scope.md) | **MVP Scope** | **Challenges the proposed MVP list.** 27 MVP features, six build slices, hard release gates, and what is deliberately excluded |

### Architecture

| # | Document | What it settles |
|---|---|---|
| [06](06-system-architecture.md) | **System Architecture** | Modular monolith, one database, the full stack, runtime flows, scaling path, what is deliberately avoided |
| [07](07-ai-architecture.md) | **AI Architecture** | Provider abstraction, 13 roles (not 9 autonomous agents), hybrid retrieval, the no-unsupported-assertion guarantee, two-tier verification, prompt-injection defence |
| [08](08-document-ingestion.md) | **Document Ingestion** | Upload, scanning, extraction, OCR, tables, dedup, the state machine, the queue architecture, retry taxonomy |
| [09](09-evidence-provenance.md) | **Evidence Provenance** | The seven assertion classes, the confidence rule engine, the citation model, the rendering contract, twelve database-enforced invariants |
| [10](10-database-schema.md) | **Database Schema** | The complete logical model, RLS conventions, the constraint set DB-1–DB-12, migration requirements |
| [11](11-api-specification.md) | **API Specification** | REST surface, ten cross-cutting invariants, the assertion-collection contract, 20 API acceptance tests |
| [24](24-architecture-decisions.md) | **Architecture Decisions** | **30 ADRs**, each with alternatives, reasoning, trade-offs, risk, and reversibility |

### Security, privacy, and law

| # | Document | What it settles |
|---|---|---|
| [12](12-security-architecture.md) | **Security Architecture** | Threat model, STRIDE analysis, auth, three-layer authorisation, RLS including the pooling trap, encryption, AI-specific security, insider risk, 28 security tests |
| [13](13-privacy-and-legal-risks.md) | **Privacy and Legal Risks** | The third-party-data problem, regulatory landscape, twelve required disclosures, **20 questions requiring counsel**, 18 privacy acceptance criteria |
| [23](23-open-questions.md) | **Open Questions** | 43 open questions, **every one with a recommended default**, plus twelve that block launch |

### Experience design

| # | Document | What it settles |
|---|---|---|
| [14](14-ux-specification.md) | **UX Specification** | Twelve UX principles, information architecture, the evidence overlay, the terminology map, forbidden vocabulary, accessibility, performance budgets |
| [15](15-design-system.md) | **Design System** | Three-layer token architecture, colour/type/spacing/motion scales, 40+ components, depth specs for the three most important, motion and accessibility contracts |
| [wireframes/](wireframes/README.md) | **UI Wireframes** | 20 screen specifications with ASCII wireframes, all four states, copy strings, keyboard maps, and acceptance criteria |
| [diagrams/](diagrams/README.md) | **Architecture Diagrams** | 15 standalone Mermaid diagrams, complete system to deployment |

### Quality

| # | Document | What it settles |
|---|---|---|
| [16](16-testing-strategy.md) | **Testing Strategy** | Eleven test layers, named suites, the deterministic fake-provider harness, **29 release gates**, DB-1–DB-12 constraint tests, failure injection |
| [17](17-ai-evaluation-framework.md) | **AI Evaluation Framework** | 13 evaluation datasets (including the legal-domain entailment set), 28 precisely-defined metrics, calibration validation, the feedback loop, anti-goals |
| [18](18-red-team-risks.md) | **Red Team Risks** | **30 failure modes** with impact, probability, layered mitigation, testing, and residual risk; monitoring thresholds; and how each risk shaped a product decision |

### Delivery and business

| # | Document | What it settles |
|---|---|---|
| [19](19-roadmap.md) | **Roadmap** | Eleven phases with objectives, features, dependencies, acceptance criteria, tests, and risks |
| [22](22-development-plan.md) | **Development Plan** | Repo layout, tooling, CI, team scenarios, timeline with Gantt, critical path, AI-agent working rules, launch readiness |
| [epics/](epics/README.md) | **Epics and Tasks** | 20 epics broken into individually-executable tasks with acceptance tests, dependencies, and estimates |
| [20](20-business-model.md) | **Business Model** | **Deliberately contains no invented prices.** Cost stack, pricing framework, unit economics, the 14 measurements required before pricing is set |
| [21](21-competitive-analysis.md) | **Competitive Analysis** | Researched landscape, positioning map, honest differentiation assessment, competitive threats over 24 months |

### Research and reconciliation

| # | Document | What it settles |
|---|---|---|
| [research-technical-best-practices.md](research-technical-best-practices.md) | **Technical Research** | External research on RAG, citation verification, document intelligence, entity resolution, queues, security standards, provider data handling, evidence integrity |
| [research-amendments.md](research-amendments.md) | ⚠️ **Post-Research Amendments** | **Read before implementing.** Twelve amendments plus eleven do-not-do items that correct or strengthen the specs |
| [21](21-competitive-analysis.md) | **Competitive Analysis** | See above |

### Test fixtures

| Path | Contents |
|---|---|
| [sample-case/README.md](sample-case/README.md) | The fictional matter: 20 documents, 14 timeline events, 3 allegations, 3 contradiction findings, the financial ledger, and the deliberate test hooks |
| [sample-case/personas-and-cast.md](sample-case/personas-and-cast.md) | The cast with explicit forbidden extractions |
| [sample-case/documents/](sample-case/documents/) | The fixture documents with gold extraction notes |
| `sample-case/gold-*.json` | Machine-readable gold labels for evaluation |

---

## The five things that matter most

If you read nothing else, read these. Everything else elaborates them.

### 1. Seven assertion classes, never mixed

`SOURCE_EXCERPT` · `EXTRACTED_FACT` · `ALLEGATION` · `PARTY_POSITION` · `USER_STATEMENT` ·
`AI_INFERENCE` · `LEGAL_INTERPRETATION`

A pleading's assertion must never become an `EXTRACTED_FACT`. That transition is **forbidden by
design** and prevented by a database `CHECK` constraint. → `01` §4, `09` §1

### 2. The no-unsupported-assertion guarantee is structural

Citations are **indices into a system-supplied bundle**, so a fabricated citation is
*unrepresentable*. `VerifiedAssertion` is the only renderable type, and only the verification step
can construct it. A `CHECK` constraint requires a citation for citation-requiring classes.
→ `07` §6, `09` §4 and §7

### 3. One database makes provenance consistent

Text, vectors, graph edges, permissions, and audit all live in PostgreSQL. Deleting a chunk deletes
its embedding in the same transaction. Permission filtering is inside the similarity query. The
alternative — multiple stores — makes every deletion, correction, and permission change a
distributed-consistency problem. → `06` §6.1, ADR-004

### 4. Abstention is a feature, and the product is honest about coverage

"The uploaded case materials do not establish this" is a first-class, designed, *scored* output with
its own UI treatment and API shape. Coverage gaps are displayed, not hidden. OCR-derived figures
carry a persistent caveat into every export. → `07` §6.5, `14` §3.3, `08` §9

### 5. Two modules ship late on purpose

The **financial module** waits for balance-arithmetic verification (ADR-024). The **contradiction
engine** waits for attribution precision ≥0.97 (ADR-025). Both are high-value. Both are
high-consequence if wrong. A misread dollar amount or a false accusation of inconsistency is worse
than a missing feature.

---

## The build order, in one line

```
Foundation (RLS, audit) → Ingestion → Citations → Timeline → AI assistant → Contradictions → Brief
   cannot be                highest      build the      the         verification    precision-   the
   retrofitted              risk         substrate      centrepiece  backstop       gated        growth loop
```

**Citations (Phase 3) precede AI generation (Phase 5).** This is the reverse of the instinct to get
a demo working, and it is what makes the core guarantee structural. → `05` §7, `19` §0

---

## Honest limitations of this specification set

Stated so they are not mistaken for completeness:

| Limitation | Detail |
|---|---|
| **No code exists** | Nothing here has been validated by running. Some specs will prove wrong in contact with reality. |
| **Extraction quality is unmeasured** | Every quality target in `17` is a *target*, not a result. The verifier in particular is assumed to work and has not been measured (see A10). |
| **Legal questions are unanswered** | Twelve items in `23` block launch. They require counsel, not engineering. |
| **No prices** | `20` deliberately contains no price points. They cannot be set before the p95 cost curve is measured. |
| **OCR behaviour is estimated** | Born-digital gating and cloud-OCR fallback are designed but not benchmarked on a real corpus. |
| **A date discrepancy exists** | `21-competitive-analysis.md` documents that several primary sources carry dates later than the stated research date. Resolve which calendar context is authoritative before using that document for planning. |
| **Cost model is a framework** | Every `c_*` in `20` §2.2 is marked TO BE MEASURED. |
| **Two amendments are contested** | A2 (reranking) and the graph-at-scale question are flagged CONTESTED and must be settled by measurement. |
| **The fixture set is still being completed** | `16` §5.1 enumerates exactly what `sample-case/` must contain; dependent test suites are marked *incomplete* until it is finished. |

---

## What research changed

Four findings from the research pass materially altered the specifications. Recorded here so a reader
does not rediscover them:

| Finding | Consequence |
|---|---|
| **"AI chronology with citations" already ships in at least five products** | The differentiator was restated from *having the feature* to *enforcing the guarantee*. See `01` §8.1. |
| **A self-represented litigant was personally sanctioned over an AI-assisted filing** | The filer is responsible for accuracy regardless of who or what produced it. This raises the value of the citation guarantee and the cost of one publicised error. See `18` RT-13. |
| **Self-represented litigants skew toward family matters and low income** | Pricing must reach a low-ability-to-pay buyer or the mission is priced away. See `23` Q-T06 and `20` §6.2. |
| **Court procedural requirements are mechanical, checkable, and built by nobody** | A candidate Phase 2 feature. See `23` Q-T07. |

**Two corrections were also made to earlier assumptions:**

- A contradiction-detection product *does* ship and is law-firm-adopted. The premise that this was
  open ground was wrong; the open ground is publishing a **measured precision figure**.
- The e-discovery category answers the hallucination objection two mutually exclusive ways —
  citation-grounded AI versus determinism plus audit trail. **Nobody does both.** Our architecture
  does both by construction: citations *and* an immutable, hash-chained audit trail over WORM
  originals.

---

## Consistency rules for editors

Any change to these documents must respect:

1. **`01-product-vision.md` wins conflicts.** If another document contradicts it, that document has a bug.
2. **`research-amendments.md` wins over numbered specs** until the spec is updated in the same PR as the code.
3. **Numbered documents keep their numbers.** New material goes into an existing document or a new
   unnumbered one. Renumbering breaks every cross-reference in the set.
4. **Feature IDs (F-nn) are stable.** Other documents reference them.
5. **ADR IDs are stable and append-only.** A superseded ADR is marked superseded, never deleted.
6. **Every claim of a guarantee must name its mechanism.** A guarantee without an enforcing
   constraint, type, or test is a wish.
7. **Copy must pass the forbidden-vocabulary lint** in `14-ux-specification.md` §5.3.
8. **No invented prices, benchmarks, citations, or compliance claims.** Mark unknowns as unknown.

---

## Recommended next engineering task

**→ `epics/EPIC-003-data-layer-rls-and-audit.md`, tasks T01–T04.**

Concretely, the first three tasks:

1. **EPIC-003-T01** — Monorepo scaffold, TypeScript strict, linting, and CI skeleton, with the
   boundary rule that only `packages/ai` may import a vendor SDK.
2. **EPIC-003-T02** — `docker compose` bringing up Postgres+pgvector, MinIO, Mailpit, ClamAV, the
   app, and the worker, with a documented one-command start and the seed script producing the
   `sample-case` matter.
3. **EPIC-003-T03** — The `users`, `organizations`, `matters`, `matter_members`, and `audit_log`
   migrations **with their RLS policies in the same migration**, plus the CI check that every table
   carrying a `matter_id` has `ENABLE` + `FORCE ROW LEVEL SECURITY` and at least one policy.

**Why this and not something more visible:** these three tasks establish the two things that cannot
be retrofitted — tenant isolation and append-only audit — and they prove the development environment
a non-engineer can actually run. Everything else in the roadmap sits on top of them.

**Definition of done for the first task:**
`pnpm install && docker compose up && pnpm test` succeeds from a clean checkout with no cloud
accounts and no API keys, and the RLS isolation test (set tenant A, return the connection, check it
out again, assert zero rows) passes.

See `22-development-plan.md` §10 for the working rules when handing tasks to a coding agent, and
`epics/README.md` for the full execution order.

---

## Document status

| Field | Value |
|---|---|
| Documents | 24 numbered specifications + 2 research documents + README |
| Total specification volume | ~180,000 words across all files |
| Status | Draft — pending internal review and legal/privacy counsel review |
| Blocking reviews | Privacy counsel (Q1–Q6), UPL opinion, penetration test (Phase 8) |
| Next gate | Phase 0 exit: legal engagement, provider selection, MVP scope sign-off |
