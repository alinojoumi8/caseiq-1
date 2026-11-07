---
title: Case IQ — Architecture Decisions
status: draft
owner: Architecture
last_updated: 2026-02-14
version: 1.0
---

# 24 — Architecture Decisions

Architecture Decision Records (ADRs). Each records the **decision**, the **alternatives
considered**, the **reason**, the **trade-offs accepted**, the **risk**, and **whether it is
reversible**.

**Reversibility key:**
- 🟢 **Easy** — a bounded change to one module
- 🟡 **Moderate** — a migration with a dual-write or backfill period
- 🔴 **Hard** — a rewrite of a subsystem, or a change that affects stored data semantics

**Status:** `accepted` · `proposed` · `superseded` · `revisit-at-scale`

---

## Index

| ADR | Decision | Reversibility |
|---|---|---|
| [001](#adr-001) | Modular monolith in TypeScript, not microservices | 🔴 Hard |
| [002](#adr-002) | Next.js App Router as the single web + API deployment | 🟡 Moderate |
| [003](#adr-003) | REST over tRPC/GraphQL | 🟢 Easy |
| [004](#adr-004) | PostgreSQL as the single primary datastore | 🔴 Hard |
| [005](#adr-005) | AI provider abstraction with two providers integrated | 🟢 Easy |
| [006](#adr-006) | pgvector, not a dedicated vector database | 🟡 Moderate |
| [007](#adr-007) | No graph database; relational edges in PostgreSQL | 🟢 Easy |
| [008](#adr-008) | AI roles as bounded configurations, not autonomous agents | 🟢 Easy |
| [009](#adr-009) | pg-boss for the job queue, not Redis or a workflow engine | 🟡 Moderate |
| [010](#adr-010) | Drizzle ORM, not Prisma | 🟡 Moderate |
| [011](#adr-011) | Direct-to-storage presigned uploads with post-hoc verification | 🟢 Easy |
| [012](#adr-012) | Row-level security as a second authorisation layer | 🔴 Hard |
| [013](#adr-013) | Self-hosted authentication | 🟡 Moderate |
| [014](#adr-014) | App on Vercel, workers on a container host | 🟡 Moderate |
| [015](#adr-015) | One-command local development with a deterministic fake AI provider | 🟢 Easy |
| [016](#adr-016) | No field-level encryption of extracted case text | 🔴 Hard (to add later) |
| [017](#adr-017) | Backup retention is disclosed, not denied | 🟢 Easy |
| [018](#adr-018) | Hybrid text extraction: native first, local OCR, cloud OCR opt-in | 🟢 Easy |
| [019](#adr-019) | Citation by index into a system-supplied bundle | 🔴 Hard |
| [020](#adr-020) | Two-tier citation verification | 🟡 Moderate |
| [021](#adr-021) | Confidence as an ordinal rule-derived scale, not a probability | 🔴 Hard |
| [022](#adr-022) | Assertion classes as an immutable, database-constrained enumeration | 🔴 Hard |
| [023](#adr-023) | Append-only `ai_extractions`; corrections are additive | 🔴 Hard |
| [024](#adr-024) | Defer the financial module to Phase 3 pending balance verification | 🟢 Easy |
| [025](#adr-025) | Defer the contradiction engine to Phase 2 | 🟢 Easy |
| [026](#adr-026) | Build the Lawyer Brief in the MVP; cut AI chat before it | 🟢 Easy |
| [027](#adr-027) | Object Lock / WORM for originals | 🟡 Moderate |
| [028](#adr-028) | Hash-chained audit log with content-free records | 🟡 Moderate |
| [029](#adr-029) | No audio/video transcription until a separate privacy review | 🟢 Easy |
| [030](#adr-030) | Streaming may not emit unverified assertions | 🟢 Easy |

---

<a id="adr-001"></a>
## ADR-001 — Modular monolith in TypeScript, not microservices

**Status:** accepted · **Reversibility:** 🔴 Hard

**Decision.** Build Case IQ as a single deployable application with enforced internal module
boundaries, plus one separately deployable worker process.

**Alternatives considered.**
1. Microservices (ingestion, search, AI, reporting as separate services)
2. Separate Python service for the AI/ML pipeline alongside a TypeScript app
3. Fully serverless function-per-endpoint

**Reason.**
- The founder is not primarily an engineer and the system will largely be built by AI coding
  agents. Each additional service multiplies the operational surface: deployment, networking,
  secrets, observability, local development, and inter-service versioning.
- The one genuinely different workload profile — CPU-heavy, long-running OCR — is isolated by the
  **worker process**, which achieves the practical benefit of service separation without a service
  mesh.
- A single language keeps one type contract from database to UI. With Zod schemas shared between
  server validation and client types, a schema change is a compile error rather than a runtime
  surprise — which matters enormously when AI agents are writing the code.
- A Python service was rejected because we consume models through APIs rather than training them,
  so Python's ML ecosystem advantage does not apply, while splitting the type contract does apply.

**Trade-offs accepted.** No independent scaling per module (mitigated by stateless app instances
plus separate worker pools). A large codebase in one repo (mitigated by enforced module boundaries
and a CI boundary check). Deployment is all-or-nothing (acceptable at this scale).

**Risk.** Module boundaries decay over time, producing a tangled monolith. Mitigated by an ESLint
boundary rule plus a CI check that a module cannot import another module's tables directly.

**Revisit when.** A module has genuinely divergent scaling, compliance, or release-cadence needs —
most plausibly the OCR fleet, which is already separate.

---

<a id="adr-002"></a>
## ADR-002 — Next.js App Router as the single web + API deployment

**Status:** accepted · **Reversibility:** 🟡 Moderate

**Decision.** Next.js (App Router) serves both the UI and the REST API from one deployment.

**Alternatives considered.** Separate SPA + API service; Remix; SvelteKit; Astro + API.

**Reason.** Server Components keep data-heavy screens out of the client bundle; route handlers give
us the API without a second deployment; the framework is the best-documented and most AI-agent-legible
option in the React ecosystem; and Vercel's build and preview workflow removes real operational
burden.

**Trade-offs accepted.** Vendor-shaped conventions; serverless execution limits make it unsuitable
for the worker tier (hence ADR-014).

**Risk.** Framework churn. Mitigated by keeping the API in route handlers with explicit Zod
contracts, so a future frontend rewrite does not touch the API.

**Revisit when.** The API needs to be consumed by clients that Next.js serves poorly, or hosting
costs become disproportionate.

---

<a id="adr-003"></a>
## ADR-003 — REST over tRPC/GraphQL

**Status:** accepted · **Reversibility:** 🟢 Easy

**Decision.** REST with Zod-validated request/response schemas, generating an OpenAPI document.

**Alternatives considered.** tRPC; GraphQL; server actions only.

**Reason.**
- **REST** is testable with `curl`, inspectable in an incident, consumable by a future CLI or partner
  integration, and produces an OpenAPI document that AI coding agents implement against accurately.
- **tRPC** couples client and server types in a way that becomes a liability the moment a non-Next.js
  consumer exists, and produces less inspectable production errors.
- **GraphQL** makes permission enforcement and query-cost bounding harder — the wrong trade for a
  system where a missed check leaks privileged material.
- **Server actions only** would leave no stable external contract and would make API-level security
  testing harder.

**Trade-offs accepted.** More boilerplate than tRPC; no field-level client selection (mitigated by a
`fields` parameter on large resources).

**Risk.** Low.

---

<a id="adr-004"></a>
## ADR-004 — PostgreSQL as the single primary datastore

**Status:** accepted · **Reversibility:** 🔴 Hard

**Decision.** One PostgreSQL instance holds relational data, full-text search, vectors, and graph
adjacency.

**Alternatives considered.** Postgres + a vector DB + a graph DB + Elasticsearch; Postgres + Redis
for cache and queue; a document database.

**Reason.** **The product's core promise is consistency of provenance.** If text lives in Postgres,
vectors in a vector store, and graph edges in a graph database, then every deletion, permission
change, and correction becomes a distributed-consistency problem — and the failure modes are exactly
the ones the red-team analysis identifies: "deleted files remain in embeddings", "a citation points
at a document the user can no longer see", "search returns a snippet from a forbidden document".

One transactional store makes these guarantees **structural**. Deleting a chunk deletes its
embedding in the same transaction. A permission filter is part of the similarity query. A citation
cannot reference a page that does not exist. This is worth more than the incremental performance of
a specialised engine at our scale.

Secondary reasons: one backup story, one access model, one thing to explain in a security review,
and no synchronisation job that can silently drift.

**Trade-offs accepted.** pgvector's HNSW is slower than a purpose-built vector engine at very large
scale. Postgres full-text is less capable than Elasticsearch for advanced relevance tuning. Neither
matters below roughly 10⁷ chunks and 10⁶ edges.

**Risk.** A single database is a single scaling and availability boundary. Mitigated by managed
multi-AZ Postgres, PITR, read replicas for read-heavy paths, partitioning when needed, and a
documented scaling path in `06-system-architecture.md` §7.

**Revisit when.** Measurements — not speculation — show a genuine bottleneck. The order is:
tune indexes → partition → read replicas → dedicated search index as a *derived* store → dedicated
vector store. **The system of record stays Postgres at every step.**

---

<a id="adr-005"></a>
## ADR-005 — AI provider abstraction with two providers integrated

**Status:** accepted · **Reversibility:** 🟢 Easy

**Decision.** All model access goes through one abstraction module. Two providers are integrated
before launch. No other module imports a vendor SDK.

**Alternatives considered.** Direct SDK use; a single provider; an LLM gateway product;
self-hosted open models only.

**Reason.**
- **Tier 2 verification requires an independent model.** Same-model self-verification shares blind
  spots; the entire value of verification depends on independence.
- **Resilience.** A provider outage must degrade the product, not stop it.
- **Negotiating position.** A single-provider architecture is a single-vendor dependency for a
  product whose primary cost is inference.
- **Data-policy flexibility.** Provider terms on retention, training, residency, and subprocessors
  differ and change. A matter-level policy must be enforceable against whichever provider is used.
- **Model churn.** Model versions change under fixed names; a pinned-version abstraction makes a
  model swap an explicit migration rather than a silent behaviour change.

**Trade-offs accepted.** An abstraction layer adds indirection and inevitably lags provider-specific
features (prompt caching variants, batch APIs, novel structured-output modes). Mitigated by an
escape hatch for provider-specific capabilities behind a capability flag.

**Risk.** The abstraction becomes a lowest-common-denominator layer that prevents using a
provider's best feature. Mitigated by exposing capabilities explicitly rather than hiding them.

---

<a id="adr-006"></a>
## ADR-006 — pgvector, not a dedicated vector database

**Status:** accepted · **Reversibility:** 🟡 Moderate

**Decision.** Store embeddings in `document_chunks.embedding` using pgvector with an HNSW index.

**Alternatives considered.** Pinecone, Qdrant, Weaviate, Milvus, Chroma; a separate Postgres with
pgvector; faiss in-process.

**Reason.**
- **Permission-aware vector search is a security requirement.** Filtering by matter, role, and
  document sensitivity must happen *inside* the similarity query. If it happens after retrieval, a
  user can receive fewer results than `k` for legitimate queries, and — worse — result counts and
  rankings can leak the existence of documents they cannot see. In SQL this is a `WHERE` clause. In a
  separate vector store it is either a fragile metadata filter or a post-filter.
- **Transactional consistency.** A chunk and its vector are written and deleted together. There is no
  window in which a deleted document's embedding is still retrievable.
- **No dual-write.** There is no synchronisation job to fail, drift, or leak.
- One backup, one access model, one encryption story.

**Trade-offs accepted.** HNSW build time and index size on Postgres; recall tuning is less
sophisticated than purpose-built engines; very large corpora need partitioning.

**Risk.** Vector search latency degrades as a matter grows. Mitigated by partitioning
`document_chunks` by matter or hash, HNSW parameter tuning, and measuring before migrating.

**Revisit when.** p95 vector search exceeds ~500ms at scale, or chunk counts exceed ~5×10⁶. Migration
is moderate because chunk text (the system of record) stays in Postgres regardless.

---

<a id="adr-007"></a>
## ADR-007 — No graph database; relational edges in PostgreSQL

**Status:** accepted · **Reversibility:** 🟢 Easy

**Decision.** Model relationships as `entity_relationships` and `transactions` rows; traverse with
recursive CTEs, depth-capped.

**Alternatives considered.** Neo4j, Memgraph, Apache AGE, a materialised transitive-closure table.

**Reason.** The queries this product actually needs are **bounded, shallow traversals**: "who is
connected to X within two hops", "trace funds forward up to N hops", "what documents link these two
people", "what connects to this allegation". Legal entity graphs are **small** — hundreds to low
thousands of nodes per matter — because a matter involves a finite cast of parties, witnesses, and
companies.

Against that workload, a dedicated graph database would add: a second datastore, a second
permission model, a second backup and restore story, a second place where deleted data can survive,
a second thing to explain in a security review, and a cross-database consistency problem between
edges and the assertions that evidence them.

**Critically:** every edge in this product carries a mandatory `assertion_id` (evidence). Enforcing
"no edge without evidence" is a foreign-key constraint in Postgres and an application invariant in a
graph database. The relational model enforces it structurally.

**Trade-offs accepted.** Deep or variable-length traversals (5+ hops across a large graph) are slower
and more awkward in SQL. Mitigated by depth caps, indexes on both edge endpoints, and — if needed
first — a materialised transitive-closure table, which is a Postgres-native answer to most of the
problem.

**Revisit when.** A matter regularly exceeds ~50,000 entities with deep-traversal analysis, or graph
queries dominate p95 latency. Migration is clean because relationships are already an edge table.

---

<a id="adr-008"></a>
## ADR-008 — AI roles as bounded configurations, not autonomous agents

**Status:** accepted · **Reversibility:** 🟢 Easy

**Decision.** Implement the nine proposed "agents" as **roles** — a
`(prompt, schema, model tier, retrieval strategy)` tuple invoked by a deterministic orchestrator. No
autonomous agent loops, no inter-agent negotiation, no self-directed planning.

**Alternatives considered.** Autonomous multi-agent collaboration; a planner-executor architecture;
an agent framework with tool use; a single monolithic prompt.

**Reason.**
1. **Error compounding.** A pipeline of five stages each at 95% accuracy yields ~77% end-to-end.
   Accuracy multiplies down in a chain, and adding stages with feedback loops does not reliably
   recover it.
2. **Cost and latency non-determinism.** For a product with a per-matter cost ceiling, an agent that
   decides how many steps to take is a business risk as well as a technical one.
3. **Reproducibility.** A legal work product must be reproducible. "The agent chose a different path
   this time" is unacceptable for a chronology a lawyer relies on.
4. **Auditability.** "Which model and prompt produced this?" must have exactly one answer.
5. **The accuracy benefit people seek from multi-agent systems is independent verification** — and
   we get that properly, from a purpose-built verifier on a different model (ADR-020). That is the
   part worth having.
6. **Debuggability.** A linear, observable pipeline can be debugged by a solo founder. An emergent
   multi-agent trace cannot.

**Where genuine decomposition is used.** The Lawyer Brief is composed in explicit, sequential,
section-scoped stages — bounded context, better quality, and an observable failure point per
section. That is decomposition, not autonomy.

**Where model-driven control IS used.** A single-hop query router that selects a retrieval strategy
and answer shape from a **closed enumeration**. That is a four-output classifier, not a planner.

**Trade-offs accepted.** Less flexibility for problems that genuinely need iterative reasoning.
Mitigated by allowing, where warranted, a bounded retry with a different strategy — with the retry
count fixed, not model-decided.

**Risk.** The roles become too rigid for a future complex task. Mitigated by the fact that adding a
role is cheap and does not change the orchestration model.

---

<a id="adr-009"></a>
## ADR-009 — pg-boss for the job queue, not Redis or a workflow engine

**Status:** accepted · **Reversibility:** 🟡 Moderate

**Decision.** Use pg-boss, a PostgreSQL-backed job queue, with job tables in the same database.

**Alternatives considered.** BullMQ + Redis; SQS/Cloud Tasks; Temporal; Restate; Inngest;
Trigger.dev; a custom `jobs` table with a polling worker.

**Reason.**
- **Transactional enqueue.** A job is enqueued in the **same transaction** as the business write
  that justifies it. There is no window in which a document exists but its processing job does not,
  and no dual-write problem between a database and a queue.
- **No extra service.** No Redis to operate, secure, patch, back up, monitor, or explain to a
  buyer's security reviewer. For a solo non-engineer founder, this is a large operational saving.
- **At-least-once delivery, retries with backoff, dead-letter, singletons, and scheduled jobs** are
  all built in — which is exactly the feature set a linear stage pipeline needs.
- **Temporal/Restate/Inngest** offer genuine durable-execution benefits but introduce a workflow
  definition programming model, a separate service, and a workflow-versioning discipline. Our
  pipeline is a linear sequence of retryable stages; a task queue handles it once stages are
  individually idempotent, which they must be anyway.

**Trade-offs accepted.** Queue load lands on the primary database. Mitigated by: payloads carrying
IDs rather than content (small rows), a separate tablespace if needed, `LISTEN/NOTIFY` instead of
tight polling, and an archive job pruning completed jobs.

**Critical implementation rule.** Every handler must be idempotent, and every handler that spends
money must be guarded by an idempotency key derived from
`hash(input) + roleId + promptVersion`, recorded in `ai_extraction_runs` with a `UNIQUE` constraint.
**This single constraint is what makes retries free and prevents a crash from double-charging a
user.**

**Revisit when.** Queue throughput saturates the database, or a workflow genuinely requires
multi-day timers with compensation logic.

---

<a id="adr-010"></a>
## ADR-010 — Drizzle ORM, not Prisma

**Status:** accepted · **Reversibility:** 🟡 Moderate

**Decision.** Drizzle ORM for schema definition, queries, and migrations.

**Alternatives considered.** Prisma; Kysely; TypeORM; raw SQL with a query builder; `postgres.js`
with hand-written SQL.

**Reason.** This product's correctness and performance depend on database features that a high-level
ORM abstracts away or actively obstructs:

| Feature | Why it matters here | Drizzle | Prisma |
|---|---|---|---|
| Row-level security session context | Tenant isolation | `SET LOCAL` in a transaction | Fights connection lifecycle |
| `tsvector` generated columns + GIN | Legal keyword search | Native | Limited |
| `pgvector` operators (`<=>`, HNSW) | Semantic search | Native | Limited |
| Recursive CTEs | Graph traversal | Native | Raw escape hatch |
| `numeric` money handling | Never float | Native | Decimal, workable |
| Reviewable SQL migrations | RLS policies in migrations | SQL files | Schema DSL |
| Partial and expression indexes | Performance | Native | Limited |

A secondary and non-trivial benefit: Drizzle is SQL-first, so the queries it generates are
inspectable and close to what a developer would write. When an AI coding agent is writing queries,
that correspondence reduces the chance of a subtly wrong query that still passes tests.

**Trade-offs accepted.** Less polished DX and a smaller ecosystem than Prisma; more SQL knowledge
required. Given that the product's hardest requirements are SQL-shaped, this is the right trade.

**Risk.** Drizzle's API is younger and changes faster. Mitigated by locking the version and pinning
the upgrade cadence.

---

<a id="adr-011"></a>
## ADR-011 — Direct-to-storage presigned uploads with post-hoc verification

**Status:** accepted · **Reversibility:** 🟢 Easy

**Decision.** Browsers upload directly to object storage via presigned multipart URLs. The
application server issues credentials and verifies the result afterwards.

**Alternatives considered.** Proxying uploads through the application server; a dedicated upload
service; client-side chunking to the app.

**Reason.** Multi-gigabyte uploads must not transit the application server: it wastes bandwidth,
consumes memory, creates request-timeout surface, and doubles egress cost. Direct upload also makes
resumability straightforward.

**Security consequence — explicitly accepted.** Because the app server does not see the bytes, the
contract must be verified *after* upload:

1. `HEAD` the object: existence, exact size.
2. Compare the server-computed SHA-256 against the client-declared value. **A mismatch rejects the
   upload, logs an audit entry, and deletes the object.**
3. The object lands in `quarantine/`, is malware scanned, and is **only then** promoted to
   `originals/` with Object Lock.
4. **Nothing parses an unscanned file.**
5. Presigned URLs are short-lived (≤15 min), single-object, size-constrained, and content-type
   constrained.

**Risk.** A malicious client could upload a file whose declared checksum differs from the content.
Mitigated by server-side re-hashing on upload and again in the worker before parsing.

---

<a id="adr-012"></a>
## ADR-012 — Row-level security as a second authorisation layer

**Status:** accepted · **Reversibility:** 🔴 Hard

**Decision.** Every matter-scoped table has `ENABLE ROW LEVEL SECURITY` **and**
`FORCE ROW LEVEL SECURITY` with tenant, sensitivity, and ACL policies. Application-layer capability
checks remain the first layer.

**Alternatives considered.** Application-layer checks only; a schema-per-tenant model;
database-per-tenant; an ORM middleware that injects filters.

**Reason.** Application-layer authorisation is where bugs live. For a multi-tenant system holding
privileged legal material across three dimensions of access (tenant, matter membership, document
sensitivity), a single missing check is a catastrophic disclosure. RLS converts a handler bug from a
breach into an empty result set.

`FORCE` is essential: without it, the table owner bypasses every policy, which is a commonly missed
misconfiguration that silently disables the entire control.

**Trade-offs and costs, accepted knowingly.**
- Every request and job must establish session context, adding a connection round-trip.
- **Connection pooling is a real trap.** `SET` (session-level) persists across pooled connections,
  meaning request B can inherit request A's tenant context. Mitigations: `SET LOCAL` only, inside an
  explicit transaction; transaction pooling only (never statement pooling); `DISCARD ALL` on release;
  and a dedicated regression test that checks out a connection with no context and asserts zero rows.
- `FORCE RLS` applies to the table owner, so the migration path needs care.
- Testing requires explicit tenant contexts everywhere.
- Performance: RLS adds a predicate to every query, requiring indexes leading with `matter_id`.

**Risk.** The pooling trap is subtle enough that it could ship unnoticed. It is therefore covered by
a named regression test from Phase 1, before there is data to leak.

**Revisit.** Not reversible without re-architecting isolation; the cost of building it later into a
populated schema is the reason it is Phase 1.

---

<a id="adr-013"></a>
## ADR-013 — Self-hosted authentication

**Status:** accepted · **Reversibility:** 🟡 Moderate

**Decision.** Authentication is implemented with an audited TypeScript auth library, with credentials
and sessions stored in **our** PostgreSQL database. No third-party auth vendor by default.

**Alternatives considered.** Clerk; Auth0; Supabase Auth; Firebase Auth; WorkOS.

**Reason.**
1. **Privacy.** Auth-as-a-service vendors process user identifiers, emails, IP addresses, and login
   metadata. For a product whose entire pitch is that legal data stays under control, exporting
   identity data to a third party is an avoidable disclosure and an extra subprocessor to disclose,
   contract with, and explain.
2. **Revocation control.** Opaque sessions in our own database make immediate revocation trivial. A
   vendor's session model constrains how quickly access can actually be removed.
3. **Cost.** Per-MAU pricing on an auth vendor is a real cost line for a consumer product with many
   low-value accounts.
4. **Residency.** Keeping identity in our database means it lives in the same region as the case data.
5. **The hard parts are library features.** MFA/TOTP, passkeys, OAuth, and password reset are solved
   problems in mature libraries. Rolling our own *cryptography* would be reckless; using a library
   for session management is not.

**Trade-offs accepted.** We own the security of the auth path — a genuine responsibility. Mitigated
by using a well-audited library, following OWASP ASVS authentication guidance, commissioning
penetration testing of the auth surface specifically, and keeping the implementation deliberately
conventional (Argon2id, opaque sessions, TOTP).

**Risk.** An auth vulnerability is a Sev-1. Mitigated by peer review, external testing, and a
deliberately small implementation surface with no custom cryptography.

**Revisit when.** Enterprise sales require SSO/SAML/SCIM at a scale where building it is
uneconomic — at which point a hybrid (self-hosted core + a federation broker) is the likely answer.

---

<a id="adr-014"></a>
## ADR-014 — App on Vercel, workers on a container host

**Status:** accepted · **Reversibility:** 🟡 Moderate

**Decision.** The Next.js application deploys to Vercel. The worker process runs as a long-lived
container on a container host (Fly.io, Railway, Render, or AWS ECS Fargate) in a chosen region.

**Alternatives considered.** Everything on Vercel with background functions; everything on a single
container host; AWS with ECS/Lambda; Kubernetes.

**Reason.** Document processing is fundamentally incompatible with a serverless execution model:

| Requirement | Serverless reality |
|---|---|
| OCR of a 1,200-page document | Minutes of CPU; function limits and no persistent CPU |
| Large-file streaming | Memory and duration limits |
| Sustained outbound LLM calls with retries | Execution time windows |
| Long-lived DB connections with `SET LOCAL` | Connection churn; pooling conflicts with RLS |
| Predictable cost | Per-invocation billing on a CPU-heavy workload is hard to forecast |

The app tier is a genuinely good fit for Vercel (static + server rendering, preview deployments, CDN,
zero ops). The worker tier is a genuinely bad fit. **Splitting them is the smallest change that makes
the architecture fit the workload.**

**Trade-offs accepted.** Two deployment targets and two sets of secrets to manage. Mitigated by
infrastructure-as-code, a shared config module, and a single CI pipeline deploying both.

**Risk.** Configuration drift between app and worker. Mitigated by one shared config package with
boot-time validation, and by the worker failing fast on invalid configuration.

---

<a id="adr-015"></a>
## ADR-015 — One-command local development with a deterministic fake AI provider

**Status:** accepted · **Reversibility:** 🟢 Easy

**Decision.** `docker compose up` brings up Postgres+pgvector, MinIO, Mailpit, ClamAV, the app, and
the worker. A **deterministic fake AI provider** (`AI_PROVIDER=fake`) is a first-class supported mode
that returns schema-valid, input-hash-derived output with no network access.

**Alternatives considered.** Requiring real API keys for development; mocking at the test layer only;
a shared staging environment as the development target.

**Reason.**
- **The founder must be able to run the whole system** without cloud accounts or a billing
  relationship. This is a hard requirement, not a convenience.
- **Tests become free, fast, deterministic, and offline.** CI needs no secrets, no rate-limit
  handling, and no cost budget. A test suite that calls a real model is slow, flaky, and expensive,
  and will therefore be run less often.
- **AI-dependent development is unblocked.** Feature work on the timeline, review queue, and brief
  does not wait for a provider decision.
- **Reproducibility.** A deterministic provider makes failures reproducible in a way a real model
  never is.

**Trade-offs accepted.** The fake provider can drift from real provider behaviour. Mitigated by a
separate opt-in "live" suite (see `17-ai-evaluation-framework.md` §9) that runs against real providers
on a schedule, plus contract tests that assert the fake satisfies the same interface.

**Risk.** A developer tests only against the fake and is surprised by real model behaviour. Mitigated
by the live suite running on every prompt change before merge.

---

<a id="adr-016"></a>
## ADR-016 — No field-level encryption of extracted case text

**Status:** accepted · **Reversibility:** 🔴 Hard to add later

**Decision.** Extracted text, page text, chunks, and quoted evidence are **not** field-level
encrypted. Column-level encryption is applied only to genuinely secrets-only fields: MFA secrets,
OAuth tokens, and account numbers (which are stored masked plus a salted hash, not encrypted).

**Alternatives considered.** Encrypting extracted text per matter with a KMS data key; a
searchable-encryption scheme; per-tenant database encryption; client-side encryption with keys the
user holds.

**Reason.** Any field-level scheme for text that must be **searched, embedded, reranked, quoted, and
sent to a model** must decrypt for essentially every operation. The benefit therefore reduces to
"encrypted while the database is at rest" — which the volume-level encryption already provides. What
it *adds* is: key management complexity, broken full-text and vector queries, a decryption step on
every retrieval, the need for an encrypted search index (which reintroduces the leak it was meant to
prevent), and a substantial risk of a bug that corrupts or loses a user's extracted text.

**Critically, it would also undermine the core guarantee.** Quote verification, citation resolution,
and permission-filtered retrieval all operate on the text. A scheme that makes those harder makes
unsupported assertions *more* likely, which is the failure mode the product exists to prevent.

**What we do instead.** Layer the controls that actually apply: RLS, least-privilege roles, network
isolation, no standing production access, provider-managed encryption at rest, field-level encryption
for true secrets, append-only audit logging, and (Phase 4) per-tenant database or schema separation.

**Risk accepted and disclosed.** A database-level compromise or a stolen volume with valid
credentials exposes case text. Mitigated by access control, monitoring, and the assumption that
perimeter defence is the right layer for this data.

**Revisit when.** A firm contract or regulation requires **customer-managed keys for case content**.
The correct answer then is **per-tenant database or schema-level keys**, not per-field encryption.
Recorded here so the decision is not relitigated without new information.

---

<a id="adr-017"></a>
## ADR-017 — Backup retention is disclosed, not denied

**Status:** accepted · **Reversibility:** 🟢 Easy

**Decision.** Deletion receipts state the **backup purge window in days**. We do not claim instant
eradication from backups.

**Alternatives considered.** Claiming immediate deletion; attempting to purge backups synchronously;
excluding deleted content from backups.

**Reason.** Deleted content genuinely persists in backups until the backup window expires. Claiming
otherwise would be false, and a false deletion claim is a regulatory violation in several
jurisdictions and a straightforward trust breach if discovered. Synchronous backup purging is not
technically feasible with point-in-time recovery, and "exclude from backup" is not reliably
implementable at the row level.

**Trade-offs accepted.** Users are told deletion is not instantaneous in backups. This is honest and
survivable; the alternative is a false claim.

**Risk.** A user or regulator may find backup retention unacceptable. Mitigated by keeping the window
as short as operational requirements allow, stating it precisely, and making the PITR window
configurable for enterprise customers who require it.

---

<a id="adr-018"></a>
## ADR-018 — Hybrid text extraction: native first, local OCR, cloud OCR opt-in

**Status:** accepted · **Reversibility:** 🟢 Easy

**Decision.** Per page: use the embedded text layer when present; otherwise local Tesseract; fall
back to cloud OCR only when confidence is low **and** the matter's policy permits it.

**Alternatives considered.** Always OCR; always use a cloud OCR service; a single commercial document
AI platform for everything; Tesseract only.

**Reason.**
- **Never OCR a text-layer PDF.** OCR on perfect text introduces errors into text that was already
  correct. Born-digital gating is both a cost control and a quality control, and getting it wrong in
  the OCR direction actively makes the product worse.
- **Local by default preserves confidentiality.** Tesseract runs in our worker; no third party sees
  the document. Given that documents may contain privileged material and third-party personal
  information, this default matters.
- **Cloud OCR is materially better on poor scans, skew, and handwriting** — and the quality
  difference matters enormously when a digit in a dollar amount is at stake. So it is available, but
  gated by explicit per-matter policy because it means sending page images to a third party.
- **Per-page, not per-document.** Mixed documents (a scanned exhibit appended to a digital filing)
  are common, so the decision must be page-level.

**Trade-offs accepted.** Two OCR engines to maintain; policy gating adds configuration surface.
Mitigated by recording the engine and version on every page record so quality differences are
measurable.

**Risk.** Tesseract quality on poor scans produces bad text. Mitigated by page-level confidence
flagging, the coverage panel, the "upload a better copy" path, and the OCR badge that persists
through to every derived assertion and export.

---

<a id="adr-019"></a>
## ADR-019 — Citation by index into a system-supplied bundle

**Status:** accepted · **Reversibility:** 🔴 Hard

**Decision.** The generator cites by **integer index** into a numbered evidence bundle that the
system supplied. The system resolves indices to real citations. The model can never name a document,
a page number, or a URL.

**Alternatives considered.** Letting the model emit document names and page numbers; letting it emit
quoted text directly; retrieval-augmented generation with post-hoc citation matching; asking the
model to be careful.

**Reason.** This is the single most important structural decision in the AI architecture.

- **It makes a fabricated citation unrepresentable.** The model has no vocabulary for naming a source
  the system did not provide. An out-of-range index is a validation failure, not a hallucination to
  be detected.
- **It removes an entire class of failure** rather than mitigating it. Post-hoc matching asks the
  model to be honest and then checks; index-based citation removes the mechanism by which dishonesty
  could be expressed.
- **It composes with the output schema.** `citation_indices: z.array(z.number()).min(1)` means an
  assertion without a citation **fails schema validation**, which triggers a retry and then
  abstention — not a rendered claim.

**Trade-offs accepted.** The model cannot cite something outside the bundle, even if it "knows"
relevant content exists elsewhere. This is a feature: it enforces that answers come from retrieved
evidence. It also means retrieval quality directly bounds answer quality — which is why retrieval
evaluation (ADR-006, `07-ai-architecture.md` §5.6) is a first-class concern.

**Risk.** The bundle could be constructed poorly and omit a relevant span, causing unnecessary
abstention. Mitigated by hybrid retrieval, reranking, and measuring abstention correctness.

**Revisit.** Not without abandoning the product's core guarantee.

---

<a id="adr-020"></a>
## ADR-020 — Two-tier citation verification

**Status:** accepted · **Reversibility:** 🟡 Moderate

**Decision.** Verify every user-visible assertion with **Tier 1** (deterministic quote matching, on
everything, synchronously) and **Tier 2** (model-based entailment on a **different** model, before
rendering as established).

**Alternatives considered.** Tier 1 only; Tier 2 only; a single LLM-as-judge on the same model; no
verification with prompt engineering instead.

**Reason.** The two tiers catch different failures, and neither is sufficient alone:

- **Tier 1 catches fabrication** — the quote does not exist on the cited page. It is free, fast
  (<200ms p95), deterministic, and runs on every assertion. It cannot judge whether a real quote
  supports a claim.
- **Tier 2 catches the subtler and arguably more dangerous failure** — the quote is real but does not
  support the assertion ("he was copied on the email" presented as "he knew about the transfer").
  This is the failure that *looks* perfectly cited and would pass any purely mechanical check.

**Independence is essential.** Same-model self-verification shares the generator's blind spots and
systematic biases; the model that made the inference is the worst judge of it. A different provider or
model family, a different prompt, and temperature 0 give genuinely independent judgement.

**Cost control.** Tier 2 is skipped for `assertion_class = 'SOURCE_EXCERPT'` (a verbatim quote needs
no entailment check — Tier 1 is sufficient) and for assertions already human-reviewed (`review_state`
is `reviewed_adopted`).

**Trade-offs accepted.** Tier 2 adds latency and cost, and requires two providers (ADR-005). A
verifier can itself be wrong in both directions, so disagreement rates are logged and sampled for
human review.

**Risk.** Verification becomes a rubber stamp if the verifier is weak. Mitigated by: labelled
adversarial evaluation (≥95% catch rate required on the "real quote, wrong claim" set), disjointness
of verifier and generator, logging Tier 1 failures as Sev-2 events, and human sampling of
disagreements.

---

<a id="adr-021"></a>
## ADR-021 — Confidence as an ordinal rule-derived scale, not a probability

**Status:** accepted · **Reversibility:** 🔴 Hard

**Decision.** Confidence is one of **HIGH / MEDIUM / LOW / UNKNOWN**, computed by a **deterministic
rule engine** over explicit signals, and rendered as a **phrase** ("Stated directly in a document"),
never as a number, percentage, or score.

**Alternatives considered.** The model's self-reported confidence; a calibrated probability from
logprobs; an ensemble-vote proportion; no confidence at all; a 1–5 star scale.

**Reason.**
- **Model self-reported confidence is not calibrated** and varies wildly across models, prompts, and
  phrasings. Displaying it as a number would be manufacturing precision.
- **A defensible probability would require calibration data we do not have**, and a false "87%
  confident" in a legal context is worse than an honest ordinal.
- **Ordinal levels map to how people actually reason about evidence**: stated directly / supported by
  records / worth checking / not established. That is the natural vocabulary of the domain.
- **Deriving it by rule makes it auditable and testable.** The derivation is a pure function with a
  unit-tested truth table; the inputs are stored (`confidence_inputs`) so any level can be explained.
- **Rendering as a phrase prevents misreading** — "1 in 5 stars" or "72%" invites a precision the
  system cannot support.

**Trade-offs accepted.** Less granular than a probability; users cannot rank two MEDIUM items by
confidence. Mitigated by showing the derivation inputs to professional users.

**Risk.** Users may still treat the levels as strong claims. Mitigated by the phrase labels, the
explanatory tooltip, and by confidence being visibly attached to the *extraction* rather than to a
person or a legal position.

**Revisit if** — and only if — we have labelled calibration data sufficient to demonstrate that a
numeric confidence is meaningfully calibrated. Recorded explicitly so no one adds a percentage
casually.

---

<a id="adr-022"></a>
## ADR-022 — Assertion classes as an immutable, database-constrained enumeration

**Status:** accepted · **Reversibility:** 🔴 Hard

**Decision.** Seven assertion classes. Every user-visible claim carries one. Class is **immutable** on
a row, and a database `CHECK` constraint requires a citation for the classes that need one.

**Alternatives considered.** A free-text provenance note; a confidence-only model; merging classes to
reduce complexity; enforcing classes only in the application.

**Reason.**
- **The seven classes encode the product's constitution.** Collapsing "alleged" into "found in the
  documents" is the most damaging legal error the product can make, and it is the *natural* failure
  mode of summarisation, because compression is where qualifiers get dropped.
- **Immutability plus constrained transitions** means a "promotion" (allegation → fact) is always the
  creation of a **new** assertion with its own authorship and citation, never a silent edit. The
  original remains and the change is attributable.
- **Database enforcement, not application enforcement.** A `CHECK` constraint applies to every code
  path — the API, a migration, a background job, and a future feature written by an agent that never
  read this document.

**Trade-offs accepted.** More schema complexity, more UI work (a badge on everything), and more
friction for developers. Accepted because the alternative is a product that cannot be trusted.

**Risk.** Class assignment during extraction could be wrong (a pleading classed as a fact). Mitigated
by the extraction evaluation set containing pleadings whose assertions must all be classed
`ALLEGATION`, with any confusion treated as a hard failure rather than a precision loss.

---

<a id="adr-023"></a>
## ADR-023 — Append-only `ai_extractions`; corrections are additive

**Status:** accepted · **Reversibility:** 🔴 Hard

**Decision.** AI extraction records are **append-only** (`REVOKE UPDATE, DELETE` from the application
role). User corrections live in a separate table; effective values are computed; reverting supersedes
rather than edits.

**Alternatives considered.** Updating extraction rows in place with an `updated_by` field; a full
event-sourced model; a versioned JSON document per subject.

**Reason.**
- **"Never silently overwrite history"** is a stated product principle, and it is a professional
  requirement: a lawyer must be able to show what the machine suggested versus what they adopted
  (`review_state`) versus what the client corrected.
- **Role-level `REVOKE` makes the guarantee structural.** Application code physically cannot mutate an
  extraction, so no future feature can accidentally destroy the audit trail.
- **Discovery and disclosure.** If a chronology is ever challenged, "what did the system originally
  extract, and who changed it?" must be answerable.
- **Full event sourcing was rejected** as over-engineering: provenance is already append-only where it
  matters (extractions, audit log, corrections). Event-sourcing the entire domain would add
  substantial complexity for little additional guarantee.

**Trade-offs accepted.** Reads must resolve effective values (a view, or a cached column). Slightly
more complex queries; slightly more storage.

**Risk.** The effective-value resolution could become a performance bottleneck. Mitigated by a
maintained `effective_value` cache column plus a view, with the view as the source of truth.

---

<a id="adr-024"></a>
## ADR-024 — Defer the financial module to Phase 3 pending balance verification

**Status:** accepted · **Reversibility:** 🟢 Easy

**Decision.** The financial transaction ledger ships in Phase 3, **after** running-balance arithmetic
verification exists and is validated to catch ≥95% of injected amount errors.

**Alternatives considered.** Ship money extraction in the MVP alongside other extraction.

**Reason.** **Money errors are the highest-consequence errors the product can produce.** A misread
amount that reaches a lawyer's brief creates a false narrative of misappropriation. OCR digit
confusion (`1/7`, `0/8`, `5/6`, `3/8`) is a documented failure mode, and the running balance in a bank
statement is a **checksum on the extraction**: if row *n*'s balance ≠ row *n−1*'s balance ± the
amount, either the extraction or the OCR is wrong.

That check must exist and be proven before the feature ships. Shipping money figures checked only by
human review would be irresponsible, and the MVP has no need for it: the timeline, entity profiles,
search, chat, and brief are all viable without financial extraction.

**Trade-offs accepted.** Users with financial evidence in the MVP cannot get a ledger. Mitigated by
classifying bank statements as a document type so they are findable and searchable without amounts
being asserted.

**Risk.** Design partners with financial matters are disappointed. Accepted — a wrong number is worse
than no number.

---

<a id="adr-025"></a>
## ADR-025 — Defer the contradiction engine to Phase 2

**Status:** accepted · **Reversibility:** 🟢 Easy

**Decision.** The contradiction engine ships in Phase 2, not the MVP, and only after Phase 4 has
proven **attribution precision ≥ 0.97**.

**Alternatives considered.** Include a basic contradiction detector in the MVP, as the preliminary
list proposed.

**Reason.**
1. **A false accusation of inconsistency is the most damaging error the product can produce.** It
   implies dishonesty without saying it, it can be defamatory, and it puts the product in exactly the
   position it promised never to occupy. The precision requirement (≥0.70) demands an evaluation set
   that can only be built once statements are reliably extracted.
2. **A contradiction between two misattributed statements is worse than no contradiction.** If a
   statement is attributed to the wrong person (RT-02), the engine produces a confident, wrong,
   person-specific finding. Attribution quality is a hard prerequisite.
3. **It is a natural Phase 2 feature, and the cost of deferral is low** — the person profile's plain
   "statements by this person" list delivers the raw material without the automated judgement.

**Trade-offs accepted.** The MVP does not detect contradictions, which is one of the product's most
compelling features. Accepted deliberately: the feature is *more* compelling when it is trustworthy,
and a credibility incident at launch would be unrecoverable.

---

<a id="adr-026"></a>
## ADR-026 — Build the Lawyer Brief in the MVP; cut AI chat before it

**Status:** accepted · **Reversibility:** 🟢 Easy

**Decision.** The Lawyer Brief (F22) is a non-negotiable MVP feature. If schedule pressure forces a
cut, **the AI chat is cut first**.

**Alternatives considered.** Treating all 12 preliminary MVP items as equally essential.

**Reason.**
- **The brief is the monetisation event.** It is the artifact the user pays for and the thing they
  were trying to produce when they started.
- **The brief is the growth loop.** Every brief handed to a lawyer is a warm introduction to a
  professional user — the only scalable acquisition channel this product has.
- **The brief does not depend on incremental AI quality.** It is a composition and export problem over
  data the MVP already produces (timeline, people, documents, citations). It can be excellent while
  extraction is merely good.
- **The chat is the highest-risk surface** (hallucination, legal advice, credibility language) and the
  feature most dependent on verification infrastructure. It is high-value but not load-bearing for the
  first paid transaction.

**Trade-offs accepted.** The MVP is less impressive in a demo without chat. Accepted: a demo is not a
business.

**Risk.** Users expect chat and are disappointed. Mitigated by search, which answers most "find me
things" questions without any generation risk.

---

<a id="adr-027"></a>
## ADR-027 — Object Lock / WORM for originals

**Status:** accepted · **Reversibility:** 🟡 Moderate

**Decision.** Uploaded originals are written once to a versioned prefix protected by S3 Object Lock.
The application runtime role cannot overwrite or delete them.

**Alternatives considered.** Ordinary object storage with application discipline; storing hashes only;
a separate immutable store.

**Reason.** The user's original files are irreplaceable. Application discipline is not a control —
one bug in a "normalise PDF" step that writes back to the source destroys evidence permanently.
Object Lock plus role separation makes immutability a property of the storage layer.

Combined with SHA-256 recorded at upload and re-verified before parsing, this gives the product's
chain-of-custody claim a real foundation (`09-evidence-provenance.md` §9) — while explicitly not
claiming admissibility.

**Trade-offs accepted.** Object Lock in compliance mode makes deletion harder — which is why the
purge role exists separately and the deletion job handles version enumeration. Lifecycle rules must
not contradict the lock. Cost of retaining versions.

**Risk.** A misconfigured lock could prevent legitimate deletion, violating a privacy obligation.
Mitigated by governance mode plus a documented, tested purge path; the purge rehearsal is part of
Phase 8.

---

<a id="adr-028"></a>
## ADR-028 — Hash-chained audit log with content-free records

**Status:** accepted · **Reversibility:** 🟡 Moderate

**Decision.** `audit_log` is append-only (`REVOKE UPDATE, DELETE`), hash-chained
(`entry_hash = sha256(prev_hash || canonical(entry))`), verified on a schedule, and records
**identifiers only — never case content**.

**Alternatives considered.** Ordinary application logging; a content-inclusive audit trail; an
external immutable log service; database triggers writing audit rows.

**Reason.**
- **Tamper evidence.** Hash chaining plus role-level `REVOKE` means an insider cannot quietly alter
  history, and a scheduled verification job detects any break and reports the first divergence.
- **Content-free by design is deliberate.** An audit log that mirrors case content becomes a second,
  less-protected copy of the most sensitive data and a second deletion obligation. Recording "actor X
  viewed document D at time T" is sufficient for accountability without duplicating content.
- **It is the evidence for the ethical wall.** Wall-access attempts are logged, giving a firm proof
  that the wall held.
- An external log service was rejected for MVP as an extra dependency; hash chaining plus a separate
  backup gives most of the benefit.

**Trade-offs accepted.** Content-free means reconstruction of *what* was viewed requires joining to
tables that may since have changed or been deleted. Accepted as the right privacy trade.

**Risk.** Audit writes add a write per mutation. Mitigated by a transactional outbox pattern to batch
writes without losing them, and by indexes tuned for the query patterns.

---

<a id="adr-029"></a>
## ADR-029 — No audio/video transcription until a separate privacy review

**Status:** accepted · **Reversibility:** 🟢 Easy

**Decision.** Audio and video transcription (F44) is deferred to "later/experimental" and requires a
separate DPIA and consent design before it is built.

**Alternatives considered.** Include transcription in Phase 3 as a natural extension.

**Reason.** Audio introduces obligations that documents do not:
- **Recording-consent law.** Two-party-consent jurisdictions make transcribing a recording of a
  conversation a potential offence, and we cannot verify how the user obtained it.
- **Voice as biometric data.** A voiceprint is biometric information under several regimes, raising
  the sensitivity tier.
- **Speaker diarisation is inference about identity** — attributing speech to a person is a different
  and higher-risk act than attributing written text.
- **Unbounded third-party exposure.** A recording captures everyone in the room, including people who
  never became parties and never consented to anything.

**Trade-offs accepted.** A real feature gap for matters with recorded evidence. Accepted until the
legal analysis exists, because building it first and analysing later would be indefensible.

---

<a id="adr-030"></a>
## ADR-030 — Streaming may not emit unverified assertions

**Status:** accepted · **Reversibility:** 🟢 Easy

**Decision.** Token streaming may emit only the `direct_answer` field. Assertions, citations, and
verification results are emitted in a **final, complete event after verification finishes**. Clients
render streamed text as provisional and replace it on `answer_complete`.

**Alternatives considered.** Stream the full answer for perceived responsiveness; stream assertions
with citations inline as generated then patch them; no streaming at all.

**Reason.** This is the one place where a naive implementation would silently break the product's core
guarantee. If assertions stream as the model produces them, a claim is rendered **before** Tier 1 and
Tier 2 verification have run — so an unsupported assertion can be visible, even if it is corrected a
second later. A user who has read it has already been misled; the correction does not undo that.

The constraint costs a small amount of perceived responsiveness on the assertion list and protects the
guarantee absolutely. That is the correct trade in a legal context.

**Trade-offs accepted.** The answer's evidence list appears all at once rather than progressively.
Mitigated by streaming the direct answer immediately, so the interface feels responsive while the
verified evidence assembles.

**Risk.** A future developer "optimises" by streaming assertions. Mitigated by the API contract
documenting the constraint, a client-side render test, and a server-side test asserting no assertion
content appears in any pre-verification stream event.

---

## Related documents

- `06-system-architecture.md` — implementation of ADR-001, 002, 004, 011, 014
- `07-ai-architecture.md` — implementation of ADR-005, 008, 019, 020, 021, 030
- `08-document-ingestion.md` — implementation of ADR-018, 027
- `09-evidence-provenance.md` — implementation of ADR-021, 022, 023
- `10-database-schema.md` — the schema enforcing ADR-012, 022, 023, 028
- `12-security-architecture.md` — implementation of ADR-012, 013, 016, 027, 028
- `13-privacy-and-legal-risks.md` — the legal context for ADR-016, 017, 029
- `18-red-team-risks.md` — the failures these decisions prevent
- `23-open-questions.md` — the decisions still open, which could add ADRs
