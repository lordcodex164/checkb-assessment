FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json ./
COPY apps/wallet-service/package.json ./apps/wallet-service/
COPY packages/prisma ./packages/prisma/

# Install dependencies
RUN cd apps/wallet-service && npm install

# Copy source files
COPY apps/wallet-service ./apps/wallet-service
COPY packages ./packages

# Generate Prisma client
RUN cd apps/wallet-service && npx prisma generate --schema=../../packages/prisma/schema.prisma

# Build
RUN cd apps/wallet-service && npm run build

# ---- Production image ----
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/apps/wallet-service/dist ./dist
COPY --from=builder /app/apps/wallet-service/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 5002

CMD ["node", "dist/main"]
