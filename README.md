# ⚡ Payment Ledger — PIX-like Transfer System

https://benjaminreiis.github.io/PixFlow-Distributed-Payment-System/

Backend project focused on distributed systems, financial consistency and concurrent transaction processing.

Built to simulate real-world banking transfer architectures using modern backend engineering practices.

---

## 🚀 Stack

* Node.js + TypeScript + Fastify
* PostgreSQL + Prisma
* Redis
* Docker + Docker Compose
* JWT Authentication
* Pino Logger

---

## 🔥 Features

### Financial Consistency

* ACID transactions
* Ledger-based balance updates
* Pessimistic locking (`FOR UPDATE`)
* Immutable transaction history

### Idempotency

* `Idempotency-Key` support
* Duplicate prevention
* Redis-based validation

### Async Processing

* Queue-based transfers
* Background workers
* Retry with backoff
* Dead Letter Queue (DLQ)

### Concurrency Protection

* Distributed Redis locks
* Race condition prevention
* Deterministic lock ordering

### Audit & Logs

* Structured logs
* Audit trail
* Transaction metadata

---

## 🏗️ Architecture

```bash id="rvjlwm"
payment-ledger/
├── src/
├── prisma/
├── test/
├── scripts/
├── Dockerfile
└── docker-compose.yml
```

---

## ▶️ Running Locally

### Start infrastructure

```bash id="b97m1v"
docker compose up -d
```

### Install dependencies

```bash id="v6jqlx"
npm install
```

### Run migrations

```bash id="4q8z7o"
npx prisma migrate dev
```

### Start application

```bash id="80p7l4"
npm run dev
```

---

## 🌐 Main Endpoints

```http id="s95lk9"
POST /auth/login
POST /transfers
GET  /accounts/:id
GET  /transfers/history
```

---

## 🧠 Engineering Concepts

* Distributed Systems
* Transaction Processing
* Idempotency
* Distributed Locks
* Async Queues
* Retry Pattern
* Fault Tolerance
* Financial Consistency
* Concurrency Control

---

## 👨‍💻 Author

Benjamin Dos Reis

Backend Engineer focused on scalable systems, APIs and distributed architectures.
