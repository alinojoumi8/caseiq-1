---
title: Case IQ — Architecture Diagrams
status: draft
owner: Architecture
last_updated: 2026-02-14
version: 1.0
---

# Diagrams

Standalone copies of every architecture diagram in the specification set, so a reader can see the
whole system without jumping between documents. Each diagram states its source document and, where
useful, what to notice in it.

**Rendering requirement:** all diagrams are Mermaid. They are also exported as SVG/PNG by the
documentation build for offline reading and print.

---

## Index

| # | Diagram | Source |
|---|---|---|
| D1 | System architecture | `06-system-architecture.md` §2 |
| D2 | Trust boundaries | `06-system-architecture.md` §2.1 |
| D3 | Document processing pipeline | `08-document-ingestion.md` §2 |
| D4 | Document state machine | `08-document-ingestion.md` §2.1 |
| D5 | AI query / RAG and verification pipeline | `07-ai-architecture.md` §6.3 |
| D6 | Evidence provenance flow | `09-evidence-provenance.md` §3.5 |
| D7 | Database entity relationships | `10-database-schema.md` §2 |
| D8 | User workflow (onboarding → value → handover) | `03-user-journeys.md` |
| D9 | Case-analysis workflow (how knowledge is built) | `08` + `07` |
| D10 | Permission architecture | `12-security-architecture.md` §4 |
| D11 | Two-tier verification decision flow | `07-ai-architecture.md` §6.3 |
| D12 | Deletion and purge flow | `09-evidence-provenance.md` §11 |
| D13 | Deployment topology | `06-system-architecture.md` §3.7 |
| D14 | Feature dependency graph | `04-feature-specification.md` §10 |
| D15 | Roadmap phases | `19-roadmap.md` §0 |

---

## D1 — System architecture

```mermaid
graph TB
    subgraph Client["Client (browser, 375px → 4K)"]
        UI["Next.js App Router<br/>React Server Components + Client Components"]
        EV["Evidence Viewer<br/>(PDF.js / image / text)"]
        GR["Graph + Timeline<br/>(canvas/SVG)"]
    end

    subgraph Edge["Edge"]
        CDN["CDN / static assets"]
        WAF["Rate limiting + bot protection"]
    end

    subgraph App["Application Tier — stateless, horizontally scalable"]
        WEB["Next.js server<br/>Route handlers = REST API<br/>Server Actions = mutations"]
        AUTHN["Auth module<br/>sessions, MFA, OAuth"]
        PERM["Authorisation module<br/>policy checks + RLS context"]
        PROV["Provenance module<br/>citation create/verify"]
        DOCS["Document module"]
        ENT["Entity module"]
        TL["Timeline module"]
        SRCH["Search module<br/>FTS + vector + RRF"]
        AIORCH["AI Orchestration module<br/>retrieval → generate → verify"]
        RPT["Report module<br/>brief rendering + export"]
        AUD["Audit module<br/>hash-chained append-only"]
    end

    subgraph Data["Data Tier"]
        PG[("PostgreSQL 16+<br/>pgvector · tsvector · RLS<br/>relational + vector + graph tables")]
        OBJ[("S3-compatible object storage<br/>originals immutable · derivatives · exports<br/>versioning + Object Lock")]
        Q[("Job queue<br/>pg-boss tables in PostgreSQL")]
        CACHE[("Cache<br/>in-process LRU")]
    end

    subgraph Workers["Worker Tier — separate process, horizontally scalable"]
        WQ["Job consumers"]
        WOCR["OCR workers<br/>CPU-heavy, isolated pool"]
        WEXT["Extraction workers<br/>LLM calls"]
        WEMB["Embedding + indexing workers"]
        WVER["Verification workers"]
        WEXP["Export/report workers"]
        WATCH["Watchdog<br/>stuck jobs, SLA breaches"]
    end

    subgraph External["External Services"]
        LLM["LLM providers<br/>generation + extraction"]
        EMB["Embedding provider"]
        RR["Reranker"]
        OCRSVC["Cloud OCR<br/>(optional, per-matter policy)"]
        MAIL["Transactional email"]
    end

    UI --> CDN --> WAF --> WEB
    EV --> WEB
    GR --> WEB
    WEB --> AUTHN
    WEB --> PERM
    WEB --> DOCS & ENT & TL & SRCH & AIORCH & RPT & PROV
    PROV --> PG
    DOCS --> PG
    DOCS --> OBJ
    ENT --> PG
    TL --> PG
    SRCH --> PG
    RPT --> PG
    RPT --> OBJ
    AIORCH --> PG
    AIORCH --> LLM
    AIORCH --> EMB
    AIORCH --> RR
    AIORCH --> Q
    WEB --> AUD --> PG
    WEB --> Q
    Q --> WQ
    WQ --> WOCR --> OCRSVC
    WQ --> WEXT --> LLM
    WQ --> WEMB --> EMB
    WQ --> WVER --> LLM
    WQ --> WEXP --> OBJ
    WATCH --> PG
    AUTHN --> PG
    PERM --> PG
    WQ --> PG
    WQ --> OBJ
    WEB --> MAIL
    WQ --> MAIL
```

