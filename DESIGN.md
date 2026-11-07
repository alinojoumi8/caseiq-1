---
name: Case IQ
description: Your papers, organized into one timeline, with the page behind every fact.
colors:
  ground: "#f2f2f5"
  card: "#ffffff"
  ink: "#111111"
  body-2: "#2b2b31"
  muted: "#4f4f57"
  received: "#e5e5ea"
  received-hover: "#dadae1"
  sent: "#0a84ff"
  sent-hover: "#0877ea"
  action-indigo: "#2438a8"
  on-indigo: "#ffffff"
  indigo-wash: "#eceefa"
  your-words-violet: "#7a47b0"
  quote-slate: "#f1f4f8"
  quote-rule: "#7c8aa0"
  tag-line: "#c5cae6"
  hairline: "#d1d1d6"
  hairline-2: "#d6d6dc"
  bar-line: "#cfcfd6"
  rail: "#8e8e96"
  gap-line: "#55555c"
  error: "#a3191f"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 9.64cqw, 5rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 78"
  headline:
    fontFamily: "Bricolage Grotesque, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.2vw, 3.25rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 78"
  title:
    fontFamily: "Bricolage Grotesque, Segoe UI, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Bricolage Grotesque, Segoe UI, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.45
  body-sent:
    fontFamily: "Bricolage Grotesque, Segoe UI, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
  your-words:
    fontFamily: "Bricolage Grotesque, Segoe UI, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 500
    lineHeight: 1.35
  action:
    fontFamily: "Bricolage Grotesque, Segoe UI, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.2
  label:
    fontFamily: "Bricolage Grotesque, Segoe UI, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.3
  quote:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.35
  page-ref:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Mono, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.3
    fontFeature: "'tnum' 1, 'lnum' 1"
rounded:
  doc: "6px"
  tag: "12px"
  field: "14px"
  card: "18px"
  sheet: "22px"
  bubble: "26px"
  reply-bar: "35px"
  display: "52px"
  pill: "999px"
spacing:
  stack: "12px"
  thread: "14px"
  block: "40px"
  gutter-phone: "20px"
  gutter-tablet: "32px"
  gutter-desktop: "48px"
  section-y: "clamp(56px, 6vw, 80px)"
  content-max: "1440px"
components:
  bubble-received:
    backgroundColor: "{colors.received}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.bubble}"
    padding: "12px 18px"
  bubble-sent:
    backgroundColor: "{colors.sent}"
    textColor: "{colors.card}"
    typography: "{typography.body-sent}"
    rounded: "{rounded.bubble}"
    padding: "11px 22px"
  bubble-your-words:
    backgroundColor: "{colors.card}"
    textColor: "{colors.your-words-violet}"
    typography: "{typography.your-words}"
    rounded: "{rounded.bubble}"
    padding: "10px 20px"
  bubble-gap:
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "11px 16px"
  send-pill:
    backgroundColor: "{colors.action-indigo}"
    textColor: "{colors.on-indigo}"
    typography: "{typography.action}"
    rounded: "{rounded.pill}"
    padding: "0 9px 0 28px"
    height: "54px"
  chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.action-indigo}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "40px"
  chip-hover:
    backgroundColor: "{colors.indigo-wash}"
  chip-selected:
    backgroundColor: "{colors.action-indigo}"
    textColor: "{colors.on-indigo}"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.action-indigo}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "38px"
  reply-bar:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted}"
    rounded: "{rounded.reply-bar}"
    padding: "8px 9px 8px 12px"
    height: "70px"
  page-tag-pill:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.page-ref}"
    rounded: "{rounded.tag}"
    padding: "3px 10px"
  quote-card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.card}"
    padding: "12px 14px 14px"
  quote-text:
    backgroundColor: "{colors.quote-slate}"
    textColor: "{colors.ink}"
    typography: "{typography.quote}"
    padding: "10px 14px"
  field-input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0 14px"
    height: "48px"
  status-strip:
    backgroundColor: "{colors.received}"
    textColor: "{colors.ink}"
    padding: "4px 16px"
    height: "40px"
  sticky-reply:
    backgroundColor: "{colors.action-indigo}"
    textColor: "{colors.on-indigo}"
    rounded: "{rounded.pill}"
    padding: "6px 8px 6px 22px"
    height: "56px"
---

# Design System: Case IQ

## Overview

**Creative North Star: "The Phone Roll"**

The page is a phone conversation at page scale. Its material is the material people already keep their case in: a light grey ground, grey received bubbles with real tails, blue sent bubbles, white screenshot cards, a camera roll of photographed papers, a square video message, a status-bar strip at the top and a reply bar at the bottom. Headlines are themselves pinned messages, and section headings sit like the date separators between days in a chat. Proof is staged rather than claimed: a message lifts out of the thread with its page tag pinned to it, a leader line runs to a timeline rail, and whatever the papers do not show sits in a dashed "gap" bubble with a dashed node.

