---
title: Allegations — What's alleged
status: draft
owner: Product Design
last_updated: 2026-02-14
phase: Phase 2
features: [F26, F29, F27, F16, F24, F12, F13]
---

# 09 — Allegations ("What's alleged" / Allegations)

## Screen purpose

This screen exists because the most frightening question a person in a legal matter faces is *"what
are they saying about me, and is there anything to it?"* The allegations matrix answers it without
ever offering a verdict: it shows what is alleged, who alleged it, what in the papers supports or
does not support it, what both sides appear to accept, and — crucially — what is missing. It is the
one screen in the product where the temptation to editorialise is strongest, so it is the screen with
the strictest copy rules. The status is *derived by rule from the evidence counts and displayed with
those counts*, so a user can disagree with the evidence rather than with a black box.

## Entry points

| From | How |
|---|---|
| Left rail | "What's alleged" — destination 5, appears once ≥ 1 allegation exists (14-UX §2.3) |
| Case dashboard | "About 3 things are alleged" summary card → the list |
| Allegation card | "What supports this" / "What doesn't" counts → the relevant panel, expanded |
| Person profile | "Allegations involving them" → the list, filtered |
| Conflict card | "Related allegation" link |
| Timeline | An event's `related_allegations` → the allegation |
| Ask | An answer listing supporting and contradicting evidence → "Open the full picture" |
| Lawyer Brief preview | Section 4 → the allegations included |
| Review queue | An AI-proposed allegation → "Open in the matrix" |
| Deep link | `/matters/:matterId/allegations/:id` (`?view=list` for the list) |

## Hierarchy

```
Allegations
├── Header
│   ├── H1 "What's alleged"
│   ├── Framing line — "3 things are alleged in this case. This screen shows what each one rests on."
│   ├── Status legend — collapsible; explains that status is derived from counts
│   └── Actions — [Add an allegation] [Add all three to my notes for my lawyer]
├── Allegation list (default landing)
│   └── AllegationCard × n
│       ├── The allegation text, with its own class badge and citation
│       ├── "Alleged by {party}" + date first alleged
│       ├── Status label + the counts that produced it
│       └── Counts: {n} support · {n} do not · {n} missing
└── Allegation detail — the five-panel matrix
    ├── Panel 1 — WHAT IS ALLEGED        (the pleading, quoted, with citation)
    ├── Panel 2 — WHAT SUPPORTS IT       (evidence items, each with class + confidence + citation)
    ├── Panel 3 — WHAT DOESN'T SUPPORT IT (same treatment, identical visual weight)
    ├── Panel 4 — WHAT BOTH SIDES APPEAR TO ACCEPT (undisputed facts)
    ├── Panel 5 — WHAT'S MISSING          (AI-suggested gaps, phrased as questions)
    ├── Related — witnesses · events · documents
    ├── Notes — user notes on this allegation
    └── Footer — status derivation disclosure + "Add to my notes for my lawyer"
```

