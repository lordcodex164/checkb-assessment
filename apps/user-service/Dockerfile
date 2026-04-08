FROM node:22-alpine AS builder

WORKDIR /app

# Copy root files first for better caching
COPY package.json package-lock.json ./
COPY apps/user-service/package.json ./apps/user-service/
COPY packages/prisma ./packages/prisma

# Install dependencies (including dev deps needed for prisma generate + build)
RUN npm ci --ignore-scripts

# Copy source code
COPY apps/user-service ./apps/user-service
COPY packages/proto ./packages/proto

# === CRITICAL STEPS ===
# 1. Generate Prisma Client (always do this in builder)
RUN npx prisma generate --schema=packages/prisma/schema.prisma

# 2. Build the NestJS service
RUN npm run build --prefix apps/user-service

# Production stage
FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

# Copy only what's needed
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/user-service/dist ./apps/user-service/dist
COPY --from=builder /app/packages/proto ./packages/proto

# Optional: Copy the Prisma schema if you ever need to run migrations from inside the container
# COPY --from=builder /app/packages/prisma ./packages/prisma

EXPOSE 5001

# Best practice: Run prisma generate again in production just to be safe (very fast)
CMD ["sh", "-c", "npx prisma generate --schema=packages/prisma/schema.prisma && node apps/user-service/dist/main.js"]