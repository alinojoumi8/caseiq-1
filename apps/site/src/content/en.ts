// All visible copy for the Case IQ site, keyed by copy-deck v3 IDs.
// Rules:
//  - A trailing "// ⚠ID" marks a conditional claim from the claim register. It ships only once the founder confirms it.
//  - Founder placeholders are {tokens} filled from src/content/site.ts. While a value is unset, the fragment that needs it is left out, so no bracket ever renders.
//  - Keep this file free of imports so scripts/copy-lint.mjs can load it directly.

// Strings the deck reuses by reference are declared once.
const ctaPrimary = 'Get my case in order';
const submitLabel = 'Request my free conversation'; // ⚠K1 (the intake's last button; the intro names it)
const disclaimerShort =
  'Case IQ isn’t a law firm and doesn’t give legal advice. We organize your papers so you can take them to a lawyer, a legal clinic or your hearing.';
const disclaimerFull =
  'Case IQ is not a law firm and does not provide legal advice. We help you organize your documents and prepare information for your lawyer.'; // D-1
const primaryHelper = '6 quick questions · A person replies within one business day'; // ⚠K2

export const en = {
  // ───────────────────────── Global ─────────────────────────
  brand: { name: 'Case IQ' },
  cta: {
    primary: ctaPrimary,
    primaryHelper, // ⚠K2
    waitlist: 'Join the early-access list',
  },
  disclaimer: { short: disclaimerShort, full: disclaimerFull },
  example: { label: 'Example, not a real case' },
  quickExit: {
    label: 'Quick exit',
    aria: 'Leave this site now',
    hint: 'Leaves this site right away. You can also press Esc twice.',
  },

  // Phone Roll world microcopy
  world: {
    pinned: 'Pinned · Case IQ',
    delivered: 'Example only. You haven’t contacted us.',
    roll: 'Photos · notes · papers',
    timeline: 'Timeline',
    gapNode: 'Gap · no page',
    checked: 'Checked by a person on our team', // ⚠C10
    replyPlaceholder: primaryHelper, // ⚠K2 (deck: uses cta.primaryHelper)
  },

  // Shown in place of the page when something on it throws (app/error.tsx). The safety strip and Quick exit stay above it.
  error: {
    title: 'Something on this page didn’t load.', // NOT IN DECK
    retry: 'Try again', // NOT IN DECK
  },

  // Interface strings the deck does not list (controls, landmark names, screen-reader labels, form fallbacks).
  // Every string in this block is NOT IN DECK: add it to the copy deck, or confirm or reword it here.
  ui: {
    skip: 'Skip to main content', // NOT IN DECK
    menu: 'Menu', // NOT IN DECK
    close: 'Close', // NOT IN DECK
    exampleDocument: 'Example document', // in deck prose (viewer label)
    nav: 'Main', // NOT IN DECK (landmark label)
    external: 'opens in a new tab', // NOT IN DECK
    chooseOne: 'Choose one', // NOT IN DECK (empty first option of the province list)
    cite: {
      chip: 'Source', // NOT IN DECK (visible label of the "where this comes from" chip)
      heading: 'Where this comes from', // deck term for the chip
      publisher: 'Published by', // NOT IN DECK
      date: 'Date', // NOT IN DECK
      where: 'Where in it', // NOT IN DECK
      quote: 'Words from the source', // NOT IN DECK
      open: 'Read the source', // NOT IN DECK
      newTab: 'opens in a new tab', // NOT IN DECK
    },
    ask: {
      suggested: 'Questions you can ask', // NOT IN DECK (screen-reader label of the suggested replies)
      you: 'You asked', // NOT IN DECK (screen-reader prefix)
      us: 'Our answer', // NOT IN DECK (screen-reader prefix)
    },
    preview: {
      prev: 'Previous page', // NOT IN DECK (summary preview control)
      next: 'Next page', // NOT IN DECK (summary preview control)
      page: 'Page', // NOT IN DECK (screen-reader page indicator, "Page 2 of 5")
      of: 'of', // NOT IN DECK (screen-reader page indicator, "Page 2 of 5")
    },
    err: {
      summary: 'Please check the following.', // NOT IN DECK (error summary heading)
      choose: 'Please choose one.', // NOT IN DECK
      province: 'Please choose your province or territory.', // NOT IN DECK
      consentEmails: 'Please tick the box so we can email you.', // NOT IN DECK
    },
  },

  // ───────────────────────── S0 · Safety bar ─────────────────────────
  bar: { status: 'Taking our first clients in Ontario, a few at a time' }, // ⚠K4

  // ───────────────────────── S1 · Navigation ─────────────────────────
  nav: {
    how: 'How it works',
    get: 'What you get',
    privacy: 'Privacy',
    faq: 'Questions',
    cta: ctaPrimary,
  },

  // ───────────────────────── S2 · Hero ─────────────────────────
  hero: {
    h1: 'You know what happened. Let’s find the page that shows it.',
    sub: 'For people in Ontario with a court or tribunal case. Case IQ puts your emails, texts, photos, notes and court papers into one timeline, with the page behind every fact. If your papers don’t show something, we tell you.', // ⚠C4 ⚠C2 ⚠C3
    who: 'AI software reads every page. A person on our team checks every fact in your timeline and summary before you get them.', // ⚠C10
    cta: ctaPrimary,
    reassure: [
      'Free first conversation', // ⚠K1
      'Flat price, never hourly', // ⚠K3
      'No documents needed to start',
    ],
    disclaimer: disclaimerShort,
    chipsLabel: 'What kind of case is it? Tap one to see an example.',
    chips: [
      { id: 'job', label: 'Job or workplace' },
      { id: 'housing', label: 'Housing' },
      { id: 'money', label: 'Money owed' },
      { id: 'family', label: 'Family & separation' },
    ],
  },
  proof: {
    yourWords: 'Your words',
    papersShow: 'Your papers show',
    gap: 'Not in your papers yet',
    seePage: 'See the page',
    addIt: 'If you have it, add it to your papers.',
  },

  // ───────────────────────── S2 · Film message and player ─────────────────────────
  film: {
    withSound: 'With sound', // chip on the hero film message: said before the tap, on the tile itself
    madeWithAi: 'Made with AI', // chip on the hero film message: the footage is AI footage
    example: 'The case in it is an example.', // under the hero film message
    play: 'Play the 30-second film, with sound. Made with AI. The player has a text version and an audio description.', // accessible name of the hero film message; holds both chips' words (WCAG 2.5.3)
    readInstead: 'Read it instead', // opens the player's text version
    dialogName: 'The 30-second film', // screen-reader name of the player dialog
    status: 'Film · 0:30', // the line under "Case IQ" in the player header
    note: 'The pictures, the voice and the music are made with AI. The case is an example, not a real case.',
    error: 'The film didn’t load. You can read it instead.', // the film failed to load or play
    described: 'Audio description', // the player's switch to the version with a voice describing the pictures
    replay: 'Watch again',
    readText: 'Read the film as text',
    watch: 'Watch the film',
    watchWithSound: 'Watch the film, with sound', // the link on the text page: without JavaScript it opens the film file, so it says the film has sound
    textTitle: 'What the film says and shows',
    onScreen: 'On screen',
    voice: 'Voice',
    says: [
      'You know what happened.',
      'It’s in here somewhere.',
      'Let’s find the page that shows it.',
      'One timeline.',
      'The page behind every fact.', // ⚠C2
      'Bring the pile. Leave with a timeline.',
      'Case IQ.',
      'A flat price agreed before we start, never hourly.', // ⚠K3
    ],
    scenes: [
      { at: '0:00', says: [0, 1], shows: 'Night. A table covered in papers, seen from above. A bundle lands on the pile, and two hands search through it.' },
      { at: '0:05', says: [2], shows: 'The papers lift off the table and land in one straight column.' },
      { at: '0:10', says: [3, 4], shows: 'A timeline marked “Example, not a real case” lifts out of the column. Three dated rows land, one at a time:' },
      { at: '0:20', says: [5], shows: 'Morning. A hand rests on the neat stack of papers.' },
      { at: '0:24', says: [6, 7], shows: 'The timeline, the Case IQ name and the price line, with the lines “Case IQ isn’t a law firm and doesn’t give legal advice.” and “Pictures, voice and music made with AI.”' },
    ],
  },

  // ───────────────────────── S3 · Problem ─────────────────────────
  problem: {
    h2: 'Your story is in there somewhere',
    alone: {
      title: 'If you’re representing yourself',
      body: 'The email that shows what happened is somewhere in your inbox. The text is buried under a year of messages. At a hearing, there’s little time to search.',
    },
    lawyer: {
      title: 'If you’re working with a lawyer',
      body: 'Your lawyer has to learn your story from your papers. When your papers arrive in order, less of their time goes to sorting.',
    },
    bridge: 'Either way, it starts with the pile. Case IQ helps you turn it into a case you can explain.',
  },

  // ───────────────────────── S4 · Pile to timeline ─────────────────────────
  pile: {
    h2: 'Bring the pile. Leave with a timeline.',
    body: 'Screenshots, saved emails, scanned letters, photos of handwritten notes, bank statements. We read every page, set duplicates aside, put everything in date order and link each event to the page it came from.', // ⚠C12 ⚠C2
    caption: 'Example case. People and details are made up.',
    gap: 'Not in your papers yet: an invitation or notes for the 20 January meeting.',
    computerRead: 'Read by computer. Check it against the original.', // D-7 (timeline item 2 note; same line as the ask.q1 caution)
  },

  // ───────────────────────── S5 · How it works ─────────────────────────
  how: {
    h2: 'How it works',
    steps: [
      {
        title: 'Tell us what’s going on',
        body: 'A free conversation with a person on our team, about 20 minutes. No documents needed yet. If we work together, you’ll agree on a flat price before we start.', // ⚠K1 ⚠K3
      },
      {
        title: 'Send us your papers',
        body: 'Use the link we send you. Emails, texts, photos, PDFs, handwritten notes. Messy is fine. If you have or had a lawyer or paralegal, ask them before you send us anything between you and them, or leave those messages out for now.', // ⚠P1
      },
      {
        title: 'We put them in order',
        body: 'We read and date every page and link each fact to its page. Anything we couldn’t read, or couldn’t find, is marked.', // ⚠C2 ⚠C3
        // Added after the body only while siteConfig.turnaroundDays is set. See HowItWorks.tsx.
        turnaround: 'We aim to have your first timeline ready in about {days} days.', // ⚠K6
      },
      {
        title: 'Check it, then take it with you',
        body: 'Correct anything we got wrong. Then use your timeline and index at your hearing, and take your summary to a lawyer or legal clinic.', // ⚠C8 ⚠C7
      },
    ],
  },
  tonight: {
    title: 'Not ready to talk yet? Start tonight.',
    items: [
      'Write down the dates you remember, in any order.',
      'Put everything in one place only you can open: one folder, or one album.',
      'Screenshot your own texts with the date showing, and keep the originals.',
      'Keep everything for now. If that isn’t safe on a shared device, a legal clinic or support worker may be able to help.',
    ],
  },

  // ───────────────────────── S6 · Founding offer ─────────────────────────
  founding: {
    h2: 'Hands-on help, a few people at a time',
    body: 'We’re taking our first clients in Ontario, a few at a time. A person on our team organizes your papers with you, using AI tools, and checks every fact in your timeline and summary against your pages. We’re not lawyers or paralegals, and we don’t give legal advice.', // ⚠K4 ⚠C10 ⚠C13
    // A fragment that needs a site value is left out while that value is unset (siteConfig). See Founding.tsx.
    points: [
      { text: 'Free first conversation' }, // ⚠K1
      { text: 'Flat price, agreed before we start. Never hourly.' }, // ⚠K3
      { text: 'First timeline in about {days} days', needs: 'turnaroundDays' as const }, // ⚠K6
    ],
    // Optional founder note. null until the founder supplies real content; the component renders nothing for null.
    person: null as null | { name: string; note: string; photo?: string },
    cta: ctaPrimary,
    alt: {
      text: 'Not in Ontario, or not ready yet?',
      link: 'Join the early-access list',
    },
  },

  // ───────────────────────── S7 · What you get ─────────────────────────
  get: {
    h2: 'What you walk away with',
    things: [
      {
        id: 'timeline',
        file: 'Timeline.pdf',
        title: 'A timeline of your case.',
        body: 'Everything your papers show, in date order, with the people and amounts involved. Tap any line to see the page and words it came from.', // ⚠C2
      },
      {
        id: 'summary',
        file: 'Summary for my lawyer.pdf',
        title: 'A summary for your lawyer.',
        body: 'Your timeline, the papers you marked, what’s missing and your questions, on a few pages, with a page reference for every fact. For a lawyer or a legal clinic. Not for filing.', // ⚠C7
      },
      {
        id: 'index',
        file: 'Index of my papers.pdf',
        title: 'An index of your papers.',
        body: 'Your papers numbered and labelled, so you can find any page quickly. You choose what to use.', // ⚠C8
      },
    ],
    formats: 'You get them as a PDF you can print and a link you can open on your phone.', // ⚠C11
    alsoTitle: 'Also included',
    also: [
      {
        title: 'What’s missing.',
        body: 'What your papers don’t show yet, so you can look for it.', // ⚠C3
      },
      {
        title: 'Your words, kept separate.',
        body: 'Plain questions help you tell your story in order. Your words stay marked as yours, separate from what your papers say.', // ⚠C14
      },
      {
        title: 'Where papers disagree.',
        body: 'Two papers that say different things, side by side, with dates and pages. We don’t decide who’s right.', // ⚠C6
      },
      {
        title: 'Handwriting, read.',
        body: 'Notes, letters and journals turned into searchable text. It’s read by computer, so check it against the original.', // ⚠C4 D-7
      },
      {
        title: 'Signatures, side by side.',
        body: 'A signature you’re unsure about, enlarged next to signatures from your other papers. We don’t say whether a signature is genuine. That’s for a qualified document examiner, if you need one.', // ⚠C5
      },
    ],
    preview: {
      label: 'Summary for my lawyer',
      header: 'Prepared by Sam R. with AI assistance for discussion with counsel. Not legal advice. Not for filing.', // D-3
      pages: ['Summary', 'Timeline', 'Papers I marked', 'What’s missing', 'Questions for my lawyer'],
    },
  },

  // ───────────────────────── S8 · Ask your papers ─────────────────────────
  ask: {
    h2: 'Answers you can check against your own papers',
    fact1: {
      text: '103 of 237 people representing themselves who answered (43%) had used AI to help prepare their case.',
      cite: 'F2' as const,
    },
    fact2: {
      text: 'Ontario’s Superior Court of Justice, in its AI practice direction for civil cases: everyone who prepares court papers, lawyers and the people in the case, is responsible for their accuracy, particularly when AI is used.',
      cite: 'F9' as const,
    },
    body: 'A chatbot gives you an answer. Case IQ gives you the page it came from, so you can check it yourself. If your papers don’t answer a question, we say so. Case IQ uses AI too, so every fact shows its page. Check it before you rely on it.', // ⚠C2 ⚠C3
    prompt: 'How we answer questions about your papers (example case). In the service, the person helping you answers, with the page.', // ⚠C15
    sender: 'The person helping you · example', // ask.sender: the sans sender line above each answer bubble
    // Q3: the redirect is part of the sentence, so there are no chips.
    refusal:
      'We can’t tell you what your legal position is, how your case will go, or what to do. That’s a question for a lawyer or a legal clinic. What we can do is show you what your papers say, or add this to your questions for a lawyer.',
  },

  // ───────────────────────── S9 · Limits ─────────────────────────
  limits: {
    h2: 'What we don’t do',
    dont: [
      'Give legal advice',
      'Tell you what to do, or how your case will go',
      'Decide who’s telling the truth',
      'Write or file court documents',
      'Speak for you at a hearing',
      'Stand in for a lawyer',
    ],
    do: 'What we do: organize your papers, so you can find, check and explain what’s in them.',
    help: {
      title: 'For legal advice, try these free and low-cost services. We’re not connected with them.',
      // Claim register §D. URLs checked 2026-10-31 (see the build report). Descriptions are the register's; re-check before launch.
      // A null url renders the card without a link.
      items: [
        { name: 'Legal Aid Ontario', blurb: 'Free legal help, if you qualify.', url: 'https://www.legalaid.on.ca/' },
        { name: 'Law Society Referral Service', blurb: 'Find a lawyer or paralegal.', url: 'https://lso.ca/public-resources/finding-a-lawyer-or-paralegal/law-society-referral-service' },
        { name: 'Pro Bono Ontario', blurb: 'Free legal help for people who can’t afford a lawyer.', url: 'https://www.probonoontario.org/' },
        { name: 'Steps to Justice', blurb: 'Plain-language answers to legal questions in Ontario.', url: 'https://stepstojustice.ca/' },
        { name: 'Community legal clinics', blurb: 'Free help with housing, income support, work and more, if you qualify.', url: 'https://www.legalaid.on.ca/legal-clinics/' },
        { name: 'Family Law Information Centres', blurb: 'Free family law information at Ontario courthouses.', url: 'https://www.ontario.ca/page/family-law-information-centres' as string | null },
      ],
    },
  },

  // ───────────────────────── S10 · Privacy and safety ─────────────────────────
  privacy: {
    h2: 'Who sees your papers, and what happens to them',
    // The visitor's own voice for the heading: a sent bubble that opens the privacy thread. NOT IN DECK.
    ask: 'Who sees my papers, and what happens to them?',
    items: [
      {
        title: 'Who can see them',
        body: 'You, people you invite, and the person on our team helping you. The AI services we use read them too, to organize them. Our privacy notice names those services.', // ⚠P1
      },
      {
        title: 'Not used to train AI',
        body: 'We don’t train AI models on your case, and neither do the AI services we use.', // ⚠P2
      },
      {
        title: 'Not shared',
        body: 'We don’t share your papers with anyone else, except services that store and process them for us, or when a court or the law requires it.', // ⚠P7
      },
      {
        title: 'Yours to keep or delete',
        body: 'Download your case or delete it anytime. If you’re in a legal proceeding, you may need to keep your documents. Ask a lawyer or legal clinic before deleting.', // ⚠P4
      },
      {
        title: 'Contact on your terms',
        body: 'Tell us how to reach you and whether it’s safe to leave a message. We only use the way you choose.', // ⚠P8
      },
      {
        title: 'Quick exit',
        body: 'Sharing a device, or need to leave fast? Quick exit, at the top of every page, takes you to another site.',
      },
    ],
    note: 'One thing to know: we’re not lawyers, so solicitor–client privilege doesn’t cover what you share with us. That privilege protects what you and your own lawyer say or write to each other. A court or tribunal could order us to hand over what you share, including what you tell us. If you have or had a lawyer or paralegal, ask them before sending us anything between you and them.', // ⚠P5 (counsel review)
  },

  // ───────────────────────── S11 · Questions ─────────────────────────
  faq: {
    h2: 'Questions', // derived from the S11 title and nav.faq; not a separate deck ID
    items: [
      {
        id: 'cost',
        q: 'What does it cost?',
        a: 'Your first conversation is free. If we work together, we agree on a flat price before we start, never an hourly rate. The price depends on what you need and how complex your case is.', // ⚠K1 ⚠K3 ⚠K7
      },
      {
        id: 'person',
        q: 'Is Case IQ software or a person?',
        a: 'Both. AI software reads every page and puts it in order. A person on our team checks every fact in your timeline and summary against your pages before you get them, and you talk to a person, not a bot.', // ⚠C10
      },
      {
        id: 'lawfirm',
        q: 'Is Case IQ a law firm? Do you give legal advice?',
        a: 'No. We organize your papers so you can take them to a lawyer, a legal clinic or your hearing. For legal advice, try the free and low-cost services listed on this page.',
      },
      {
        id: 'time',
        q: 'How long does it take?',
        a: 'We aim to have your first timeline ready in about {days} days after we have your papers. If your hearing is close, tell us in the form. If we can’t help in time, we’ll say so right away and point you to free help.', // ⚠K6
        // faq.4.noDays: the whole answer while siteConfig.turnaroundDays is unset.
        aNoDays: 'We’ll tell you how long it will take in your free conversation, before you decide.', // ⚠K6b
      },
      {
        id: 'hearing',
        q: 'What do I get, and can I use it at my hearing?',
        a: 'A timeline, a summary for your lawyer, and an index of your papers, as a PDF you can print and a link you can open on your phone. Your timeline and index are for you, to find pages quickly, including at your hearing. The summary is for a lawyer or legal clinic, not for filing. Each court has its own rules about what it accepts.', // ⚠C11
      },
      {
        id: 'chatbot',
        q: 'How is this different from asking a general AI chatbot?',
        a: 'A chatbot gives you an answer. Case IQ gives you the page it came from, so you can check it, and tells you when your papers don’t answer a question. A person on our team checks every fact in your timeline and summary.', // ⚠C2 ⚠C3 ⚠C10
      },
      {
        id: 'seen',
        q: 'Who can see my papers? Could the other side get them?',
        a: 'You, people you invite, and the person on our team helping you. The AI services we use read them too, and our privacy notice names them. We don’t give your papers to the other side or anyone else, except services that store and process them for us, or when a court or the law requires it. For example, a court or tribunal could order us to hand them over, because solicitor–client privilege doesn’t cover us. That privilege protects what you and your own lawyer say or write to each other. If that worries you, ask a lawyer or legal clinic before you share.', // ⚠P1 ⚠P7 ⚠P5 (counsel review)
      },
      {
        id: 'training',
        q: 'Do you use my papers to train AI?',
        a: 'No. We don’t train AI models on your case, and neither do the AI services we use.', // ⚠P2
      },
      {
        id: 'handwriting',
        q: 'Can you read handwriting, or check a signature?',
        a: 'We turn handwritten notes into searchable text and mark any word we couldn’t make out, so you can check it against the original. For a signature you’re unsure about, we show it enlarged next to signatures from your other papers. We don’t say whether a signature is genuine. That’s for a qualified document examiner, if you need one.', // ⚠C4 ⚠C5
      },
      {
        id: 'accept',
        q: 'Will the court accept papers organized with Case IQ?',
        a: 'We can’t promise that. Courts decide what they accept, and each has its own rules. We never change your original documents. We also keep a unique code for each file that would change if the file did, so you can show it hasn’t changed since you gave it to us.', // ⚠C9
      },
      {
        id: 'kinds',
        q: 'What kinds of cases do you help with?',
        a: 'Cases where papers pile up: work, housing, money owed and small claims, civil lawsuits, family and separation, human rights, insurance and benefits. We’re not taking criminal cases yet.',
      },
      {
        id: 'elsewhere',
        q: 'I’m not in Ontario, or I’d like French. Can I still use it?',
        a: 'We’re starting in Ontario, in English. Join the early-access list, tell us your province and language, and we’ll let you know.',
      },
      {
        id: 'others',
        q: 'Can I share texts and emails that involve other people?',
        a: 'Only share papers you have a right to have and use, including ones about other people. If you’re not sure about something, ask a lawyer or legal clinic before you share it.',
      },
    ],
  },

  // ───────────────────────── S12 · Final call to action and intake ─────────────────────────
  final: {
    h2: 'You don’t have to sort it alone.',
    body: 'Tell us a little about your case. It takes about two minutes. A person replies within one business day.', // ⚠K2
    email: 'Prefer email? Write to {email}', // ⚠ shown only while siteConfig.contactEmail is set
  },
  // The intake opens as a conversation sheet over the page; the closing section shows question 1 as a launcher.
  convo: {
    status: 'A person replies within one business day', // ⚠K2
    dialogName: 'Your request to Case IQ', // screen-reader name of the dialog; the visible header stays "Case IQ"
    chipHint: 'Opens the questions with this answer chosen',
    resume: 'You’re partway through the questions. Pick up where you left off.',
    resumeCta: 'Continue',
    reopen: 'See your answers',
  },
  intake: {
    intro: `These are set questions, not a live chat. Nothing is sent until you press “${submitLabel}” at the end.`, // ⚠K1
    progress: 'Step {n} of 6',
    back: 'Back',
    next: 'Next',
    steps: [
      {
        id: 'caseType',
        question: 'What’s your case about?',
        helper: 'Pick the closest one. You can explain when we talk.',
        options: [
          { value: 'job', label: 'Job or workplace' },
          { value: 'housing', label: 'Housing (landlord and tenant)' },
          { value: 'money', label: 'Money owed or small claims' },
          { value: 'family', label: 'Family & separation' },
          { value: 'sued', label: 'Being sued' },
          { value: 'other', label: 'Something else' },
        ],
      },
      {
        id: 'location',
        question: 'Where is your case?',
        options: [
          { value: 'ontario', label: 'Ontario' },
          { value: 'elsewhere', label: 'Somewhere else in Canada' },
        ],
        elsewhere: {
          note: 'We’re starting in Ontario. Join the early-access list and we’ll tell you when we can help in your province.',
          action: 'Join the early-access list',
        },
      },
      {
        id: 'dateWindow',
        question: 'Is there a date coming up?',
        helper: 'A hearing, a deadline, a meeting with a lawyer. Anything with a date.',
        options: [
          { value: 'within2w', label: 'In the next 2 weeks' },
          { value: 'within3m', label: 'In 2 weeks to 3 months' },
          { value: 'later', label: 'Later, or no date yet' },
          { value: 'notSure', label: 'Not sure' },
        ],
        soon: {
          note: 'We’ll do our best to reply sooner. If your date is very close, a free legal clinic may also be able to help.',
          action: 'See free legal help',
        },
      },
      {
        id: 'hasLawyer',
        question: 'Do you have a lawyer or paralegal right now?',
        options: [
          { value: 'no', label: 'No' },
          { value: 'yes', label: 'Yes' },
          { value: 'before', label: 'I had one before' },
          { value: 'looking', label: 'I’m looking for one' },
        ],
        withLawyer: 'If you have or had a lawyer or paralegal, ask them before you send us anything between you and them, or leave those messages out for now.',
      },
      {
        id: 'paperAmount',
        question: 'How much paper is there?',
        helper: 'A rough guess is fine.',
        options: [
          { value: 'few', label: 'A few documents' },
          { value: 'folder', label: 'A folder or two' },
          { value: 'box', label: 'A box or more' },
          { value: 'phone', label: 'Mostly on my phone' },
        ],
      },
      {
        id: 'contact',
        question: 'How can we reach you?',
        fields: { firstName: 'First name', email: 'Email', phone: 'Phone (optional)' },
        method: {
          legend: 'Best way to reach you',
          options: [
            { value: 'email', label: 'Email' },
            { value: 'call', label: 'Phone call' },
            { value: 'text', label: 'Text message' },
          ],
        },
        // intake.voicemail: asked only when "Phone call" is chosen. Default: No. Text message and Email ask nothing more.
        voicemail: {
          legend: 'Can we leave a voicemail?',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ],
        },
        note: `Nothing is sent until you press “${submitLabel}”. Please don’t include private details here. We’ll ask what we need when we talk.`, // ⚠K1
        consentPrivacy: 'I’ve read the privacy notice and agree to it.',
        // The sender line (Case IQ, address, email) is added from siteConfig. Parts that are unset are left out.
        consentUpdates: 'Send me occasional updates about Case IQ. I can unsubscribe anytime.',
        small: disclaimerFull,
        submit: submitLabel, // ⚠K1
      },
    ],
  },
  err: {
    name: 'Please enter your first name.',
    email: 'Please enter an email we can reach you at.',
    emailInvalid: 'This email address looks incomplete. Please check it.',
    phoneInvalid: 'This phone number looks incomplete. Please check it, or leave it blank.',
    consent: 'Please agree to the privacy notice so we can contact you.',
    phoneRequired: 'Please enter a phone number, or choose email.',
    submit: 'Your request wasn’t sent. Your answers are still here. Please try again, or email us at {email}.', // ⚠ shown while siteConfig.contactEmail is set
    submitNoEmail: 'Your request wasn’t sent. Your answers are still here. Please try again.',
  },
  success: {
    title: 'Thank you, {firstName}.',
    // {method}: email, phone call or text message. {nextBusinessDay}: a weekday name. The "Nothing by" sentence is left out while siteConfig.contactEmail is unset.
    body: 'A person on our team will reply by {method} within one business day. Nothing by {nextBusinessDay}? Write to {email}. Please don’t send any documents until we’ve talked.', // ⚠K2
    methods: { email: 'email', call: 'phone call', text: 'text message' },
    tip: 'While you wait, put your papers in one place, so they’re ready when we talk.',
  },
  waitlist: {
    h: 'Join the early-access list',
    toggle: 'Not in Ontario, or not ready yet? Join the early-access list',
    body: 'We’ll email you when Case IQ opens in your province, or when we have room in Ontario.',
    fields: {
      email: 'Email',
      province: 'Province or territory',
      language: 'Preferred language (optional)',
      professional: 'I’m a lawyer or paralegal',
    },
    // Required, unticked by default (CASL express consent). The sender line is added from siteConfig.
    consent: 'Email me when Case IQ opens in my province or has room in Ontario. I can unsubscribe anytime.',
    provinces: [
      { value: 'AB', label: 'Alberta' },
      { value: 'BC', label: 'British Columbia' },
      { value: 'MB', label: 'Manitoba' },
      { value: 'NB', label: 'New Brunswick' },
      { value: 'NL', label: 'Newfoundland and Labrador' },
      { value: 'NT', label: 'Northwest Territories' },
      { value: 'NS', label: 'Nova Scotia' },
      { value: 'NU', label: 'Nunavut' },
      { value: 'ON', label: 'Ontario' },
      { value: 'PE', label: 'Prince Edward Island' },
      { value: 'QC', label: 'Quebec' },
      { value: 'SK', label: 'Saskatchewan' },
      { value: 'YT', label: 'Yukon' },
    ],
    submit: 'Join the list',
    success: 'You’re on the list. We’ll be in touch.',
  },

  // ───────────────────────── S13 · Footer ─────────────────────────
  footer: {
    disclaimer: disclaimerFull,
    selfCite: 'Every statistic and court quote on this page links to its source. Spot one that doesn’t? Tell us.',
    examples: 'All examples on this page are made up. Any resemblance to real people or businesses is a coincidence.',
    // "Solar" and "CC BY 4.0" are links (Footer.tsx); the credit is the one the Solar icon set's licence asks for.
    credits: 'The film and the photos in the example case are made with AI. Icons: Solar by 480 Design, CC BY 4.0.',
    pros: {
      text: 'Lawyers and paralegals: clients who arrive organized.',
      link: 'Join the professional list.',
    },
    links: {
      privacy: 'Privacy',
      terms: 'Terms',
      accessibility: 'Accessibility',
      contact: 'Contact',
      help: 'Free legal help',
      quickExit: 'Quick exit',
    },
    copyright: '© 2026 {entity}', // {entity}: siteConfig.legalEntity, or the brand name while that is unset
  },

  // ───────────────────────── Meta ─────────────────────────
  meta: {
    title: 'Case IQ: organize your court papers, with every fact traced', // ⚠C2
    description:
      'For people in Ontario handling a court or tribunal case: one timeline from your emails, texts, photos and notes, with the page behind every fact. Free first conversation, then a flat price.', // ⚠C2 ⚠K1 ⚠K3
  },
} as const;

export type En = typeof en;