The system is calm and dense the way a messaging app is dense: generous type, tight vertical rhythm between messages (12 to 14px), and wide air between sections. Colour carries meaning, never mood. Every pressable thing is indigo; every non-pressable thing is not. The product's own meanings (violet italic for the person's words, serif with quotation marks for document text, mono for page references and figures) are used exactly as the app will use them, so the marketing page is a faithful preview of the product.

There is no laptop screenshot, no feature-card grid and no gradient atmosphere. Depth is a few soft shadows on cards, the lift and the action pill; everything else is flat. The only pictures are the ones a person would have on their phone: photos of example papers in the camera roll and one 30-second film sent as a message. Both are made with AI, say so, and show no face. Motion is a conversation arriving, and then it stops: nothing moves at rest.

**Key Characteristics:**
- Phone-thread materials (bubbles with tails, status strip, reply bar, camera roll) used at page scale.
- One action colour, indigo, used only on pressable things.
- Product UI meanings preserved: violet italic, serif with quotation marks, mono page references.
- Bricolage Grotesque condensed to 78% width for display, set inside bubbles.
- A timeline rail with solid dot nodes for evidenced facts and dashed nodes for gaps.
- One lift (rotated -1.4deg, lifted shadow) per thread; everything else rests flat.
- AI-made media, disclosed on the media and in the footer, with no faces.
- One motion system (GSAP), loaded after the first paint, idle at rest.

## Colors

A cool, near-neutral phone palette in which only three hues speak: messaging blue for the visitor's side of the conversation, indigo for action, violet for the person's own words.

### Primary
- **Action Indigo** (action-indigo): the only colour for pressable things: the send pill, quick-reply chips (outline at rest, filled when chosen), outline buttons, the Quick exit pill, cite chips, "See the page", text links, icon buttons, the focus ring, text selection, caret and native control accents. White text sits on it (on-indigo).
- **Indigo Wash** (indigo-wash): the hover fill for every outlined indigo control. Never a surface on its own.

### Secondary
- **Messaging Blue** (sent): sent bubbles only, the visitor's side of the conversation (the chosen case type, the FAQ question once open). White text on it is 3.7:1, so sent-bubble text is always 20px bold. Its hover state is Pressed Blue (sent-hover), changing the fill only so the tail stays seamless.
- **Received Grey** (received): received bubbles, the status strip and attachment bubbles. Attachment bubbles that are buttons darken to received-hover.

### Tertiary
- **Your-Words Violet** (your-words-violet): the person's own account, always italic, always in a white bubble with a hairline border. Never decoration, never a heading colour.
- **Quote Slate** (quote-slate) and **Quote Rule** (quote-rule): the surface and 3px left rule of verbatim document text.

### Neutral
- **Phone Ground** (ground): the page, the dialog body, the footer.
- **Card White** (card): screenshot cards, outlined controls, sheets, the reply bar.
- **Ink** (ink): text, pin badges, solid timeline nodes, leader lines.
- **Body Ink** (body-2): secondary running text in cards and lists.
- **Muted** (muted): helper text, captions, rail labels. Passes 4.5:1 at 13px.
- **Hairlines** (hairline, hairline-2, bar-line): bubble and card borders, section dividers, the reply-bar edge.
- **Rail** (rail): the timeline rail line and field borders. **Gap Line** (gap-line): dashed gap bubbles and dashed rail segments.
- **Tag Line** (tag-line): the border of page-tag pills.

### Semantic (product meanings)
- **Error Red** (error): form errors in the intake only (field borders at 2.5px, an error summary, inline messages), always with an icon and words. 7:1 on the ground. Never on evidence.
- **Green and amber** are reserved by the product and have no token in this build: green marks only the person's own completed steps, amber only allegations or computer-read caution. Neither may be introduced as decoration.

### Named Rules
**The Pressable Indigo Rule.** If it is indigo, it can be pressed; if it can be pressed, it is indigo (sent bubbles excepted, which belong to the conversation). Indigo never colours a heading, an icon in passing, or a surface.

**The Meaning Before Colour Rule.** Shape says what a thing is before colour does: a dashed outline is a gap, a tailed bubble is a message, a white card with a mono header is a document. Red and green never mark evidence.

## Typography

**Display Font:** Bricolage Grotesque (with Segoe UI, system-ui)
**Body Font:** Bricolage Grotesque (with Segoe UI, system-ui)
**Quote Font:** Source Serif 4 (with Georgia)
**Mono Font:** JetBrains Mono (with ui-monospace, Cascadia Mono, Consolas)

