# 🏦 Microservice Wallet System

A production-ready, microservice-based wallet system built with **NestJS**, **gRPC**, **Prisma ORM**, and **PostgreSQL** in a monorepo architecture.

**HTTP clients (Postman, curl, browsers, mobile apps) should call the API Gateway.** The gateway accepts REST/JSON and forwards to the **User** and **Wallet** microservices over gRPC. You can still call those services directly with gRPC tools (e.g. `grpcurl`) for debugging.

---

## 📐 Architecture

```
backend-assessment/
├── apps/
│   ├── api-gateway/           # HTTP → gRPC bridge (REST, default port 3000)
│   ├── user-service/          # Users (gRPC port 5001)
│   └── wallet-service/        # Wallets (gRPC port 5002)
│
├── packages/
│   ├── proto/                 # Shared .proto definitions
│   │   ├── user.proto
│   │   └── wallet.proto
│   └── prisma/                # Shared Prisma schema + migrations
│       ├── schema.prisma
│       └── migrations/
│
├── docs/
│   └── wallet-system.postman_collection.json
├── docker-compose.yml
└── README.md
```

### Service Communication

```
Client (HTTP/JSON)
  │
  └──► API Gateway (HTTP :3000)
          │
          ├──gRPC──► User Service (:5001) ──► PostgreSQL (user DB)
          │
          └──gRPC──► Wallet Service (:5002) ──► PostgreSQL (wallet DB)
                              │
                              └──gRPC──► User Service (verifies user exists)
```

Direct gRPC clients can also talk to User / Wallet services on `5001` / `5002` without going through the gateway.

---

## 🚀 Quick Start

### Prerequisites

- Node.js v20+
- PostgreSQL 15+ (or Docker)
- `npm` v9+

---

### Option A — Docker (recommended)

Spin up both services and both databases in one command:

```bash
docker-compose up --build
```

Both backend services will be available:
- User Service → `localhost:5001` (gRPC)
- Wallet Service → `localhost:5002` (gRPC)

The **API Gateway** is not defined in `docker-compose.yml` in this repo. To exercise **HTTP** endpoints locally, run the gateway on your machine (see Option B) after the stack is up, or add an `api-gateway` service to Compose that publishes port `3000` and sets `USER_SERVICE_URL` / `WALLET_SERVICE_URL` to the user and wallet containers (e.g. `user-service:5001`, `wallet-service:5002` on the Compose network).

---

### Option B — Local Development

#### 1. Install dependencies

```bash
# Root
npm install

# User Service
cd apps/user-service && npm install

# Wallet Service
cd apps/wallet-service && npm install

# API Gateway (HTTP)
cd apps/api-gateway && npm install
```

#### 2. Create the databases

```sql
-- In psql or any PostgreSQL client:
CREATE DATABASE user_service_db;
CREATE DATABASE wallet_service_db;
```

#### 3. Configure environment variables

**User Service** — `apps/user-service/.env`
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/user_service_db?schema=public"
USER_SERVICE_URL=0.0.0.0:5001
NODE_ENV=development
```

**Wallet Service** — `apps/wallet-service/.env`
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/wallet_service_db?schema=public"
WALLET_SERVICE_URL=0.0.0.0:5002
USER_SERVICE_URL=localhost:5001
NODE_ENV=development
```

**API Gateway** — optional `.env` in `apps/api-gateway/` (defaults match local dev if omitted):

```env
PORT=3000
USER_SERVICE_URL=localhost:5001
WALLET_SERVICE_URL=localhost:5002
```

The gateway uses these addresses to reach the User and Wallet gRPC servers (`host:port`, no `http://` prefix).

#### 4. Run Prisma migrations

Each service shares the same schema but uses its own database. Run migrations for both:

```bash
# User Service DB
cd apps/user-service
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/user_service_db?schema=public" \
  npx prisma migrate dev --schema=../../packages/prisma/schema.prisma --name init

# Wallet Service DB
cd apps/wallet-service
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/wallet_service_db?schema=public" \
  npx prisma migrate dev --schema=../../packages/prisma/schema.prisma --name init
```

Generate the Prisma client:

```bash
npx prisma generate --schema=packages/prisma/schema.prisma
```

#### 5. Start the services (three terminals)

Start **User** and **Wallet** first so the gateway can connect when it boots.

```bash
# Terminal 1 — User Service
cd apps/user-service && npm run start:dev

# Terminal 2 — Wallet Service
cd apps/wallet-service && npm run start:dev

# Terminal 3 — API Gateway (HTTP for Postman / curl)
cd apps/api-gateway && npm run start:dev
# or from repo root: npm run start:api
```