**What to notice.** One database holds relational, full-text, vector, and graph data — that is the
decision that makes the provenance guarantee structural (ADR-004). The worker tier is the only
separate deployable, and it exists because OCR is a genuinely different workload (ADR-001, ADR-014).
The AI orchestration module is the only component that talks to model providers (ADR-005).

---

## D2 — Trust boundaries

```mermaid
graph LR
    subgraph TB0["Zone 0 — Fully untrusted"]
        FILES["Uploaded files<br/>PDF/DOCX/ZIP/EML/images"]
        TEXT["Extracted text<br/>may contain prompt injection"]
    end
    subgraph TB1["Zone 1 — Public internet"]
        BROWSER["Browsers"]
    end
    subgraph TB2["Zone 2 — Authenticated, tenant-scoped"]
        APP["Application tier"]
        WORK["Workers"]
    end
    subgraph TB3["Zone 3 — Highly trusted"]
        DB[("PostgreSQL<br/>RLS enforced")]
        VAULT["Secrets / KMS"]
    end
    subgraph TB4["Zone 4 — Third parties"]
        PROV2["LLM / OCR / embedding providers"]
    end

    BROWSER -->|authenticated, CSRF-protected| APP
    FILES -->|never executed, scanned, immutable| WORK
    WORK --> TEXT
    TEXT -->|delimited as data, injection-screened| PROV2
    TEXT -->|inserted as opaque text| DB
    APP --> DB
    WORK --> DB
    APP --> VAULT
    WORK --> VAULT
    PROV2 -.->|"returned content is also untrusted"| WORK

    classDef untrusted fill:#fee,stroke:#c00,stroke-width:2px
    classDef trusted fill:#efe,stroke:#080
    class FILES,TEXT,PROV2 untrusted
    class DB,VAULT trusted
```

**What to notice.** Extracted text is in Zone 0, not Zone 2. An opposing party's filing is
attacker-controlled input, and the architecture treats it that way at every layer (RT-04). Provider
responses are also untrusted.

---

## D3 — Document processing pipeline

```mermaid
graph TD
    U["Upload<br/>(presigned, direct to storage)"] --> SCAN["SCANNING<br/>ClamAV + format validation"]
    SCAN -->|"clean"| PROMOTE["Promote quarantine → originals<br/>(Object Lock / versioning)"]
    SCAN -->|"infected"| QUAR["FAILED_MALWARE<br/>quarantined, never parsed"]
    PROMOTE --> HASH["Hash verification<br/>SHA-256 vs client-declared"]
    HASH --> IDENT["FILE IDENTIFICATION<br/>magic bytes (not extension)"]
    IDENT --> DEDUP["DUPLICATE DETECTION<br/>exact SHA-256 + MinHash near-dup"]
    DEDUP --> EXTRACT["EXTRACTING_TEXT<br/>native extraction first"]
    EXTRACT --> DECIDE{"Text layer<br/>sufficient?"}
    DECIDE -->|"yes"| PAGES["Page records + char offsets"]
    DECIDE -->|"no / partial"| OCR["OCR<br/>Tesseract baseline, cloud opt-in"]
    OCR --> PAGES
    PAGES --> CLASSIFY["CLASSIFYING<br/>R1 Document Classifier"]
    CLASSIFY --> ENTITIES["EXTRACTING_ENTITIES<br/>R2"]
    ENTITIES --> EVENTS["EXTRACTING_EVENTS<br/>R3"]
    EVENTS --> FACTS["EXTRACTING_FACTS<br/>R4"]
    FACTS --> MONEY["EXTRACTING_TRANSACTIONS<br/>R5 — financial docs only"]
    MONEY --> VERIFY1["TIER 1 QUOTE VERIFICATION<br/>every extraction"]
    VERIFY1 --> EMBED["INDEXING<br/>tsvector + embeddings"]
    EMBED --> REL["BUILDING_RELATIONSHIPS"]
    REL --> QC["QUALITY_CHECK"]
    QC --> READY["READY"]
    QC -->|"anomalies"| REVIEW["READY_WITH_FLAGS<br/>routed to review queue"]

    style QUAR fill:#fee,stroke:#c00
    style READY fill:#efe,stroke:#080
```

