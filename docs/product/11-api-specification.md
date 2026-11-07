---
title: Case IQ — API Specification
status: draft
owner: API Engineering
last_updated: 2026-02-14
version: 1.0
---

# 11 — API Specification

REST over Next.js route handlers under `/api/v1`. **Not implemented in this phase** — this
document defines responsibilities, contracts, and invariants so implementation requires no
product decisions.

---

## 1. Conventions

### 1.1 General

| Aspect | Rule |
|---|---|
| Base path | `/api/v1` (internal app routes under `/app`; public API shares the versioned namespace) |
| Content type | `application/json; charset=utf-8` except uploads and exports |
| Auth | Session cookie (browser) or `Authorization: Bearer <token>` (API clients, Phase 3+) |
| Tenancy | Matter/organization derived from the URL path and validated against membership. **Never from a client-supplied header alone.** |
| Idempotency | `Idempotency-Key` header required on all `POST` that spend money or create duplicates |
| Pagination | Cursor-based: `?limit=&cursor=` → `{ data, next_cursor, has_more }`. Offset pagination only for admin/audit views where a total count is required. |
| Filtering | Query params per resource; every resource documents its filterable fields |
| Sorting | `?sort=field:asc,field2:desc`; allowlisted fields only |
| Field selection | `?fields=a,b,c` for large resources (timeline, transactions) |
| Errors | RFC 9457 Problem Details, extended (§1.4) |
| Validation | Zod schemas on every request and response; the same schema generates the OpenAPI document |
| Rate limiting | Per user, per matter, and per IP; `429` with `Retry-After` |
| Versioning | `/v1` in the path. Breaking changes require `/v2`. Additive changes do not bump. |
| Deprecation | `Deprecation` and `Sunset` headers with a minimum 90-day window |

### 1.2 Why REST and not tRPC or GraphQL

- **REST** because it is self-documenting, testable with `curl`, generates an OpenAPI document
  that AI coding agents implement against accurately, and survives the frontend being rewritten.
- **Not tRPC** because it couples the client and server types in a way that becomes a liability
  once a non-Next.js consumer (a CLI, a job, a partner integration) exists, and because its
  errors are less inspectable in a production incident.
- **Not GraphQL** because the query complexity this product needs is well served by explicit
  endpoints with server-side permission checks, and because GraphQL's flexibility makes
  permission enforcement and query-cost bounding harder — the wrong trade for a system where a
  missed permission check leaks privileged material.

### 1.3 Response envelope

```jsonc
// Success (single resource)
{ "data": { /* resource */ }, "meta": { "request_id": "..." } }

// Success (collection)
{ "data": [ /* resources */ ], "next_cursor": "…", "has_more": true,
  "meta": { "request_id": "...", "total_estimate": 2410 } }
```

`total_estimate` is explicit about being an estimate — exact counts on large filtered sets are
expensive and are only computed where a count is essential (admin, audit).

### 1.4 Error format

RFC 9457 Problem Details, extended with a machine code and a **next action**:

```jsonc
{
  "type": "https://caseiq.app/errors/citation-unverified",
  "title": "This statement could not be verified against your documents",
  "status": 422,
  "code": "CITATION_UNVERIFIED",
  "detail": "The quoted text was not found on Disclosure Vol. 3, p. 412.",
  "instance": "/api/v1/matters/…/chat",
  "request_id": "req_01H…",
  "next_actions": [
    { "label": "Show me the page", "href": "/matters/…/documents/…?page=412" }
  ],
  "retryable": false
}
```

**Rules:**
1. `code` is a stable machine identifier in `SCREAMING_SNAKE_CASE`. Clients branch on `code`,
   never on `title` or `detail`.
2. `title` and `detail` are safe to show a user verbatim. They contain **no** stack traces, SQL,
   file paths, provider names, internal hostnames, or case content.
3. `next_actions` is what makes errors non-dead-ends (global criterion G-10).
4. Cross-tenant access returns **404, not 403**, to avoid disclosing existence.

### 1.5 Core error codes