## Desktop wireframe — the list

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Case IQ   Okafor v. Northgate Holdings Inc. ▾      ⌘K Search…        Ask        ?        DO ▾ │
├──────────────┬─────────────────────────────────────────────────────────────────────────────────┤
│ Your case    │  What's alleged                                                    [+ Add one]  │
│ What happened│  3 things are alleged in this case. This screen shows what each one rests on.   │
│ People       │  Status is worked out from the evidence below it — not chosen. [How status works]│
│ Your papers  ├─────────────────────────────────────────────────────────────────────────────────┤
│ What's alleged│ ┌─────────────────────────────────────────────────────────────────────────────┐│
│ What doesn't…│ │ ● ALLEGED BY A PARTY                          Evidence both supports and    ││
│ Money        │ │                                                does not support this        ││
│ Connections  │ │ The defendant, through its officers, caused CAD $310,000 of the              ││
│ Ask about…   │ │ plaintiff's invested funds to be transferred to Meridian Payments Ltd. for   ││
│ Prepare for… │ │ purposes outside the scope permitted by the Subscription Agreement.          ││
│              │ │                                                                              ││
│ ─────────────│ │ 📄 Disclosure Vol. 1 · p. 4              Alleged by David Okafor             ││
│ Things to    │ │                                          First alleged 2024-03-11           ││
│ check  12    │ │ 5 items support it · 4 do not · 4 things are missing                        ││
│ Reading your │ │ [Open the full picture]   [Mark as important]   [Add to my notes]            ││
│ papers  9    │ └─────────────────────────────────────────────────────────────────────────────┘│
│              │                                                                                 │
│              │ ┌─────────────────────────────────────────────────────────────────────────────┐│
│              │ │ ● ALLEGED BY A PARTY                     Alleged — some evidence mentions  ││
│              │ │                                          this                                 ││
│              │ │ CAD $62,500 of the invested funds was transferred to a personal account      ││
│              │ │ associated with the defendant's Chief Executive Officer.                     ││
│              │ │                                                                              ││
│              │ │ 📄 Disclosure Vol. 1 · p. 5              Alleged by David Okafor             ││
│              │ │ ⚠ One figure here was read by computer    First alleged 2024-03-11           ││
│              │ │   from a scan — check it against the                                         ││
│              │ │   original.                                                                  ││
│              │ │                                                                              ││
│              │ │ 2 items support it · 0 do not · 3 things are missing                        ││
│              │ │ ⚠ The papers do not establish who owns the account ending 4471.               ││
│              │ │ [Open the full picture]   [Mark as important]                                ││
│              │ └─────────────────────────────────────────────────────────────────────────────┘│
│              │                                                                                 │
│              │ ┌─────────────────────────────────────────────────────────────────────────────┐│
│              │ │ ● ALLEGED BY A PARTY                     Some evidence supports this;        ││
│              │ │                                          nothing contradicts it            ││
│              │ │ The defendant failed to provide the plaintiff with an accounting of the      ││
│              │ │ use of the invested funds despite repeated requests.                         ││
│              │ │                                                                              ││
│              │ │ 📄 Disclosure Vol. 1 · p. 6              Alleged by David Okafor             ││
│              │ │                                           First alleged 2024-03-11          ││
│              │ │ 2 items support it · 2 do not · 2 things are missing                        ││
│              │ │ ⓘ "Some evidence supports this" means some evidence mentions it and nothing  ││
│              │ │   here says otherwise. It does not mean it happened.                         ││
│              │ │ [Open the full picture]                                                      ││
│              │ └─────────────────────────────────────────────────────────────────────────────┘│
├──────────────┴─────────────────────────────────────────────────────────────────────────────────┤
│  Nothing on this screen says whether anything is true. That is for your lawyer and the court.   │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Desktop wireframe — the five-panel matrix (A-01 open)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ← What's alleged                                                                              │
│                                                                                                │
│  ● ALLEGED BY A PARTY                     Evidence both supports and does not support this     │
│  The defendant, through its officers, caused CAD $310,000 of the plaintiff's invested funds to  │
│  be transferred to Meridian Payments Ltd. for purposes outside the scope permitted by the       │
│  Subscription Agreement.                                                                       │
│  Alleged by David Okafor · first alleged 2024-03-11 · 📄 Disclosure Vol. 1 · p. 4, ¶18            │
│  5 support · 4 do not · 4 missing      [How this status was worked out ▾]                      │
├──────────────────────────────────────────────┬─────────────────────────────────────────────────┤
│ ① WHAT IS ALLEGED                            │ ② WHAT SUPPORTS IT            5 items           │
│                                              │                                                 │
│ ┌──────────────────────────────────────────┐ │ ┌─────────────────────────────────────────────┐ │
│ │ "The defendant, through its officers,    │ │ │ ● FROM THE DOCUMENT     Stated directly in  │ │
│ │  caused CAD $310,000 of the plaintiff's  │ │ │                          a document          │ │
│ │  invested funds to be transferred to     │ │ │ "…shall be used solely for product          │ │
│ │  Meridian Payments Ltd. for purposes     │ │ │ development and working capital…"           │ │
│ │  outside the scope permitted by the      │ │ │ 📄 Subscription Agreement · Vol. 2 p. 9 ¶7.2│ │
│ │  Subscription Agreement."                │ │ │ [important] [explained] [needs looking into]│ │
│ │                                          │ │ └─────────────────────────────────────────────┘ │
│ │ 📄 Disclosure Vol. 1 · p. 4 ¶18           │ │ ┌─────────────────────────────────────────────┐ │
│ └──────────────────────────────────────────┘ │ │ ● FOUND IN YOUR DOCUMENTS  Supported by the │ │
│                                              │ │                            records          │ │
│ From the Statement of Claim. This is what    │ │ CAD $310,000 was transferred from           │ │
│ the plaintiff says. It is not a finding.     │ │ Northgate Holdings to Meridian Payments     │ │
│                                              │ │ Ltd. on 2021-06-14.                         │ │
│                                              │ │ 📄 Bank statement · Vol. 4 p. 7             │ │
│                                              │ │ 📄 Wire transfer confirmation · Vol. 4 p. 1 │ │
│                                              │ └─────────────────────────────────────────────┘ │
│                                              │ ┌─────────────────────────────────────────────┐ │
│                                              │ │ ● FROM THE DOCUMENT                         │ │
│                                              │ │ The Meridian invoice describes the services │ │
│                                              │ │ only as "consulting services".              │ │
│                                              │ │ 📄 Meridian invoice · Vol. 5 p. 1           │ │
│                                              │ └─────────────────────────────────────────────┘ │
│                                              │ ┌─────────────────────────────────────────────┐ │
│                                              │ │ ● FOUND IN YOUR DOCUMENTS                   │ │
│                                              │ │ Northgate's audited statements classify the │ │
│                                              │ │ Meridian payment as "professional fees".    │ │
│                                              │ │ 📄 Financial statements · Vol. 7 p. 11      │ │
│                                              │ └─────────────────────────────────────────────┘ │
│                                              │ ┌─────────────────────────────────────────────┐ │
│                                              │ │ ● FOUND IN YOUR DOCUMENTS                   │ │
│                                              │ │ James Whitmore says he raised concerns      │ │
│                                              │ │ about the payment in June 2021.             │ │
│                                              │ │ 📄 Affidavit of J. Whitmore · Vol. 6 p. 4   │ │
│                                              │ └─────────────────────────────────────────────┘ │
├──────────────────────────────────────────────┼─────────────────────────────────────────────────┤
│ ③ WHAT DOESN'T SUPPORT IT      4 items       │ ④ WHAT BOTH SIDES APPEAR TO ACCEPT              │
│                                              │                                                 │
│ ┌──────────────────────────────────────────┐ │ · The Subscription Agreement exists, and the    │
│ │ ● FROM THE DOCUMENT                      │ │   amounts paid under it: CAD $250,000 on        │
│ │ The agreement permits "working capital   │ │   2021-03-09 and CAD $225,000 on 2021-05-31.    │
│ │ and related corporate purposes".         │ │   📄 Vol. 2 p. 9 · Vol. 4 p. 2 · Vol. 4 p. 5     │
│ │ 📄 Subscription Agreement · Vol. 2 p. 9  │ │                                                 │
│ │                          ¶7.3            │ │ · CAD $310,000 was transferred from Northgate   │
│ └──────────────────────────────────────────┘ │   Holdings to Meridian Payments Ltd. on         │
│ ┌──────────────────────────────────────────┐ │   2021-06-14.                                   │
│ │ ● FROM THE DOCUMENT                      │ │   📄 Vol. 4 p. 7 · Vol. 4 p. 1                   │
│ │ Whitfield emails about "the Meridian     │ │                                                 │
│ │ arrangement" as a corporate matter.      │ │ · Meridian Payments Ltd. received the funds.    │
│ │ 📄 Email thread · Vol. 5 p. 1            │ │   📄 Vol. 4 p. 7                                 │
│ └──────────────────────────────────────────┘ │                                                 │
│ ┌──────────────────────────────────────────┐ │ This panel lists things the papers treat as     │
│ │ ● A PARTY'S POSITION                     │ │ agreed. It is not a list of what is true.       │
│ │ The transfers were legitimate intra-group│ │                                                 │
│ │ movements authorised under the agreement.│ │                                                 │
│ │ 📄 Statement of Defence · Vol. 2 p. 6 ¶22│ │                                                 │
│ │ A denial. It is not evidence of anything.│ │                                                 │
│ └──────────────────────────────────────────┘ │                                                 │
│ ┌──────────────────────────────────────────┐ │                                                 │
│ │ ● FROM THE DOCUMENT                      │ │                                                 │
│ │ The board minutes of 2021-06-01 make no  │ │                                                 │
│ │ reference to Meridian.                   │ │                                                 │
│ │ 📄 Board minutes · Vol. 6 p. 1–4         │ │                                                 │
│ │ ⓘ An absence is not the same as a "no".  │ │                                                 │
│ │   The papers do not say the board refused.│ │                                                 │
│ └──────────────────────────────────────────┘ │                                                 │
├──────────────────────────────────────────────┴─────────────────────────────────────────────────┤
│ ⑤ WHAT'S MISSING            4 items, all suggested by AI — mark any you don't agree with        │
│                                                                                                │
│ ? Is there a bank record from Meridian Payments Ltd. showing where the CAD $310,000 went?       │
│   AI observation · Possible — worth checking · [Add to my questions for my lawyer] [Dismiss]     │
│ ? Is there any internal approval document for the transfer, such as an authorisation form or     │
│   board resolution?  AI observation · Possible — worth checking · [Add to my questions] [Dismiss]│
│ ? What services, if any, did Meridian Payments Ltd. actually deliver for the CAD $310,000?      │
│   AI observation · [Add to my questions for my lawyer] [Dismiss]                                 │
│ ? Is there a complete board minute book for 2021, beyond the minutes you have?                  │
│   AI observation · [Add to my questions for my lawyer] [Dismiss]                                 │
│                                                                                                │
│ ⓘ These are questions, not conclusions. Nothing here suggests anyone held anything back.         │
│   The papers simply don't contain it. [Add my own]                                              │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│  RELATED    Witnesses: Michael Chen · Sarah Whitfield · James Whitmore                          │
│             Events: 2021-05-28 · 2021-06-11 · 2021-06-14 · 2021-06-15 · 2021-06-22               │
│             Documents: 9   [See all]                                                            │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│  MY NOTES    "The 2021 statement refers to a different account." — you, 2026-02-09  [Edit]       │
│              [Add a note]                                                                       │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│  [Add to my notes for my lawyer ✓ Added]     Status worked out from 5 support and 4 don't.       │
│  Nothing here says whether the allegation is true. Case IQ is not legal advice.                 │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Primary actions

