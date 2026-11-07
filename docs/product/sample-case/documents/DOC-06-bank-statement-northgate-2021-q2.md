---
fixture_id: DOC-06
fixture_type: bank_statement
fixture_date: 2021-04-01 to 2021-06-30
pages: 8
test_hooks: ["RT-05 OCR digit error", "balance arithmetic check", "transactions T-01..T-04", "ambiguous date T-04 amount"]
ocr_fixture: true
---

# Bank statement — Northgate Holdings Inc., Q2 2021

> **All details are fictional.** Account numbers, institution references, balances, and
> transactions are invented for testing. Any resemblance to a real account or record is
> coincidental.
>
> **This fixture exists to test RT-05 (OCR misreading a dollar amount).** See page 8. The
> `documents/` copy of this file presents the **gold, correctly-read** text. The pipeline must be
> exercised against `documents-ocr-corrupted/` which contains the digit error described at the end
> of this file.

---

## Page 1 — Statement summary

**Northbridge Bank** *(fictional institution)*
Business Chequing Statement of Account
Statement period: **1 April 2021 to 30 June 2021**

| Field | Value |
|---|---|
| Account holder | Northgate Holdings Inc. |
| Account number | •••• 2201 |
| Branch transit | 04412 |
| Opening balance (1 Apr 2021) | 96,540.18 |
| Total credits | 528,412.44 |
| Total debits | 415,988.07 |
| Closing balance (30 Jun 2021) | 208,964.55 |

**Page 1 gold facts:** account ••••2201 belongs to Northgate Holdings Inc.; statement period.

---

## Page 2 — March/April transactions (in part)

| Date | Description | Debit | Credit | Balance |
|---|---|---|---|---|
| 2021-04-01 | Opening balance | | | 96,540.18 |
| 2021-04-05 | Payroll — April | 34,120.00 | | 62,420.18 |

**Page 3**

| Date | Description | Debit | Credit | Balance |
|---|---|---|---|---|
| 2021-04-12 | Vendor — Corva Supplies | 8,412.90 | | 54,007.28 |
| 2021-04-19 | Licence revenue | | 22,150.00 | 76,157.28 |
| 2021-04-27 | Software subscriptions | 3,204.55 | | 72,952.73 |

**Page 4**

| Date | Description | Debit | Credit | Balance |
|---|---|---|---|---|
| 2021-05-03 | Payroll — May | 34,120.00 | | 38,832.73 |
| 2021-05-11 | Licence revenue | | 41,600.00 | 80,432.73 |
| 2021-05-19 | Office lease | 11,750.00 | | 68,682.73 |
| 2021-05-25 | Vendor — Bellweather IT | 6,318.40 | | 62,364.33 |

**Page 5 — [TRANSACTION T-02]**

| Date | Description | Debit | Credit | Balance |
|---|---|---|---|---|
| 2021-05-31 | **TRANSFER IN — D. OKAFOR REF SUB-2021-02** | | **225,000.00** | **287,364.33** |

**Page 5 gold facts:** inbound transfer of 225,000.00 CAD from D. Okafor, reference `SUB-2021-02`.
This is **T-02** in the ledger. Date precision `exact`.

**Page 6**

| Date | Description | Debit | Credit | Balance |
|---|---|---|---|---|
| 2021-06-02 | Payroll — June | 34,120.00 | | 253,244.33 |
| 2021-06-07 | Licence revenue | | 18,900.00 | 272,144.33 |
| 2021-06-10 | Professional fees — Bergstrom LLP | 14,300.00 | | 257,844.33 |

**Page 7 — [TRANSACTION T-03 — THE CENTRAL TRANSACTION]**

| Date | Description | Debit | Credit | Balance |
|---|---|---|---|---|
| 2021-06-14 | **WIRE OUT — MERIDIAN PAYMENTS LTD REF NG-2021-0614** | **310,000.00** | | **−52,155.67** |

**Page 7 gold facts:** wire out of **310,000.00 CAD** to **Meridian Payments Ltd.**, reference
`NG-2021-0614`, on 2021-06-14. This is **T-03**, the central transaction of the matter (event E07).
Cross-references DOC-07 (wire confirmation) and DOC-15 (the instruction email).
**Note: the reference `NG-2021-0614` matches the reference Michael Chen specified in DOC-15.**

> **Engineer's note:** the negative balance (`−52,155.67`) is intentional — the account went into an
> overdraft position, which the subsequent June revenue clears. Do not treat the negative balance as
> an extraction error.

