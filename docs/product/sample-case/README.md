---
title: Case IQ — Sample Case Dataset
status: draft
owner: Product & QA
last_updated: 2026-02-14
version: 1.0
---

# Sample Case Dataset — *Okafor v. Northgate Holdings Inc.*

**This is a completely fictional case.** Every person, company, email address, account number,
court file number, and document is invented for development and testing purposes. It is not based
on any real person, company, or legal matter. Any resemblance to an actual matter is coincidental.

---

## 1. Purpose

This dataset exists to let engineers and AI agents:

1. Build and test every major feature without waiting for real user data.
2. Have a **consistent, cited, internally coherent** matter to develop against — so a developer
   working on the timeline, the person profiles, and the brief all see the same facts.
3. Test the hard cases **deliberately**: conflicting witness statements, an ambiguous date, a
   duplicate document, an OCR error, a misattributed speaker, a financial chain, and an allegation
   with both supporting and contradicting evidence.
4. Provide gold labels for the extraction and entity-resolution evaluation sets
   (`17-ai-evaluation-framework.md`).

### 1.1 Privacy guarantee

The dataset contains **no real personal information**. Names are invented, companies are invented,
domains use the reserved `.example` TLD, phone numbers use the `555` reserved range, addresses are
fictional, and account numbers are made up. **No minors appear in this dataset** (deliberate —
see `13-privacy-and-legal-risks.md` §1.2).

---

## 2. Case header

| Field | Value |
|---|---|
| **Case title** | Okafor v. Northgate Holdings Inc. |
| **Case type** | `civil` — Civil claim |
| **Court** | Ontario Superior Court of Justice |
| **Court file number** | CV-24-00682147-0000 |
| **Jurisdiction** | Ontario, Canada |
| **Current stage** | Discovery completed; awaiting settlement conference |
| **Claim value** | CAD $475,000.00 plus damages |
| **Our user's role** | Plaintiff (David Okafor) |
| **Created** | 2026-01-14 |

### 2.1 Summary of the matter

David Okafor invested CAD $475,000 in Northgate Holdings Inc. between March and June 2021 under a
Subscription Agreement that specified the funds were to be used for "product development and
working capital." He alleges that approximately $310,000 was instead transferred to a related
company, Meridian Payments Ltd., and onward to accounts he cannot identify, and that
$62,500 was transferred to an account associated with the defendant's CEO. Northgate denies the
allegations and characterises the transfers as legitimate intra-group working-capital movements
authorised under the agreement.

The key contested factual issues are: (a) whether the transfers were permitted by the Subscription
Agreement; (b) when the CFO, Michael Chen, became aware of the transfers; and (c) whether the
board approved the transfers.

---

## 3. The cast

Detailed persona records in `personas-and-cast.md`. Summary:

| Entity | Kind | Role in matter | Notes |
|---|---|---|---|
| **David Okafor** | person | Plaintiff; our user | Investor; retired logistics manager |
| **Northgate Holdings Inc.** | organization | Defendant | Ontario corporation, logistics-tech |
| **Michael Chen** | person | Chief Financial Officer, Northgate | **Key witness — statements conflict** |
| **Sarah Whitfield** | person | CEO and director, Northgate | Received $62,500 transfer allegedly |
| **Priya Raman** | person | Counsel for the plaintiff | Fictional; the lawyer persona |
| **James Whitmore** | person | Former controller, Northgate | Left the company Nov 2021; defence witness |
| **Meridian Payments Ltd.** | organization | Payment processor | Related company; received $310,000 |
| **RBC (Royal Bank of Canada)** | organization | Financial institution | **Note:** a real institution is named only because bank statements must reference a bank. No real account or record is represented. For a fully synthetic fixture, substitute "Northbridge Bank". |

### 3.1 Entity-resolution traps (deliberate)

| Trap | Detail | Tests |
|---|---|---|
| **Same-name pair** | Two different people named "J. Chen" appear: **Michael Chen** (CFO) and **Jason Chen** (a Northgate sales employee, mentioned in one email). | RT-03 false merge |
| **Name variants** | "Michael Chen", "Mike Chen", "M. Chen", "m.chen@northgate-holdings.example" | Alias resolution |
| **Similar company names** | "Northgate Holdings Inc." vs "Northgate Logistics Ltd." (a different, unrelated company mentioned once) | Org disambiguation |
| **Initials only** | "S. Whitfield" in one signature block | Alias resolution |
| **A name mentioned but never a participant** | "Detective R. Alvarez" appears only in a police-occurrence-style reference within one document; not a party | Non-participant handling |

