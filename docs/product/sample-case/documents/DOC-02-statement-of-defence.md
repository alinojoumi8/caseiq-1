---
fixture_id: DOC-02
fixture_type: pleading
fixture_date: 2024-05-02
pages: 14
test_hooks: ["PARTY_POSITION denials", "denial is never evidence", "clause 7.3 defence characterisation", "board-approval gap", "no-credibility-language"]
---

# Statement of Defence

**Court File No. CV-24-00682147-0000**

**ONTARIO SUPERIOR COURT OF JUSTICE**

BETWEEN:

**DAVID OKAFOR**
Plaintiff

— and —

**NORTHGATE HOLDINGS INC.**
Defendant

---

## STATEMENT OF DEFENCE

---

#### [PAGE 1 — GOLD CITATION TARGET]

**TITLE OF PROCEEDING**

**1.** The Defendant, NORTHGATE HOLDINGS INC. ("Northgate"), responds to the Statement of Claim
issued 11 March 2024.

**2.** Except where expressly admitted, Northgate denies each and every allegation of fact pleaded in
the Statement of Claim as though the same were set out and traversed seriatim.

**3.** Northgate joins issue with the Plaintiff on the whole of the Statement of Claim.

**Page 1 gold facts:** document type `pleading`; date `2024-05-02`; author: defence counsel;
this page contains **no factual assertions by the Defendant at all** — only pleading conventions.

---

#### [PAGE 2 — GOLD CITATION TARGET]

**I. THE PARTIES**

**4.** Northgate admits the allegations in paragraph 1 of the Statement of Claim.

**5.** Northgate admits that it is a corporation incorporated under the laws of Ontario with its
registered office in the City of Mississauga, and that it carries on business in the development
and licensing of logistics management software. Northgate's registered address is 88 Ellesmere
Parkway, Suite 400, Mississauga, Ontario.

**Page 2 gold facts:** `EXTRACTED_FACT` — corporate identity and registered address of Northgate
Holdings Inc. Cross-references DOC-14 (corporate profile), which is the primary evidence for the
address. Note that an **admission in a pleading is still a `PARTY_POSITION`** and not independently
`EXTRACTED_FACT`; where DOC-14 also evidences the address, DOC-14 is the citation of record.

---

#### [PAGE 3 — GOLD CITATION TARGET]

**II. THE AGREEMENT**

**6.** Northgate admits the allegations in paragraphs 3 and 5 of the Statement of Claim. On or about
4 March 2021 the parties entered into a Subscription Agreement (the "Agreement") under which the
Plaintiff subscribed for shares for aggregate consideration of CAD $475,000, and the Plaintiff
advanced CAD $250,000 on 9 March 2021 and CAD $225,000 on 31 May 2021.

**7.** Northgate denies the allegation in paragraph 4 of the Statement of Claim insofar as it
suggests that clause 7.2 of the Agreement is the only provision governing the application of
subscribed funds. Clause 7.2 must be read with clause 7.3, which is reproduced in the Statement of
Claim neither in whole nor in part.

**Page 3 gold facts:** `PARTY_POSITION` — the defence's reading of the Agreement. The two amounts and
dates in ¶6 are `EXTRACTED_FACT` and are independently evidenced by DOC-06 pages 2 and 5, which are
the citations of record.

---

#### [PAGE 4 — GOLD CITATION TARGET]

**III. RESPONSE TO THE ALLEGATION REGARDING MERIDIAN PAYMENTS LTD.**

**8.** Northgate denies the allegations in paragraphs 18, 19, and 20 of the Statement of Claim.

**9.** Northgate states that it maintained an ordinary commercial relationship with Meridian Payments
Ltd. in 2021 and that Meridian Payments Ltd. was engaged to provide payment processing and related
administrative services.

**10.** Northgate states that the payment of CAD $310,000 made on or about 14 June 2021 was made in
the ordinary course of Northgate's business.

**11.** Northgate denies that any payment was made for purposes outside the scope of the uses
permitted by the Agreement.

**Page 4 gold facts:** `PARTY_POSITION` throughout. ¶9 characterises the relationship with Meridian;
the record does not independently establish that characterisation (see `gold-entity-resolution.json`
→ `relationships_not_established`).

