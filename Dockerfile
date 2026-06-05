# ===========================
# Build Stage
# ===========================
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y \
  openssl python3 make g++ curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma

# 1. FIXED: Changed from 'npm ci' to 'npm install' since there's no lockfile
RUN npm install

# Copy the rest of your application code
COPY . .

# 2. FIXED: Generate Prisma Client while the CLI devDependency still exists
RUN npx prisma generate

# 3. Build the NestJS application
RUN npm run build

# 4. NOW it is safe to remove devDependencies to shrink the image size
RUN npm prune --omit=dev


# ===========================
# Production Stage
# ===========================
FROM node:20-slim

RUN apt-get update && apt-get install -y \
  openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy production-ready files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/src/main"]