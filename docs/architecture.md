---
title: Case IQ — Architecture Overview
status: draft
owner: Architecture
last_updated: 2026-02-14
version: 1.0
---

# Architecture (root pointer)

The full architecture specification lives in `product/06-system-architecture.md`. This file is a
short orientation for anyone arriving at the repository root.

> **This repository currently contains specifications only.** No application code has been written.
> That is deliberate: the provenance model, the tenancy model, and the citation mechanism cannot be
> retrofitted, and building them wrongly is the most expensive mistake available to this project.

---

## What Case IQ is

A legal case organisation and case-understanding platform. It turns a chaotic pile of legal
documents into an organised, evidence-linked workspace so a person can understand their own matter
and explain it clearly to a lawyer.

**The core guarantee:** every assertion the system shows a user is traceable to the exact place in
the uploaded evidence that supports it — or it is not shown as a fact at all.

**The product is explicitly not a lawyer.** It organises, connects, summarises, preserves, and
communicates. It never advises, never predicts, and never judges a person's credibility.

---

## The seven assertion classes

The vocabulary the whole product speaks (`product/01-product-vision.md` §4,
`product/09-evidence-provenance.md` §1):

| Class | Meaning |
|---|---|
| `SOURCE_EXCERPT` | What a document actually says, verbatim |
| `EXTRACTED_FACT` | A fact drawn from a source span |
| `ALLEGATION` | A claim made by a party |
| `PARTY_POSITION` | A party's characterisation, denial, or admission |
| `USER_STATEMENT` | The account given by our user |
| `AI_INFERENCE` | A conclusion the system derived |
| `LEGAL_INTERPRETATION` | Requires professional judgement — never resolved by us |

**These are never silently mixed.** A pleading's assertion must never become an `EXTRACTED_FACT`.
That transition is forbidden by design and enforced by a database constraint.

---

## The stack in one table

| Layer | Choice | Why (short version) |
|---|---|---|
| Language | TypeScript (strict) | One type contract from DB to UI; best-supported by AI coding agents |
| Web + API | Next.js App Router | One deployment; server components for data-heavy screens |
| API style | REST + Zod + OpenAPI | Inspectable, testable, implementable by agents |
| Database | PostgreSQL 16 + pgvector | **One store** → provenance consistency is structural, not a sync job |
| Search | `tsvector` + pgvector + RRF | Legal text is lexically dense; hybrid is a correctness requirement |
| Graph | Relational edges + recursive CTEs | Bounded shallow traversals; no second datastore to keep consistent |
| Storage | S3-compatible + Object Lock | WORM immutability for originals |
| Queue | pg-boss (Postgres) | Transactional enqueue; no Redis to operate |
| Auth | Self-hosted, opaque sessions | Immediate revocation; identity data stays in our database |
| AI | Provider abstraction, 2 providers | Tier 2 verification needs an **independent** model |
| Workers | Long-lived container | OCR and long jobs do not fit serverless |
| Web host | Vercel | Purpose-built for Next.js |

Full reasoning, alternatives, and trade-offs: `product/06-system-architecture.md` and
`product/24-architecture-decisions.md` (30 ADRs).

---

## Why one database

The product's promise is consistency of provenance. If document text lives in PostgreSQL, vectors
in a vector database, and graph edges in a graph database, then every deletion, permission change,
and correction becomes a distributed-consistency problem — and the failure modes are precisely the
ones a legal product cannot have:

- a deleted document's embedding still retrievable
- a search snippet from a document the user cannot see
- a citation pointing at a page that no longer exists

One transactional store makes these guarantees structural. Deleting a chunk deletes its embedding
in the same transaction. Permission filtering is a `WHERE` clause inside the similarity query. A
citation cannot reference a page that does not exist.

**Trade-off accepted:** pgvector is slower than a purpose-built vector engine at very large scale,
and PostgreSQL is not a graph database. Neither matters below roughly 10⁷ chunks and 10⁶ edges.
Revisit with measurements, not speculation.