---

## 4. Document inventory

**20 documents.** Each is a `DOC-xx` record with the text content in `documents/`.
Page counts are chosen so citation tests have meaningful page numbers.

| ID | Filename | Type | Date | Author/Sender | Pages | Notes / test hook |
|---|---|---|---|---|---|---|
| DOC-01 | `DOC-01-statement-of-claim.md` | `pleading` | 2024-03-11 | P. Raman (for plaintiff) | 12 | **Contains the 3 allegations as `ALLEGATION`** — must never be extracted as facts |
| DOC-02 | `DOC-02-statement-of-defence.md` | `pleading` | 2024-05-02 | Defence counsel | 14 | Contains `PARTY_POSITION` denials |
| DOC-03 | `DOC-03-subscription-agreement.md` | `contract` | 2021-03-04 | Both parties | 22 | The "use of funds" clause; central interpretive document |
| DOC-04 | `DOC-04-affidavit-michael-chen.md` | `affidavit` | 2024-02-14 | M. Chen | 6 | **Statement A of the contradiction**: "first became aware… in or around March 2023" |
| DOC-05 | `DOC-05-email-chen-to-okafor-2023-01-19.md` | `email` | 2023-01-19 | M. Chen → D. Okafor | 1 | **Statement B of the contradiction**: discusses the Northgate transfer in January 2023 |
| DOC-06 | `DOC-06-bank-statement-northgate-2021-q2.md` | `bank_statement` | 2021-04-01 to 2021-06-30 | Northbridge Bank | 8 | **Contains a deliberately injected OCR digit error** with a running balance that exposes it |
| DOC-07 | `DOC-07-wire-transfer-confirmation-2021-06-14.md` | `receipt` | 2021-06-14 | Northbridge Bank | 1 | The $310,000 transfer to Meridian |
| DOC-08 | `DOC-08-meridian-payments-invoice-2021-06-15.md` | `invoice` | 2021-06-15 | Meridian Payments Ltd. | 2 | Purports to justify the transfer; description is generic |
| DOC-09 | `DOC-09-email-thread-board-approval.md` | `email` | 2021-05-28 to 2021-06-02 | S. Whitfield, M. Chen | 3 | **Quoted-reply trap**: an earlier message's words appear in a later reply |
| DOC-10 | `DOC-10-exam-for-discovery-transcript-chen.md` | `transcript` | 2024-09-18 | Court reporter | 48 | **Statement C**: Chen's discovery evidence differs from DOC-04 and DOC-05 |
| DOC-11 | `DOC-11-affidavit-james-whitmore.md` | `affidavit` | 2024-10-02 | J. Whitmore | 7 | Former controller; says he raised concerns about the transfers in June 2021 |
| DOC-12 | `DOC-12-whatsapp-export-okafor-whitmore.md` | `chat_export` | 2021-06-10 to 2021-07-02 | D. Okafor / J. Whitmore | 4 | Chat export; message-level citation; one message is undated |
| DOC-13 | `DOC-13-financial-statements-northgate-2021.md` | `financial_statement` | 2022-01-20 | Northgate (audited) | 18 | Shows the Meridian payment classified as "professional fees" |
| DOC-14 | `DOC-14-corporate-profile-northgate.md` | `corporate_record` | 2021-02-01 | Ontario corporate registry | 3 | Directors: Whitfield, Chen, and one other |
| DOC-15 | `DOC-15-email-chen-to-meridian-2021-06-11.md` | `email` | 2021-06-11 | M. Chen → accounts@meridian-payments.example | 1 | Pre-dates the transfer; instructs where to send funds |
| DOC-16 | `DOC-16-northgate-board-minutes-2021-06-01.md` | `corporate_record` | 2021-06-01 | Northgate (S. Whitfield, chair) | 5 | **Alleged board approval** — minutes do not mention the Meridian transfer |
| DOC-17 | `DOC-17-police-occurrence-note.md` | `police_record` | 2023-08-07 | [Fictional] Regional Police | 2 | Refers to "Detective R. Alvarez"; no charges; used for non-participant entity handling |
| DOC-18 | `DOC-18-duplicate-of-doc-07.pdf` | `receipt` | 2021-06-14 | Northbridge Bank | 1 | **Byte-identical duplicate of DOC-07** — tests dedup, not double-counting |
| DOC-19 | `DOC-19-invoice-northgate-logistics-2021-07.md` | `invoice` | 2021-07-08 | Northgate Logistics Ltd. | 1 | **Different company, similar name** — tests org disambiguation |
| DOC-20 | `DOC-20-scanned-letter-no-text-layer.md` | `correspondence` | 2021-08-19 | Unknown | 2 | **Scan with no text layer** — forces OCR path; contains an ambiguous date `3/4/2021` |

