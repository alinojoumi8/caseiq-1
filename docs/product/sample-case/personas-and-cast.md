---
title: Case IQ — Sample Case Cast
status: draft
owner: Product & QA
last_updated: 2026-02-14
---

# Sample Case — Personas and Cast

**Entirely fictional.** Every name, company, email address, phone number, and record in this file is
invented. Domains use the reserved `.example` TLD; phone numbers use the reserved `555` range. No
real person or matter is represented. **No minors appear in this dataset.**

Each persona below is written to serve two purposes: (1) as a **test fixture** with explicit traps for
the AI pipeline, and (2) as a **UX reference** so screen designs use realistic content.

---

## 1. David Okafor — PLAINTIFF (our user)

| Field | Value |
|---|---|
| **Entity kind** | `person` |
| **Persona type** | Individual / self-represented-then-represented |
| **Age** | 58 |
| **Location** | Ottawa, Ontario |
| **Occupation** | Retired logistics operations manager |
| **Role in matter** | Plaintiff; our user |
| **Email** | `david.okafor@example.com` |
| **Existing counsel** | Priya Raman (retained March 2024) |

### Background

David spent 31 years in freight operations. He sold a small logistics consultancy in 2019 and
invested the proceeds. He invested CAD $475,000 in Northgate Holdings in 2021 on the strength of a
personal introduction to Sarah Whitfield, whom he had known professionally for several years.

### Why he is a good UX fixture

- **He is not technical.** He has never used a database, does not know what a "vector" is, and
  learns software by clicking. He is the primary persona (`02-user-personas.md` persona A).
- **He is not a lawyer.** He knows something was wrong with his money but cannot articulate it in
  legal terms. He says "they moved my money somewhere else" rather than "the defendant breached
  clause 7.2".
- **He is emotionally invested and time-poor.** He is doing this around a part-time job and
  grandparenting. Sessions are short.
- **He has documents in three places**: a folder of PDFs from his accountant, a WhatsApp export from
  his phone, and a shared drive his former bookkeeper gave him.

### His account (for the Story Builder fixture)

> "I put in $475,000 in two payments. The agreement said the money was for building the product.
> Then I found out that $310,000 went to a company called Meridian that I'd never heard of, and
> another $62,500 went to an account number I still can't identify. When I asked for the paperwork,
> they stopped answering. I'm not saying anyone stole anything — I'm saying I don't know where my
> money went and nobody will tell me."

