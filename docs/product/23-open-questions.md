---
title: Case IQ — Open Questions
status: draft
owner: Product
last_updated: 2026-02-14
version: 1.0
---

# 23 — Open Questions

Unresolved decisions that matter. **Every entry has a recommended default** so development
continues without waiting, plus a trigger for when the answer must be known.

**Rules for this document:**
1. Nothing here is quietly guessed elsewhere. If a spec needed an answer, it cites the question ID.
2. A recommended default is a *decision to proceed*, not a permanent answer.
3. An answer that contradicts a default triggers a documented product change request.
4. **Blocking** items prevent launch, not development.

---

## Question index

| ID | Question | Type | Blocking? | Default exists? |
|---|---|---|---|---|
| Q-T01 | Which jurisdiction(s) do we launch in first? | Target | **Yes** | ✅ |
| Q-T02 | Consumer-first or professional-first emphasis? | Target | No | ✅ |
| Q-T03 | What is the initial case-type focus? | Scope | No | ✅ |
| Q-T04 | Do we require users to attest they may lawfully upload third-party data? | Legal | **Yes** | ✅ |
| **Q-T05** | **Is the competitive window short enough to justify cutting scope?** | Strategy | No | ✅ |
| **Q-T06** | **Is the wedge buyer's ability to pay a problem?** | Strategy/Pricing | No | ✅ |
| **Q-T07** | **Two candidate features surfaced by research (court-compliance check; published accuracy figures)** | Scope | No | ✅ |
| Q-M01 | Pricing model and packaging? | Business | **Yes** | ✅ |
| Q-M02 | What is the free tier, if any? | Business | No | ✅ |
| Q-M03 | Per-matter or subscription as the primary shape? | Business | No | ✅ |
| Q-M04 | What storage and document limits per plan? | Ops | No | ✅ |
| Q-A01 | Which AI providers, and in which regions? | Technical | **Yes** | ✅ |
| Q-A02 | What OCR vendor, if any, beyond Tesseract? | Technical | No | ✅ |
| Q-A03 | What embedding model, and what dimension? | Technical | No | ✅ |
| Q-A04 | What reranker, hosted or self-hosted? | Technical | No | ✅ |
| Q-A05 | What context window and model tier per task? | Technical | No | ✅ |
| Q-A06 | How much can we spend per matter before it is unprofitable? | Economics | **Yes** | ✅ |
| Q-D01 | Data residency: single region or per-tenant? | Legal/Ops | **Yes** | ✅ |
| Q-D02 | Can third-party AI process Canadian client data at all? | Legal | **Yes** | ✅ |
| Q-D03 | What retention default, and what backup window do we commit to? | Legal/Ops | **Yes** | ✅ |
| Q-D04 | What happens to audit-log data on account deletion? | Legal | No | ✅ |
| Q-D05 | Deletion vs legal hold — who decides? | Legal | No | ✅ |
| Q-U01 | Collaboration in the MVP, or not? | Product | No | ✅ |
| Q-U02 | Mobile app, or responsive web only? | Product | No | ✅ |
| Q-U03 | Which languages, and when? | Product | No | ✅ |
| Q-U04 | Should the timeline default to visual or table view? | Product | No | ✅ |
| Q-L01 | Law firm deployment model: multi-tenant or dedicated? | Business | No | ✅ |
| Q-L02 | Do we sell to legal aid organizations? | Business | No | ✅ |
| Q-L03 | Do we accept court or tribunal access requests? | Legal | No | ✅ |
| Q-X01 | What export formats are contractual? | Product | No | ✅ |
| Q-X02 | Do we commit to a data-portability format and its stability? | Product | No | ✅ |
| Q-X03 | Interoperability with e-discovery formats (EDRM, LEDES)? | Product | No | ✅ |
| Q-S01 | Do we pursue SOC 2, and on what timeline? | Compliance | No | ✅ |
| Q-S02 | What is the breach-notification decision tree? | Legal | **Yes** | ✅ |
| Q-E01 | What team and budget are actually available? | Execution | **Yes** | ✅ |
| Q-E02 | Build the worker ourselves or use a managed pipeline? | Execution | No | ✅ |
| Q-E03 | Is a contract engineer hired, and for what? | Execution | No | ✅ |
| Q-R01 | Retrieval architecture: is hybrid proven or assumed? | Technical | No | ✅ |
| Q-R02 | Do we need a graph database at all? | Technical | No | ✅ |
| Q-R03 | Confidence: ordinal forever, or invest in calibration? | Product | No | ✅ |
| Q-R04 | When do we fine-tune or self-host a model? | Technical | No | ✅ |
| Q-G01 | Do we launch publicly before the penetration test? | Governance | **Yes** | ✅ |
| Q-G02 | Who signs off on user-facing copy? | Governance | No | ✅ |
| Q-G03 | What is the incident-response ownership model? | Governance | **Yes** | ✅ |

