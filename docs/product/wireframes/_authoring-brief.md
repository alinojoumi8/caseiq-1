# Wireframe authoring brief — Case IQ (internal, do not ship)

This file is a working brief for authoring the files in this directory. It is not a screen
specification. It exists so every wireframe uses the same invented matter, the same people, the same
figures, and the same rules.

---

## 1. Authority order

1. `../01-product-vision.md` — wins over everything
2. `../14-ux-specification.md` — principles, IA, terminology map §6, forbidden vocabulary §5.3,
   accessibility §7
3. `../09-evidence-provenance.md` — assertion classes, confidence, citation rules
4. `../04-feature-specification.md` — F-IDs and acceptance criteria
5. `../03-user-journeys.md` — journeys J1–J13
6. `../15-design-system.md` — tokens and components
7. This brief

If a wireframe appears to contradict 1–3, the wireframe has a bug.

---

## 2. The canonical matter (use these exact facts everywhere)

**Okafor v. Northgate Holdings Inc.** · Ontario Superior Court of Justice ·
Court File No. CV-24-00682147-0000 · jurisdiction Ontario, Canada.
Case type `civil` (consumer label "Civil claim"). Claim value CAD $475,000.00 plus damages.
Current stage: discovery completed; awaiting settlement conference.
Matter created 2026-01-14. **Today is 2026-02-14.**

Our user: **David Okafor**, plaintiff. Consumer persona (`persona_type = individual`), so consumer
labels apply ("your papers", "your case", "what's alleged", "What doesn't add up", "Connections",
"Ask about my case", "Prepare for your lawyer"). Where a screen is a professional surface, say so
and give the professional label too.

### 2.1 Cast

| Entity | Kind | Role | Notes |
|---|---|---|---|
| David Okafor | person | Plaintiff; our user | Retired logistics manager |
| Northgate Holdings Inc. | organization | Defendant | Ontario logistics-tech corporation |
| Michael Chen | person | CFO, Northgate | Statements appear inconsistent as to timing |
| Sarah Whitfield | person | CEO and director, Northgate | Emailed about "the Meridian arrangement" |
| James Whitmore | person | Former controller, Northgate | Left Nov 2021; raised concerns June 2021 |
| Priya Raman | person | Counsel for the plaintiff | Read-only counsel role |
| Meridian Payments Ltd. | organization | Payment processor | Received CAD $310,000 |
| Northgate Logistics Ltd. | organization | Unrelated company | Similar name — must never merge |
| Jason Chen | person | Northgate sales employee | Same surname as Michael Chen — must never merge |
| Account ••4471 | account | Unidentified | Alleged to be associated with the CEO; ownership not established |
| Account ••8892 | account | Unidentified | Trace terminates here; not in the record |

### 2.2 Documents (citation format: `Vol. N · p. X`)