---

#### [PAGE 5 — GOLD CITATION TARGET]

**12.** Further and in the alternative, Northgate states that the Agreement expressly contemplates the
application of subscribed funds beyond product development, as set out in clause 7.3.

**13.** Northgate states that the funds subscribed by the Plaintiff were applied by Northgate in
accordance with the Agreement.

**14.** Northgate denies the allegation in paragraph 20 of the Statement of Claim that the transfer
was not authorised by the board of directors. Northgate states that its board of directors oversees
the financial affairs of the corporation in the ordinary course, and that the absence of a specific
minute reference does not establish that any authorization was withheld.

**Page 5 gold facts:** `PARTY_POSITION`. ¶14 is the defence's answer to the plaintiff's board-approval
particular. **Both ¶20 of DOC-01 and ¶14 of DOC-02 are positions about an absence in the record.**
Neither may be extracted as a fact. See `gold-extraction.json` → `absence_is_not_a_fact`.

---

#### [PAGE 6 — GOLD CITATION TARGET]

**IV. THE DEFENDANT'S CHARACTERISATION OF THE TRANSFERS**

**22.** Northgate states that the transfers referred to in the Statement of Claim, including the
payment of CAD $310,000 to Meridian Payments Ltd. on 14 June 2021, were **permitted by clause 7.3 of
the Agreement as working capital and related corporate purposes**. Northgate states that intra-group
and vendor payments of this kind form part of the ordinary working-capital management of its
business.

**23.** Northgate states that no invested funds were applied for any purpose personal to any officer
or director of Northgate.

**Page 6 gold facts:** **¶22 is the specific defence characterisation required by the fixture** — the
words *"working capital and related corporate purposes"* appear here as the Defendant's reading of
clause 7.3, not as clause text. The clause text itself is `SOURCE_EXCERPT` at DOC-03 p.9 ¶7.3.

**Class:** `PARTY_POSITION`. **A denial or characterisation is never evidence of anything.** It may
appear in the *contradicting evidence* panel of A-01 (with the rationale
"denial — not evidence of anything") and must not appear in any supporting panel, and must not be
promoted to `EXTRACTED_FACT`.

---

#### [PAGE 7 — GOLD CITATION TARGET]

**V. RESPONSE TO THE ALLEGATION REGARDING ACCOUNT ••4471**

**24.** Northgate denies the allegations in paragraphs 21 and 22 of the Statement of Claim.

**25.** Northgate denies that any funds of the Plaintiff were transferred to a personal account
associated with Northgate's Chief Executive Officer, or to any personal account of any officer or
director.

**26.** Northgate states that the description "REF ACCT ••4471" appearing in a banking record is not
by itself evidence of the identity of any account holder.

**Page 7 gold facts:** `PARTY_POSITION`. **¶25 is the contradicting-evidence item for A-02** cited at
DOC-02 p.7 ¶25. ¶26 is the defence's own statement that the account suffix does not establish
ownership — which is a proposition the system must reach independently, from DOC-06 p.8, and not by
adopting the defence's position as a finding.

---

#### [PAGE 8 — GOLD CITATION TARGET]

**VI. RESPONSE TO THE ALLEGATION OF FAILURE TO ACCOUNT**

**27.** Northgate denies the allegations in paragraphs 24 and 25 of the Statement of Claim.

**28.** Northgate states that the Plaintiff has been provided with the financial information to which
he is entitled under the Agreement and under the *Business Corporations Act* (Ontario).

**29.** Northgate states that **all corporate records relating to the Plaintiff's investment,
including the audited financial statements of Northgate for the fiscal year ended 31 December 2021,
were provided to the Plaintiff**. Northgate further states that no request for a further accounting
has been refused.

**30.** Northgate states that clause 9.1 of the Agreement requires Northgate to maintain and, on
request, produce accounting records, and that Northgate has complied with that obligation.

**Page 8 gold facts:** `PARTY_POSITION`. **¶29 is the contradicting-evidence item for A-03** cited at
DOC-02 p.8 ¶29. ¶29 asserts production of records. It is a denial, so it counts as a
*contradicting* item only, and it does not by itself convert A-03 to a resolved status.

