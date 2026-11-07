---
title: Case IQ — Product Vision
status: draft
owner: Product
last_updated: 2026-02-14
version: 1.0
---

# 01 — Product Vision

> **Read this first.** This document defines the vocabulary and the non-negotiable
> principles that every other specification in this directory must obey. If a later
> document appears to contradict this one, this one wins and the other document has a bug.

---

## 1. One-sentence definition

**Case IQ turns a chaotic pile of legal documents into an organised, evidence-linked case
workspace, so that a person can understand their own matter and explain it clearly to a
lawyer.**

## 2. The problem

Legal matters generate paper faster than people can read it. A single family, employment,
criminal, or civil matter routinely produces hundreds to several thousand pages:

| Source | Typical volume | Why it is hard |
|---|---|---|
| Court filings and endorsements | 10–200 docs | Procedural, repetitive, date-heavy |
| Disclosure / discovery | 200–5,000 pages | Unsorted, non-chronological, partly duplicative |
| Police records, notes, occurrence reports | 50–800 pages | Abbreviations, redactions, third-party hearsay |
| Witness statements / affidavits | 5–100 docs | Contradict each other across versions |
| Emails | 100–10,000 messages | Threading, attachments, quoted replies |
| SMS / WhatsApp exports | 500–50,000 messages | No structure, no timestamps on some exports |
| Bank statements / ledgers | 12–120 statements | Line-item density, amounts easily misread |
| Contracts, expert reports, regulatory records | 5–50 docs | Long, technical, cross-referencing |

The result is four distinct failures:

1. **Comprehension failure.** The person cannot hold the matter in their head. They know
   something is wrong, or they know they are innocent, but they cannot *show* it.
2. **Communication failure.** They cannot brief their own lawyer efficiently. Billable hours
   are burned on the lawyer reading what the client already knows.
3. **Currency failure.** People work from memory and a few highlighted PDFs. They miss the
   document that actually matters.
4. **Contradiction blindness.** Inconsistencies between a witness's first and third account
   are buried 400 pages apart and nobody notices until cross-examination.

**Self-represented litigants suffer all four failures with no professional safety net.** That
is the wedge. They are the largest, most underserved, most motivated population in the
system, and the incumbent tooling (enterprise e-discovery priced at five to six figures a
year) is structurally unavailable to them.

## 3. What Case IQ is

Case IQ is an **evidence organisation and comprehension platform**. It ingests raw legal
material, preserves where every statement came from, and builds a structured, navigable,
source-linked model of the matter.

### 3.1 It answers ten questions

These are the product. Every feature must trace to at least one of them.

| # | Question | Primary surface |
|---|---|---|
| 1 | What happened? | Case Overview, Story Builder |
| 2 | When did it happen? | Master Timeline |
| 3 | Who was involved? | People, Organizations |
| 4 | What evidence supports each event? | Evidence View, citations everywhere |
| 5 | Which facts are disputed? | Allegation Matrix |
| 6 | Where do witnesses contradict themselves? | Contradiction Engine, Statement Evolution |
| 7 | What documents support or contradict each allegation? | Allegation Matrix |
| 8 | What evidence is missing? | Missing Evidence panel, Gap Analysis |
| 9 | What questions should be investigated further? | Investigation Questions |
| 10 | What should the lawyer know first? | Lawyer Brief |

### 3.2 It is not

- ❌ **Not a lawyer.** It does not advise, does not predict outcomes, does not tell anyone
  what to do legally.
- ❌ **Not a legal research tool.** It does not answer "what does the law say." It answers
  "what does *your evidence* say."
- ❌ **Not an advocate.** It does not argue, persuade, or build a case *for* a side. It
  organises and describes.
- ❌ **Not a judge of credibility.** It never declares a person guilty, innocent, truthful,
  dishonest, or lying.
- ❌ **Not a document generator for filing.** It produces a brief *for a lawyer*, not a
  court filing.
- ❌ **Not a replacement for disclosure obligations.** It does not advise on what must be
  produced.

### 3.3 The five verbs

Case IQ does exactly five things. Anything that is not one of these is out of scope.