| Code | HTTP | Meaning |
|---|---|---|
| `UNAUTHENTICATED` | 401 | No valid session |
| `MFA_REQUIRED` | 401 | Session needs step-up |
| `FORBIDDEN` | 403 | Authenticated but lacking capability |
| `NOT_FOUND` | 404 | Absent, or not visible to this actor |
| `VALIDATION_FAILED` | 422 | Schema violation; `errors[]` lists field paths |
| `QUOTA_EXCEEDED` | 402 | Plan limit reached before work starts |
| `COST_CEILING_REACHED` | 402 | Matter AI budget exhausted |
| `RATE_LIMITED` | 429 | |
| `CONFLICT` | 409 | Concurrent modification; `current_version` returned |
| `PRECONDITION_FAILED` | 412 | Missing `If-Match` on an optimistic update |
| `CITATION_UNVERIFIED` | 422 | Assertion failed verification and was suppressed |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | |
| `PAYLOAD_TOO_LARGE` | 413 | |
| `DOCUMENT_NOT_READY` | 409 | Operation needs a processed document |
| `AI_POLICY_BLOCKED` | 403 | Matter policy forbids the requested AI operation |
| `PROVIDER_UNAVAILABLE` | 503 | Upstream AI/OCR unavailable; `retryable: true` |
| `INTERNAL` | 500 | Never exposes detail |

---

## 2. Cross-cutting invariants

These apply to **every** endpoint. They are tested, not assumed.

| # | Invariant | Test |
|---|---|---|
| INV-1 | Every response is scoped to matters the actor may access | Property test: for random actor/resource pairs across tenants, expect 404 |
| INV-2 | `privileged` documents require `can_view_privileged` | Attempt every read path as an unauthorised member |
| INV-3 | No response contains an assertion that is `suppressed = true` as content | Automated scan over recorded responses |
| INV-4 | No response contains an assertion with `citation_count = 0` for citation-requiring classes | Same |
| INV-5 | Every response that includes a claim includes a resolvable citation reference | Same |
| INV-6 | No response body contains a raw storage key, internal ID, or provider name to a consumer-role user | Response schema lint |
| INV-7 | Every mutation writes an audit entry without case content | Audit denylist test |
| INV-8 | Every `POST` that spends money requires an `Idempotency-Key` | Route-level test |
| INV-9 | Every list endpoint is paginated; no unbounded result set | Route-level test |
| INV-10 | `PATCH` on versioned resources requires `If-Match` | Route-level test |

---

## 3. Endpoint groups

### 3.1 `/auth` — authentication and session

| Method | Path | Responsibility |
|---|---|---|
| POST | `/auth/register` | Create account; sets persona type; requires ToS acceptance |
| POST | `/auth/login` | Credential or OAuth exchange; returns session + MFA challenge if required |
| POST | `/auth/mfa/verify` | Complete step-up |
| POST | `/auth/mfa/enroll` | Begin TOTP enrolment (returns secret + QR once) |
| POST | `/auth/mfa/recovery` | Consume a recovery code |
| POST | `/auth/logout` | Revoke current session |
| POST | `/auth/logout-all` | Revoke all sessions |
| POST | `/auth/password/forgot` | Always returns 202 regardless of email existence |
| POST | `/auth/password/reset` | Consume a single-use token |
| GET | `/auth/sessions` | List active sessions for the user |
| DELETE | `/auth/sessions/:id` | Revoke one session |
| GET | `/auth/me` | Current user, organizations, memberships, entitlements |

**Notes:** rate limits on login and password reset keyed by IP + account; every auth event
audit-logged with credentials and tokens excluded; no endpoint reveals whether an email exists.

### 3.2 `/organizations` — tenancy

| Method | Path | Responsibility |
|---|---|---|
| GET/POST | `/organizations` | List / create |
| GET/PATCH | `/organizations/:id` | Read / update (name, region, policies) |
| GET | `/organizations/:id/members` | List members |
| POST | `/organizations/:id/invitations` | Invite |
| DELETE | `/organizations/:id/members/:userId` | Remove (revokes all matter access immediately) |
| GET/PATCH | `/organizations/:id/ai-policy` | Organization default AI policy |
| GET | `/organizations/:id/usage` | Usage and cost summary (admin only) |
| GET | `/organizations/:id/audit` | Audit log (admin only), filterable, cursor-paginated |

### 3.3 `/matters` — case containers

