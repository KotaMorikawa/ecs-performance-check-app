# =============== Base Stage ===============
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# =============== Dependencies Stage ===============
FROM base AS deps
# Copy root package files for workspace support
COPY ../../package*.json ./
COPY package*.json ./backend/
COPY prisma ./backend/prisma/
RUN npm ci --workspace @ecs-performance/backend
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# =============== Builder Stage ===============
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ビルド実行
RUN npm run build

# =============== Production Stage ===============
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# 非rootユーザー作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 honojs

# 必要なファイルのみコピー
COPY --from=builder --chown=honojs:nodejs /app/dist ./dist
COPY --from=builder --chown=honojs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=honojs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=honojs:nodejs /app/package.json ./package.json

USER honojs

EXPOSE 8000
ENV PORT 8000

# ヘルスチェック追加
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').request('http://localhost:8000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).end()"

CMD ["node", "dist/index.js"]

# =============== Development Stage ===============
FROM base AS development
COPY package*.json ./
RUN npm install
COPY prisma ./prisma/
RUN npx prisma generate
WORKDIR /app
EXPOSE 8000
CMD ["npm", "run", "dev"]