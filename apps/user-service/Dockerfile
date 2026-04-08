FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./
COPY apps/user-service/package.json ./apps/user-service/
COPY packages/prisma ./packages/prisma
COPY packages/prisma/prisma.config.ts ./packages/prisma/prisma.config.ts

RUN npm ci --ignore-scripts

# Copy source code
COPY apps/user-service ./apps/user-service
COPY packages/proto ./packages/proto

# Monorepo schema path (not ./prisma/schema.prisma)
RUN npx prisma generate --schema=packages/prisma/schema.prisma

RUN npm run build --prefix apps/user-service

# ====================== Production ======================
FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/user-service/dist ./apps/user-service/dist
COPY --from=builder /app/packages/proto ./packages/proto
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/packages/prisma ./packages/prisma
COPY --from=builder /app/packages/prisma/prisma.config.ts ./packages/prisma/prisma.config.ts
EXPOSE 5001

# Apply SQL from packages/prisma/migrations, then start gRPC.
# Requires DATABASE_URL in the environment (Railway / Render Postgres).
CMD ["sh", "-c", "npx prisma migrate deploy --schema=packages/prisma/schema.prisma && node apps/user-service/dist/main.js"]
