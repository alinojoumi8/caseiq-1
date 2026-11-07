---
title: Evidence viewer — Your papers / citation overlay
status: draft
owner: Product Design
last_updated: 2026-02-14
phase: MVP
features: [F15, F16, F07, F20, F25, F24, F06]
---

# 10 — Evidence viewer (the citation overlay)

## Screen purpose

This screen exists to make one promise mechanically true: **every statement the system shows can be
checked against the page it came from, in one click, without losing your place.** It is the product's
trust engine. The user has been told that AI makes things up; this is the surface that proves this
system does not, because it shows the actual page, the actual words, and the actual offsets the
system used. When the system cannot prove it — a mismatched quote, a deleted source, an unreadable
page — this screen says so rather than highlighting the wrong paragraph.

## Entry points

This screen is reachable from **every surface that renders a claim**, which is the point. There is no
screen in the product that shows a claim and cannot open this overlay in one click
(`09-evidence-provenance.md` §5, §5.1).

| From | Trigger |
|---|---|
| Timeline event | Citation chip, or `Enter` on a table row |
| Claim card, any surface | Citation chip |
| Case summary sentence | Citation chip |
| Person or organization profile | Role claim citation, statement citation, relationship citation |
| Allegation matrix | The allegation's own citation, and every evidence item's citation |
| Conflict card | Each of the two statements' citations, independently |
| Transaction ledger row | The row's source chip |
| Balance-mismatch warning | "See the affected rows" |
| Review queue | `O`, or "Open source" |
| Search result | The result's citation chip |
| Story builder | An inserted evidence marker ("from your documents") |
| Lawyer Brief preview | Any inline `[Doc N, p. X]` reference |
| Ask | Every assertion in an answer |
| Deep link | `/matters/:matterId/evidence/:citationId` |

## Hierarchy

```
Evidence overlay
├── Mode by breakpoint: right split pane (≥1024) · full-screen overlay (768–1023) · sheet (<768)
├── LEFT — SOURCE
│   ├── Document header — name, type, its own date, page position
│   ├── Page render
│   │   ├── Highlighted span drawn from stored char_start / char_end
│   │   └── (no highlight at all in the mismatch state)
│   ├── Page controls — position "page 88 of 412", prev/next, fit, zoom
│   └── Page-level banners — OCR caveat · no text layer · page unreadable
├── RIGHT — WHY YOU'RE SEEING THIS
│   ├── Close (✕) and `Esc` affordance
│   ├── Class badge          ← always first in reading order
│   ├── Confidence phrase
│   ├── The claim that triggered this overlay
│   ├── Citation metadata — document name, type, source date, page, paragraph
│   ├── Verification line — "Read from the original PDF" / mismatch / unverifiable
│   ├── OCR caveat, when the figure came from a scan
│   ├── Actions — Looks right · Fix this · Open full document · Copy reference ·
│   │              Flag as misattributed · Add a note · Download the original
│   ├── "How we know this" disclosure (collapsed for consumer, expanded for professional)
│   └── "In this document: N other claims" — a small in-document citation index
└── Footer — the chain-of-custody note, linkable
```

## Desktop wireframe — the overlay in detail (split pane, ≥1280px)