### 4.1 Deliberate test hooks — index

| Hook | Documents | Feature/risk tested |
|---|---|---|
| Allegation vs fact classification | DOC-01, DOC-02 | RT-06, F10, F26 |
| Conflicting witness statements | DOC-04, DOC-05, DOC-10 | RT-02, F27, F28 |
| Speaker misattribution risk | DOC-09, DOC-10 | RT-02 |
| Quoted-reply de-duplication | DOC-09 | F30 AC-2 |
| Ambiguous date `3/4/2021` | DOC-20 | RT-17, F12 |
| Relative date ("two weeks later") | DOC-12 | RT-17 |
| Undated event | DOC-12 (one message) | F12 AC-3 |
| OCR digit error + balance check | DOC-06 | **RT-05**, F32 |
| Duplicate document | DOC-18 (dup of DOC-07) | RT-29, F08 |
| Similar org names | DOC-19 | RT-03, F14 |
| Same-name different people | DOC-09 (Jason Chen), DOC-10 | RT-03, F10 |
| Non-participant named person | DOC-17 (Det. Alvarez) | F10 |
| Financial chain (tracing) | DOC-06, DOC-07, DOC-08, DOC-13, DOC-15 | F32, F33 |
| No text layer, OCR required | DOC-20 | F07, ADR-018 |
| Board approval dispute | DOC-16, DOC-09 | F26 |
| Party position vs allegation | DOC-02, DOC-13 | F26, DB-1 |

---

## 5. Timeline — 14 events

Events that the pipeline should extract, with the gold date precision and the source. Events
marked **[TRAP]** are the ones that test date handling.

| # | Date | Precision | Title | Source | Notes |
|---|---|---|---|---|---|
| E01 | 2021-03-04 | `exact` | Subscription Agreement executed; $475,000 committed | DOC-03 p.1 | Established fact |
| E02 | 2021-03-09 | `exact` | First tranche of $250,000 transferred by Okafor | DOC-06 p.2 | Established fact |
| E03 | 2021-05-28 | `exact` | Whitfield emails Chen about "the Meridian arrangement" | DOC-09 p.1 | Precursor to the transfer |
| E04 | 2021-05-31 | `exact` | Second tranche of $225,000 transferred by Okafor | DOC-06 p.5 | Established fact |
| E05 | 2021-06-01 | `exact` | Northgate board meeting held | DOC-16 p.1 | Minutes do **not** mention Meridian — contested |
| E06 | 2021-06-11 | `exact` | Chen emails Meridian instructing where to send funds | DOC-15 p.1 | Contradicts "I learned in March 2023" |
| E07 | 2021-06-14 | `exact` | **$310,000 transferred from Northgate to Meridian Payments** | DOC-06 p.7, DOC-07 p.1 | The central transaction |
| E08 | 2021-06-15 | `exact` | Meridian issues invoice for $310,000 (description: "consulting services") | DOC-08 p.1 | Purported justification |
| E09 | 2021-06-22 | `approximate` **[TRAP]** | Whitmore raises concerns with Chen about the Meridian payment | DOC-12 msg 4 | Chat says "last Tuesday" — needs relative resolution |
| E10 | 2021-07-08 | `exact` | Invoice received from **Northgate Logistics Ltd.** (unrelated company) | DOC-19 p.1 | Tests org disambiguation |
| E11 | 2021-08-19 | `approximate` **[TRAP]** | Letter dated `3/4/2021` — ambiguous D/M vs M/D | DOC-20 p.1 | **Must be flagged, not silently resolved** |
| E12 | 2023-01-19 | `exact` | Chen emails Okafor asking to confirm the receiving account for "the Northgate transfer" | DOC-05 p.1 | **Contradiction with DOC-04** |
| E13 | 2023-08-07 | `exact` | Police occurrence note generated; no charges | DOC-17 p.1 | Neutral framing required |
| E14 | 2024-02-14 | `exact` | Chen swears affidavit: "first became aware… in or around March 2023" | DOC-04 p.3 | **Contradiction with DOC-05** |