**Character:** one grotesque does everything a phone would say, squeezed to 78% width and weight 800 when it shouts. The serif appears only when a document speaks, and the mono only when a page is being pointed to.

### Hierarchy
- **Display** (800, 78% width, clamp(2.5rem, 9.64cqw, 4rem) on phones and tablets, up to 5rem from 1200px, line-height 0.98, tracking -0.015em to -0.025em): the hero headline, set inside a pinned received bubble.
- **Headline** (800, 78% width, clamp(2rem, 4.2vw, 3.25rem), line-height 1, -0.02em): section headings, centred between two hairlines like a chat date separator; also the large step numerals (44px).
- **Title** (800, 19px, 21px from 900px, line-height 1.2): the bold first line of a message bubble or step.
- **Body** (400, 17px, line-height 1.45 to 1.55): running text, capped at 48 to 60ch.
- **Body Sent** (700, 20px): text on messaging blue. **Your Words** (500 italic, 19px, violet).
- **Action** (700, 19px): the send pill. Outline controls run 13 to 16px at 600 to 700.
- **Label** (600, 13px): sender labels above a message ("Your words", "Your papers show"), the example pill, delivery notes. Sentence case, no tracking.
- **Quote** (Source Serif 4, 400, 19px, 17.5px in the desktop hero, 21px in the source viewer): verbatim document text only, always with its quotation marks.
- **Page Ref** (JetBrains Mono, 600, 13px, tabular lining numerals): page tags, quote-card source lines, rail dates and page numbers, file metadata.

### Named Rules
**The Who Is Speaking Rule.** Grotesque is the conversation, serif is the document, violet italic is the person, mono is the page reference. Never swap them for style. Mono also sets the thread's short metadata labels, as the approved sketch did: "Pinned · Case IQ", "Timeline", rail dates, the camera-roll caption, link-preview domains, citation field names, the film's length badge ("0:30") and its scene times in the text version. These work like timestamps. The words beside them stay grotesque: the film's "With sound" and "Made with AI" chips are Bricolage 13px semibold, and only the length is mono. Mono never sets a sentence.

**The Quotation Stripe Rule.** The 3px quote-rule stripe on the left of verbatim document text is a mandated product meaning (it marks words copied from a page), and the only side stripe in the system. It is justified there and nowhere else: never on cards, callouts, list items or alerts.

**The 13px Floor Rule.** No visible text is smaller than 13px, and every 13px line meets 4.5:1.

## Layout

A single reading column on phones; the thread grammar (received left, sent right, centred pills, a rail on the right) holds at every width.

- **Containers.** Content is capped at 1440px. Gutters are 20px on phones, 32px from 640px (hero), 48px from 900px. Sections breathe with clamp(56px, 6vw, 80px) vertically. Messages stack 12 to 14px apart; blocks inside a section sit 40px apart; two-column sections split 5fr / 7fr with a 64px gap from 1000px.
- **Hero.** One column in reading order on phones: H1 bubble, the "Pinned · Case IQ" label, the film message, subhead bubble, the "who checks" bubble, reply bar, reassurance, fine print, chips, then the example thread. The film message is min(62vw, 240px) square on phones. From 640px it takes the camera roll's old place beside the subhead, spanning the subhead and "who checks" rows, clamp(200px, 20vw, 232px) wide with a 28px gap (clamp(200px, 17vw, 232px) from 1200px; a 16px gap from 1440px, so its right edge lines up with the H1 bubble's). The camera roll now lives only in S4. From 1200px the hero becomes two columns (830px and 502px, 12px gap) with chips, reply bar, reassurance and fine print spanning below. The thread column holds a 602px minimum height so the chip row never moves when the example changes.
- **Hero thread order.** Sent case-type bubble, the example pill, the violet "Your words" bubble, the screenshot card ("Your papers show"), the lifted bubble with its page tag and leader to the rail, then the dashed gap bubble. Claim, then evidence, then gap.
- **Timeline rail.** A three-column grid: date labels (76px, 56px at 520px and below), a 28px node column, then the message. One 1px rail line runs through the node column.

### Sticky bars
- **Status strip** (top, always sticky, z 60): 40px on phones, 34px from 900px. Safety line on the left, Quick exit pill on the right. Below 400px the line and its dot are hidden, leaving only Quick exit. From 768px an indigo "Get my case in order" pill appears at its left once the hero's send pill has scrolled away; in the markup it comes after Quick exit, so Quick exit stays the first focusable control after the skip link. The pill and the sticky reply bar are both hidden while the conversation sheet is open (they are inert behind it).
- **Sticky reply bar** (bottom, phones under 768px only, z 50): a 56px indigo pill on a ground-to-transparent fade, plus the safe-area inset. It slides in only when the hero's send pill is out of view. The page's main element is padded 72px plus the safe area so nothing ends under it; scroll padding is 52px top and 88px bottom so anchors and focused fields clear both bars.