```
┌──────────────────────────────────────────────┬─────────────────────────────────────────────────┐
│ SOURCE                                       │  WHY YOU'RE SEEING THIS                   [✕]  │
│ Court File No. CV-24-00682147-0000 · Affidavit│                                                 │
│ of Michael Chen · sworn 2024-02-14 · 6 pages │  ┌──────────────────────────┐                   │
├──────────────────────────────────────────────┤  │ ● FOUND IN YOUR DOCUMENTS│  ← class badge    │
│ ┌──────────────────────────────────────────┐ │  └──────────────────────────┘                   │
│ │                                          │ │  Supported by the records   ← confidence phrase │
│ │  AFFIDAVIT OF MICHAEL CHEN               │ │                                                  │
│ │                                          │  "I first became aware of the Northgate         │
│ │  I, MICHAEL CHEN, of the City of         │  transfer in or around March 2023, when I was   │
│ │  Mississauga, in the Province of         │  informed by the finance department during a    │
│ │  Ontario, MAKE OATH AND SAY:             │  routine review of the 2021 accounts."          │
│ │                                          │                                                  │
│ │  1. I am the Chief Financial Officer     │  ┌────────────────────────────────────────────┐ │
│ │     of the Defendant…                    │  │ 📄 Disclosure Vol. 3 · p. 3                 │ │
│ │                                          │  └────────────────────────────────────────────┘ │
│ │  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │                                                  │
│ │  ┃ 3. I first became aware of the      ┃ │  Affidavit · sworn 2024-02-14                    │
│ │  ┃    Northgate transfer in or around  ┃ │  Paragraph 3 · characters 1,204–1,432            │
│ │  ┃    March 2023, when I was informed  ┃ │  ✓ Read from the original PDF                    │
│ │  ┃    by the finance department during ┃ │                                                  │
│ │  ┃    a routine review of the 2021     ┃ │  ┌──────────────┐ ┌──────────────┐              │
│ │  ┃    accounts. Prior to that time I   ┃ │  │ Looks right  │ │  Fix this    │              │
│ │  ┃    had no knowledge of the transfer ┃ │  └──────────────┘ └──────────────┘              │
│ │  ┃    to Meridian Payments Ltd.        ┃ │  ┌────────────────────┐ ┌──────────────────┐    │
│ │  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │  │ Open full document │ │  Copy reference  │    │
│ │   ↑ highlight drawn at the stored span    │  └────────────────────┘ └──────────────────┘    │
│ │     boundaries drawn at ≥3:1 contrast     │  ┌────────────────────┐ ┌──────────────────┐    │
│ │                                          │  │ Add a note         │ │ Flag as          │    │
│ │  4. Northgate engaged Meridian Payments  │  │                    │ │ misattributed    │    │
│ │     Ltd. as a payment processing         │  └────────────────────┘ └──────────────────┘    │
│ │     service provider in 2021…            │                                                  │
│ │                                          │  ▸ How we know this                              │
│ │                                          │    Model: (shown to professional users)          │
│ │                                          │    Prompt version: r02_entities@v7               │
│ │                                          │    Extracted: 2026-01-16 09:41 UTC               │
│ │                                          │    Verification: quote found on the cited page   │
│ │                                          │    Tier 2: supported                             │
│ │                                          │                                                  │
│ │                                          │  In this document: 4 other claims                │
│ │                                          │    · ¶5 — A party's position (Vol. 3 · p. 4)     │
│ │                                          │    · ¶6 — A party's position (Vol. 3 · p. 5)     │
│ │                                          │    · ¶2 — Found in your documents (p. 2)         │
│ │                                          │    · statement S-03 → 2 possible inconsistencies │
│ ├──────────────────────────────────────────┤                                                  │
│ │ [page 3 of 6]  ◀ ▶    [Fit] 100%  [+] [−]│  ┌────────────────────────────────────────────┐  │
│ └──────────────────────────────────────────┘  │ We store your original files exactly as you │  │
│                                               │ uploaded them and record a digital          │  │
│                                               │ fingerprint (SHA-256) of each one…          │  │
│                                               │                                    [More]   │  │
│                                               └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────┴─────────────────────────────────────────────────┘
```

### The mismatch state — shown instead of a wrong highlight

