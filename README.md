# ⚡ Payment Ledger — PIX-like Distributed Payment System

<p align="center">

<img src="https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
<img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/Fastify-Framework-000000?style=for-the-badge&logo=fastify"/>
<img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql&logoColor=white"/>
<img src="https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white"/>
<img src="https://img.shields.io/badge/Docker-Container-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
<img src="https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens"/>
<img src="https://img.shields.io/badge/License-MIT-success?style=for-the-badge"/>

</p>

---

## 🚀 Overview

**Payment Ledger** é um sistema de transferências financeiras inspirado no **PIX**, desenvolvido para simular arquiteturas bancárias modernas com foco em **consistência financeira**, **alta concorrência**, **sistemas distribuídos** e **processamento seguro de transações**.

O projeto implementa diversos padrões utilizados por bancos e fintechs para garantir que cada transferência seja processada de forma confiável, auditável e resiliente.

---

# 🌐 Live Demo

🔗 **Projeto**

> https://benjaminreiis.github.io/PixFlow-Distributed-Payment-System/

---

# ✨ Principais Recursos

## 💳 Sistema Financeiro

* Transferências entre contas
* Ledger financeiro
* Histórico imutável de transações
* Controle de saldo
* Consistência financeira
* Operações ACID

---

## 🔐 Segurança

* Autenticação JWT
* Rotas protegidas
* Validação de usuários
* Hash de senhas
* Middleware de autenticação

---

## ⚡ Controle de Concorrência

* Pessimistic Locking (`FOR UPDATE`)
* Distributed Locks utilizando Redis
* Prevenção de Race Conditions
* Ordenação determinística de locks
* Garantia de integridade dos dados

---

## 🔄 Idempotência

* Header `Idempotency-Key`
* Bloqueio de pagamentos duplicados
* Cache Redis
* Requisições seguras
* Reprocessamento controlado

---

## 📦 Processamento Assíncrono

* Background Workers
* Queue Processing
* Retry automático
* Exponential Backoff
* Dead Letter Queue (DLQ)

---

## 📊 Observabilidade

* Logs estruturados
* Auditoria completa
* Rastreamento de transações
* Metadados
* Monitoramento

---

# 🏗 Arquitetura

```text
payment-ledger
│
├── prisma/
├── scripts/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── modules/
│   ├── queues/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── workers/
│
├── test/
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

# 🛠 Stack Tecnológica

## Backend

* Node.js
* TypeScript
* Fastify

## Banco de Dados

* PostgreSQL
* Prisma ORM

## Cache

* Redis

## Segurança

* JWT Authentication
* Bcrypt

## DevOps

* Docker
* Docker Compose

## Logging

* Pino Logger

---

# ⚙ Fluxo de Transferência

```text
Cliente

      │

      ▼

Autenticação JWT

      │

      ▼

Validação da Requisição

      │

      ▼

Idempotency Check (Redis)

      │

      ▼

Distributed Lock

      │

      ▼

Transação ACID

      │

      ▼

Atualização do Ledger

      │

      ▼

Persistência PostgreSQL

      │

      ▼

Registro de Auditoria

      │

      ▼

Resposta da API
```

---

# 🚀 Como Executar

## 1️⃣ Clonar o projeto

```bash
git clone https://github.com/seu-usuario/payment-ledger.git
```

---

## 2️⃣ Entrar na pasta

```bash
cd payment-ledger
```

---

## 3️⃣ Instalar dependências

```bash
npm install
```

---

## 4️⃣ Subir containers

```bash
docker compose up -d
```

---

## 5️⃣ Executar migrations

```bash
npx prisma migrate dev
```

---

## 6️⃣ Iniciar aplicação

```bash
npm run dev
```

---

# 📡 Endpoints

## Autenticação

```http
POST /auth/login
```

---

## Transferências

```http
POST /transfers
```

---

## Contas

```http
GET /accounts/:id
```

---

## Histórico

```http
GET /transfers/history
```

---

# 🧠 Conceitos de Engenharia

Este projeto aplica diversos conceitos encontrados em sistemas financeiros reais.

* Distributed Systems
* Financial Consistency
* ACID Transactions
* Ledger Architecture
* CQRS Concepts
* Idempotency
* Distributed Locks
* Pessimistic Locking
* Concurrency Control
* Retry Pattern
* Dead Letter Queue
* Background Workers
* Fault Tolerance
* Event Processing
* Secure Authentication
* Audit Trail
* Structured Logging
* High Performance APIs

---

# 📈 Objetivos do Projeto

Este projeto foi desenvolvido para estudar e demonstrar conhecimentos em:

* Arquiteturas Distribuídas
* Engenharia Backend
* Sistemas Financeiros
* APIs Escaláveis
* Controle de Concorrência
* Microsserviços
* Engenharia de Software
* Boas práticas de desenvolvimento

---

# 📷 Preview

> Interface disponível em:

**https://benjaminreiis.github.io/PixFlow-Distributed-Payment-System/**

---

# 👨‍💻 Autor

## Benjamin Dos Reis

**Backend Engineer**

Especializado em:

* Sistemas Financeiros
* APIs REST
* Node.js
* Java
* Spring Boot
* Microsserviços
* Sistemas Distribuídos
* Cloud Computing
* PostgreSQL
* Docker
* Redis

---

# 📄 Licença

Distribuído sob a licença **MIT**.

Sinta-se livre para utilizar, estudar e contribuir com este projeto.

---

<div align="center">

### ⭐ Se este projeto foi útil, deixe uma estrela no repositório!

**Obrigado pela visita! 🚀**

</div>
