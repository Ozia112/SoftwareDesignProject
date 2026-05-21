FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@10

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN DATABASE_URL="postgresql://x:x@localhost:5432/x" pnpm exec prisma generate
RUN pnpm run build

# ---- runtime ----
FROM node:22-alpine
WORKDIR /app

RUN npm install -g pnpm@10

COPY package.json pnpm-lock.yaml ./
# Instala todas las deps (incluyendo prisma CLI para generate y migrate)
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY prisma ./prisma

RUN DATABASE_URL="postgresql://x:x@localhost:5432/x" pnpm exec prisma generate

CMD sh -c "pnpm exec prisma migrate deploy && node dist/main"
