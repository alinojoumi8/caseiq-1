---
title: Timeline — What happened
status: draft
owner: Product Design
last_updated: 2026-02-14
phase: MVP
features: [F12, F16, F15, F24, F17, F18, F11]
---

# 06 — Timeline ("What happened" / Chronology)

## Screen purpose

This screen exists because the single hardest thing for a person with 1,400 pages of material to do
is hold the sequence of events in their head. The timeline is the product's centrepiece and its
first value moment: it turns an unread pile into an ordered, dated, source-linked chronology, and it
is the screen on which the north-star metric — Time to First Defensible Chronology — is measured. It
must be useful before processing finishes, and it must never present an approximate date as though
it were certain.

## Entry points

| From | How |
|---|---|
| Onboarding step 5 | Primary action "Check the timeline" (F48) |
| Left rail / bottom tab bar | "What happened" — destination 2 of the ten |
| Case dashboard ("Your case") | Timeline preview card → "See all 214 events" |
| Person profile | "Timeline events they appear in" → filtered timeline |
| Allegation matrix | "Related events" → filtered timeline |
| Ask | An answer's structured timeline table → "Open in the timeline" |
| Search | A result of group `events` → the event, in context |
| Lawyer Brief preview | Section 6 → the same events, filtered to reviewed |
| Deep link | `/matters/:matterId/timeline` with filter state encoded in the URL |

## Hierarchy

```
Timeline screen
├── Header
│   ├── H1 "What happened"
│   ├── Coverage line — "214 events between 2019-03-04 and 2024-11-02. 61 aren't checked yet."
│   ├── View switch — [Timeline] [Table]   (segmented control, also a link: ?view=table)
│   └── Overflow — [Export CSV] [Export .ics] [Add an event]
├── Filter bar
│   ├── Filter chips (removable) — Person · Organization · Document · Allegation · Date range ·
│   │                             Review state · Disputed
│   ├── "Clear all"
│   └── Save this view
├── Precision legend (collapsible, expanded on first visit)
├── Timeline body — one of:
│   ├── Visual mode (horizontal, zoomable, grouped year → month)
│   │   ├── Axis with year and month bands
│   │   ├── Event markers (filled = exact, hollow = approximate,
│   │   │                  bracket = inferred range)
│   │   └── Selected-event detail card
│   └── Table mode (sortable, filterable, virtualised, exportable)
│       └── Columns: Date · Precision · Event · Class · Confidence · People · Documents ·
│                  Review state
├── Undated group — events we can't place, listed separately, never guessed in
└── Footer — coverage detail, "What we couldn't do" link, DisclaimerFooter
```

