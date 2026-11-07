---
title: Case IQ — Post-Research Amendments
status: draft
owner: Architecture & AI Systems
last_updated: 2026-02-14
version: 1.0
supersedes: nothing
amends: 06, 07, 08, 09, 11, 12, 13, 16, 17, 18, 20, 24
---

# Post-Research Amendments

The companion research document (`research-technical-best-practices.md`) was produced **after** the
core specifications were drafted. It validated most of the architecture and surfaced **eleven
material amendments**, several of which are corrections rather than additions.

This file exists so those findings are actionable rather than buried in a 19,000-word research
document. **Each amendment states what changes, which spec it affects, and what the engineering
consequence is.**

> **Status:** these amendments are **accepted as the specification of record** unless marked
> CONTESTED. Where marked CONTESTED, the original spec stands until measured evidence arrives
> (see `17-ai-evaluation-framework.md`).
>
> Anyone implementing an affected feature must read this file first. Where this file and a numbered
> spec disagree, **this file wins** until the numbered spec is updated.

---

## Summary table

| # | Amendment | Affects | Severity | Status |
|---|---|---|---|---|
| A1 | Tier 1 verification matches against **original file bytes**, not extracted text alone | 07, 09 | **Critical — correctness** | Accepted |
| A2 | **Reranking is not load-bearing** until it beats *tuned* fusion on held-out queries | 07 | High — cost & complexity | **CONTESTED** |
| A3 | Handle the **citations-vs-structured-output** provider incompatibility explicitly | 07 | High — architectural | Accepted |
| A4 | **Dual-read numeric extraction**; disagreement ⇒ `UNKNOWN`, never an average | 08, 09 | **Critical — money** | Accepted |
| A5 | Tag **structural origin** of every text fragment; **never cite zero-visibility text** | 08, 07 | High — integrity & injection | Accepted |
| A6 | **Anchor the audit-log head hash externally**; log reads as well as writes | 12 | High — trust | Accepted |
| A7 | **Per-tenant data-encryption keys** under KMS (envelope encryption) | 12 | Medium | Accepted |
| A8 | Idempotency cache keyed on `sha256(model ‖ params ‖ promptVersion ‖ input)` | 06, 11 | Medium — cost | Accepted |
| A9 | **Do not optimise citation precision alone** — track usefulness and correctness | 17 | **Critical — product** | Accepted |
| A10 | **The verifier is the weakest link**; measure it on a legal-domain entailment set | 17, 18 | **Critical — trust** | Accepted |
| A11 | **Lawyer-facing first is a legitimate strategic option**; UPL risk largely dissolves when the user is a licensee | 05, 20, 23 | High — strategy | Accepted as an option |
| A12 | Storage in a Canadian region with **specific disclosure of US inference processing** | 13, 20 | High — marketing accuracy | Accepted |

---

## A1 — Tier 1 verification must match against original file bytes

**What changes.** `09-evidence-provenance.md` §6 specifies Tier 1 as a normalised substring match
against **stored page text**. That is correct for catching fabricated quotes, but it inherits any
error introduced during extraction — and critically, it means a quote that was *never actually on the
page* could pass if extraction hallucinated or mangled the text.

**Amendment.** Quote verification must additionally verify against the **original file's bytes**,
normalised but unmodified, at the recorded offsets — not only against the pipeline's own extracted
text. The pipeline's text is a derived artefact; the original is the evidence.

**Affected specs.** `07-ai-architecture.md` §6.3 (Tier 1 description),
`09-evidence-provenance.md` §6.2 (matching algorithm), §5.4 (citations table).

**Engineering consequence.**
1. Add a verification path that reads the original object and re-extracts the cited region
   independently of the primary extraction run.
2. Record which source was used: `verified_against: 'extracted_text' | 'original_bytes' | 'both'`.
3. A mismatch between the two is itself a signal — it means extraction altered the text, which is a
   **pipeline defect**, and must be logged as a quality event, not silently resolved.
4. Bonus: this defeats a whole class of injection attack where a fabricated quote is planted in a
   derived artefact.

**Why it matters.** This is a free, deterministic control that catches both hallucinated quotes *and*
extraction corruption. It closes a real hole in the strongest layer of the guarantee.

**Priority:** do this in Phase 3 (with F16), not Phase 5.

---

## A2 — Reranking is not load-bearing until it beats tuned fusion — CONTESTED

**What changes.** `07-ai-architecture.md` §5.4 treats the cross-encoder reranker as "the single
highest-leverage precision improvement available." Research found this is **contested**:

