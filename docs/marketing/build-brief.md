# Case IQ marketing site — Build brief

**Builder:** Sonnet 5.5, high effort. **Orchestrator and reviewer:** Opus.
**Status:** v1 · 2026-10-31.
- Sections 0–12 are fixed.
- Section 13 (visual direction) is appended after the decision round.
- Copy comes from `docs/marketing/copy-deck.md`. Always use the latest version in that file.

---

## 0. Read first, in this order

1. `PRODUCT.md`: product truth, hard limits, brand commitments.
2. `docs/marketing/copy-deck.md`: **all visible copy**. Never invent, reword or add copy. If something is missing, stop and report it.
3. `docs/marketing/claim-register.md`: allowed facts and claims. The data for every citation chip comes from section A.
4. The **Direction contract**, which section 13 of this brief points to. It is the visual world and it is binding.
5. `docs/product/15-design-system.md`, which governs how product UI is depicted on the page:
   - §3.1, colour meanings;
   - §4.3, the verbatim-vs-paraphrase rendering contract;
   - §10.3, reduced motion.
6. `C:\Users\matri\.claude\skills\impeccable\reference\craft-floor.md`. Read it **immediately before** writing UI code. It is the quality floor and its bans are absolute.

---

## 1. Stack and setup

- **Location:** `apps/site/`, a standalone Next.js app using npm.
- **Scaffold non-interactively** with `npx create-next-app@latest apps/site`, with TypeScript, Tailwind, ESLint, App Router, `src/` dir and import alias `@/*`. Check `--help` for the current flag names.
- **Add:** `motion` (import from `motion/react`), `react-hook-form`, `zod`, `@hookform/resolvers`.
- **Dev dependencies:** `vitest`, `playwright` and `@axe-core/playwright` (for screenshots and a11y checks).
- **Fonts:** `next/font/google`, self-hosted at build time:
  - the faces the Direction contract names;
  - **Source Serif 4**, for verbatim document text in product UI depictions;
  - **JetBrains Mono**, for page references.
- **No UI kit** (no shadcn or component library). Build every control in the chosen world's vocabulary. A stock component inside a committed world is a lapse.
- **No analytics vendors, trackers, third-party scripts or remote runtime images.**
- Don't commit and don't deploy.

---

## 2. Structure

```
apps/site/
  src/app/layout.tsx                # fonts, metadata, lang="en-CA", skip link, Quick exit
  src/app/page.tsx                  # composes the sections
  src/app/privacy/page.tsx          # "Draft, pending legal review" banner
  src/app/terms/page.tsx            # same banner
  src/app/accessibility/page.tsx
  src/app/api/intake/route.ts
  src/app/api/waitlist/route.ts
  src/app/sitemap.ts · robots.ts · opengraph-image.tsx
  src/content/en.ts                 # ALL copy, keyed by copy-deck IDs, typed
  src/content/claims.ts             # citation data F1..F11 (claim register §A)
  src/content/examples.ts           # synthetic example cases (labelled on the page)
  src/components/<Name>.tsx         # one component per file
  src/lib/schemas.ts                # zod schemas shared by client and server
  src/lib/deliver.ts                # lead delivery adapter
  src/lib/analytics.ts              # track() stub
  scripts/copy-lint.mjs
  scripts/shoot.mjs                 # screenshots for the critique loop
  tests/*.test.ts
```

---

## 3. Content rules

- **Every visible string lives in `src/content/en.ts`,** under its copy-deck ID. Components hold no copy.
- **Conditional claims** (⚠ in the copy deck) keep a trailing comment naming their claim ID, for example `// ⚠K2`, so they can be found before launch.
- **Canadian English throughout.**
- **`scripts/copy-lint.mjs`:**
  - Scans `src/content/*.ts` case-insensitively, using word boundaries, for the banned list:
    - lied, lying, dishonest, untruthful, deceptive;
    - guilty, innocent, culpable, proved;
    - fraud, fraudulent, forged, forgery, theft, stole, embezzled, suspicious;
    - "you should", "you must", "we recommend", "best argument", "strongest point";
    - obviously, clearly, "of course";
    - "AI lawyer", "replaces a lawyer", "will win", "chances of";
    - simply, just, easy;
    - unlock, empower, seamless, revolutionize, game-changer, effortless, "peace of mind".
  - It keeps an explicit allowlist of string IDs, used only for a quoted bad example or a mandated product string.
  - It exits non-zero on any violation and is wired into `npm run lint:copy` and the test suite.
