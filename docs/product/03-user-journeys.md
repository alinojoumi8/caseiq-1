---
title: Case IQ — User Journeys
status: draft
owner: Product
last_updated: 2026-02-14
version: 1.0
---

# 03 — User Journeys

Journeys are the contract between product and engineering. Each journey states its **entry
condition**, its **steps** as observable user-visible state, its **success condition**, and its
**failure modes with recovery**. Acceptance criteria derive from these.

Personas referenced: **A** = self-represented litigant, **B** = client with counsel,
**C** = lawyer/paralegal, **D** = legal team, **E** = advocate.

---

## Journey index

| ID | Journey | Persona | Phase | Priority |
|---|---|---|---|---|
| J1 | From a folder of chaos to a first chronology | A, B | MVP | P0 |
| J2 | Understand what happened (deep read) | A, B | MVP | P0 |
| J3 | Review and correct what the AI found | ALL | MVP | P0 |
| J4 | Ask the case a question | A, B, C | MVP | P0 |
| J5 | Prepare for a lawyer meeting | A, B | MVP | P0 |
| J6 | Understand an allegation and its evidence | A, B, C | P1 | P0 |
| J7 | Investigate conflicting accounts | A, C | P2 | P0 |
| J8 | Follow the money | B, C, F | P3 | P1 |
| J9 | Tell my story in my own words | A, B | P2 | P0 |
| J10 | A lawyer onboarding a new matter | C | P1 | P1 |
| J11 | Running a matter as a team | D | P4 | P2 |
| J12 | Returning after a gap | ALL | MVP | P0 |
| J13 | Deleting a matter and everything in it | ALL | MVP | P0 |

---

## J1 — From a folder of chaos to a first chronology

**Persona:** A (primary), B · **Phase:** MVP · **Priority:** P0
**This is the single most important journey in the product.**

### Entry condition
Maria has a case created and between 50 and 2,500 pages of files in a folder, a ZIP, or her
downloads. She is on a laptop this time (phone is acceptable but slower).

### Steps

| # | User action | System state visible to user | Notes / requirements |
|---|---|---|---|
| 1 | Opens the case → clicks **Add your documents** | Upload surface with three routes: *Choose files*, *Choose a folder*, *Upload a ZIP* | No file-type lecture. One short line: "PDFs, Word, Excel, emails, photos and chat exports are all fine." |
| 2 | Selects ~180 files | Per-file rows appear immediately with name, size, and status `Waiting` | Client-side list must render 500 rows in under 1 second. Virtualise. |
| 3 | Upload begins | Overall progress bar + per-file progress. A running count: "142 of 180 uploaded". | Resumable. A dropped connection resumes rather than restarts. |
| 4 | Upload completes | "180 files uploaded. We're now reading them." Live per-file processing state; a grouped summary ("Reading… 46 of 180"), and an honest ETA that widens rather than lies. | ETA must be computed from observed throughput, and shown as a range. Never a fake countdown. |
| 5 | *Waits / leaves* | Progress persists. Email or in-app notification when processing completes. The case dashboard is usable during processing and shows partial results. | **Partial results during processing is a hard requirement.** Do not gate the whole UI behind READY. |
| 6 | Returns to **Timeline** | A chronology with dated events, each with a source chip. Header: "We found 214 events between 2019-03-04 and 2024-11-02. 61 are unconfirmed." | Sorted ascending, grouped by month. Approximate dates visibly distinct. |
| 7 | Clicks an event | Source panel opens on the right: the document page image, the quoted text highlighted, the extraction metadata. | One click. Never two. |
| 8 | Clicks **Looks right** | Event is marked reviewed; a count of reviewed events increments. | Micro-reward; progress is visible. |
| 9 | Clicks **Fix this** on another event | Inline editor: date (with "exact / approximate" toggle), description, people, evidence links. | On save, original AI extraction is preserved. |
| 10 | Sees the "What we couldn't do" panel | Lists: files that failed, pages that were unreadable, documents with no dates, possible duplicates. | Honesty panel. Never hidden. Always actionable. |

### Success condition
Maria reaches **Time to First Defensible Chronology**: at least one timeline event reviewed with
a verified citation, within 30 minutes of first upload — target median **under 15 minutes** for a
500-page matter.

### Failure modes and recovery

