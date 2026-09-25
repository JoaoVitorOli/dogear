# Dogear — Reading Platform API

> A study project: the backend of a fictional digital reading platform (e-books, audiobooks and minibooks), with a partner API for B2B integrations.

---

## 1. Overview

Dogear serves three kinds of clients:

| Actor       | Auth                  | What they do                                                                             |
| ----------- | --------------------- | ---------------------------------------------------------------------------------------- |
| **Reader**  | JWT                   | Searches books, reads, tracks progress, sees stats and achievements                      |
| **Partner** | API key (`x-api-key`) | Grants and revokes platform access for its own customers (e.g. telecom operators, banks) |
| **Admin**   | JWT (`admin` role)    | Manages the catalog, partners and plans                                                  |

---

## 2. User flows

### 2.1 Partner grants access to a customer

```mermaid
sequenceDiagram
    participant P as Partner System
    participant API as Dogear API
    participant SQL as MySQL
    participant MQ as RabbitMQ

    P->>API: POST /partners/v1/entitlements<br/>x-api-key + Idempotency-Key
    API->>API: Validate API key + partner rate limit
    API->>SQL: Idempotency-Key already used?
    alt Retried request
        API-->>P: 200 (same response as before)
    else New request
        API->>SQL: Create user (if needed) + entitlement
        API->>MQ: Publish "entitlement.granted"
        API-->>P: 201 Created
    end
```

- Retried requests (timeouts, network errors) never create duplicate entitlements.
- Partners can revoke access with `DELETE /partners/v1/entitlements/:id`.
- Each partner has a request quota based on its plan (e.g. 60 req/min basic, 600 req/min enterprise).

### 2.2 Reader searches, reads and tracks progress

```mermaid
sequenceDiagram
    participant R as Reader App
    participant API as Dogear API
    participant ES as Elasticsearch
    participant M as MongoDB
    participant MQ as RabbitMQ
    participant W as Workers

    R->>API: GET /v1/books/search?q=harry poter
    API->>ES: Fuzzy full-text search
    API-->>R: Results

    R->>API: POST /v1/reading-events {bookId, page, durationSec}
    API->>M: Store event
    API->>MQ: Publish "reading.progress.updated"
    API-->>R: 202 Accepted

    MQ->>W: Stats worker → update minutes read, streak, % done
    MQ->>W: Achievements worker → "Finished 5 books!"

    R->>API: GET /v1/me/stats
    API->>M: Read aggregated stats
    API-->>R: {minutesRead, streakDays, booksFinished, achievements}
```

- Search tolerates typos and supports autocomplete and filters (author, genre, format).
- The API responds right away; the heavy processing happens asynchronously in workers.

### 2.3 Admin adds a book

The admin creates a book (`POST /v1/admin/books`). It is saved in **MySQL** (the source of truth), a `book.created` event is published, and a worker indexes it in **Elasticsearch**. Failed indexing is retried, then sent to a dead letter queue.

---

## 3. Architecture

```mermaid
flowchart LR
    App[Reader App] -->|JWT| API
    Partner[Partner System] -->|API Key| API
    Admin[Admin] -->|JWT| API

    API[REST API<br/>Fastify] --> MySQL[(MySQL)]
    API --> Mongo[(MongoDB)]
    API --> ES[(Elasticsearch)]
    API -->|events| MQ{{RabbitMQ}}
    MQ --> Workers[Workers]
    Workers --> Mongo
    Workers --> ES
    Workers -.failures.-> DLQ{{Dead Letter Queue}}

    API -.traces, logs, metrics.-> DD[Datadog]
    Workers -.-> DD
```

The API and workers live in the same repo but run as **separate processes**, so they can scale independently.

### Where data lives

| Data                                                                      | Store             | Why                                                                 |
| ------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------- |
| Users, partners, API keys, plans, entitlements, idempotency keys, catalog | **MySQL**         | Relational, needs transactions and unique constraints               |
| Reading events, reader stats, achievements                                | **MongoDB**       | High-volume, append-only, flexible schema (pages vs. audio minutes) |
| Book search index                                                         | **Elasticsearch** | Full-text, fuzzy matching, autocomplete, faceted filters            |