---

#### [PAGE 9 — GOLD CITATION TARGET]

**VII. FURTHER POSITIONS**

**31.** Northgate states that the Plaintiff's claim, insofar as it depends on clause 7.2 read in
isolation, raises a question of contractual interpretation that requires the Agreement to be read as
a whole, including clause 7.3 and the definitions in clause 1.

**32.** Northgate states that the relief sought in paragraph 26 of the Statement of Claim is
misconceived and denies that the Plaintiff is entitled to any of the relief claimed or to any relief
at all.

**Page 9 gold facts:** `LEGAL_INTERPRETATION` — ¶31 raises a question of contractual construction.
The system must route this to the "needs a lawyer's view" treatment and must **never** resolve it.

---

#### [PAGE 10 — GOLD CITATION TARGET]

**VIII. LIMITATION**

**33.** Northgate states that the Plaintiff's claim in respect of the payment made on or about
14 June 2021 was commenced more than two years after the date on which the claim was discoverable
and is statute-barred pursuant to the *Limitations Act, 2002*, S.O. 2002, c. 24, Sch. B.

**34.** Northgate states that the Plaintiff had knowledge of the matters pleaded in the Statement of
Claim no later than 28 June 2021.

**Page 10 gold facts:** `PARTY_POSITION` and `LEGAL_INTERPRETATION`. ¶34 is a party's assertion about
the Plaintiff's state of knowledge. It is not evidenced by any document in the uploaded record and
must carry no `EXTRACTED_FACT` classification. **Do not treat this paragraph as evidence of what
David Okafor knew.**

---

#### [PAGE 11 — GOLD CITATION TARGET]

**IX. POSITION ON THE PLAINTIFF'S ACCOUNT**

**35.** Northgate acknowledges that the Plaintiff has stated, in the account he has given of this
matter, that he does not know where his funds went. Northgate states that the documents it has
produced answer that question to the extent the documents permit.

**36.** Northgate states that it does not admit any fact pleaded in the Statement of Claim that is
not expressly admitted in this Statement of Defence.