| Method | Path | Responsibility |
|---|---|---|
| GET | `/matters` | List matters for the actor, with dashboard counts |
| POST | `/matters` | Create (title + case type minimum) |
| GET | `/matters/:id` | Matter detail + dashboard aggregate |
| PATCH | `/matters/:id` | Update settings; `If-Match` required |
| POST | `/matters/:id/archive` | Soft archive; fully reversible |
| POST | `/matters/:id/restore` | Restore from archive |
| POST | `/matters/:id/delete` | Begin deletion; body selects `recoverable` \| `permanent` |
| GET | `/matters/:id/deletion` | Deletion status and receipt |
| GET/PATCH | `/matters/:id/ai-policy` | Per-matter AI provider policy |
| GET | `/matters/:id/members` | Matter membership |
| POST | `/matters/:id/members` | Grant access (role, scope, optional expiry) |
| PATCH | `/matters/:id/members/:memberId` | Change role or privileged-view capability |
| DELETE | `/matters/:id/members/:memberId` | Revoke |
| GET | `/matters/:id/summary` | Case summary as an assertion collection (§3.9) |
| POST | `/matters/:id/summary/regenerate` | Regenerate; creates a new version |
| GET | `/matters/:id/dashboard` | Aggregated dashboard payload |
| GET/POST | `/matters/:id/deadlines` | Deadlines |
| PATCH/DELETE | `/matters/:id/deadlines/:deadlineId` | |
| GET | `/matters/:id/coverage` | The "what we couldn't do" panel data |

**`POST /matters/:id/delete`** requires typed confirmation (case title) in the body, records the
actor, and returns a job ID. It is the only endpoint that bypasses the "reversible" rule.

### 3.4 `/matters/:id/uploads` and `/documents`

| Method | Path | Responsibility |
|---|---|---|
| POST | `/matters/:matterId/uploads/initiate` | Validate quota/types/sizes; create documents; return presigned part URLs |
| POST | `/matters/:matterId/uploads/:uploadId/complete` | Finalise; verify size and checksum; enqueue scanning |
| POST | `/matters/:matterId/uploads/:uploadId/abort` | Abort multipart; clean up |
| GET | `/matters/:matterId/uploads/:uploadId` | Upload progress and per-file state |
| GET | `/matters/:matterId/documents` | Library list; filters: `type`, `date_from`, `date_to`, `person`, `org`, `tag`, `processing_state`, `sensitivity`, `ocr`, `review_state`, `folder`, `q` |
| GET | `/matters/:matterId/documents/:id` | Detail: metadata, hashes, entities, linked events, processing history, coverage flags |
| PATCH | `/matters/:matterId/documents/:id` | Update user-editable metadata only (title, type, date, tags, sensitivity, folder) |
| DELETE | `/matters/:matterId/documents/:id` | Soft delete (recoverable) |
| POST | `/matters/:matterId/documents/:id/reprocess` | Re-run from a chosen stage; creates a new extraction run |
| GET | `/matters/:matterId/documents/:id/pages/:page` | Page text + offsets + OCR metadata |
| GET | `/matters/:matterId/documents/:id/pages/:page/render` | Signed URL to the page image |
| GET | `/matters/:matterId/documents/:id/content` | Signed URL to the original (short-lived, logged) |
| GET | `/matters/:matterId/documents/:id/verify` | Recompute SHA-256 and compare to stored |
| POST | `/matters/:matterId/documents/bulk` | Bulk actions with per-item results |
| GET | `/matters/:matterId/documents/duplicates` | Duplicate groups pending review |
| POST | `/matters/:matterId/documents/duplicates/:groupId/resolve` | Choose canonical / split |
| GET/POST | `/matters/:matterId/folders` | Folders |
| GET/POST | `/matters/:matterId/tags` | Tags |
| GET | `/matters/:matterId/processing` | Live processing status (SSE at `…/processing/stream`) |
| POST | `/matters/:matterId/processing/retry` | Retry failed stages per document |

**Upload initiate request:**
```jsonc
{
  "files": [
    { "filename": "disclosure-vol-3.pdf", "size_bytes": 41943040,
      "declared_mime": "application/pdf", "sha256": "…64 hex…" }
  ],
  "folder_id": null
}
```
**Response:** per file, either `{ document_id, upload_id, part_size, presigned_urls[] }` or
`{ filename, error_code, message }` — **partial acceptance is normal and must not fail the whole
batch.** A file rejected for size does not block nineteen that are fine.

**Bulk action response:** always per-item:
```jsonc
{ "data": { "results": [ { "id": "…", "status": "ok" },
                         { "id": "…", "status": "failed", "code": "DOCUMENT_NOT_READY" } ],
            "succeeded": 1, "failed": 1 } }
```

### 3.5 `/entities` — people and organizations

