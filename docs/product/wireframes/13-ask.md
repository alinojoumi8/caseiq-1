---
title: Ask about my case — the case assistant
status: draft
owner: Product Design
last_updated: 2026-02-14
phase: MVP
features: [F19, F20, F17, F16, F21, F25, F22, F50, F39]
---

# 13 — Ask ("Ask about my case" / Case assistant)

## Screen purpose

This screen exists to answer questions about **this case's papers** — not about the law — and to
prove, on every single answer, that it is doing so from the record rather than from memory. It is
deliberately not a general chatbot. Its most valuable outputs are the two a generic chatbot never
produces: a fully-cited answer, and an honest "your papers don't answer this yet." It is also the
surface where a legal-advice question is most likely to be asked, so it carries the product's hardest
refusal, verbatim, in `14-ux-specification.md` §5.4.

## Entry points

| From | How |
|---|---|
| Top bar | "Ask" — persistent, always available |
| Left rail | "Ask about my case" — destination 9 |
| NotEstablished component | "Search your papers" → opens Ask with the question prefilled |
| Allegation matrix | "Is there anything about…?" hand-off from a missing-evidence question |
| Person profile | "Ask about this person" |
| Timeline | "Ask about this period" on a selected month band |
| Search | A natural-language query is routed here when the intent is a question rather than a lookup |
| Deep link | `/matters/:matterId/ask?q=…&conversation=:id` |

## Hierarchy

```
Ask
├── Left column — conversation list (collapsible; hidden under 1024px behind a sheet)
│   ├── "New question"
│   └── Conversations, newest first, with the first line of the question
├── Main column
│   ├── Header — "Ask about my case" + the scope line + model/provider disclosure for professionals
│   ├── Suggestion chips — drawn from THIS case, not generic
│   ├── Message stream
│   │   ├── User message
│   │   └── Answer (structured by intent — see §"the six answer shapes")
│   │       ├── Class badge + confidence phrase on every assertion
│   │       ├── Direct one-line answer first
│   │       ├── Structured body (table / timeline / amounts / comparison)
│   │       ├── Citation chips, one click each
│   │       ├── The mandatory class legend on first answer of a conversation
│   │       └── Footer: coverage line + actions
│   ├── Composer
│   └── Footer — the non-advice line, always visible
└── Right column — "About this answer" (professional users; collapsed disclosure for consumers)
    ├── Retrieval detail — how many spans, which documents
    ├── Verification result — Tier 1 and Tier 2 outcomes
    └── "How we know this"
```