```
┌──────────────────────────────────────────────┬─────────────────────────────────────────────────┐
│ SOURCE                                       │  WHY YOU'RE SEEING THIS                   [✕]  │
│ Court File No. CV-24-00682147-0000 · Affidavit│                                                 │
│ of Michael Chen · sworn 2024-02-14 · 6 pages │  ┌──────────────────────────┐                   │
├──────────────────────────────────────────────┤  │ ● FOUND IN YOUR DOCUMENTS│                   │
│ ┌──────────────────────────────────────────┐ │  └──────────────────────────┘                   │
│ │                                          │ │  Possible — worth checking                      │
│ │  3. I first became aware of the          │ │                                                  │
│ │     Northgate transfer in or around      │ │  ┌────────────────────────────────────────────┐ │
│ │     March 2023, when I was informed      │ │  │ ⚠ The quoted text no longer matches this   │ │
│ │     by the finance department during     │ │  │   page.                                    │ │
│ │     a routine review of the 2021         │ │  │                                            │ │
│ │     accounts.                            │ │  │ We haven't highlighted anything rather      │ │
│ │                                          │ │  │ than mark the wrong words.                 │ │
│ │  ── nothing is highlighted ──            │ │  │                                            │ │
│ │                                          │ │  │ What we had stored:                        │ │
│ │                                          │ │  │ "I first became aware of the Northgate      │ │
│ │                                          │ │  │  transfer in or around March 2023, when I   │ │
│ │                                          │ │  │  was informed by the finance department     │ │
│ │                                          │ │  │  during a routine review of the 2021        │ │
│ │                                          │ │  │  accounts."                                 │ │
│ │                                          │ │  │                                            │ │
│ │                                          │ │  │ The closest text we found on this page     │ │
│ │                                          │ │  │ differs in wording. Nothing is highlighted. │ │
│ │                                          │ │  │                                            │ │
│ │                                          │ │  │ [Flag as misattributed] [Check again]      │ │
│ │                                          │ │  │ [Open full document]                       │ │
│ │                                          │ │  └────────────────────────────────────────────┘ │
│ ├──────────────────────────────────────────┤ │                                                  │
│ │ [page 3 of 6]  ◀ ▶    [Fit] 100%         │ │  This claim is not shown as a finding while    │
│ └──────────────────────────────────────────┘ │  we look into it.                              │
└──────────────────────────────────────────────┴─────────────────────────────────────────────────┘
```

### The OCR-derived figure state

```
┌──────────────────────────────────────────────┬─────────────────────────────────────────────────┐
│ SOURCE                                       │  WHY YOU'RE SEEING THIS                   [✕]  │
│ Bank statement · Northbridge Bank ·          │                                                 │
│ 2021-04-01 to 2021-06-30 · 8 pages           │  ┌──────────────────────────────┐               │
├──────────────────────────────────────────────┤  │ ⚠ This page came from a scan │               │
│ ┌──────────────────────────────────────────┐ │  └──────────────────────────────┘               │
│ │ ⚠ This page was read by computer from a  │ │                                                  │
│ │   scan. Figures may be wrong — check the │ │  ┌──────────────────────────┐                   │
│ │   image.                                 │ │  │ ● FOUND IN YOUR DOCUMENTS│                   │
│ ├──────────────────────────────────────────┤ │  └──────────────────────────┘                   │
│ │ Date       Description    Debit   Balance│ │  Possible — worth checking                      │
│ │ ──────────────────────────────────────── │ │                                                  │
│ │ 2021-06-25 Payroll      18,400.00 141,220│ │  A debit of CAD 7,500.00 was recorded against   │
│ │ 2021-06-28 Transfer      ┏━━━━━━━┓ 133,720│ │  an account ending 4471 on 28 June 2021.        │
│ │            ••4471        ┃7,500.00┃       │ │                                                  │
│ │                          ┗━━━━━━━┛       │ │  ┌────────────────────────────────────────────┐ │
│ │ 2021-06-30 Interest          12.44  71,233│ │  │ ⚠ This figure was read by computer from a  │ │
│ │ 2021-06-30 Closing balance          71,233│ │  │   scan — check it against the original.    │ │
│ │                                          │ │  │   The statement's own balances suggest a    │ │
│ │  ↑ highlighted span, mono figures        │ │  │   different amount. [See the rows involved] │ │
│ │  ↑ the statement's balances do not       │ │  └────────────────────────────────────────────┘ │
│ │    reconcile with this figure            │ │                                                  │
│ ├──────────────────────────────────────────┤ │  📄 Disclosure Vol. 4 · p. 8                    │
│ │ [page 8 of 8]  ◀ ▶    [Fit] 200%   ⊞     │ │                                                  │
│ └──────────────────────────────────────────┘ │  [Looks right] [Fix this] [Confirm the figure]  │
└──────────────────────────────────────────────┴─────────────────────────────────────────────────┘
```

