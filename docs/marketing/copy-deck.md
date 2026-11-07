# Case IQ — Copy deck v3

**Status:** v3.1 · 2026-10-31. Merges copy critique rounds 1–3 (conversion, compliance, simulated visitor) and impeccable's quality floor. **Visual direction: The Phone Roll.**

**Final copy-loop scores (round 3):**
- Conversion 8.0 average
- Compliance 8.3
- Simulated visitor 8.5

The loop stopped at its 3-round cap. The remaining gap is **Proof**: a real name or founder story, and real examples later, which only the founder can supply.

**v3.1 fixes:**
- `ask.fact2` uses F9's exact source name;
- FAQ 7 keeps "or the law requires it";
- `world.delivered` became "Example only. You haven't contacted us.";
- `world.checked` moved to the timeline only;
- `founding.body` is scoped to the timeline and summary;
- new `intake.intro`;
- `hero.chipsLabel` is now in Case IQ's voice.

**v3.3 founder details (2026-10-31):**
- Pricing is a flat fee, set by what the client needs and how complex the case is. No starting price is published, so the "from $___" variant is gone. K3 is confirmed, and K7 now carries the founder's wording (FAQ 1).
- Contact email caseiq@agentmail.to. Mailing address 5255 Yonge Street, Unit 1104, Toronto, ON M2N 6P4, confirmed by the founder on 2026-10-31. Legal entity Case IQ Inc.

**v3.4 conversation sheet (2026-10-31):**
- The intake opens as a conversation sheet over the page from every call to action; the closing section shows question 1 as a launcher. New table S12b.
- Round 2: `intake.intro` now says nothing is sent until the visitor presses the final button (⚠K1, replaces ⚠K2; the reply-time sentence lives in `convo.status`). `err.submit` and `err.submitNoEmail` say the answers are still there. New `convo.dialogName`. The contact step's note now also says nothing is sent until the final button is pressed (⚠K1).

**Plan:** `docs/marketing/landing-page-plan.md` · **Claims:** `docs/marketing/claim-register.md`

**Conventions**
- Canadian English. Grade 6–8 reading level. No exclamation marks.
- `{cite:F2}` is a "where this comes from" chip for register claim F2.
- ⚠ID marks a conditional claim (register B or C). It ships only once the founder confirms it.
- **[bracketed]** text is a placeholder the founder must fill. It never ships as written.
- **Example** content is synthetic and always labelled on the page.
- String IDs map one-to-one to `src/content/en.ts`.

## v3 changes (from critique round 2)

- **Facts:** F2 uses the exact register wording. F9 says "civil cases" in plain words. `meta.title` is tagged.
- **"We" voice:** the demo answers as "we", with a "Checked by a person on our team" line. The invented chatbot contrast line is cut. "AI" is said plainly in `hero.who`, and that line is scoped to the timeline and summary.
- **Straight privacy answers:** "Could the other side get them?" now gets a direct answer. The privilege note covers what you write as well as what you say, includes paralegals, and is tagged for counsel review. "Not shared" names the service providers that store and process papers.
- **Safety:** the "Start tonight" tips are safe on a shared device.
- **No implied track record:** "usually takes" became "we aim to".
- **Fingerprint wording:** "hasn't been altered" became "hasn't changed since you gave it to us".
- **D-7:** money examples are now digital PDFs, so they don't need the computer-read note.
- **"lying" removed:** D-8's wording comes off the description card, and with it the copy-lint allowlist entry.
- **Smaller fixes:**
  - a tighter subhead;
  - the job gap reworded;
  - "J.P." changed to "Manager";
  - "saved emails" instead of "email exports";
  - the price placeholder now sits beside the days;
  - "Your papers stay yours" cut;
  - a new success tip;
  - "when the app is ready" cut;
  - the Phone Roll's world microcopy added.

---

## Global

| ID | Copy |
|---|---|
| `brand.name` | Case IQ |
| `cta.primary` | Get my case in order |
| `cta.primaryHelper` | 6 quick questions · A person replies within one business day ⚠K2 |
| `cta.waitlist` | Join the early-access list |
| `disclaimer.short` | Case IQ isn't a law firm and doesn't give legal advice. We organize your papers so you can take them to a lawyer, a legal clinic or your hearing. |
| `disclaimer.full` | Case IQ is not a law firm and does not provide legal advice. We help you organize your documents and prepare information for your lawyer. *(D-1)* |
| `example.label` | Example, not a real case |
| `quickExit.label` | Quick exit |
| `quickExit.aria` | Leave this site now |
| `quickExit.hint` | Leaves this site right away. You can also press Esc twice. |

"Not a law firm" appears exactly four times: the hero fine print, "What we don't do", FAQ 3, and the footer. The forms add `disclaimer.full` beside their consent text.