**What to notice.** Nothing is parsed before it is scanned. Born-digital gating before OCR is both a
cost control and a quality control. Every extraction passes Tier 1 verification before indexing.
Exact duplicates are short-circuited rather than reprocessed.

---

## D4 — Document state machine

```mermaid
stateDiagram-v2
    [*] --> UPLOAD_RECEIVED
    UPLOAD_RECEIVED --> UPLOADING: chunks arriving
    UPLOADING --> UPLOAD_RECEIVED: resume
    UPLOAD_RECEIVED --> UPLOAD_COMPLETE: all chunks + checksum ok
    UPLOAD_RECEIVED --> FAILED_UPLOAD: checksum mismatch / expired
    UPLOAD_COMPLETE --> SCANNING
    SCANNING --> FAILED_MALWARE: infected
    SCANNING --> IDENTIFYING: clean
    SCANNING --> FAILED_SCAN: scanner error (retryable)
    IDENTIFYING --> UNSUPPORTED: format not parseable
    IDENTIFYING --> DUPLICATE_OF: exact duplicate
    IDENTIFYING --> EXTRACTING_TEXT
    DUPLICATE_OF --> READY: linked as variant, not parsed again
    EXTRACTING_TEXT --> NEEDS_OCR: insufficient text layer
    EXTRACTING_TEXT --> CLASSIFYING: text layer sufficient
    EXTRACTING_TEXT --> FAILED_EXTRACTION: corrupt / unreadable
    NEEDS_OCR --> OCR_RUNNING
    OCR_RUNNING --> CLASSIFYING: OCR produced text
    OCR_RUNNING --> PARTIAL_OCR: some pages failed
    OCR_RUNNING --> FAILED_OCR
    PARTIAL_OCR --> CLASSIFYING
    CLASSIFYING --> EXTRACTING_ENTITIES
    EXTRACTING_ENTITIES --> EXTRACTING_EVENTS
    EXTRACTING_EVENTS --> EXTRACTING_FACTS
    EXTRACTING_FACTS --> EXTRACTING_TRANSACTIONS
    EXTRACTING_TRANSACTIONS --> VERIFYING
    VERIFYING --> INDEXING
    INDEXING --> BUILDING_RELATIONSHIPS
    BUILDING_RELATIONSHIPS --> QUALITY_CHECK
    QUALITY_CHECK --> READY
    QUALITY_CHECK --> READY_WITH_FLAGS
    READY --> ARCHIVED: user archives
    READY --> DELETED: purge
    FAILED_UPLOAD --> UPLOAD_RECEIVED: retry
    FAILED_SCAN --> SCANNING: retry
    FAILED_EXTRACTION --> EXTRACTING_TEXT: retry with different extractor
    FAILED_OCR --> OCR_RUNNING: retry with cloud OCR
    ARCHIVED --> READY: restore
    DELETED --> [*]
```

**What to notice.** Every `FAILED_*` state is retryable and retains the original. `UNSUPPORTED` and
`DUPLICATE_OF` are terminal but **not failures** — the file is stored, findable, and downloadable.
No transition destroys a previous successful stage's output.

---

## D5 — AI query, retrieval, and verification pipeline

```mermaid
graph LR
    Q["User question"] --> QP["Query preprocessing<br/>normalise, expand legal abbrevs,<br/>extract entities/dates/amounts"]
    QP --> GUARD{"Legal-advice<br/>or out-of-scope?"}
    GUARD -->|"yes"| REFUSE["Refusal template<br/>declination + redirect"]
    GUARD -->|"no"| A["Arm A: Full-text<br/>websearch_to_tsquery + GIN<br/>legal dictionary, trigram fallback"]
    QP --> B["Arm B: Vector<br/>pgvector HNSW, cosine<br/>top 50"]
    QP --> C["Arm C: Structured<br/>entity/date/amount/type<br/>exact-match lookups"]
    A --> F["Reciprocal Rank Fusion<br/>k = 60"]
    B --> F
    C --> F
    F --> D["Metadata + permission filters<br/>INSIDE the SQL query"]
    D --> E["Reranker (cross-encoder)<br/>top 50 → top 12"]
    E --> S{"Any span above<br/>support threshold?"}
    S -->|"no"| ABS["Abstain<br/>'The uploaded case materials<br/>do not establish this'<br/>+ nearest supported facts"]
    S -->|"yes"| BUN["Numbered evidence bundle<br/>delimited as DATA, injection-screened"]
    BUN --> GEN["Grounded Generator (R7)<br/>output schema requires<br/>citation_indices.min(1)"]
    GEN --> V1["TIER 1 — deterministic quote match<br/>normalise N1-N9, exact then fuzzy"]
    V1 -->|"mismatch"| SUP["SUPPRESS assertion<br/>record, alert Sev-2"]
    V1 -->|"match"| V2["TIER 2 — entailment<br/>DIFFERENT model/provider"]
    V2 -->|"not_supported"| SUP
    V2 -->|"supported"| OK["VerifiedAssertion<br/>ONLY type that can render"]
    OK --> ASM["Answer assembler<br/>structured by intent"]
    ASM --> UIOUT["Structured answer<br/>+ citation chips"]

    style REFUSE fill:#ffd
    style ABS fill:#dff
    style SUP fill:#fee
    style OK fill:#efe
```