### 5.1 Expected extraction traps

| Trap | Expected system behaviour |
|---|---|
| E09 relative date | Resolve "last Tuesday" against the message date (2021-07-02) → 2021-06-22, `date_precision = 'approximate'`, with the source phrase preserved. |
| E11 ambiguous date | `is_ambiguous = true`, both readings stored (2021-03-04 and 2021-04-03), flagged for the user. **Never silently resolved.** |
| Undated chat message | A message in DOC-12 with no timestamp appears in the "undated" group, **not** in the timeline. |
| E07 duplicated | DOC-18 is a byte-identical copy of DOC-07. E07 must cite **one** document, and the duplicate must be linked, not double-counted. |
| E05 vs the allegation | The board minutes' absence of any Meridian reference is a **gap**, not a contradiction. The system must not assert that the board did not approve. |

---

## 6. Conflicting statements

The core test material for the contradiction engine and statement evolution.

### 6.1 Statement set — Michael Chen

| ID | Date | Forum | Statement (verbatim) | Source |
|---|---|---|---|---|
| S-01 | 2021-06-11 | email | "Please confirm the receiving account for the Meridian payment. We will be sending CAD 310,000 on Monday." | DOC-15 p.1 |
| S-02 | 2023-01-19 | email | "Can you confirm the receiving account for the Northgate transfer? I want to make sure our records match before the audit." | DOC-05 p.1 |
| S-03 | 2024-02-14 | affidavit | "I first became aware of the Northgate transfer in or around March 2023, when I was informed by the finance department during a routine review." | DOC-04 p.3 |
| S-04 | 2024-09-18 | examination for discovery | "Q: You sent the instruction email on 11 June 2021, correct? A: I sent an email, yes. Q: So you knew about the transfer before it happened. A: I knew a payment was being arranged. I did not know it related to investor funds." | DOC-10 p.22 |

### 6.2 Expected findings — the gold contradiction set

| ID | Statement A | Statement B | Subject area | Expected finding | Precision note |
|---|---|---|---|---|---|
| C-01 | S-03 (learned March 2023) | S-01 (instructed the payment June 2021) | `knowledge` / `timing` | **Apparent inconsistency, HIGH relevance** | Supported by both quotes; the strongest finding in the dataset |
| C-02 | S-03 (learned March 2023) | S-02 (discussed in January 2023) | `timing` | **Apparent inconsistency, MEDIUM relevance** | The January email could concern a different arrangement — candidate explanation required |
| C-03 | S-03 (learned March 2023) | S-04 (knew a payment was being arranged) | `knowledge` | **Apparent inconsistency, but explainable** | S-04 contains a genuine distinction ("a payment was being arranged" ≠ "related to investor funds"). **This is the false-positive trap**: a naive engine flags it as a flat contradiction; a good engine notes the distinction. |

### 6.3 Required non-culpable explanations

For **every** finding above, the system must offer candidate explanations drawn from the record.
Worked example for C-01 — the output must resemble:

> **These statements appear inconsistent as to timing.**
>
> • Affidavit of Michael Chen, 2024-02-14: *"I first became aware of the Northgate transfer in or
> around March 2023…"* [DOC-04, p. 3]
> • Email, M. Chen to accounts@meridian-payments.example, 2021-06-11: *"Please confirm the receiving
> account for the Meridian payment. We will be sending CAD 310,000 on Monday."* [DOC-15, p. 1]
>
> The first statement says Mr. Chen learned of the transfer in March 2023. The second shows him
> arranging a payment of the same amount to the same recipient in June 2021.
>
> **Possible explanations that the documents do not resolve:**
> • The 2021 email may concern a different transaction that happened to involve the same recipient.
> • "Became aware of the Northgate transfer" may refer to a specific internal review rather than
>   awareness of the payment generally.
> • The affidavit may be inaccurate as to the date.
>
> **That does not mean anyone is lying** — there may be an explanation the documents do not show.
>
> *The uploaded case materials do not establish what Mr. Chen knew, or when he knew it.*

**The required hedge sentence and the "does not establish" conclusion are mandatory** (RT-09,
`14-ux-specification.md` §5.3).

---

## 7. Allegations

Three allegations, each with supporting and contradicting evidence so the matrix has real content.

