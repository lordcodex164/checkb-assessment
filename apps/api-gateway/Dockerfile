# Build from repository root so `packages/proto` is available:
#   docker build -f apps/api-gateway/Dockerfile .

FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
RUN npm install --ignore-scripts

# Copy source files
COPY apps/api-gateway ./apps/api-gateway

# Shared gRPC definitions (runtime path: /app/packages/proto — see grpc-proto.paths.ts)
COPY packages/proto ./packages/proto

# Build service
RUN npm run build --prefix apps/api-gateway

FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api-gateway/dist ./apps/api-gateway/dist
COPY --from=builder /app/packages/proto ./packages/proto

EXPOSE 3000
CMD ["node", "apps/api-gateway/dist/main.js"]