| Method | Path | Responsibility |
|---|---|---|
| GET | `/matters/:matterId/entities` | List with filters: `kind`, `subtype`, `q`, `has_events`, `review_state`, `possible_duplicates` |
| POST | `/matters/:matterId/entities` | Create manually |
| GET | `/matters/:matterId/entities/:id` | Full profile |
| PATCH | `/matters/:matterId/entities/:id` | Update display name, subtype, description |
| DELETE | `/matters/:matterId/entities/:id` | Soft delete |
| GET | `/matters/:matterId/entities/:id/documents` | Documents mentioning the entity |
| GET | `/matters/:matterId/entities/:id/events` | Timeline events involving the entity |
| GET | `/matters/:matterId/entities/:id/statements` | Statements attributed to the entity |
| GET | `/matters/:matterId/entities/:id/relationships` | Edges with evidence |
| GET | `/matters/:matterId/entities/:id/transactions` | Linked transactions |
| GET | `/matters/:matterId/entities/:id/mentions` | Raw mentions with spans |
| GET/POST | `/matters/:matterId/entities/:id/aliases` | Aliases |
| GET | `/matters/:matterId/entities/:id/conflicts` | Contradictions involving the entity |
| GET | `/matters/:matterId/entities/merge-candidates` | Pending merge suggestions |
| POST | `/matters/:matterId/entities/merge` | Merge two entities (audited, reversible) |
| POST | `/matters/:matterId/entities/:id/split` | Split mentions into a new entity |
| POST | `/matters/:matterId/entities/unmerge` | Reverse a prior merge using stored reversal data |
| GET/POST | `/matters/:matterId/entities/:id/role-claims` | Evidenced role assertions |

**Profile responses are assertion collections, not plain objects** (§3.9). A role is returned as an
assertion with class `EXTRACTED_FACT` (or `AI_INFERENCE`), confidence, and citations — **never as a
bare string property on the person.** This is the API-level expression of the core principle.

### 3.6 `/events` — timeline

| Method | Path | Responsibility |
|---|---|---|
| GET | `/matters/:matterId/events` | Timeline; filters: `date_from`, `date_to`, `precision`, `person`, `org`, `allegation`, `document`, `review_state`, `disputed`, `significance`, `q`; sorts by date |
| POST | `/matters/:matterId/events` | Create manually (`origin = user`) |
| GET | `/matters/:matterId/events/:id` | Event with citations, participants, documents, conflicts |
| PATCH | `/matters/:matterId/events/:id` | Edit; `If-Match`; creates a revision |
| DELETE | `/matters/:matterId/events/:id` | Soft delete |
| POST | `/matters/:matterId/events/:id/merge` | Merge duplicate events (preserves all citations) |
| POST | `/matters/:matterId/events/merge` | Bulk merge |
| POST | `/matters/:matterId/events/:id/dispute` | Mark disputed with a note |
| POST | `/matters/:matterId/events/:id/undispute` | |
| POST | `/matters/:matterId/events/:id/evidence` | Attach a supporting citation |
| DELETE | `/matters/:matterId/events/:id/evidence/:citationId` | Detach |
| GET | `/matters/:matterId/events/undated` | Events with unknown date, kept separate |
| GET | `/matters/:matterId/timeline/export` | CSV/ICS export with citation columns |

**Event response shape (abridged):**
```jsonc
{
  "id": "evt_…",
  "assertion": {
    "id": "asr_…", "class": "EXTRACTED_FACT", "confidence": "MEDIUM",
    "confidence_label": "Supported by the records",
    "confidence_inputs": { "model_signal": "stated_explicitly",
                           "caps_applied": ["date_precision:approximate"],
                           "independent_sources": 1 },
    "text": "A transfer of $47,500 was made from Northgate Holdings to an account ending 4471."
  },
  "event_date": "2021-06-14",
  "date_precision": "approximate",
  "date_source_text": "on or about 14 June 2021",
  "date_derivation": "stated",
  "is_ambiguous": false,
  "title": "Transfer of $47,500 from Northgate Holdings",
  "participants": [ { "entity_id": "ent_…", "display_name": "Northgate Holdings",
                      "role": "subject", "assertion_id": "asr_…" } ],
  "citations": [ { "id": "cit_…", "document_id": "doc_…",
                   "document_label": "Disclosure Vol. 7", "page_number": 88,
                   "quoted_text": "…on or about 14 June 2021 the sum of $47,500.00 was…",
                   "verification_status": "verified", "match_quality": "exact",
                   "ocr_derived": false, "numeric_token": true,
                   "anchor": "/matters/…/evidence/cit_…" } ],
  "review_state": "unreviewed",
  "disputed": false,
  "origin": "ai",
  "created_at": "…"
}
```