**What to notice.** Three things carry the product's guarantee: citations are **indices** into a
system-supplied bundle (so a fabricated citation is unrepresentable), the renderable type is
`VerifiedAssertion` (which only the verification step can construct), and abstention is a first-class
outcome with its own response shape (ADR-019, ADR-021, `07-ai-architecture.md` §6).

---

## D6 — Evidence provenance flow

```mermaid
graph LR
    ORIG["Original file<br/>(immutable, SHA-256)"] --> RUN["AIExtractionRun<br/>(model + prompt version)"]
    RUN --> EXT["AI extraction<br/>(append-only, REVOKE UPDATE)"]
    RUN --> PAGE["DocumentPage text<br/>(per run)"]
    EXT --> ASSERT["Assertion<br/>(class + derived confidence)"]
    PAGE --> CITE["Citation<br/>(page, span, quote, hash)"]
    ASSERT --> CITE
    CITE --> VER["Verification<br/>Tier 1 + Tier 2"]
    VER --> VSTAT["verification_status<br/>verified | mismatch | unsupported"]
    ASSERT --> CORR["UserCorrection<br/>(additive, superseded not edited)"]
    CORR --> EFF["Effective value<br/>(computed)"]
    EXT --> EFF
    VSTAT --> CONF["Derived confidence<br/>deterministic rule engine"]
    ASSERT --> CONF
    EFF --> UIR["What the user sees<br/>class badge + confidence phrase<br/>+ citation chip"]
    CONF --> UIR
    VSTAT --> UIR
    UIR --> EXP["Exports<br/>citation anchors preserved"]
    UIR --> AUD["Audit log<br/>who saw / adopted / exported"]
    DBCHECK["DB constraints<br/>DB-1 citation_count >= 1<br/>DB-2 no UNKNOWN unless suppressed<br/>DB-4 class immutable"] -.-> ASSERT

    style DBCHECK fill:#ffd
```

**What to notice.** Every arrow is a real foreign key, and the dashed box is the set of database
constraints that make the promises enforceable rather than conventional. `ai_extractions` is
append-only at the role level, so no code path can overwrite history (ADR-023, DB-5).

---

## D7 — Database entity relationships

