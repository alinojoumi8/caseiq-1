---
fixture_id: DOC-04
fixture_type: affidavit
fixture_date: 2024-02-14
pages: 6
test_hooks: [statement S-03, contradiction C-01, contradiction C-02, contradiction C-03, OCR not required]
---

# Affidavit of Michael Chen

**Court File No. CV-24-00682147-0000**

**ONTARIO SUPERIOR COURT OF JUSTICE**

BETWEEN:

**DAVID OKAFOR**
Plaintiff

— and —

**NORTHGATE HOLDINGS INC.**
Defendant

---

## AFFIDAVIT OF MICHAEL CHEN

I, MICHAEL CHEN, of the City of Mississauga, in the Province of Ontario, MAKE OATH AND SAY:

---

**1.** I am the Chief Financial Officer of the Defendant, Northgate Holdings Inc. ("Northgate"),
and as such have knowledge of the matters to which I depose. I make this affidavit in support of
the Defendant's motion for summary judgment.

**2.** I have been employed by Northgate since 2019 and was appointed Chief Financial Officer in
January 2020.

**3.** Regarding the payment of CAD 310,000 that is the subject of this motion:

> ### [PAGE 3 — GOLD CITATION TARGET]
>
> **3.** I first became aware of the Northgate transfer in or around March 2023, when I was
> informed by the finance department during a routine review of the 2021 accounts. Prior to that
> time I had no knowledge of the transfer to Meridian Payments Ltd.

**4.** Northgate engaged Meridian Payments Ltd. as a payment processing service provider in 2021.
The engagement was arranged through the ordinary course of business.

**5.** All payments made by Northgate to Meridian Payments Ltd. were made pursuant to the
Subscription Agreement dated 4 March 2021, which permits the use of invested funds for working
capital and related corporate purposes.

**6.** At no time did I use, direct, or authorise the use of any invested funds for any personal
purpose, whether my own or that of any other officer or director of Northgate.

**7.** Attached hereto and marked as Exhibit "A" is a true copy of the Subscription Agreement
dated 4 March 2021.

**8.** I make this affidavit in support of the Defendant's motion and for no improper purpose.

---

SWORN BEFORE ME at the City of
Mississauga, in the Province of Ontario,
this 14th day of February, 2024.

_______________________________
Commissioner for Taking Affidavits

_______________________________
MICHAEL CHEN

---

> **NOTE TO ENGINEERS — this file is a test fixture.**
>
> **Paragraph 3 (page 3) is the canonical citation target.** Its character offsets on page 3 are the
> gold span for statement S-03. A citation to this document must resolve to page 3, paragraph 3, and
> highlight exactly:
>
> `"I first became aware of the Northgate transfer in or around March 2023, when I was informed by the finance department during a routine review of the 2021 accounts."`
>
> **This paragraph is one half of three contradictions** (C-01 with DOC-15; C-02 with DOC-05;
> C-03 with DOC-10). The correct output presents both quotes, describes the apparent inconsistency
> neutrally, and lists possible explanations. It **never** says anyone lied.
>
> **Gold extraction:**
> - date: `2024-02-14`, precision `exact`
> - author: Michael Chen
> - entities: Michael Chen, Northgate Holdings Inc., Meridian Payments Ltd.
> - event: E14 "Chen swears affidavit: 'first became aware… in or around March 2023'"
> - assertion class for ¶3: `EXTRACTED_FACT` (a factual statement by a witness)
> - assertion class for ¶5: `PARTY_POSITION` (a characterisation supporting the defence)