---

## 1. Target and strategy

### Q-T01 — Which jurisdiction(s) do we launch in first?

**Why it matters.** UPL exposure, privacy regime, court structure, document conventions, and
language all change by jurisdiction. Launching in two jurisdictions simultaneously doubles the
legal review.

**Recommended default:** **Ontario, Canada only**, for the first six months of public availability.
Canadian-hosted infrastructure where possible, Canadian AI processing preferred, English only.

**Trigger for a decision:** before any paid marketing spend outside Ontario.

**Rationale:** the founder's context and network are here, Ontario's Superior Court is
self-represented-litigant-heavy in family and civil matters, and a single-jurisdiction launch makes
the UPL opinion, privacy position, and residency story tractable.

---

### Q-T02 — Consumer-first or professional-first emphasis?

**Why it matters.** It changes onboarding, pricing, sales motion, terminology, and the whole
product emphasis.

**Recommended default:** **Build for the consumer (self-represented litigant), sell to both.**
Consumer is the wedge because it is a large, underserved, motivated population with no procurement
cycle and a per-matter payment willingness. Professionals arrive through the Lawyer Brief
(`01-product-vision.md` §5).

**Trigger:** after 25 design-partner conversations, if professional interest significantly exceeds
consumer interest, revisit.

---

### Q-T03 — What is the initial case-type focus?

**Why it matters.** Case types drive document conventions, terminology, default modules, and
extraction tuning. Trying to serve all nine case types at once dilutes quality.

**Recommended default:** **Civil claims and employment disputes first**, because the document mix
(pleadings, contracts, correspondence, financial records, affidavits) exercises the whole pipeline
and the harm from a chronology error is recoverable. **Family matters second** — highest need, but
children's data raises the sensitivity tier and the stakes of an error.

**Explicitly not first:** criminal matters. The consequence of an extraction error is highest, the
disclosure volumes are largest, and the professional-liability surface is the most serious. Enter
later, deliberately, and after the quality gates are proven in production.

**Trigger:** before onboarding the first criminal-matter design partner.

---

### Q-T04 — Do we require users to attest they may lawfully upload third-party data?

**Why it matters.** Users upload material containing information about non-consenting third parties
(`13-privacy-and-legal-risks.md` §1). An attestation may reduce exposure — or may be unenforceable
theatre.

**Recommended default:** **Yes, implement the attestation**, at first upload, worded as a plain
statement rather than a legal trap:

> "You should only upload documents you're entitled to have and use. This includes documents about
> other people. If you're not sure, ask your lawyer."

Legal review will confirm enforceability and wording (Q7 in `13-privacy-and-legal-risks.md` §10).

**Trigger:** before launch.

---

### Q-T05 — Is the competitive window short enough to justify cutting scope?

**Why it matters.** Research (`21-competitive-analysis.md`) found that **grounded AI chronology
with clickable citations already ships in at least five products** — Casefleet, Clio Work, Everlaw
Storybuilder, Filevine MedChron, and Wexler.ai — and that incumbent case-management platforms are
moving toward matter analysis for small firms. The differentiation is therefore not the feature; it
is the *enforcement* of the no-unsupported-assertion guarantee and the underserved audience.

**Recommended default:** **Do not cut the enforcement to ship faster.** The temptation, when a
category is filling, is to cut the quality infrastructure to reach the market sooner. That would
remove the only thing that distinguishes us. Instead:

1. **Cut scope breadth, never correctness.** Ship fewer modules, all of them trustworthy.
2. **Re-order, don't skip.** If the schedule compresses, cut the AI chat (ADR-026) before the
   citation system or the Lawyer Brief.