## Desktop wireframe — visual mode

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Case IQ   Okafor v. Northgate Holdings Inc. ▾      ⌘K Search…        Ask        ?       DO ▾ │
├──────────────┬─────────────────────────────────────────────────────────────────────────────────┤
│ Your case    │  What happened                                                  [Timeline][Table]│
│ What happened│  214 events between 2019-03-04 and 2024-11-02. 61 aren't checked yet.          │
│ People       │                                                 [Export CSV] [Export .ics] [+] │
│ Your papers  ├─────────────────────────────────────────────────────────────────────────────────┤
│ What's alleged│ Person: Michael Chen ✕   Date: 2021-01-01 → 2021-12-31 ✕   [Clear all]      │
│ What doesn't…│  Showing 47 of 214 events. 12 excluded — 9 have no date, 3 are from pages we  │
│ Money        │  couldn't read. [See what's excluded]                        [Save this view]│
│ Connections  ├─────────────────────────────────────────────────────────────────────────────────┤
│ Ask about…   │  ▸ How to read the markers:  ● exact date   ○ approximate   ⊢⊣ range         │
│ Prepare for… ├─────────────────────────────────────────────────────────────────────────────────┤
│              │                                                                                 │
│ ─────────────│  2021                                                                           │
│ Things to    │  │        │          │            │              │            │                 │
│ check  47    │  Mar      Apr        May          Jun            Jul          Aug               │
│ Reading your │  │        │          │            │              │            │                 │
│ papers  9    │  ●        │          ●            ●              ●            ●                 │
│              │  09        │          28           11             08           19                │
│              │  $250,000  │          Whitfield    Chen emails    Invoice      Scanned           │
│              │  first     │          emails Chen  Meridian       Northgate    letter,           │
│              │  tranche   │          about "the   ──────┐        Logistics    date reads        │
│              │            │          Meridian      │      │        (unrelated   3/4/2021 ○      │
│              │            │          arrangement"  │      │        company)                      │
│              │            │                        │      │                                        │
│              │            │          ● 06-01       │      │                                        │
│              │            │          Board meeting │      │                                        │
│              │            │          (minutes don't│      │                                        │
│              │            │          mention it)   │      │                                        │
│              │            │                        ▼      │                                        │
│              │            │                    ● 06-14     │                                        │
│              │            │                    CAD $310,000│                                        │
│              │            │                    Northgate → │                                        │
│              │            │                    Meridian    │                                        │
│              │            │                    Payments    │                                        │
│              │            │                                │                                        │
│              │            │          ○ 06-22  Whitmore raises concerns  (document says           │
│              │            │                   "last Tuesday")                                     │
│              │            │                                                                        │
│              │  [◀ 2019]  [2020]  [ 2021 ]  [2022]  [2023]  [2024]  [▶]        [−] 100%  [+]      │
├──────────────┴─────────────────────────────────────────────────────────────────────────────────┤
│  SELECTED EVENT                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  ● FOUND IN YOUR DOCUMENTS          Supported by the records          26 of 47 checked    │  │
│  │                                                                                            │  │
│  │  2021-06-14 — CAD $310,000 transferred from Northgate Holdings Inc. to                     │  │
│  │  Meridian Payments Ltd.                                                                    │  │
│  │                                                                                            │  │
│  │  People: Michael Chen · Sarah Whitfield      Documents: 2                                  │  │
│  │                                                                                            │  │
│  │  📄 Disclosure Vol. 4 · p. 7     📄 Disclosure Vol. 4 · p. 1                               │  │
│  │  ▸ How we know this                          [Looks right]  [Fix this]  [Dispute]          │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│  NOT ON THE AXIS — 9 events have no date we can rely on                                        │
│  · WhatsApp export, one message with no timestamp — "did you see the Meridian invoice?"        │
│    [Vol. 5 msg 7]   [Add a date]                                                               │
│  · 8 more →                                                                                    │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Reading your papers — 398 of 412 done. 38 more events are coming. [See what's left]           │
│  Case IQ organises your papers for your lawyer. It is not legal advice.                        │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Desktop wireframe — table mode (`?view=table`)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│  What happened                                                  [Timeline][ Table ]  ✓ active  │
│  Showing 20 of 47 matching events. 12 excluded — [why]                        [Export CSV]     │
├────┬────────────┬───────────────┬─────────────────────────────────┬──────────────┬─────────────┤
│    │ Date ▲▼    │ Precision     │ Event                           │ Class        │ Checked     │
├────┼────────────┼───────────────┼─────────────────────────────────┼──────────────┼─────────────┤
│ 1  │ 2021-03-04 │ exact         │ Subscription Agreement executed; │ From the     │ Checked ✓   │
│    │            │               │ CAD $475,000 committed           │ document     │             │
│    │            │               │ Vol. 2 · p. 1                    │              │             │
│ 2  │ 2021-03-09 │ exact         │ First tranche CAD $250,000       │ Found in     │ Checked ✓   │
│    │            │               │ transferred by D. Okafor         │ your docs    │             │
│    │            │               │ Vol. 4 · p. 2                    │ Stated dir…  │             │
│ 3  │ 2021-05-28 │ exact         │ Whitfield emails Chen about "the │ From the     │ Not checked │
│    │            │               │ Meridian arrangement"            │ document     │             │
│    │            │               │ Vol. 5 · p. 1                    │              │             │
│ 4  │ 2021-05-31 │ exact         │ Second tranche CAD $225,000      │ Found in     │ Checked ✓   │
│    │            │               │ Vol. 4 · p. 5                    │ your docs    │             │
│ 5  │ 2021-06-01 │ exact         │ Northgate board meeting held     │ Found in     │ Not checked │
│    │            │               │ Vol. 6 · p. 1                    │ your docs    │             │
│ 6  │ 2021-06-11 │ exact         │ Chen emails Meridian instructing │ From the     │ Checked ✓   │
│    │            │               │ the receiving account            │ document     │             │
│    │            │               │ Vol. 2 · p. 19                   │              │             │
│ 7  │ 2021-06-14 │ exact         │ CAD $310,000 transferred from    │ Found in     │ Checked ✓   │
│    │            │               │ Northgate Holdings to Meridian   │ your docs    │             │
│    │            │               │ Payments Ltd.  Vol. 4 · p. 7     │ Supported…   │             │
│ 8  │ 2021-06-15 │ exact         │ Meridian issues invoice for      │ From the     │ Not checked │
│    │            │               │ CAD $310,000, "consulting        │ document     │             │
│    │            │               │ services"  Vol. 5 · p. 1         │              │             │
│ 9  │ 2021-06-22 │ ○ approximate │ Whitmore raises concerns with    │ AI           │ Not checked │
│    │            │               │ Chen about the Meridian payment  │ observation  │             │
│    │            │               │ "last Tuesday" — Vol. 5 msg 4    │ Possible — … │             │
│ 10 │ 2021-06-28 │ exact         │ Debit of CAD $7,500.00 to an     │ Found in     │ Not checked │
│    │            │               │ account ending 4471              │ your docs    │ ⚠ figure    │
│    │            │               │ Vol. 4 · p. 8   ⚠ read by computer│ Possible — …│   from scan │
│ 11 │ 2021-07-08 │ exact         │ Invoice received from Northgate  │ From the     │ Not checked │
│    │            │               │ Logistics Ltd.  Vol. 8 · p. 1    │ document     │             │
│ 12 │ 2021-08-19 │ ○ approximate │ Letter dated 3/4/2021 — could be │ From the     │ Not checked │
│    │ ⚠ ambiguous│  ⚠ check this │ 4 March or 3 April               │ document     │ [Pick one]  │
│ …  │     …      │       …       │                …                │      …       │      …      │
├────┴────────────┴───────────────┴─────────────────────────────────┴──────────────┴─────────────┤
│  Rows 1–20 of 47 · virtualised · ↑↓ to move, Enter to open the source, Space to check          │
│  [Load more]   Sorted by date, oldest first.  [Show only unchecked]  [Show disputed only]       │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Mobile wireframe — visual mode (375px)

```
┌─────────────────────────────┐
│ ☰  What happened        ⋯   │
├─────────────────────────────┤
│ 214 events · 61 unchecked   │
│ [Timeline] [ Table ]        │
├─────────────────────────────┤
│ Michael Chen ✕  2021 ✕      │
│ [Clear all]  Showing 47/214 │
├─────────────────────────────┤
│ ▸ Markers: ● exact ○ approx │
├─────────────────────────────┤
│  2021                       │
│  │                          │
│  Mar                        │
│  ● 03-04  Subscription      │
│  │        Agreement         │
│  │        From the document │
│  │        Vol. 2 · p. 1      │
│  │                          │
│  ● 03-09  First tranche     │
│  │        CAD $250,000      │
│  │        Vol. 4 · p. 2      │
│  │                          │
│  May                        │
│  ● 05-28  Whitfield emails  │
│  │        Chen              │
│  │        Vol. 5 · p. 1      │
│  │                          │
│  Jun                        │
│  ● 06-14  CAD $310,000      │
│  │        Northgate →       │
│  │        Meridian Payments │
│  │        Vol. 4 · p. 7      │
│  │                          │
│  ○ 06-22  Whitmore raises   │
│  │        concerns          │
│  │        approx · Vol. 5   │
│  │                          │
│  Aug                        │
│  ○ 08-19  Letter dated      │
│  │        3/4/2021          │
│  │        ⚠ check this date  │
│  │                          │
│  [Tap an event to see its   │
│   source]                    │
├─────────────────────────────┤
│ 9 events have no date  →    │
├─────────────────────────────┤
│ Your case  Events  Papers   │
│ People     ⋯ More           │
└─────────────────────────────┘
```

## Primary actions

| Action | Trigger | Result | Permission required |
|---|---|---|---|
| Open an event's source | Click/tap the citation chip, or `Enter` on a table row | `EvidenceOverlay` opens over the timeline; context preserved | `matter:read` |
| Check an event | `Y`, or the "Looks right" button | `review_state = reviewed_adopted`; the checked counter increments; 6s undo toast | `matter:review` |
| Fix an event | `F`, or the "Fix this" button | Inline editor (date + precision toggle, description, people, evidence links); original AI value preserved | `matter:review` |
| Add an event | `+`, or "Add an event" | Manual event, `created_by = user`, styled and exported distinctly | `matter:write` |
| Merge duplicate events | Row overflow → "Merge with…" | All citations from both events preserved on the survivor | `matter:write` |
| Dispute an event | Row overflow → "Dispute" | Event stays visible but is styled and counted separately and is excluded from the brief by default | `matter:write` |
| Undo the last action | `U`, or the toast button | Reverts the last review action exactly | `matter:review` |
| Switch to table mode | `T`, or the segmented control | Same filters, same data, table rendering; URL gains `?view=table` | `matter:read` |
| Export CSV | "Export CSV" | Download with citation columns | `matter:export` |
| Export .ics | "Export .ics" | RFC 5545 calendar file; each event's description carries its citation | `matter:export` |
| Save this view | "Save this view" | Names and stores the current filter set (F18) | `matter:write` |
| Pick a reading for an ambiguous date | Inline "Pick one" on an ambiguous row | The user's choice is recorded; the original ambiguity is retained in history | `matter:review` |

## States

**Empty (new case, no documents).**
> "Nothing here yet. Add your papers and we'll put them in order for you."
> `[Add your papers]` — one action.

**Empty (documents, but no dated events extracted).**
> "We read your documents but couldn't find dated events.
> This usually means the files are scans with no text layer. Reading them with OCR takes longer and
> may be less accurate — but it's the only way to find dates in them."
> `[Read them with OCR]` `[See the 3 files involved]`

**Empty (filtered to nothing).**
> "No events in June 2019.
> Nothing in your papers falls in that window. [Show all dates]"

**Loading (short).** Skeleton: eight grey markers along a drawn axis, with skeleton detail card. A
`role="status"` region announces "Loading your events…".

**Loading (long, > 5s).** The coverage line animates honestly:
> "Putting 388 events in date order — about 20–40 seconds left."

**Partial (processing still running — the normal state during J1).**
> "Showing 142 of 180 events — 38 more coming as we finish reading.
> 61 of the 142 aren't checked yet. `[See what's left]` `[Email me when it's done]`"

**Partial (large count degrading honestly).**
> "2,140 events between 2019-03-04 and 2024-11-02. That's a lot to draw, so we've grouped them by
> month. `[Show them one by one]` `[Open the table instead]`"

**Error (recoverable — event detail failed to load).**
> "We couldn't load this event's details. Nothing has been changed.
> `[Try again]` `[Open its source anyway]`"

**Error (fatal).**
> "Something went wrong on our side. Reference: req_01HQ8ZC4M2.
> Your papers and your checked events are unaffected. `[Reload]`"

**Zero-result after a check action.** The counter updates in place:
> "26 of 47 checked" → "27 of 47 checked", with the toast "Checked · `Undo`".

## Interaction details

### Keyboard map

| Key | Action | Context |
|---|---|---|
| `J` / `↓` | Next event | Table mode, or the selected marker in visual mode |
| `K` / `↑` | Previous event | Same |
| `Enter` | Open the selected event's source overlay | Both modes |
| `Y` | Looks right | Both modes |
| `F` | Fix this | Both modes |
| `X` | Not right — remove | Both modes |
| `Space` | Can't tell — defer | Both modes |
| `D` | Dispute this event | Both modes |
| `U` | Undo the last action | Global within the screen |
| `T` | Toggle Timeline / Table | Global within the screen |
| `←` / `→` | Move the selected event backward / forward in time | Visual mode |
| `+` / `-` | Zoom the axis in / out | Visual mode |
| `Home` / `End` | Jump to the first / last event in the filtered set | Visual mode |
| `,` / `.` | Previous / next month band | Visual mode |
| `/` | Focus the filter search | Global within the screen |
| `?` | Keyboard shortcut hint | Global |
| `Esc` | Close the overlay, then clear the selection | Global |

### Focus behaviour

- Focus enters the screen at the `<h1>` via the skip link.
- In table mode the table itself is a single tab stop (roving `tabindex` on rows); `↑`/`↓` move the
  row cursor, `Tab` leaves the table.
- In visual mode the axis is one tab stop; markers are reached with arrow keys as a
  `role="listbox"`-equivalent described below.
- Opening `EvidenceOverlay` traps focus inside the overlay; `Esc` returns focus to the exact marker or
  row that opened it.
- The date-precision editor opens with focus on the date field, and its precision toggle is a
  `radiogroup` with `←`/`→` selection.

### Optimistic updates

- "Looks right", "Fix this", "Not right — remove", "Dispute" and "Undo" apply to the local model
  immediately and reconcile against
  `POST /matters/:matterId/events/:id` / `POST …/dispute` within 2 seconds (F24 AC-5). If the write
  fails, the row reverts and a toast names the failure:
  > "That didn't save. Your change was put back. `[Try again]`"
- The checked counter increments optimistically and is corrected on reconcile.
- The next unchecked event is prefetched while the user reads the current one, so `Y` → next item is
  under 300ms (14-ux-specification.md §8).

### Undo

- One level of undo per review action, held for the session, surfaced in a `UndoToast` for 6 seconds
  and reachable afterwards with `U` (G-06).
- Undo of a merge restores both events with all citations and records an audit entry (F12 AC-3).
- Undo of a dispute removes it from the disputed count.
- Permanent deletion is the only non-undoable action, and it lives in Settings, not here.

## Copy strings

```
timeline.title                      "What happened"
timeline.coverage.line              "214 events between {first} and {last}. {n} aren't checked yet."
timeline.coverage.filtered          "Showing {shown} of {total} events."
timeline.coverage.excluded          "{n} excluded — {a} have no date, {b} are from pages we couldn't read."
timeline.coverage.excluded.link     "See what's excluded"
timeline.markers.legend             "How to read the markers: ● exact date · ○ approximate · ⊢⊣ a range"

timeline.undated.heading            "Not on the axis — {n} events have no date we can rely on"
timeline.undated.body               "We list these separately rather than guess where they belong."
timeline.undated.action             "Add a date"

timeline.ambiguous.chip             "this date reads two ways"
timeline.ambiguous.body             "The document says \"3/4/2021\". That could be 4 March 2021 or 3 April 2021. We haven't chosen for you."
timeline.ambiguous.action           "Pick one"

timeline.approximate.tooltip        "On or about {date} (the document says \"{phrase}\")"
timeline.precision.exact            "exact date"
timeline.precision.approximate      "approximate"
timeline.precision.range            "a range"
timeline.precision.unknown          "no date we can rely on"

timeline.action.looksRight          "Looks right"
timeline.action.fixThis             "Fix this"
timeline.action.addEvent            "Add an event"
timeline.action.dispute             "Dispute this event"
timeline.action.undispute           "Remove the dispute"
timeline.action.merge               "Merge with…"
timeline.action.exportCsv           "Export CSV"
timeline.action.exportIcs           "Export .ics"
timeline.action.saveView            "Save this view"
timeline.action.showOnlyUnchecked   "Show only unchecked"
timeline.action.showDisputed        "Show disputed only"

timeline.toast.checked              "Checked · {n} of {total} checked"
timeline.toast.corrected            "Corrected. The original is kept."
timeline.toast.removed              "Removed from the timeline. You can put it back."
timeline.toast.disputed             "Marked as disputed. It stays visible but is counted separately."
timeline.toast.failed               "That didn't save. Your change was put back."
timeline.toast.undo                 "Undo"

timeline.empty.newCase              "Nothing here yet. Add your papers and we'll put them in order for you."
timeline.empty.noDatedEvents        "We read your documents but couldn't find dated events. This usually means the files are scans with no text layer."
timeline.empty.noDatedEvents.action "Read them with OCR"
timeline.empty.filtered             "No events in {month}. Nothing in your papers falls in that window."
timeline.empty.filtered.action      "Show all dates"

timeline.error.recoverable          "We couldn't load this event's details. Nothing has been changed."
timeline.error.fatal                "Something went wrong on our side. Reference: {ref}."
timeline.error.preserved            "Your papers and your checked events are unaffected."

timeline.density.banner             "That's a lot to draw, so we've grouped them by month."
timeline.density.action             "Open the table instead"

timeline.disputed.badge             "Disputed"
timeline.userCreated.badge          "Added by you"
timeline.merged.note                "{n} copies of this event were combined. All their sources are kept."
timeline.figure.fromScan            "This figure was read by computer from a scan — check it against the original."
```

## Accessibility notes

**Semantics.**

- `main` landmark contains one `<h1>`; the axis group and the table are both `role="region"` with
  `aria-label` ("Timeline, visual view" / "Timeline, table view").
- Visual mode is a single tab stop exposing `role="group"` with
  `aria-describedby` pointing at the precision legend. Individual markers are reachable with
  `←`/`→`/`Home`/`End` under a roving `tabindex`, each with
  `aria-label="14 June 2021, exact date: CAD $310,000 transferred from Northgate Holdings to Meridian Payments Ltd., 2 sources"`.
- Table mode is a real `<table>` with `<caption>` ("Timeline events, newest filters applied"), `<thead>`,
  `scope="col"` on every header, and `aria-sort` on the sortable Date column.
- The precision column is text (`exact`, `approximate`, `a range`), never an icon alone, and the
  legend is a real list, not a graphic.
- The ambiguous-date flag is text plus `aria-describedby` on the date cell, never colour.
- Amounts are announced with currency: "CAD three hundred and ten thousand dollars".

**Live regions.**

- A `role="status"` `aria-live="polite"` region announces filter result counts in words:
  "Showing 47 of 214 events. 12 excluded."
- The checked counter is `aria-live="polite"`: "Checked. 27 of 47 checked."
- Check actions are announced as "14 June 2021 marked as checked" — the event is named, not just the
  count.

**The table alternative is mandatory, not a fallback.** Both views share one URL
(`?view=table`), one filter set, and one sort. The switch is a real link, so it works without
JavaScript routing and can be bookmarked, emailed, and opened directly. The visual view is **never**
the only route to any event: every event, every date, every citation, and every review state is
reachable, readable, and actionable in table mode, and table mode is the default when the filtered
set exceeds 1,000 events. Print always renders table mode.

**Other.**

- Reduced motion: the axis does not animate to a selected event; it is positioned directly. Pan
  inertia and zoom easing are disabled (`prefers-reduced-motion`), with no loss of function.
- Zoom: at 200%, visual mode reflows to the table rather than overflowing horizontally.
- Contrast: marker outlines are drawn at ≥ 3:1 against the axis background, and selected state is
  shown with a 2px focus ring plus a filled shape, not colour alone.
- The source overlay is reachable entirely by keyboard (`Enter` on a marker or row).

## Data dependencies

| Purpose | Endpoint |
|---|---|
| Load the timeline with filters | `GET /matters/:matterId/events?date_from&date_to&precision&person&org&allegation&document&review_state&disputed&significance&q` |
| Undated events, listed separately | `GET /matters/:matterId/events/undated` |
| One event with citations, participants, conflicts | `GET /matters/:matterId/events/:id` |
| Edit an event (creates a revision) | `PATCH /matters/:matterId/events/:id` (`If-Match` required) |
| Create a manual event | `POST /matters/:matterId/events` |
| Check / correct / remove / defer | `POST /matters/:matterId/review/items` |
| Dispute / undispute | `POST /matters/:matterId/events/:id/dispute` · `POST …/undispute` |
| Merge duplicates | `POST /matters/:matterId/events/:id/merge` · `POST …/events/merge` |
| Attach or detach evidence | `POST /matters/:matterId/events/:id/evidence` · `DELETE …/evidence/:citationId` |
| Citation metadata + page render | `GET /evidence/:citationId` |
| Resume and progress for review | `GET/PUT /matters/:matterId/review/position` · `GET …/review/counts` |
| Export | `GET /matters/:matterId/timeline/export` |
| Coverage detail | `GET /matters/:matterId/coverage` |
| Saved views | `GET/POST /matters/:matterId/saved-views` |
| Live processing (for partial state) | `GET /matters/:matterId/processing/stream` (SSE) |

## Acceptance criteria

1. Every AI-generated event carries ≥ 1 resolvable source citation, or is displayed as an unsupported
   draft that cannot be promoted to an established statement. (F12 AC-1)
2. Approximate dates are visually and textually distinct from exact dates in both views, and every
   export states the precision explicitly. (F12 AC-2)
3. Merging events preserves every source citation from every merged event. (F12 AC-3)
4. Manual events render distinctly, are marked `created_by = user`, and keep that distinction in
   exports. (F12 AC-4)
5. Filtering by a person returns every event in which that person is a detected participant. (F12 AC-5)
6. Table mode scrolls 5,000+ events with virtualised rendering at ≥ 50fps. (F12 AC-6)
7. Every edit creates a new version; prior versions remain retrievable. (F12 AC-7)
8. CSV and .ics exports carry citation columns/content. (F12 AC-8)
9. Disputed events remain visible, are styled and counted separately, and are excluded from the
   Lawyer Brief by default. (F12 AC-9)
10. The undated group appears whenever events lack a reliable date, and no such event is ever placed
    on the axis by guesswork.
11. An ambiguous date (`3/4/2021`) is flagged with both readings offered and neither chosen silently.
12. A copy-lint test over the screen's string table finds zero forbidden-vocabulary terms
    (14-ux-specification.md §5.3).
13. The screen is fully operable with the keyboard alone, and `?` documents every shortcut on-screen.
14. The screen renders and remains functional at 375px and at 200% zoom.
15. The table view is reachable at the same URL via a real link, and every event, date, and citation
    available in visual mode is available and actionable in table mode.
16. Events from deleted documents show "Source deleted" rather than a broken link, and are visually
    downgraded. (F16 AC-3)

## Open questions

1. **Visual-mode marker collision.** At high zoom-out with 200+ visible events, markers overlap. We
   currently switch to month aggregation above 200 in-viewport events, but the threshold for
   annotating individual markers instead of aggregating them is unvalidated with real users. This
   needs the Phase 1 usability study before we fix the number.
2. **Ambiguous-date resolution storage.** When the user picks a reading for `3/4/2021`, we record the
   choice as a `UserCorrection`. It is undecided whether the *unpicked* reading should remain visible
   on the row as a secondary date, or move entirely into version history. Legal-review input is
   needed, because the two options read differently if the timeline is later produced to a court.
3. **Undated chat messages.** A chat export message with no timestamp appears in the undated group.
   Whether an undated message in an otherwise-dated thread should inherit an approximate date from
   its neighbours is unresolved. The conservative default (no inheritance) is currently specified;
   it is arguably the wrong trade-off for a 200-message export.
4. **Merged-event naming.** When two events merge, whose title survives is currently "the earliest
   upload's title". It may be better to present both titles and let the user pick on first view of a
   merge. Not yet decided.
5. **Should the `.ics` export include unreviewed events by default?** F37 requires the citation in the
   description but is silent on review state. The current specification includes all non-disputed
   events and marks unreviewed ones in the description. Confirmation from a practising lawyer is
   pending.