## Mobile wireframe (<768px, full-screen sheet, quote pinned)

```
┌─────────────────────────────┐
│ ✕  Source            p.3/6  │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ ● FOUND IN YOUR         │ │
│ │   DOCUMENTS             │ │
│ │ Supported by the records│ │
│ │                         │ │
│ │ "I first became aware   │ │
│ │  of the Northgate       │ │
│ │  transfer in or around  │ │
│ │  March 2023…"           │ │
│ │                    ▾    │ │
│ └─────────────────────────┘ │
│  ↑ pinned quote, collapsible│
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │  AFFIDAVIT OF           │ │
│ │  MICHAEL CHEN           │ │
│ │                         │ │
│ │  ┏━━━━━━━━━━━━━━━━━━━┓  │ │
│ │  ┃ 3. I first became ┃  │ │
│ │  ┃    aware of the  ┃  │ │
│ │  ┃    Northgate     ┃  │ │
│ │  ┃    transfer in   ┃  │ │
│ │  ┃    or around     ┃  │ │
│ │  ┃    March 2023…   ┃  │ │
│ │  ┗━━━━━━━━━━━━━━━━━━━┛  │ │
│ │                         │ │
│ │  page image scrolls     │ │
│ │  beneath the pinned     │ │
│ │  quote                  │ │
│ │                         │ │
│ │     ⊞  [Fit]  100%      │ │
│ │                         │ │
│ │  ◀  page 3 of 6  ▶      │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ 📄 Disclosure Vol. 3 · p. 3 │
│ ✓ Read from the original PDF│
├─────────────────────────────┤
│ ┌────────────┐┌────────────┐│
│ │Looks right ││  Fix this  ││
│ └────────────┘└────────────┘│
│ ┌──────────────────────────┐│
│ │   Open full document     ││
│ └──────────────────────────┘│
│ [Copy reference]      [⋯]   │
├─────────────────────────────┤
│ ▸ How we know this          │
└─────────────────────────────┘
      44px targets throughout
```

## Primary actions

| Action | Trigger | Result | Permission required |
|---|---|---|---|
| Close the overlay | `Esc`, `✕`, swipe down (mobile) | Overlay closes; focus and scroll position return to the trigger | `matter:read` |
| Page forward / back | `]` / `[`, `PgDn` / `PgUp`, the arrows | Page render scrolls; the highlight is only re-drawn when the citation's page is shown | `matter:read` |
| Zoom | `+` / `-` / `0`, or the controls | Page render zooms; `Fit` resets | `matter:read` |
| Looks right | `Y`, or the button | Citation is confirmed by the user; `review_state = reviewed_adopted`; audit entry | `matter:review` |
| Fix this | `F`, or the button | Opens the correction editor; the original AI extraction is preserved (F24) | `matter:review` |
| Open full document | `O`, or the button | Opens the document in the library viewer with the citation context retained in the URL | `matter:read` |
| Copy reference | `C`, or the button | Copies `Disclosure Vol. 3 · p. 3`; announces "Reference copied" | `matter:read` |
| Flag as misattributed | Button | Records the flag with an optional reason; feeds the accuracy pipeline; the citation is downgraded pending review | `matter:review` |
| Add a note | Button | Creates a note anchored to this page range (F25) | `matter:write` |
| Download the original | Overflow menu | Signed, short-lived download URL; hash recomputed and reported server-side | `matter:download` |
| Re-verify | In the unverifiable state, "Check again" | Re-runs Tier 1, and optionally Tier 2 | `matter:review` |
| Confirm the figure | In the OCR + balance-mismatch state | Records a human-confirmed amount (F32) | `matter:review` |
| View a privileged document | Attempted access | **Denied**, with the access attempt logged as a security event | `document:view_privileged` |