- **A content test** checks that every `<Cite id>` used in en.ts resolves in claims.ts, and that every example is labelled.

---

## 4. Components and behaviour

- **Skip link** to `#main`.
- **QuickExit**, on every page:
  - It is the first focusable element after the skip link.
  - Activating it runs `window.location.replace(QUICK_EXIT_URL)`, with the default `https://www.google.ca`.
  - Pressing Esc twice within 1 second also exits, but only when no dialog or popover is open, because Esc closes those first.
  - It never uses `pushState`.
  - Visible label "Quick exit", `aria-label` from copy.
- **Nav:** in-page anchors. On mobile, an accessible disclosure menu.
- **Case-type chips (hero):**
  - Radio-group semantics: `role="radiogroup"`, arrow keys move, one selected.
  - Selecting a chip swaps the **ProofCard** example with a short motion.
  - It also pre-fills intake step 1, held in React context. Never put it in the URL.
- **ProofCard**, following product semantics:
  - **YouSaid row:** violet italic.
  - **PapersShow row:**
    - the quote is set in Source Serif 4 with its quotation marks, on a slate quote surface with a 3px slate left rule;
    - the reference is in JetBrains Mono;
    - a "See the page" button opens the **SourceViewer**.
  - **Gap row:** "Not in your papers yet". It is a designed component with its own shape (for example a dashed outline or a blank card), never colour alone.
  - Footer label: "Example, not a real case".
- **SourceViewer:**
  - An accessible dialog: focus trap, Esc closes, focus returns to the trigger.
  - It renders a synthetic document page in HTML, with the page number.
  - **The quoted words are outlined** (shape), not only tinted.
  - Labelled "Example document".
- **Cite chip:**
  - A small inline button that opens a popover.
  - The popover shows: source title, publisher, date, locator, the verbatim quote (25 words or fewer), and an external link (`target="_blank"`, `rel="noopener noreferrer"`, with "opens in a new tab" for screen readers).
  - Only one popover is open at a time. It works by keyboard, and Esc closes it.
- **FactStrip:** tabular numerals, each fact with its Cite.
- **PileToTimeline:**
  - A sticky stage, linked to scroll with `useScroll`/`useTransform`. It **never hijacks scrolling**.
  - Synthetic papers move from scattered positions into dated timeline rows, each gaining its source chip, then the gap card appears.
  - The server renders the **finished timeline**, so it reads without JS. The animation only enhances it.
  - With `prefers-reduced-motion`, the visitor sees the static finished timeline.
- **HowItWorks:** 4 steps. A **"Start tonight"** card if the copy deck includes one.
- **WhatYouGet:** grouped as the copy deck says.
- **BriefPreview:**
  - A paged preview with previous/next controls, a page indicator and an "Example" label.
  - Its header carries the "Not legal advice · Not for filing" line.
- **AskYourPapers:**
  - Three question buttons. The answer panel uses `aria-live="polite"`.
  - Answers use product semantics: quotes in serif, references in mono, computer-read caution as a distinct marker.
  - The refusal's two action chips are **illustrative only**, inside the labelled Example frame. They are non-interactive and must not pose as working buttons.
- **Limits:**
  - Do and don't lists.
  - Free legal help links: external, new tab, announced to screen readers.
- **PrivacySafety**, **FoundingOffer** and **Waitlist** entry points.
- **FAQ:**
  - An accessible accordion: button + region, `aria-expanded`.
  - The same content generates FAQPage JSON-LD.