```mermaid
erDiagram
    USERS ||--o{ MEMBERSHIPS : has
    ORGANIZATIONS ||--o{ MEMBERSHIPS : has
    ORGANIZATIONS ||--o{ MATTERS : owns
    MATTERS ||--o{ MATTER_MEMBERS : has
    USERS ||--o{ MATTER_MEMBERS : in

    MATTERS ||--o{ DOCUMENTS : contains
    DOCUMENTS ||--o{ DOCUMENT_FILES : "original + derivatives"
    DOCUMENTS ||--o{ DOCUMENT_PAGES : has
    DOCUMENTS ||--o{ DOCUMENT_CHUNKS : "chunked into"
    DOCUMENTS ||--o{ AI_EXTRACTION_RUNS : "processed by"
    DOCUMENTS ||--o{ DOCUMENT_DUPLICATES : "duplicate of"

    AI_EXTRACTION_RUNS ||--o{ AI_EXTRACTIONS : produces
    AI_EXTRACTIONS ||--o{ ASSERTIONS : "materialises into"
    ASSERTIONS ||--o{ CITATIONS : "supported by"
    CITATIONS }o--|| DOCUMENT_PAGES : "points into"
    ASSERTIONS ||--o{ USER_CORRECTIONS : "corrected by"
    ASSERTIONS ||--o{ REVISIONS : versioned

    MATTERS ||--o{ ENTITIES : has
    ENTITIES ||--o{ ENTITY_ALIASES : "known as"
    ENTITIES ||--o{ ENTITY_MENTIONS : "mentioned in"
    ENTITY_MENTIONS }o--|| DOCUMENTS : "appears in"
    ENTITIES ||--o{ ENTITY_RELATIONSHIPS : "source of"
    ENTITIES ||--o{ ENTITY_MERGE_CANDIDATES : "candidate merge"

    MATTERS ||--o{ EVENTS : has
    EVENTS ||--o{ EVENT_ENTITIES : involves
    EVENTS ||--o{ EVENT_DOCUMENTS : "evidenced by"

    MATTERS ||--o{ STATEMENTS : has
    ENTITIES ||--o{ STATEMENTS : "made by"
    STATEMENTS ||--o{ CONTRADICTIONS : "conflicts in"
    CONTRADICTIONS ||--o{ CONTRADICTION_DISPOSITIONS : disposition

    MATTERS ||--o{ ALLEGATIONS : has
    ALLEGATIONS ||--o{ ALLEGATION_EVIDENCE : "supported or contradicted by"
    ASSERTIONS ||--o{ ALLEGATION_EVIDENCE : "evidence item"

    MATTERS ||--o{ ACCOUNTS : has
    ACCOUNTS ||--o{ TRANSACTIONS : involves
    TRANSACTIONS ||--o{ TRANSACTION_LINKS : "traced via"

    MATTERS ||--o{ THREADS : has
    THREADS ||--o{ MESSAGES : contains

    MATTERS ||--o{ NARRATIVES : has
    NARRATIVES ||--o{ NARRATIVE_SECTIONS : contains
    NARRATIVE_SECTIONS ||--o{ NARRATIVE_SOURCES : "sourced from"

    MATTERS ||--o{ NOTES : has
    MATTERS ||--o{ SHARE_LINKS : "shared via"
    MATTERS ||--o{ REPORTS : generated
    REPORTS ||--o{ REPORT_VERSIONS : versioned

    MATTERS ||--o{ CHAT_CONVERSATIONS : has
    CHAT_CONVERSATIONS ||--o{ CHAT_MESSAGES : contains
    CHAT_MESSAGES ||--o{ CHAT_ANSWER_ASSERTIONS : asserts

    MATTERS ||--o{ DEADLINES : has
    MATTERS ||--o{ DELETION_RECEIPTS : "deleted via"
    USAGE_EVENTS }o--|| MATTERS : "cost against"
```

**What to notice.** `ASSERTIONS` is the spine: timeline events, allegations, statements,
contradictions, transactions, narrative sections, chat messages, and summaries all point at it, and
it points at citations. That is why the guarantee is uniform across features rather than
reimplemented per feature.

---

## D8 — User workflow

```mermaid
graph TD
    START["Sign up"] --> W1["1. What is this case about?<br/>title + case type"]
    W1 --> W2["2. Who are you in this case?<br/>self / supporting / professional"]
    W2 --> W3["3. Add your documents<br/>(or 'I'll do this later')"]
    W3 --> W4["4. We're reading your documents<br/>honest progress + ETA range"]
    W4 --> W5["5. Here's what we found<br/>3 cited events + people"]
    W5 --> TL["Check the timeline"]
    TL --> REVIEW["Review and correct<br/>what we found"]
    REVIEW --> DEEP["Explore<br/>people, papers, search"]
    DEEP --> DISCOVER["Discover in-product:<br/>allegations, conflicts,<br/>money, connections, story"]
    DISCOVER --> ASK["Ask about my case"]
    ASK --> PREP["Prepare for your lawyer"]
    PREP --> BRIEF["Cited Lawyer Brief<br/>+ verification summary"]
    BRIEF --> SHARE["Share with counsel<br/>scoped, expiring link"]
    SHARE --> LOOP["Lawyer sees the work product"]
    LOOP --> RETURN["Returns to review,<br/>or the lawyer adopts it"]

    style W5 fill:#efe
    style BRIEF fill:#efe
```

**What to notice.** Five visible onboarding steps, not ten. The first value moment (step 5) is a real
cited timeline, not a feature tour. Later capability is discovered when the case can populate it
(`14-ux-specification.md` §2.3). The brief is a primary destination, not a buried export.

---

## D9 — Case analysis workflow (how knowledge is built)