| Evidence | Implication |
|---|---|
| Reported large gains from reranking | Often measured against an **un-tuned** fusion baseline |
| Held-out validation studies where most reranker gains did **not** survive | The gain may be an artefact of evaluation |
| Tuned fusion beating cross-encoders on some benchmarks | Fusion may already capture the signal |
| Documented token-truncation losses in rerankers (e.g. 512-token windows vs longer real pairs) | Rerankers can silently fail on long legal passages |

**Amendment.** Reranking must pass a **three-step test** before it becomes load-bearing:

1. **Tune fusion first.** Sweep RRF `k` (and consider weighted fusion) on the internal labelled set.
2. **Reranker must beat tuned fusion** on held-out legal queries, measured across split-half draws
   rather than a single split.
3. **Verify the token window** covers the 95th-percentile passage length; fix the tie-break
   deterministically.

If it fails, **remove the reranker and say so**. `07-ai-architecture.md` §5.6 already requires
reporting when a component does not help; this amendment makes that requirement mandatory for the
reranker specifically.

**Also:** never copy an RRF `k` value between systems. `k = 60` is a convention, not a law — some
implementations default to `k = 2`. Record the chosen value and validate it.

**Affected specs.** `07-ai-architecture.md` §5.3–5.4, §5.6; `17-ai-evaluation-framework.md` §5.

**Consequence.** The retrieval interface must allow the reranker to be switched off without a code
change, and the evaluation harness must run the ablation.

---

## A3 — Citations-vs-structured-output provider incompatibility

**What changes.** `07-ai-architecture.md` §6.2 assumes we can combine provider-native citation
features with strict structured output. At least one major provider **rejects the combination**
(returns an error when both are requested together), and its native citations are unavailable on
scanned PDFs — **precisely the source type where a fabricated figure is most likely.**

**Amendment.** Handle the incompatibility deliberately rather than discovering it in production:

1. **Never depend on a provider's native citation feature.** Our citation mechanism is
   index-based (ADR-019) and must work identically across providers and source types.
2. Where a provider offers free-text citations, use them as an **additional** signal, not as the
   mechanism.
3. Where structured output and native citations conflict, **structured output wins** — it is
   load-bearing; native citations are not.
4. For scanned sources with no native citation support, the pipeline still uses the index-based
   mechanism, and the **`ocr_derived` flag plus dual-read numeric extraction (A4)** carry the
   quality burden.

**Affected specs.** `07-ai-architecture.md` §3.1 (provider interface), §6.2.

**Consequence.** Add a capability flag to the provider interface expressing whether native citations
coexist with structured output. Contract-test every provider against it. Re-check provider
documentation quarterly (this is a vendor decision that can change).

---

## A4 — Dual-read numeric extraction

**What changes.** `08-document-ingestion.md` §5.2 mentions digit-confusion heuristics and optional
dual-engine OCR. Research elevates this from optional to **required** for numeric fields.

**Amendment.** Every monetary amount, date, and account number extracted from OCR-derived text gets
**two independent reads**:

| Outcome | Action |
|---|---|
| Both reads agree | Confidence may be HIGH (still capped by the OCR rules in `09-evidence-provenance.md` §2.2) |
| Reads disagree | **`confidence = UNKNOWN`**, the field is flagged, and it is excluded from totals and from any assertion until a human confirms |

Two implementation options, in preference order:
1. **Two independent OCR passes** (different engine, or different preprocessing) over the numeric
   region, compared token by token.
2. **Structural corroboration** where available — the running-balance arithmetic, a repeated total,
   or a cross-document reference.

**Critically: never average, never pick the "more likely" reading.** A disagreement is `UNKNOWN`.

**Affected specs.** `08-document-ingestion.md` §5.2–5.3, §6.5; `09-evidence-provenance.md` §2.2
(confidence caps); `04-feature-specification.md` F32 acceptance criteria.

**Why it is required.** OCR digit confusion creates **false facts that carry apparent citations** —
strictly worse than an uncited hallucination, because the citation makes the error credible. This is
RT-05, and this amendment is the strongest available mitigation.

**Priority:** Phase 3 for the machinery; F32 (financial module) does not ship until it works.

---

## A5 — Structural origin tagging and no citation to zero-visibility text

**What changes.** `08-document-ingestion.md` §4.3 records page text without distinguishing where in
the document a fragment came from. Research identifies this as both an **integrity** and an
**injection** problem: hidden text, off-page text, annotations, and metadata are invisible to a human
reviewer reading the document but **fully visible to the pipeline**.

**Amendment.**