## Desktop wireframe — a cited answer (the happy path)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Case IQ   Okafor v. Northgate Holdings Inc. ▾      ⌘K Search…      [Ask]        ?       DO ▾ │
├────────────────┬───────────────────────────────────────────────────────────────────────────────┤
│ CONVERSATIONS  │  Ask about my case                                                            │
│                │  Answers come only from the 412 documents in this case.                       │
│ [+ New question]│                                                              [About this ▸] │
│                ├───────────────────────────────────────────────────────────────────────────────┤
│ ▸ What happened│  Try one of these:                                                            │
│   on 5 March   │  [Where did the CAD $310,000 go?] [What does Michael Chen say about when he     │
│   2022?        │   learned of the transfer?] [Show me every document mentioning Meridian]       │
│                │  [What's missing that would help?]                                             │
│ ▸ Where did the├───────────────────────────────────────────────────────────────────────────────┤
│   $310,000 go? │                                                                               │
│                │  ┌─────────────────────────────────────────────────────────────────────────┐   │
│ ▸ Emails from  │  │ You                                                            · 09:41   │   │
│   January 2023 │  │ Where did the CAD $310,000 go?                                          │   │
│                │  └─────────────────────────────────────────────────────────────────────────┘   │
│ ▸ What does    │                                                                               │
│   Michael Chen │  ┌─────────────────────────────────────────────────────────────────────────┐   │
│   say about…   │  │ The papers show the payment leaving Northgate Holdings for Meridian     │   │
│                │  │ Payments Ltd. on 14 June 2021. They do not show where it went after      │   │
│                │  │ that.                                                                   │   │
│                │  │                                                                         │   │
│                │  │ ── What the papers show ──────────────────────────────────────────────  │   │
│                │  │                                                                         │   │
│                │  │ ● FOUND IN YOUR DOCUMENTS          Supported by the records              │   │
│                │  │ CAD $310,000 was transferred from Northgate Holdings Inc. to Meridian    │   │
│                │  │ Payments Ltd. on 2021-06-14.                                             │   │
│                │  │ 📄 Bank statement · Vol. 4 p. 7    📄 Wire transfer confirmation · Vol. 4  │   │
│                │  │                                       p. 1                               │   │
│                │  │                                                                         │   │
│                │  │ ● FROM THE DOCUMENT                Stated directly in a document          │   │
│                │  │ "Please confirm the receiving account for the Meridian payment. We will   │   │
│                │  │  be sending CAD 310,000 on Monday."                                      │   │
│                │  │ Email, Michael Chen to Meridian Payments · 2021-06-11                    │   │
│                │  │ 📄 Disclosure Vol. 2 · p. 19                                             │   │
│                │  │                                                                         │   │
│                │  │ ● FOUND IN YOUR DOCUMENTS          Supported by the records              │   │
│                │  │ Meridian Payments Ltd. issued an invoice for CAD $310,000 on 2021-06-15, │   │
│                │  │ described as "consulting services".                                      │   │
│                │  │ 📄 Meridian invoice · Vol. 5 p. 1                                        │   │
│                │  │                                                                         │   │
│                │  │ ── What the papers do not show ───────────────────────────────────────  │   │
│                │  │                                                                         │   │
│                │  │ ⓘ The uploaded case materials do not show where the CAD $290,000         │   │
│                │  │   leaving Meridian went. The trace stops there.                          │   │
│                │  │                                                                         │   │
│                │  │ ── Something to keep in mind ─────────────────────────────────────────  │   │
│                │  │                                                                         │   │
│                │  │ ⚠ One figure on the bank statement (Vol. 4 p. 8) was read by computer    │   │
│                │  │   from a scan — check it against the original.                           │   │
│                │  │                                                                         │   │
│                │  │ ── Legend ─────────────────────────────────────────────────────────────  │   │
│                │  │ ● Found in your documents · ● From the document · ● Alleged by a party    │   │
│                │  │ ○ A party's position · ● Your account · ◌ AI observation · ? A legal      │   │
│                │  │   question    [What the badges mean]                                     │   │
│                │  │                                                                         │   │
│                │  │ 3 documents matched this question. 1 more mentions "Meridian" without     │   │
│                │  │ naming the amount. [Show it]                                             │   │
│                │  │                                                                         │   │
│                │  │ [Send to my notes] [Add to my notes for my lawyer] [Flag this as wrong]  │   │
│                │  │ ▸ How we know this                                                      │   │
│                │  └─────────────────────────────────────────────────────────────────────────┘   │
│                │                                                                               │
│                ├───────────────────────────────────────────────────────────────────────────────┤
│                │  Ask about your papers…                                      [Send]           │
├────────────────┴───────────────────────────────────────────────────────────────────────────────┤
│  Answers come from your papers only. Case IQ does not give legal advice or predict outcomes.    │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## The six answer shapes

Every answer is structured by intent before it is written, so an amount question never returns prose
and a comparison question never returns a flat list (F19, J4 step 4).

### 1. List — *"Show me every document mentioning Meridian"*

```
│ 12 documents mention Meridian Payments Ltd. Three more mention "Meridian" without            │
│ naming the company.                                                                           │
│                                                                                               │
│ ┌────────────┬──────────────┬──────────┬──────────────────────────────────────────────────┐  │
│ │ Date       │ Type         │ Page     │ Matching text                                     │  │
│ ├────────────┼──────────────┼──────────┼──────────────────────────────────────────────────┤  │
│ │ 2021-06-11 │ email        │ Vol. 2   │ "…the Meridian payment. We will be sending        │  │
│ │            │              │ p. 19    │  CAD 310,000 on Monday."        [open source]     │  │
│ │ 2021-06-14 │ bank stmt    │ Vol. 4   │ "…MERIDIAN PAYMENTS LTD 310,000.00…"              │  │
│ │            │              │ p. 7     │                                 [open source]     │  │
│ │ 2021-06-15 │ invoice      │ Vol. 5   │ "…consulting services… CAD 310,000.00"            │  │
│ │            │              │ p. 1     │                                 [open source]     │  │
│ │ 2021-06-01 │ board mins   │ Vol. 6   │ no mention — see the note below                   │  │
│ │ …          │              │          │                                                   │  │
│ └────────────┴──────────────┴──────────┴──────────────────────────────────────────────────┘  │
│ 12 documents matched. 3 more mention "Meridian" without naming the company — [show].          │
```

### 2. Amount — *"How much went to Meridian?"*

```
│ The papers show CAD $310,000 going to Meridian Payments Ltd. on 2021-06-14.                  │
│                                                                                               │
│ CAD $310,000.00  ·  1 transaction  ·  read from Vol. 4 p. 7 and Vol. 4 p. 1                   │
│                                                                [See the rows behind this]      │
│                                                                                               │
│ ● FOUND IN YOUR DOCUMENTS       Supported by the records                                      │
│ Two documents in your papers record this payment: a bank statement line and a wire transfer   │
│ confirmation. They are not two payments.                                                      │
│ A copy of the confirmation also appears at Vol. 9 p. 1. It is the same document, so it is     │
│ counted once.                                                                                 │
│ 📄 Vol. 4 p. 7   📄 Vol. 4 p. 1   📄 Vol. 9 p. 1                                              │
```

### 3. Timeline — *"What happened in June 2021?"*

```
│ Five things in June 2021 are dated in your papers.                                            │
│                                                                                               │
│ ┌────────────┬──────────────┬────────────────────────────────────────────────────────────┐   │
│ │ Date       │ Precision    │ Event                                                      │   │
│ ├────────────┼──────────────┼────────────────────────────────────────────────────────────┤   │
│ │ 2021-06-01 │ exact        │ Northgate board meeting held · From the document · Vol. 6   │   │
│ │ 2021-06-11 │ exact        │ Chen emails Meridian instructing the receiving account ·    │   │
│ │            │              │ From the document · Vol. 2 p. 19                            │   │
│ │ 2021-06-14 │ exact        │ CAD $310,000 Northgate → Meridian · Found in your documents  │   │
│ │            │              │ · Supported by the records · Vol. 4 p. 7                     │   │
│ │ 2021-06-15 │ exact        │ Meridian invoice issued · From the document · Vol. 5 p. 1    │   │
│ │ 2021-06-22 │ ○ approximate│ Whitmore raises concerns with Chen · AI observation ·         │   │
│ │            │              │ Possible — worth checking · Vol. 5 msg 4                     │   │
│ └────────────┴──────────────┴────────────────────────────────────────────────────────────┘   │
│ ⓘ The document behind 22 June says "last Tuesday". We've worked out the date from the         │
│   message it appears in and marked it as approximate.                        [Open timeline] │
```

### 4. Comparison — *"What does Michael Chen say about when he learned of the transfer?"*

This is the shape reproduced from `01-product-vision.md` §4.2: the product's core payoff.

```
│ Your papers contain three statements relevant to this question. They appear inconsistent as to  │
│ timing.                                                                                         │
│                                                                                                 │
│ ● FROM THE DOCUMENT                    Stated directly in a document                            │
│ "I first became aware of the Northgate transfer in or around March 2023, when I was informed     │
│  by the finance department during a routine review of the 2021 accounts."                       │
│ Affidavit of Michael Chen · sworn 2024-02-14                                                    │
│ 📄 Disclosure Vol. 3 · p. 3                                                                     │
│                                                                                                 │
│ ● FROM THE DOCUMENT                    Stated directly in a document                            │
│ "Please confirm the receiving account for the Meridian payment. We will be sending CAD          │
│  310,000 on Monday."                                                                            │
│ Email, Michael Chen to Meridian Payments · 2021-06-11                                           │
│ 📄 Disclosure Vol. 2 · p. 19                                                                    │
│                                                                                                 │
│ ◌ AI OBSERVATION                       Supported by the records                                 │
│ These statements appear inconsistent as to when Michael Chen first learned of the transfer.      │
│ 📄 Vol. 3 p. 3   📄 Vol. 2 p. 19        [How we worked this out]                                 │
│                                                                                                 │
│ Possible explanations the documents do not resolve:                                             │
│  · The 2021 email may concern a different transaction that involved the same recipient.          │
│  · "Became aware of the Northgate transfer" may refer to a specific internal review rather       │
│    than the payment generally.                                                                  │
│  · The affidavit may be inaccurate as to the date.                                              │
│                                                                                                 │
│ This does not mean anyone has done anything wrong — there may be an explanation the documents    │
│ do not show.                                                                                    │
│                                                                                                 │
│ The uploaded case materials do not establish what Michael Chen knew, or when he knew it.         │
│                                                                                                 │
│ [Flag for investigation]  [Add to my questions for my lawyer]  [Open the full comparison]       │
```

### 5. Abstention — *"Who did David Okafor meet in June 2021?"*

```
│ ⓘ  Your papers don't answer this yet.                                                          │
│                                                                                                 │
│ Nothing in the documents you've added establishes who David Okafor met in June 2021.            │
│                                                                                                 │
│ What your papers do show about June 2021:                                                       │
│  · 2021-06-01  Northgate board meeting held                                                     │
│    From the document · Vol. 6 p. 1                                     [open source]           │
│  · 2021-06-11  Email from Michael Chen to Meridian Payments about the payment                   │
│    From the document · Vol. 2 p. 19                                    [open source]           │
│  · 2021-06-14  CAD $310,000 transferred from Northgate Holdings to Meridian Payments Ltd.       │
│    Found in your documents · Supported by the records · Vol. 4 p. 7     [open source]           │
│                                                                                                 │
│ The documents do not record any meeting David Okafor attended. They also don't say he            │
│ attended none.                                                                                  │
│                                                                                                 │
│ [Add a question for your lawyer]   [Search your papers]   [Add your own note about this]        │
```

**This is not an error state.** It is never red, never an exclamation mark, never "Sorry, I couldn't
find anything." It is a designed, reassuring answer (`14-ux-specification.md` §3.3, UX-3), and its
occurrence rate is instrumented as a *quality* signal, not a failure
(`01-product-vision.md` §7).

### 6. Legal-advice refusal — *"Should I settle?"* / *"Will I win?"* / *"Is this fraud?"*

The following string is **required verbatim** (`14-ux-specification.md` §5.4). Variants are permitted
only for length, and both elements — the declination and the redirect — are mandatory.

```
│ ⓘ  I can't tell you what your legal position is or what you should do — that's your lawyer's    │
│    role. What I can do is show you what your documents say, and help you organise your          │
│    questions for your lawyer.                                                                   │
│                                                                                                 │
│ [Show me the evidence about this]   [Add this to my questions for my lawyer]                    │
```

When the question is one the papers *can* partly speak to, the refusal is followed by the supported
material — never instead of it:

```
│ ⓘ  I can't tell you whether the transfer was permitted by the agreement — that's your lawyer's  │
│    role. What I can do is show you what the two clauses say.                                    │
│                                                                                                 │
│ ● FROM THE DOCUMENT                    Stated directly in a document                            │
│ "…shall be used solely for product development and working capital…"                            │
│ Subscription Agreement · Vol. 2 p. 9 ¶7.2        [open source]                                  │
│                                                                                                 │
│ ● FROM THE DOCUMENT                    Stated directly in a document                            │
│ "…working capital and related corporate purposes."                                              │
│ Subscription Agreement · Vol. 2 p. 9 ¶7.3        [open source]                                  │
│                                                                                                 │
│ ● A LEGAL QUESTION                                                                              │
│ Whether the payment falls within either clause is a question for your lawyer.                    │
│                                                                                                 │
│ [Add this to my questions for my lawyer]   [Show me everything about this payment]              │
```

## Mobile wireframe (375px)

```
┌─────────────────────────────┐
│ ✕  Ask about my case    ⋯   │
├─────────────────────────────┤
│ Answers come from your 412  │
│ documents only.             │
├─────────────────────────────┤
│ Try one of these:           │
│ ┌─────────────────────────┐ │
│ │ Where did the CAD       │ │
│ │ $310,000 go?            │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ What does Michael Chen  │ │
│ │ say about when he       │ │
│ │ learned of the transfer?│ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ You                     │ │
│ │ Where did the CAD       │ │
│ │ $310,000 go?            │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ The papers show the     │ │
│ │ payment leaving         │ │
│ │ Northgate Holdings for  │ │
│ │ Meridian Payments Ltd.  │ │
│ │ on 14 June 2021. They   │ │
│ │ do not show where it    │ │
│ │ went after that.        │ │
│ │                         │ │
│ │ ● FOUND IN YOUR         │ │
│ │   DOCUMENTS             │ │
│ │ Supported by the records│ │
│ │                         │ │
│ │ CAD $310,000 was        │ │
│ │ transferred from        │ │
│ │ Northgate Holdings to   │ │
│ │ Meridian Payments Ltd.  │ │
│ │ on 2021-06-14.          │ │
│ │                         │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ 📄 Vol. 4 · p. 7    │ │ │
│ │ └─────────────────────┘ │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ 📄 Vol. 4 · p. 1    │ │ │
│ │ └─────────────────────┘ │ │
│ │                         │ │
│ │ ⓘ The uploaded case     │ │
│ │   materials do not show │ │
│ │   where the CAD         │ │
│ │   $290,000 leaving      │ │
│ │   Meridian went.        │ │
│ │                         │ │
│ │ ── Legend ──────────    │ │
│ │ ● Found in your docs    │ │
│ │ ● From the document     │ │
│ │ ● Alleged by a party    │ │
│ │ ◌ AI observation        │ │
│ │ ? A legal question      │ │
│ │                         │ │
│ │ ┌─────────────────────┐ │ │
│ │ │  Send to my notes   │ │ │
│ │ └─────────────────────┘ │ │
│ │ ┌─────────────────────┐ │ │
│ │ │ Add to my questions │ │ │
│ │ └─────────────────────┘ │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ Ask about your papers…  ▲   │
├─────────────────────────────┤
│ Not legal advice.           │
└─────────────────────────────┘
```

## Primary actions

| Action | Trigger | Result | Permission required |
|---|---|---|---|
| Ask a question | `Enter` in the composer, or `⌘/Ctrl+Enter` | Answer streams; first token < 3s p50 | `matter:ai_query` |
| Use a suggested question | Chip click | Composer prefills; nothing is sent until the user sends | `matter:read` |
| Open a citation | Citation chip, or `Enter` on a table row | `EvidenceOverlay` opens; context preserved | `matter:read` |
| Send to my notes | Button on an answer | Answer saved with its citations intact and resolvable | `matter:write` |
| Add to my notes for your lawyer | Button | The answer's evidence is attached to the relevant brief section | `matter:write` |
| Flag this as wrong | Button | Records the report with the answer, its citations, and the verification result; feeds the evaluation set | `matter:read` |
| Flag for investigation | Button on a comparison answer | Creates an investigation question in the brief, section 12 | `matter:write` |
| Show me the evidence about this | Button in the refusal | Runs the retrieval the refusal declined to interpret, returning cited material only | `matter:ai_query` |
| Add this to my questions for your lawyer | Button in the refusal | Appends the question, verbatim, to the user's question list | `matter:write` |
| New question | "New question" | Starts a fresh conversation; the previous one is retained in history | `matter:read` |
| Show what's excluded | Coverage line link | Lists the documents excluded from retrieval and why | `matter:read` |
| Show "About this answer" | Disclosure | Retrieval and verification detail; expanded by default for professional users | `matter:read` |

## States

**Empty (new case, no documents).**
> "Nothing to ask yet.
> Ask works from the papers you add. Once your documents are in, you can ask things like 'Where did
> the CAD $310,000 go?'"
> `[Add your papers]`

**Empty (documents still processing).**
> "Some of your papers are still being read, so answers may be incomplete. 9 documents out of 412 are
> left. `[Ask anyway]` `[Tell me when it's done]`"

**Empty (no conversation yet, but the case has data).** Suggestions only — drawn from this case:
> "Try one of these: Where did the CAD $310,000 go? · What does Michael Chen say about when he learned
> of the transfer? · Show me every document mentioning Meridian"

**Loading (short).**
> Composer shows "Reading your papers…"; the answer area shows a skeleton shaped like a three-part
> answer. First token within 3s at p50.

**Loading (long, > 5s).**
> "Looking through 412 documents — about 20–40 seconds. `[Email me when it's ready]`"
> (A range computed from observed throughput, never a countdown.)

**Partial (some retrieval failed).**
> "This answer covers 398 of your 412 documents. 14 weren't readable, so they weren't searched.
> `[See which ones]` `[Search them again]`"

**Partial (an assertion was suppressed).**
> An answer never silently drops a suppressed assertion; the answer states the count:
> "1 statement we'd drafted for this answer didn't hold up against its source, so it isn't shown.
> `[See what was set aside]`"
> Expanding shows it inside the "AI suggested — not verified" disclosure, which the user must
> actively open (`09-evidence-provenance.md` §4.3).

**Abstention.** As shape 5 above. Never styled as an error.

**Legal-advice refusal.** As shape 6 above. The exact string is required.

**Error (retrieval failed).**
> "We couldn't search your papers just now. Nothing has changed and nothing is lost.
> `[Try again]` `[Search your papers instead]`"

**Error (quota reached).**
> "You've reached the question limit for this case. Your papers and your saved answers are
> unaffected. `[See your usage]`"
> (Quota is checked before the work begins, never a mid-job failure — F47 AC-3.)

**Error (fatal).**
> "Something went wrong on our side. Reference: req_01HQ7TB9X4.
> Your papers, notes, and earlier answers are unaffected. `[Reload]`"

**Zero-result (question about something not in the record).**
> Abstention, not zero-result. See shape 5. The distinction matters: a zero-result state implies the
> system searched and found nothing of *that kind*; an abstention says the record does not address
> the question, which is a different and more accurate statement.

## Interaction details

### Keyboard map

| Key | Action |
|---|---|
| `Enter` | New line in the composer (multi-line by default, because questions are often long) |
| `⌘+Enter` / `Ctrl+Enter` | Send |
| `↑` in an empty composer | Recall the previous question |
| `Esc` | Stop streaming; **the partial answer is kept and marked incomplete**, never discarded |
| `Tab` | Move from the composer to the answer's citation chips, then to its actions |
| `J` / `K` | Next / previous citation chip within an answer |
| `Enter` on a citation chip | Open the source overlay |
| `Esc` in the overlay | Close it; focus returns to that specific chip |
| `N` | Send the focused answer to notes |
| `B` | Add the focused answer to your notes for your lawyer |
| `W` | Flag the focused answer as wrong |
| `G` then `N` | Go to the newest conversation |
| `?` | Keyboard shortcut hint |

### Focus behaviour

- On send, focus stays in the composer until the first token arrives, then moves to the answer
  container, which is `tabindex="-1"` and announces itself.
- Streaming tokens are **not** announced individually. The answer container uses
  `aria-live="polite"` with `aria-atomic="false"` and announces in sentence batches, so a screen-reader
  user hears phrases rather than a stream of fragments.
- `Esc` during streaming stops generation and leaves focus in the answer container; the answer shows
  "Stopped. This answer is incomplete."
- Opening a citation from inside an answer traps focus in the overlay and returns it to that chip.

### Optimistic updates

- The user's question appears in the stream immediately, before the request resolves.
- Citation chips render disabled (skeleton) until each assertion's verification completes; an
  assertion is never rendered as established before Tier 1 has passed
  (`09-evidence-provenance.md` §4.1, F20 AC-2).
- "Send to my notes" and "Add to my notes for your lawyer" apply immediately and reconcile; failure
  reverts the button and names the failure.

### Undo

- "Send to my notes", "Add to my notes for your lawyer", and "Flag for investigation" are all
  undoable, with a 6-second toast and `U` afterwards.
- Stopping a stream is not undoable, but the partial answer is retained and a "Continue this answer"
  action is offered.
- Deleting a conversation is a soft delete and is recoverable from the conversation list's archive.

## Copy strings

```
ask.title                       "Ask about my case"
ask.scope.consumer              "Answers come from your papers only."
ask.scope.professional          "Answers are generated only from retrieved spans in this matter's 412 documents. Parametric answering is disabled."
ask.footer.disclaimer           "Answers come from your papers only. Case IQ does not give legal advice or predict outcomes."
ask.composer.placeholder        "Ask about your papers…"
ask.suggestions.heading         "Try one of these:"

ask.answer.matched              "{n} documents matched this question."
ask.answer.matched.more         "{n} more mention \"{term}\" without naming the company. [Show it]"
ask.answer.coverage             "This answer covers {shown} of {total} documents. {excluded} weren't readable, so they weren't searched."
ask.answer.coverage.link        "See which ones"

ask.abstain.heading             "Your papers don't answer this yet."
ask.abstain.body                "Nothing in the documents you've added establishes {subject}."
ask.abstain.shows               "What your papers do show about {period}:"
ask.abstain.note                "The documents do not record {subject}. They also don't say it didn't happen."
ask.abstain.action.lawyer       "Add a question for your lawyer"
ask.abstain.action.search       "Search your papers"
ask.abstain.action.note         "Add your own note about this"

ask.refusal.verbatim            "I can't tell you what your legal position is or what you should do — that's your lawyer's role. What I can do is show you what your documents say, and help you organise your questions for your lawyer."
ask.refusal.action.evidence     "Show me the evidence about this"
ask.refusal.action.questions    "Add this to my questions for my lawyer"

ask.legalQuestion.label         "A legal question"
ask.legalQuestion.body          "Whether {subject} is a question for your lawyer."

ask.inconsistent.hedge          "These statements appear inconsistent as to {subjectArea}."
ask.inconsistent.explanations   "Possible explanations the documents do not resolve:"
ask.inconsistent.mandatoryHedge "This does not mean anyone has done anything wrong — there may be an explanation the documents do not show."
ask.inconsistent.conclusion     "The uploaded case materials do not establish {subject}."

ask.suppressed.count            "{n} statement we'd drafted for this answer didn't hold up against its source, so it isn't shown."
ask.suppressed.action           "See what was set aside"
ask.suppressed.label            "AI suggested — not verified"

ask.figure.fromScan             "One figure on the bank statement (Vol. 4 p. 8) was read by computer from a scan — check it against the original."

ask.stop.partial                "Stopped. This answer is incomplete."
ask.stop.continue               "Continue this answer"

ask.action.sendToNotes          "Send to my notes"
ask.action.addToBrief           "Add to my notes for your lawyer"
ask.action.flag                 "Flag this as wrong"
ask.action.flagForInvestigation "Flag for investigation"
ask.action.openTimeline         "Open timeline"
ask.action.aboutThisAnswer      "About this answer"
ask.action.legend               "What the badges mean"
ask.action.newQuestion          "New question"

ask.legend                      "● Found in your documents · ● From the document · ● Alleged by a party · ○ A party's position · ● Your account · ◌ AI observation · ? A legal question"

ask.empty.noDocuments           "Nothing to ask yet. Ask works from the papers you add."
ask.empty.processing            "Some of your papers are still being read, so answers may be incomplete."
ask.loading.short               "Reading your papers…"
ask.loading.long                "Looking through {n} documents — about {low}–{high} seconds."
ask.loading.notify              "Email me when it's ready"

ask.error.retrieval             "We couldn't search your papers just now. Nothing has changed and nothing is lost."
ask.error.quota                 "You've reached the question limit for this case. Your papers and your saved answers are unaffected."
ask.error.fatal                 "Something went wrong on our side. Reference: {ref}."

ask.toast.savedToNotes          "Saved to your notes, with its sources."
ask.toast.addedToBrief          "Added to your notes for your lawyer."
ask.toast.flagged               "Thank you — we'll look at this answer."
ask.toast.failed                "That didn't save. Nothing was changed."
```

## Accessibility notes

**Semantics.**

- The message stream is a `role="log"` with `aria-live="polite"` and `aria-relevant="additions"`.
- Each answer is an `<article>` with an `<h2>` ("Answer, 09:41") so answers are navigable by heading.
- Assertions inside an answer render through `ClaimCard`, so class then confidence are announced before
  the claim text, consistently with every other surface.
- Structured answer bodies (list, timeline, amount, comparison) are real `<table>`s with `<caption>`
  and scoped headers — never a grid of divs, and never an image.
- Amounts are announced with their currency spelled out: "CAD three hundred and ten thousand dollars".
  Totals announce their constituent count: "CAD three hundred and ten thousand dollars, one
  transaction".
- The legend is a real list, reachable by keyboard, and its abbreviations are `aria-hidden` with the
  full class names as text.
- Citation chips are links with accessible names that include document name and page number.
- The `About this answer` panel is a `<details>` element, keyboard-operable, never a hover-only
  tooltip.
- The refusal and abstention states are **not** `role="alert"`. They are statements, not alarms, and
  alerting them would frame an honest answer as a failure.

**Announcements.**

- On send: `"Question sent. Looking through your papers."`
- On first token: the answer container announces `"Answer, 09:41"` and then reads in sentence batches.
- On completion: `"Answer complete. Three documents matched."`
- On abstention: `"Your papers don't answer this yet."` followed by the nearest supported facts.
- On refusal: the required string in full, followed by the two available actions.
- On a suppressed assertion: `"One statement was set aside because the source didn't support it."`
- On saving to notes: `"Saved to your notes, with its sources."`

**Table alternatives.** Every structured answer shape is already a table, so the requirement is met by
construction rather than by a fallback. Specifically:

- List answers → `<table>` with Date, Type, Page, Matching text.
- Timeline answers → `<table>` with Date, Precision, Event, Class, Source, and an explicit precision
  column, so approximate dates are never conveyed by styling alone.
- Amount answers → a `<table>` of the constituent rows with Amount, Currency, From, To, Source, and the
  OCR flag, plus the count.
- Comparison answers → a two-column definition list, not a table, because the two statements are
  parallel prose; each quote sits in a `<blockquote>` with its own `<cite>`.
- Abstention and refusal → plain text plus a real `<ul>` of the nearest supported facts.

**Other.**

- Reduced motion: token streaming is not animated; text appears as it arrives. The "thinking"
  indicator becomes a static line of text ("Reading your papers…") under
  `prefers-reduced-motion`.
- At 200% zoom the conversation list collapses and the message column takes the full width.
- At 375px the answer column is single-column, citation chips are 44px tall, and the composer is
  sticky to the bottom above the safe area.
- Contrast: the amber OCR caveat inside an answer meets ≥ 4.5:1 on its own surface in both themes.
- The composer is a `<textarea>` with a real `<label>` (visually hidden, text "Your question"), not a
  placeholder-as-label.

## Data dependencies

| Purpose | Endpoint |
|---|---|
| Ask a question (completed answer, or SSE stream) | `POST /matters/:matterId/chat` (`Accept: text/event-stream` for streaming) |
| Case-specific suggested questions | `GET /matters/:matterId/chat/suggestions` |
| Conversation list | `GET /matters/:matterId/chat/conversations` |
| New conversation | `POST /matters/:matterId/chat/conversations` |
| Messages with assertions and citations | `GET /matters/:matterId/chat/conversations/:id` |
| Soft-delete a conversation | `DELETE /matters/:matterId/chat/conversations/:id` |
| Save an answer to notes with citations intact | `POST /matters/:matterId/chat/messages/:id/save-to-notes` |
| Report a wrong answer | `POST /matters/:matterId/chat/messages/:id/flag` |
| Citation metadata and page render | `GET /evidence/:citationId` |
| Assertion with full provenance | `GET /assertions/:assertionId` |
| Re-run verification on a citation | `POST /evidence/:citationId/verify` |
| Fallback keyword/semantic retrieval | `GET /matters/:matterId/search?q&mode` |
| Coverage detail for the partial state | `GET /matters/:matterId/coverage` |
| Per-matter AI provider policy state | `GET /matters/:matterId/ai-policy` |
| Feature flags and provider policy for the actor | `GET /api/v1/meta` |
| Streaming endpoint contract | `POST /matters/:matterId/chat` with `Accept: text/event-stream` — token streaming for the direct answer only |

## Acceptance criteria

1. Zero assertions are displayed without a verified citation. The unsupported-assertion escape rate is
   0, tested continuously. (F19 AC-1, G-01, `01-product-vision.md` §7)
2. Abstention is returned when no retrieved span supports the query; ≥ 90% correct abstentions on the
   abstention evaluation set. (F19 AC-2)
3. An adversarial legal-advice prompt set of ≥ 30 prompts produces 100% refusal-with-redirect, and the
   refusal contains the mandated declination **and** the mandated redirect. (F19 AC-3,
   14-ux-specification.md §5.4)
4. Citation integrity rate ≥ 99.5% on the evaluation set. (F19 AC-4)
5. A citation whose quoted span does not appear in the source is never displayed as a citation; the
   assertion is suppressed and the count of suppressed assertions is disclosed to the user. (J4 AC-2,
   09-EP §6.3)
6. Saved answers retain resolvable citation links and remain resolvable after document deletion,
   showing "Source deleted" rather than a broken link. (J4 AC-5, F16 AC-3)
7. First token < 3s at p50; completion < 20s at p95 for a 2,000-document case. (F19 AC-6,
   14-ux-specification.md §8)
8. No answer is generated from parametric knowledge: retrieval precedes generation, and the model may
   cite only from the provided evidence bundle by citation index. (F19)
9. A copy-lint test over this screen's string table finds zero forbidden-vocabulary terms, and the
   refusal string matches the mandated text exactly. (14-ux-specification.md §5.3, §5.4)
10. Every answer's class badges are preserved, and the legend is available on the first answer of every
    conversation.
11. Cost per answer is metered and bounded by a configured per-matter ceiling; the ceiling is checked
    before the request, not after. (F19 AC-7, F47 AC-3)
12. Prompt-injection content embedded in an uploaded document does not alter the answer's behaviour or
    its citation discipline. (J4 failure modes, `18-red-team-risks.md` RT-04)
13. Stopping a stream with `Esc` keeps the partial answer and marks it incomplete.
14. The screen is fully operable by keyboard, and every structured answer is a real table.
15. The screen works at 375px with 44px touch targets and renders at 200% zoom.

## Open questions

1. **Where does the "About this answer" disclosure sit for consumer users?** It currently defaults to
   collapsed, per `09-evidence-provenance.md` §4.2. But the retrieval detail is one of the strongest
   trust signals we have for a person who has read about AI hallucinations, and collapsing it may be
   the wrong call for persona A. Needs testing.
2. **Should abstention rate be visible to the user?** We track it internally as a quality signal
   (`01-product-vision.md` §7). Displaying it could be a remarkable trust move — or could read as the
   product admitting it often cannot help. Unresolved.
3. **Multi-turn context.** The specification is silent on how much of a conversation is carried into
   retrieval. Carrying the full thread risks anchoring an answer on a previous answer rather than on
   the record. Not decided, and it interacts directly with criterion 8.
4. **Cross-matter questions.** A professional with three matters may reasonably ask about a pattern
   across them. This is currently prohibited by matter scoping (F03, G-05), and it is unclear whether
   the prohibition is a security boundary or just an artefact of the retrieval design. Needs a security
   review.
5. **What happens when the record changes under a saved answer?** If a document is reprocessed and a
   citation's span drifts, the saved answer's citation is `unverifiable` rather than broken. Whether the
   answer should be automatically re-verified and re-rendered, or left as a historical record of what
   was said, is unresolved. The professional-liability use case (persona C) argues for leaving it and
   flagging it.
6. **Refusal variation by question type.** The mandated string is fixed. For questions that are
   *partly* answerable (shape 6's second variant), we prepend a tailored declination. Whether that
   tailoring risks diluting the mandated boundary is a legal-review question, not a design one.
