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
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY demo/seed/seed.js ./demo/seed/seed.js

RUN DATABASE_URL="postgresql://x:x@localhost:5432/x" pnpm exec prisma generate

# migrate deploy se ejecuta primero; si falla, el contenedor muere antes de arrancar node.
# El set -e hace que cualquier error detenga el script con código no-0,
# lo que Docker registra en los logs con el mensaje exacto del fallo.
CMD sh -c "set -e && pnpm exec prisma migrate deploy && node dist/main"