1. **Tag every text fragment with its structural origin**: `body` · `header` · `footer` ·
   `annotation` · `metadata` · `hidden` · `filename` · `attachment_name` · `speaker_note`.
2. **Refuse to cite zero-visibility text.** A citation may only point to text a human reviewer could
   have seen on the page. Hidden or off-page text may inform a *review flag*, but never a citation.
3. **Surface non-body origins to the user.** If an assertion derives from a header, an annotation,
   or metadata, the citation says so plainly ("from the document's properties, not the page text").
4. **Flag hidden text as a security event.** Deliberately hidden text in a legal filing is either
   sloppy formatting or an attack. Either way the user should know.

**Affected specs.** `08-document-ingestion.md` §4.3; `10-database-schema.md` §4.4
(`document_pages`); `07-ai-architecture.md` §9; `18-red-team-risks.md` RT-04.

**Engineering consequence.** Add `structural_origin` to the page/chunk model, add a
`citable boolean` derived from it, and enforce `citable = true` for citation creation as a
database constraint alongside DB-1.

**Why it matters.** "Page 4 says X" when page 4 visibly does not say X is an integrity failure that
destroys the citation guarantee even though every mechanical check passes.

---

## A6 — External audit-log anchoring and read logging

**What changes.** `12-security-architecture.md` §10 and ADR-028 specify a hash-chained audit log.
Research identifies the limit: **a hash chain only detects tampering if the operator is honest** —
an operator who controls both the database and the verification job can recompute the entire chain.

**Amendment.**

1. **Anchor the head hash outside the operator's control on a schedule** (a periodic write to an
   independent timestamping or append-only external service), and **expose the anchored values to
   the tenant** so they can verify independently.
2. **Log reads as well as writes.** For privileged material and for professional users discharging a
   verification duty, "who *viewed* this" is as important as "who changed it".
3. Keep the existing content-free rule — anchored hashes and read events carry identifiers, never
   case content.

**Affected specs.** `12-security-architecture.md` §10; `10-database-schema.md` §14.1;
`04-feature-specification.md` F41.

**Consequence.** Read logging materially increases audit volume; needs partitioning and a retention
policy (already required by Q9 / Q-D04). The anchoring target must be chosen with counsel's input on
what constitutes a credible external anchor.

**Why it matters.** It converts "trust us, the chain is intact" into "here is a value you can
independently verify". That is a genuine differentiator for professional users, and it is cheap.

---

## A7 — Per-tenant data-encryption keys

**What changes.** `12-security-architecture.md` §5.4 specifies a single KMS master with envelope data
keys for secrets. Research recommends **per-tenant data-encryption keys** as the interim step between
"one key" and "field-level encryption" (which ADR-016 correctly rejects).

**Amendment.** Adopt per-tenant envelope encryption for the enumerated secret/non-searchable fields
(MFA secrets, OAuth tokens, account references, share-link material), with keys derived per tenant
under KMS. This gives a customer-managed-key answer to enterprise questionnaires **without** touching
the searchable corpus.

**Affected specs.** `12-security-architecture.md` §5.2–5.4; ADR-016 (which stays correct — case text
remains unencrypted at the field level, and the reasons are unchanged).

**Consequence.** Key-per-tenant management, rotation, and a documented path for tenant key
destruction (which becomes a genuine crypto-shredding option for a subset of data).

---

## A8 — Content-addressed response cache for idempotency

**What changes.** `06-system-architecture.md` §6.4 and `10-database-schema.md` §5.1 use an
idempotency key on `ai_extraction_runs` to prevent duplicate spend.

**Amendment.** Strengthen this to a **content-addressed response cache** keyed on:

```
sha256(model_id ‖ model_params ‖ prompt_version ‖ normalised_input)
```

Persist the model response **before** acting on it.

**Affected specs.** `06-system-architecture.md` §6.4; `07-ai-architecture.md` §10.2;
`10-database-schema.md` §5.1.

**Why it is better.** The existing idempotency key prevents a retry of the *same job* from
double-spending. A content-addressed cache additionally means:
- Two documents containing the identical passage cost one call, not two.
- A prompt change invalidates the cache cleanly (prompt version is in the key).
- A model change invalidates it cleanly (model ID is in the key).
- Re-processing a matter after a UI-only change costs nothing.

**Consequence.** Cache storage grows; needs a retention policy and a size cap. Cache entries are
content — they must follow the same tenant scoping, RLS, and deletion rules as everything else.

---

## A9 — Do not optimise citation precision alone