### A-01 — That the defendant used investor funds for purposes outside the Subscription Agreement

| Field | Value |
|---|---|
| **Allegation** | The defendant, through its officers, caused CAD $310,000 of the plaintiff's invested funds to be transferred to Meridian Payments Ltd. for purposes outside the scope permitted by the Subscription Agreement. |
| **Alleged by** | David Okafor (plaintiff) |
| **Date first alleged** | 2024-03-11 |
| **Source** | DOC-01, p. 4, ¶18 |

**Supporting evidence**

| Evidence | Source | Class | Stance rationale |
|---|---|---|---|
| Subscription Agreement restricts use to "product development and working capital" | DOC-03 p.9, ¶7.2 | `SOURCE_EXCERPT` | Establishes the restriction |
| $310,000 transferred Northgate → Meridian on 2021-06-14 | DOC-06 p.7; DOC-07 p.1 | `EXTRACTED_FACT` | Establishes the transfer |
| Meridian invoice describes the services only as "consulting services" | DOC-08 p.1 | `SOURCE_EXCERPT` | No specificity, no deliverables |
| Northgate's audited statements classify the Meridian payment as "professional fees" | DOC-13 p.11 | `EXTRACTED_FACT` | Mismatch with an invoice for "consulting services" |
| Whitmore states he raised concerns about the payment in June 2021 | DOC-11 p.4, ¶12 | `EXTRACTED_FACT` | Contemporaneous internal concern |

**Contradicting evidence**

| Evidence | Source | Class | Stance rationale |
|---|---|---|---|
| Agreement permits "working capital and related corporate purposes" | DOC-03 p.9, ¶7.3 | `SOURCE_EXCERPT` | Arguably covers intra-group payments |
| Whitfield emails about "the Meridian arrangement" as a known corporate matter | DOC-09 p.1 | `SOURCE_EXCERPT` | Suggests a planned arrangement, not a diversion |
| Defence position: transfers were legitimate intra-group movements | DOC-02 p.6, ¶22 | `PARTY_POSITION` | Denial — **not evidence of anything** |
| Board minutes of 2021-06-01 make no reference to Meridian | DOC-16 p.1–4 | **gap, not contradiction** | Absence must not be read as disproval |

**Undisputed facts** — the agreement exists and its amounts; the $310,000 transfer occurred; Meridian
received the funds.
**Missing evidence** — Meridian's bank records showing where the $310,000 went; the actual services
(if any) delivered; Northgate's internal approval documentation for the transfer; the full board
minute book.
**Related witnesses** — Michael Chen, Sarah Whitfield, James Whitmore.
**Related events** — E03, E06, E07, E08, E09.
**Expected status** — `disputed` (supporting > 0 and contradicting > 0).

---

### A-02 — That CAD $62,500 was transferred to an account associated with the defendant's CEO

| Field | Value |
|---|---|
| **Allegation** | CAD $62,500 of the invested funds was transferred to a personal account associated with the defendant's Chief Executive Officer. |
| **Alleged by** | David Okafor |
| **Date first alleged** | 2024-03-11 |
| **Source** | DOC-01, p. 5, ¶21 |

**Supporting evidence**

| Evidence | Source | Class | Stance rationale |
|---|---|---|---|
| Bank statement shows a $62,500 debit on 2021-06-28 | DOC-06 p.8 | `EXTRACTED_FACT` — **OCR-derived, flagged** | Amount must be verified against the page |
| Payee line on the statement references an account number ending 4471 | DOC-06 p.8 | `EXTRACTED_FACT` | Links to an account, not proven to be the CEO's |

**Contradicting evidence**

| Evidence | Source | Class | Stance rationale |
|---|---|---|---|
| Defence position denies any transfer to a personal account | DOC-02 p.7, ¶25 | `PARTY_POSITION` | A denial, not evidence |
| Corporate profile lists three directors and no personal accounts | DOC-14 p.2 | `SOURCE_EXCERPT` | Does not address accounts |

**Missing evidence** — account ownership records for the account ending 4471; a transfer
confirmation for this payment; Sarah Whitfield's response to the allegation under oath.
**Expected status** — `alleged` (single supporting document with OCR caveats, no corroboration).
**Test hook** — the system must render the amount with a **persistent OCR caveat** and must **not**
assert that the account belongs to the CEO.

---

### A-03 — That the defendant failed to provide an accounting

