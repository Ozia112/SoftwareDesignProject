FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@10

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# ---- runtime ----
FROM node:22-alpine
WORKDIR /app

RUN npm install -g pnpm@10

COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY prisma ./prisma

# pnpm guarda el cliente de Prisma en su virtual store, no en node_modules/.prisma
# Se genera aquí con una URL dummy — la real se inyecta en runtime vía DATABASE_URL
RUN DATABASE_URL="postgresql://x:x@localhost:5432/x" pnpm exec prisma generate

CMD sh -c "pnpm exec prisma migrate deploy && node dist/main"