### Phone Roll world microcopy

| ID | Copy | Where it appears |
|---|---|---|
| `world.pinned` | Pinned · Case IQ | Under the headline bubble |
| `world.delivered` | Example only. You haven't contacted us. | Under the selected case-type bubble. Never "Delivered", which implies a request was sent. |
| `world.roll` | Photos · notes · papers | Under the camera-roll grid |
| `world.timeline` | Timeline | Above the timeline rail |
| `world.gapNode` | Gap · no page | Beside a gap node on the rail |
| `world.checked` | Checked by a person on our team ⚠C10 | A small receipt line under the example **timeline** (hero rail and S4), which C10 covers. Not under Q&A answers. |
| `world.replyPlaceholder` | *(uses `cta.primaryHelper`)* | Reply bar placeholder text |

---

## S0 · Safety bar

| ID | Copy |
|---|---|
| `bar.status` | Taking our first clients in Ontario, a few at a time ⚠K4 |
| *(control)* | Quick exit |

## S1 · Navigation

| ID | Copy |
|---|---|
| `nav.how` | How it works |
| `nav.get` | What you get |
| `nav.privacy` | Privacy |
| `nav.faq` | Questions |
| `nav.cta` | Get my case in order |

---

## S2 · Hero

On a phone, the reading order is: H1, film message (`film.*`, below; its chips "With sound" and "Made with AI" sit on the tile), sub, `hero.who`, the reply-bar button with its helper, then reassurance. The quick replies and the example thread come after that.

| ID | Copy |
|---|---|
| `hero.h1` | You know what happened. Let's find the page that shows it. |
| `hero.sub` | For people in Ontario with a court or tribunal case. Case IQ puts your emails, texts, photos, notes ⚠C4 and court papers into one timeline, with the page behind every fact ⚠C2. If your papers don't show something, we tell you ⚠C3. |
| `hero.who` | AI software reads every page. A person on our team checks every fact in your timeline and summary before you get them. ⚠C10 |
| `hero.cta` | Get my case in order *(with `cta.primaryHelper` as the reply-bar text)* |
| `hero.link` | See how it works |
| `hero.reassure` | Free first conversation ⚠K1 · Flat price, never hourly ⚠K3 · No documents needed to start |
| `hero.disclaimer` | *(uses `disclaimer.short`)* |
| `hero.chipsLabel` | What kind of case is it? Tap one to see an example. |
| `hero.chips` | Job or workplace · Housing · Money owed · Family & separation |

### Example thread (changes with the chip)

The thread carries `example.label` at its top.

| ID | Copy |
|---|---|
| `proof.yourWords` | Your words |
| `proof.papersShow` | Your papers show |
| `proof.gap` | Not in your papers yet |
| `proof.seePage` | See the page |
| `proof.addIt` | If you have it, add it to your papers. |

| Chip | Your words | Your papers show (verbatim) | Where it comes from | Not in your papers yet |
|---|---|---|---|---|
| Job | "My manager said my job was safe." | "Your role is not affected by the restructuring." | Email from your manager · 12 Jan 2025 · page 1 | A notice or letter about the restructuring |
| Housing | "I told my landlord about the mould in March." | "The mould in the bathroom is back. Can you send someone this week?" | Text to your landlord · 3 Mar 2025, 9:14 p.m. · page 12 | A reply from your landlord before May |
| Money owed | "I paid the contractor a $4,000 deposit." | "$4,000.00 sent" | E-transfer receipt (PDF) · 18 Jun 2025 · page 1 | Anything showing what the $4,000 was for |
| Family | "I paid half the mortgage every month after we separated." | "Transfer to joint account · $1,150.00" | Bank statement (PDF download) · April 2025 · page 2 (and 4 more months) | The statement for September |

**Lift message (the second source that lifts onto the rail), per chip.** All are made up and labelled Example.

| Chip | Lift message (verbatim) | Where it comes from | Rail marks |
|---|---|---|---|
| Job | "They posted your old job online today" | Text from a coworker · 3 Feb 2025 · page 4 | 12 Jan · page 1 → 3 Feb · page 4 → Gap |
| Housing | "Still no one has come about the mould." | Text to your landlord · 18 Mar 2025 · page 14 | 3 Mar · page 12 → 18 Mar · page 14 → Gap |
| Money owed | "Back on site next week." | Text from the contractor · 2 Jul 2025 · page 3 | 18 Jun · page 1 → 2 Jul · page 3 → Gap |
| Family | "August mortgage, my half" | E-transfer note · Aug 2025 · page 1 | Apr · page 2 → Aug · page 1 → Gap |