### Widths
- **320:** no horizontal overflow; the strip shows Quick exit alone; the H1 bubble gains top padding so the pin badge does not sit on the first line; the sticky bar is the first-screen way to start.
- **390:** the first screen (390x844) holds the H1, the film message and the top of the subhead; the sticky bar is the way to start there, and the hero reply bar (helper above a full-width send pill) follows the "who checks" bubble.
- **768:** the sticky bottom bar retires and the status-strip call to action takes over; the reply bar is one row (from 700px); nav links still sit behind the menu button.
- **900 and up:** the nav row shows four links and an outline call to action; the S4 filing scene pins on screens at least 800px tall.
- **1440:** two-column hero; the whole first screen (strip, nav, hero, chips, reply bar, reassurance) fits inside 900px.

## Elevation & Depth

Mostly flat, tonal layering: grey bubbles and white cards on a pale grey ground. Shadows are soft, two-layer and ambient, reserved for things that sit above the thread (cards, the lifted message, the reply bar, the action pill). No hard or offset shadows.

### Shadow Vocabulary
- **Card** (`0 1px 2px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.06)`): screenshot cards, sheets, help cards, the document page in the viewer, the film message (which rises 2px on hover to `0 2px 4px rgba(0,0,0,0.1), 0 14px 26px rgba(0,0,0,0.16)`).
- **Lift** (`0 2px 4px rgba(0,0,0,0.12), 0 16px 30px rgba(0,0,0,0.2)`): the one lifted message in a thread, popovers and dialogs.
- **Bar** (`0 8px 24px rgba(17,17,17,0.08)`): the reply bar and the intake composer.
- **Go** (`0 6px 14px rgba(36,56,168,0.35)`): the indigo send pill, the sticky bar and the film message's white play circle; deepens to 0.42 on hover.
- **Pin** (`0 3px 8px rgba(0,0,0,0.22)`): the black pin badge on a pinned bubble or note.

### Named Rules
**The One Lift Rule.** A thread carries at most one lifted message, rotated -1.4deg with the lift shadow. Everything else rests flat.

## Shapes

Messaging-app geometry. Bubbles are 26px rounded with a real tail at the bottom corner: two pseudo-elements, a 22x20px bubble-coloured patch with an 18px/16px curve, cut by an 11px ground-coloured patch; left for received, right for sent. The hero H1 bubble scales the same shape to 38px, 46px from 640px and 52px from 1200px. Cards are 18px, sheets and dialogs 22px, the reply bar 35px (30px on phones), fields 14px, page tags 12px, and every chip, outline button and send control is a full pill. Gaps are always dashed (1.5px): dashed bubbles, dashed rail segments, dashed hollow nodes, dashed "to be confirmed" outlines. Timeline nodes are 13px solid ink dots. A picture someone sent is a card, not a bubble: the film message takes the 18px card radius with no tail, since a tail would cut into the picture's corner. Camera-roll tiles have 8px corners (7px in the phone strip).

## Components

### Buttons
- **Shape:** full pill (999px).
- **Send pill (primary):** indigo fill, white 19px bold text, 54px tall, with a white 36px circle holding an indigo right arrow; go shadow. Full-width with text and arrow split on phones. Hover deepens the shadow; press scales to 0.98. The intake's final submit uses an up arrow (send) instead.
- **Outline:** white fill, 1.5px indigo border, indigo bold text, 38px (48px in the phone menu). Hover fills with indigo wash. Quick exit uses the same form at 32px (24px from 900px).
- **Icon button:** a 44px circle in the outline style.
- **Focus:** a 3px indigo outline, 3px offset, on every control.

### Chips (quick replies)
- **Style:** outline pill, 40px tall (44px on coarse pointers), 16px semibold indigo text.
- **State:** selected chips fill indigo with white text and show a check; hover is indigo wash; press scales to 0.97. Invalid intake chips take a 2.5px error border. Closed FAQ questions use the same outlined pill and become a filled sent bubble when opened.

### Cards / Containers
- **Corner Style:** 18px (cards), 22px (sheets, dialogs), 28px (the founding card).
- **Background:** card white on the ground.
- **Shadow Strategy:** card shadow; linked help cards rise 1px on hover with a slightly stronger shadow.
- **Border:** none, or a 1px hairline for quiet notes and grouped lists.
- **Internal Padding:** 12 to 28px, growing at 640px.

