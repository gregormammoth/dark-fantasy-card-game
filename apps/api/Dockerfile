FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api ./apps/api
RUN pnpm install --filter @dark-fantasy/api... --frozen-lockfile
RUN pnpm --filter @dark-fantasy/api prisma:generate
RUN pnpm --filter @dark-fantasy/api build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api ./apps/api
RUN chmod +x /app/apps/api/docker-entrypoint.sh
WORKDIR /app/apps/api
EXPOSE 3001
ENTRYPOINT ["./docker-entrypoint.sh"]