3. **Accept a smaller v1.** Six destinations instead of ten, done properly, beats ten done loosely.
4. **Compete on the guarantee and the audience**, not on feature parity. A per-seat, firm-priced
   incumbent cannot easily serve one person with 3,000 pages and no lawyer — that is the gap that
   stays open regardless of how fast the incumbents move.

**Trigger:** any schedule review where the proposal is to weaken a release gate. The answer is
pre-decided: **the gates do not move; the scope does.**

**The related legal timing pressure:** courts are increasingly explicit that AI errors are the
*filer's* responsibility regardless of who or what produced them, that inadvertence is no excuse, and
that sanctions can include costs, penalties, and referral to a law society. In at least one Canadian
decision a **self-represented litigant was personally sanctioned**. **This raises the value of the
citation guarantee and raises the cost of a single publicised error.** It does not change the
recommendation — it strengthens it.

**One upside the research surfaced.** The procedural compliance layer is a genuine, unoccupied
opportunity. Ontario court rules impose mechanical, machine-checkable requirements: AI-use
verification, authoritative-citation hyperlinking, document naming protocols, page caps, bundle
order. **No surveyed competitive product builds this.** It is unglamorous, it is checkable, and it
is precisely what a self-represented litigant gets wrong. Converting the citation infrastructure we
are already building into a visible compliance check would turn a hidden implementation detail into
a distinct, defensible feature.

---

### Q-T06 — Is the wedge buyer's ability to pay a problem?

**Why it matters.** Research on self-represented litigants found the population skews toward
**family matters over civil, with a majority earning under $50,000 and a substantial minority under
$30,000**. If the wedge buyer is disproportionately a low-income family litigant, a pricing model
built around commercial-dispute willingness to pay will reach neither the mission nor the market.

**Recommended default:** **design the lowest tier so it is genuinely affordable, and treat it as a
strategic asset rather than a loss leader.** Specifically:

1. A low-cost per-matter tier with a page allowance sized to a **family** matter, not a commercial
   one.
2. **Never gate the Lawyer Brief** at any tier — it is the value moment and the only growth loop
   (ADR-026).
3. Explore a **legal-aid, clinic, and duty-counsel channel** earlier than Phase 3 if the pricing
   research confirms the income skew. Institutions can absorb a cost that individuals cannot.
4. Consider moving the non-profit tier from Phase 3 to Phase 2.

**Trigger:** after willingness-to-pay research with the design-partner cohort (measurement M11 in
`20-business-model.md` §9).

---

### Q-T07 — Two candidate features surfaced by research

Recorded here rather than silently added, because adding features is a scope decision belonging to
the product owner and to `05-mvp-scope.md`.

| Candidate | Rationale | Suggested phase |
|---|---|---|
| **Court-compliance check** | Ontario's procedural requirements (AI-use verification, authoritative-citation hyperlinking, naming protocol, page limits, bundle order) are mechanical, checkable, and built by no surveyed competitor. It reuses the citation infrastructure we are already building and addresses the exact thing an SRL gets wrong. | Phase 2 backlog |
| **Published accuracy figures for the contradiction engine** | No contradiction-detection product publishes a measured accuracy figure. Publishing an honest precision number — and refusing to publish one we have not measured — is itself a differentiator that compounds over time with the labelled set. | Phase 6, published at launch |

**Recommended default:** **add the compliance check to the Phase 2 backlog and commit publicly to
publishing the contradiction-engine precision figure at Phase 6 launch.** Neither changes the MVP.

---

## 2. Business model

### Q-M01 — Pricing model and packaging?

See `20-business-model.md` for the full framework. Open questions here are the specific price
points, which cannot be set responsibly until real cost data exists.

**Recommended default:** **Cost-plus with a documented floor**, validated during beta rather than
guessed now. Structure:

| Tier | Shape | Basis |
|---|---|---|
| Free trial | One matter, capped pages, no AI, OR a full-featured 7-day trial | Prefer the full-featured time-boxed trial — it demonstrates the value |
| Individual | Per matter, with a page allowance | The dominant consumer shape |
| Professional | Monthly seat + matter allowance | Solo/small-firm lawyers |
| Team | Seat bundle + pooled matter allowance | Phase 4 |

**The variable that must be measured first:** real cost per 500-page and per 2,000-page matter,
including OCR, extraction, embedding, verification, storage, and egress. **Pricing set before that
measurement is a guess with a margin risk.**

**Trigger:** before the first paid customer.