**Note what is present:** `confidence_label` alongside the enum (consumer copy), the caps that
produced the confidence, `date_source_text`, and the `anchor`. A client cannot render this event
without a citation — the field is required in the schema.

### 3.7 `/allegations`, `/statements`, `/contradictions`

**`/matters/:matterId/allegations`**

| Method | Path | Responsibility |
|---|---|---|
| GET | `/allegations` | List with `status`, `counts`, `alleged_by` |
| POST | `/allegations` | Create (AI-proposed or user) |
| GET | `/allegations/:id` | Full matrix: allegation, supporting, contradicting, undisputed, missing, witnesses, events |
| PATCH | `/allegations/:id` | Edit text, alleged_by, date_first_alleged |
| POST | `/allegations/:id/evidence` | Attach evidence with a stance |
| PATCH | `/allegations/:id/evidence/:evidenceId` | Override stance, importance, note |
| DELETE | `/allegations/:id/evidence/:evidenceId` | |
| GET | `/allegations/:id/status` | Status + the inputs that produced it |
| POST | `/allegations/:id/recompute` | Force status recomputation |
| GET/POST | `/allegations/:id/missing-evidence` | Gaps (AI inference, phrased as questions) |
| POST | `/allegations/:id/add-to-brief` | |

**`/allegations/:id` response includes `status_inputs`** (`{supporting: 3, contradicting: 1,
undisputed: 2}`) so the user sees the derivation, not just the label.

**`/matters/:matterId/statements`**: `GET` list (filter by `speaker`, `forum`, `date range`),
`GET /:id`, `GET /:id/versions`, `POST /:id/link-version`, `PATCH /:id` (attribution correction).

**`/matters/:matterId/contradictions`**: `GET` list (filter by `person`, `subject_area`,
`disposition`, `confidence`), `GET /:id`, `POST /:id/dispositions`, `DELETE /:id/dispositions/:id`.
`GET /matters/:matterId/statements/:id/evolution` returns the Statement Evolution payload.

### 3.8 `/transactions` and `/accounts`

| Method | Path | Responsibility |
|---|---|---|
| GET | `/matters/:matterId/transactions` | Ledger; filters: `date_from`, `date_to`, `amount_min`, `amount_max`, `currency`, `sender`, `recipient`, `account`, `allegation`, `balance_check`, `ocr`, `review_state` |
| GET | `/transactions/:id` | Row with citation, balance check, linked entities |
| PATCH | `/transactions/:id` | Correct a field (versioned) |
| POST | `/transactions/:id/confirm` | Human confirmation of a flagged row |
| GET | `/transactions/totals` | Totals with constituent counts, **per currency** |
| GET/POST | `/accounts` | Accounts |
| POST | `/traces` | Create a trace definition |
| GET | `/traces/:id` | Render a trace (recomputed, never cached) |
| GET | `/transactions/export` | CSV/XLSX **with provenance columns** |

**`GET /transactions/totals` response:**
```jsonc
{ "data": { "totals": [
    { "currency": "CAD", "amount": "128450.00", "row_count": 47,
      "excluded_mismatch_rows": 2, "excluded_unverified_rows": 3 } ],
  "meta": { "note": "Amounts are summed within each currency. No conversion is applied." } } }
```

**Rules enforced by this endpoint:** totals are never mixed across currencies; `row_count` is
always returned; excluded rows are always disclosed. A client cannot render a total without
knowing how many rows were excluded.

### 3.9 The assertion collection

Resources whose content is AI-generated or interpretive return an **assertion collection** rather
than plain values. This is the API-level guarantee (INV-3/4/5).

```jsonc
{
  "assertions": [
    {
      "id": "asr_…",
      "class": "ALLEGATION",
      "class_label": "Alleged by a party",
      "text": "The respondent used joint funds for personal expenses.",
      "confidence": "MEDIUM",
      "confidence_label": "Supported by the records",
      "suppressed": false,
      "citation_count": 2,
      "citations": [ /* full citation objects with anchors */ ],
      "review_state": "unreviewed",
      "origin": "ai",
      "extraction": {                         // professional roles only; omitted for consumer roles
        "role_id": "r04_fact_extractor",
        "model_id": "…", "prompt_version": 7,
        "extracted_at": "…", "verification": { "tier1": "verified", "tier2": "supported" }
      }
    }
  ],
  "not_established_groups": [
    { "subject": "who attended the 4 June meeting",
      "reason": "NO_SUPPORTING_EVIDENCE",
      "question": "Who attended the 4 June meeting?",
      "nearest_supported": [ /* assertion refs */ ] }
  ]
}
```

