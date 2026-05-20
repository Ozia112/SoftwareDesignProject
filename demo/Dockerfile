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

COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

# Migrar y arrancar
CMD sh -c "pnpm exec prisma migrate deploy && node dist/main"