## States

**Loading.**
> Skeleton page render plus skeleton right column; a `role="status"` region announces
> "Opening the source…". Prefetch on hover/focus of a citation chip means this state is usually
> never visible on desktop.

**Ready.** As wireframed. The highlight is drawn at the stored offsets.

**Quote mismatch.**
> "The quoted text no longer matches this page.
> We haven't highlighted anything rather than mark the wrong words."
> `[Flag as misattributed]` `[Check again]` `[Open full document]`

**Unverifiable (source text unavailable).**
> "We can't check this against the source.
> The page this came from can't be read, so we can't show the words we used. The claim isn't shown as
> a finding while this is the case."
> `[Check again]` `[Download the original]`

**Source deleted.**
> "The document this came from was deleted.
> We've kept the claim and the reference so you can still see it was there. Ask about restoring a
> deleted document in Settings."
> (The citation chip elsewhere in the product shows "Source deleted"; exports exclude the claim and
> count it.)

**Page unreadable (OCR failed or the page is an image with no text).**
> "We can't show this page — we couldn't read the file.
> Your original is unchanged and downloadable."
> `[Download the original]` `[Upload a clearer copy]`

**No text layer (Office formats).**
> "We can show the text we read from this file.
> There's no page image for this format."
> `[Open the original]`

**OCR-derived source.**
> "This page was read by computer from a scan. Figures may be wrong — check the image."

**Privileged, access denied.**
> "This document is marked privileged. You do not have access to view its contents."
> (The attempt is written to the audit log as a security event. Enumerating other documents is not
> possible; cross-matter and out-of-scope requests return 404.)

**Error (page render failed).**
> "We couldn't draw this page. Nothing has changed.
> `[Try again]` `[Download the original]`"

**Zero result (a citation whose document has been reprocessed and the span drifted).**
> "This page has been read again since the claim was made.
> The words we used are still on record, but their position on the page has moved. We can show you
> the page and the stored quote side by side."
> `[Show both]`

**Reduced motion.** The page is positioned at the highlight directly, with no scroll animation.

## Interaction details

### Keyboard map

| Key | Action |
|---|---|
| `Esc` | Close; focus returns to the triggering element |
| `Tab` / `Shift+Tab` | Cycle inside the overlay only (focus trap in overlay and sheet modes; in pane mode on desktop the trap is released after the last control, and a visible "Back to the list" link precedes the pane) |
| `[` / `]` | Previous / next page |
| `PgUp` / `PgDn` | Previous / next page |
| `←` / `→` | Previous / next page when the page render has focus |
| `+` / `-` / `0` | Zoom in / out / fit |
| `Y` | Looks right |
| `F` | Fix this |
| `O` | Open the full document |
| `C` | Copy reference |
| `N` | Add a note |
| `H` | Toggle "How we know this" |
| `?` | Keyboard shortcut hint |
| `Home` / `End` | First / last page of the document |

### Focus behaviour

- On open, focus moves to the overlay's heading region (the class badge is announced first as part of
  the accessible description, not as the focus target).
- `Esc` closes and returns focus to the **exact** chip, marker, or row that opened it — not to the
  top of the list.
- The overlay is `role="dialog"` with `aria-modal="true"` and `aria-labelledby` pointing at a visually
  hidden title: "Source: Disclosure Volume 3, page 3".
- In split-pane mode the underlying list is not `aria-hidden`; it is marked `aria-busy="false"` and
  remains readable, because on a laptop with a wide screen users legitimately compare the two.