---

## The three guarantees and their mechanisms

| Guarantee | Mechanism | Not a mechanism |
|---|---|---|
| No unsupported assertion reaches a user | Citations are **indices** into a system-supplied bundle; the output schema requires ≥1; `VerifiedAssertion` is the only renderable type; a `CHECK` constraint requires a citation for citation-requiring classes | Asking the model to be careful |
| A quote in a citation is real | Tier 1 deterministic normalised substring match against the stored page text | A model's self-report |
| A quote actually supports its claim | Tier 2 entailment on a **different** model/provider | The generator checking its own work |

Plus: `ai_extractions` is append-only at the role level, the audit log is hash-chained, and originals
are WORM-protected.

---

## Build order (the critical path)

```
Phase 0  Research & architecture        ← specifications (this repo state)
Phase 1  Foundation                     ← auth, tenancy, RLS, audit   [cannot be retrofitted]
Phase 2  Ingestion                      ← upload, extract, OCR        [highest-risk subsystem]
Phase 3  Search & citations             ← build the citation substrate BEFORE any generation
Phase 4  Timeline & entities            ← the product's centrepiece
Phase 5  AI assistant                   ← grounded chat + two-tier verification
Phase 6  Contradictions & allegations   ← Phase 2 feature; precision-gated
Phase 7  Story builder & Lawyer Brief   ← the growth loop
Phase 8  Security hardening             ← pen test + DPIA + counsel sign-off [release-blocking]
Phase 9  Beta                           ← 10 design partners on real matters
Phase 10 Money, graph, teams            ← professional tier
```

**The most important sequencing decision:** citations (Phase 3) precede AI generation (Phase 5).
This is the reverse of the instinct to get a demo working, and it is what makes the core guarantee
structural rather than a promise.

---

## Legal and privacy position

- **Counsel engagement is required before launch, and its answers are launch blockers**
  (`product/13-privacy-and-legal-risks.md` §10, Q1–Q6).
- **No compliance claim, certification claim, or admissibility claim** appears anywhere until it has
  been independently verified and reviewed.
- **Chain of custody is described honestly**: we record SHA-256 hashes and immutability, and we do
  not claim this proves admissibility.
- **No audio/video transcription** until a separate DPIA and consent design exists (ADR-029).
- **No feature that infers a person's credibility, emotion, or truthfulness will ever be built.**
  This is a permanent scope boundary, recorded so it cannot be added later by someone who has not
  read the analysis.

---

## Where to start reading

| If you are… | Start here |
|---|---|
| A product person | `product/01-product-vision.md`, then `product/03-user-journeys.md` |
| An engineer about to build | `product/05-mvp-scope.md` §7, then `product/epics/README.md` |
| Working on AI | `product/07-ai-architecture.md`, then `product/09-evidence-provenance.md` |
| Working on ingestion | `product/08-document-ingestion.md` |
| Working on security | `product/12-security-architecture.md` |
| Working on UI | `product/14-ux-specification.md`, then `product/15-design-system.md` |
| Testing or evaluating | `product/16-testing-strategy.md`, `product/17-ai-evaluation-framework.md` |
| Worried about what could go wrong | `product/18-red-team-risks.md` |
| Legal or privacy | `product/13-privacy-and-legal-risks.md`, `product/23-open-questions.md` |
| Setting pricing | `product/20-business-model.md` (deliberately contains no invented prices) |
| Reviewing decisions | `product/24-architecture-decisions.md` |
| Needing a test fixture | `product/sample-case/README.md` |

**Master index:** `product/README.md`

---

## Repository status

```
docs/
  product/          ← 24 numbered specifications + research + wireframes + diagrams + epics
                    ← sample case dataset with gold labels
  architecture.md   ← this file

No application code exists yet.
```

The next engineering task is defined at the end of `product/README.md`.