```mermaid
graph TB
    subgraph Layer1["Layer 1 — Source (immutable)"]
        F["Original files<br/>SHA-256, Object Lock"]
    end
    subgraph Layer2["Layer 2 — Text"]
        P["Page text per extraction run<br/>+ char offsets + OCR metadata"]
        C["Chunks<br/>page-bounded, structure-aware"]
    end
    subgraph Layer3["Layer 3 — Extracted knowledge (append-only)"]
        E1["Entities + mentions + aliases"]
        E2["Events with date precision"]
        E3["Facts with assertion class"]
        E4["Transactions (decimal)"]
        E5["Statements + forums"]
    end
    subgraph Layer4["Layer 4 — Verified assertions"]
        A["Assertions<br/>class + derived confidence"]
        CIT["Citations<br/>page + span + quote + hash"]
        V["Verification<br/>Tier 1 deterministic + Tier 2 entailment"]
    end
    subgraph Layer5["Layer 5 — Products"]
        T["Timeline"]
        PP["Person / org profiles"]
        AM["Allegation matrix"]
        CE["Conflicts"]
        FL["Financial ledger + traces"]
        G["Relationship graph"]
        SUM["Case summary"]
        BR["Lawyer Brief"]
    end
    subgraph Layer6["Layer 6 — Human"]
        RQ["Review queue<br/>adopt / correct / remove"]
        CORR["Corrections<br/>additive, versioned"]
        NAR["User narrative<br/>their words"]
    end

    F --> P --> C
    C --> E1 & E2 & E3 & E4 & E5
    E1 & E2 & E3 & E4 & E5 --> A
    P --> CIT
    A --> CIT --> V
    V --> T & PP & AM & CE & FL & G & SUM
    T & PP & AM & CE & FL & G & SUM --> BR
    RQ --> CORR --> A
    NAR --> BR
    RQ -.->|"feeds evaluation sets"| E1

    style F fill:#efe
    style V fill:#dff
    style BR fill:#ffd
```

**What to notice.** Knowledge flows upward through six layers, and **verification sits between
extraction and every product surface** — no product surface reads directly from layer 3. Human
correction loops back additively, never destructively. The review queue doubles as the source of
labelled evaluation data.

---

## D10 — Permission architecture

```mermaid
graph TD
    REQ["Request"] --> L1["Layer 1 — Application authorisation<br/>capability check<br/>(matter:read, document:read_privileged, ...)"]
    L1 -->|"denied"| D1["404 / 403"]
    L1 -->|"allowed"| TX["Begin transaction<br/>SET LOCAL app.user_id, app.matter_ids,<br/>app.can_view_privileged, app.role"]
    TX --> L2["Layer 2 — PostgreSQL RLS<br/>ENABLE + FORCE"]
    L2 --> P1["Policy: tenant_isolation<br/>matter_id = ANY(app.matter_ids)"]
    L2 --> P2["Policy: privileged (RESTRICTIVE)<br/>sensitivity <> 'privileged'<br/>OR can_view_privileged<br/>OR document_acl allow"]
    L2 --> P3["Policy: soft-delete<br/>deleted_at IS NULL"]
    P1 & P2 & P3 --> L3["Layer 3 — Field / query-level<br/>sensitivity metadata ON the chunk<br/>so filtering is INSIDE the vector query"]
    L3 --> ROWS["Rows returned"]
    ROWS -->|"zero rows"| D2["404 — not 403<br/>no existence disclosure"]
    ROWS -->|"rows"| OK["Response"]
    WORKER["Worker / background job<br/>app.role = 'service'<br/>app.matter_ids = job's matter ONLY"] -.-> L2
    PURGE["Purge / migration role<br/>BYPASSRLS — separate credentials,<br/>never available to the runtime"] -.-> L2

    style D2 fill:#fee
    style PURGE fill:#ffd
```

**What to notice.** Three layers, deliberately: an application bug does not become a data breach
because the database still returns zero rows. `FORCE ROW LEVEL SECURITY` matters because without it
the table owner bypasses every policy. `SET LOCAL` (never `SET`) matters because session-level
settings leak across pooled connections — a catastrophic cross-tenant bug (ADR-012).

---

## D11 — Two-tier verification decision flow

```mermaid
graph TD
    GEN["Generator output:<br/>assertions + citation indices"] --> RES["Resolve indices → real citations<br/>fetch exact source span"]
    RES --> CHK1{"Assertion class<br/>= SOURCE_EXCERPT?"}
    CHK1 -->|"yes"| T1ONLY["Tier 1 only<br/>(verbatim quote needs no entailment check)"]
    CHK1 -->|"no"| CHK2{"Already<br/>human-reviewed?"}
    CHK2 -->|"yes"| SKIP["Tier 2 skipped<br/>recorded in verification detail"]
    CHK2 -->|"no"| T2RUN["Run Tier 2"]
    T1ONLY --> T1["TIER 1 — deterministic<br/>normalise N1-N9<br/>exact substring match"]
    SKIP --> T1
    T2RUN --> T1
    T1 -->|"not found"| FUZZ{"Fuzzy match<br/>similarity >= 0.98?"}
    FUZZ -->|"no"| MISMATCH["quote_mismatch<br/>SUPPRESS → Sev-2 alert"]
    FUZZ -->|"yes"| FUZZOK["verified, match_quality = fuzzy<br/>+ numeric_mismatch_suspected if a figure differs"]
    FUZZOK --> NUMCHK{"Numeric token in<br/>the differing region?"}
    NUMCHK -->|"yes"| WARN["Render with a figure warning"]
    NUMCHK -->|"no"| CONT["Continue to Tier 2"]
    T2RUN --> T2["TIER 2 — entailment<br/>DIFFERENT model/provider<br/>temperature 0"]
    T2 -->|"supported"| OK["verified = supported<br/>renderable as VerifiedAssertion"]
    T2 -->|"partially_supported"| PART["Render with the verifier's<br/>specific hedge + lower confidence"]
    T2 -->|"not_supported / contradicts"| SUP2["SUPPRESS from established content<br/>→ 'AI suggested, not verified'<br/>+ sampled for human review"]
    MISMATCH --> ESC
    SUP2 --> ESC["Explicit user-expandable disclosure<br/>shows the claim, the span,<br/>and why it was not accepted"]

    style MISMATCH fill:#fee
    style SUP2 fill:#fee
    style OK fill:#efe
```