- Focus never moves into the page render's canvas; the render is exposed through its accessible
  description and the extracted text is available in a "Read the text" disclosure beneath the image
  for users who cannot use a pointer.

### Optimistic updates

- "Looks right" applies immediately and reconciles within 2 seconds; failure reverts and names the
  failure.
- "Copy reference" writes to the clipboard optimistically and announces "Reference copied" only
  after the clipboard write resolves.
- "Flag as misattributed" applies immediately to the citation's rendered state (it becomes downgraded)
  and reconciles; the original quote remains stored regardless.

### Undo

- "Looks right" and "Flag as misattributed" are both undoable, via the 6-second `UndoToast` and
  afterwards with `U`.
- Opening the overlay is not an action and is not undoable; it does not mutate anything, which is
  deliberate — mere viewing must never change the record.

## Copy strings

```
evidence.title                      "Source"
evidence.aria.title                 "Source: {documentName}, page {page}"
evidence.loading                    "Opening the source…"
evidence.page.position              "page {page} of {total}"
evidence.highlight.description      "Highlighted text: {quote}"
evidence.document.meta              "{docType} · {sourceDate} · {pages} pages"

evidence.class.label                "Found in your documents"        (per assertion class)
evidence.confidence.label           "Supported by the records"        (per level)
evidence.verify.match               "Read from the original PDF"
evidence.verify.match.office        "Read from the file you uploaded"
evidence.verify.fuzzy               "Read from the original PDF"
evidence.verify.mismatch            "The quoted page doesn't contain this text"

evidence.mismatch.heading           "The quoted text no longer matches this page"
evidence.mismatch.body              "We haven't highlighted anything rather than mark the wrong words."
evidence.mismatch.stored            "What we had stored:"
evidence.mismatch.closest           "The closest text we found on this page differs in wording. Nothing is highlighted."
evidence.mismatch.action.flag       "Flag as misattributed"
evidence.mismatch.action.recheck    "Check again"
evidence.mismatch.suppressed        "This claim is not shown as a finding while we look into it."

evidence.unverifiable.heading       "We can't check this against the source"
evidence.unverifiable.body          "The page this came from can't be read, so we can't show the words we used."
evidence.unverifiable.action        "Download the original"

evidence.deleted.heading            "The document this came from was deleted"
evidence.deleted.body               "We've kept the claim and the reference so you can still see it was there."
evidence.deleted.chip               "Source deleted"

evidence.unreadable.heading         "We can't show this page — we couldn't read the file"
evidence.unreadable.body            "Your original is unchanged and downloadable."
evidence.unreadable.action.hint     "Upload a clearer copy"

evidence.textonly.heading           "We can show the text we read from this file"
evidence.textonly.body              "There's no page image for this format."
evidence.ocr.banner                 "This page was read by computer from a scan. Figures may be wrong — check the image."
evidence.ocr.figure                 "This figure was read by computer from a scan — check it against the original."
evidence.ocr.balanceHint            "The statement's own balances suggest a different amount."

evidence.privileged.denied          "This document is marked privileged. You do not have access to view its contents."

evidence.drift.heading              "This page has been read again since the claim was made"
evidence.drift.body                 "The words we used are still on record, but their position on the page has moved. We can show you the page and the stored quote side by side."
evidence.drift.action               "Show both"

evidence.action.looksRight          "Looks right"
evidence.action.fixThis             "Fix this"
evidence.action.openFull            "Open full document"
evidence.action.copyRef             "Copy reference"
evidence.action.copied              "Reference copied"
evidence.action.addNote             "Add a note"
evidence.action.flag                "Flag as misattributed"
evidence.action.download            "Download the original"
evidence.action.confirmFigure       "Confirm the figure"

evidence.why.heading                "Why you're seeing this"
evidence.provenance.toggle          "How we know this"
evidence.provenance.model           "Model"
evidence.provenance.prompt          "Prompt version"
evidence.provenance.extracted       "Extracted"
evidence.provenance.verification    "Verification"
evidence.provenance.tier2           "Second check"

evidence.indoc.heading              "In this document: {n} other claims"
evidence.custody.note               "We store your original files exactly as you uploaded them and record a digital fingerprint (SHA-256) of each one, so you can show that the file hasn't changed since you uploaded it. This is useful documentation, but it is not a legal guarantee that a court will accept a document as evidence. Ask your lawyer what you need for your matter."

evidence.error.render               "We couldn't draw this page. Nothing has changed."
evidence.disclaimer                 "Case IQ organises your papers for your lawyer. It is not legal advice."
```

