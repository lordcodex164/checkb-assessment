FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./
COPY apps/user-service/package.json ./apps/user-service/
COPY packages/prisma ./packages/prisma
COPY . .

RUN npm ci --ignore-scripts

RUN npx prisma generate --schema=packages/prisma/schema.prisma

# Copy source code
COPY apps/user-service ./apps/user-service
COPY packages/proto ./packages/proto

RUN npm install --ignore-scripts

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


EXPOSE 5001

CMD ["sh", "-c", "npx prisma migrate deploy --config=packages/prisma/prisma.config.ts && node apps/user-service/dist/main.js"]