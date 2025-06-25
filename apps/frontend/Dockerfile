# =============== Base Stage ===============
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# =============== Dependencies Stage ===============
FROM base AS deps
# Copy root package files for workspace support
COPY ../../package*.json ./
COPY package*.json ./frontend/
RUN npm ci --workspace @ecs-performance/frontend

# =============== Builder Stage ===============
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 環境変数設定
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# ビルド実行
RUN npm run build

# =============== Production Stage ===============
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 非rootユーザー作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 必要なファイルのみコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# ヘルスチェック追加
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').request('http://localhost:3000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).end()"

CMD ["node", "server.js"]

# =============== Development Stage ===============
FROM base AS development
# Copy root package files for workspace support
COPY ../../package*.json ./
COPY package*.json ./frontend/
RUN npm ci --workspace @ecs-performance/frontend
WORKDIR /app
EXPOSE 3000
CMD ["npm", "run", "dev", "--workspace", "@ecs-performance/frontend"]