## Accessibility notes

**Semantics.**

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → "Source: {document}, page {page}".
- The overlay contains two labelled `region`s: `aria-label="Source document"` and
  `aria-label="Why you're seeing this"`.
- The page render is exposed as an `<img>` with a full alternative description:
  `"Page 3 of the Affidavit of Michael Chen, sworn 14 February 2024. Highlighted text: …"`. It is not
  a bare canvas. Where a canvas is used for zoom performance, an off-screen text alternative carrying
  the same description is rendered alongside it.
- "Read the text" exposes the extracted page text as selectable, semantically marked-up text with the
  cited span wrapped in `<mark>`, so the whole content of the page is available to any assistive
  technology and to copy-paste.
- The highlight boundary is drawn at ≥ 3:1 against the page background, so it is visible in greyscale
  and for users with low vision; the highlight is never the only indication that a citation exists.
- Verification status is text ("Read from the original PDF"), never a coloured dot alone.

**Announcements, in this order on open.**

1. `"Source. Dialog."` (role + label)
2. `"Page 3 of 6. Affidavit of Michael Chen, sworn 14 February 2024."`
3. `"Highlighted text: I first became aware of the Northgate transfer in or around March 2023…"`
4. `"Found in your documents."` — the class, before the claim text, deliberately
5. `"Supported by the records."` — the confidence phrase
6. The claim text
7. `"Disclosure Volume 3, page 3. Affidavit, sworn 14 February 2024. Paragraph 3."`
8. `"Read from the original PDF."`
9. The available actions, in DOM order

On close: a `role="status"` region announces `"Source closed. Back to {originating context}."` and
focus lands on the exact triggering element.

**Other.**

- Reduced motion: the page is positioned at the highlight with no smooth scroll; zoom changes are
  instant.
- At 200% zoom the right column reflows beneath the page render rather than clipping.
- Minimum target sizes: 24×24 everywhere, 44×44 for every action in the mobile sheet.
- The page-render controls are a labelled toolbar with `role="toolbar"` and an `aria-label` of
  "Page controls".
- Contrast: all metadata text meets ≥ 4.5:1 against the overlay surface in both themes; the amber OCR
  caveat meets ≥ 4.5:1 on its own surface, which is a hard requirement of the design system.
- Print: the overlay is not printed. The Lawyer Brief carries `[Doc N, p. X]` anchors instead, and the
  brief's Document Index resolves them.

## Data dependencies

| Purpose | Endpoint |
|---|---|
| Citation metadata, signed page render URL, highlight offsets | `GET /evidence/:citationId` |
| Surrounding paragraph and page context | `GET /evidence/:citationId/context` |
| Re-run verification (Tier 1, optionally Tier 2) | `POST /evidence/:citationId/verify` |
| Flag as misattributed | `POST /evidence/:citationId/flag` |
| Page text with offsets and OCR metadata | `GET /matters/:matterId/documents/:id/pages/:page` |
| Page image (signed URL) | `GET /matters/:matterId/documents/:id/pages/:page/render` |
| Original file (signed, short-lived, logged) | `GET /matters/:matterId/documents/:id/content` |
| Document metadata and hashes | `GET /matters/:matterId/documents/:id` |
| Record a correction | `POST /assertions/:assertionId/corrections` |
| Correction history | `GET /assertions/:assertionId/corrections` |
| Full provenance of an assertion | `GET /assertions/:assertionId` |
| Review disposition | `POST /matters/:matterId/review/items` |
| Add a note to a page range | `POST /matters/:matterId/notes` (F25) |
| Confirm an OCR figure | `POST /transactions/:id/confirm` |
| Assertion collection for "other claims" | `GET /matters/:matterId/documents/:id` → linked assertions |

