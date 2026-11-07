---
fixture_id: DOC-01
fixture_type: pleading
fixture_date: 2024-03-11
pages: 12
test_hooks: [all three allegations, ALLEGATION vs EXTRACTED_FACT classification, party position]
---

# Statement of Claim

**Court File No. CV-24-00682147-0000**

**ONTARIO SUPERIOR COURT OF JUSTICE**

BETWEEN:

**DAVID OKAFOR**
Plaintiff

— and —

**NORTHGATE HOLDINGS INC.**
Defendant

---

## STATEMENT OF CLAIM

**TO THE DEFENDANT:** A LEGAL PROCEEDING HAS BEEN COMMENCED AGAINST YOU by the Plaintiff. The
claim made against you is set out in the following pages.

### I. THE PARTIES

**1.** The Plaintiff, David Okafor, is an individual residing in the City of Ottawa, in the
Province of Ontario.

**2.** The Defendant, Northgate Holdings Inc., is a corporation incorporated under the laws of
Ontario with its registered office in the City of Mississauga, in the Province of Ontario. The
Defendant carries on business in the development and licensing of logistics management software.

### II. THE INVESTMENT

**3.** On or about 4 March 2021, the Plaintiff and the Defendant entered into a Subscription
Agreement (the "Agreement") pursuant to which the Plaintiff agreed to subscribe for shares in the
Defendant for aggregate consideration of CAD $475,000.

**4.** Clause 7.2 of the Agreement provides that the funds subscribed "shall be applied solely
toward product development and working capital requirements of the Corporation".

**5.** Pursuant to the Agreement, the Plaintiff advanced CAD $250,000 on 9 March 2021 and a further
CAD $225,000 on 31 May 2021, for a total of CAD $475,000.

### III. [PAGE 4 — THE FIRST ALLEGATION]

> **THE TRANSFER TO MERIDIAN PAYMENTS LTD.**
>
> **18.** The Plaintiff pleads that the Defendant, acting through its officers, caused
> approximately CAD $310,000 of the Plaintiff's invested funds to be transferred to Meridian
> Payments Ltd. on or about 14 June 2021 for purposes outside the scope of the uses permitted by
> Clause 7.2 of the Agreement.
>
> **19.** The Plaintiff further pleads that the Defendant has provided no documentation
> demonstrating that Meridian Payments Ltd. provided any service to the Defendant corresponding to
> the sum transferred.
>
> **20.** The Plaintiff pleads that the transfer was not authorised by the board of directors of the
> Defendant, and that no minute of any board meeting records approval of the transfer.

### IV. [PAGE 5 — THE SECOND ALLEGATION]

> **THE TRANSFER TO ACCOUNT ••4471**
>
> **21.** The Plaintiff pleads that a further sum of approximately CAD $62,500 of the invested funds
> was transferred from the Defendant's account on or about 28 June 2021 to a personal account
> associated with the Defendant's Chief Executive Officer.
>
> **22.** The Plaintiff pleads that the said transfer was made without consideration and without
> any apparent commercial purpose.

### V. [PAGE 6 — THE THIRD ALLEGATION]

> **THE FAILURE TO ACCOUNT**
>
> **24.** The Plaintiff pleads that despite repeated requests made between January 2023 and
> November 2023, the Defendant has failed to provide the Plaintiff with an accounting of the use of
> the invested funds, contrary to Clause 9.1 of the Agreement.
>
> **25.** The Plaintiff pleads that the Defendant's failure to account has caused the Plaintiff to
> suffer loss and expense, including the costs of these proceedings.

### VI. RELIEF SOUGHT

**26.** The Plaintiff claims:

&nbsp;&nbsp;&nbsp;&nbsp;(a) damages in the amount of CAD $372,500;
&nbsp;&nbsp;&nbsp;&nbsp;(b) an accounting of the use of the invested funds;
&nbsp;&nbsp;&nbsp;&nbsp;(c) an order for the disgorgement of any benefit obtained;
&nbsp;&nbsp;&nbsp;&nbsp;(d) prejudgment and postjudgment interest;
&nbsp;&nbsp;&nbsp;&nbsp;(e) costs; and
&nbsp;&nbsp;&nbsp;&nbsp;(f) such further and other relief as this Honourable Court deems just.

### VII. THE BASIS OF JURISDICTION

**27.** The Plaintiff proposes that this action be tried in the City of Ottawa.

---

Dated at Ottawa this 11th day of March, 2024.

_______________________________
**PRIYA RAMAN**
Raman & Associates
Barristers & Solicitors
1420 Bank Street, Suite 300
Ottawa, ON K1V 7Y6
p.raman@ramanlaw.example
(555) 0187-3320

Solicitor for the Plaintiff

---

> **NOTE TO ENGINEERS — this file is a test fixture.**
>
> **This is the single most important classification fixture in the dataset.**
>
> Every numbered paragraph in sections III, IV, and V is an **`ALLEGATION`**. Not one of them may be
> extracted as an `EXTRACTED_FACT`. This is RT-06, the most damaging error the product can make.
>
> | Paragraph | Gold class | Gold allegation |
> |---|---|---|
> | ¶18 | `ALLEGATION` | A-01 (transfer to Meridian outside the permitted scope) |
> | ¶19 | `ALLEGATION` | A-01 supporting particular |
> | ¶20 | `ALLEGATION` | A-01 supporting particular (board authorisation) |
> | ¶21 | `ALLEGATION` | A-02 (transfer to account ••4471 associated with the CEO) |
> | ¶22 | `ALLEGATION` | A-02 supporting particular |
> | ¶24 | `ALLEGATION` | A-03 (failure to account) |
> | ¶25 | `ALLEGATION` | A-03 supporting particular |
> | ¶3, ¶5 | `EXTRACTED_FACT` | The agreement and the advances — these are factual assertions about the contract |
> | ¶4 | `SOURCE_EXCERPT` | The verbatim clause text |
>
> **Additional gold behaviour:** ¶20 pleads that the board did not authorise the transfer because no
> minute records approval. The correct system behaviour is to treat the **absence** of a minute
> reference as a **gap** in the record (see A-01 "Missing evidence"), **not** as a fact that the
> board did not approve. The system must never convert an absence of evidence into a positive
> assertion.
>
> **Evaluation assertion:** class-assignment accuracy for `ALLEGATION` on this document must be
> ≥ 0.98, and **any** `ALLEGATION → EXTRACTED_FACT` confusion is a hard failure regardless of
> overall precision.
