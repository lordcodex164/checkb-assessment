# ====================== Builder Stage ======================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root files first (for workspaces)
COPY package.json package-lock.json ./
COPY packages/prisma ./packages/prisma

# Copy app-specific package.json
COPY apps/user-service/package.json ./apps/user-service/

# Install dependencies (ci is better for reproducibility)
RUN npm ci --ignore-scripts

# Generate Prisma client (do this early if possible)
RUN npx prisma generate --schema=packages/prisma/schema.prisma

# Now copy source code
COPY apps/user-service ./apps/user-service
COPY packages/proto ./packages/proto   # if you have this

# Build
RUN npm run build --prefix apps/user-service

# ====================== Production Stage ======================
FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

# Copy only what's needed
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/user-service/dist ./apps/user-service/dist
COPY --from=builder /app/packages/proto ./packages/proto
COPY --from=builder /app/packages/prisma ./packages/prisma

# Explicitly ensure config + schema are there (safety)
COPY --from=builder /app/packages/prisma/prisma.config.ts ./packages/prisma/prisma.config.ts
COPY --from=builder /app/packages/prisma/schema.prisma ./packages/prisma/schema.prisma

# Copy .prisma client if needed (you already have this)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 5001

# Recommended CMD (no --config flag)
CMD ["sh", "-c", "npx prisma migrate deploy --schema=packages/prisma/schema.prisma && node apps/user-service/dist/main.js"]