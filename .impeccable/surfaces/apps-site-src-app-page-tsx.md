---
version: 1
slug: "apps-site-src-app-page-tsx"
primary_target: "apps/site/src/app/page.tsx"
related_targets: []
---

# Surface brief: Case IQ landing page

**Scope:** the marketing landing page, with its intake and early-access list. **Visitor mode:** Persuade.

**Audience and job.** People in Ontario with a court or tribunal case and little or no legal help, usually on a phone at night and wary of AI. They need to:
- understand what Case IQ does;
- believe it won't make things up;
- start a free conversation, or join the early-access list.

**Action**
- **Primary:** "Get my case in order" opens the 6-question intake, which leads to a free first conversation.
- **Secondary:** the early-access list.

**Proof and content**
- `docs/marketing/copy-deck.md` (v3) and `docs/marketing/claim-register.md`.
- Synthetic examples, always labelled.
- Cited facts F2 and F9.

**Constraints**
- `PRODUCT.md` hard limits.
- The product UI meanings:
  - violet italic is the person's own words;
  - serif with quotation marks is document text;
  - mono is page references;
  - red and green never mark evidence;
  - amber is never decoration.
- WCAG 2.2 AA, phone-first, Quick exit.

**Memorable moment.** A message lifts out of the chat thread with its page pinned to it and lands on the timeline rail.

**Unresolved, founder input:**
- founder note;
- price;
- turnaround;
- delivery formats;
- mailing address;
- domain;
- counsel review.

## Direction contract

**THESIS.** Your case already lives in your phone. The page is the conversation where your messages, emails and photos become a timeline, with every fact carrying its page. It refuses the category default: a headline and subcopy beside a laptop screenshot, over a row of equal feature cards.

**OWN-WORLD.** Phone-thread material at page scale.
- **Ground:** #F2F2F5.
- **Bubbles:**
  - received bubbles #E5E5EA, with real tails;
  - sent bubbles #0A84FF;
  - one action colour, indigo #2438A8, used only on pressable things.
- **Ink:** #111, muted #4F4F57.
- **Other materials:**
  - white screenshot cards with a soft two-layer shadow;
  - a camera-roll grid;
  - a status-bar strip;
  - a timeline rail with dot nodes and dashed gap nodes;
  - JetBrains Mono page tags;
  - Source Serif 4 quotes, with their quotation marks, on #F1F4F8 with a 3px #7C8AA0 rule;
  - the person's own words in violet #7A47B0 italic.
- **Type:** Bricolage Grotesque, 800 at about 78% width with tight tracking for display, 400 for body.

**STORY.** The visitor recognizes their own phone. They see one message lift out with its page pinned, so the proof is shown rather than claimed. They learn that a person checks every fact. They tap the reply bar's send button.

Every section below continues the same thread:
- the pile becomes a timeline;
- how it works;
- the offer;
- what you get;
- answers you can check;
- limits;
- privacy;
- questions;
- a final reply bar.

**SIGNATURE.**
- Choosing a quick-reply chip sends it as a bubble, and the example thread answers.
- One message lifts off, carrying its page tag, and settles onto the rail.
- In S4, camera-roll items file onto the rail as you scroll.
- "See the page" opens the source page with the quoted words outlined.
- **Motion:** a short spring on send, a 200–300 ms ease-out lift, one scroll-linked filing scene. Reduced motion shows the final states.

**FIRST VIEWPORT** (1440×900)
- **Top:** a 34 px status bar (safety line, Quick exit), then a 56 px nav row (chat-glyph wordmark, four links, outline call to action).
- **Left (about 830 px):**
  - the H1 as a giant pinned received bubble: about 80 px, condensed, three lines, with a pin badge and "Pinned · Case IQ";
  - the subhead bubble, with the camera-roll grid beside it;
  - the "AI reads, a person checks" bubble.
- **Right, the example thread, top to bottom:**
  - the sent case-type bubble, with "Example only. You haven't contacted us.";
  - the "Example" pill;
  - the violet bubble, labelled **"Your words"**;
  - the email screenshot card, labelled **"Your papers show"**;
  - a lifted, tilted text bubble with its page tag and a leader line to the rail;
  - the dashed gap bubble.

  *Recorded change (after critique round 1).* "Your words" now leads, so the thread reads claim, then evidence, then gap. That is the product's core mechanism. The sketch had the visitor's claim below its evidence. The conversion critic flagged it, and the founder's chosen direction is unchanged.
- **Chip row:** stays put when the example changes. The thread column keeps a fixed minimum height, sized to the tallest example.
- **Bottom:**
  - the quick-reply row;
  - the full-width reply bar, with the helper text and the indigo send pill "Get my case in order", which is the primary action;
  - reassurance and fine print.
- **Phone (390):** H1 bubble, subhead, the "who checks" line, reply bar, then the thread.

**FORM.** The Phone Roll, position 1 on my ordered list (the pick card, chosen by the user). seed:bf4a77bc9c96e780

**FINISH.** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