**Serialisation rule:** `suppressed = true` assertions are **excluded from `assertions`** and, if
included at all under `?include=suppressed` (professional roles only), appear under a separate
`suppressed_assertions` key with no citation resolved as a link. A client cannot accidentally
render a suppressed assertion as content.

**`not_established_groups` is a first-class response field.** Abstention is part of the contract.

### 3.10 `/search`

| Method | Path | Responsibility |
|---|---|---|
| GET | `/matters/:matterId/search` | Hybrid search. Params: `q`, `mode` (`hybrid`\|`keyword`\|`semantic`), `types`, `date_from`, `date_to`, `person`, `org`, `amount_min`, `amount_max`, `account`, `allegation`, `witness`, `sensitivity`, `ocr`, `review_state`, `group_by` |
| GET | `/matters/:matterId/search/suggest` | Autocomplete over entity names and document titles |
| GET | `/matters/:matterId/search/explain` | Why a result matched (debug/professional) |
| GET/POST | `/matters/:matterId/saved-views` | Saved views |
| GET/PATCH/DELETE | `/matters/:matterId/saved-views/:id` | |

**Search response:**
```jsonc
{ "data": {
    "documents": [ { "document_id": "…", "label": "…", "page_number": 88,
                     "snippet_html": "…the <mark>Northgate</mark> transfer…",
                     "match_reason": "keyword+semantic",
                     "citation": { "id": "cit_…", "anchor": "…" } } ],
    "events": [ /* assertion collections */ ],
    "entities": [ … ], "transactions": [ … ], "statements": [ … ], "notes": [ … ]
  },
  "meta": { "mode": "hybrid", "arms_used": ["fts","vector","structured"],
            "reranked": true, "took_ms": 412 } }
```

**`snippet_html`** is server-sanitised: only `<mark>` is permitted; all other markup is escaped.
This prevents a stored-XSS vector from document content.

**Permission rule:** a result the actor cannot view is excluded **in the SQL query**, so neither
its snippet nor its existence is revealed, and `total_estimate` does not leak a count of hidden
documents.

### 3.11 `/chat` — the AI assistant

| Method | Path | Responsibility |
|---|---|---|
| POST | `/matters/:matterId/chat` | Ask a question; returns a completed, verified answer (or streams via SSE) |
| GET | `/matters/:matterId/chat/conversations` | Conversation list |
| POST | `/matters/:matterId/chat/conversations` | New conversation |
| GET | `/matters/:matterId/chat/conversations/:id` | Messages with assertions and citations |
| DELETE | `/matters/:matterId/chat/conversations/:id` | Soft delete |
| POST | `/matters/:matterId/chat/messages/:id/save-to-notes` | Save an answer with citations intact |
| POST | `/matters/:matterId/chat/messages/:id/flag` | Report a wrong answer (feeds evals) |
| GET | `/matters/:matterId/chat/suggestions` | Case-specific example questions |

**Answer response:**
```jsonc
{ "data": {
    "message_id": "msg_…",
    "abstained": false,
    "direct_answer": "Two statements in your documents are relevant, and they differ as to timing.",
    "assertions": [ /* assertion collection with verified citations only */ ],
    "not_established_groups": [],
    "caveats": ["The January email may refer to a different transfer."],
    "refusal": null,
    "retrieval": { "spans_considered": 47, "spans_used": 4, "reranked": true },
    "cost": { "estimated_cents": 4 }
  } }
```

**Abstention response:**
```jsonc
{ "data": {
    "abstained": true,
    "direct_answer": "The uploaded case materials do not establish who attended the 4 June meeting.",
    "assertions": [],
    "not_established_groups": [ { "subject": "attendees of the 4 June meeting",
                                  "reason": "NO_SUPPORTING_EVIDENCE",
                                  "nearest_supported": [ /* assertion refs */ ] } ],
    "refusal": null } }
```

**Refusal response (legal advice):**
```jsonc
{ "data": {
    "abstained": true, "assertions": [],
    "refusal": {
      "kind": "LEGAL_ADVICE",
      "message": "I can't tell you what your legal position is or what you should do — that's your lawyer's role. What I can do is show you what your documents say.",
      "offers": [ { "label": "Show the evidence about this", "action": "search" },
                  { "label": "Add this to my questions for my lawyer", "action": "add_question" } ] } } }
```