**What to notice.** Tier 2 skipping is bounded to two cases and both are recorded — it is never
extended to inference classes. Suppression is visible rather than silent: the user can see that the
system *chose not to assert something*, which is itself a trust signal.

---

## D12 — Deletion and purge flow

```mermaid
graph TD
    DEL["User requests permanent deletion<br/>(typed confirmation + warning)"] --> TOMB["Tombstone immediately<br/>all queries exclude it"]
    TOMB --> JOB["Enqueue purge job<br/>idempotent + resumable"]
    JOB --> O["Delete ALL object versions<br/>originals + derivatives + renders"]
    JOB --> T["Delete document_texts, document_pages,<br/>document_chunks<br/>(EMBEDDINGS GO WITH THE ROWS)"]
    JOB --> C["Mark dependent citations unresolvable"]
    JOB --> D["Delete ai_extractions, assertions,<br/>corrections in scope"]
    JOB --> E["Delete cached summaries, exports,<br/>chat history, share links"]
    JOB --> F["Purge queue jobs referencing the scope"]
    O & T & C & D & E & F --> CH{"VERIFY:<br/>similarity search returns 0 rows<br/>object inventory empty"}
    CH -->|"fail"| RETRY["Retry; do NOT report success"]
    CH -->|"pass"| R["Signed deletion receipt<br/>categories + counts + timestamp<br/>+ BACKUP PURGE WINDOW in days"]
    R --> AUD["Audit entry: deletion occurred<br/>NO case content recorded"]
    BACKUP["Backups"] -.->|"purge on their own schedule —<br/>stated in the receipt, never denied"| R

    style CH fill:#dff
    style R fill:#efe
```

**What to notice.** Embeddings are columns on chunk rows, so deleting the chunk deletes the vector
in the same transaction — this is why the single-database decision pays off (ADR-004, RT-11). The
job does not report success without passing verification. Backup retention is disclosed rather than
denied (ADR-017).

---

## D13 — Deployment topology

```mermaid
graph TB
    subgraph Vercel["Vercel"]
        NEXT["Next.js app<br/>SSR + route handlers"]
        EDGE["CDN + edge caching"]
    end
    subgraph Container["Container host (region: chosen)<br/>Fly.io / Railway / Render / ECS Fargate"]
        WRK["Worker process<br/>pg-boss consumers"]
        OCRP["OCR pool<br/>CPU-optimised, autoscaled"]
        CLAM["ClamAV sidecar"]
    end
    subgraph Managed["Managed data services (same region)"]
        PG[("PostgreSQL + pgvector<br/>multi-AZ, PITR")]
        S3[("S3-compatible object storage<br/>versioning + Object Lock")]
    end
    subgraph Support["Supporting services"]
        SENTRY["Error monitoring<br/>PII-scrubbed"]
        OTEL["Metrics / traces"]
        MAIL["Transactional email"]
        SECRETS["Secret manager / KMS"]
        POSTHOG["Product analytics<br/>no case content"]
    end
    USERS["Users"] --> EDGE --> NEXT
    NEXT --> PG
    NEXT --> S3
    NEXT --> SECRETS
    NEXT --> MAIL
    NEXT --> POSTHOG
    WRK --> PG
    WRK --> S3
    WRK --> OCRP
    WRK --> CLAM
    WRK --> SECRETS
    OCRP --> S3
    NEXT --> SENTRY
    WRK --> SENTRY
    NEXT --> OTEL
    WRK --> OTEL
    PG -.->|"PITR + nightly dump"| BACKUP[("Separate account/bucket<br/>Object Lock")]
    S3 -.->|"replication"| BACKUP
```

**What to notice.** The app is on Vercel; the workers are **not**, because OCR and long-running
processing do not fit a serverless execution model (ADR-014). Backups live in a separate account so
an attacker with production credentials cannot erase them.

