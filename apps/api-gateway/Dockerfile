FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
RUN npm install --ignore-scripts

# Copy source files
COPY apps/api-gateway ./apps/api-gateway

# Generate Prisma client from root schema, then build service
RUN npm run build --prefix apps/api-gateway

FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api-gateway/dist ./apps/api-gateway/dist

EXPOSE 5001
CMD ["node", "apps/api-gateway/dist/main.js"]