| Vol. | Document | Type | Date | Pages |
|---|---|---|---|---|
| Vol. 1 | Statement of Claim | pleading | 2024-03-11 | 12 |
| Vol. 2 | Statement of Defence | pleading | 2024-05-02 | 14 |
| Vol. 2 | Subscription Agreement | contract | 2021-03-04 | 22 |
| Vol. 2 | Email, M. Chen → Meridian Payments | email | 2021-06-11 | 1 |
| Vol. 3 | Affidavit of Michael Chen | affidavit | 2024-02-14 | 6 |
| Vol. 3 | Examination for Discovery transcript, Chen | transcript | 2024-09-18 | 48 |
| Vol. 4 | Bank statement, Northgate, 2021 Q2 (Northbridge Bank) | bank_statement | 2021-04-01–06-30 | 8 |
| Vol. 4 | Wire transfer confirmation | receipt | 2021-06-14 | 1 |
| Vol. 5 | Meridian Payments invoice | invoice | 2021-06-15 | 2 |
| Vol. 5 | Email thread, board approval | email | 2021-05-28–06-02 | 3 |
| Vol. 5 | WhatsApp export, Okafor ↔ Whitmore | chat_export | 2021-06-10–07-02 | 4 |
| Vol. 6 | Affidavit of James Whitmore | affidavit | 2024-10-02 | 7 |
| Vol. 6 | Northgate board minutes | corporate_record | 2021-06-01 | 5 |
| Vol. 6 | Northgate corporate profile | corporate_record | 2021-02-01 | 3 |
| Vol. 7 | Financial statements, Northgate 2021 | financial_statement | 2022-01-20 | 18 |
| Vol. 7 | Email, M. Chen → D. Okafor | email | 2023-01-19 | 1 |
| Vol. 8 | Police occurrence note | police_record | 2023-08-07 | 2 |
| Vol. 8 | Invoice, Northgate Logistics Ltd. | invoice | 2021-07-08 | 1 |
| Vol. 9 | Scanned letter, no text layer | correspondence | 2021-08-19 | 2 |
| Vol. 9 | Copy of wire transfer confirmation (duplicate) | receipt | 2021-06-14 | 1 |

Inventory total: **412 documents, 3,880 pages**. Processing: **398 ready · 9 reading · 3 failed ·
2 unreadable pages** (the scan and one redacted page). Duplicate group: 1 group of 2 files.

### 2.3 People and documents counts

**18 people · 7 organizations · 214 timeline events (153 reviewed) · 3 allegations ·
47 statements · 12 possible inconsistencies · 6 transactions in the ledger (1 flagged).**

### 2.4 Key dates

