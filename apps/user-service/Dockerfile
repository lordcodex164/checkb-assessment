FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json ./
COPY apps/user-service/package.json ./apps/user-service/
COPY packages/prisma ./packages/prisma/

# Install dependencies
RUN cd apps/user-service && npm install

# Copy source files
COPY apps/user-service ./apps/user-service
COPY packages ./packages

# Generate Prisma client
RUN cd apps/user-service && npx prisma generate --schema=../../../packages/prisma/schema.prisma

# Build
RUN cd apps/user-service && npm run build

# ---- Production image ----
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/apps/user-service/dist ./dist
COPY --from=builder /app/apps/user-service/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 5001

CMD ["node", "dist/main"]
