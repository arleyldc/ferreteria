# =========================
# Etapa 1: dependencias
# =========================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm install

# =========================
# Etapa 2: build
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma
RUN npx prisma generate

# Build Next.js
RUN npm run build

# =========================
# Etapa 3: producción
# =========================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]