---

### Q-M02 — What is the free tier, if any?

**Why it matters.** A permanent free tier attracts the highest-volume, lowest-value users and can
consume the cost budget.

**Recommended default:** **No permanent free tier.** A time-boxed full-featured trial (7 days, one
matter) plus a heavily capped free preview that shows the timeline for up to ~50 pages without AI
extraction. The preview is a demonstration, not a working tool.

**Trigger:** after beta, if conversion data shows the trial is too short.

---

### Q-M03 — Per-matter or subscription as the primary shape?

**Recommended default:** **Per-matter for consumers, seat + matter allowance for professionals.**
Legal matters are episodic; a consumer's willingness to pay a monthly subscription indefinitely is
low, but willingness to pay once for a specific outcome is high. Professionals need predictable
monthly billing.

---

### Q-M04 — What storage and document limits per plan?

**Recommended default:**

| Limit | Value | Rationale |
|---|---|---|
| Per-file size | 250 MB | Covers essentially all real legal documents including large scans |
| Documents per matter | Tiered: 500 / 2,000 / 10,000 | Matches the plan's cost profile |
| Pages per matter | The real cost driver — this is the metered unit, not documents | A 20-page affidavit and a 900-page disclosure are not comparable |
| Storage per matter | 20 GB / 100 GB / 500 GB | Generous enough not to be the constraint |
| Retention | User-controlled, default indefinite with review prompts | See Q-D03 |

**Trigger:** validate against real usage during beta.

---

### Q-L01 — Law firm deployment model

**Recommended default:** **Multi-tenant with ethical walls**, moving to per-tenant regional
deployment only for enterprise contracts that require it (Phase 4). A dedicated single-tenant
deployment is the right answer for a small number of high-value contracts and the wrong default for
everyone else.

---

### Q-L02 — Do we sell to legal aid organizations?

**Recommended default:** **Yes, but not as a design constraint at MVP.** Legal aid clinics are
high-need, mission-aligned, and a strong referral channel — and they bring lowest-cost-per-user
economics, multi-client-per-account workflows, and procurement requirements. Serve them in Phase 3
with a dedicated non-profit tier once the consumer product is stable.

---

### Q-L03 — Do we accept court or tribunal access requests?

**Recommended default:** **No.** We are not a system of record and will not accept subpoenas
directed at our platform as a substitute for a party's disclosure obligations. Requests are routed
to counsel. **This requires a documented policy and legal review before launch**, because courts do
sometimes ask.

---

## 3. Technical

### Q-A01 — Which AI providers, and in which regions?

**Why it matters.** This determines residency, transfer mechanisms, cost, quality, and whether
third-party AI is viable for Canadian legal work at all.

**Recommended default:** **Two providers**, selected against the criteria in
`07-ai-architecture.md` §11: zero/limited retention available contractually, no training on customer
data, reliable structured output, prompt caching, batch API, relevant regional processing, and an
acceptable DPA. Tier 2 verification **must** use a different provider or model family from Tier 1
generation (ADR-020).

**Do not select on benchmark leaderboard position alone.** Select on data-handling terms first,
structured-output reliability second, quality third, cost fourth.

**Trigger:** before Phase 5 (the AI assistant phase). Provider evaluation is a Phase 0/1 activity.

---

### Q-A02 — What OCR vendor beyond Tesseract?

**Recommended default:** **Tesseract as the always-available local baseline; one cloud OCR provider
as an opt-in fallback** gated by per-matter policy (`ADR-018`). Cloud OCR sends page images to a
third party, which is a materially different disclosure from sending extracted text, so it is off by
default and explicitly enabled.

**Trigger:** before Phase 2 completes — measure Tesseract quality on the adversarial corpus first.
If Tesseract is adequate for the target corpus, defer cloud OCR entirely and save the cost and the
disclosure.

---

### Q-A03 — Embedding model and dimension?

**Recommended default:** **One hosted embedding model**, chosen for cost and multilingual
capability, with the model ID and dimension recorded per vector and a documented re-embedding path
(`10-database-schema.md` §14.4). Dimension must be fixed at schema time, so this decision must be
made before the `document_chunks` table is created.

**Trigger:** Phase 3, before the first migration that creates the vector column. **This is a
one-way door at the schema level** — changing dimension later requires a full re-embed.

---