### Inputs / Fields
- **Style:** 48px tall, white, 1.5px rail-grey border, 14px radius, 17px text, indigo caret.
- **Focus:** the global indigo focus ring.
- **Error:** a 2.5px error-red border, an icon and a message below, and an error summary card with links to each field.

### Navigation
- Status strip above a 56px nav row with a hairline below. The wordmark is a black chat-bubble glyph beside "Case IQ" in 27px display type. Links are 15px medium, underlined on hover. Under 900px the links and call to action fold into a menu panel with 48px rows.

### Message bubbles (signature)
Received (grey), sent (blue, bold 20px), your words (white, hairline border, violet italic) and gap (transparent, 1.5px dashed, 22px radius, "Not in your papers yet" in bold). Sender labels sit above in 13px semibold muted text.

### Screenshot quote card and page tag (signature)
A white card with a mono source line (source, date, page), the serif quote on slate with its 3px rule, and an outline "See the page" pill that opens the source viewer. Page tags are mono 13px; the pill variant has a tag-line border and a small shadow and rides on lifted bubbles, anchored by its bottom edge so it grows upward when it wraps.

### Reply bar (signature)
A white 70px pill holding muted helper text and the send pill; on phones under 700px the helper sits above a full-width send pill. The intake's composer reuses it with a Back button.

### Conversation sheet (signature)
Where every call to action ends up: the intake and the early-access list as the top of a message thread, in one native `<dialog>` mounted once on the home page, so answers survive closing and reopening. From 768px it is a 460px panel docked right, 12px in from the top, right and bottom, 22px radius, the lift shadow, over a 50% ink backdrop; below 768px it is the whole screen (100dvh). The header is a messaging app's: a 44px outline Close circle, a 40px white avatar with the black chat glyph, "Case IQ" at 17px bold with the status line under it at 13px muted, and the Quick exit pill at the right. In the markup Quick exit comes first, so it is the first stop for the keyboard. The thread sits on the ground and scrolls inside the panel; the composer (Back and the send pill) stays at the bottom on a fade of the ground, with the safe-area inset. The early-access list sits under the thread. It enters in 260ms on the one ease-out curve (24px from the right on wide screens, 24px up on phones, with a fade), and leaves in 180ms; reduced motion shows it at once. The page behind keeps its width: the scrollbar's width is added as padding while the scroll lock is on. It adds no history entry and never touches the hash (Quick exit uses `location.replace()`, and Back must not be a way back in); opening from a link to /#start or /#waitlist removes the hash. The Quick exit rule: the page's own Quick exit is inert behind a modal, so the sheet carries its own, and Esc closes the sheet before the double-Esc exit can count.

The closing section is the first message of the same thread: words on the left, and on the right a white launcher card (22px, card shadow) holding "Step 1 of 6", question 1, its helper and the six case types as quick-reply chips (real buttons: one tap opens the sheet on question 2 with that answer echoed), then the reply bar with the send pill. Partway through, the chips give way to one received bubble and the pill says Continue; once sent, the card thanks the visitor by first name and offers "See your answers".

