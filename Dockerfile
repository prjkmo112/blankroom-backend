# ---------- Builder ------------
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci

COPY prisma/schema.prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

# ---------- Runner ------------
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package*.json ./
RUN npm ci

# Copy app from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

ENV COOKIE_AUTH_KEY_TOKEN=access_token
ENV POSTGRES_URL=postgresql://bruser:brpass@localhost:5433/blankroom?schema=public
ENV ENABLED_SWAGGER=true
ENV SWAGGER_UI_URL=/swagger-ui
ENV CORS_ORIGIN=http://localhost:5173,http://localhost
ENV JWT_SECRET=b5cf0f5b890e04e058ffc62b7e95fa078de71847be31c02f79ee6c99207b0306

# healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

EXPOSE 3000

CMD ["dumb-init", "node", "dist/main"]