### Q-A04 — Reranker: hosted or self-hosted?

**Recommended default:** **Hosted cross-encoder reranker** at MVP, applied to the fused top-50 →
top-12. Self-hosting is a Phase 3 optimisation if reranker cost or latency becomes material.

**Trigger:** Phase 3 evaluation — measure the precision gain before committing to the cost. If the
gain is small, drop the reranker and say so (`07-ai-architecture.md` §5.6 requires reporting when a
component does *not* help).

---

### Q-A05 — Model tier per task?

**Recommended default:** as tabulated in `07-ai-architecture.md` §3.3, with the high tier reserved
for transaction extraction, contradiction analysis, chat generation, Tier 2 verification, and brief
composition. **Tiering is configuration, not code**, so it can be tuned against measured quality
without a deploy.

**Trigger:** Phase 5 evaluation — measure whether the mid tier is sufficient for event extraction.
If it is, the cost saving is significant.

---

### Q-R01 — Is hybrid retrieval proven or assumed?

**Recommended default:** **Prove it, do not assume it.** `07-ai-architecture.md` §5.6 requires
per-arm ablations (FTS only, vector only, structured only, hybrid, hybrid + rerank) with reported
nDCG and recall, **including reporting when an arm does not help**. An arm that does not earn its
cost is removed.

**Trigger:** Phase 3 acceptance criteria.

---

### Q-R02 — Do we need a graph database at all?

**Recommended default:** **No** (ADR-007). Relational edges with recursive CTEs, depth-capped.
Revisit only if a matter regularly exceeds ~50,000 entities with deep-traversal requirements.

---

### Q-R03 — Confidence: ordinal forever, or invest in calibration?

**Recommended default:** **Ordinal, derived by rule, forever** (ADR-021), **unless** labelled
calibration data demonstrates that a numeric confidence is genuinely calibrated. This is an explicit
"not now, and not casually later" decision.

**Trigger:** if a customer or regulator requires numeric confidence, the answer is to *earn* it with
a calibration study, not to add a percentage.

---

### Q-R04 — When do we fine-tune or self-host a model?

**Recommended default:** **Not before there is a labelled dataset of ≥5,000 real, consented,
corrected extractions** and a proven evaluation harness to measure the change. Fine-tuning before
that is optimising an unmeasured system.

**Where the gains are likely to come from instead, in order:** better prompts → better retrieval →
better deterministic post-checks → model tiering → fine-tuning → self-hosting.

**A self-hosted tier is separately justified** for maximum-sensitivity matters where a customer
requires no third-party AI at all (see Q-D02). That is a *compliance* motivation, not a quality one.

---

## 4. Data, privacy, and legal

### Q-D01 — Data residency: single region or per-tenant?

**Recommended default:** **Single region at MVP**, disclosed precisely and honestly, chosen to be
Canadian if the managed services allow. Per-tenant regional deployment in Phase 4 for customers who
contract for it.