The HTTP API is served at **`http://localhost:3000`** (or whatever you set `PORT` to). Use the routes in [HTTP API (API Gateway)](#http-api-api-gateway) below.

---

## 🌐 Deployed Services

This project includes deployed **gRPC** backends:

- User Service: `https://user-service-fjbq.onrender.com` (gRPC; use port `443` with TLS in `grpcurl`)
- Wallet Service: `https://wallet-service-8v1o.onrender.com` (gRPC; port `443`)

There is **no** shared public URL for the API Gateway in this README—expose your own HTTP gateway in front of these services if you need REST on the internet. Locally, use [HTTP API (API Gateway)](#http-api-api-gateway) against `http://localhost:3000`.

**Notes**

- When calling deployed services with gRPC tools, use the proper TLS/port settings (see below).
- For other services (or a self-hosted API Gateway), set `USER_SERVICE_URL` and `WALLET_SERVICE_URL` to reachable `host:port` values (internal hostnames on a private network are fine).

---

🧠 Key reality (important)
Scenario	                            Works on Render?
REST (HTTP/1.1)	                        ✅ Yes
gRPC internal (same container/network)	✅ Yes
gRPC external (Postman, grpcurl)	      ❌ No

## 🌐 HTTP API (API Gateway)

Use this surface for **Postman**, **curl**, and any HTTP client. The gateway validates JSON bodies (`class-validator`) and translates requests to gRPC calls.

| Item | Value |
|------|--------|
| **Default base URL** | `http://localhost:3000` |
| **Port** | `PORT` env (default `3000`) |
| **Upstream gRPC** | `USER_SERVICE_URL`, `WALLET_SERVICE_URL` (`host:port`, e.g. `localhost:5001`) |

### Routes

| Method | Path | Body (JSON) | Maps to gRPC |
|--------|------|-------------|--------------|
| `GET` | `/` | — | App root (hello string) |
| `POST` | `/users` | `{ "email": string, "name": string }` | `CreateUser` |
| `GET` | `/users/:id` | — | `GetUserById` (`:id` = user UUID) |
| `POST` | `/wallets` | `{ "userId": string (UUID v4), "type": string }` | `CreateWallet` |
| `GET` | `/wallets/:id` | — | `GetWallet` (`:id` is the **user** UUID, not the wallet row id) |
| `POST` | `/wallets/:id/debit` | `{ "amount": number }` (positive) | `DebitWallet` |
| `POST` | `/wallets/:id/credit` | `{ "amount": number }` (positive) | `CreditWallet` |

**Notes**

- Wallet routes use `:id` in the URL, but that value is sent to the backend as **`userId`** (per `wallet.proto`).
- Unknown JSON fields are rejected when validation runs with `forbidNonWhitelisted` (gateway `main.ts`).

### Examples (curl)

```bash
BASE=http://localhost:3000

# Create user
curl -s -X POST "$BASE/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","name":"John Doe"}'

# Get user (replace USER_ID)
curl -s "$BASE/users/USER_ID"

# Create wallet (user must exist; pick a wallet type string used by your data layer)
curl -s -X POST "$BASE/wallets" \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","type":"standard"}'

# Get wallet by user id
curl -s "$BASE/wallets/USER_ID"

curl -s -X POST "$BASE/wallets/USER_ID/credit" \
  -H "Content-Type: application/json" \
  -d '{"amount":1000}'

curl -s -X POST "$BASE/wallets/USER_ID/debit" \
  -H "Content-Type: application/json" \
  -d '{"amount":250}'
```

### Postman

Create a collection with **base URL** `http://localhost:3000` (or your Docker-published port). Use **Body → raw → JSON** for `POST` requests. No gRPC or TLS configuration is required on the gateway itself.

---

## 🧪 API Testing (direct gRPC)

The **User** and **Wallet** services expose **gRPC** on ports **5001** and **5002**. Use [`grpcurl`](https://github.com/fullstorydev/grpcurl) for CLI testing, or import `docs/wallet-system.postman_collection.json` if your collection targets gRPC directly.

For typical app integration and Postman-over-HTTP, prefer the [HTTP API (API Gateway)](#http-api-api-gateway) section above.

### Install grpcurl

```bash
# macOS
brew install grpcurl

# Linux
go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest
```

---

### User Service — `localhost:5001` (dev) / deployed host

#### CreateUser (dev)
```bash
grpcurl -plaintext \
  -proto packages/proto/user.proto \
  -d '{"email": "john.doe@example.com", "name": "John Doe"}' \
  localhost:5001 user.UserService/CreateUser
```

#### CreateUser (deployed)
```bash
grpcurl -proto packages/proto/user.proto \
  -d '{"email":"john.doe@example.com","name":"John Doe"}' \
  user-service-fjbq.onrender.com:443 user.UserService/CreateUser
```

**Response:**
```json
{
  "id": "a1b2c3d4-...",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### GetUserById (dev)
```bash
grpcurl -plaintext \
  -proto packages/proto/user.proto \
  -d '{"id": "<USER_ID>"}' \
  localhost:5001 user.UserService/GetUserById
```

#### GetUserById (deployed)
```bash
grpcurl -proto packages/proto/user.proto \
  -d '{"id":"<USER_ID>"}' \
  user-service-fjbq.onrender.com:443 user.UserService/GetUserById
```

---

### Wallet Service — `localhost:5002` (dev) / deployed host

#### CreateWallet (dev)
Wallet Service will call User Service internally to verify the user exists before creating a wallet.

```bash
grpcurl -plaintext \
  -proto packages/proto/wallet.proto \
  -d '{"userId": "<USER_ID>", "type": "standard"}' \
  localhost:5002 wallet.WalletService/CreateWallet
```

#### CreateWallet (deployed)
```bash
grpcurl -proto packages/proto/wallet.proto \
  -d '{"userId":"<USER_ID>","type":"standard"}' \
  wallet-service-8v1o.onrender.com:443 wallet.WalletService/CreateWallet
```

**Response:**
```json
{
  "id": "w1x2y3z4-...",
  "userId": "<USER_ID>",
  "balance": 0,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### GetWallet
```bash
grpcurl -plaintext \
  -proto packages/proto/wallet.proto \
  -d '{"userId": "<USER_ID>"}' \
  localhost:5002 wallet.WalletService/GetWallet
```

#### CreditWallet
```bash
grpcurl -plaintext \
  -proto packages/proto/wallet.proto \
  -d '{"userId": "<USER_ID>", "amount": 500}' \
  localhost:5002 wallet.WalletService/CreditWallet
```

**Response:**
```json
{
  "id": "w1x2y3z4-...",
  "userId": "<USER_ID>",
  "balance": 500,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### DebitWallet
```bash
grpcurl -plaintext \
  -proto packages/proto/wallet.proto \
  -d '{"userId": "<USER_ID>", "amount": 200}' \
  localhost:5002 wallet.WalletService/DebitWallet
```

---

### End-to-End Flow (copy-paste ready)

```bash
# 1. Create a user (deployed example)
USER=$(grpcurl -proto packages/proto/user.proto \
  -d '{"email":"test@example.com","name":"Test User"}' \
  user-service-fjbq.onrender.com:443 user.UserService/CreateUser)

echo $USER
USER_ID=$(echo $USER | grep -o '"id": *"[^"]*"' | head -1 | cut -d'"' -f4)
echo "User ID: $USER_ID"

# 2. Create wallet for that user (deployed)
grpcurl -proto packages/proto/wallet.proto \
  -d "{\"userId\": \"$USER_ID\", \"type\": \"standard\"}" \
  wallet-service-8v1o.onrender.com:443 wallet.WalletService/CreateWallet

# 3. Credit wallet
grpcurl -proto packages/proto/wallet.proto \
  -d "{\"userId\": \"$USER_ID\", \"amount\": 1000}" \
  wallet-service-8v1o.onrender.com:443 wallet.WalletService/CreditWallet

# 4. Debit wallet
grpcurl -proto packages/proto/wallet.proto \
  -d "{\"userId\": \"$USER_ID\", \"amount\": 250}" \
  wallet-service-8v1o.onrender.com:443 wallet.WalletService/DebitWallet

# 5. Check final balance
grpcurl -proto packages/proto/wallet.proto \
  -d "{\"userId\": \"$USER_ID\"}" \
  wallet-service-8v1o.onrender.com:443 wallet.WalletService/GetWallet
```

---

## 🗃️ Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  wallet    Wallet?
}

model Wallet {
  id        String   @id @default(uuid())
  userId    String   @unique
  balance   Float    @default(0)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## ⚙️ gRPC Endpoints

### User Service (`user.proto`)

| Method | Request | Response |
|---|---|---|
| `CreateUser` | `{ email, name }` | `UserResponse` |
| `GetUserById` | `{ id }` | `UserResponse` |

### Wallet Service (`wallet.proto`)

| Method | Request | Response |
|---|---|---|
| `CreateWallet` | `{ userId, type }` | `WalletResponse` |
| `GetWallet` | `{ userId }` | `WalletResponse` |
| `CreditWallet` | `{ userId, amount }` | `WalletResponse` |
| `DebitWallet` | `{ userId, amount }` | `WalletResponse` |

---

## 🛡️ Error Handling

All errors are returned as gRPC status codes:

| Scenario | gRPC Code |
|---|---|
| User not found | `NOT_FOUND` (5) |
| Wallet not found | `NOT_FOUND` (5) |
| User already exists | `ALREADY_EXISTS` (6) |
| Wallet already exists | `ALREADY_EXISTS` (6) |
| Insufficient balance | `FAILED_PRECONDITION` (9) |
| Invalid input / bad UUID | `INVALID_ARGUMENT` (3) |
| Unexpected server error | `INTERNAL` (13) |

---

## ✅ Bonus Features Implemented

| Feature | Details |
|---|---|
| **Prisma Transactions** | `$transaction` used in both `CreditWallet` and `DebitWallet` for atomic balance updates |
| **Validation** | `class-validator` + `class-transformer` on all DTOs; applied in every gRPC controller |
| **Error Handling** | Typed gRPC status codes for every failure path: not found, conflict, insufficient funds, bad input |
| **Structured Logging** | `nestjs-pino` with pretty-print in dev and JSON in production; every service method emits structured logs with context |
| **Inter-service gRPC** | Wallet Service calls `UserService.GetUserById` via gRPC before creating a wallet |
| **API Gateway** | Single HTTP entry point; maps REST routes to user and wallet gRPC with validated DTOs |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 10 |
| Public HTTP API | API Gateway (REST/JSON, ValidationPipe) |
| Transport | gRPC (`@nestjs/microservices`, `@grpc/grpc-js`) |
| ORM | Prisma 5 |
| Database | PostgreSQL 15 |
| Validation | class-validator, class-transformer |
| Logging | nestjs-pino (structured JSON logs) |
| Containerisation | Docker + docker-compose |

---

## 📁 Key Files at a Glance

```
apps/api-gateway/src/
├── main.ts                        # HTTP listen (PORT), global ValidationPipe
├── app.module.ts                  # Imports UserModule + WalletModule
├── grpc-proto.paths.ts            # Resolves shared .proto files from the monorepo
├── user/                          # REST /users → UserService gRPC
│   ├── user.module.ts
│   ├── user.controller.ts
│   ├── user-grpc.service.ts
│   └── dto/create-user.dto.ts
└── wallet/                        # REST /wallets → WalletService gRPC
    ├── wallet.module.ts
    ├── wallet.controller.ts
    ├── wallet-grpc.service.ts
    └── dto/

apps/user-service/src/
├── main.ts                        # gRPC bootstrap (port 5001)
├── app.module.ts                  # Root module with Pino logger
├── prisma/
│   ├── prisma.service.ts          # PrismaClient wrapper
│   └── prisma.module.ts
└── user/
    ├── dto/createuser.dto.ts      # class-validator DTO
    ├── user.service.ts            # Business logic
    └── user.controller.ts         # GrpcMethod handlers

apps/wallet-service/src/
├── main.ts                        # gRPC bootstrap (port 5002)
├── app.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── grpc/
│   └── grpc-client.module.ts      # ClientsModule → UserService
└── wallet/
    ├── dto/wallet.dto.ts           # Validated DTOs for all operations
    ├── wallet.service.ts           # Business logic + $transaction
    └── wallet.controller.ts        # GrpcMethod handlers
```

---

## 🛠️ Troubleshooting & Notes

- **API Gateway cannot reach User/Wallet:** Ensure `USER_SERVICE_URL` and `WALLET_SERVICE_URL` match where gRPC is listening (`localhost:5001` / `localhost:5002` locally; Docker Compose service names and ports on that network when the gateway runs in Compose).
- Ensure `packages/proto` and `packages/prisma/schema.prisma` are available in your Docker build context so runtime and `prisma generate` can find them.
- When using monorepo workspaces, prefer installing dependencies at repo root (hoisted) to avoid duplicate `node_modules` and conflicting versions.
- If you deploy to cloud providers (Render, etc.), configure `DATABASE_URL`, `USER_SERVICE_URL`, and `WALLET_SERVICE_URL` via environment variables.
- For production DB migrations, use `npx prisma migrate deploy` (not `migrate dev`).

---