**Enforced:** the response schema has no field capable of carrying an uncited assertion. There is
no `answer_text` field. This is the API expressing the guarantee.

### 3.12 `/evidence` — citations

| Method | Path | Responsibility |
|---|---|---|
| GET | `/evidence/:citationId` | Citation metadata + signed page render URL + highlight offsets |
| POST | `/evidence/:citationId/verify` | Re-run Tier 1 (and optionally Tier 2) |
| POST | `/evidence/:citationId/flag` | Flag as misattributed with a reason |
| GET | `/evidence/:citationId/context` | Surrounding paragraph/page text for context |
| POST | `/assertions/:assertionId/corrections` | Record a correction |
| GET | `/assertions/:assertionId/corrections` | Correction history |
| POST | `/assertions/:assertionId/corrections/:id/revert` | Supersede a correction |
| GET | `/assertions/:assertionId/revisions` | Full version history |
| GET | `/assertions/:assertionId` | Assertion with full provenance |

**`GET /evidence/:citationId` returns a signed, short-lived render URL** — never a permanent
object URL — and logs access when the document is privileged.

### 3.13 `/review` — review queue

| Method | Path | Responsibility |
|---|---|---|
| GET | `/matters/:matterId/review` | Impact-ordered queue; filter by `kind`, `confidence`, `impact` |
| GET | `/matters/:matterId/review/counts` | Counts by kind and state |
| POST | `/matters/:matterId/review/items` | Batch dispositions (body: items + disposition + optional reason) |
| GET | `/matters/:matterId/review/position` | Resume cursor |
| PUT | `/matters/:matterId/review/position` | Save resume cursor |

Batch disposition returns per-item results and **records one audit entry per item**, not one for
the batch. A bulk "adopt 200 items" must be individually accountable.

### 3.14 `/narrative` — story builder

| Method | Path | Responsibility |
|---|---|---|
| GET | `/matters/:matterId/narrative` | Current narrative with sections and provenance |
| POST | `/matters/:matterId/narrative/interview/start` | Start a guided interview session |
| GET | `/matters/:matterId/narrative/interview/:sessionId` | Current question, progress, prior answers |
| POST | `/matters/:matterId/narrative/interview/:sessionId/answers` | Submit an answer (`USER_STATEMENT`) |
| POST | `/matters/:matterId/narrative/interview/:sessionId/skip` | Skip |
| POST | `/matters/:matterId/narrative/draft` | Generate a draft from answers + cited evidence |
| PATCH | `/matters/:matterId/narrative/sections/:id` | Edit; creates a revision |
| POST | `/matters/:matterId/narrative/lock` | Lock a final version |
| POST | `/matters/:matterId/narrative/fork` | Fork the locked version into a new draft |
| GET | `/matters/:matterId/narrative/versions` | Version history |

**`POST …/draft` response** carries, for every generated passage, `provenance: [{kind:
'user_words'|'citation', ref}]`. A passage with no provenance is a bug, and the schema requires
the array to be non-empty.

### 3.15 `/reports` — Lawyer Brief and exports

| Method | Path | Responsibility |
|---|---|---|
| POST | `/matters/:matterId/reports` | Create a brief definition (sections, mode, inclusions) |
| GET | `/matters/:matterId/reports/:id` | Status, verification summary, page count estimate |
| POST | `/matters/:matterId/reports/:id/preview` | Preview verification summary before export |
| GET | `/matters/:matterId/reports/:id/versions` | Versions with their verification metadata |
| POST | `/matters/:matterId/reports/:id/export` | Render to PDF/DOCX/HTML; returns a job |
| GET | `/matters/:matterId/reports/:id/export/:exportId` | Signed download URL |
| POST | `/matters/:matterId/reports/:id/share` | Create a scoped expiring share link |
| GET | `/matters/:matterId/share-links` | List |
| DELETE | `/matters/:matterId/share-links/:id` | Revoke |
| POST | `/matters/:matterId/export` | Full matter export (F42) |

**`POST …/export` preconditions:** if `matter.require_review_before_export` is true and unreviewed
assertions exist, the request requires `acknowledge_unverified: true` in the body. Without it, the
endpoint returns `412 PRECONDITION_FAILED` listing the unreviewed count. **The verification gate is
server-enforced, not a UI nicety.**