- **FinalCTA + IntakeForm** (§5). **Footer.**

---

## 5. Intake and waitlist

**Intake steps**
- One question per step, with "Step n of 6", Back and Next. Next is the default action, and Enter advances.
- On every step change, focus moves to the step's heading.
- Errors appear inline and in an announced summary. Answers are never lost when going Back.
- Step 2, "Somewhere else in Canada", switches to the waitlist with the case type pre-filled.
- Step 3, "In the next 2 weeks", shows the note linking to free legal help.

**zod schema** (shared by client and server):

| Field | Rule |
|---|---|
| `caseType` | enum |
| `location` | enum |
| `dateWindow` | enum |
| `hasLawyer` | enum |
| `paperAmount` | enum |
| `firstName` | 1–60 characters |
| `email` | must be valid |
| `phone` | optional, loose NANP format |
| `contactMethod` | enum: email, call, text |
| `safeToLeaveMessage` | enum: yes, emailOnly |
| `consentPrivacy` | must be literally `true` |
| `consentUpdates` | boolean, default `false` |

Spam protection:
- a honeypot field `company`, which must be empty;
- a time check: submissions sent less than 3 s after the form opened are rejected quietly.

**`POST /api/intake`**
- Validates with zod.
- Rate limits per IP in memory: 5 per 10 minutes. Note in a comment that this is best-effort on serverless.
- Delivers through `lib/deliver.ts`:
  - With `RESEND_API_KEY` and `LEAD_TO_EMAIL` set, it sends a plain-text summary through Resend's HTTP API (`fetch`, no SDK).
  - In development, it appends to `apps/site/.data/leads.jsonl` (gitignored) and logs a one-line notice.
  - In production without configuration, it returns **503** and the UI shows `err.submit`.
- **Never show success unless the lead was delivered or stored.**
- Each lead stores a consent timestamp and the version of the consent wording (CASL).
- No personal data in URLs. Server logs never include the payload in production.

**Waitlist**
- Fields: email, province or territory (all 13), preferred language (optional), `isProfessional`, and `consentLaunchEmails`, which must be literally `true`.
- Same delivery path.

---

## 6. Accessibility: WCAG 2.2 AA is mandatory

- Landmarks, one `h1`, and a logical heading order.
- **Contrast:**
  - text: 4.5:1;
  - large text and UI parts: 3:1.
- **Focus:** a visible focus ring of 2 px or more that contrasts with what's behind it.
- **Target size:** at least 24 px, and 44 px on touch wherever the layout allows.
- Colour is never the only signal (design system DS-2).
- `prefers-reduced-motion` turns off scroll-linked motion. State changes are then instant.
- Dialogs and popovers manage focus, close on Esc and use correct ARIA.
- Forms have labels, `aria-invalid`, `aria-describedby` errors and `autocomplete` (given-name, email, tel).
- Works at 320 px width and at 200% zoom, with no horizontal scroll.

---

## 7. Performance

- LCP under 2.0 s on a mid-range phone over 4G. CLS under 0.05. INP under 200 ms.
- Sections render on the server. **Only the interactive parts are client components:**
  - chips and ProofCard;
  - SourceViewer;
  - Cite;
  - PileToTimeline;
  - AskYourPapers;
  - BriefPreview;
  - FAQ;
  - IntakeForm;
  - Waitlist;
  - QuickExit.
- Use `LazyMotion` with `m` components to keep Motion small.
- Fonts: latin subset, `display: swap`.
- Raster images only if the Direction contract calls for them, through `next/image` with sizes.

---

## 8. SEO and metadata

- Title and description come from the copy deck's `meta.*`.
- Canonical URL, OpenGraph and Twitter metadata. `opengraph-image.tsx` renders a simple card in the world's style.
- **JSON-LD:**
  - `Organization`: name "Case IQ", no invented `sameAs`.
  - `WebSite`.
  - `FAQPage`, from the FAQ content.
