# Case IQ — Landing Page Plan

**Status:** Draft for your approval · 2026-10-31
**Built on:** `docs/product/` (vision, personas, UX copy rules, design system, legal risks, business model, competitive analysis) and two fresh research passes (brand screen and a fact-check, both 2026-10-31).

---

## 0. The short version

- **Goal.** Turn visitors into **founding clients**: people in Ontario get a free first conversation and hands-on help while the app is built. Everyone else joins the **early-access list**.
- **Promise.** *"You know what happened. Let's find the page that shows it."*
- **The thing only Case IQ can show.** Every fact links to the exact page it came from, and when your papers don't show something, we say so. The page *demonstrates* this live, and it cites its own facts the same way.
- **Design.** A distinctive visual world picked with you on a visual decision page (impeccable skill). No gavels, scales, or navy-and-gold.
- **Build.** Next.js + Tailwind on Vercel, the same stack your spec chose for the app (ADR-002, ADR-014). All coding is done by **Sonnet 5.5 at high effort**.
- **Quality.** Two critique loops, on the *words* before any code and on the *rendered page* after. They run against a 10-point rubric with a hard exit bar.

---

## 1. Decisions

| Decision | Your answer | What it means for the page |
|---|---|---|
| Day-one offer | Founding clients + waitlist | The main button is **"Get my case in order"** (intake, then a free conversation). The second path is **"Join the early-access list"** (other provinces, not ready yet, lawyers). |
| "Submit to court" and "forged signatures" | Reframe safely | We offer **"Ready for your hearing"**: organize, label, number and index; you or your lawyer file. We offer **"Signatures, side by side"**: visible differences noted for a forensic document examiner. The word "forged" never appears. |
| Name | Keep Case IQ | Risk accepted. In practice, caseiq.com belongs to the other company and caseiq.ca is parked (probably theirs too), so we need another domain. Get a trademark agent's view before any paid ads. |

