---
fixture_id: DOC-09
fixture_type: email_thread
fixture_date: 2021-05-28 to 2021-06-02
pages: 3
test_hooks: [quoted-reply de-duplication, speaker misattribution risk, same-name trap (Jason Chen), statement evolution]
---

# Email thread — "the Meridian arrangement"

Three messages in one thread. This file exists to test **quoted-reply de-duplication** and
**speaker attribution** (RT-02, F30 AC-2).

---

## Message 1 of 3

```
From:    Sarah Whitfield <s.whitfield@northgate-holdings.example>
To:      Michael Chen <m.chen@northgate-holdings.example>
Cc:      Jason Chen <j.chen@northgate-holdings.example>
Date:    Friday, 28 May 2021 09:14
Subject: Meridian arrangement — before Monday
```

Michael,

Ahead of the board meeting on the 1st, I want to make sure we are aligned on the Meridian
arrangement. As discussed, the payment needs to go out before the end of the month to keep the
Q2 numbers where we want them.

Jason has the vendor file if you need the account details.

Sarah

---

## Message 2 of 3 — [PAGE 2 — QUOTED-REPLY TRAP]

```
From:    Michael Chen <m.chen@northgate-holdings.example>
To:      Sarah Whitfield <s.whitfield@northgate-holdings.example>
Cc:      Jason Chen <j.chen@northgate-holdings.example>
Date:    Friday, 28 May 2021 16:40
Subject: RE: Meridian arrangement — before Monday
```

Sarah,

Understood. I have the account details from Jason.

One thing I want on the record: I am not comfortable describing this as working capital if the
services are not actually being delivered. I would rather we had something in writing from
Meridian.

Michael

> On 28 May 2021 at 09:14, Sarah Whitfield wrote:
>
> > Michael,
> >
> > Ahead of the board meeting on the 1st, I want to make sure we are aligned on the Meridian
> > arrangement. As discussed, the payment needs to go out before the end of the month to keep the
> > Q2 numbers where we want them.
> >
> > Jason has the vendor file if you need the account details.
> >
> > Sarah

---

## Message 3 of 3 — [PAGE 3]

```
From:    Sarah Whitfield <s.whitfield@northgate-holdings.example>
To:      Michael Chen <m.chen@northgate-holdings.example>
Cc:      Jason Chen <j.chen@northgate-holdings.example>
Date:    Wednesday, 2 June 2021 08:05
Subject: RE: Meridian arrangement — before Monday
```

Michael,

I am not comfortable describing this as working capital if the services are not actually being
delivered. I would rather we had something in writing from Meridian.

Let's discuss at the board meeting. Please get it done.

Sarah

> On 28 May 2021 at 16:40, Michael Chen wrote:
>
> > Sarah,
> >
> > Understood. I have the account details from Jason.
> >
> > One thing I want on the record: I am not comfortable describing this as working capital if the
> > services are not actually being delivered. I would rather we had something in writing from
> > Meridian.
> >
> > Michael
> >
> > > On 28 May 2021 at 09:14, Sarah Whitfield wrote:
> > >
> > > > Michael,
> > > >
> > > > Ahead of the board meeting on the 1st, I want to make sure we are aligned on the Meridian
> > > > arrangement. As discussed, the payment needs to go out before the end of the month to keep
> > > > the Q2 numbers where we want them.
> > > >
> > > > Jason has the vendor file if you need the account details.
> > > >
> > > > Sarah

---

> **NOTE TO ENGINEERS — this file is a test fixture.**
>
> ### Trap 1 — Quoted-reply de-duplication (F30 AC-2)
>
> The sentence *"I am not comfortable describing this as working capital if the services are not
> actually being delivered. I would rather we had something in writing from Meridian."* appears
> **twice in message 3**: once as Sarah's own new text (misattributed — see trap 2) and once inside
> the quoted block of Michael's message 2.
>
> The correct behaviour: quoted text is stripped and marked (`quoted_body_stripped = true`), so the
> same sentence is **not** recorded as two separate statements. A naive parser creates two
> statements and then reports a **false self-contradiction** where Sarah "says the same thing twice
> in the same email".
>
> ### Trap 2 — Speaker misattribution (RT-02)
>
> In message 3, Sarah's new body text **is** Michael's sentence, copied from the quoted block. A
> competent human reader notices this is likely a copy-paste artefact by the fixture's author, but a
> naive pipeline attributes it to Sarah as her own statement — creating a **false statement** in
> Sarah's evolution view and potentially a **false contradiction** between Sarah and Michael.
>
> **Correct gold behaviour:** this document is flagged `attribution_uncertain` for message 3's
> second paragraph, and it is **excluded from statement evolution** and from contradiction
> detection until a human confirms attribution. The system prefers "speaker unclear" over a guess
> (`18-red-team-risks.md` RT-02, mitigation L2).
>
> ### Trap 3 — Same-name pair (RT-03)
>
> **Jason Chen** (cc'd, sales employee, `j.chen@northgate-holdings.example`) is a **different person**
> from **Michael Chen** (CFO, `m.chen@northgate-holdings.example`). Both appear in the same
> document, in the same `To`/`Cc` positions, sharing a surname and a shared corporate email domain.
>
> **Correct gold behaviour:** two distinct entities. This is the primary false-merge test case.
> A merge would put Jason's documents into Michael's profile and could generate a false
> contradiction. **Any merge of these two without user confirmation is a test failure.**
>
> ### Gold extraction
>
> - dates: `2021-05-28` (×2), `2021-06-02` — all precision `exact`
> - participants: Sarah Whitfield (author ×2), Michael Chen (author ×1), Jason Chen (cc, never an author)
> - entities: Sarah Whitfield, Michael Chen, **Jason Chen (distinct from Michael Chen)**, Meridian
>   Payments Ltd., Northgate Holdings Inc.
> - events: E03 "Whitfield emails Chen about 'the Meridian arrangement'"
> - assertion class: `SOURCE_EXCERPT` for all quoted email bodies
> - **Jason Chen must not be merged with Michael Chen**
