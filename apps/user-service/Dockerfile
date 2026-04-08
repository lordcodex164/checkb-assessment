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

EXPOSE 5001

# App entry (nest build → apps/user-service/dist/main.js).
# Prisma schema: root package.json "prisma.schema" + copied packages/prisma/.
# Run DB migrations in Railway "Release" / CI, not here, unless you commit
# packages/prisma/migrations — then you can use:
#   npx prisma migrate deploy
# (schema path is resolved via package.json when cwd is /app).
CMD ["node", "apps/user-service/dist/main.js"]