"See the page" opens a small viewer. It shows the synthetic page with the quoted words **outlined**, the page number, and the label "Example document".

### S2 · Film message and player

A square video message in the hero thread (a still of the pile that snaps into one column, played once and silent, then at rest) with a play control that opens the 30-second film in a player. The two things a visitor must know before the tap, that it has sound and that it is made with AI, are words on the tile itself (two ink chips at its top-left, above the play control), so they travel with the control wherever the sticky bar covers the page. The player has a text version of the film, an "Audio description" switch (the same film with its picture held, here and there, while a second voice describes what is on screen), an end card and a message if the film will not load. The text version is also a page of its own, `/film-text`, for visitors without JavaScript. The film, its voice, its music and its pictures are made with AI, and the page says so. All of it is an example.

| ID | Copy |
|---|---|
| `film.withSound` | With sound *(chip on the film message; said before the tap)* |
| `film.madeWithAi` | Made with AI *(chip on the film message)* |
| `film.example` | The case in it is an example. *(one line under the film message)* |
| `film.play` | Play the 30-second film, with sound. Made with AI. The player has a text version and an audio description. *(accessible name of the film message; it holds both chips' words, WCAG 2.5.3)* |
| `film.readInstead` | Read it instead *(opens the player's text version)* |
| `film.dialogName` | The 30-second film *(screen-reader name of the player)* |
| `film.status` | Film · 0:30 *(the line under "Case IQ" in the player header)* |
| `film.note` | The pictures, the voice and the music are made with AI. The case is an example, not a real case. |
| `film.error` | The film didn't load. You can read it instead. *(shown in the player if the film fails to load or play; its button is `film.readText`)* |
| `film.described` | Audio description *(the player's switch; its state is aria-pressed)* |
| `film.replay` | Watch again |
| `film.readText` | Read the film as text |
| `film.watch` | Watch the film *(the footer's switch back from the text view)* |
| `film.watchWithSound` | Watch the film, with sound *(the link at the foot of `/film-text`: without JavaScript it opens the film file, so it says the film has sound; with JavaScript it opens the player in place)* |
| `film.textTitle` | What the film says and shows |
| `film.onScreen` | On screen |
| `film.voice` | Voice |

**What the voice says** (`film.says`, in order; the captions file says exactly this):

| # | Line |
|---|---|
| 0 | You know what happened. |
| 1 | It's in here somewhere. |
| 2 | Let's find the page that shows it. |
| 3 | One timeline. |
| 4 | The page behind every fact. ⚠C2 |
| 5 | Bring the pile. Leave with a timeline. |
| 6 | Case IQ. |
| 7 | A flat price agreed before we start, never hourly. ⚠K3 |

**Scenes** (`film.scenes`: the time, the lines spoken, and what is on screen):

| At | Lines | On screen |
|---|---|---|
| 0:00 | 0, 1 | Night. A table covered in papers, seen from above. A bundle lands on the pile, and two hands search through it. |
| 0:05 | 2 | The papers lift off the table and land in one straight column. |
| 0:10 | 3, 4 | A timeline marked "Example, not a real case" lifts out of the column. Three dated rows land, one at a time: *(the three rows are the timeline examples 1, 3 and 4 in `examples.ts`, shown under this scene)* |
| 0:20 | 5 | Morning. A hand rests on the neat stack of papers. |
| 0:24 | 6, 7 | The timeline, the Case IQ name and the price line, with the lines "Case IQ isn't a law firm and doesn't give legal advice." and "Pictures, voice and music made with AI." |

The film the site plays is the site cut: the ad without its drawn "Get my case in order" button (nobody could press it) and with the AI line added to the end card. The player's end card and the text version end with the real send pill (`cta.primary`), the reply bar's helper line (`world.replyPlaceholder`) and `hero.reassure[0]` ("Free first conversation"), all reused. The page `/film-text` has the title `film.textTitle`, the note `film.note`, the same scenes, the same send pill, then "Watch the film, with sound" (`film.watchWithSound`) and "Back to the home page" (`legal.back`). The hero's film message leads to `/film-text` until the page has hydrated, so a tap that comes early never opens the bare video file. The end of the film leaves its last frame on screen, with the send pill, "Free first conversation" and "Watch again" in the empty slot at its foot (the reply bar's helper line goes first on a small screen); a film that will not load shows `film.error` in plain text with `film.readText` beside it. "Audio description" sits in the footer, beside the text switch.

**Audio description** (a voice take made with Krea, not shown on the page; recorded in `media.ts`). Four lines, placed in the gaps in the film's voice, holding the picture where a line is longer than its gap:

| # | The describer says |
|---|---|
| D1 | A table piled with papers, at night. |
| D2 | The papers rise, and land in one straight column. |
| D3 | A timeline rises, marked: example, not a real case. Each dated row shows its page: an email saying your role is not affected, a letter saying your position has been eliminated, and texts. |
| D4 | On screen: Case IQ isn't a law firm and doesn't give legal advice. Pictures, voice and music made with AI. |

**Error page** (`error.*`, `app/error.tsx`; shown in place of a page that threw, under the safety strip with Quick exit). NOT IN DECK, new:

| ID | Copy |
|---|---|
| `error.title` | Something on this page didn't load. |
| `error.retry` | Try again |

---

## S3 · Your story is in there somewhere

| ID | Copy |
|---|---|
| `problem.h2` | Your story is in there somewhere |
| `problem.alone.title` | If you're representing yourself |
| `problem.alone.body` | The email that shows what happened is somewhere in your inbox. The text is buried under a year of messages. At a hearing, there's little time to search. |
| `problem.lawyer.title` | If you're working with a lawyer |
| `problem.lawyer.body` | Your lawyer has to learn your story from your papers. When your papers arrive in order, less of their time goes to sorting. |
| `problem.bridge` | Either way, it starts with the pile. Case IQ helps you turn it into a case you can explain. |

---

## S4 · Bring the pile. Leave with a timeline.

| ID | Copy |
|---|---|
| `pile.h2` | Bring the pile. Leave with a timeline. |
| `pile.body` | Screenshots, saved emails, scanned letters, photos of handwritten notes, bank statements. We read every page, set duplicates aside ⚠C12, put everything in date order and link each event to the page it came from ⚠C2. |
| `pile.caption` | Example case. People and details are made up. |
| `pile.gap` | Not in your papers yet: an invitation or notes for the 20 January meeting. |

**Timeline items** (Example)

| # | Date | What | Quote | Where it comes from | Note |
|---|---|---|---|---|---|
| 1 | 12 Jan 2025 | Email from your manager | "Your role is not affected by the restructuring." | Email · page 1 | |
| 2 | 20 Jan 2025 | Your meeting notes | "Manager said no more cuts this year" | Your notes · page 1 | Read by computer. Check it against the original. *(D-7)* |
| 3 | 28 Jan 2025 | Letter from your employer | "Your position has been eliminated, effective today." | Letter · page 1 | |
| 4 | 3 Feb 2025 | Text from a coworker | "They posted your old job online today" | Texts · page 4 | |
| 5 | 3 Feb 2025 | Job posting (screenshot) | "Operations Coordinator, full-time" | Screenshot · image 1 | |
| 6 | 10 Feb 2025 | Severance offer | "four weeks' pay" | Letter · page 2 | |

---

## S5 · How it works

| Step | Title | Body |
|---|---|---|
| `how.h2` | How it works | |
| 1 | Tell us what's going on | A free conversation with a person on our team, about 20 minutes ⚠K1. No documents needed yet. If we work together, you'll agree on a flat price before we start ⚠K3. |
| 2 | Send us your papers | Use the link we send you ⚠P1. Emails, texts, photos, PDFs, handwritten notes. Messy is fine. If you have or had a lawyer or paralegal, ask them before you send us anything between you and them, or leave those messages out for now. |
| 3 | We put them in order | We read and date every page and link each fact to its page ⚠C2. Anything we couldn't read, or couldn't find, is marked ⚠C3. We aim to have your first timeline ready in about [X] days ⚠K6. |
| 4 | Check it, then take it with you | Correct anything we got wrong. Then use your timeline and index at your hearing ⚠C8, and take your summary to a lawyer or legal clinic ⚠C7. |

**Start tonight** (a small, quiet aside)

| ID | Copy |
|---|---|
| `tonight.title` | Not ready to talk yet? Start tonight. |
| `tonight.1` | Write down the dates you remember, in any order. |
| `tonight.2` | Put everything in one place only you can open: one folder, or one album. |
| `tonight.3` | Screenshot your own texts with the date showing, and keep the originals. |
| `tonight.4` | Keep everything for now. If that isn't safe on a shared device, a legal clinic or support worker may be able to help. |

---

## S6 · Hands-on help, a few people at a time

| ID | Copy |
|---|---|
| `founding.h2` | Hands-on help, a few people at a time |
| `founding.body` | We're taking our first clients in Ontario, a few at a time ⚠K4. A person on our team organizes your papers with you, using AI tools, and checks every fact in your timeline and summary against your pages ⚠C10. We're not lawyers or paralegals ⚠C13, and we don't give legal advice. |
| `founding.points` | Free first conversation ⚠K1 · Flat price, agreed before we start. Never hourly. ⚠K3 · First timeline in about [X] days ⚠K6 |
| `founding.person` | **[Optional founder note, only if the founder provides it: name, photo, one or two sentences on why. Never invented.]** |
| `founding.cta` | Get my case in order |
| `founding.alt` | Not in Ontario, or not ready yet? Join the early-access list |

---

## S7 · What you walk away with

**`get.h2`:** What you walk away with

**Three things you keep**
- **A timeline of your case.** Everything your papers show, in date order, with the people and amounts involved. Tap any line to see the page and words it came from. ⚠C2
- **A summary for your lawyer.** Your timeline, the papers you marked, what's missing and your questions, on a few pages, with a page reference for every fact. For a lawyer or a legal clinic. Not for filing. ⚠C7
- **An index of your papers.** Your papers numbered and labelled, so you can find any page quickly. You choose what to use. ⚠C8

| ID | Copy |
|---|---|
| `get.formats` | You get them as a PDF you can print and a link you can open on your phone. ⚠C11 |

**Also included** (quieter, smaller)
- **What's missing.** What your papers don't show yet, so you can look for it. ⚠C3
- **Your words, kept separate.** Plain questions help you tell your story in order. Your words stay marked as yours, separate from what your papers say. ⚠C14
- **Where papers disagree.** Two papers that say different things, side by side, with dates and pages. We don't decide who's right. ⚠C6
- **Handwriting, read.** Notes, letters and journals turned into searchable text. It's read by computer, so check it against the original. ⚠C4 *(D-7)*
- **Signatures, side by side.** A signature you're unsure about, enlarged next to signatures from your other papers. We don't say whether a signature is genuine. That's for a qualified document examiner, if you need one. ⚠C5

**Summary preview** (a paper object, labelled Example)
- **Header:** Summary for my lawyer · Prepared by Sam R. with AI assistance for discussion with counsel. Not legal advice. Not for filing. *(D-3)*
- **Pages:**
  1. Summary
  2. Timeline
  3. Papers I marked
  4. What's missing
  5. Questions for my lawyer
- **Page contents** reuse existing example lines, with no new claims:
  1. The three key S4 facts, with their page tags.
  2. The six S4 timeline items.
  3. Their six sources.
  4. The job gap and the 20 January gap.
  5. "Will I win?", the S8 Q3 question, added to the visitor's questions for a lawyer.

**Placeholders never render as brackets.** Values live in one site config: turnaround days, contact email, mailing address, legal entity.
- While a value is unset, the fragment that needs it is **omitted**:
  - the price fragment;
  - the turnaround point in `founding.points`;
  - the turnaround sentence in How it works step 3.
- FAQ 4 switches to `faq.4.noDays`.
- Contact email and mailing address are launch blockers. `npm run lint:launch` fails while any of them is unset.

---

## S8 · Answers you can check

| ID | Copy |
|---|---|
| `ask.h2` | Answers you can check against your own papers |
| `ask.fact1` | 103 of 237 people representing themselves who answered (43%) had used AI to help prepare their case. {cite:F2} |
| `ask.fact2` | Ontario's Superior Court of Justice, in its AI practice direction for civil cases: everyone who prepares court papers, lawyers and the people in the case, is responsible for their accuracy, particularly when AI is used. {cite:F9} |
| `ask.body` | A chatbot gives you an answer. Case IQ gives you the page it came from, so you can check it yourself ⚠C2. If your papers don't answer a question, we say so ⚠C3. Case IQ uses AI too, so every fact shows its page. Check it before you rely on it. |
| `ask.prompt` | How we answer questions about your papers (example case). In the service, the person helping you answers, with the page. ⚠C15 |
| `ask.sender` | The person helping you · example *(sans sender line above each answer bubble)* |

**Q1 · "When was I told my job was safe?"** — cited answer

Your papers mention this twice.
- An email from your manager on 12 January 2025 says: "Your role is not affected by the restructuring." *[Email · page 1]*
- Your notes from the 20 January meeting say: "Manager said no more cuts this year." *[Your notes · page 1 · Read by computer. Check it against the original.]*

**Q2 · "Did they give me a reason in writing?"** — honest gap

Your papers don't answer this yet. The letter of 28 January says your position was "eliminated" *[Letter · page 1]*, but none of your papers explains why. If you have something that does, add it.

**Q3 · "Will I win?"** — declines legal advice

We can't tell you what your legal position is, how your case will go, or what to do. That's a question for a lawyer or a legal clinic. What we can do is show you what your papers say, or add this to your questions for a lawyer.
*(No chips: the redirect is part of the sentence.)*

*Note:* this adapts the product's required refusal (`14` §5.4). It uses the "we" voice, since a person answers, and doesn't assume the visitor has a lawyer. Ship it only once the founder amends §5.4 to match.

---

## S9 · What we don't do

| ID | Copy |
|---|---|
| `limits.h2` | What we don't do |
| `limits.dont` | Give legal advice · Tell you what to do, or how your case will go · Decide who's telling the truth · Write or file court documents · Speak for you at a hearing · Stand in for a lawyer |
| `limits.do` | What we do: organize your papers, so you can find, check and explain what's in them. |
| `limits.help.title` | For legal advice, try these free and low-cost services. We're not connected with them. |
| `limits.help` | *(the six resources in claim register §D)* |

---

## S10 · Privacy and safety

**`privacy.h2`:** Who sees your papers, and what happens to them

| Item | Copy | Claim |
|---|---|---|
| Who can see them | You, people you invite, and the person on our team helping you. The AI services we use read them too, to organize them. Our privacy notice names those services. | ⚠P1 |
| Not used to train AI | We don't train AI models on your case, and neither do the AI services we use. | ⚠P2 |
| Not shared | We don't share your papers with anyone else, except services that store and process them for us, or when a court or the law requires it. | ⚠P7 |
| Yours to keep or delete | Download your case or delete it anytime. If you're in a legal proceeding, you may need to keep your documents. Ask a lawyer or legal clinic before deleting. | ⚠P4 |
| Contact on your terms | Tell us how to reach you and whether it's safe to leave a message. We only use the way you choose. | ⚠P8 |
| Quick exit | Sharing a device, or need to leave fast? Quick exit, at the top of every page, takes you to another site. | |

| ID | Copy |
|---|---|
| `privacy.note` | One thing to know: we're not lawyers, so solicitor–client privilege doesn't cover what you share with us. That privilege protects what you and your own lawyer say or write to each other. A court or tribunal could order us to hand over what you share, including what you tell us. If you have or had a lawyer or paralegal, ask them before sending us anything between you and them. ⚠P5 (counsel review) |

---

## S11 · Questions

1. **What does it cost?**
   Your first conversation is free ⚠K1. If we work together, we agree on a flat price before we start, never an hourly rate ⚠K3. The price depends on what you need and how complex your case is ⚠K7.
2. **Is Case IQ software or a person?**
   Both. AI software reads every page and puts it in order. A person on our team checks every fact in your timeline and summary against your pages before you get them, and you talk to a person, not a bot. ⚠C10
3. **Is Case IQ a law firm? Do you give legal advice?**
   No. We organize your papers so you can take them to a lawyer, a legal clinic or your hearing. For legal advice, try the free and low-cost services listed on this page.
4. **How long does it take?**
   We aim to have your first timeline ready in about [X] days after we have your papers ⚠K6. If your hearing is close, tell us in the form. If we can't help in time, we'll say so right away and point you to free help.
   *Until [X] is set (`faq.4.noDays`):* We'll tell you how long it will take in your free conversation, before you decide. ⚠K6b
5. **What do I get, and can I use it at my hearing?**
   A timeline, a summary for your lawyer, and an index of your papers, as a PDF you can print and a link you can open on your phone ⚠C11. Your timeline and index are for you, to find pages quickly, including at your hearing. The summary is for a lawyer or legal clinic, not for filing. Each court has its own rules about what it accepts.
6. **How is this different from asking a general AI chatbot?**
   A chatbot gives you an answer. Case IQ gives you the page it came from, so you can check it ⚠C2, and tells you when your papers don't answer a question ⚠C3. A person on our team checks every fact in your timeline and summary. ⚠C10
7. **Who can see my papers? Could the other side get them?**
   You, people you invite, and the person on our team helping you. The AI services we use read them too, and our privacy notice names them ⚠P1. We don't give your papers to the other side or anyone else, except services that store and process them for us, or when a court or the law requires it ⚠P7. For example, a court or tribunal could order us to hand them over, because solicitor–client privilege doesn't cover us. That privilege protects what you and your own lawyer say or write to each other. If that worries you, ask a lawyer or legal clinic before you share. ⚠P5 (counsel review)
8. **Do you use my papers to train AI?**
   No. We don't train AI models on your case, and neither do the AI services we use. ⚠P2
9. **Can you read handwriting, or check a signature?**
   We turn handwritten notes into searchable text and mark any word we couldn't make out, so you can check it against the original ⚠C4. For a signature you're unsure about, we show it enlarged next to signatures from your other papers ⚠C5. We don't say whether a signature is genuine. That's for a qualified document examiner, if you need one.
10. **Will the court accept papers organized with Case IQ?**
    We can't promise that. Courts decide what they accept, and each has its own rules. We never change your original documents. We also keep a unique code for each file that would change if the file did, so you can show it hasn't changed since you gave it to us. ⚠C9
11. **What kinds of cases do you help with?**
    Cases where papers pile up: work, housing, money owed and small claims, civil lawsuits, family and separation, human rights, insurance and benefits. We're not taking criminal cases yet.
12. **I'm not in Ontario, or I'd like French. Can I still use it?**
    We're starting in Ontario, in English. Join the early-access list, tell us your province and language, and we'll let you know.
13. **Can I share texts and emails that involve other people?**
    Only share papers you have a right to have and use, including ones about other people. If you're not sure about something, ask a lawyer or legal clinic before you share it.

---

## S12 · Final call to action and intake

| ID | Copy |
|---|---|
| `final.h2` | You don't have to sort it alone. |
| `final.body` | Tell us a little about your case. It takes about two minutes. A person replies within one business day. ⚠K2 |
| `final.email` | Prefer email? Write to caseiq@agentmail.to *(the address is a mailto link)* |

### Intake (one question per screen)

| ID | Copy |
|---|---|
| `intake.intro` | These are set questions, not a live chat. Nothing is sent until you press “Request my free conversation” at the end. ⚠K1 *(the button label is filled from the contact step's `submit`; the reply-time sentence now lives only in `convo.status`)* |
| `intake.progress` | Step {n} of 6 |
| `intake.back` / `intake.next` | Back / Next |

1. **What's your case about?**
   - *Helper:* Pick the closest one. You can explain when we talk.
   - *Options:* Job or workplace · Housing (landlord and tenant) · Money owed or small claims · Family & separation · Being sued · Something else
   - *Note:* pre-filled from the hero chip.
2. **Where is your case?**
   - *Options:* Ontario · Somewhere else in Canada
   - *If elsewhere:* We're starting in Ontario. Join the early-access list and we'll tell you when we can help in your province. **[Join the early-access list]** The case type carries over.
3. **Is there a date coming up?**
   - *Helper:* A hearing, a deadline, a meeting with a lawyer. Anything with a date.
   - *Options:* In the next 2 weeks · In 2 weeks to 3 months · Later, or no date yet · Not sure
   - *If within 2 weeks:* We'll do our best to reply sooner. If your date is very close, a free legal clinic may also be able to help. **[See free legal help]**
4. **Do you have a lawyer or paralegal right now?**
   - *Options:* No · Yes · I had one before · I'm looking for one
   - *If "Yes" or "I had one before":* If you have or had a lawyer or paralegal, ask them before you send us anything between you and them, or leave those messages out for now.
5. **How much paper is there?**
   - *Helper:* A rough guess is fine.
   - *Options:* A few documents · A folder or two · A box or more · Mostly on my phone
6. **How can we reach you?**
   - *Fields:* First name · Email · Phone (optional)
   - *Best way to reach you:* Email · Phone call · Text message
   - *Only when "Phone call" is chosen (`intake.voicemail`):* Can we leave a voicemail? · Yes · No (default: No). Choosing "Text message" asks nothing more. Email asks nothing more.
   - *Note:* Nothing is sent until you press “Request my free conversation”. Please don't include private details here. We'll ask what we need when we talk. ⚠K1 *(the button label is filled from `submit`)*
   - *Required:* I've read the privacy notice and agree to it. *(link)*
   - *Optional, unticked:* Send me occasional updates about Case IQ. I can unsubscribe anytime. Case IQ Inc., 5255 Yonge Street, Unit 1104, Toronto, ON M2N 6P4, caseiq@agentmail.to
   - *Small print:* `disclaimer.full`
   - *Button:* **Request my free conversation** ⚠K1

**Errors**

| ID | Copy |
|---|---|
| `err.name` | Please enter your first name. |
| `err.email` | Please enter an email we can reach you at. |
| `err.emailInvalid` | This email address looks incomplete. Please check it. |
| `err.phoneInvalid` | This phone number looks incomplete. Please check it, or leave it blank. |
| `err.phoneRequired` | Please enter a phone number, or choose email. *(Phone is required when the contact method is a call or a text. The voicemail question shows only for call or text.)* |
| `err.consent` | Please agree to the privacy notice so we can contact you. |
| `err.submit` | Your request wasn't sent. Your answers are still here. Please try again, or email us at caseiq@agentmail.to. |

**Success**

| ID | Copy |
|---|---|
| `success.title` | Thank you, {firstName}. |
| `success.body` | A person on our team will reply by {method} within one business day ⚠K2. Nothing by {nextBusinessDay}? Write to caseiq@agentmail.to. Please don't send any documents until we've talked. *({method}: email, phone call, or text message. {nextBusinessDay}: a weekday name.)* |
| `success.tip` | While you wait, put your papers in one place, so they're ready when we talk. |

### Early-access list

| ID | Copy |
|---|---|
| `waitlist.h` | Join the early-access list |
| `waitlist.toggle` | Not in Ontario, or not ready yet? Join the early-access list *(collapsed link that expands the form)* |
| `waitlist.body` | We'll email you when Case IQ opens in your province, or when we have room in Ontario. |
| `waitlist.fields` | Email · Province or territory · Preferred language (optional) · I'm a lawyer or paralegal *(checkbox)* |
| `waitlist.consent` | Email me when Case IQ opens in my province or has room in Ontario. I can unsubscribe anytime. Case IQ Inc., 5255 Yonge Street, Unit 1104, Toronto, ON M2N 6P4, caseiq@agentmail.to *(required, unticked by default: CASL express consent)* |
| `waitlist.disclaimer` | *(none: the intake directly above already shows `disclaimer.full`)* |
| `waitlist.submit` | Join the list |
| `waitlist.success` | You're on the list. We'll be in touch. |

### S12b · Conversation sheet

Every call to action ("Get my case in order" in the hero, nav, menu, status strip, sticky bar, hands-on help card, and the footer's Contact and early-access links) opens one sheet over the page. It holds the intake and the early-access list above, unchanged. The closing section (S12) keeps its words on the left and shows question 1 as a launcher card on the right. Header: Close, the Case IQ avatar and name (`brand.name`), the status line below, and Quick exit. No other visible copy is added: the launcher reuses `intake.progress`, `intake.steps[0]`, `world.replyPlaceholder`, `cta.primary`, `success.title`, `success.tip`, `waitlist.toggle` and `ui.close`.

| ID | Copy |
|---|---|
| `convo.dialogName` | Your request to Case IQ *(screen-reader name of the dialog; not shown. The header stays "Case IQ" and `convo.status` is its description)* |
| `convo.status` | A person replies within one business day ⚠K2 *(the line under "Case IQ" in the sheet header)* |
| `convo.chipHint` | Opens the questions with this answer chosen *(screen-reader description of each launcher chip; not shown)* |
| `convo.resume` | You're partway through the questions. Pick up where you left off. *(received bubble in the launcher once the visitor has moved past question 1)* |
| `convo.resumeCta` | Continue *(the launcher's send pill while the visitor is partway)* |
| `convo.reopen` | See your answers *(outline button in the launcher after the request is sent; opens the sheet)* |

---

## S13 · Footer

| ID | Copy |
|---|---|
| `footer.disclaimer` | *(uses `disclaimer.full`)* |
| `footer.selfCite` | Every statistic and court quote on this page links to its source. Spot one that doesn't? Tell us. |
| `footer.examples` | All examples on this page are made up. Any resemblance to real people or businesses is a coincidence. |
| `footer.pros` | Lawyers and paralegals: clients who arrive organized. Join the professional list. |
| `footer.links` | Privacy · Terms · Accessibility · Contact · Free legal help · Quick exit |
| `footer.copyright` | © 2026 Case IQ Inc. |

---

## Meta

| ID | Copy |
|---|---|
| `meta.title` | Case IQ: organize your court papers, with every fact traced ⚠C2 |
| `meta.description` | For people in Ontario handling a court or tribunal case: one timeline from your emails, texts, photos and notes, with the page behind every fact. Free first conversation, then a flat price. ⚠C2 ⚠K1 ⚠K3 |
| `og.*` | Same as the title and description. |

---

## UI strings (`en.ui`): accessibility labels and errors added during the build

| ID | Copy |
|---|---|
| `ui.skip` | Skip to main content |
| `ui.menu` | Menu |
| `ui.close` | Close |
| `ui.nav` | Main |
| `ui.external` | opens in a new tab |
| `ui.chooseOne` | Choose one |
| `ui.cite.chip` | Source |
| `ui.cite.publisher` | Published by |
| `ui.cite.date` | Date |
| `ui.cite.where` | Where in it |
| `ui.cite.quote` | Words from the source |
| `ui.cite.alsoSays` | It also says |
| `ui.cite.open` | Read the source |
| `ui.cite.newTab` | opens in a new tab |
| `ui.ask.suggested` | Questions you can ask |
| `ui.ask.you` | You asked |
| `ui.ask.us` | Our answer |
| `ui.preview.prev` | Previous page |
| `ui.preview.next` | Next page |
| `ui.preview.page` / `ui.preview.of` | Page / of |
| `ui.err.summary` | Please check the following. |
| `ui.err.choose` | Please choose one. |
| `ui.err.province` | Please choose your province or territory. |
| `ui.err.consentEmails` | Please tick the box so we can email you. |

Draft text for `/privacy`, `/terms` and `/accessibility` lives in `apps/site/src/content/legal.ts`. It must be reviewed by counsel as one document before launch.

## Copy-lint allowlist (string IDs)

None. v3 removed the only exception.