| Date | Event | Precision | Source |
|---|---|---|---|
| 2021-03-04 | Subscription Agreement executed; CAD $475,000 committed | exact | Vol. 2 p. 1 |
| 2021-03-09 | First tranche CAD $250,000 from D. Okafor | exact | Vol. 4 p. 2 |
| 2021-05-28 | Whitfield emails Chen about "the Meridian arrangement" | exact | Vol. 5 p. 1 |
| 2021-05-31 | Second tranche CAD $225,000 from D. Okafor | exact | Vol. 4 p. 5 |
| 2021-06-01 | Northgate board meeting held | exact | Vol. 6 p. 1 |
| 2021-06-11 | Chen emails Meridian: "Please confirm the receiving account… CAD 310,000 on Monday." | exact | Vol. 2 p. 19 |
| 2021-06-14 | **CAD $310,000 transferred Northgate → Meridian** | exact | Vol. 4 p. 7 · Vol. 4 p. 1 |
| 2021-06-15 | Meridian invoice CAD $310,000, "consulting services" | exact | Vol. 5 p. 1 |
| 2021-06-22 | Whitmore raises concerns with Chen | **approximate** ("last Tuesday") | Vol. 5 msg 4 |
| 2021-06-28 | Debit CAD $62,500 to account ••4471 (OCR fixture reads $7,500.00) | exact | Vol. 4 p. 8 |
| 2021-07-08 | Invoice from Northgate Logistics Ltd. (unrelated company) | exact | Vol. 8 p. 1 |
| 2021-08-19 | Scanned letter dated `3/4/2021` — ambiguous | **approximate / flagged** | Vol. 9 p. 1 |
| 2023-01-19 | Chen emails Okafor: "Can you confirm the receiving account for the Northgate transfer?" | exact | Vol. 7 p. 88 |
| 2023-08-07 | Police occurrence note; no charges | exact | Vol. 8 p. 1 |
| 2024-02-14 | Chen's affidavit: "I first became aware… in or around March 2023" | exact | Vol. 3 p. 3 |
| 2026-03-04 | Settlement conference (entered by user, from opposing counsel's email) | exact | entered by user |

Undated group: 2 chat messages (Vol. 5). Unreadable pages: 2.

### 2.5 The three allegations (status values are fixed)

| ID | Allegation | Status | Status meaning |
|---|---|---|---|
| A-01 | "The defendant caused CAD $310,000 of the invested funds to be transferred to Meridian Payments Ltd. for purposes outside the scope permitted by the Subscription Agreement." | `disputed` | 5 items support · 4 do not |
| A-02 | "CAD $62,500 of the invested funds was transferred to a personal account associated with the defendant's CEO." | `alleged` | 2 items support · 0 do not · amount is OCR-derived |
| A-03 | "The defendant failed to provide the plaintiff with an accounting of the use of the invested funds despite repeated requests." | `partially_supported` | 2 items support · 2 do not |

Consumer status labels (mandatory, per `../09-evidence-provenance.md` §8.1 and J6 AC-1/AC-3):

| Enum | Consumer label | Professional label |
|---|---|---|
| `alleged` | "Alleged — some evidence mentions this" | Alleged |
| `partially_supported` | "Some evidence supports this; nothing contradicts it" | Partially supported |
| `disputed` | "Evidence both supports and does not support this" | Disputed |
| `unsupported_in_uploaded_evidence` | "Nothing in your papers supports this yet" | Unsupported in uploaded evidence |
| `unresolved` | "Not enough to say either way" | Unresolved |

**There is no `proven` or `established` status.** Copy must never equate `partially_supported` with
"probably true".

### 2.6 The transaction ledger (all CAD, decimal, never float)

| ID | Date | From | To | Amount | Source | Flags |
|---|---|---|---|---|---|---|
| T-01 | 2021-03-09 | D. Okafor (personal) | Northgate Holdings | 250,000.00 | Vol. 4 p. 2 | — |
| T-02 | 2021-05-31 | D. Okafor (personal) | Northgate Holdings | 225,000.00 | Vol. 4 p. 5 | — |
| T-03 | 2021-06-14 | Northgate Holdings | Meridian Payments Ltd. | 310,000.00 | Vol. 4 p. 7 · Vol. 4 p. 1 | 1 duplicate copy linked (Vol. 9), not double-counted |
| T-04 | 2021-06-28 | Northgate Holdings | Account ••4471 | 7,500.00 *(should be 62,500.00)* | Vol. 4 p. 8 | `ocr_derived`, balance check mismatch, excluded from totals until confirmed |
| T-05 | 2021-07-08 | Northgate Holdings | Northgate Logistics Ltd. | 4,850.00 | Vol. 8 p. 1 | separate organization — never merge |
| T-06 | 2021-06-14 | Meridian Payments Ltd. | Account ••8892 | 290,000.00 | **not in the record** | gap |

Totals are shown **per currency with constituent counts**: e.g. `CAD $472,100.00 · 4 transactions
(excludes 1 row awaiting confirmation)`.

Required statement wherever a trace is shown: *"The uploaded case materials do not show where the
CAD $290,000 leaving Meridian went. Sequential transfers do not establish that the funds are the
same money."*

### 2.7 The three possible inconsistencies (surface name: "What doesn't add up")

| ID | Statement A | Statement B | Subject area | Handling |
|---|---|---|---|---|
| C-01 | Affidavit of M. Chen, 2024-02-14: "I first became aware of the Northgate transfer in or around March 2023…" (Vol. 3 p. 3) | Email M. Chen → Meridian, 2021-06-11: "Please confirm the receiving account for the Meridian payment. We will be sending CAD 310,000 on Monday." (Vol. 2 p. 19) | timing / knowledge | Strongest finding; marked Important |
| C-02 | Same affidavit statement | Email M. Chen → D. Okafor, 2023-01-19 (Vol. 7 p. 88) | timing | Possible explanation in the record |
| C-03 | Same affidavit statement | Examination for discovery, 2024-09-18 (Vol. 3 p. 22) | knowledge | **Explainable** — the discovery answer draws a distinction; must not be presented as a flat inconsistency |

Mandatory hedge sentence on every finding: *"This does not mean anyone has done anything wrong —
there may be an explanation the documents do not show."*

Mandatory conclusion: *"The uploaded case materials do not establish what Michael Chen knew, or
when he knew it."*

Possible explanations shown for C-01 (from the record, non-exhaustive):
1. The 2021 email may concern a different transaction that involved the same recipient.
2. "Became aware of the Northgate transfer" may refer to a specific internal review rather than the
   payment generally.
3. The affidavit may be inaccurate as to the date.

---

## 3. Hard rules for every string in every wireframe

### 3.1 Forbidden vocabulary (from `../14-ux-specification.md` §5.3)

Never use, in any user-facing copy string: **lied, lying, dishonest, untruthful, deceptive,
fabricated, guilty, innocent, culpable, proved, proven, established that [person], fraud,
fraudulent, theft, stole, embezzled, suspicious, unusual, concerning** (about a transaction),
**you should, you must, we recommend, your best argument, your strongest point, obviously, clearly,
of course, AI lawyer, AI legal advice, replaces a lawyer, will win, chances of success, simply, just,
obviously easy.**

Permitted alternatives: "these statements appear inconsistent", "the record does not address this",
"the documents state…", "the evidence supports…", "the transaction shows…", "the allegation is…",
"a question for your lawyer", "the evidence that supports this", "state the amount, parties, and
date".

`fraud` may appear **only** inside a verbatim `SOURCE_EXCERPT` quotation with its quotation marks
intact, or as the name of an offence charged. In this matter, it never appears.

### 3.2 Non-negotiable rendering rules

- **Every AI-generated claim on every surface shows a citation chip AND a class badge.** A wireframe
  that renders a claim without either is a defect. Do not produce one.
- Class labels: `SOURCE_EXCERPT` = "From the document"; `EXTRACTED_FACT` = "Found in your
  documents"; `ALLEGATION` = "Alleged by a party"; `PARTY_POSITION` = "A party's position";
  `USER_STATEMENT` = "Your account"; `AI_INFERENCE` = "AI observation"; `LEGAL_INTERPRETATION` =
  "A legal question".
- Confidence is always a phrase: "Stated directly in a document" · "Supported by the records" ·
  "Possible — worth checking" · "Not established". **Never a number, percentage, score, or bar.**
- OCR-derived figures carry an inline amber caveat: "This figure was read by computer from a scan —
  check it against the original."
- Ordering inside a claim: class badge → confidence phrase → claim text → citation chip → caveat.
- "not established" is never red, never an exclamation mark, never "Sorry, I couldn't find
  anything." Pattern: "Your papers don't answer this yet." + what they *do* show.

### 3.3 Copy patterns that are mandatory when the situation arises

| Situation | Mandatory pattern |
|---|---|
| Abstention | "Your papers don't answer this yet." + nearest supported facts |
| Uncertain date | "On or about 14 June 2021 (the document says 'on or about')" |
| OCR figure | "This figure was read by computer from a scan — check it against the original." |
| Allegation | "Alleged by [party]" — never in the grammatical voice of established fact |
| Apparent inconsistency | "These statements appear inconsistent as to timing." + possible explanations |
| Legal question | "This is a question for your lawyer." |
| Missing evidence | "Your papers don't include a bank statement for March–June 2021. Would that help?" |
| Empty case | "Nothing here yet. Add your papers to get started." |
| Non-advice footer | "Prepared by [user] with AI assistance for discussion with counsel. Not legal advice. Not for filing." |
| Legal-advice refusal (verbatim, required) | "I can't tell you what your legal position is or what you should do — that's your lawyer's role. What I can do is show you what your documents say, and help you organise your questions for your lawyer." + `[Show me the evidence about this]` `[Add this to my questions for my lawyer]` |
| Chain of custody | "We store your original files exactly as you uploaded them and record a digital fingerprint (SHA-256) of each one, so you can show that the file hasn't changed since you uploaded it. This is useful documentation, but it is not a legal guarantee that a court will accept a document as evidence. Ask your lawyer what you need for your matter." |

### 3.4 Navigation labels (consumer / professional)

Your case / Matter overview · What happened / Chronology · People / People & organizations ·
Your papers / Documents · What's alleged / Allegations · What doesn't add up / Inconsistencies ·
Money / Financial evidence · Connections / Relationship graph · Ask about my case / Case assistant ·
Prepare for your lawyer / Lawyer brief.

Supporting infrastructure (Review queue, Processing status, Saved views, Notes, Settings, Admin) is
**never** top-level navigation.

---

## 4. Required file structure

YAML frontmatter:

```yaml
---
title: <screen name>
status: draft
owner: Product Design
last_updated: 2026-02-14
phase: <MVP | Phase 2 | Phase 3>
features: [F01, F48]
---
```

Then, in this order:

1. **Screen purpose** — one paragraph answering "why does this screen exist".
2. **Entry points** — how a user arrives, from where.
3. **Hierarchy** — indented outline of the screen's content hierarchy.
4. **ASCII wireframe** — fenced code block, desktop width (≥ 100 columns), **real invented content**,
   never lorem ipsum. Show the canonical matter.
5. **Mobile wireframe** — a separate ASCII block, for at least: upload, timeline, evidence viewer,
   review queue, ask, documents.
6. **Primary actions** — table: action · trigger · result · permission required.
7. **States** — empty / loading / partial / error / zero-result, each with the **actual copy**.
8. **Interaction details** — keyboard map, focus behaviour, optimistic updates, undo.
9. **Copy strings** — the actual strings, using a stable key namespace.
10. **Accessibility notes** — semantics, announcements, alternatives. **A table alternative for every
    graph and timeline is mandatory, not optional.**
11. **Data dependencies** — endpoints from `../11-api-specification.md`.
12. **Acceptance criteria** — numbered, testable, referencing F-IDs.
13. **Open questions** — genuinely unresolved items only.

Target 900–1400 words per file. Depth is more important than brevity, but do not pad.

---

## 5. Design-system vocabulary to reuse

Tokens: `--surface-base/-raised/-sunken/-overlay`, `--text-primary/-secondary/-muted`,
`--border-subtle/-strong/-focus`, `--class-source|fact|allegation|position|user|inference|legal-ink`,
`--confidence-high|medium|low|unknown-ink`, `--caution-ocr-ink`, `--danger-ink`, `--space-1…20`,
`--radius-1…4`, `--elev-1…4`, `--motion-fast/base/slow/deliberate`, `--z-overlay/-sheet/-toast/-modal`,
`--type-display/h1/h2/h3/h4/body/quote/label/caption/overline/money`.

Components: ClaimCard, NotEstablished, ClassBadge, ConfidenceLabel, CitationChip, OcrCaveat,
EvidenceOverlay, TimelineEvent, TimelineTable, PersonCard, EventCard, AllegationCard, ConflictCard,
TransactionRow, BalanceMismatchWarning, GraphCanvas, GraphTable, ReviewItem, ReviewProgress,
ProcessingStatusRow, CoveragePanel, SearchResultRow, SavedViewChip, UploadDropzone, FileRow,
InterviewQuestion, NarrativeSection, BriefSection, VerificationSummary, ShareLinkDialog, EmptyState,
ErrorState, SkeletonLoader, ConfirmDestructive, UndoToast, KeyboardShortcutHint, DisclaimerFooter,
ProvenanceTooltip, CoverageChip, StatementEvolutionRow, FundTraceHop, ProcessingEta.

Breakpoints: 375 / 640 / 768 / 1024 / 1280 / 1600. Desktop wireframes at ≥ 100 columns.
Minimum touch target 44×44 CSS px on mobile, 24×24 minimum elsewhere.