**What changes.** `17-ai-evaluation-framework.md` and the metrics in `01-product-vision.md` §7
prioritise citation integrity. Research identifies a specific trap: a system that simply **echoes the
top retrieved passage** can score near-perfect citation precision **while being useless**, because
echoing is not answering.

**Amendment.** Citation metrics must **never** be optimised in isolation. Every evaluation run reports,
together:

| Metric | Purpose |
|---|---|
| Citation integrity rate | Is the evidence real and supportive? |
| **Answer usefulness** (human-judged) | Does it actually answer the question? |
| **Answer correctness** (human-judged) | Is it right? |
| Abstention correctness | Does it know when it cannot answer? |

**And: do not rely on an LLM judge to distinguish "fully supports" from "partially supports."**
Research found this distinction unreliable. **Surface partial support to the human** with the
verifier's rationale rather than asking a model to grade its own nuance.

**Affected specs.** `17-ai-evaluation-framework.md` §3, §6; `01-product-vision.md` §7;
`04-feature-specification.md` F19/F20.

**Consequence.** Human evaluation is not optional and must be budgeted. The evaluation dashboard must
show citation integrity **and** usefulness side by side, so a regression in one cannot hide behind an
improvement in the other.

---

## A10 — The verifier is the weakest link

**What changes.** The specs treat Tier 2 verification as the integrity backstop. Research is blunt:
**entailment accuracy is the soft spot.** Reported NLI performance on short factual claims is far from
perfect, and the "does this support that" judgement — especially the full-vs-partial distinction — is
exactly where models are weakest.

**Amendment.**

1. **Build a legal-domain labelled entailment set** and **measure the verifier**, rather than assuming
   it works. This is the highest-priority evaluation asset in the project.
2. **Treat partial support as a first-class verdict surfaced to the human**, not as a
   near-support that renders normally.
3. **Report verifier precision and recall separately** per verdict class.
4. **Do not treat verification as a substitute for the human review of professional work product.**
   The `reviewed_adopted` state exists for exactly this reason — verification reduces the human
   burden, it does not eliminate the professional duty.
5. If verifier performance is inadequate, the correct response is **more human review and more
   abstention**, never shipping with a weaker check.

**Affected specs.** `17-ai-evaluation-framework.md` (new dataset required);
`18-red-team-risks.md` RT-01/RT-06/RT-07 residual risk sections; `07-ai-architecture.md` §6.3.

**This is the single most important open risk in the AI architecture.** It is recorded here rather
than in the spec so it cannot be overlooked: **a stack designed to be strong has one component whose
strength is assumed, not measured.**

---

## A11 — Lawyer-facing first is a legitimate strategic option

**What changes.** The specs assume a consumer-first wedge (`01-product-vision.md` §5,
`05-mvp-scope.md`) with professionals arriving via the Lawyer Brief. Research surfaces a genuine
strategic alternative:

> **UPL risk largely dissolves when the user is a licensee.** A lawyer using the tool is responsible
> for their own verification and advice; a consumer using the tool is exposed to advice they cannot
> evaluate, and we are exposed to a UPL argument.

**Amendment.** Record the alternative explicitly as a **strategic option with a clear decision
point**, rather than treating consumer-first as settled:

| | Consumer-first (current spec) | **Lawyer-first (alternative)** |
|---|---|---|
| Wedge user | Self-represented litigant | Solo/small-firm lawyer |
| UPL exposure | Material — requires counsel opinion | **Largely dissolved** |
| Price point | Low, per matter | Higher, per seat |
| CAC | Higher per dollar revenue | Lower per dollar revenue |
| Growth loop | The Lawyer Brief | Direct referral within the bar |
| Verification duty | We must be very careful | **User is responsible** — we must record their verification |
| Mission alignment | High | Lower — serves those who can already afford counsel |
| Time to revenue | Slower (consumer trust is hard-won) | Faster |

**Recommended position:** keep consumer-first as the **mission**, but note that the **lawyer tier
carries materially less regulatory risk** and may be the pragmatic first paying market. A hybrid —
launch the lawyer tier first, open the consumer tier once counsel has signed off on the UPL position
— is a legitimate and probably safer sequencing.

**Affected specs.** `05-mvp-scope.md` §5 (persona priority), `20-business-model.md` §3.2 and §7.2,
`23-open-questions.md` Q-T02.

**Decision trigger:** the counsel opinion on UPL (Q3 in `13-privacy-and-legal-risks.md` §10). If the
opinion is restrictive, flip to lawyer-first.

---

## A12 — Canadian storage with specific disclosure of US inference processing

**What changes.** `13-privacy-and-legal-risks.md` §7.1 and `20-business-model.md` note residency as
an open question.