**Page 8 — [THE OCR ERROR FIXTURE — TRANSACTION T-04]**

> ⚠️ **This page contains the deliberate OCR digit error.** The table below shows the **gold,
> correctly-read** values. The corrupted variant is in `documents-ocr-corrupted/`.

| # | Date | Description | Debit | Credit | Balance |
|---|---|---|---|---|---|
| 1 | 2021-06-25 | Payroll — June (2 of 2) | 18,400.00 | | 141,220.55 |
| 2 | 2021-06-28 | **TRANSFER OUT — REF ACCT ••4471** | **62,500.00** | | **78,720.55** |
| 3 | 2021-06-30 | Interest earned | | 12.44 | 78,732.99 |
| 4 | 2021-06-30 | Closing balance | | | 78,732.99 |

**Page 8 gold facts:**
- **T-04:** outgoing transfer of **62,500.00 CAD** on 2021-06-28, description references an account
  ending **••4471**. This is the transaction behind **allegation A-02**.
- **Critical gold constraint:** the document states the amount and an account suffix. It does
  **not** state who owns account ••4471. **The system must never assert that ••4471 belongs to any
  person.** A-02's status must remain `alleged`; the ownership link is **missing evidence**.
- The date 2021-06-28 is `exact`.

---

## Page 8 — the corrupted OCR variant (in `documents-ocr-corrupted/`)

The corrupted variant renders row 2's debit as **`7,500.00`** while rows 1, 3, and 4 are rendered
**correctly**:

| # | Date | Description | Debit (OCR'd) | Credit | Balance (OCR'd) | Balance expected from prior row | Check |
|---|---|---|---|---|---|---|---|
| 1 | 2021-06-25 | Payroll — June (2 of 2) | 18,400.00 | | 141,220.55 | — | — |
| 2 | 2021-06-28 | TRANSFER OUT — REF ACCT ••4471 | **7,500.00** ⚠️ | | 133,720.55 | 133,720.55 | **passes** — internally self-consistent, so the error is invisible here |
| 3 | 2021-06-30 | Interest earned | | 12.44 | **78,732.99** | 133,732.99 | **MISMATCH of 54,999.00** |
| 4 | 2021-06-30 | Closing balance | | | 78,732.99 | 78,732.99 | passes |

### Why this fixture is correctly designed

Row 2's corrupted debit reconciles with the corrupted 133,720.55 balance, so a row-by-row check
passes it. **The break only appears at row 3**, where the *correct* balance (78,732.99) was read.
The mismatch magnitude is exactly `62,500.00 − 7,500.00 = 55,000.00` (the 1.00 difference is the
interest credit on row 3).

### Required system behaviour

1. The balance check **must fire** and report the break at row 3.
2. It must present the affected **region** (rows 2–3), so the user can see that row 2 is the suspect.
3. **T-04 must be excluded from any total** until a human confirms the correct figure.
4. The row must carry an `ocr_derived = true` flag and render the persistent caveat
   *"This figure was read by computer from a scan — check it against the original."*
5. The page image must be available so the user can read `62,500.00` directly.
6. **A partial pass (flagging row 3 without identifying row 2 as the suspect region) is a test
   failure**, not a pass. Record it as such.

### Additional adversarial variant to build

`documents-ocr-corrupted-compensating/` should contain a **compensating-error** variant where two
digit errors preserve the running balance (e.g. row 2's `62,500.00` → `52,500.00` and row 1's
`18,400.00` → `28,400.00`). **Arithmetic cannot detect this.** The test's expected result is not
"caught" but "disclosed as a known limitation" — the OCR badge and human review are the only
defence. Record this as a documented, accepted residual risk (`18-red-team-risks.md` RT-05).

---

> **Gold extraction summary for this document**
>
> | Transaction | Date | Amount | Counterparty | Page |
> |---|---|---|---|---|
> | T-01 | 2021-03-09 | 250,000.00 (in) | D. Okafor | (March statement — separate fixture) |
> | T-02 | 2021-05-31 | 225,000.00 (in) | D. Okafor | p. 5 |
> | T-03 | 2021-06-14 | 310,000.00 (out) | Meridian Payments Ltd. | p. 7 |
> | T-04 | 2021-06-28 | 62,500.00 (out) | Account ••4471 | p. 8 |
>
> Entities: Northgate Holdings Inc., D. Okafor, Meridian Payments Ltd.
> **Account ••4471 has no owner in the record — this is a gap, not an inference.**