**Defaults I'm assuming.** Tell me if any is wrong.
- Ontario first and English first. French and other provinces go through the waitlist.
- Case types: employment, housing, small claims, civil and family. No criminal cases yet (your spec's default, Q-T03).
- No prices on the page yet, only a structure: "Free first conversation. A flat price agreed before we start, never hourly." ⚠ This needs your confirmation.

---

## 2. Strategy

### 2.1 Who lands here

| Visitor | Their moment | What they must see in the first 10 seconds |
|---|---|---|
| **Representing themselves** (main) | A hearing is coming. 1,000+ pages, mostly on a phone. Reading late at night. Scared that AI will be wrong in front of a judge. | That this organizes *their* mess, shows proof for every fact, and won't make things up. |
| **Paying a lawyer** | Billed by the hour, re-explaining the story every call | A brief that gets their lawyer up to speed fast, so less of their money goes to sorting. |
| **Helping someone** (family, support worker) | Helping, with the person's consent | That they can organize papers with permission. |
| **Lawyers & paralegals** (secondary) | Clients arrive with an unsorted pile | A small path in the footer to the professional waitlist: "Clients who arrive organized." |

### 2.2 The insight (yours)

There are two ways a person's story gets lost:
1. **Alone.** They know what happened but can't find the page that shows it. The hearing gives them minutes.
2. **With a lawyer.** The lawyer starts from zero and learns the story by the hour. Money runs out before the strategy starts.

Both start with the pile. The verified research backs this up:
- 226 of 308 NSRLP respondents had worked with a lawyer at some stage.
- Nearly 9 in 10 said the other side had a lawyer.

### 2.3 Positioning

> For people in Ontario handling a court or tribunal case with little or no legal help, **Case IQ** turns a pile of papers, emails, texts and notes into one organized case: a timeline where every fact shows where it came from, and a brief a lawyer can read in one meeting. **Unlike a general AI chatbot**, it never states something your papers don't support. **Unlike law-firm software**, it's made, and priced, for one person.

### 2.4 Five messaging pillars

1. **Order.** Everything in one timeline, in date order.
2. **Proof.** Every fact shows the page it came from. Your business model doc names "we'll show you where it came from" as *the* headline benefit.
3. **Honesty.** If your papers don't show it, we say so. We never guess.
4. **Readiness.** Walk in prepared: to your lawyer, a legal clinic, or your hearing.
5. **Privacy & safety.** Your papers stay private, and there's a Quick exit for anyone who needs it.

### 2.5 Voice (from your spec, `14-ux-specification.md` §5–6)

Calm, plain, respectful. We say "your papers", "your case", "the people involved". We aim for a grade 6–8 reading level, with no hype, no exclamation marks and no fear tactics.

**Banned on the page** (a copy lint will enforce this in the build):
- Credibility and adjudication: lied/lying, dishonest, guilty/innocent, proved, fraud, forged, suspicious.
- Advice and certainty: you should/must, we recommend, your best argument, obviously/clearly, will win, chances of success.
- Condescension: just, simply, easy.
- Overclaiming: AI lawyer, replaces a lawyer, and the words "lawyer", "legal advice" or "representation" used to describe *our own* service.
- Filler: unlock, empower, seamless, revolutionize, game-changer, effortless, peace of mind, "navigate the legal system".

---

## 3. Page structure and draft copy

Sections are in order. ⚠ marks a claim that must be true before launch. 📎 marks a fact that carries a "where this comes from" chip linking to its source.

### S0 · Safety bar
> Now welcoming founding clients in Ontario · **[Quick exit ✕]**

Quick exit takes the visitor to a neutral site instantly (also triggered by pressing Esc twice). Your spec requires it for people sharing a device or not safe at home (`02` A.4).

### S1 · Navigation
> Case IQ · How it works · What you get · Privacy · Questions · **[Get my case in order]**

### S2 · Hero: promise, proof, and the action itself

**Eyebrow:** Case organizing for people representing themselves in Ontario

**Headline (recommended):** **You know what happened. Let's find the page that shows it.**
- Alt A: *Get your case in order, with every fact traced to your papers.* This is benefit-first and the safest option.
- Alt B: *Your story, backed by your papers. Page by page.* This one leads with the story and echoes your insight.

**Sub:** Case IQ turns your emails, texts, photos, handwritten notes and court papers into one clear timeline. Every fact links to the exact page it came from. If your papers don't show something, we tell you.

**The action, in its working form: "Show me with a case like mine"**
- Chips: Job or workplace · Housing · Money owed · Family & separation · Being sued · Something else.
- Picking one swaps the live example and pre-fills step 1 of the intake.

**Live proof card** (labeled *Example, not a real case*):
- *You told us:* "My manager said my job was safe." Shown in the product's "your words" style.
- *Your papers show:* "Your role is not affected by the restructuring." Email from J. Patel · 12 Jan 2025 · page 1 · **[See the page]**
- *Not in your papers yet:* A written reason for ending your job. Have one? Add it.

**Button:** **Get my case in order**. Text link: *See how it works*.
**Under the button:** Free first conversation · Private · No documents needed to start

**Fine print:** Case IQ isn't a law firm and doesn't give legal advice. We organize your papers and help you prepare, for your lawyer, a legal clinic or your hearing.

*Why this headline:* it is your persona's own words ("I know the truth but I can't find the page that proves it", `02` A.3), reworded to avoid "proves".

**Example cases behind the chips.** All are synthetic and labeled. They avoid children, accusations and legal conclusions.

| Chip | You told us | Your papers show | Not in your papers yet |
|---|---|---|---|
| Job | "My manager said my job was safe." | Email, 12 Jan 2025, p. 1: "Your role is not affected by the restructuring." | A written reason for ending your job |
| Housing | "I told my landlord about the mould in March." | Text message, 3 Mar 2025, 9:14 p.m.: "The mould in the bathroom is back. Can you send someone this week?" | Any reply from your landlord before May |
| Money owed | "I paid the contractor a $4,000 deposit." | E-transfer receipt, 18 Jun 2025: "$4,000.00 sent to R. Kaur Renovations" | A signed contract or written quote |
| Family | "I paid half the mortgage every month after we separated." | Bank statements, Apr–Aug 2025: monthly transfers to the joint account | September's statement |

*Being sued* and *Something else* show the Job example.

### S3 · The problem: your insight
**Two ways your story gets lost in the paperwork**

- **If you're representing yourself.** You know what happened. But the email that shows it is one of two thousand, the text is buried in a year of messages, and at the hearing you'll have minutes, not hours, to find it.
- **If you're paying a lawyer.** Your lawyer starts from zero, learning your story from your papers, by the hour. The first hours go to sorting, not to your case.

**Bridge:** Either way, it starts with the pile. Case IQ turns it into a case you can explain.

**Fact strip** (each fact has a 📎 source chip):
- 📎 *Nearly 9 in 10* people representing themselves said the other side had a lawyer (286 of 320 who answered). Source: NSRLP Intake Report 2023–25.
- 📎 To get legal aid for a family case in Ontario, a single person must earn under **$18,795 a year**. Source: Legal Aid Ontario, as listed 31 Oct 2026.
- 📎 The median legal fee for a seven-day civil trial in Canada: **$70,000**. Source: Canadian Lawyer 2024 fee survey, 347 firms.
- 📎 Most had a lawyer at some point: **226 of 308** had worked with one at some stage of their case. Source: NSRLP 2023–25.

*Note:* the tone is empathy, not fear. There is no "you'll lose your case".

### S4 · Signature moment #1: "Bring the pile. Leave with a timeline."
**Body:** Screenshots, email exports, scanned letters, photos of handwritten notes, bank statements. We read every page, remove duplicates, put everything in date order and link each event to where it's written.

**Interaction:**
- As you scroll, scattered example papers slide into a dated timeline, and each event gets its source chip.
- One honest gap appears: *No notes from the 20 January meeting.*
- With reduced motion, the visitor sees the finished timeline.

**Caption:** Example case. Names and details are made up.

### S5 · How it works (founding clients)
1. **Tell us what's going on.** A free conversation, about 20 minutes ⚠. No documents needed yet.
2. **Send everything.** Through a secure link ⚠: emails, texts, photos, PDFs, handwritten notes. Messy is fine.
3. **We put it in order.** Every page read and dated, and every fact linked to its page. Anything we couldn't read, or couldn't find, is marked.
4. **Check it, then take it with you.** Correct anything we got wrong, then bring your timeline and brief to your lawyer, a legal clinic or your hearing.

### S6 · What you walk away with
- **A timeline of your case.** Everything that happened, in date order, with the people and amounts involved.
- **The page behind every fact.** Click any line to see the exact page and words it came from.
- **What's missing.** A list of what your papers don't show yet, so you can look for it before your hearing.
- **Your account, in your words.** Plain questions help you tell your story in order. Your words stay marked as yours, separate from what your papers say.
- **Where papers disagree, side by side.** Two papers that say different things are shown together, with dates and pages. We don't decide who's right.
- **Handwriting, read.** Notes, letters and journals become searchable text. Words we couldn't make out are marked for you to check against the original.
- **Signatures, side by side.** A signature you're unsure about is shown enlarged next to signatures from your other papers, with visible differences noted. We don't say whether a signature is genuine. A forensic document examiner can.
- **A brief for your lawyer.** The timeline, key papers, gaps and your questions on a few pages, with a page reference for every fact. It's for your lawyer or a legal clinic, not for filing. *This is shown as a paper object you can flip through.*
- **Ready for your hearing.** Your papers numbered, labeled and indexed, so you can find any page in seconds. You decide what to use, and you or your lawyer file it.

### S7 · Signature moment #2: "Ask your papers"
**Headline:** **It shows its work, or tells you it can't.**

**Body:** General AI chatbots can write a confident summary of your case. They can also invent a date, a quote or a court decision that doesn't exist, and in court you're the one responsible for what you file. Case IQ only states what your papers support, and shows you where.

**Demo:** three preset questions, each producing a different answer type, using the synthetic Job case.

| Question | Answer type | Case IQ's answer |
|---|---|---|
| "When was I told my job was safe?" | **Cited answer** | Two sources. The email quote with its page, plus a handwritten note marked *read by computer, check the original*. |
| "Did they give a reason in writing?" | **Honest gap** | "Your papers don't answer this yet. The letter of 28 January says your position was 'eliminated' (page 1), but no paper explains why." |
| "Will I win?" | **Declines legal advice** | "I can't tell you how your case will go. That's a question for a lawyer. I can show you what your papers say, and add this to your questions for your lawyer." |

**Facts with 📎 chips:**
- 📎 103 of 237 people representing themselves who answered the NSRLP survey (43%) had already used AI to help prepare their case. Source: NSRLP 2023–25.
- 📎 Ontario's Superior Court now has practice directions on AI in civil, family and criminal cases. Everyone who prepares court materials, lawyers and litigants alike, is responsible for their accuracy, particularly when AI is used, even if they didn't use the AI tool themselves. *"The court will not tolerate inadvertence in this regard."*
- 📎 Depending on the circumstances, consequences can include cost orders, a public reprimand, or the matter being dismissed.

### S8 · What we do, and what we don't
| We do | We don't |
|---|---|
| Organize your papers · build your timeline · show where every fact comes from · point out what's missing · read handwriting · put signatures side by side · prepare a brief for your lawyer · get your papers ready for your hearing | Give legal advice · tell you what to do or how your case will go · decide who's telling the truth · write or file court documents · speak for you at a hearing · stand in for a lawyer |

**Need legal advice? These can help.** Legal Aid Ontario · Law Society Referral Service · Pro Bono Ontario · Steps to Justice · community legal clinics · Family Law Information Centres. ⚠ We verify every link before launch.

*Why this section exists:* publishing our limits is a trust feature, the same move JusticeBot and Singapore's court tool use (`21` §8). It is also our unauthorized-practice shield.

### S9 · Privacy & safety: "Your papers are private. Your case is yours."
- **Private.** Only you and the Case IQ team member working on your case can see your papers. ⚠
- **Not used to train AI.** We don't train AI models on your case, and neither do the AI services we use. ⚠ This must be true of the providers you pick (`13` D-10).
- **Delete when you're ready.** Download or delete your case anytime. If you're in a legal proceeding, you may need to keep your documents, so ask your lawyer before deleting (`13` D-6).
- **Quick exit.** If you share a device or need to leave fast, Quick exit takes you to another site.
- *Stored in Canada.* We only say this if it's true. ⚠

### S10 · Who it's for
**Chips:** Job loss & workplace · Landlord & tenant · Small claims · Civil lawsuits · Family & separation · Human rights · Insurance & benefits

**Cards:**
- *Representing yourself:* use your timeline to prepare for your hearing, mediation or a free legal clinic.
- *Paying a lawyer:* hand over a sourced brief on day one, so less of their time goes to sorting.
- *Helping someone:* organize papers with the person's consent.

**Small print:** We're not taking criminal cases yet.

### S11 · Founding clients
**Headline:** **Become a founding client**

**Body:** We're opening Case IQ to a small group of people in Ontario first ⚠. You get hands-on help organizing your case from our team, using the tools we're building. You help shape what we build next.

**Bullets:** Free first conversation · Flat price, agreed before we start, never hourly ⚠ · Your papers stay yours · Stop anytime

**Button:** **Get my case in order**
**Second path:** Not in Ontario, or not ready yet? **Join the early-access list**

### S12 · Questions (FAQ)
1. **Is Case IQ a law firm? Do you give legal advice?** No. We organize your papers and help you prepare information for your lawyer, a legal clinic or your hearing. For legal advice, see the free and low-cost options above.
2. **Can you file my court documents or come to court with me?** No. You or your lawyer write and file court documents and speak at a hearing. We make sure you can find what you need quickly.
3. **How is this different from asking ChatGPT?** A general chatbot can sound sure about things your papers don't say. Case IQ only states what your papers support, shows you the page for each fact, and tells you when your papers don't answer a question.
4. **Can you check whether a signature is genuine?** We show a signature you're unsure about next to signatures from your other papers, enlarged and side by side, and note visible differences. We don't say whether it's genuine. A forensic document examiner can give an opinion, and our side-by-side pages are a useful starting point.
5. **Can you read handwritten notes?** Yes. Handwriting is harder for computers than print, so we mark words we couldn't make out, and you check them against the original.
6. **Will the court accept papers organized with Case IQ?** We never change your original documents, and we keep a digital fingerprint of each one so you can show it hasn't changed. That isn't a guarantee: courts decide what they accept, and each court has its own rules (`13` D-4).
7. **Is what I share private? Is it protected by privilege?** Your papers are private ⚠. Because we're not lawyers, what you share with us isn't protected by solicitor–client privilege. If that matters in your case, ask a lawyer before you share.
8. **Do you use my papers to train AI?** No. Neither do the AI services we use ⚠.
9. **What kinds of cases do you help with?** Most cases where papers pile up: workplace, housing, small claims, civil, family, human rights, insurance and benefits. Not criminal cases yet.
10. **I already have a lawyer. Is this still useful?** It can be. A clear, sourced brief helps your lawyer get up to speed faster, so less of their time goes to sorting.
11. **What does it cost?** Your first conversation is free. If we work together, we agree on a flat price before we start, never an hourly rate ⚠.
12. **I'm not in Ontario. Can I still use it?** We're starting in Ontario. Join the early-access list, tell us your province, and we'll let you know.
13. **Can I share texts and emails that involve other people?** Only share papers you're entitled to have and use, including ones about other people. If you're not sure, ask a lawyer (`23` Q-T04 wording).
14. **Do you work in French?** Not yet. French is planned. Tell us your language when you join the list ⚠.

### S13 · Final call to action
**Headline:** **You don't have to sort it alone.**

**Body:** Tell us a little about your case. We'll reply within one business day ⚠.

The full intake follows (§5). Below it: *Prefer email? hello@[domain]* ⚠

### S14 · Footer
- "Case IQ is not a law firm and does not provide legal advice. We help you organise your documents and prepare information for your lawyer." This is your spec's D-1, verbatim.
- **"Every fact on this page links to its source. Spot one that doesn't? Tell us."**
- Links: Privacy · Terms · Accessibility · Contact · For lawyers & paralegals (professional waitlist) · Free legal help in Ontario · Quick exit

---

## 4. What will make it memorable

1. **"Show me with a case like mine."** The hero's first interaction picks your case type. The live proof changes to match it, and your intake starts.
2. **Pile → timeline.** The product's core transformation, played out on the page.
3. **"Ask your papers."** Three questions, three honest answer types: cited, gap, and declining legal advice. It shows the product's character better than any claim could.
4. **The page cites itself.** Every fact on the page carries the same "where this comes from" chip the product uses. We hold ourselves to our own standard, in public.
5. **Quick exit.** It shows care no competitor's page shows.

---

## 5. Conversion design

**Founding-client intake** (one question per screen, phone-first, about 90 seconds):
1. What's your case about? (chips, pre-filled from the hero)
2. Where are you? *Ontario* or *Elsewhere in Canada*. Elsewhere routes to the waitlist, with a province picker and an honest message.
3. Is there a date coming up? *Next 2 weeks* / *2 weeks to 3 months* / *Later or no date* / *Not sure*. This is urgency triage.
4. Do you have a lawyer or paralegal? *No* / *Yes* / *I had one before* / *I'm looking*.
5. How much paper is there? *A few documents* / *A folder or two* / *A box or more* / *Mostly on my phone*.
6. How can we reach you?
   - First name, email, phone (optional), and the best way to reach you.
   - **"Is it safe to leave a message?"** We contact you only the way you choose.
   - Privacy consent, and a separate, unticked box for updates (Canada's anti-spam law, CASL).
7. **Done.** "Thanks, [name]. We'll reply within one business day ⚠. Please don't send any documents until we've talked."

**Early-access list.** Email, province, case type, and "I'm a lawyer or paralegal" as an option.

**Measuring it** with cookieless analytics and no ad pixels. Events: chip selected, intake started, each step, submitted, waitlist joined, Quick exit used (a count only). This also answers your business model's open question: who actually shows up, and for which case types (`20` §9).

---

## 6. Visual direction (how we'll choose it)

Done with the **impeccable** skill's process:
- I derive seven visual worlds from the audience's own world, across at least three material families. Examples:
  - **The Expanding File** — the pressboard accordion file people buy before court: tabs, elastic, loose papers finding their pocket.
  - **Wayfinding** — courthouse and transit signage: big numerals, arrows, "you are here".
  - **The Line** — the timeline drawn as a transit diagram, with events as stops.
  - **Exhibit Book** — tabs, exhibit stamps, corner page numbers.
  - **Phone Roll** — the camera roll and chat threads where most evidence lives.
  - **Kitchen Table** — a top-down desk scene that tidies itself.
  - **Public Notice** — bold civic notice typography.
- impeccable's concept-seed deals three of these, plus outside "challenger" worlds, at random. This is deliberate: it stops us landing on the category's obvious look.
- You pick on a **visual decision page** in the browser. The winner becomes a written *direction contract* that every builder and critic is held to.

**Fixed, whatever world wins:**
- The product demos inside the page use your design system's meanings (`15`):
  - your words: violet italic
  - quoted document text: serif with quotation marks
  - page references: mono
- Red and green never describe evidence or people.
- Amber is never used as decoration.
- The page is built for a phone first, at WCAG 2.2 AA.
- It avoids today's AI-generated looks: cream paper + serif + terracotta, dark + neon glow, and broadsheet hairlines + italic serif.

---

## 7. Honesty & compliance guardrails (claim register)

| Claim | Status | Needed before launch |
|---|---|---|
| Not a law firm, no legal advice | ✅ Always true | Exact D-1 wording in the footer and near the button |
| Every fact links to its page | ✅ by service design | Your founding-client process must deliver a page reference for every fact |
| "If your papers don't show it, we say so" | ✅ by design | Same as above |
| Fact strip statistics | ✅ Verified 2026-10-31, with sources | Re-check the court direction wording before launch (the page was updated 19 Oct 2026) |
| Not used to train AI | ⚠ Only if true | Confirm your AI providers' data terms |
| Stored in Canada | ⚠ Don't claim unless true | Decide storage |
| Private / encrypted / who can see files | ⚠ | Depends on how you'll receive files in the pilot |
| Reply within one business day, ~20-minute call | ⚠ Your commitments | Confirm |
| Flat price, never hourly | ⚠ Your commitment | Confirm |
| Testimonials, client counts, "trusted by" | ❌ None exist. Never invented. | Collect real ones later, with permission |
| "Detects forgery", "files for you", "AI lawyer", outcome predictions | ❌ Banned | — |
| Law Society referral as a risk for self-represented people | ❌ Inaccurate | The directions apply that to counsel only |

---

## 8. Build plan

- **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS v4 + Motion, with React Hook Form + Zod for the intake, deployed on Vercel. It lives in `apps/site/`, beside where your spec puts the app (`apps/web/`).
- **Pages:**
  - `/`, the landing page.
  - `/privacy` and `/terms`, as drafts for counsel to review.
- **Form handling:**
  - A server route sends each request to your email and stores a copy. The provider is to be chosen with you.
  - Spam protection uses a hidden honeypot field and a rate limit.
- **Content:** All copy lives in one typed content file, so you can edit text without touching code and French can be added later.
- **Key components:**
  - safety bar with Quick exit
  - hero with the case-type chips and live proof card
  - source chip with its popover
  - pile → timeline scene
  - "Ask your papers" demo
  - brief preview
  - intake and waitlist
  - accessible FAQ
- **Quality bars:**
  - Mobile Lighthouse: ≥ 95 for accessibility, SEO and best practices; ≥ 90 for performance.
  - Speed and stability: LCP under 2 s and CLS under 0.05 on a mid-range phone.
  - Accessibility: axe finds 0 violations; works by keyboard alone; reduced motion respected; works from 320 px width and at 200% zoom.
- **SEO:** the page is indexable and gets FAQ and Organization structured data.
  - **Title:** *Case IQ: organize your court case papers, with every fact traced to its page*.
  - **Description:** *For people representing themselves in Ontario. One timeline from your emails, texts, photos and notes, with the exact page behind every fact. Free first conversation.*

---

## 9. How we get to "best": agents, skills, and the critique loop

**Who does what**
- **Me (Opus):** strategy, copy, orchestration, merging critiques.
- **Sonnet 5.5, high effort:** all coding, per your instruction.
- **Critics:** independent agents with fresh context. They get the page, screenshots and rubric, never my reasoning.

**Skills used**
| Stage | Skills |
|---|---|
| Planning | brainstorming, landing-page, copywriting, impeccable (shape, new-work) |
| Copy | copywriting, copy-editing, marketing-psychology, ux-writing, plus your spec's voice rules |
| Design | impeccable: product record, then direction round, direction contract, quality floor, finish review, and DESIGN.md |
| Build | vercel-react-best-practices, tailwind-design-system, framer-motion, form-design, web-design-guidelines |
| Quality | impeccable critique and audit, design-critique, accessibility-audit, cro, seo-audit, web-perf |

**Phases**
1. **Foundations.**
   - Write `PRODUCT.md` (impeccable's product record) from your docs and answers.
   - Write `docs/marketing/claim-register.md`.
   - Write `docs/marketing/copy-deck.md`.
2. **Copy critique loop (before any code).**
   - Three critics review the copy:
     - a *conversion copy chief*;
     - an *honesty & compliance reviewer*, armed with your spec's banned-words list and the claim register;
     - **"Maria"**, a simulated first-time visitor reading on a phone at 11 p.m. with a hearing in six weeks.
   - I revise and repeat. Words are cheap to fix before they're in code.
3. **Visual direction round** with you (§6).
4. **Build** (Sonnet 5.5, high).
5. **Rendered critique loop.**
   - Screenshots at desktop 1440, tablet 768 and mobile 390, in every state: chip picked, each intake step, errors, success, reduced motion.
   - The critics: impeccable's finish reviewer (design against the contract), the conversion & compliance critic, and Maria on mobile.
   - Mechanical checks: copy lint, axe, Lighthouse, impeccable detect, and every source chip resolving.
   - Sonnet fixes in batches, then we repeat.
6. **Finish.**
   - DESIGN.md is written from the built site.
   - Final QA.
   - A Vercel preview link, deployed only on your OK.

**The rubric** (each criterion scored 1–10 by every critic)
| # | Criterion | What a 10 looks like |
|---|---|---|
| 1 | 5-second clarity | After one screen, a stranger can say what it is, who it's for and what to do next |
| 2 | Empathy without fear | Calm and respectful to someone frightened, with no alarm tactics |
| 3 | Proof, not claims | The mechanism is shown working, every fact is cited, nothing is invented |
| 4 | Difference | It's obvious why this beats a chatbot or a folder of PDFs |
| 5 | Conversion path | One obvious next step, a low-friction intake, objections answered where they arise |
| 6 | Honesty & compliance | Passes the banned-words lint, the claim register and the unauthorized-practice wording rules |
| 7 | Visual craft & distinctiveness | Unmistakably its own world, with precise type, spacing and hierarchy, and no template look |
| 8 | Signature interactions | Purposeful, smooth and understandable, and the reduced-motion version works |
| 9 | Accessibility & plain language | WCAG 2.2 AA, grade ≤ 8 reading level, complete by keyboard and screen reader |
| 10 | Mobile & speed | Designed for a phone first, fast on a mid-range phone |

**Exit bar:**
- Every criterion scores ≥ 8 from every critic.
- The average is ≥ 9.
- There are zero blockers.

If we don't reach that within **3 rounds per loop**, I stop and show you what's left rather than burning more agent time.

**Rough cost:** about 4–8 agent runs for the copy loop and 6–12 for the build and critique loop.

---

## 10. What I need from you

**At kickoff** (impeccable asks these two formally):
1. **Stack:** Next.js + Tailwind on Vercel, matching your app spec. OK?
2. **Mockups:** *code-first* or *image-first comps*? Code-first is faster and leaner, and is my recommendation since Sonnet is the builder. Image-first is bolder but slower, and uses image-generation credits.

**Before launch** (none of these block the build):
3. **Founding-client details:** price, reply time, how many clients you can take, which deliverables from S6 you'll commit to, and how you'll receive files securely.
4. **Privacy facts:** where files are stored, which AI services you'll use and their no-training terms, and how deletion works.
5. **Contact:** the email (and phone, if any) for requests, and where submissions should go.
6. **Domain:** caseiq.com and caseiq.ca aren't available. I can check alternatives, such as a .ca variant.
7. **Founder story (optional):** if you, or someone close to you, has been through a case, a short signed note is the strongest trust signal a new service can have. It's used only if you want it.
8. **Real proof only:** any advisors (a lawyer or paralegal?), partners, or later testimonials, with permission.
9. **Languages:** do you or your team speak languages besides English? Offering first conversations in them could be a real advantage, but only if it's true.
10. **Counsel review** before taking paying clients: unauthorized-practice wording, the privacy notice and the terms. Your spec already lists these as launch-blocking.

---

## 11. Risks

- **The unauthorized-practice line.** A hands-on service sits closer to it than software does. The copy keeps to *organizing*: you decide, you file. Get counsel's opinion before taking payment.
- **Claims that must become true** before launch: privacy, AI training and storage (the ⚠ items).
- **Name:** accepted. The practical costs are the domain and that searches for "Case IQ" show the other company first.
- **Family cases involve children's data**, which raises sensitivity. Your spec puts family second. We include it carefully, with no child details in any example.
- **Capacity:** if demand exceeds what you can handle, the intake routes the overflow to the waitlist honestly.
- **Competition:** the brand screen found *CaseKeep*, an organizer app for self-represented people. Our difference to keep sharp: proof for every fact, honest gaps, and hands-on help.

---

## Sources for the facts above (verified 2026-10-31)
- NSRLP Intake Report 2023–25 (354 respondents): https://representingyourselfcanada.com/srl-intake-report-2023-2025/
- Ontario SCJ AI practice directions:
  - announcement: https://www.ontariocourts.ca/scj/news/new-practice-directions-on-the-responsible-use-of-artificial-intelligence-in-court-proceedings/
  - civil direction, item 12: https://www.ontariocourts.ca/scj/filing-procedures/provincial/consolidated-civil-provincial-practice-direction/
- Legal Aid Ontario eligibility: https://www.legalaid.on.ca/will-legal-aid-pay-for-my-lawyer/
- Canadian Lawyer 2024 legal fee survey: https://www.canadianlawyermag.com/cl-plus/data-reports/the-state-of-the-canadian-legal-fee-landscape-an-in-depth-report/389271
- Not used: any hourly-rate figure (none could be verified), "60% of family litigants" (a misreading), and the "February 2026" date applied to all three directions (inaccurate).