**ORGANISE** — turn an unmanaged file dump into a structured, deduplicated, classified library.
**CONNECT** — find the relationships between documents, people, money, and time.
**SUMMARISE** — compress a 400-page record into something a human can read in ten minutes.
**PRESERVE** — keep the provenance of every statement, immutably, verifiably.
**COMMUNICATE** — help the user hand their lawyer something a lawyer can actually use.

## 4. The core principle: five kinds of statement

This is the single most important idea in the product and it is enforced in the database
schema, not in a prompt.

Users, lawyers, and courts treat different kinds of statements completely differently. Most
AI tools collapse them into one confident-sounding voice. **Case IQ never does.**

The canonical model recognises **seven assertion classes**, grouped into five conceptual
layers. (Seven is the implementation enumeration; five is the conceptual story we tell users.
See `09-evidence-provenance.md` §3 for the full enumeration and `10-database-schema.md`
for the enforcement mechanism.)

| Conceptual layer | Assertion class | Meaning | Example |
|---|---|---|---|
| **WHAT THE RECORD SAYS** | `SOURCE_EXCERPT` | Verbatim text from a document. Untouched. | "I first learned of the transfer in March 2023." |
| | `EXTRACTED_FACT` | A normalised factual statement drawn from a source. | "Witness A said they learned of the transfer in March 2023." |
| **WHAT A PARTY ALLEGES** | `ALLEGATION` | A claim made by a party in the proceeding. | "The defendant used investor funds for personal expenses." |
| | `PARTY_POSITION` | A party's characterisation, denial, or admission. | "The defendant denies the funds were used personally." |
| **WHAT THE USER CLAIMS** | `USER_STATEMENT` | The account given by our user. Not evidence unless supported. | "I never signed that document." |
| **WHAT THE AI INFERS** | `AI_INFERENCE` | A conclusion the system derived from evidence. | "These statements appear inconsistent as to timing." |
| **WHAT REMAINS UNKNOWN** | `LEGAL_INTERPRETATION` | Requires professional legal judgement. Always flagged, never resolved. | "Whether this constitutes a breach of s. 12 is a question for counsel." |

### 4.1 The four rules that follow

1. **Classes are never silently mixed.** Every statement in the UI carries a visible class
   badge. A summary that merges an allegation into a fact is a defect of the highest severity.
2. **Every AI-generated statement is traceable or suppressed.** If the system cannot point to
   the source span that supports a statement, the statement is not shown as content — it is
   shown as `NOT ESTABLISHED`.
3. **The user's own account is never laundered into evidence.** `USER_STATEMENT` renders
   differently from `EXTRACTED_FACT` and the distinction survives every export.
4. **Abstention is a feature, not a failure.** "The uploaded case materials do not establish
   this" is a correct, valuable, trust-building output. It is instrumented and celebrated
   internally, not treated as an error.

### 4.2 The concrete user-visible payoff

> A user asks: *"Did Michael Chen know about the transfer before March?"*
>
> **A generic chatbot says:** "Based on the documents, it appears Michael Chen was aware of
> the transfer earlier than he claims." — Unsupported. Useless to a lawyer. Potentially
> dangerous.
>
> **Case IQ says:**
> *"The uploaded case materials contain two statements relevant to this question. They appear
> inconsistent as to timing.*
> *• **MEDIUM confidence — extracted fact.** Michael Chen stated at an interview on
> 2024-02-14 that he first learned of the transfer in March 2023.
> [Disclosure Vol. 3, p. 412] [view source]*
> *• **HIGH confidence — source excerpt.** An email dated 2023-01-19 from
> m.chen@northgate-holdings.example to d.okafor@… discusses 'the Northgate transfer' and asks
> for confirmation of the receiving account. [Disclosure Vol. 7, p. 88] [view source]*
> *These statements appear inconsistent as to when Michael Chen first learned of the transfer.
> Possible explanations that the evidence does not resolve include: the email may refer to a
> different transaction; the interview statement may be inaccurate as to date; the January
> email may have been sent by another person using the same account.*
> *The materials do not establish what Michael Chen knew, or when.*
> *[Flag for investigation] [Send to lawyer]"*

That answer is *worth paying for* precisely because it refuses to overclaim. It is the
product.

## 5. Who it serves

Detailed personas live in `02-user-personas.md`. In priority order:

