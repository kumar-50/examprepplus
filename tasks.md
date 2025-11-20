# Project Tasks & Sub-Todos

This document breaks down the multi-agent system build into phases. Each high-level task includes granular todos (checkboxes) you can tick as progress advances.

---
## Phase 1: Foundation (Data Contracts & Ingestion Core)
**Goal:** Establish schemas, ingestion pipeline skeleton, provenance.

### T1 (ID 1): Define Canonical TypeScript Interfaces
- [ ] Create `src/lib/models.ts` with interfaces: `Notification`, `Question`, `RetrievalChunk`, `QueryIntent`, `RankedContext`, `AnswerPayload`.
- [ ] Add supporting types (difficulty enum, chunk kind enum).
- [ ] Add Zod schemas for validation in `src/lib/schemas.ts`.
- [ ] Export barrel file `src/lib/index.ts`.
- [ ] Add lightweight unit test for schema validation.

### T2 (ID 2): Set Up Source Registry Storage
- [ ] Define Drizzle model or SQL table: `source_registry` (id, url, type, frequency, lastHash, parserType, lastFetchedAt).
- [ ] Migration file for table creation.
- [ ] CRUD helper in `src/db/sourceRegistry.ts`.
- [ ] Seed initial official RRB sources script.
- [ ] Add uniqueness constraint (url).
- [ ] Basic fetch + upsert test.

### T3 (ID 3): Implement Manual Ingestion Script
- [ ] CLI script `scripts/manual-ingest.ts` reading local file path.
- [ ] Detect file type (PDF/HTML) by extension & magic bytes.
- [ ] Wrap bytes + metadata into `RawAsset` (temp interface).
- [ ] Persist asset + initial provenance stamp.
- [ ] Log out generated hash & stored record ID.
- [ ] Error handling & exit codes.

### T4 (ID 4): Add SHA256 Hashing + Provenance Utility
- [ ] Utility `src/lib/provenance.ts` computing SHA256 for Buffer/string.
- [ ] Function to attach (sourceUrl, sourceHash, fetchedAt, parserVersion).
- [ ] Reuse in ingestion & parsing stages.
- [ ] Unit test hash stability (same input -> same hash).

### T5 (ID 5): Build HTML Notification Parser
- [ ] Parser `src/agents/parsers/htmlNotificationParser.ts`.
- [ ] Extract title, published date, body, topics placeholder.
- [ ] Validate via Zod schema.
- [ ] Persist `Notification` with status='pending'.
- [ ] Add minimal test using sample HTML fixture.

---
## Phase 2: Question Pipeline (Extraction & Enrichment)
**Goal:** Build question bank with enrichment signals.

### T6 (ID 6): PDF Question Extractor
- [ ] Parse PDF pages to text (library selection: pdf-parse/pdfjs-dist).
- [ ] Regex extraction for numbered stems.
- [ ] Option extraction (A|B|C|D) normalization.
- [ ] Answer key parsing (if present) mapping to correctIndex.
- [ ] Produce `RawQuestion[]` list.
- [ ] Store raw questions staging table.

### T7 (ID 7): Question Normalization & Dedup Logic
- [ ] Normalize whitespace, case, numbering removal.
- [ ] Compute stemHash + (stemHash + correctOption) composite key.
- [ ] Embedding similarity placeholder (stub function returns random until embeddings ready).
- [ ] Filter out near-duplicates (semantic threshold stub < 0.92).
- [ ] Mark unique questions status='active'.

### T8 (ID 8): Topic Tagging Baseline Pipeline
- [ ] Keyword rule set JSON (`data/topic_keywords.json`).
- [ ] Topic centroid placeholder vectors (stub).
- [ ] Tagging function cascading: keyword -> centroid similarity -> fallback 'UNCLASSIFIED'.
- [ ] Add topics array to questions.

### T9 (ID 9): Difficulty Estimator Heuristic
- [ ] Implement heuristic per spec (stem length, dispersion, multi-step flag).
- [ ] Option dispersion stub until embeddings available.
- [ ] Assign difficulty field for each active question.

### T10 (ID 10): Quality Scoring Function
- [ ] Compute parseConfidence (from extraction rules coverage).
- [ ] Clarity metric (stem length variance, punctuation heuristics).
- [ ] Duplicate risk (inverse of semantic distance average).
- [ ] Weighted formula producing qualityScore (0–1 or 0–100 scale decision).

---
## Phase 3: Indexing (Chunking + Hybrid Index)
**Goal:** Create retrieval-ready artifacts.

### T11 (ID 11): Chunking Implementation
- [ ] Notification semantic split (512–768 tokens) using sentence boundary.
- [ ] Questions as atomic chunks.
- [ ] Syllabus (future) topic-level split placeholder.
- [ ] Produce `RetrievalChunk[]` with metadata.