- `sitemap.ts`, and `robots.ts` (allow all, disallow `/api`).

---

## 9. Analytics stub

`track(name, props)` logs in development and does nothing in production until a vendor is chosen.

**Events:**
- `chip_select`
- `see_page_open`
- `cite_open`
- `intake_start`
- `intake_step`
- `intake_submit`
- `intake_error`
- `waitlist_submit`
- `quick_exit`

**Never send personal data in event properties.**

---

## 10. Scripts and checks

**Scripts:**
- `lint`
- `typecheck`
- `lint:copy`
- `test` (vitest: schemas, copy lint, content completeness)
- `build`

**`shots`: `scripts/shoot.mjs` with Playwright, against `BASE_URL`** (default `http://localhost:3000`).
- **Sizes:**
  - desktop 1440×900;
  - tablet 768×1024;
  - mobile 390×844.
- **For each size:** the first viewport, plus the full page as consecutive viewport-height slices (`slice-01.png`, …).
- **States**, captured at the size that matters:
  - hero chip "Housing" selected;
  - SourceViewer open;
  - a Cite popover open;
  - Ask Q1, Q2 and Q3;
  - an FAQ item open;
  - intake steps 1–6 (mobile);
  - intake validation errors;
  - intake success (intercept the API route in the script);
  - the waitlist;
  - the full page with reduced motion (`emulateMedia`).
- **Capture rules:**
  - Wait for fonts and settled motion before capturing.
  - Never capture mid-animation.
- **Output:** `apps/site/.shots/<run-id>/`, plus an `index.md` listing each file and what it shows.

**`a11y`:** Playwright with axe on `/`, desktop and mobile. It prints violations and exits non-zero on serious or critical ones.

**Last step:** run impeccable's detector once on the finished UI:
`sh C:/Users/matri/.claude/skills/impeccable/scripts/impeccable detect --json apps/site/src`

---

## 11. Environment notes

- **Windows 11.** Git Bash and PowerShell are both available. Use npm.
- **GateGuard hook:** the first Write or Edit of a file may be blocked. When it is, state briefly:
  1. its callers or importers;
  2. that no existing file serves the same purpose;
  3. its data schemas, if any;
  4. the user's instruction, verbatim: "Approve, start".

  Then retry the identical operation. Prefer CLI scaffolding to reduce gated writes.
- **Long-running commands** (`npm run dev`) go in the background. Never leave a server running when you finish; report its port if you start one.

---

## 12. Definition of done (build v1)

- Sections S0 to the footer are implemented from `en.ts`.
- Every fact has a working Cite.
- Every interaction works by mouse, touch and keyboard, and reduced motion works.
- `lint`, `typecheck`, `lint:copy`, `test` and `build` all pass. axe reports no serious or critical violations.
- `shots` has run and produced a valid capture set: no blank or half-loaded images.
- **The final report covers:**
  - what was built;
  - every deviation from this brief, with the reason;
  - the open items;
  - the screenshot folder path.

---

## 13. Visual direction: The Phone Roll (chosen 2026-10-31)

### Binding sources

| What | Path | Rule |
|---|---|---|
| **Direction contract** | `.impeccable/surfaces/apps-site-src-app-page-tsx.md` | Read it first. **Never copy contract text into source code, comments, data attributes or any shipped file.** |
| **Approved first-viewport composition** | `.impeccable/mocks/decision/phone-roll.html` | The locked sketch. Code-led: the built first viewport must match its composition, scale and hierarchy at 1440×900. Copy comes from the copy deck v3, not the sketch. |
| **Copy** | `docs/marketing/copy-deck.md` v3 | Includes the "Phone Roll world microcopy" table. |

### Tokens (from the sketch)

| Token | Value |
|---|---|
| Ground | #F2F2F5 |
| Received bubble | #E5E5EA |
| Sent bubble | #0A84FF |
| Ink | #111111 |
| Muted | #4F4F57 |
| **Action (only on pressable things)** | **#2438A8** |
| Your words | violet #7A47B0, italic |
| Quote surface | #F1F4F8, with a 3px #7C8AA0 rule |
| Hairline borders | #D1D1D6 / #D6D6DC |