| Priority | Persona | Why |
|---|---|---|
| **P0** | **Self-represented litigant (SRL)** | Largest underserved population, highest motivation, willing to pay per matter, no procurement cycle |
| **P1** | **Individual client working with a lawyer** | Same product, different output emphasis (prepare, then hand over) |
| **P2** | **Solo/small-firm lawyer or paralegal** | Pays more per seat, harder to acquire, demands accuracy; also receives SRL referrals |
| **P3** | **Legal team / firm collaboration** | Multi-user, ethical walls, audit. Later phase. |

The strategic insight: **build for P0, and P2 arrives through the Lawyer Brief.** Every SRL
who generates a lawyer brief is a warm introduction to a lawyer. That is the growth loop, and
it is why the brief must be excellent from the MVP.

## 6. Product principles

These resolve design arguments. Number them in review meetings.

1. **Provenance over polish.** A plain screen with a working citation beats a beautiful screen
   with a broken one.
2. **Show the source, always, in one click.** Never a second click to get to the page.
3. **Say "not established" rather than guess.** Abstention is scored as a success.
4. **Describe, never characterise.** "These statements appear inconsistent" — never "he lied."
5. **The user owns the final narrative.** AI drafts; the human edits, approves, and owns.
6. **Never silently overwrite.** Corrections are additive and versioned.
7. **Progressive disclosure.** The first screen shows three things, not thirty. Power is
   discovered, not dumped.
8. **Plain English by default.** No "documents," no "entities," no "matter" on consumer
   surfaces — say "papers," "people," "your case." Legal terminology appears only where a
   lawyer would need it. See `14-ux-specification.md` §6 for the terminology map.
9. **Original evidence is immutable.** We never modify an uploaded file. Ever.
10. **The system is honest about its own limits.** Confidence is ordinal, coverage gaps are
    shown, and "we could not read this page" is displayed, not hidden.
11. **Processing is visible.** A user watching a 900-page disclosure upload must always know
    what is happening and what remains.
12. **No dark patterns about legal risk.** We never imply better outcomes to drive conversion.

## 7. North-star and supporting metrics

| Metric | Definition | Why |
|---|---|---|
| **North star: Time to First Defensible Chronology (TTFDC)** | Median elapsed time from first upload to a user-approved timeline event that carries a verified citation | It is the moment the product proves it works, and it is the fastest path to value |
| **Citation integrity rate** | % of displayed AI assertions whose cited span verifiably supports the claim | The core trust guarantee; target ≥ 99.5%, measured continuously |
| **Unsupported-assertion escape rate** | Count of assertions reaching the UI with no verified citation | Must be **zero**; a non-zero value is a Sev-1 bug |
| **Correction rate** | % of AI extractions the user corrects | High is not automatically bad — it measures engagement and where quality is weak |
| **Brief export rate** | % of active cases that generate ≥ 1 Lawyer Brief | The growth loop |
| **Abstention rate** | % of chat answers that correctly return "not established" | Tracked as a *quality* signal, not a failure |
| **Processing success rate** | % of documents reaching READY without manual intervention | Ingestion health |
| **Cost per matter** | Blended inference + OCR + storage cost per active case | Unit economics viability |

## 8. Ten-year positioning

Near term, Case IQ is a **case organiser for people who cannot afford a legal team to organise
for them.**

Medium term, it becomes the **evidence layer** that sits underneath legal work: the
provenance graph and citation ledger that any legal AI — ours, a firm's, or a regulator's —
can query and trust.

Long term, the durable asset is not the model. Models commoditise. The durable asset is a
**verifiable evidence graph with enforced provenance semantics**, and the trust that comes
from years of refusing to assert things the record does not support.

That is why the provenance model in §4 is the product's constitution rather than a feature.

### 8.1 The honest competitive position

Research (`21-competitive-analysis.md`, conducted 2026-02-14) forces a correction to an earlier
assumption. **"AI-built chronology with clickable citations" is no longer a novel feature.** It
ships today in Casefleet, Clio Work, Everlaw Storybuilder, Filevine MedChron, and Wexler.ai. Any
positioning that rests on *having* the feature is indefensible.

What the same research shows is that the **guarantee behind the feature is not met by the
incumbents.** A peer-reviewed evaluation of commercial legal AI found leading legal research
products hallucinating on a substantial share of queries — against explicit "hallucination-free"
marketing. That is the gap:

