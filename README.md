# ⚡ Payment Ledger — Distributed Banking Transfer System

A high-performance distributed payment system inspired by real-world banking and fintech architectures.

Payment Ledger simulates secure bank transfers between accounts with balance consistency, concurrency protection, asynchronous processing, distributed locking and transactional guarantees.

Designed using modern backend engineering practices focused on scalability, resiliency and financial consistency.

---

# 🏗️ System Architecture

```bash id="8cl6ia"
payment-ledger/
│
├── README.md
├── package.json
├── tsconfig.json
├── .env.example
├── docker-compose.yml
├── Dockerfile
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config.ts
│   ├── logger.ts
│   │
│   ├── plugins/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   └── redis.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── accounts/
│   │   ├── transfers/
│   │   └── health/
│   │
│   └── infra/
│       ├── idempotency.ts
│       ├── distributedLock.ts
│       ├── queue.ts
│       ├── errors.ts
│       └── retry.ts
│
├── test/
│   ├── concurrency.int.test.ts
│   └── setup.ts
│
└── scripts/
    ├── seed.ts
    └── load.js
```

---

# 🚀 Features

## 💸 Real-Time Bank Transfers

* Instant account-to-account transfers
* ACID-compliant transactions
* Balance consistency guarantees
* Real-time transfer processing

---

## 🔒 Distributed Concurrency Protection

* Distributed account locking
* Race condition prevention
* Concurrent transfer simulation
* Atomic transaction control

---

## ⚡ Async Queue Processing

* Redis-backed queue system
* Asynchronous transfer processing
* Retry mechanism for failed transactions
* Background workers

---

## 🧠 Financial Consistency

* Idempotent transaction processing
* Duplicate transfer prevention
* Rollback safety
* Transaction integrity guarantees

---

## 📜 Audit & Observability

* Audit logs
* Transfer history
* Structured logging
* Request tracing
* Error monitoring

---

# 🛡️ Security Features

* JWT authentication
* Protected routes
* Request validation
* Distributed locking
* Retry policies
* Idempotency keys
* Secure transaction flow

---

# ⚙️ Technologies

## Backend

* Node.js
* TypeScript
* Fastify

## Database

* PostgreSQL
* Prisma ORM

## Infrastructure

* Redis
* Docker
* Docker Compose

## Authentication

* JWT

## Queue & Concurrency

* BullMQ
* Redis Locks
* Async Workers

---

# 🧩 Engineering Concepts

* Distributed Systems
* Event-Driven Architecture
* Financial Transaction Processing
* ACID Transactions
* Concurrency Control
* Idempotency
* Retry Pattern
* Distributed Locks
* Background Jobs
* Fault Tolerance
* Observability
* Scalability Patterns

---

# 🔄 Transfer Flow

```text id="kkm96l"
Client Request
      ↓
JWT Authentication
      ↓
Idempotency Validation
      ↓
Distributed Account Lock
      ↓
Balance Validation
      ↓
Database Transaction
      ↓
Queue Processing
      ↓
Transfer Commit
      ↓
Audit Logging
      ↓
Response
```

---

# 🧪 Concurrency Testing

The system includes integration tests simulating multiple concurrent transfers to validate:

* Race condition prevention
* Transaction consistency
* Lock reliability
* Duplicate prevention
* Fault tolerance

---

# 📦 Installation

## Clone Repository

```bash id="jlc82s"
git clone https://github.com/yourusername/payment-ledger.git
```

---

## Install Dependencies

```bash id="18zb4u"
npm install
```

---

## Configure Environment

```bash id="9lq9d5"
cp .env.example .env
```

---

## Start Infrastructure

```bash id="pl1i7d"
docker compose up --build
```

---

# ▶️ Running Application

## Development Mode

```bash id="nn8yo9"
npm run dev
```

---

## Production Mode

```bash id="ozzkpy"
npm run build
npm start
```

---

# 🧪 Running Tests

## Integration Tests

```bash id="0p6ydj"
npm run test
```

---

## Concurrency Tests

```bash id="b6bvt9"
npm run test:concurrency
```

---

# 🌐 API Endpoints

## Authentication

```http id="rx2jxk"
POST /auth/login
POST /auth/register
```

---

## Accounts

```http id="pryx40"
GET /accounts
GET /accounts/:id
```

---

## Transfers

```http id="ggs1pj"
POST /transfers
GET /transfers/history
```

---

# 📈 Scalability Considerations

This architecture was designed with scalability and resiliency in mind.

Future improvements may include:

* Kubernetes orchestration
* Kafka event streaming
* CQRS
* Event sourcing
* Distributed tracing
* OpenTelemetry
* API Gateway
* Rate limiting
* Fraud detection engine
* Multi-region deployment

---

# 🔥 System Highlights

✅ Distributed transfer architecture
✅ Redis-based distributed locking
✅ Async queue processing
✅ Idempotent financial operations
✅ Transaction consistency
✅ Race condition prevention
✅ Audit-ready logging
✅ Fault-tolerant retries
✅ Enterprise backend structure

---

# 👨‍💻 Author

## Benjamin Dos Reis

Backend Engineer focused on:

* Distributed systems
* Backend architecture
* Financial systems
* Cloud infrastructure
* Scalable APIs
* Database engineering
* Concurrency control

### 📧 Contact

[reisamorinn@gmail.com](mailto:reisamorinn@gmail.com)

### 🔗 LinkedIn

https://www.linkedin.com/in/benjamin-dos-reis-5aa7ab366/

---

# ⭐ Project Status

✅ Active Development
✅ Enterprise Architecture
✅ Financial Transaction Engine
✅ Distributed System Simulation
✅ Production-Oriented Backend Design