**Marketing rule:** residency is claimed **only** for everything — database, object storage,
backups, monitoring, support tooling, and AI processing. A partial claim ("our servers are in
Canada but AI processing is in the US") must be stated in full, not implied away. See RT-25.

**Trigger:** before launch. This is a launch blocker because the residency story is a marketing claim
with legal weight.

---

### Q-D02 — Can third-party AI process Canadian client data at all?

**This is the most consequential open question in the project.**

**Recommended default:** **Yes, with a per-matter opt-out and a provider constrained to acceptable
terms** — but with a **deterministic-only mode as a supported product state**, so a customer can use
Case IQ with no third-party AI at all: browse, search, review, and export all keep working
(`12-security-architecture.md` §11). That fallback is what makes the "yes" defensible.

**The alternative position** — Canadian/EU-region AI processing only — may be the correct default
for Canadian legal work. It is a **launch blocker requiring counsel's determination**
(`13-privacy-and-legal-risks.md` §10 Q4).

**Trigger:** before launch.

---

### Q-D03 — What retention default, and what backup window do we commit to?

**Recommended default:**

| Data | Default |
|---|---|
| Case content | Retained until the user deletes it, with a review prompt at 12 months |
| Recoverable deletion window | 30 days |
| Permanent deletion | Immediate content purge, verified |
| Backup retention | **Stated in days in the deletion receipt** (ADR-017) — a number we can honour, not a promise we cannot |
| Audit log | Longer than content; content-free; period confirmed by counsel (Q9) |
| Usage/billing | Statutory accounting period |

**Trigger:** before launch, with counsel confirming the audit-log period.

---

### Q-D04 — Audit-log data on account deletion

**Recommended default:** **Retain the audit-log entries, content-free, for the accountability period.**
The log records *that* an action occurred and by whom, never case content, so it is not a copy of
the deleted material. Deleting the log on request would destroy the tamper-evidence property that
makes it worth having.

**Disclosed in the privacy notice** so it is not a surprise. Counsel confirms the legal basis and
period.

---

### Q-D05 — Deletion vs legal hold: who decides?

**Recommended default:** **The user decides, and we warn them plainly.** We do not adjudicate legal
holds and we do not refuse deletion based on our own assessment of a user's obligations. The product
warns (disclosure D-6) and defers to the user's lawyer.

For **professional** customers we will honour a documented matter-level hold configured on the
account, because the firm has the obligation and the competence to determine it.

**Trigger:** before enabling the professional tier.

---

### Q-S02 — Breach-notification decision tree

**Recommended default:** documented with counsel before launch, covering: discovery-to-assessment
within 24 hours, a harm assessment, jurisdiction-specific deadlines (**statutory, and they vary**),
notification content, and the standing rule that **we never delay notification for reputational
reasons** (`12-security-architecture.md` §13).

**Trigger:** before launch. Launch blocker.

---

### Q-G01 — Do we launch publicly before the penetration test?

**Recommended default:** **No. Never.** An independent penetration test with all critical and high
findings remediated is a launch gate (`12-security-architecture.md` §12.3). Selling security to
legal professionals on unverified controls would be indefensible, and the first bad headline is the
last one.

**Trigger:** before launch. Launch blocker.

---

### Q-G02 — Who signs off on user-facing copy?

**Recommended default:** **Two required reviewers for any copy that touches AI behaviour, legal
framing, or security claims: the product owner and a legal reviewer.** A copy lint enforces the
mechanical rules; the human review catches the cases the lint cannot judge — whether something
*reads* like legal advice, or overclaims.

**Trigger:** before the first external user.

---

### Q-G03 — Incident-response ownership

**Recommended default:** **A named on-call owner per Sev-1 signal**, even if that is the founder.
Every Sev-1 monitoring signal in `18-red-team-risks.md` §5 has a runbook, and the runbooks are
rehearsed — including the leaked-share-link scenario, which is the most likely real incident.

**Trigger:** before launch.

---

## 5. UX and product

### Q-U01 — Collaboration in the MVP?

**Recommended default:** **No.** One user per matter in the MVP, plus a **read-only scoped share link
for counsel**. Collaboration is a professional-tier need; the share link captures the referral loop
that actually matters.

**Trigger:** when a design partner asks to work with a paralegal.

---

### Q-U02 — Mobile app, or responsive web only?

**Recommended default:** **Responsive web only.** The three highest-frequency mobile actions —
check the timeline, verify a citation, approve or correct a review item — are all first-class in the
responsive design (`14-ux-specification.md` §2.4). A native app is a distribution decision, not a
product need, and it doubles the surface area.

---

### Q-U03 — Which languages?

**Recommended default:** **English only at MVP**, but **no hard-coded user-facing strings from the
first commit** (`04-feature-specification.md` F45). Extraction quality is reported per language
rather than averaged, so a weak language is visible rather than hidden. Priority for translation
follows actual user geography, not assumption.

---

### Q-U04 — Should the timeline default to visual or table view?

**Recommended default:** **Visual on desktop, table on mobile.** The visual timeline is the more
compelling first impression and communicates sequence better; the table is more usable at 375px and
is the accessible equivalent. Both must be peers, and the choice is remembered per user.

**Test requirement:** whichever is default, the other must remain one click away and equally
functional (WCAG 2.2 AA requires the accessible alternative, not a degraded fallback).

---

## 6. Export and interoperability

### Q-X01 — What export formats are contractual?

**Recommended default:** **PDF and DOCX for the Lawyer Brief (MVP); CSV and ICS for data exports.**
Commitment to DOCX matters to lawyers, who will edit the brief. A DOCX export that loses the
citation anchors is a defect, not a limitation.

---

### Q-X02 — Do we commit to a data-portability format and its stability?

**Recommended default:** **Yes.** A documented, versioned JSON + files format with a manifest
(`F42`), committed as a compatibility guarantee: a version-N export remains readable by
version-N+1. **No lock-in as a stated product principle**, which is a differentiator against
enterprise tools and a genuine answer to the privacy question "can I get my data out?".

**Trigger:** Phase 3, when F42 is built.

---

### Q-X03 — Interoperability with e-discovery formats?

**Recommended default:** **Not committed at MVP.** Mapping to EDRM or LEDES would imply a
litigation-support capability we are not building and do not want to be evaluated against. Revisit
only if a firm contract requires it.

---

## 7. Compliance

### Q-S01 — Do we pursue SOC 2, and when?

**Recommended default:** **Phase 2 readiness → Phase 3 Type II observation.** Not before the product
is stable, because an audit period over a rapidly changing system is wasted money.

**Sequence:** internal security review → external penetration test → security page → SOC 2 Type I →
SOC 2 Type II → ISO 27001 only if firm or enterprise sales require it.

---

## 8. Execution

### Q-E01 — What team and budget are actually available?

**This determines everything else, so it is listed as a question rather than an assumption.**

**Recommended default (the planning assumption):** one part-time technical founder working with AI
coding agents, plus a small budget for legal counsel, a penetration test, and infrastructure.
**Development-phase AI costs are kept near zero** via the deterministic fake provider (ADR-015), so
the budget goes to counsel, testing, and infrastructure rather than inference.

See `22-development-plan.md` §5 for the three capacity scenarios and what each implies.

**Trigger:** before Phase 1 begins — this one genuinely blocks planning.

---

### Q-E02 — Build the pipeline ourselves or use a managed document-AI service?

**Recommended default:** **Build.** The pipeline is where the product's provenance guarantee lives,
and it cannot be subcontracted: managed services do not expose the page-level, character-level
offsets that citations require, and they do not give us control over the born-digital gating that
keeps OCR cost and error rates down.

**Where managed services *are* used:** as optional OCR fallbacks behind a per-matter policy
(Q-A02), not as the pipeline.

---

### Q-E03 — Is a contract engineer hired, and for what?

**Recommended default:** **Yes, if budget allows, for two specific things**: (1) the RLS, auth, and
audit-log foundation (EPIC-003), because getting isolation wrong is catastrophic and a second pair of
eyes is worth the money; and (2) the ingestion pipeline, because it is the highest-risk subsystem
and the most likely to be underestimated.

**Not** for UI work, which AI agents handle well against a complete design system.

---

## Questions deliberately NOT open

Recorded so they are not reopened without new information. These are settled by the vision document
and the ADRs, and revisiting them is a product change, not a task.

| Settled | Where |
|---|---|
| The product does not give legal advice | `01-product-vision.md` §3.2, RT-08 |
| The AI never assesses credibility or guilt | `01-product-vision.md` §4.1, RT-09 |
| Money and contradiction modules ship after their verification exists | ADR-024, ADR-025 |
| The Lawyer Brief is MVP; AI chat is cuttable | ADR-026 |
| No audio/video until a separate privacy review | ADR-029 |
| No field-level encryption of case text | ADR-016 |
| No graph database at MVP | ADR-007 |
| No autonomous multi-agent orchestration | ADR-008 |

---

## Tracking

| Field | Value |
|---|---|
| Review cadence | Monthly, or at each phase gate |
| Owner | Product |
| Blocking questions | Q-T01, Q-T04, Q-M01, Q-A01, Q-A06, Q-D01, Q-D02, Q-D03, Q-S02, Q-E01, Q-G01, Q-G03 |
| Escalation | A blocking question unresolved at its trigger date stops the affected work, not all work |

**A note on this list:** it is deliberately long. A specification that claims to have no open
questions is either shallow or dishonest. What matters is that **every question has a default**, so
that the absence of an answer never blocks progress — and that the blocking questions are resolved
before they can cause harm rather than before they can cause inconvenience.

---

## Related documents

- `20-business-model.md` — expands Q-M01 to Q-M04
- `13-privacy-and-legal-risks.md` §10 — Q1–Q20, the legal questions in full
- `22-development-plan.md` §5 — expands Q-E01
- `24-architecture-decisions.md` — decisions already made
- `05-mvp-scope.md` — default answers already baked into the MVP scope