### T12 (ID 12): Embedding Provider Abstraction
- [ ] Interface `EmbeddingProvider` (embedText, embedBatch).
- [ ] Stub implementation returning random vectors.
- [ ] Config injection to switch provider later.
- [ ] Add caching layer placeholder.

### T13 (ID 13): Lexical Index Builder
- [ ] Tokenizer (simple: lowercase, split on non-word chars).
- [ ] Build inverted index: term -> postings list.
- [ ] Compute term frequencies & IDF map.
- [ ] Persist index snapshot (JSON or DB table).

### T14 (ID 14): Hybrid Retrieval Fusion
- [ ] BM25 scoring function.
- [ ] Vector similarity scoring using embeddings.
- [ ] Fusion strategy (linear weights w1, w2 config).
- [ ] Metadata filtering (examCode, topic, difficulty).
- [ ] Return ranked contexts list.

---
## Phase 4: RAG Core (Intent → Answer)
**Goal:** Generate grounded answers with citations.

### T15 (ID 15): Intent Classifier Baseline
- [ ] Rule-based classification (keywords mapping to INFO/PRACTICE/STRATEGY/META).
- [ ] Confidence heuristic.
- [ ] Fallback to most frequent class if ambiguous.

### T16 (ID 16): Answer Composer Module
- [ ] Prompt template with JSON citations block.
- [ ] Context assembly enforcing token budget.
- [ ] Generation call (stub or existing model API if available).
- [ ] Packaging into `AnswerPayload`.

### T17 (ID 17): Citation Verification Module
- [ ] Parse generated answer segments.
- [ ] For each claim, ensure at least one supporting chunk.
- [ ] Remove unsupported sentences or flag regeneration.
- [ ] Adjust answer confidence metric.

---
## Phase 5: Evaluation & Feedback
**Goal:** Measure performance & gather user signals.

### T18 (ID 18): Evaluation Harness & Metrics
- [ ] Define test query set (JSON) per intent.
- [ ] Run retrieval; compute precision@k.
- [ ] Grounding score calculation method.
- [ ] Aggregate metrics output report.

### T19 (ID 19): Feedback Capture Endpoint
- [ ] Simple API route `/feedback` storing (answerId, rating, comment).
- [ ] Persist in `feedback` table.
- [ ] Basic admin query function.

---
## Phase 6: Monitoring & Governance
**Goal:** Detect drift, schedule tasks, alert issues, enforce security.

### T20 (ID 20): Drift Detection Job
- [ ] Monthly topic distribution snapshot.
- [ ] Compute KL divergence vs previous month.
- [ ] Threshold alert emission.

### T21 (ID 21): Scheduler for Periodic Crawls
- [ ] Cron-like job runner (node-cron or custom).
- [ ] Reads `frequency` from source registry.
- [ ] Triggers crawler agents & logs.

### T22 (ID 22): Alerting for Failures/Outdated Content
- [ ] Alert channel abstraction (email/webhook/log only).
- [ ] Conditions: parse failure, drift alert, freshness lag > 24h.
- [ ] Suppression rules to avoid spam.

### T24 (ID 24): Security Controls & Allowlist
- [ ] Allowlist config of domains.
- [ ] Role-based access middleware stub (admin/user).
- [ ] Rate limiter (token bucket) for query API.

### T25 (ID 25): Performance Monitoring Baseline
- [ ] Capture latency metrics (timers around retrieval & answer compose).
- [ ] p95 calculation utility.
- [ ] Simple metrics export endpoint.

---
## Phase 7: Delivery & Ops
**Goal:** Minimal admin visibility & deployment automation.

### T23 (ID 23): Admin Dashboard Stub
- [ ] Page displaying counts (notifications, questions, pending items).
- [ ] Table of recent ingestion events.
- [ ] Placeholder charts for metrics.

### T26 (ID 26): Pilot Deployment Script
- [ ] Script to seed initial data & run ingestion once.
- [ ] Environment variable checklist (.env.example).
- [ ] Deployment README section.

---
## Cross-Cutting Concerns
- [ ] Logging: Structured log format per agent (timestamp, agent, action, status, artifactId).
- [ ] Error Handling: Central error util mapping to codes.
- [ ] Configuration: Central config loader (env + defaults).
- [ ] Testing Strategy: Minimum unit tests for critical utilities (hashing, parsing, scoring).

---
## Acceptance Criteria Mapping
- Notifications ingestion (Phase 1 complete tasks T1–T5).
- ≥200 unique questions (Phase 2 T6–T10).
- RAG answering with citations (Phases 3–4 T11–T17).
- Metrics & feedback loop (Phase 5 T18–T19).

---
## Suggested Execution Order (First Sprint)
1. T1 Interfaces & schemas
2. T2 Source registry
3. T4 Hash/provenance utility
4. T3 Manual ingestion script
5. T5 HTML parser

---
## Progress Tracking
Update checkboxes directly as tasks complete. Consider moving completed tasks to a "Done" section to reduce noise over time.

---
End of Tasks Document.