---

## D14 — Feature dependency graph

```mermaid
graph TD
    F01[F01 Accounts/Orgs] --> F02[F02 Matters]
    F02 --> F03[F03 Roles/Permissions]
    F02 --> F48[F48 Onboarding]
    F03 --> F04[F04 Secure Upload]
    F04 --> F05[F05 Processing Pipeline]
    F05 --> F07[F07 Extraction/OCR]
    F05 --> F09[F09 Classification]
    F07 --> F10[F10 Entity Extraction]
    F09 --> F10
    F05 --> F15[F15 Evidence Viewer]
    F15 --> F16[F16 Citation System]
    F16 --> F12[F12 Master Timeline]
    F10 --> F12
    F16 --> F11[F11 Review Queue]
    F11 --> F24[F24 Corrections/History]
    F12 --> F13[F13 Person Profiles]
    F10 --> F13
    F13 --> F14[F14 Org Profiles]
    F05 --> F17[F17 Search]
    F16 --> F17
    F17 --> F19[F19 AI Chat]
    F16 --> F20[F20 Citation Verification]
    F20 --> F19
    F19 --> F21[F21 Case Summary]
    F12 --> F26[F26 Allegations]
    F13 --> F26
    F27[F27 Contradiction Engine] --> F26
    F20 --> F27
    F12 --> F28[F28 Statement Evolution]
    F12 --> F22[F22 Lawyer Brief]
    F26 --> F22
    F27 --> F22
    F32[F32 Financial Ledger] --> F22
    F22 --> F39[F39 Share Links]
    F12 --> F35[F35 Story Builder]
    F35 --> F22
    F41[F41 Audit Log] --> F40[F40 Deletion]
    F32 --> F33[F33 Fund Tracing]
    F10 --> F34[F34 Relationship Graph]

    style F16 fill:#ffd
    style F20 fill:#ffd
    style F22 fill:#efe
```

**What to notice.** The two dashed-highlighted nodes are the load-bearing infrastructure: **F16
(citations) is a dependency of the timeline, review, search, and every AI feature**, and **F20
(verification) is a dependency of chat and contradictions**. This is why the build order in
`05-mvp-scope.md` §7 puts the citation substrate before the AI assistant.

---

## D15 — Roadmap phases

```mermaid
graph LR
    P0["Phase 0<br/>Research &<br/>Architecture<br/><i>specs, legal<br/>engagement</i>"] --> P1["Phase 1<br/>Foundation<br/><i>auth, tenancy,<br/>RLS, audit</i>"]
    P1 --> P2["Phase 2<br/>Ingestion<br/><i>upload, extract,<br/>OCR, pipeline</i>"]
    P2 --> P3["Phase 3<br/>Search &<br/>Citations<br/><i>hybrid retrieval,<br/>evidence viewer</i>"]
    P3 --> P4["Phase 4<br/>Timeline &<br/>Entities<br/><i>chronology,<br/>review, corrections</i>"]
    P4 --> P5["Phase 5<br/>AI Assistant<br/><i>grounded chat,<br/>verification</i>"]
    P5 --> P6["Phase 6<br/>Contradictions &<br/>Allegations<br/><i>precision-gated,<br/>Phase 2 feature</i>"]
    P6 --> P7["Phase 7<br/>Story &<br/>Brief<br/><i>the growth loop</i>"]
    P7 --> P8["Phase 8<br/>Security<br/>Hardening<br/><i>pen test, DPIA,<br/>counsel sign-off</i>"]
    P8 --> P9["Phase 9<br/>Beta<br/><i>10 design partners,<br/>real matters</i>"]
    P9 --> P10["Phase 10<br/>Money, Graph,<br/>Teams<br/><i>professional tier</i>"]

    style P3 fill:#ffd
    style P5 fill:#ffd
    style P7 fill:#efe
    style P8 fill:#fee
```

**What to notice.** Phase 3 (citations) precedes Phase 5 (AI), which is the reverse of the instinct
to demo something quickly. Building the citation substrate first makes the no-unsupported-assertion
guarantee structural rather than aspirational. Phase 8 is release-blocking: no public launch before
the penetration test and the legal sign-offs.

---

## Related documents

- `06-system-architecture.md`, `07-ai-architecture.md`, `08-document-ingestion.md`,
  `09-evidence-provenance.md`, `10-database-schema.md`, `12-security-architecture.md`,
  `03-user-journeys.md`, `04-feature-specification.md`, `05-mvp-scope.md`, `19-roadmap.md`
- `wireframes/` — screen-level wireframes
- `24-architecture-decisions.md` — the reasoning behind the shapes shown here