**Page 11 gold facts:** ¶35 refers to the Plaintiff's own account. Any system that renders this must
label the underlying material `USER_STATEMENT` (David Okafor's account), never `EXTRACTED_FACT`.

---

#### [PAGE 12 — GOLD CITATION TARGET]

**X. RELIEF SOUGHT**

**37.** Northgate requests that the action be dismissed with costs.

**38.** Northgate requests that the Plaintiff's claim for an accounting be dismissed.

**39.** Northgate requests such further and other relief as this Honourable Court deems just.

**Page 12 gold facts:** `PARTY_POSITION`. Nothing on this page is extractable as a fact. A pipeline
that creates timeline events from a prayer for relief is failing.

---

#### [PAGE 13 — GOLD CITATION TARGET]

**XI. JURY NOTICE**

**40.** Northgate requests that this action be tried without a jury.

**41.** Northgate reserves the right to amend this Statement of Defence prior to trial.

**Page 13 gold facts:** `PARTY_POSITION`. Procedural only.

---

#### [PAGE 14 — GOLD CITATION TARGET]

Dated at Mississauga this 2nd day of May, 2024.

_______________________________
**HAROLD BRENTWORTH**
Brentworth & Sable LLP
Barristers & Solicitors
77 Queen Street West, Suite 1200
Toronto, ON M5H 2M5
h.brentworth@brentworth-sable.example
(555) 0212-7740

Solicitors for the Defendant, Northgate Holdings Inc.

---

**Page 14 gold facts:** signature block. Entities: Harold Brentworth (defence counsel, `person`,
`subtype: lawyer`); Brentworth & Sable LLP (`organization`, `subtype: law_firm`). Relationship
`represented_by` between Northgate Holdings Inc. and Brentworth & Sable LLP.

---

> **NOTE TO ENGINEERS — this file is a test fixture.**
>
> **Internal consistency:** this fixture is a companion to `DOC-01-statement-of-claim.md` and its
> page/paragraph anchors — p.6 ¶22, p.7 ¶25, p.8 ¶29 — match the citations used in
> `sample-case/README.md` §7 (allegations A-01, A-02, A-03).
>
> ### What this document is
>
> A statement of defence filed 2024-05-02 in *Okafor v. Northgate Holdings Inc.*, Court File No.
> CV-24-00682147-0000. Author: Harold Brentworth (defence counsel). 14 pages.
>
> ### The classification rule this fixture exists to test
>
> **Every substantive paragraph in this document is `PARTY_POSITION`.** Not one may be extracted as
> `EXTRACTED_FACT`. A pleading is a party's position; it is not evidence of anything, and it is not
> a factual finding.
>
> A denial in particular carries **zero evidentiary weight in either direction**. "Northgate denies
> X" tells the system that a party disputes X. It does **not** tell the system that X is false, and
> it does **not** tell the system that X is true.
>
> | Paragraph | Gold class | Role |
> |---|---|---|
> | ¶1–¶3, ¶36, ¶40, ¶41 | `PARTY_POSITION` | Pleading conventions and joinder of issue |
> | ¶4, ¶5, ¶6 | `PARTY_POSITION` | Admissions (still a party position, even where true) |
> | ¶7, ¶12, ¶13, ¶22, ¶30, ¶31 | `PARTY_POSITION` | Interpretation of the Agreement |
> | ¶8, ¶9, ¶10, ¶11, ¶14, ¶24, ¶25, ¶26, ¶27 | `PARTY_POSITION` | Denials |
> | ¶28, ¶29 | `PARTY_POSITION` | Denial of the accounting allegation |
> | ¶33, ¶34 | `PARTY_POSITION` + `LEGAL_INTERPRETATION` | Limitation defence |
> | ¶37, ¶38, ¶39 | `PARTY_POSITION` | Relief sought |
> | p.2 registered address | `EXTRACTED_FACT` **via DOC-14**, not via this pleading | Cite the registry profile, not the pleading |
>
> ### Gold citation targets
>
> | Target | Page | Paragraph | Quote to resolve |
> |---|---|---|---|
> | Defence characterisation of clause 7.3 | **p.6** | ¶22 | `"permitted by clause 7.3 of the Agreement as working capital and related corporate purposes"` |
> | A-02 contradicting item | **p.7** | ¶25 | `"denies that any funds of the Plaintiff were transferred to a personal account associated with Northgate's Chief Executive Officer"` |
> | A-03 contradicting item | **p.8** | ¶29 | `"all corporate records relating to the Plaintiff's investment"` |
>
> ### Assertion-class test assertions
>
> 1. **`PARTY_POSITION` → `EXTRACTED_FACT` confusion is a hard failure**, exactly as
>    `ALLEGATION` → `EXTRACTED_FACT` confusion is on DOC-01. `09-evidence-provenance.md` §1.2 lists
>    both transitions as NEVER permitted.
> 2. A denial must **not** appear in any *supporting evidence* panel of the allegation matrix
>    (F26). It may appear only as a *contradicting* item, and the UI must carry the rationale
>    "a party's position, not evidence".
> 3. Because this document produces **zero** `EXTRACTED_FACT` assertions, it must contribute **zero**
>    rows to the transaction ledger (F32) and **zero** events to the master timeline (F12) —
>    except, at most, the filing event itself, marked `created_by = ai` with class `PARTY_POSITION`.
> 4. ¶31 is `LEGAL_INTERPRETATION` and must be routed to the "needs a lawyer's view" panel, never
>    resolved. `deriveAllegationStatus` must never see this paragraph as evidence.
> 5. The denial at ¶14 and the plaintiff's particular at DOC-01 ¶20 are both positions about an
>    **absence** in the record. The system must render the absence as a **gap**
>    (`gold-extraction.json` → `absence_is_not_a_fact`) and must not convert it into a positive
>    assertion in either direction.
>
> ### Copy constraint
>
> This fixture contains no characterisation of any person's truthfulness, and no description of any
> transaction as improper. The words the product may not use about a person or a transaction
> (`14-ux-specification.md` §5.3) do not appear in this document's fixture or explanatory text
> except where a prohibition is being stated as a rule.