### 3.16 `/graph` — relationships

| Method | Path | Responsibility |
|---|---|---|
| GET | `/matters/:matterId/graph` | Graph payload for a focus node, depth, and edge-type filter |
| GET | `/matters/:matterId/graph/edges/:id` | Edge with supporting evidence |
| GET | `/matters/:matterId/graph/table` | **The accessible tabular equivalent** |
| POST | `/matters/:matterId/graph/suggestions/:id/confirm` | Confirm an AI-suggested relationship |
| POST | `/matters/:matterId/graph/suggestions/:id/reject` | |

Graph responses include an explicit cap notice when aggregation is applied
(`"aggregated": true, "hidden_node_count": 412`), so a user is never misled about completeness.

### 3.17 `/admin` and `/health`

| Method | Path | Responsibility |
|---|---|---|
| GET | `/healthz` | Liveness (no auth, no DB dependency) |
| GET | `/readyz` | Readiness: DB, storage, queue, provider reachability |
| GET | `/api/v1/meta` | API version, feature flags for the actor, provider policy state |
| GET | `/admin/jobs` | Queue depths, failure rates (admin only) |
| POST | `/admin/jobs/:id/retry` | Retry a stalled job |
| GET | `/admin/audit/verify` | Verify the audit hash chain; report the first divergence |

---

## 4. Streaming

| Endpoint | Protocol | Purpose |
|---|---|---|
| `GET /matters/:id/processing/stream` | SSE | Live per-document processing state |
| `POST /matters/:id/chat` | SSE (when `Accept: text/event-stream`) | Token streaming **for the direct answer only** |

**Critical streaming rule:** token streaming may only emit the `direct_answer` field. Assertions,
citations, and verification results are emitted in a **final, complete event after verification
completes.** There is no path by which a streamed token can render a claim before it has been
verified. Clients must render the streamed text as provisional and replace it with the verified
answer on the `answer_complete` event.

This is a deliberate design constraint. It is the one place where a naive implementation would
break the product's core guarantee.

---

## 5. Webhooks (Phase 3+)

`POST` to subscriber URLs on `document.ready`, `document.failed`, `report.completed`,
`matter.deleted`. Signed with HMAC-SHA256 over the raw body with a per-subscriber secret,
timestamped to prevent replay, retried with exponential backoff, and delivered **without case
content** — payloads carry IDs, and the subscriber fetches content through the API with its own
credentials.

---

## 6. API acceptance tests

| # | Test | Pass condition |
|---|---|---|
| 1 | Cross-tenant read of every resource type | 404 for all; no existence disclosure |
| 2 | Cross-tenant write | 404; nothing created |
| 3 | Privileged document read without capability | 404/403 per policy; security event logged |
| 4 | Every list endpoint with `limit=10000` | Rejected or capped; never unbounded |
| 5 | Every response containing a claim | Citation present and resolvable |
| 6 | Suppressed assertion retrieval | Never in `assertions`; only under the explicit include flag |
| 7 | `POST` without `Idempotency-Key` on money-spending endpoints | 400 |
| 8 | Duplicate `Idempotency-Key` | Same result returned, no second charge |
| 9 | Export with unreviewed assertions and no acknowledgement | 412 with the count |
| 10 | Chat with a legal-advice question | Refusal schema; zero assertions |
| 11 | Chat with an unanswerable question | Abstention schema; `not_established_groups` non-empty |
| 12 | Search snippet sanitisation | No markup other than `<mark>`; injection payload escaped |
| 13 | Error responses | No stack traces, paths, provider names, or case content |
| 14 | Audit writes from every mutation | Entry present; no content fields |
| 15 | Pagination cursor stability | No duplicates or skips across a full traversal during concurrent writes |
| 16 | `PATCH` without `If-Match` on a versioned resource | 412 |
| 17 | Concurrent conflicting `PATCH` | 409 with the current version |
| 18 | Rate limit exceeded | 429 with `Retry-After`; no partial side effects |
| 19 | SSE stream | Never emits assertion content before verification completes |
| 20 | Share link scope | Enumerating outside the scope returns 404 |

---

## Related documents

- `10-database-schema.md` — the resources exposed
- `09-evidence-provenance.md` — the assertion collection contract in §3.9
- `07-ai-architecture.md` — the pipeline behind `/chat`
- `12-security-architecture.md` — auth, permissions, rate limiting
- `16-testing-strategy.md` — the API test suite
- `epics/` — implementable task breakdown