## Acceptance criteria

1. Opening a citation reaches the highlighted source in under 1.5s at p95. (F15 AC-1)
2. The highlight matches the stored quote exactly; the offsets come from the stored citation and are
   never re-derived by searching at render time. (F15 AC-2, 09-EP §3.1)
3. When the stored quote does not match the current text, the overlay shows the mismatch state and
   draws **no** highlight. (F15 AC-2)
4. Rendering is available for PDF and images; Office formats show extracted text plus "Open the
   original". (F15 AC-3)
5. Every action on a privileged document is audit-logged, and an unauthorised access attempt is logged
   as a security event and returns no content. (F15 AC-4, F03 AC-5)
6. The overlay works at 375px with a stacked layout and 44px targets. (F15 AC-5)
7. The citation's deep link is stable and reopenable from a pasted URL. (F16 AC-4)
8. A citation whose document is deleted shows "Source deleted" rather than a broken link, and the
   dependent claim is visually downgraded. (F16 AC-3)
9. An OCR-derived numeric figure carries the amber "check this against the original" caveat with a
   direct link to the page image, everywhere it appears. (F07 AC-4, 09-EP §4.3)
10. The class badge and the confidence phrase are announced before the claim text, and the confidence
    is never a number. (14-ux-specification.md §7, 09-EP §2.3)
11. `Esc` closes the overlay and returns focus to the triggering element. (F15, 09-EP §5.1)
12. "How we know this" is collapsed by default for consumer users and expanded by default for
    professional users. (14-ux-specification.md §3.1)
13. The whole overlay is operable with the keyboard alone, including page navigation, zoom, and all
    actions.
14. The overlay never modifies the underlying screen's scroll position, and closing restores both
    focus and scroll position exactly.
15. The chain-of-custody note is present, and it does not claim admissibility or certification.
    (09-EP §9.2, §9.3)

## Open questions

1. **Highlight drift tolerance.** `quote_offset_drift` is stored when text shifts between extraction
   runs, but the threshold at which we stop treating a small shift as "the same span" and start
   showing the drift state is not yet specified. The conservative reading is that *any* shift in the
   stored offsets triggers the drift disclosure. That will produce more disclosures than users
   strictly need. Needs a decision with measured data after the first re-processing release.
2. **"In this document: N other claims" for very large documents.** In a 412-page transcript this
   list could hold hundreds of items. Whether it should be a paginated list, a summary by class, or a
   link into a filtered search within the document is unresolved.
3. **Clipboard behaviour on the mobile sheet.** `C` has no mobile equivalent yet. A long-press on the
   citation chip is the obvious candidate, but it conflicts with the browser's own text-selection
   gesture. Undecided.
4. **Should "Looks right" exist here at all?** It duplicates the review-queue action on a surface that
   is mostly used for reading, and it may inflate the reviewed count with confirmations that were not
   really considered. The counter-argument is that verification at the moment of reading is exactly
   when it is cheapest. This needs a product decision, and it affects the meaning of the
   `reviewed_adopted` state that persona C relies on for professional liability (02-user-personas.md
   C.5).
5. **Professional-only fields.** Offsets and the quote hash are shown to professional users per
   `09-evidence-provenance.md` §4.2. Whether they should be copyable as a pair (for an expert's own
   work product) or shown read-only is unresolved, and the expert persona (F) has a stated need for
   reproducible figures.
