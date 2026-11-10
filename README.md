<div align="center">

# ⚡PixFlow — High-Availability Payment Engine

**An instant payments engine with idempotency, reconciliation, and reliable processing.**

![Status](https://img.shields.io/badge/status-active-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-ff69b4?style=for-the-badge)

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![OpenAPI](https://img.shields.io/badge/OpenAPI-6BA539?style=for-the-badge&logo=openapiinitiative&logoColor=white)

🌐 **English** · [Português (BR)](README.pt-BR.md)

</div>

---

## 📚 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Payment Lifecycle](#-payment-lifecycle)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [API](#-api)
- [Reconciliation](#-reconciliation)
- [Observability](#-observability)
- [Testing](#-testing)
- [Security](#-security)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧭 Overview

The Instant Payments Engine moves money in seconds without ever moving it twice. It accepts payment requests, processes them reliably even when networks and services fail, and continuously proves that its books match the outside world.

It is built around three guarantees:

| | Guarantee | What it means |
| :-: | --- | --- |
| 🔁 | **Idempotency** | Retrying a request never creates a duplicate payment. |
| 🛡️ | **Reliable processing** | No payment is lost or stuck, even through crashes and outages. |
| 🧾 | **Reconciliation** | Internal records are verified against external settlement data. |

## 🚀 Features

### ⚡ Instant Payments
- Low-latency payment creation with asynchronous settlement
- Pluggable connectors for payment rails and providers (e.g. PIX)
- Real-time status updates through webhooks
- Reversals and refunds

### 🔁 Idempotency
- `Idempotency-Key` header supported on every write endpoint
- Stored responses replayed for repeated requests
- Payload fingerprinting to detect key misuse
- Configurable key retention window

### 🛡️ Reliable Processing
- **Transactional outbox:** the payment and its event are saved in a single database transaction
- **At-least-once delivery** with **idempotent consumers**, giving exactly-once *effects*
- Retries with exponential backoff and jitter
- Dead-letter queue with replay tooling
- Graceful shutdown and safe worker recovery

### 🧾 Reconciliation
- Scheduled matching of ledger entries against settlement files
- Automatic detection of missing, duplicated, and mismatched transactions
- Discrepancy reports with a resolution workflow
- Full audit trail

## 🏗️ Architecture

```mermaid
flowchart LR
  C["Client"] --> G["API Gateway"]
  G --> P["Payments API"]
  P --> I[("Idempotency Store")]
  P --> DB[("Database")]
  P --> O["Outbox"]
  O --> Q{{"Message Queue"}}
  Q --> W["Processing Workers"]
  W --> L[("Ledger")]
  W --> R["Rail Connector"]
  R --> X["External Network"]
  W --> WH["Webhook Dispatcher"]
  X --> S["Settlement Files"]
  S --> RC["Reconciliation Job"]
  L --> RC
  RC --> D["Discrepancy Report"]
```

### Request flow

```mermaid
sequenceDiagram
  autonumber
  participant C as Client
  participant A as Payments API
  participant I as Idempotency Store
  participant D as Database + Outbox
  participant W as Worker
  participant N as External Network

  C->>A: POST /payments (Idempotency-Key)
  A->>I: Lookup key
  alt Key already completed
    I-->>A: Stored response
    A-->>C: Original response (replay)
  else New key
    A->>D: Save payment + outbox event (1 transaction)
    A-->>C: 202 Accepted (status: processing)
    D->>W: Outbox event delivered
    W->>N: Submit payment (idempotent)
    N-->>W: Confirmation
    W->>D: Post ledger entries + mark COMPLETED
    W-->>C: Webhook payment.completed
  end
```

## 🔄 Payment Lifecycle

```mermaid
stateDiagram-v2
  [*] --> CREATED
  CREATED --> VALIDATED
  CREATED --> REJECTED
  VALIDATED --> PROCESSING
  PROCESSING --> PROCESSING: retry
  PROCESSING --> COMPLETED
  PROCESSING --> FAILED
  COMPLETED --> REVERSED
  REJECTED --> [*]
  FAILED --> [*]
  REVERSED --> [*]
  COMPLETED --> [*]
```

| Status | Description |
| --- | --- |
| `CREATED` | Request accepted and stored |
| `VALIDATED` | Passed balance, limit, and risk checks |
| `PROCESSING` | Being submitted to the payment rail |
| `COMPLETED` | Confirmed and posted to the ledger |
| `FAILED` | Could not be completed after all retries |
| `REJECTED` | Refused by validation rules |
| `REVERSED` | Refunded after completion |

## 🛠️ Tech Stack

> Adjust this section to match your actual stack.

| Layer | Technology |
| --- | --- |
| API | REST / JSON, OpenAPI |
| Database | PostgreSQL |
| Idempotency & cache | Redis |
| Messaging | Message queue (e.g. RabbitMQ, Kafka) |
| Containers | Docker & Docker Compose |

## 🏁 Getting Started

### Prerequisites

- Docker and Docker Compose
- Git
- The runtime for your chosen language/framework

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/payments-engine.git
cd payments-engine

# 2. Create your environment file
cp .env.example .env

# 3. Start infrastructure (database, cache, queue)
docker compose up -d

# 4. Install dependencies and run migrations
make setup
make migrate

# 5. Start the API and the workers
make run-api
make run-worker
```

The API will be available at `http://localhost:8080` and the docs at `http://localhost:8080/docs`.

## ⚙️ Configuration

| Variable | Description | Example |
| --- | --- | --- |
| `DATABASE_URL` | Database connection string | `postgres://user:pass@localhost:5432/payments` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `QUEUE_URL` | Message broker connection string | `amqp://guest:guest@localhost:5672` |
| `IDEMPOTENCY_TTL` | How long idempotency keys are retained | `24h` |
| `WORKER_CONCURRENCY` | Parallel jobs per worker | `16` |
| `RETRY_MAX_ATTEMPTS` | Attempts before moving to the dead-letter queue | `8` |
| `RETRY_BACKOFF_BASE_MS` | Base delay for exponential backoff | `200` |
| `WEBHOOK_SIGNING_SECRET` | Secret used to sign webhook payloads | *(strong random value)* |
| `RECONCILIATION_CRON` | Reconciliation schedule | `0 2 * * *` |

> ⚠️ Never commit real secrets. Use a secrets manager in production.

## 📡 API

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/payments` | Create a payment |
| `GET` | `/payments/{id}` | Get payment status |
| `POST` | `/payments/{id}/reversal` | Reverse a completed payment |
| `GET` | `/reconciliation/runs` | List reconciliation runs |
| `GET` | `/reconciliation/runs/{id}/discrepancies` | List discrepancies of a run |
| `POST` | `/webhooks` | Register a webhook endpoint |

### Create a payment

```http
POST /payments
Authorization: Bearer <token>
Idempotency-Key: 7c9e6679-7425-40de-944b-e07fc1f90ae7
Content-Type: application/json

{
  "payer_account_id": "acc_123",
  "payee": { "type": "key", "value": "maria@example.com" },
  "amount": 15000,
  "currency": "BRL",
  "description": "Dinner"
}
```

```json
{
  "id": "pay_789",
  "status": "PROCESSING",
  "amount": 15000,
  "currency": "BRL",
  "created_at": "2026-11-10T12:00:00Z"
}
```

> Amounts are integers in the **smallest currency unit** (e.g. cents).

### Idempotency behavior

| Scenario | Result |
| --- | --- |
| Same key, same payload, first request completed | Original response is replayed |
| Same key, same payload, first request still running | `409 request_in_progress` |
| Same key, **different** payload | `422 idempotency_key_reuse` |
| New key | New payment is created |

### Webhooks

| Event | Sent when |
| --- | --- |
| `payment.created` | Payment accepted |
| `payment.completed` | Payment confirmed |
| `payment.failed` | Payment failed after all retries |
| `payment.reversed` | Payment reversed |
| `reconciliation.discrepancy` | A discrepancy was found |

Each webhook is signed with HMAC-SHA256 in the `X-Signature` header and retried with backoff until acknowledged.

## 🧾 Reconciliation

Reconciliation compares the internal ledger with settlement data from external networks and providers.

```mermaid
flowchart LR
  A["Ledger entries"] --> M{"Match"}
  B["Settlement file"] --> M
  M -->|Matched| OK["Reconciled"]
  M -->|Not matched| D["Discrepancy"]
  D --> R["Review and resolve"]
```

| Discrepancy | Meaning |
| --- | --- |
| `MISSING_EXTERNAL` | Recorded internally, absent from the settlement file |
| `MISSING_INTERNAL` | Present in the settlement file, absent internally |
| `AMOUNT_MISMATCH` | Both sides exist but the amounts differ |
| `STATUS_MISMATCH` | Both sides exist but the final states differ |
| `DUPLICATE` | The same payment appears more than once |

## 📊 Observability

- **Metrics:** payment throughput, latency (p50/p95/p99), retry rate, dead-letter queue depth, idempotency replay rate, reconciliation discrepancy count
- **Structured logs** with correlation IDs per payment
- **Distributed tracing** from API request to settlement
- **Alerts** on stuck payments, growing queues, and reconciliation failures

## 🧪 Testing

```bash
make test               # unit tests
make test-integration   # integration tests (infrastructure required)
make test-chaos         # failure-injection scenarios
make coverage           # coverage report
```

Critical scenarios to keep covered: duplicate requests under concurrency, worker crashes mid-processing, broker and database outages, network timeouts after a payment was sent, and reconciliation with incomplete files.

## 🔒 Security

- TLS for all traffic and signed webhooks
- Token-based authentication with scoped permissions
- Rate limiting on all endpoints
- Sensitive data masked in logs and traces
- Least-privilege access for services and database users

To report a vulnerability, please **do not** open a public issue. Contact: `security@your-org.com`.

## 🗺️ Roadmap

- [ ] Additional rail connectors
- [ ] Scheduled and recurring payments
- [ ] Real-time fraud scoring
- [ ] Reconciliation dashboard
- [ ] Multi-currency support

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## 📄 License

Licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

<div align="center">

Made with ☕ and a lot of care for every cent.

</div>