| Claim | Defensible? | Why |
|---|---|---|
| "We build a cited chronology" | ❌ | Commoditised. Five or more products ship it. |
| "We organise your record" | ❌ | Commoditised. |
| **"We will not assert something your documents do not support, and we enforce that in the data model rather than in a prompt"** | ✅ | Incumbents instruct grounding; we make an unsupported assertion **unrepresentable and unrenderable**. |
| **"We admit what we could not read, could not find, and could not resolve"** | ✅ | Coverage disclosure and first-class abstention are rare, and they are trust signals for an audience that has been burned. |
| **"We built it for one person with 3,000 pages and no lawyer"** | ✅ | Every grounded-chronology product is sold per seat to firms, priced for billable-hour economics, and assumes professional-grade inputs. |
| **"Every transaction row carries its page and its quote"** | ✅ | No tracing tool surveyed markets per-transaction source citation as a feature. |
| **"We help you *comply* with the court's AI and filing rules"** | ✅ | No surveyed product builds the court-compliance layer: mandated AI-use verification, authoritative-citation hyperlinking, document naming protocols, page limits, and bundle order. Courts are now explicit that **the filer is responsible for accuracy regardless of who or what produced the content, with inadvertence no excuse** — and in at least one Canadian decision a *self-represented litigant* was personally sanctioned. |
| **"We publish our false-positive rate rather than claiming accuracy"** | ✅ | No contradiction-detection product publishes a measured accuracy figure. Publishing a measured precision number, and refusing to publish one we have not measured, is itself differentiating. |

**The durable differentiator is the enforcement, not the feature list.** A competitor can copy a
timeline in a quarter. Making the *absence* of support a structural property of the type system,
the schema, and the render path is a design commitment that changes what a company is willing to
ship — and it is much harder to retrofit onto a product that already renders prose.

**The most serious competitive threat is not an e-discovery vendor; it is an incumbent case
management platform adding matter analysis for small firms** — because it already owns the
professional distribution and could add a consumer tier. The mitigation is not to be faster at
features. It is to be **more trustworthy than a platform whose incentive is to sound confident**,
and to own the audience that platform is not built to serve.

## 9. What would make this fail

Stated plainly so the team can watch for it:

| Failure mode | Early signal | Mitigation owned by |
|---|---|---|
| AI asserts something the record does not support | Citation integrity rate < 99.5%; any unsupported-assertion escape | `17-ai-evaluation-framework.md`, `18-red-team-risks.md` |
| Users cannot get past upload | Onboarding completion < 60% at step 5 | `03-user-journeys.md`, `14-ux-specification.md` |
| Ingestion cannot handle real-world files | READY rate < 90% | `08-document-ingestion.md` |
| Unit economics collapse on 2,000-page matters | Cost per matter > 3× plan price | `20-business-model.md` |
| Incumbent adds the wedge feature | Clio/Casefleet ships AI chronology with citations | `21-competitive-analysis.md` |
| Regulatory action on UPL | Consumer-marketing language implying advice | `13-privacy-and-legal-risks.md` |
| Trust destroyed by one publicised error | A user files a court document containing a hallucinated "fact" | `18-red-team-risks.md` |

## 10. Scope boundaries

**In scope forever:** ingest → organise → connect → summarise → preserve → communicate.

**Explicitly out of scope (permanent):**

- Providing legal advice or opinions on legal merit
- Predicting case outcomes
- Drafting court filings for submission
- Legal research against statutes and case law
- Practising as, or substituting for, a lawyer
- Determining credibility or guilt
- Advising on disclosure or discovery obligations
- Representing users before any tribunal

**Explicitly deferred (see `05-mvp-scope.md` and `19-roadmap.md`):** audio/video transcription,
real-time collaboration, mobile applications, e-discovery-grade predictive coding, litigation
hold management, billing/timekeeping, court e-filing integration.

---

## Related documents

- `02-user-personas.md` — who this is for, in detail
- `03-user-journeys.md` — the paths through the product
- `04-feature-specification.md` — the features that implement this vision
- `09-evidence-provenance.md` — the mechanics of the core principle in §4
- `13-privacy-and-legal-risks.md` — the boundaries in §3.2 and §10 as risk controls
- `23-open-questions.md` — the decisions this document deliberately leaves open