| Failure | User sees | Recovery |
|---|---|---|
| Unsupported file type | File row: "We can't read .XYZ files yet" with the file listed | User can download the list of skipped files; ZIP is unpacked so nested files still processed |
| Password-protected PDF | "This file is locked with a password" + a field to enter it | Password never stored beyond the single extraction attempt; never logged |
| Corrupt PDF | "We couldn't read this file. Your original is safe and downloadable." | Manual page-image upload as a fallback |
| Duplicate files | "We found 23 files that look like copies" with a merge/dedup review | Dedup is *suggested*, never silent |
| Upload interrupted | Resume prompt with bytes already received | Chunked resumable upload |
| Processing stuck > 30 min | "This is taking longer than usual" + status detail + contact path | Stuck-job watchdog; see `11-api-specification.md` §10 and `08-document-ingestion.md` §9 |
| Zero events extracted | "We read your documents but couldn't find dated events. This usually means the files are scans." + OCR opt-in | Guided remediation, never a dead end. |
| 2,500-page upload exceeds plan | Clear pre-upload warning with options *before* the upload starts | Never a mid-upload failure |

### Acceptance criteria (testable)

1. A 180-file, 1,200-page mixed-format set uploads and reaches a usable Timeline without manual intervention.
2. Upload is resumable after a network drop, verified by interrupting at 50% and reconnecting.
3. Per-file status is visible and accurate throughout.
4. Duplicate files are detected and flagged, not silently discarded.
5. The case is usable (Timeline shows partial results) while processing continues.
6. Every timeline event offers one-click access to its source page.
7. Unreadable, locked, and unsupported files are individually listed with the correct reason.
8. ETA is displayed as a range and updates based on observed throughput.
9. No file is ever modified, renamed in storage, or re-encoded.

---

## J2 — Understand what happened (deep read)

**Persona:** A, B · **Phase:** MVP · **Priority:** P0

### Entry condition
Processing has produced a Timeline and People list.

### Steps

1. Maria opens **Case Overview**. She sees a 6–10 sentence summary. **Every sentence carries a
   citation chip or an explicit "your account" / "party position" badge.**
2. She reads the summary and clicks a citation → source opens inline, scrolled to the highlight.
3. She opens **People** → sees 14 identified people with role guesses and mention counts.
4. She opens the person most central to her case. The profile shows: role, documents involving
   them, statements made by them, timeline events they appear in, and related people.
5. She notices a person who is actually two different people with the same name. She clicks
   **Not the same person** → the mention is split off.
6. She opens **Documents**, filters to `Affidavit`, sorts by date, and scans.
7. She uses search: `"Northgate" "transfer"` → results show document, page, matched snippet
   with highlight, and the reason it matched.
8. She clicks **Save this view** and names it "Key transfer documents".

### Success condition
Maria can articulate her matter's shape in her own words, pointing at documents, without having
read every page.

### Failure modes

| Failure | Mitigation |
|---|---|
| The summary contains a claim she does not recognise | Every summary sentence is individually citable; she can dispute a specific sentence (J3) |
| Wrong-person merge | Merge is *always* suggested and never automatic; a visible merge review queue; one-click split |
| Search returns too much | Query builder exposes filters (person, date, doc type, amount); results explain *why* they matched |
| She reads the AI summary instead of the documents | Summary sentences are visually subordinate to citations; the Case Overview nudges "read the source" on first view |

### Acceptance criteria

1. Every sentence of the case summary has either a verified citation or an explicit
   user/party-position badge — enforced by a test.
2. Person profiles list every document in which the person is a detected participant.
3. A merge can be undone without data loss and the split is recorded in the audit log.
4. Search results show a highlighted snippet and a match-reason label.
5. Saved views persist filters and are re-openable.

---

## J3 — Review and correct what the AI found

**Persona:** ALL · **Phase:** MVP · **Priority:** P0

### Entry condition
Any AI-extracted item exists.

### Steps

1. A **Review Queue** exists as a top-level destination with a count badge.
2. Items are grouped by type (events, people, roles, amounts, allegations) and sorted by
   impact.
3. For each item Maria can: **Looks right** · **Fix this** · **Not right — remove** ·
   **Can't tell**.
4. `Fix this` opens a focused editor that always shows the original AI value alongside the
   correction field.
5. On save, the correction is applied, the original is preserved, and the item is marked
   *corrected by you*.
6. A per-item history is available: who/what changed it, when, and why.
7. Corrections inform later extraction: if Maria has repeatedly corrected "consultant" for a
   person, later extractions of "director" for that person are surfaced with lower confidence
   and a note referencing her earlier correction.