### Events

| Routing key                                   | Consumers                                           |
| --------------------------------------------- | --------------------------------------------------- |
| `book.created` / `book.updated`               | Search indexer                                      |
| `reading.progress.updated`                    | Stats, Achievements                                 |
| `entitlement.granted` / `entitlement.revoked` | Welcome notification (logged), session invalidation |

**Reliability:** topic exchange, manual ack, retry with backoff (5s → 30s → 2min), dead letter queue, and idempotent consumers (each event has an `eventId`).

---

## 4. Tech stack

| Technology                        | Purpose                                           |
| --------------------------------- | ------------------------------------------------- |
| **Node.js + TypeScript**          | Language                                          |
| **Fastify**                       | REST API (workers are plain Node.js processes)    |
| **MySQL 8 + TypeORM** (or Prisma) | Relational data                                   |
| **MongoDB + Mongoose**            | Reading events and stats                          |
| **RabbitMQ**                      | Async processing, retries, DLQ                    |
| **Elasticsearch 8**               | Catalog search                                    |
| **Datadog** (`dd-trace` + Agent)  | APM, distributed traces, logs, metrics, dashboard |
| **Pino** (built into Fastify)     | Structured JSON logs with correlation ID          |
| **@fastify/swagger** (OpenAPI)    | API docs for v1 and v2                            |
| **@fastify/jwt** + API keys       | Authentication                                    |
| **@fastify/rate-limit**           | Per-partner rate limiting                         |
| **Jest + Supertest**              | Unit and e2e tests                                |
| **k6**                            | Load testing                                      |
| **Docker Compose**                | One-command local environment                     |

---

## 5. Main endpoints

| Method   | Route                                    | Description                                    |
| -------- | ---------------------------------------- | ---------------------------------------------- |
| `POST`   | `/v1/auth/register` · `/v1/auth/login`   | Sign up / get JWT                              |
| `GET`    | `/v1/books/search`                       | Search the catalog                             |
| `GET`    | `/v1/books/:id`                          | Book details                                   |
| `POST`   | `/v1/reading-events`                     | Record reading progress                        |
| `GET`    | `/v1/me/library` · `/v1/me/stats`        | Reader's books and stats                       |
| `POST`   | `/partners/v1/entitlements`              | Grant access (idempotent)                      |
| `DELETE` | `/partners/v1/entitlements/:id`          | Revoke access                                  |
| `GET`    | `/partners/v1/usage`                     | Partner quota usage                            |
| `POST`   | `/v1/admin/books` · `/v1/admin/partners` | Manage catalog and partners                    |
| `POST`   | `/v1/admin/partners/:id/api-keys`        | Issue a partner API key                        |
| `GET`    | `/v2/books/search`                       | Cursor-based pagination (v1 marked deprecated) |
| `GET`    | `/health` · `/docs`                      | Health check · Swagger UI                      |

---

## 6. Non-functional requirements

- **Security:** hashed passwords and API keys (keys shown only once), role-based authorization hooks, per-partner rate limiting, input validation.
- **Observability:** `x-correlation-id` propagated from HTTP through RabbitMQ into logs and traces; custom metrics (events/min, DLQ size, search latency); Datadog dashboard.
- **Reliability:** idempotent endpoints and consumers, retries + DLQ, health checks for every dependency.
- **Quality:** unit tests for business rules, e2e tests for main flows, ESLint + Prettier.

---

## 7. Five-day plan

| Day   | Deliverables                                                                          |
| ----- | ------------------------------------------------------------------------------------- |
| **1** | Docker Compose, Fastify setup, config, Swagger, users and auth (JWT + roles)          |
| **2** | Catalog (MySQL), partners and API keys, idempotent entitlements, rate limiting        |
| **3** | Reading events (MongoDB), RabbitMQ publishers and workers, retry and DLQ              |
| **4** | Elasticsearch indexing and search, Datadog tracing, logs and dashboard                |
| **5** | `/v2` endpoint, tests, k6 load test, seed data, README                                |

---

## 8. Out of scope

E-book reader or audio player (reading is simulated through events), file uploads, payments, real email delivery, front-end and cloud deployment.