| Field | Value |
|---|---|
| **Allegation** | The defendant failed to provide the plaintiff with an accounting of the use of the invested funds despite repeated requests. |
| **Alleged by** | David Okafor |
| **Date first alleged** | 2024-03-11 |
| **Source** | DOC-01, p. 6, ¶24 |

**Supporting evidence**

| Evidence | Source | Class | Stance rationale |
|---|---|---|---|
| Chen's January 2023 email asks Okafor to confirm details "before the audit" | DOC-05 p.1 | `EXTRACTED_FACT` | Suggests records needed reconciling |
| Chat messages show Okafor requesting information | DOC-12 msg 6 | `SOURCE_EXCERPT` | Request documented |

**Contradicting evidence**

| Evidence | Source | Class | Stance rationale |
|---|---|---|---|
| Audited financial statements for 2021 were produced | DOC-13 p.1 | `EXTRACTED_FACT` | An accounting of the company exists, though not fund-specific |
| Defence position asserts all records were provided | DOC-02 p.8, ¶29 | `PARTY_POSITION` | Denial |

**Expected status** — `partially_supported` (supporting with no direct contradiction on the
fund-specific question).
**Test hook** — the status must **not** be presented as a finding that the defendant failed; the UI
must show the counts and the qualifier.

---

## 8. Financial data

### 8.1 The transaction ledger

Amounts are CAD. **All amounts are `numeric`, never floating point.** No row is characterised as
fraudulent, suspicious, or legitimate.

| ID | Date | From | To | Amount | Type | Source | Flags |
|---|---|---|---|---|---|---|---|
| T-01 | 2021-03-09 | D. Okafor (personal) | Northgate Holdings | 250,000.00 | inbound investment | DOC-06 p.2 | — |
| T-02 | 2021-05-31 | D. Okafor (personal) | Northgate Holdings | 225,000.00 | inbound investment | DOC-06 p.5 | — |
| T-03 | 2021-06-14 | Northgate Holdings | Meridian Payments Ltd. | 310,000.00 | outgoing | DOC-06 p.7; DOC-07 p.1 | — |
| T-04 | 2021-06-28 | Northgate Holdings | Account ••4471 | **7,500.00 → should be 62,500.00** | outgoing | DOC-06 p.8 | **`ocr_derived`, `balance_check = mismatch`** |
| T-05 | 2021-07-08 | Northgate Holdings | Northgate Logistics Ltd. | 4,850.00 | outgoing | DOC-19 p.1 | Different company — must not link to Northgate Holdings |
| T-06 | 2021-06-14 | Meridian Payments Ltd. | Account ••8892 (unidentified) | 290,000.00 | outgoing | *not in the uploaded record* | **Gap** — the trace terminates; this must be shown as missing evidence, not inferred |

### 8.2 The injected OCR error — the RT-05 test

DOC-06 page 8 contains a running balance. The **gold** debit on 2021-06-28 is `$62,500.00`. The OCR
fixture renders it as `$7,500.00` **while the statement's later balances are rendered correctly**
(that is, as computed from the true `$62,500.00`). This makes the arithmetic break detectable on a
later row:

| Row | Date | Description | Debit (as OCR'd) | Balance (as OCR'd) | Balance expected from prior row | Balance check |
|---|---|---|---|---|---|---|
| 1 | 2021-06-25 | Payroll | 18,400.00 | 141,220.55 | — | — |
| 2 | 2021-06-28 | Transfer ••4471 | **7,500.00** *(gold: 62,500.00)* | 133,720.55 | 133,720.55 | **ok** — internally consistent, error invisible here |
| 3 | 2021-06-30 | Interest | (credit 12.44) | **71,233.00** | 133,732.99 | **MISMATCH** |
| 4 | 2021-06-30 | Closing balance | — | 71,233.00 | 71,233.00 | ok |

**Why this fixture is correctly designed:** the corrupted row (2) reconciles with the corrupted
balance, so a naive check passes it. The break only appears at row 3, where the *correct* balance was
used. **This tests whether the implementation reports the break with enough context to identify row 2
as the suspect**, rather than merely reporting "row 3 does not reconcile."

**Test requirement:** the balance check must flag the break and present the user with the affected
region (rows 2–3), excluding T-04 from totals until a human confirms the correct figure. A system
that only flags row 3 without pointing at row 2 is a partial pass, not a full one.

### 8.3 The fund trace (F33 test)

The only fully evidenced trace, terminating in a gap:

