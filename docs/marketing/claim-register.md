# Case IQ — Claim register (marketing site)

This register lists every factual, capability, privacy and commercial claim the site makes, with its status. **Copy that relies on a claim not listed here doesn't ship.**

**Owner:** the founder · **Last verified:** 2026-10-31

**Status key:**
- ✅ verified or always true
- ⚠ conditional: ships only once the founder confirms it is true
- ❌ banned

---

## A. Third-party facts

Each of these is shown on the page with a "where this comes from" chip.

| ID | Allowed wording | Source | Locator | Status | Notes |
|---|---|---|---|---|---|
| F1 | Nearly 9 in 10 people representing themselves said the other side had a lawyer. | NSRLP, *SRL Intake Report 2023–2025* | p. 14: 286 of 320 who answered | ✅ | Voluntary survey. Keep "who answered" in the chip. |
| F2 | 103 of 237 people representing themselves who answered (43%) had used AI to help prepare their case. | NSRLP 2023–25 | p. 25 (question added Apr 2024) | ✅ | |
| F3 | 226 of 308 had worked with a lawyer at some stage of their case. | NSRLP 2023–25 | p. 22 | ✅ | |
| F4 | 38% reported annual income under $30,000, and a further 24% between $30,000 and $50,000. | NSRLP 2023–25 | pp. 15–16 | ✅ | Never use the report's "17.37% earn $75,000 or more" sentence. It contradicts the report's own bracket counts. |
| F5 | Of 73 respondents asked why they represent themselves, 53 said they couldn't afford a lawyer. | NSRLP 2023–25 | p. 21 (added Mar 2025, multiple answers allowed) | ✅ | The sample is small, so use sparingly. |
| F6 | To get legal aid for a family case in Ontario, a single person must have income under $18,795 a year. | Legal Aid Ontario, "Will Legal Aid pay for my lawyer?" | Eligibility table, one-person row | ✅ as listed 31 Oct 2026 | Don't write "gross". LAO also looks at assets. Re-check before launch. |
| F7 | The median legal fee for a seven-day civil trial in Canada is $70,000. | Canadian Lawyer, 2024 Legal Fees Survey (347 firms) | "Median fees for 2024" | ✅ | 2024 data. |
| F8 | Ontario's Superior Court of Justice has practice directions on the use of AI in civil, family and criminal proceedings. | SCJ notice, 12 Feb 2026 | paras 1–2 | ✅ | Don't date all three directions to February 2026. |
| F9 | Ontario's Superior Court of Justice, in its AI practice direction for civil cases: everyone who prepares court papers, lawyers and the people in the case, is responsible for their accuracy, particularly when AI is used. | SCJ Consolidated Civil Provincial Practice Direction | Part J, item 12 | ✅ | Plain-language paraphrase (v2). "The people in the case" means litigants. Always name the source document, so it isn't read as an endorsement. |
| F10 | "The court will not tolerate inadvertence in this regard." | Same | Part J, item 12 | ✅ verbatim | v3.2: not used anywhere on the page. It added threat, not proof (rendered critique, round 1). |
| F11 | Depending on the circumstances, consequences can include cost orders, a public reprimand, or the matter being dismissed. | Same | "Potential sanctions" | ✅ | Never say self-represented people face Law Society referral. That applies to counsel only. |

**Source URLs**
- NSRLP: https://representingyourselfcanada.com/srl-intake-report-2023-2025/
  - PDF: https://representingyourselfcanada.com/wp-content/uploads/2026/03/Intake-Report-2023-25.pdf
- Legal Aid Ontario: https://www.legalaid.on.ca/will-legal-aid-pay-for-my-lawyer/
- Canadian Lawyer: https://www.canadianlawyermag.com/cl-plus/data-reports/the-state-of-the-canadian-legal-fee-landscape-an-in-depth-report/389271
- SCJ notice: https://www.ontariocourts.ca/scj/news/new-practice-directions-on-the-responsible-use-of-artificial-intelligence-in-court-proceedings/
- SCJ civil practice direction: https://www.ontariocourts.ca/scj/filing-procedures/provincial/consolidated-civil-provincial-practice-direction/

---

## B. Service and capability claims

| ID | Claim | Status | Condition |
|---|---|---|---|
| C1 | Case IQ is not a law firm and does not provide legal advice. | ✅ always | Shown in the footer and next to the primary call to action. |
| C2 | Every fact in your timeline links to the page it came from. | ⚠ | The founding-client process must deliver a page reference for every fact. |
| C3 | If your papers don't show something, we tell you. | ⚠ | Same process commitment as C2. |
| C4 | We read handwriting and mark words we couldn't make out. | ⚠ | Needs the transcription workflow. Never claim an accuracy figure. |
| C5 | A signature you're unsure about, shown enlarged next to signatures from your other papers. We don't say whether a signature is genuine; that's for a qualified document examiner. | ⚠ | Only if the pilot offers it. Never "differences noted" or "forged". |
| C6 | Papers that disagree are shown side by side. We don't decide who's right. | ⚠ | Only if the pilot offers it. |
| C7 | A summary for your lawyer or a legal clinic, not for filing. | ⚠ | Its header must carry D-3: "Prepared by [name] with AI assistance for discussion with counsel. Not legal advice. Not for filing." Never call it a "case brief", which echoes a family-court form. |
| C8 | An index of your papers: numbered and labelled, so you can find any page quickly. You choose what to use. | ⚠ | Never "ready for your hearing", "we choose your exhibits" or "we file". |
| C9 | We never change your original documents, and we keep a unique code (digital fingerprint) for each file that would change if the file did, so you can show it hasn't changed since you gave it to us. | ⚠ | Needs hashing in the pilot workflow. It shows no change since upload; it is not proof of authenticity. |
| C10 | AI software reads every page. A person on our team checks every fact in your timeline and summary before you get them. You talk to a person, not a bot. | ⚠ | Must describe the real pilot workflow. If a person doesn't check every fact, rewrite it. |
| C11 | You get your timeline, summary and index as a PDF you can print and a link you can open on your phone. | ⚠ | The delivery formats must be real. |
| C12 | We set duplicates aside. | ⚠ | Needs de-duplication in the pilot workflow. |
| C13 | We're not lawyers or paralegals. | ⚠ | True only while no licensee works on client files. If one does, revise this and the UPL position with counsel. |
| C14 | Plain questions help you tell your story in order, and your words stay marked as yours, separate from what your papers say. | ⚠ | Needs the guided-questions step in the pilot workflow. |