**Amendment.** Adopt as the default position:

1. **Store in a Canadian region from day one** (database, object storage, backups) — it is
   achievable with current managed services and it is a strong differentiator.
2. **Disclose US inference processing specifically and prominently.** Research is clear that
   "our data is in Canada" is **false** if inference happens in the US, and a false residency claim
   is both a marketing-claim liability (RT-25) and a regulatory exposure.
3. The honest formulation is: *"Your documents are stored in Canada. To read and organise them we
   use AI services, and [provider] processes the relevant excerpts in the United States under
   [terms]. You can turn this off per case — your documents, search, and notes still work."*

**Affected specs.** `13-privacy-and-legal-risks.md` §7.1; `20-business-model.md` §7.3;
`23-open-questions.md` Q-D01, Q-D02.

**Consequence.** This makes the **deterministic-only mode** (no third-party AI) a
**customer-facing product feature**, not just an architectural fallback. It must be genuinely usable
and honestly described.

---

## Additional do-not-do items adopted

Research produced a do-not-do list that the specs do not fully cover. These are now binding:

| # | Do not | Why |
|---|---|---|
| DD-1 | Optimise citation precision alone | A system that echoes passages scores perfectly and is useless (A9) |
| DD-2 | Rely on an LLM judge for full-vs-partial support | Measured unreliable (A10) |
| DD-3 | Use model choice as a hedge against building verification | Verification is the product, not a model property |
| DD-4 | Adopt agentic multi-hop retrieval at MVP | Adds injection surface; frontier models already fail agentic tasks absent attacks |
| DD-5 | Adopt GraphRAG at MVP | Continuous indexing cost, no evidence it beats hybrid RAG on litigation corpora |
| DD-6 | Use an AGPL-licensed PDF library in a closed-source SaaS | Licence contamination — verify the licence of every PDF dependency |
| DD-7 | Submit privileged documents to VirusTotal or any retaining scanner | Malware scanning must be our own instance |
| DD-8 | Auto-merge entities across matters | Cross-matter inference is both a correctness and a wall-breach risk |
| DD-9 | Promise zero retention without confirming it covers the specific model **and** feature combination used | Retention commitments differ per model and per API surface |
| DD-10 | Copy an RRF `k` value between systems | Defaults differ wildly; record and validate the chosen value |
| DD-11 | Claim e-discovery conformance untested, or claim a hash establishes authenticity | Both are false claims with legal consequences |

---

## Reconciliation status

| Amendment | Spec updated? | Action required |
|---|---|---|
| A1 | ⬜ | Update `09-evidence-provenance.md` §6.2; implement in Phase 3 |
| A2 | ⬜ | Update `07-ai-architecture.md` §5.4 to "conditional"; add ablation gate |
| A3 | ⬜ | Add capability flag to provider interface; contract test |
| A4 | ⬜ | Update `08-document-ingestion.md` §5.2, §6.5; make it a Phase 3 dependency of F32 |
| A5 | ⬜ | Add `structural_origin` + `citable` to schema; new DB constraint |
| A6 | ⬜ | Update `12-security-architecture.md` §10; choose an anchor target |
| A7 | ⬜ | Update `12-security-architecture.md` §5.4 |
| A8 | ⬜ | Update `06-system-architecture.md` §6.4; `10-database-schema.md` §5.1 |
| A9 | ⬜ | Update `17-ai-evaluation-framework.md` §3; add usefulness to the dashboard |
| A10 | ⬜ | **New eval dataset required** — legal-domain entailment set |
| A11 | ⬜ | Update `05-mvp-scope.md` §5; add a decision point on the UPL opinion |
| A12 | ⬜ | Update `13-privacy-and-legal-risks.md` §7.1 and the disclosure copy |
| DD-1..DD-11 | ⬜ | Fold into the lint/CI checks and the dependency policy |

**Process requirement:** amending the numbered specs is a normal engineering task, not a research
follow-up. Each ⬜ above should become a task in the relevant epic (`epics/`), and the spec text
should be updated in the same pull request as the code that implements it — so the specs never drift
from reality.

---

## Related documents

- `research-technical-best-practices.md` — the source of every amendment here
- `21-competitive-analysis.md` — the market research, which also informs A11
- `24-architecture-decisions.md` — ADRs affected: 006, 007, 008, 016, 019, 020, 021, 028
- `18-red-team-risks.md` — RT-01, RT-04, RT-05, RT-11, which A1/A4/A5/A6 harden
- `17-ai-evaluation-framework.md` — the eval sets A9 and A10 require