| Action | Trigger | Result | Permission required |
|---|---|---|---|
| Open an allegation | Card click, or `Enter` on the card | Five-panel matrix opens | `matter:read` |
| Add an allegation | `+`, or "Add one" | Manual allegation, `created_by = user`, marked "Added by you" and rendered distinctly | `matter:write` |
| Open an evidence item's source | Citation chip on any item | `EvidenceOverlay`; one click, context preserved | `matter:read` |
| Mark an item important | Item overflow → "Important" | Item is pinned in its panel and offered to the brief | `matter:review` |
| Mark an item explained | Item overflow → "Explained" | User supplies a reason; the item is annotated and the reason is retained | `matter:review` |
| Mark needs looking into | Item overflow → "Needs looking into" | Item joins the investigation questions in the brief, section 12 | `matter:review` |
| Override an item's stance | Item overflow → "Change how this counts" | Moves the item between "supports" and "doesn't support"; recomputes the status; records the change | `matter:review` |
| See the status derivation | "How this status was worked out" | Expands the rule, the counts, and the arithmetic that produced the label | `matter:read` |
| Add a missing-evidence question | Panel 5 → "Add my own" | A user-authored question, marked `created_by = user` | `matter:write` |
| Dismiss a suggested gap | Panel 5 → "Dismiss" | Removed from the list; retained as dismissed, not deleted | `matter:write` |
| Add to my notes for your lawyer | Footer button | Included in the Lawyer Brief, section 4 | `matter:write` |
| Add a note | "Add a note" | Note attached to the allegation (F25) | `matter:write` |
| Recompute the status | Overflow → "Work out the status again" | Forces recomputation after stance overrides | `matter:review` |