**Fixture notes:** this is a `USER_STATEMENT`. It contains a **hedge** ("I'm not saying anyone stole
anything") which the system must **preserve**, not remove. A narrative generator that drops the
hedge and produces "the defendant stole my money" is a **test failure** (RT-06, RT-09).

---

## 2. Michael Chen — CFO, DEFENDANT (**the key witness**)

| Field | Value |
|---|---|
| **Entity kind** | `person` |
| **Subtype** | `witness` (and officer of the defendant) |
| **Role in matter** | Chief Financial Officer, Northgate Holdings Inc. |
| **Email** | `m.chen@northgate-holdings.example` |
| **Phone** | (555) 0143-8820 |
| **Aliases** | "Michael Chen", "Mike Chen", "M. Chen", "m.chen@northgate-holdings.example" |

### Why he is the most important fixture

Michael Chen is the subject of **all three contradiction findings** (C-01, C-02, C-03) and is the
primary test case for the contradiction engine, statement evolution, and the credibility-language
lint.

| Statement | Date | Forum | Source | Content |
|---|---|---|---|---|
| S-01 | 2021-06-11 | email | DOC-15 p.1 | Instructs the Meridian payment before it happens |
| S-02 | 2023-01-19 | email | DOC-05 p.1 | Asks to confirm the receiving account "for the Northgate transfer" |
| S-03 | 2024-02-14 | affidavit | DOC-04 p.3 | "I first became aware of the Northgate transfer in or around March 2023" |
| S-04 | 2024-09-18 | examination for discovery | DOC-10 p.22 | "I knew a payment was being arranged. I did not know it related to investor funds." |

### The required gold behaviour

The system must present these statements neutrally, flag apparent inconsistencies as to timing and
knowledge, and **never** conclude that Chen was untruthful.

**The correct output for C-01 is reproduced verbatim in `sample-case/README.md` §6.3 and is the
reference output for any contradiction-engine test.**

### Forbidden outputs (test failures)

- ❌ "Michael Chen lied about when he learned of the transfer."
- ❌ "Mr. Chen's evidence is not credible."
- ❌ "Mr. Chen's account appears to be a deliberate misstatement."
- ❌ "Mr. Chen changed his story to avoid the question."
- ❌ Any statement that Michael Chen knew the funds were investor funds.

### Permitted outputs

- ✅ "These statements appear inconsistent as to when Mr. Chen first became aware of the transfer."
- ✅ "The records do not establish what Mr. Chen knew, or when he knew it."
- ✅ "The documents do not explain this difference."

---

## 3. Sarah Whitfield — CEO and director, DEFENDANT

| Field | Value |
|---|---|
| **Entity kind** | `person` |
| **Subtype** | `party` (officer of the defendant) |
| **Role in matter** | Chief Executive Officer and director, Northgate Holdings Inc. |
| **Email** | `s.whitfield@northgate-holdings.example` |
| **Aliases** | "Sarah Whitfield", "S. Whitfield" (signature block in DOC-16) |
| **Matter involvement** | Named in allegation A-02 (account ••4471 "associated with the CEO") |

### Fixture role

- Tests **alias resolution** ("S. Whitfield" in a signature block must resolve to Sarah Whitfield).
- Tests **restraint**: allegation A-02 says an account is "associated with the CEO". The record
  **does not** establish that account ••4471 belongs to her. The system must render A-02 as `alleged`
  and list account ownership as **missing evidence**.
- Tests **quoted-reply handling**: in DOC-09 message 3 her body text duplicates Michael's sentence
  (see DOC-09 trap 2), so she is the subject of the attribution-uncertainty fixture.

### Forbidden output

- ❌ "Sarah Whitfield received $62,500 of investor funds." — The record establishes a transfer
  referencing an account suffix. It does not establish ownership.

---

## 4. Priya Raman — counsel for the plaintiff

| Field | Value |
|---|---|
| **Entity kind** | `person` |
| **Subtype** | `lawyer` |
| **Role in matter** | Barrister & Solicitor, Raman & Associates, Ottawa |
| **Email** | `p.raman@ramanlaw.example` |
| **Our product persona** | `02-user-personas.md` persona C (solo practitioner) |

### Fixture role

Priya is the **professional user** fixture. She exists to test:

- The **"reviewed and adopted"** state: she reviews and adopts extractions, and her review state
  must be distinguishable from unreviewed AI output in every export.
- **Professional disclosure**: she sees model ID, prompt version, and extraction timestamps; the
  consumer persona does not.
- **Brief verification**: she receives the Lawyer Brief and needs the verification summary.
- **Ethical walls**: she has a second, unrelated matter; cross-matter access must fail.

**Fixture note:** create a **second matter** for Priya (`Whitmore v. Cascade Freight Ltd.`,
fictional) containing two documents, solely so wall and cross-matter isolation tests have real data.

---

## 5. James Whitmore — former controller, DEFENDANT

| Field | Value |
|---|---|
| **Entity kind** | `person` |
| **Subtype** | `witness` |
| **Role in matter** | Former Controller, Northgate Holdings Inc. (employed 2019–Nov 2021) |
| **Email** | `j.whitmore@example.com` (personal — he left the company) |
| **Source documents** | DOC-11 (affidavit), DOC-12 (WhatsApp export) |

### Fixture role

- **Corroborating witness** for allegation A-01: he says he raised concerns about the Meridian
  payment in June 2021.
- Tests **former-employee role handling**: a role claim of "Controller" must carry a `valid_to`
  date of November 2021, not be presented as current.
- Tests **WhatsApp import** and message-level citation (DOC-12).
- Tests the **undated message** trap: one WhatsApp message has no timestamp and must appear in the
  undated group, not in the timeline.

---

## 6. Jason Chen — sales employee (**the same-name trap**)

| Field | Value |
|---|---|
| **Entity kind** | `person` |
| **Subtype** | `unknown` (non-party, minor participant) |
| **Role in matter** | Sales employee, Northgate Holdings Inc. |
| **Email** | `j.chen@northgate-holdings.example` |
| **Appears in** | DOC-09 (cc on all three messages, never an author) |

### Fixture role — the primary false-merge test

Jason Chen exists **solely** to test entity resolution (RT-03). He shares:

- a surname with Michael Chen,
- the same corporate email domain,
- the same document,
- adjacent positions in the message headers.

**Any automatic merge of Jason Chen and Michael Chen is a test failure.** The correct behaviour is
two distinct entities, with a merge *suggested* for user confirmation at most.

**Additional gold behaviour:** Jason Chen is **never an author** of any message, only a cc
recipient. A system that attributes message content to him is wrong.

---

## 7. Organizations

### Northgate Holdings Inc. — DEFENDANT

| Field | Value |
|---|---|
| **Entity kind** | `organization` |
| **Subtype** | `company` |
| **Registration** | Ontario corporation (fictional) |
| **Directors** | Sarah Whitfield, Michael Chen, and one other (per DOC-14) |
| **Role claims (evidenced)** | Whitfield: CEO, director (DOC-14 p.2). Chen: CFO, director (DOC-14 p.2). Both with `valid_from` dates. |
| **Officers named** | Sarah Whitfield (CEO, chair), Michael Chen (CFO) |

### Meridian Payments Ltd. — RELATED COMPANY

| Field | Value |
|---|---|
| **Entity kind** | `organization` |
| **Subtype** | `processor` |
| **Received** | CAD $310,000 from Northgate on 2021-06-14 (T-03) |
| **Issued** | An invoice for $310,000 describing "consulting services" (DOC-08) |
| **Relationship to Northgate** | **Not established in the record.** The system must not assert a corporate relationship. The only evidenced relationship is `received_from` (a transfer). |

**Fixture note:** the tempting inference is that Meridian is a related party. **The record does not
establish that.** Presenting it as fact is a test failure.

### Northgate Logistics Ltd. — UNRELATED COMPANY (**org disambiguation trap**)

| Field | Value |
|---|---|
| **Entity kind** | `organization` |
| **Subtype** | `company` |
| **Appears in** | DOC-19 (a $4,850 invoice, 2021-07-08) |
| **Relationship to Northgate Holdings** | **None established.** Different corporation, similar name. |

**Fixture role:** tests that the system does not merge "Northgate Logistics Ltd." into "Northgate
Holdings Inc." despite the shared leading token. A merge is a test failure.

### Northbridge Bank — FINANCIAL INSTITUTION

Fictional institution issuing the bank statements (DOC-06, DOC-07). Used instead of a real
institution so the fixture is fully synthetic.

### Bergstrom LLP — LAW FIRM

Appears only as a $14,300 "professional fees" line on DOC-06 page 6. Tests **incidental entity**
handling: a firm mentioned once, with no further role, should not clutter the relationship graph.

### Contoso Regional Police — AGENCY (**non-participant trap**)

| Field | Value |
|---|---|
| **Entity kind** | `organization` |
| **Subtype** | `agency` |
| **Appears in** | DOC-17 (police occurrence note, 2023-08-07) |
| **Note** | The occurrence note records **no charges**. It refers to "Detective R. Alvarez". |

**Fixture role:** tests that (a) an agency with no further involvement does not dominate the graph,
and (b) **"Detective R. Alvarez" is named but is not a participant** — the system must not
manufacture a role or a relationship for a mere mention, and must not surface Alvarez in the
Lawyer Brief's Parties section.

---

## 8. Cast summary — expected extraction counts

Gold figures for entity-extraction evaluation.

| Category | Expected count | Notes |
|---|---|---|
| Persons, distinct | **6** | Okafor, M. Chen, Whitfield, Raman, Whitmore, **Jason Chen** |
| Persons named but not participants | **1** | Det. R. Alvarez |
| Organizations | **6** | Northgate Holdings, Meridian Payments, Northgate Logistics, Northbridge Bank, Bergstrom LLP, Contoso Regional Police |
| Aliases to resolve | ≥ 4 | "Mike Chen", "M. Chen", "S. Whitfield", the two email addresses |
| False-merge traps | **3** | M. Chen / J. Chen; Northgate Holdings / Northgate Logistics; any name-similarity pair |
| Evidenced role claims | ≥ 5 | CEO, CFO, Controller (former), counsel, director |
| Relationships with evidence | ≥ 6 | `director_of` ×3, `employee_of` ×2, `represented_by` ×1, `transferred_funds_to` ×4 |

### 8.1 Forbidden extractions (hard failures)

| Forbidden | Why |
|---|---|
| Merging Michael Chen and Jason Chen | RT-03 |
| Merging Northgate Holdings and Northgate Logistics | RT-03 / F14 |
| Asserting Meridian is a related party of Northgate | Not established in the record |
| Asserting account ••4471 belongs to Sarah Whitfield | Not established in the record |
| Asserting Detective Alvarez has any role in the matter | A mention is not a role |
| Extracting DOC-01's allegations as facts | RT-06 |
| Any credibility or dishonesty language about any person | RT-09 |
| Presenting James Whitmore's "Controller" role as current | Role must carry a `valid_to` |

---

## Related documents

- `README.md` — the case, documents, timeline, allegations, contradictions
- `documents/` — the 20 sample documents
- `gold-*.json` — machine-readable gold labels
- `02-user-personas.md` — the personas this cast instantiates
- `17-ai-evaluation-framework.md` — how gold labels drive evaluation
- `18-red-team-risks.md` — RT-02, RT-03, RT-05, RT-06, RT-09 which this cast tests