### Success condition
Maria can review 100 extractions in under 15 minutes and trust that nothing was overwritten.

### Failure modes

| Failure | Mitigation |
|---|---|
| Review queue is overwhelming | Batch actions, keyboard shortcuts, "review by type", and a "show me only the important ones" default |
| User corrects something wrongly | Corrections are reversible; version history retained; the original AI value is always recoverable |
| Corrections silently change unrelated data | Corrections are scoped; dependent records are flagged, never auto-rewritten |

### Acceptance criteria

1. No user correction destroys the original AI value — verified by a database-level test that
   the original row still exists after any correction.
2. Every correction records: actor, timestamp, previous value, new value, optional reason, and
   linked evidence.
3. Reverting a correction restores prior state exactly.
4. Batch actions record one audit entry per affected item.
5. Review Queue count excludes items already reviewed.

---

## J4 — Ask the case a question

**Persona:** A, B, C · **Phase:** MVP · **Priority:** P0

### Entry condition
A case has at least one READY document.

### Steps

1. Maria opens **Ask about my case**.
2. She is offered example questions, phrased in plain English and drawn from *her* case ("What
   happened on 5 March 2022?", "Where did the $47,500 go?").
3. She types: *"Show me every document mentioning John Smith."*
4. Response streams as structured output:
   - A one-line direct answer.
   - A **table of matching documents** with date, type, page, and a highlighted snippet, each
     row clickable to source.
   - A footer: "12 documents matched. 3 more mention 'J. Smith' — [show]]"
5. She asks: *"What evidence supports the allegation that the funds were misused?"*
6. The answer **refuses to characterise** and instead lists supporting evidence, contradicting
   evidence, and what is missing — each with citations and class badges.
7. She asks: *"Who did Maria Santos meet in June 2021?"*
8. The system replies: **"The uploaded case materials do not establish this."** and offers the
   closest supported facts ("Here is what the materials do show about June 2021:").
9. She clicks **Send to my notes** on a useful answer; the answer is saved *with its citations
   intact*.

### Success condition
Every answer is either fully cited or explicitly abstains. Trust is increased, not eroded.

### Failure modes

| Failure | Mitigation |
|---|---|
| Model answers from prior knowledge, not the record | Context-restricted generation + citation verification agent + refusal path (see `07-ai-architecture.md` §6) |
| Citation points at the wrong page | Quote-match verification against extracted text; failed verification downgrades the claim to unsupported and hides it |
| Question is a request for legal advice | Refusal with a clear explanation and a redirect to "questions for your lawyer" |
| Question is about a person not in the record | Abstain; do not substitute a similarly-named person without flagging the ambiguity |
| Answer is correct but unusable | Structured answer templates by question intent (list, timeline, amount, comparison) |
| Prompt injection embedded in an uploaded document | Untrusted-content delimiting + injection screening; see `18-red-team-risks.md` RT-04 |

### Acceptance criteria

1. Every factual assertion in an answer renders with at least one citation chip resolving to a
   real document page.
2. A citation whose quoted span does not appear in the source is never displayed as a citation;
   the assertion is suppressed.
3. Abstention is produced when retrieval yields no supporting span above threshold.
4. Legal-advice questions return a refusal template, tested against a fixed adversarial prompt set.
5. Saved answers retain citation links and remain resolvable after document deletion (showing
   "source deleted" rather than a broken link).
6. Answer latency: first token < 3s at p50, complete < 20s at p95 for a 2,000-document case.

---

## J5 — Prepare for a lawyer meeting

**Persona:** A, B · **Phase:** MVP · **Priority:** P0
**This journey generates the growth loop.**

### Entry condition
Timeline has reviewed events; some allegations identified; user account exists.

### Steps

1. Maria clicks **Prepare for a lawyer** in the primary navigation.
2. A three-question wizard:
   - "What do you want your lawyer to help you with?" (free text, with suggestions)
   - "How much time do you have with them?" (20 / 45 / 60 minutes)
   - "What should they know first?" (free text, or "suggest it for me")
3. System generates the **Lawyer Brief** with the 14 standard sections
   (`04-feature-specification.md` F13).
4. Every statement in the brief shows a citation. She can click any citation to verify before
   exporting.
5. A **verification gate**: the brief displays "412 statements, 412 cited. 47 not yet reviewed
   by you — [review them]" before export is enabled for the *professional* format.
6. She chooses format: PDF · Word (.docx) · printable. She chooses whether to include the
   Document Index and the Raw Evidence appendix.
7. She adds her own cover note.
8. She exports. The export is logged. She is offered a share link for counsel (read-only,
   expiring, revocable).
9. She gets a checklist: "Bring these 6 documents. Ask about these 4 questions."

### Success condition
Maria walks into a 45-minute meeting where the lawyer starts at strategy rather than at
"tell me what happened."

### Failure modes

| Failure | Mitigation |
|---|---|
| Brief is too long | Length targets per section; "concise" and "full" modes; page-count preview |
| Brief contains a factual error | Verification gate surfaces unreviewed items; user must review or explicitly accept "unverified" items to export them |
| Brief presents an allegation as fact | Class badges survive export; the brief has a legend explaining them |
| Export leaks privileged material | Export respects the user's sensitivity markings; privileged documents are excluded unless explicitly included, and the choice is logged |
| User treats the brief as a court filing | Footer on every page: "Prepared by [user] with AI assistance for discussion with counsel. Not legal advice. Not for filing." |

### Acceptance criteria

1. Export succeeds for PDF and DOCX; both preserve citation anchors and the class legend.
2. Unreviewed AI statements are visually marked as unverified in the export and counted in the summary.
3. Every page carries the non-advice footer.
4. Privileged-marked documents are excluded by default, with the exclusion noted in the brief.
5. A share link is scoped, expiring, revocable, and access-logged.
6. The brief generates in under 60 seconds for a 2,000-document case.

---

## J6 — Understand an allegation and its evidence

**Persona:** A, B, C · **Phase:** P1 (data model in MVP) · **Priority:** P0

### Steps

1. Maria opens **Allegations**. She sees each allegation as a card with: the allegation text,
   who alleged it, when first alleged, status, and counts of supporting / contradicting
   evidence.
2. She opens *"The respondent used joint funds for personal expenses."*
3. She sees five panels:
   - **What is alleged** — the allegation as pleaded, with the pleading citation.
   - **What supports it** — evidence items with citations.
   - **What contradicts it** — evidence items with citations.
   - **What both sides appear to accept** — undisputed facts.
   - **What is missing** — evidence that would help establish or disprove it.
4. Each evidence item shows its class badge (`ALLEGATION` / `EXTRACTED FACT` / `SOURCE`).
5. She marks two items **important**, marks one **explained**, and one **needs investigation**.
6. She adds a note: "The 2021 statement refers to a different account."
7. She clicks **Add to lawyer brief** on the allegation.

### Success condition
Maria understands precisely what is and is not established, without the system ever telling her
who is right.

### Acceptance criteria

1. Status is computed from evidence counts and always one of: `alleged`,
   `partially_supported`, `disputed`, `unsupported_in_uploaded_evidence`, `unresolved`.
2. Status computation is deterministic and covered by unit tests.
3. **No status value and no UI copy anywhere in the module asserts truth, guilt, or credibility**
   — enforced by a copy lint test.
4. Every evidence item links to a source span.
5. "Missing evidence" is a user-editable list seeded by AI suggestions marked as AI inference.

---

## J7 — Investigate conflicting accounts

**Persona:** A, C · **Phase:** P2 · **Priority:** P0

### Steps

1. Maria opens **Conflicts** (user-facing name for the Contradiction Engine).
2. She sees card list: each shows Statement A (with source, date, quote) and Statement B, a
   neutral explanation of why they may conflict, possible explanations, and confidence.
3. Copy is neutral: *"These statements appear inconsistent as to timing."*
4. She marks one **Not actually contradictory** with a reason ("he was describing a different
   transaction") → it leaves the active list and is retained as resolved.
5. She marks one **Important** → it pins to the top and is added to the lawyer brief's
   Contradictory Evidence section.
6. She marks one **Requires investigation** → it becomes an open question in the brief.
7. She opens **Statement Evolution** for Witness A: a vertical chronological view of every
   statement the witness made, with material differences highlighted and links to each source.

### Success condition
Maria can find and verify inconsistencies without the system accusing anyone of lying.

### Acceptance criteria

1. **No output of this module contains credibility language.** A copy lint over the module's
   string table fails the build on words like *lied, lying, dishonest, untruthful, deceptive,
   fabricated*.
2. Every flagged conflict displays both source quotes with resolvable citations.
3. User dispositions are recorded and reversible.
4. A conflict whose sources are deleted is shown as unresolvable and removed from active counts.
5. Precision target: ≥ 70% of flagged conflicts are judged "genuinely worth looking at" by
   reviewers in the evaluation set (`17-ai-evaluation-framework.md` §7).

---

## J8 — Follow the money

**Persona:** B, C, F · **Phase:** P3 · **Priority:** P1

### Steps

1. David opens **Money**.
2. He sees a transaction ledger: date, from, to, amount, currency, account, type, description,
   linked people/orgs, and a source chip.
3. He filters: `amount > 10000`, `2021-01-01 to 2021-12-31`, `linked person: M. Chen`.
4. He clicks a row → source statement page opens at the transaction line with the line
   highlighted.
5. He builds a trace: selects a starting transaction and follows funds through linked
   transactions. The trace view shows `Investor Co → Northgate Holdings → Meridian Payments →
   RBC account ••4471` with each hop showing the supporting transaction and source.
6. **No transaction is labelled fraudulent, suspicious, legitimate, or criminal.** The UI shows
   amounts, parties, dates, and sources.
7. He exports the filtered ledger to CSV. The CSV includes document name, page, and quote
   columns for every row.

### Success condition
A traced flow is fully reproducible from sources by a third party.

### Acceptance criteria

1. Every ledger row has a source span; rows without one are shown in a separate
   "unverified extraction" section.
2. Currency amounts are stored as decimal with explicit currency; **no floating-point dollars**.
3. Totals always display their constituent count and are re-computable from the visible rows.
4. Traces are reproducible: a saved trace re-renders identically from stored links.
5. CSV/XLSX export carries provenance columns.
6. OCR-derived amounts are flagged with an OCR badge and an "verify this figure" prompt.

---

## J9 — Tell my story in my own words

**Persona:** A, B · **Phase:** P2 · **Priority:** P0

### Steps

1. Maria opens **Your story** (Story Builder).
2. She is asked one question at a time, in plain language, with a progress indicator and a
   "skip for now" option:
   - "What happened first, as far as you remember?"
   - "Who else was involved?"
   - "What happened next?"
   - "What are you accused of, or what is the other side saying about you?"
   - "Which part of that do you disagree with?"
   - "What documents support your version?"
   - "Who can confirm this?"
   - "What evidence do you think is missing?"
   - "Which events matter most?"
3. Free-text answers are accepted. The system never rejects an answer for being informal.
4. After each answer, the system proposes structure: "We think that mentions 3 events and 2
   people. [Link them]"
5. At the end, a **draft narrative** is produced, structured, in her words, with placeholders
   where evidence is missing: `[no document found for this]`.
6. She edits it directly. Every edit is versioned.
7. She links narrative paragraphs to timeline events and documents.
8. She marks it **My final version** — a locked, dated version for the brief.

### Success condition
Maria has a narrative she wrote, that she agrees with, that is evidence-linked where possible,
and honestly marked where not.

### Failure modes

| Failure | Mitigation |
|---|---|
| AI rewrites her words into legal language | Default mode is "light touch — keep my words"; a "help me phrase this" button is explicit and opt-in |
| AI inserts facts she did not state | Narrative generation may only use her answers + cited evidence, with every insertion marked as either `your words` or `from your documents: [citation]` |
| She contradicts her own earlier answer | Prompted neutrally: "Earlier you said X. Is this different?" — never corrected silently |

### Acceptance criteria

1. Every narrative sentence is attributable to either the user's answer or a citation.
2. Inserted evidence text is visually distinct and carries a citation.
3. Version history retains every draft.
4. The locked final version is immutable but can be forked into a new draft.
5. The narrative exports with the Lawyer Brief as "Client's Position".

---

## J10 — A lawyer onboarding a new matter

**Persona:** C · **Phase:** P1 · **Priority:** P1

### Steps

1. Priya creates an **Organization** (her firm) and a **Matter**.
2. She sets jurisdiction, court, file number, case type, and parties.
3. She invites a paralegal; assigns roles.
4. She uploads: disclosure (900 pages), client records, and a ZIP of emails.
5. She sets the matter's **confidentiality posture**: which AI providers may process it, whether
   strict no-retention mode is required, and the retention period.
6. She reviews the **extraction review queue** with keyboard shortcuts, verifying ~200 items.
7. She marks her reviews as "reviewed and adopted" so the record shows professional verification.
8. She exports a chronology for the settlement conference brief.

### Success condition
Record review that would have taken two days takes four hours, with a defensible verification
trail.

### Acceptance criteria

1. "Reviewed and adopted" is recorded per item with reviewer identity and timestamp.
2. Exports distinguish verified-and-adopted from AI-suggested-and-unreviewed.
3. Per-matter AI provider policy is enforced server-side, not merely displayed.
4. Keyboard-only review flow exists and is documented.
5. Bulk adopt is available but requires an explicit confirmation showing the count.

---

## J11 — Running a matter as a team

**Persona:** D · **Phase:** P4 · **Priority:** P2
Journey specified for completeness; not built before Phase 4.

Steps: team creates org → matters scoped to teams → ethical walls configured → external
counsel/expert granted time-limited scoped links → all access logged → matter closed with
retention policy applied → export then destruction with certificate of destruction.

Acceptance criteria: wall violations are impossible (not merely logged); external access expires
automatically; destruction is verifiable and produces a certificate listing what was destroyed
and what was retained.

---

## J12 — Returning after a gap

**Persona:** ALL · **Phase:** MVP · **Priority:** P0

Maria comes back after three weeks.

1. She sees **"Welcome back. Here's what changed and where you left off."**
2. Cards: 12 new documents processed · 47 new events found · 3 new possible conflicts · a
   deadline in 9 days.
3. A **Continue where you left off** button returns her to the exact review position.
4. Anything that changed materially while she was away is summarised, with citations.
5. Nothing is re-explained from scratch.

**Acceptance criteria:** session resume restores scroll position and review cursor; a
change-summary is generated only over the delta since last visit; the deadline card is accurate
to the day and links to the source of the deadline.

---

## J13 — Deleting a matter and everything in it

**Persona:** ALL · **Phase:** MVP · **Priority:** P0
*(Included in MVP because "deleted files remain in embeddings" is a named red-team risk.)*

### Steps

1. Settings → **Delete this case**.
2. Confirmation requires typing the case name.
3. A summary of exactly what will be deleted, itemised by category and count.
4. Two distinct actions are offered, clearly differentiated:
   - **Remove from my workspace** (recoverable for 30 days, then purged)
   - **Delete permanently** (immediate hard delete, no recovery)
5. On deletion, the system purges: object storage originals and derivatives, extracted text,
   every embedding vector, graph edges, cached AI summaries, chat history, exports, and share
   links.
6. A **deletion receipt** is produced listing categories and counts purged, with a timestamp.
7. Deletion events are retained in the audit log **as an event only** — recording that a
   deletion occurred and by whom, containing no case content.

### Success condition
A user asking "is it really gone?" gets a verifiable, itemised answer.

### Acceptance criteria

1. After permanent deletion, a vector similarity search over the workspace returns zero results
   referencing any deleted content — asserted by an automated test.
2. Object storage is emptied of both originals and derivatives — asserted by an automated inventory test.
3. Backup retention policy is disclosed honestly: "Backups are purged within N days" with the
   actual N.
4. Deletion receipt is downloadable.
5. Deletion cannot be performed by a role without `matter:delete` permission.
6. Deletion is queued and idempotent; a partially completed deletion resumes and reports accurately.

---

## Cross-journey requirements

These apply to every journey.

| Requirement | Detail |
|---|---|
| **Autosave** | Every edit autosaves within 2 seconds; a visible saving/saved indicator |
| **Never lose work** | A crashed session restores unsaved edits from a local draft |
| **Undo** | Every destructive action is undoable for at least the session, except permanent deletion |
| **Keyboard** | Every high-frequency review action has a keyboard shortcut |
| **Mobile** | View, review, approve, comment, and chat work on mobile; bulk editing may be desktop-first but must not be blocked without explanation |
| **Accessibility** | WCAG 2.2 AA on all journeys (see `15-design-system.md` §7) |
| **Performance** | No screen's initial content takes > 2.5s at p95 on a 2,000-document case |
| **Error honesty** | Every failure states what happened, what was preserved, and the next action |
| **Provenance** | Any statement shown to a user can be traced to its source in one click, from any surface, including exports |

---

## Related documents

- `02-user-personas.md` — who these journeys serve
- `04-feature-specification.md` — features implementing these journeys
- `14-ux-specification.md` — screens implementing these journeys
- `wireframes/` — screen-level specifications
- `16-testing-strategy.md` — how journey acceptance criteria become test suites
