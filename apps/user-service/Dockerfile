FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies once at workspace root (skip scripts to avoid premature prisma generate)
COPY package.json package-lock.json ./
COPY apps/user-service/package.json ./apps/user-service/
COPY packages/prisma ./packages/prisma
RUN npm install --ignore-scripts

# Copy source needed for build/runtime
COPY apps/user-service ./apps/user-service
COPY packages/proto ./packages/proto

# Generate Prisma client from root schema, then build service
RUN npx prisma generate --schema=packages/prisma/schema.prisma
RUN npm run build --prefix apps/user-service

FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/user-service/dist ./apps/user-service/dist
COPY --from=builder /app/packages/proto ./packages/proto

EXPOSE 5001
CMD ["node", "apps/user-service/dist/main.js"]