### Timeline rail, camera roll, cite chip and source viewer
- **Rail:** solid ink nodes for evidenced facts, dashed hollow nodes for gaps, mono date and page labels.
- **Camera roll:** eight photographs of example papers, made with AI (Krea, flux-2-klein), served as WebP tiles from `public/roll/` (`content/roll.ts` holds paths, sizes and provenance; `scripts/roll-assets.mjs` derives the tiles from the untouched sources, whose prompts are in `docs/marketing/site-media/roll/PROVENANCE.md`). The grid is 4 columns by 3 rows of 52px cells with a 4px gap: tile 1 (a texts screenshot) spans 2x2, tile 6 (a job posting) spans 2x1, and tiles 2 to 5, 7 and 8 (a handwritten note, a letter, an email, the letter's second page and two duplicates) take one cell each. Each tile has 8px corners, a 1px hairline border and a cover-fit photo on white, so a tile that fails to load is a white tile. Files are 3x their largest drawn size (324x324, 324x162, the rest 216x216), each at most 25 KB.
  - **Grade:** the paper photos are graded a little toward the film's warm, low-light look (red up, blue down, 96% brightness, 90% saturation) so they read as photos from one desk; the two screenshots are not graded.
  - **Words:** the only legible words are the example case's own, painted after generation in Geist: the chat keeps one received bubble, "They posted your old job online today", under "3 Feb 2025"; the posting reads "Operations Coordinator" with one "Full-time" tag, its other tags and its button empty and its body blurred into lines. The paper photos are softened at tile size until no letter can be read at 216px or at 3x: sigma 1.9 on the typed pages and 2.5 on the email, all over. On the note only the ink is blurred. The page without the writing is estimated as the median along each row, and the ink, everything darker than that page, is blurred at sigma 4.6 as its own layer and laid back on top. So the ruling runs sharp and unbroken through the writing, as real ink sits on ruled paper.
  - **Duplicates:** tiles 7 and 8, the two the S4 scene sets aside, are second photos of the letter and the email, derived without a new generation: the letter turned 4deg, warmer, shadow bottom right; the email turned -3deg, cooler and brighter, shadow top right, framed tighter and lower.
  - **Phone strip:** a row of eight 30px slots (4px gap, 1.5px dashed rail outline, 7px corners) above the first S4 row. Each tile is drawn at its roll size and brought into its slot by one cover scale, never two (the 2:1 posting is never squeezed), cropped by the slot and centred on the tile's focus (31% across for the posting, so its whole title shows and its button does not). On phones a row's own tile starts as a 72px thumbnail, keeps its size for 70% of its flight and shrinks onto its node at landing.
  - The caption under the roll is mono 13px muted: "Photos · notes · papers".
- **Cite chip:** a small outline pill after a fact (26px, hit area extended) opening a popover, or a bottom sheet on phones.
- **Source viewer:** a 22px dialog on the ground with a sticky head, showing a stylised page in which the quoted words are outlined with a 2.5px ink box on slate.

### Film message (signature)
The hero's 30-second film, sent into the thread as a media message. A square card (18px, no tail, card shadow, ink behind it) showing the clip's first frame (the pile of papers) as a WebP picture; under reduced motion the picture is the last frame (the column). Two ink chips sit stacked at the top-left, "With sound" and "Made with AI" (white on ink, 3px 10px, full pill, 13px semibold grotesque), above a 52px white play circle centred on the tile with an indigo Solar Bold play glyph and the go shadow. At the bottom-left the length, "0:30", is the same ink chip set in JetBrains Mono 600 with tabular figures, drawn from a data attribute so it is a picture of the length and not part of the control's name. The tile's accessible name holds both chips' words. Hover lifts it 2px; press scales to 0.98; while the player's code is still on its way, a white ring turns around the play circle. Under the tile: "The case in it is an example." (13px muted, one line) and a "Read it instead" text link. With motion allowed a silent clip plays over the picture once, after the intro has brought the message in and 60% of it is on screen; it rests on its last frame and never replays, and it is not fetched before then, or at all under reduced motion. Without JavaScript the tile is a link to the film's text page.

### Film player (signature)
A native modal `<dialog>` that reuses the conversation sheet's frame: the 460px panel docked right from 768px and the whole screen below, the same header (Quick exit first, Close, the chat-glyph avatar, "Case IQ" over "Film · 0:30"), the scroll lock, 260ms in and 180ms out. It adds no history entry, and the film is fetched only when it plays.
- **Film view:** the 9:16 film, contained, on ink so the bars read as a screen, with the browser's native controls and a captions track. Its poster frame is fetched when the player first shows the film.
- **Footer:** on the ground with a hairline above: the AI note at 13px muted ("The pictures, the voice and the music are made with AI. The case is an example, not a real case."), then two 44px controls on one row (stacked under 360px): an "Audio description" switch (an outline pill with a small track and knob, filled indigo when pressed; the described cut keeps the viewer's place) and "Read the film as text".
- **Text view:** "What the film says and shows" in display type (800, 78% width, 28px), then scene by scene: a mono scene time, sender-style labels ("On screen", "Voice") and 17px text, with hairlines between scenes; the timeline scene reuses the quote card's source line and serif quote. It ends on the send pill and "Free first conversation".
- **Ended:** the film's last frame is an end card already, so it stays up on its own ground with the native controls off, and the end stack sits in the empty slot at its foot: the real send pill, "Free first conversation" and an outline "Watch again", up to 340px wide, with no card, shadow or dim. It rises 10px and fades in over 300ms, and focus goes to the send pill. When the slot is too short the frame lifts, then scales from its top, so the stack never covers the frame's fine print.
- **Compact end:** where that would scale the frame below 0.85 (a small phone), the footage is left out and the stack stands alone at full size from the top of the stage: send pill, "Free first conversation", the not-a-law-firm line at 13px, Watch again.
- **Failed:** the film's area turns to the ground, a plain sentence says the film did not load, and one outline button, which takes focus, opens the text.

### Icons
Solar (480 Design, CC BY 4.0) from Iconify, shipped offline: `scripts/icons.mjs` copies only the glyphs in use into `components/world/solar-icons.ts`, so no icon is ever fetched. Linear glyphs at their 1.5 stroke (the hairline world) for outlines; Bold only where a solid glyph sits in a filled circle: the pin badge, the send arrows and the play triangle. Every glyph is inline SVG in currentColor, aria-hidden, with the name on the control that holds it. Glyph colour follows the Pressable Indigo Rule. The attachment's file glyph is ink on a static attachment (Timeline.pdf, Index of my papers.pdf) and Action Indigo only on the one that opens something, the summary (`button.attach`, `a.attach`). Sizes run from 14px (external link, source) to 26px (the attachment file), mostly 16 to 20px. Close is Solar's plus turned 45deg. Icons sit on controls (send and sticky-bar arrows, Close, menu, chevrons, play, the intake's up arrow), on meaning markers (the pin badge, the "checked by a person" tick in a circle, a chosen chip's tick, the error and note circles, the page and source glyphs, the attachment file) and on external links. The chat-bubble glyph is the brand mark and stays authored, not Solar.

### Footer
Plain and quiet on the ground. Among its lines are "All examples on this page are made up." and the credit line: "The film and the photos in the example case are made with AI. Icons: Solar by 480 Design, CC BY 4.0." "Solar" and "CC BY 4.0" are text links to the set's page and the licence; they open in a new tab and say so to screen readers ("opens in a new tab").

### Print
Print shows the finished page: anything a reveal is still holding (hidden messages, split heading words, S4's moved pieces) prints at full opacity with no transform, and a `beforeprint` handler lets every waiting reveal in. Print hides the sticky reply bar and every S4 tile (the roll's slot tiles, the phone row tiles and the strip tiles), so the roll prints as empty dashed slots, its finished state, and the rows carry the page.

### Motion
- **The stack:** GSAP 3.15 with ScrollTrigger, SplitText and CustomEase is the one animation system, registered once in `lib/motion/gsap.ts`. It loads only after hydration and only while motion is allowed, so it is never in the first paint and a visitor who asked for less motion never downloads it; if its code fails to load, the page simply stays finished. CSS transitions handle press, hover and panels. There is no Three.js and no WebGL.
- **Smooth scroll:** Lenis 1.3 smooths the wheel on desktop only: a fine pointer on a screen that hovers, with motion allowed. The GSAP ticker drives it and it reports every scroll to ScrollTrigger, so both read one position. It never captures, snaps or hijacks, and it stops while a dialog or menu is open. In-page links glide (0.6 to 1.4s on the one ease) and leave focus where the browser's jump would. Phones, tablets and reduced motion keep native scrolling.
- **Quiet at rest:** registering ScrollTrigger starts an endless requestAnimationFrame loop and a 250ms setInterval scroll check; on a phone, with Lenis off, these were the only frame work left at rest. `gsap.ts` swallows both by stubbing requestAnimationFrame and setInterval for the moment of registration, then restores them and sleeps and wakes the ticker. This leans on gsap 3.15.1 internals, and a rest-frames check fails if the two come back. Nothing runs at rest; the only looping animation is the film's busy ring, shown only while a tap waits for the player's code.
- **Easing:** one curve, ease-out `cubic-bezier(0.22, 1, 0.36, 1)`, also registered as GSAP's custom ease. Press and hover transitions are 160ms; panels 240 to 260ms; dialogs enter in 220ms (10px rise, 0.985 scale). The two springs are named eases too.
- **Hero intro:** a head script adds `html.js-motion` before first paint, only when motion is allowed, and CSS holds the intro's pieces 16px low and invisible; HeroMotion takes the class off in the same moment it sets their start state, so nothing flashes, and a 2.5s failsafe takes it off if the intro never starts. The pin badge drops in from 0.6 scale on the pop spring (0.12s). The "Pinned" label (0.2s), the film message and the subhead (0.26s and 0.38s; from 1024px, where they sit side by side, the subhead lands first) and the "who checks" bubble (0.5s) each rise 16px over 280ms. The example thread follows at 0.64s, its rail line drawing down with each row and the receipt last. The H1, reply bar, send pill, nav and status strip are never hidden. Below 640px the film message is held low but never invisible, since it is the largest paint there.
- **Send:** a chosen chip appears as a sent bubble with a short spring (stiffness 480, damping 24); the example thread's pieces rise in sequence over 260ms each.
- **The lift:** the lifted bubble rises from 16px below, unrotated at 0.97 scale, to -1.4deg over 300ms; the leader line draws in 200ms; rail nodes pop in on a spring (stiffness 500, damping 18).
- **Section reveals** (SectionMotion, every section below the hero): a heading of plain text reveals word by word, each word rising 0.35em and fading in over 300ms with a 50ms stagger (a heading with markup rises whole); the H1 is never split. Then the section's messages each rise 16px over 260ms, 90ms apart when they come in together. Headings and messages share one reveal line: 8px above the sticky reply bar while it is drawn on phones, otherwise 88% of the viewport height. A message's trigger is offset by its 16px rise, so it crosses the line at its resting position. A heading always plays before its messages: a message that crosses first plays the heading at once and waits for it. Only what is below the fold when the reveals mount is ever hidden, and what has arrived stays arrived for the life of the page. Content that is jumped to shows at once: a trigger that fires with its element more than a quarter of the screen past the line lets the whole section in; a hash, a click on an in-page link (that section and the one above), a Tab into a section and printing all let content in at once; and after a resize or zoom ScrollTrigger is asked to look again, so content brought on screen arrives without a scroll. S4's scene and the FAQ accordion keep their own motion.
- **S4 filing scene:** on screens at least 900px wide and 800px tall, the stage pins (CSS sticky, scrubbed by ScrollTrigger) below the status strip for 1.1 viewport heights while the camera-roll tiles fly to their rail nodes, the duplicates are set aside, then the gap and the "checked by a person" receipt arrive, leaving every roll slot an empty dashed outline. Scrolling is never captured. On narrower screens each row's tile lifts onto its node as the row scrolls into view, and the compact roll strip empties as rows land.
- **Conversation sheet and film player:** enter in 260ms (24px slide from the right on wide screens, 24px rise on phones, plus a fade), leave in 180ms; the backdrop fades with them. The film's end stack rises 10px over 300ms. Reduced motion: no movement, instant.
- **Back and Forward:** the page's CSS smooth scrolling would make the router's restore show the top of the page and then fly its whole length. On popstate, BackScroll sets scroll-behavior to auto for 800ms, so the page comes back where it was in one step.
- **Reduced motion:** the final state is shown: the full thread, the finished timeline (also the server render), the film's last frame with no clip, no pinning, no reveals, no sliding sticky bar, no Lenis, and every CSS animation and transition clamped to 0.01ms. CSS smooth scrolling is only enabled when motion is allowed.

### Accessibility
- WCAG 2.2 AA: 13px minimum text, 4.5:1 for small text, large bold text on messaging blue.
- 44px targets on coarse pointers (chips, "See the page", nav links, footer links, icon buttons).
- A skip link first, then Quick exit, on every page.
- A visible 3px indigo focus ring everywhere; FAQ buttons move it onto the bubble or pill.
- The page does not scroll behind an open dialog.
- Errors use an icon and words, never colour alone.
- Numerals in mono and dates are tabular.
- The film has captions, a text version and an audio-described cut; the film message's accessible name contains its visible chip words.
- Links that open a new tab say so to screen readers.

## Do's and Don'ts

### Do:
- **Do** set every headline as a message: the hero as a pinned received bubble, section headings as date separators between hairlines.
- **Do** keep indigo for pressable things, and give every outlined indigo control the indigo-wash hover and the 3px focus ring.
- **Do** show the person's words in violet italic, document text in Source Serif 4 with its quotation marks on slate with the 3px quote rule, and page references in JetBrains Mono.
- **Do** mark what the papers do not show with dashes: a dashed bubble, a dashed node, a dashed rail segment.
- **Do** keep sent-bubble text at 20px bold, since white on messaging blue is 3.7:1.
- **Do** ship a final, motionless state for every animation, and let reduced motion show it.
- **Do** keep a way to start on the first screen at 320, 360, 390 and 1440 (the hero send pill or the sticky bar).
- **Do** disclose AI-made media on the media itself (the film's "Made with AI" chip, the player's AI note) and in the footer credit line, and credit every licence the page uses (Solar, CC BY 4.0).
- **Do** paint only the example case's own words into a generated picture, and soften everything else past reading.
- **Do** show content that is jumped to (a link, a hash, focus, print, a resize) at once, without its reveal.

### Don't:
- **Don't** use indigo on headings, icons, surfaces or anything that cannot be pressed.
- **Don't** use red, green or amber on evidence; red is for intake errors only, green and amber are reserved for their product meanings.
- **Don't** use the serif for anything but verbatim document text, or mono for anything but page references, figures and short metadata labels. Never use mono for a sentence.
- **Don't** use a coloured left rule anywhere except verbatim quote text; it is the product's quotation mark, not a card accent.
- **Don't** lift more than one message per thread, or use hard or offset shadows.
- **Don't** capture or hijack scrolling; the filing scene pins and lets go with the page.
- **Don't** set visible text below 13px.
- **Don't** reveal or hold back the H1; it is in the first paint and never split into words.
- **Don't** show a face in generated media: the camera roll shows no people at all, and the film shows hands and forearms only.
- **Don't** leave anything animating at rest: no idle frame loops, timers or repeating animations once the page has settled.