```
David Okafor (personal)
   └─ 250,000.00 + 225,000.00 ──► Northgate Holdings Inc.
                                       ├─ 310,000.00 ──► Meridian Payments Ltd.   [DOC-06 p.7, DOC-07]
                                       │                      └─ 290,000.00 ──► Account ••8892
                                       │                                        [NOT IN RECORD — gap]
                                       └─ 62,500.00 (OCR-flagged) ──► Account ••4471  [DOC-06 p.8]
```

**Required UI statement:** *"The uploaded case materials do not show where the $290,000 leaving
Meridian went. Sequential transfers do not establish that the funds are the same money."*

**Forbidden:** asserting that Meridian forwarded Okafor's funds, or that account ••8892 belongs to
any particular person.

---

## 9. Gold labels for evaluation

Gold files live alongside this document. Summary of what each provides:

| Gold file | Contents | Used by |
|---|---|---|
| `gold-extraction.json` | Expected entities, dates, events, facts per document with character spans | `17-ai-evaluation-framework.md` §2 extraction set |
| `gold-allegations.json` | The 3 allegations with expected class, status, and evidence stances | F26 evaluation |
| `gold-contradictions.json` | C-01, C-02, C-03 with expected findings and the C-03 false-positive trap | F27 evaluation |
| `gold-entity-resolution.json` | The same-name, alias, and org-disambiguation traps with the correct answer | F10/R③ evaluation |
| `gold-transactions.json` | The ledger with the OCR error labelled | F32 evaluation |
| `gold-timeline.json` | 14 events with expected date precision and the ambiguous-date flag | F12 evaluation |

### 9.1 Evaluation targets this dataset supports

| Metric | Target | Dataset element |
|---|---|---|
| `ALLEGATION` classification accuracy | ≥ 0.98 | DOC-01, DOC-02 |
| Distinct-person precision | ≥ 0.95 | Jason Chen vs Michael Chen |
| Org disambiguation | No merge of Northgate Holdings with Northgate Logistics | DOC-19 |
| Ambiguous date flagging | 100% flagged, 0% silently resolved | DOC-20 |
| Unknown date handling | Undated message excluded from the timeline | DOC-12 |
| Duplicate handling | DOC-18 linked, not double-counted | DOC-07/DOC-18 |
| Balance-check catch | Row flagged, excluded from totals | DOC-06 p.8 |
| Contradiction precision | C-01 and C-02 found; C-03 correctly handled as explainable | §6.2 |
| Credibility language | Zero occurrences | The whole dataset |
| Abstention | "Where did the $290,000 go?" → not established | T-06 |
| Citation verification | Every gold quote locatable in its document | All |

---

## 10. How to use this dataset

### 10.1 Seeding

`pnpm seed:sample-case` (or the equivalent) creates the matter, users, documents, and runs the
pipeline. The seed script must:

1. Create the users: `david.okafor@example.com` (plaintiff), `priya.raman@example.com` (counsel).
2. Create the matter with the header values from §2.
3. Import the 20 documents in `documents/` as files, with the metadata from §4.
4. Trigger the full pipeline.
5. Optionally apply the gold labels directly (a `--with-gold` flag) so UI work can proceed before
   extraction quality is good.

### 10.2 Fixture modes

| Mode | Purpose |
|---|---|
| `--with-gold` | Pre-populated extractions; for UI and journey development |
| `--no-ai` | Documents and pages only; for search and citation development |
| `--adversarial` | Adds the OCR error, the duplicate, and the ambiguous date (default: included) |
| `--large` | Replicates the document set to 2,000 synthetic documents for performance testing |

### 10.3 Maintenance rules

1. **Every new feature must add its test hook here**, not in a separate ad-hoc fixture.
2. **No real personal information may ever be added.** The `.example` TLD, `555` phone range, and
   invented names are mandatory.
3. The dataset is versioned; gold labels change only with a documented reason.
4. **The dataset must never be used as a prompt example.** It is an evaluation set, and eval
   content leaking into prompts invalidates the evaluation (RT-26).

---

## Related documents

- `personas-and-cast.md` — the detailed fictional cast
- `documents/` — the 20 sample documents
- `gold-*.json` — the gold labels
- `17-ai-evaluation-framework.md` — how the labels are used
- `16-testing-strategy.md` §5 — fixture and test-data strategy
- `18-red-team-risks.md` — the risks each hook tests
