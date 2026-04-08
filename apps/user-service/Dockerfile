FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./
COPY apps/user-service/package.json ./apps/user-service/
COPY packages/prisma ./packages/prisma

RUN npm ci --ignore-scripts

# Copy source code
COPY apps/user-service ./apps/user-service
COPY packages/proto ./packages/proto

# Generate Prisma Client (this must succeed)
RUN npx prisma generate --schema=packages/prisma/schema.prisma

# Build the NestJS app
RUN npm run build --prefix apps/user-service

# ====================== Production Stage ======================
FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

# Copy production node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copy built app
COPY --from=builder /app/apps/user-service/dist ./apps/user-service/dist

# Copy proto files (if needed by your service)
COPY --from=builder /app/packages/proto ./packages/proto

# === CRITICAL: Copy the generated Prisma Client ===
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Optional but recommended: Copy the schema (helps if Prisma ever needs it at runtime)
COPY --from=builder /app/packages/prisma ./packages/prisma

EXPOSE 5001

# At the end of your Dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma generate && node dist/main"]