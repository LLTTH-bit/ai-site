FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

# 依赖安装
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 构建
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm prisma generate
RUN pnpm build

# 生产运行
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000

# 启动时执行数据库迁移并启动应用
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
