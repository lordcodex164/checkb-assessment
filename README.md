# 🏦 Microservice Wallet System

A production-ready, microservice-based wallet system built with **NestJS**, **gRPC**, **Prisma ORM**, and **PostgreSQL** in a monorepo architecture.

---

## 📐 Architecture

```
backend-assessment/
├── apps/
│   ├── user-service/          # Manages users (gRPC port 5001)
│   └── wallet-service/        # Manages wallets (gRPC port 5002)
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
Client
  │
  ├──gRPC──► User Service (port 5001) ──► user_service_db (PostgreSQL :5432)
  │
  └──gRPC──► Wallet Service (port 5002) ──► wallet_service_db (PostgreSQL :5433)
                    │
                    └──gRPC──► User Service (verifies user exists)
```

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

Both services will be available immediately:
- User Service  → `localhost:5001`
- Wallet Service → `localhost:5002`

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

#### 5. Start the services (two terminals)

```bash
# Terminal 1 — User Service
cd apps/user-service && npm run start:dev

# Terminal 2 — Wallet Service
cd apps/wallet-service && npm run start:dev
```

---

## 🌐 Deployed Services

This project is already deployed. Use the following URLs to access the deployed services:

- User Service: https://user-service-fjbq.onrender.com
- Wallet Service: https://wallet-service-8v1o.onrender.com

Note:
- These endpoints are the publicly reachable service hostnames. When calling the deployed services with gRPC tools, ensure you use the proper TLS/port settings (see the gRPC note below).
- If you plan to call the deployed gRPC endpoints from other services or clients, configure `USER_SERVICE_URL` and `WALLET_SERVICE_URL` environment variables in your deployment platform to point to the above hostnames (or to private/internal hostnames if using private networking).


## 🧪 API Testing

All services expose **gRPC** endpoints. Use [`grpcurl`](https://github.com/fullstorydev/grpcurl) for quick CLI testing, or import the Postman collection from `docs/wallet-system.postman_collection.json`.

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
  -d '{"userId": "<USER_ID>"}' \
  localhost:5002 wallet.WalletService/CreateWallet
```

#### CreateWallet (deployed)
```bash
grpcurl -proto packages/proto/wallet.proto \
  -d '{"userId":"<USER_ID>"}' \
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
  -d "{\"userId\": \"$USER_ID\"}" \
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
| `CreateWallet` | `{ userId }` | `WalletResponse` |
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

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 10 |
| Transport | gRPC (`@nestjs/microservices`, `@grpc/grpc-js`) |
| ORM | Prisma 5 |
| Database | PostgreSQL 15 |
| Validation | class-validator, class-transformer |
| Logging | nestjs-pino (structured JSON logs) |
| Containerisation | Docker + docker-compose |

---

## 📁 Key Files at a Glance

```
apps/user-service/src/
├── main.ts                        # gRPC bootstrap (port 5001)
├── app.module.ts                  # Root module with Pino logger
├── prisma/
│   ├── prisma.service.ts          # PrismaClient wrapper
│   └── prisma.module.ts
└── users/
    ├── dto/create-user.dto.ts     # class-validator DTO
    ├── users.service.ts           # Business logic
    └── users.controller.ts        # GrpcMethod handlers

apps/wallet-service/src/
├── main.ts                        # gRPC bootstrap (port 5002)
├── app.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── grpc/
│   └── grpc-client.module.ts      # ClientsModule → UserService
└── wallets/
    ├── dto/wallet.dto.ts           # Validated DTOs for all operations
    ├── wallets.service.ts          # Business logic + $transaction
    └── wallets.controller.ts       # GrpcMethod handlers
```

---

## 🛠️ Troubleshooting & Notes

- Ensure `packages/proto` and `packages/prisma/schema.prisma` are available in your Docker build context so runtime and `prisma generate` can find them.
- When using monorepo workspaces, prefer installing dependencies at repo root (hoisted) to avoid duplicate `node_modules` and conflicting versions.
- If you deploy to cloud providers (Render, etc.), configure `DATABASE_URL`, `USER_SERVICE_URL`, and `WALLET_SERVICE_URL` via environment variables.
- For production DB migrations, use `npx prisma migrate deploy` (not `migrate dev`).

---

If you want, I can:
- Add a short `deploy.md` with step-by-step Render deployment instructions using the Dockerfiles already in `apps/*`.
- Create a `render.yaml` for one-click Render setup with the two services and a managed Postgres entry (you will need to add secrets and confirm plan).
- Add a `health` HTTP endpoint to both services for platform health checks.

Happy to help with any of the above — tell me which next step you want.