## States

**Empty (no allegations yet).**
> "Nothing is alleged here yet.
> We haven't found an allegation in your papers. Once you add a statement of claim or a similar
> document, anything alleged in it will appear here with the evidence around it."
> `[Add your papers]` `[Add an allegation myself]`

**Empty (list filtered to nothing).**
> "No allegations match that filter. [Show all 3]"

**Loading.** Four skeleton cards (not five — the legend and framing line render immediately, because
they are static copy). A `role="status"` region announces "Loading what's alleged…".

**Partial (processing incomplete).**
> "Showing what we've found so far. 9 documents are still being read, so more evidence may appear
> under each of these. [See what's left]"

**Partial (some evidence items lack citations).**
> "1 item under this allegation has no source we can point to, so it isn't shown as evidence.
> [See what was set aside]"

**Error (recoverable).**
> "We couldn't load the evidence for this allegation. Nothing has been changed.
> `[Try again]` `[Open the allegation's own source]`"

**Error (fatal).**
> "Something went wrong on our side. Reference: req_01HQ9F2N7K.
> Your papers and your notes are unaffected. `[Reload]`"

**Zero-result on a panel.**
> Panel 2 empty: "Nothing in your papers supports this yet." (Never an error style.)
> Panel 3 empty: "Nothing in your papers says otherwise about this."
> Panel 4 empty: "The papers don't treat anything here as agreed."
> Panel 5 empty: "We haven't spotted anything missing here. That doesn't mean nothing is — it means
> the papers give us nothing to go on."

**Unattributed allegation (F26 AC-4).**
> The card reads: `source not identified` in place of "Alleged by {party}", styled as a neutral chip,
> never left blank.

## Status label copy rules (binding)

The status enum is computed by the deterministic function in `09-evidence-provenance.md` §8.1. It is
**never** chosen by a model and **never** displayed without the counts that produced it.

| Enum | Consumer label (individual persona) | Professional label | What it means, in words the UI shows |
|---|---|---|---|
| `alleged` | "Alleged — some evidence mentions this" | Alleged | "Something in your papers mentions this. Nothing in your papers says otherwise — and nothing confirms it either." |
| `partially_supported` | "Some evidence supports this; nothing contradicts it" | Partially supported | "Some evidence mentions this and nothing here says otherwise. That is not the same as it being true." |
| `disputed` | "Evidence both supports and does not support this" | Disputed | "There is evidence on both sides. Your lawyer can tell you what to make of it." |
| `unsupported_in_uploaded_evidence` | "Nothing in your papers supports this yet" | Unsupported in uploaded evidence | "The papers you've added don't address this. That may mean the evidence exists elsewhere." |
| `unresolved` | "Not enough to say either way" | Unresolved | "The papers don't give us enough to say anything about this." |

**Rules that engineering must enforce with a copy-lint test:**

1. **There is no `proven` and no `established` status.** The enum has no verdict value by design
   (`09-evidence-provenance.md` §8.1 note 2).
2. `partially_supported` must **never** be paraphrased as "probably true", "likely", "supported by
   the evidence" (bare), or "looks credible". The mandatory qualifier in the table above is part of
   the label, not a tooltip.
3. No status label, tooltip, empty state, or export string may contain: *true, false, valid, invalid,
   credible, unreliable, wrong, right, honest, dishonest, actually happened, did not happen,
   substantiated, unsubstantiated, fails, succeeds*.
4. Status is **never** rendered with a colour that reads as good or bad. No green, no red, no
   amber-as-warning. Each status is a neutral outlined chip with its own **glyph** (below), so it
   survives greyscale printing.
5. Status is always shown with the counts. A bare status label is a defect: the derivation must be
   visible so the user can disagree with the evidence rather than with the system.
6. The qualifier line at the foot of every allegation is mandatory:
   > "Nothing on this screen says whether anything is true. That is for your lawyer and the court."

**Status glyphs (shape, not colour):**

| Status | Glyph | Meaning of the glyph |
|---|---|---|
| `alleged` | single hollow circle | one mention, nothing against it |
| `partially_supported` | two hollow circles, side by side | more than one mention, nothing against it |
| `disputed` | two opposed arrows | evidence in both directions |
| `unsupported_in_uploaded_evidence` | hollow circle with a gap | nothing in the papers |
| `unresolved` | circle with a question mark inside | not enough to say |

## Interaction details

### Keyboard map

| Key | Action |
|---|---|
| `J` / `↓` | Next allegation in the list |
| `K` / `↑` | Previous allegation |
| `Enter` | Open the selected allegation's matrix |
| `Esc` | Return from the matrix to the list; restore focus to the card |
| `1` – `5` | Jump to panel 1–5 |
| `S` | Jump to the next item within the current panel |
| `I` | Mark the focused item important |
| `E` | Mark the focused item explained (opens the reason field) |
| `N` | Mark the focused item as needing investigation |
| `O` | Open the focused item's source overlay |
| `U` | Undo the last disposition |
| `B` | Add the allegation to your notes for your lawyer |
| `?` | Keyboard shortcut hint |

### Focus behaviour

- The list uses a roving `tabindex`: the list itself is one stop, then `J`/`K` move the cursor.
- Opening a matrix moves focus to the panel-1 heading.
- `Esc` from the matrix returns to the allegation list and restores focus to the card that was opened.
- Opening a source overlay from within a panel traps focus in the overlay; `Esc` returns focus to the
  exact item's citation chip.
- The stance-override control is a `radiogroup`: "Supports this / Does not support this", navigated
  with `←`/`→`.

### Optimistic updates

- Stance overrides apply locally and the status label recomputes immediately (client-side evaluation
  of the same pure function, confirmed server-side). If the server disagrees, the label reverts and a
  toast explains.
- "Important", "Explained", and "Needs looking into" apply immediately and reconcile within 2 seconds.
- "Add to my notes for your lawyer" applies immediately with a check-marked button state and
  reconciles; failure reverts the button and names the failure.

### Undo

- All four dispositions are undoable for the session, with a 6-second toast and `U` afterwards.
- Stance overrides are undoable and each override records an audit entry with the previous value.
- Dismissing a suggested gap is undoable; the gap is retained in a collapsed "Dismissed suggestions"
  group rather than deleted.

## Copy strings

```
allegations.title                   "What's alleged"
allegations.framing                 "{n} things are alleged in this case. This screen shows what each one rests on."
allegations.status.disclaimer       "Status is worked out from the evidence below it — not chosen."
allegations.status.howItWorks       "How status works"
allegations.footer.disclaimer       "Nothing on this screen says whether anything is true. That is for your lawyer and the court."

allegations.panel.alleged           "What is alleged"
allegations.panel.supports          "What supports it"
allegations.panel.doesNotSupport    "What doesn't support it"
allegations.panel.accepted          "What both sides appear to accept"
allegations.panel.missing           "What's missing"

allegations.panel.supports.empty    "Nothing in your papers supports this yet."
allegations.panel.doesNot.empty     "Nothing in your papers says otherwise about this."
allegations.panel.accepted.empty    "The papers don't treat anything here as agreed."
allegations.panel.missing.empty     "We haven't spotted anything missing here. That doesn't mean nothing is — it means the papers give us nothing to go on."
allegations.panel.supports.count    "{n} items"
allegations.panel.missing.count     "{n} items, all suggested by AI — mark any you don't agree with"
allegations.panel.accepted.note     "This panel lists things the papers treat as agreed. It is not a list of what is true."
allegations.panel.missing.note      "These are questions, not conclusions. Nothing here suggests anyone held anything back. The papers simply don't contain it."
allegations.panel.claim.note        "From the Statement of Claim. This is what the plaintiff says. It is not a finding."

allegations.status.alleged          "Alleged — some evidence mentions this"
allegations.status.partiallySupported "Some evidence supports this; nothing contradicts it"
allegations.status.disputed         "Evidence both supports and does not support this"
allegations.status.unsupported      "Nothing in your papers supports this yet"
allegations.status.unresolved       "Not enough to say either way"

allegations.status.explain.alleged  "Something in your papers mentions this. Nothing in your papers says otherwise — and nothing confirms it either."
allegations.status.explain.partial  "Some evidence mentions this and nothing here says otherwise. That is not the same as it being true."
allegations.status.explain.disputed "There is evidence on both sides. Your lawyer can tell you what to make of it."
allegations.status.explain.unsupported "The papers you've added don't address this. That may mean the evidence exists elsewhere."
allegations.status.explain.unresolved "The papers don't give us enough to say anything about this."

allegations.counts                  "{s} items support it · {d} do not · {m} things are missing"
allegations.counts.note             "Status worked out from {s} support and {d} don't."

allegations.item.stance.support     "Supports this allegation"
allegations.item.stance.doesNot     "Does not support this allegation"
allegations.item.stance.override    "Change how this counts"
allegations.item.partyPosition      "A denial. It is not evidence of anything."
allegations.item.absenceNote        "An absence is not the same as a \"no\". The papers do not say the board refused."

allegations.action.addAllegation    "Add an allegation"
allegations.action.openFull         "Open the full picture"
allegations.action.important        "Mark as important"
allegations.action.explained        "Explained"
allegations.action.investigate      "Needs looking into"
allegations.action.addToBrief       "Add to my notes for my lawyer"
allegations.action.addedToBrief     "Added to your notes for your lawyer"
allegations.action.addOwnGap        "Add my own"
allegations.action.dismiss          "Dismiss"
allegations.action.addNote          "Add a note"
allegations.action.recompute        "Work out the status again"
allegations.action.seeDerivation    "How this status was worked out"

allegations.unattributed            "source not identified"
allegations.ocr.ownership           "The papers do not establish who owns the account ending 4471."
allegations.addedByUser             "Added by you"
allegations.aiProposed              "AI observation"

allegations.empty.new              "Nothing is alleged here yet."
allegations.empty.new.body         "We haven't found an allegation in your papers. Once you add a statement of claim or a similar document, anything alleged in it will appear here with the evidence around it."
allegations.empty.filtered         "No allegations match that filter."
allegations.empty.filtered.action  "Show all {n}"
allegations.loading                "Loading what's alleged…"
allegations.partial                "Showing what we've found so far. {n} documents are still being read, so more evidence may appear under each of these."
allegations.partial.uncited        "{n} item under this allegation has no source we can point to, so it isn't shown as evidence."
allegations.error.recoverable      "We couldn't load the evidence for this allegation. Nothing has been changed."
allegations.error.fatal            "Something went wrong on our side. Reference: {ref}."

allegations.toast.important        "Marked as important · Undo"
allegations.toast.stance           "Now counted as {stance}. The status has been worked out again. · Undo"
allegations.toast.failed           "That didn't save. Your change was put back."
allegations.toast.addedToBrief     "Added to your notes for your lawyer"
```

## Accessibility notes

**Semantics.**

- Each of the five panels is a `<section>` with a heading (`<h2>`) so the matrix is navigable by
  heading, and the panel count is included in the heading: "What supports it, 5 items".
- Evidence items are `<article>`s inside an ordered list; each exposes the class badge and confidence
  phrase before its text, matching `ClaimCard`'s announcement order.
- Evidence counts are rendered as a definition list (`<dl>`): "Items that support it — 5". They are
  never a graphic, a bar, or a coloured indicator.
- Status glyphs are `aria-hidden="true"`; the status **text** carries the meaning. The glyph exists for
  greyscale and colour-blind readers of the printed and on-screen form, not as the accessible name.
- Stance is a radio group with a visible label; its current value is announced as part of the item.
- Panel 4 is a `<ul>` of accepted facts, each with its own citations, not prose.
- Panel 5's suggestions are a list of questions, each labelled "AI observation" and "Possible — worth
  checking"; they are never rendered as statements.

**Announcements.**

- On opening an allegation: a `role="status"` region announces
  `"Allegation opened. {n} items support it, {n} do not, {n} things are missing."`
- On a stance override:
  `"Item now counted as not supporting this allegation. Status worked out again: evidence both supports and does not support this, 4 support and 5 do not."`
  — the full recomputation is announced, not just the change.
- Marking an item important announces `"Marked as important. This will go in your notes for your lawyer."`
- Adding to the brief announces `"Added to your notes for your lawyer."`
- The disclaimer footer is a persistent `<footer>` and is not announced on every navigation.

**Table alternative.** The counts and the status derivation are exposed as a real `<table>` under
"How this status was worked out", with columns `Stance · Items · Class · Sources`, so the arithmetic
is available as structured data rather than a sentence. This table is also what prints.

**Other.**

- Reduced motion: the matrix does not animate between panels; the `1`–`5` jumps are instantaneous.
- At 200% zoom the two-column desktop layout reflows to one column with panels in the specified order
  (1, 2, 3, 4, 5) — never reordered by visual weight.
- Minimum target 24×24, 44×44 for the disposition buttons on touch.
- Contrast: all class, confidence, and status chips meet ≥ 4.5:1 on their own surfaces in both themes;
  the amber caution text meets ≥ 4.5:1, which is a hard design-system requirement.
- Every evidence item's citation chip is a real link with an accessible name that includes the
  document name and page.

## Data dependencies

| Purpose | Endpoint |
|---|---|
| Allegations list with status and counts | `GET /allegations` |
| Full five-panel matrix | `GET /allegations/:id` |
| Status plus the inputs that produced it | `GET /allegations/:id/status` |
| Force recomputation | `POST /allegations/:id/recompute` |
| Create an allegation (AI-proposed or user) | `POST /allegations` |
| Edit text, `alleged_by`, date first alleged | `PATCH /allegations/:id` |
| Attach evidence with a stance | `POST /allegations/:id/evidence` |
| Override stance, importance, note | `PATCH /allegations/:id/evidence/:evidenceId` |
| Detach evidence | `DELETE /allegations/:id/evidence/:evidenceId` |
| Missing-evidence gaps | `GET/POST /allegations/:id/missing-evidence` |
| Add to the brief | `POST /allegations/:id/add-to-brief` |
| Citation metadata and page render | `GET /evidence/:citationId` |
| Related events | `GET /matters/:matterId/events?allegation=:id` |
| Related people | `GET /matters/:matterId/entities?allegation=:id` |
| Notes | `GET/POST /matters/:matterId/notes` |
| Correction history for an item | `GET /assertions/:assertionId/revisions` |
| Assertion with provenance | `GET /assertions/:assertionId` |

## Acceptance criteria

1. A copy-lint test over this module's entire string table finds zero truth or credibility assertions:
   no *proved, established that he, guilty, innocent, credible, lied, true, false* in any user-facing
   string. (F26 AC-1, AC-6, G-03)
2. Status derivation is a pure function covered by a unit test with a full truth table, and the UI
   displays the counts that produced the label on every card and every detail view.
   (F26 AC-2, 09-EP §8.1)
3. Every evidence item links to a source span and displays its assertion class.
   (F26 AC-3, 09-EP §5)
4. An allegation with no identified author renders `source not identified` and is never presented
   unattributed. (F26 AC-4)
5. A user-added allegation is marked `created_by = user` and renders distinctly in this screen and in
   every export. (F26 AC-5)
6. Panel 5 suggestions are phrased as questions, are labelled `AI_INFERENCE`, are user-editable and
   dismissible, and no gap statement implies that anyone held anything back. (F29 AC-1, AC-3, AC-4)
7. Overriding a stance recomputes the status and records the change in the audit log.
   (09-EP §8.2)
8. Every panel renders a correct, honest empty state rather than disappearing.
9. The status labels never appear without the counts that produced them; a bare label is a defect.
10. The five-panel order is fixed (alleged, supports, does not support, accepted, missing) and does
    not reorder responsively.
11. The screen is usable at 375px and at 200% zoom, and the panels reflow in order.
12. The mandatory qualifier appears on every allegation detail view:
    "Nothing on this screen says whether anything is true."
13. Adding an allegation to the brief includes it in Lawyer Brief section 4 with its class badges and
    citations intact.
14. No status glyph or chip uses red, green, or amber-as-warning; status is distinguishable in
    greyscale. (design-system DS-2, DS-3)

## Open questions

1. **Does panel 4 ("What both sides appear to accept") need a source for "both sides"?** We currently
   infer acceptance from the absence of a denial in the pleadings. That is an inference, not a
   statement, and it may need to be labelled `AI_INFERENCE` with its own confidence rather than
   presented as a flat list. This needs a decision before build, because it changes the panel's class
   badges.
2. **Who may create an allegation?** Currently any user with `matter:write`. For a professional
   matter, an allegation is a legal characterisation and arguably needs a higher bar. The permission
   model in `12-security-architecture.md` §5 does not yet express this.
3. **Should `partially_supported` be shown at all on consumer surfaces?** It is the label most likely
   to be misread as encouragement, despite the mandatory qualifier. The alternative is to show only
   `alleged` and `disputed` to consumers and reserve the five-value enum for professionals. This is a
   product decision with real ethical weight, and it should be tested with self-represented litigants
   before it is settled.
4. **Stance overrides and the status function.** When a user overrides a stance, we recompute from
   their judgement rather than the AI's. It is unresolved whether the derived status should record
   *which* inputs were human-overridden, so that a reader can see the status was partly built on a
   person's view rather than the system's. This matters for the professional-liability trail in
   `02-user-personas.md` C.5.
5. **Cross-allegation evidence.** A single document (the Subscription Agreement, for instance) bears
   on more than one allegation. Whether an item may be attached to two allegations with different
   stances is undecided; the current data model permits it, and it is unclear whether that is
   correct or merely convenient.
6. **Missing-evidence category vocabulary.** Panel 5 currently produces free-text questions. A
   controlled taxonomy of gap categories (statement, instrument, witness, accounting, approval) would
   make gaps filterable and comparable across matters, but risks turning questions back into
   assertions. Not resolved.
