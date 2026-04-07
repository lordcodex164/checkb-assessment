FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json ./
COPY apps/wallet-service/package.json ./apps/wallet-service/
COPY packages/prisma ./packages/prisma/
RUN npm install --ignore-scripts

# Copy source files
COPY apps/wallet-service ./apps/wallet-service
COPY packages/proto ./packages/proto

# Generate Prisma client from root schema, then build service
RUN npx prisma generate --schema=packages/prisma/schema.prisma
RUN npm run build --prefix apps/wallet-service

FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/wallet-service/dist ./apps/wallet-service/dist
COPY --from=builder /app/packages/proto ./packages/proto

EXPOSE 5001
CMD ["node", "apps/wallet-service/dist/main.js"]