**Fonts, via next/font:**
- **Bricolage Grotesque**, variable (opsz 12–96, wdth 75–100, wght 400–800). Display is 800 at about 78% width with −0.02 to −0.025em tracking. Body is 400.
- **Source Serif 4** for verbatim document quotes.
- **JetBrains Mono** for page tags, timestamps and references.

**Shapes:**
- Bubbles have a 26 px radius and real tails, built with `:before`/`:after` exactly as in the sketch.
- The pinned H1 bubble has a 52 px radius.
- Pills and chips are fully rounded.
- Screenshot cards use an 18 px radius with a soft two-layer shadow.

### World vocabulary, per section

Use the world's grammar everywhere. **Depth rule:** the world is the ground and the major surfaces, but not every region acts out a chat. Keep long reading passages readable.

| Section | Treatment |
|---|---|
| **S0–S1** | Status-bar strip (safety line + Quick exit), then the nav row, as in the sketch. |
| **S2 Hero** | Exactly the FIRST VIEWPORT block. **On mobile:** single-column thread; the reply bar with "Get my case in order" becomes **sticky at the bottom**. Hide it while the intake is open or the footer is in view, and never let it cover focused inputs. |
| **S3 Problem** | A centred thread date separator acts as the section heading. Two received bubbles: "If you're representing yourself" / "If you're working with a lawyer". The bridge line is a sent bubble. |
| **S4 Pile → timeline** | A sticky stage. As you scroll, camera-roll thumbnails and bubbles file onto the timeline rail, and each row gets its mono page tag. The computer-read item carries a dashed "check the original" mark; the gap node is dashed. The server renders the final timeline. |
| **S5 How it works** | Four numbered messages (a real sequence, so numbers are allowed). "Start tonight" is a quiet pinned-note card. |
| **S6 Founding** | One calm white "card message" (like a shared booking card) holding the points and an indigo pill call to action, plus the founder-note slot. It renders nothing until real content exists, so no placeholder text ever ships. |
| **S7 What you get** | Three **attachment bubbles** (PDF icon + file name: "Timeline.pdf", "Summary for my lawyer.pdf", "Index of my papers.pdf"). Tapping the summary opens the paged preview with the D-3 header. "Also included" is a quieter grouped list. |
| **S8 Ask your papers** | A real Q&A thread. The three questions are suggested replies; choosing one sends it as a sent bubble. Case IQ answers in a received bubble with Source Serif quotes, mono page tags and the `world.checked` receipt line. Facts F2 and F9, with their cite chips, sit above the thread. |
| **S9 Limits** | "What we don't do" as one received bubble list. The free legal help links are **link-preview cards** (title, one line, domain), with the "We're not connected with them" note. |
| **S10 Privacy** | An inset grouped list, like a contact-info sheet. `privacy.note` is a distinct, calm note row. |
| **S11 FAQ** | An inset grouped list where each row expands. It must be an accessible accordion. |
| **S12 Final + intake** | **The intake is a chat:** each step's question is a received bubble and the options are quick-reply chips. The visitor's choice appears as a sent bubble, with Back available. **Underneath it is a real accessible form:** `fieldset`/`legend`, a radio group per step, labelled inputs on step 6, an error summary, and focus moved to each new question. Success is a received bubble. |
| **S13 Footer** | Plain and quiet, on the ground colour. |

### Never

- Phone-device mockups or hands holding phones.
- Apple, iMessage, WhatsApp or other trademarks, logos or exact app chrome. Use the generic chat grammar only.
- Gradient text, glass decoration, or emoji as icons. Icons are authored SVG with one stroke weight.

### Theme

Ship light in v1. Structure tokens as CSS custom properties so a dark theme (night reading) can be added later without touching components.