---

## C. Privacy, safety and commercial claims

| ID | Claim | Status | Condition |
|---|---|---|---|
| P1 | Who can see your papers: you, people you invite, and the person on our team helping you. The AI services we use read them too, to organize them, and the privacy notice names those services. | ⚠ | Depends on the file-intake tool, access controls and the chosen AI providers (D-5, D-12). |
| P2 | We don't train AI models on your case, and neither do the AI services we use. | ⚠ | Confirm the providers' terms (D-10). |
| P3 | Stored in Canada. | ⚠ Don't use unless true | Data residency is undecided. |
| P4 | Download or delete your case anytime. | ⚠ | Needs a deletion process. Always add the D-6 note about keeping documents. |
| P5 | Solicitor–client privilege doesn't cover what you share with us, because we're not lawyers. It protects what you and your own lawyer say or write to each other. A court or tribunal could order us to hand over what you share. | ⚠ counsel review | The last sentence is legal information. Counsel confirms the wording before launch. |
| P6 | Quick exit on every page. | ✅ once built | |
| P7 | We don't share your papers with anyone else, except services that store and process them for us, or when a court or the law requires it. | ⚠ | Must match the privacy notice and real practice. |
| P8 | We only contact you the way you choose, including whether it's safe to leave a message. | ⚠ | Needs a contact-preference process the team follows. |
| K1 | Free first conversation, about 20 minutes. | ⚠ | Founder confirms the length. |
| K2 | We reply within one business day. | ⚠ | Founder confirms. |
| K3 | A flat price agreed before we start, never hourly. | ✅ confirmed 2026-10-31 | The founder confirmed a flat fee, set by what the client needs and how complex the case is. |
| K4 | Taking our first clients in Ontario, a few at a time. | ⚠ | Must reflect real capacity. Use one launch state everywhere: the safety bar, the offer and the waitlist. |
| K6b | We'll tell you how long it will take in your free conversation, before you decide. | ⚠ | Used until K6's [X] is set. |
| C15 | In the service, the person helping you answers your questions about your papers, with the page each answer comes from. | ⚠ | Must describe the real pilot service. The S8 demo depends on it. |
| K6 | We aim to have your first timeline ready in about [X] days after we have your papers. | ⚠ | The founder sets X. Switch to "usually" only once there's a track record. |
| K7 | The price depends on what you need and how complex your case is. | ✅ confirmed 2026-10-31 | The founder's own wording. No starting price is published, so there is no "from $X" line. Used in FAQ 1. |

---

## D. Free legal help links (S8)

The names are fine to use now. **Verify every URL and description before launch.**

| Resource | Description on the page |
|---|---|
| Legal Aid Ontario | Free legal help, if you qualify. |
| Law Society Referral Service | Find a lawyer or paralegal. |
| Pro Bono Ontario | Free legal help for people who can't afford a lawyer. |
| Steps to Justice | Plain-language answers to legal questions in Ontario. |
| Community legal clinics | Free help with housing, income support, work and more, if you qualify. |
| Family Law Information Centres | Free family law information at Ontario courthouses. |

---

## E. Banned claims (never on the site)

- **Proof that doesn't exist:** any testimonial, client count, "trusted by", partner logo, press mention or rating.
- **Forgery and outcomes:**
  - "detects forgery" or "forged signature detection";
  - "proves" or "wins";
  - outcome or success rates.
- **Practising law:**
  - "AI lawyer" or "legal advice" for our service;
  - "represents you" or "replaces a lawyer";
  - "we file for you" or "we choose your exhibits".
- **Case IQ accuracy claims:** any accuracy or hallucination-rate figure, because nothing is measured yet.
- **Unverified or wrong facts:**
  - any hourly-rate figure (none could be verified);
  - "60% of family litigants are unrepresented" (a misreading of the study);
  - the "February 2026" date applied to all three AI directions.
- **Law Society referral:** never imply that self-represented people face it.
- **Unverified court details:** named Ontario e-filing platforms or filing rules.
- **Fear-based lines:** for example, "Don't lose your case because…".
- **"Case brief"** as the name of the summary for a lawyer. It echoes an Ontario family-court form.
- **"Ready for your hearing"** and similar wording that implies we assemble court documents.
- **"Secure"** and **"stop anytime"**, unless the founder confirms them and they're added to this register.
- **Naming real businesses or people** in examples. Examples use roles ("your manager", "your landlord").
