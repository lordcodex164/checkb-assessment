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

COPY --from=builder /app/apps/user-service/dist ./apps/user-service/dist

COPY --from=builder /app/packages/proto ./packages/proto

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder /app/packages/prisma ./packages/prisma

ls -la
ls -la packages/prisma
ls -la packages/prisma/schema.prisma
ls -la packages/prisma/migrations
ls -la packages/prisma/migrations/20260408100000_init/
ls -la packages/prisma/migrations/20260408100000_init/migration.sql
ls -la packages/prisma/migrations/20260408100000_init/migration.sql.gz
ls -la packages/prisma/migrations/20260408100000_init/migration.sql.gz.base64
ls -la packages/prisma/migrations/20260408100000_init/migration.sql.gz.base64.txt

EXPOSE 5001

CMD [ "sh", "-c", "npx prisma migrate deploy --schema=packages/prisma/schema.prisma && node apps/user-service/dist/main.js"]