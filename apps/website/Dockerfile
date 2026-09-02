# syntax=docker/dockerfile:1
# Multi-stage build for apps/website (Next.js standalone) in the pnpm + Turborepo workspace.
# Build context is the MONOREPO ROOT (not apps/website) so turbo can prune the workspace + its internal
# @autolokate/* deps. Targets linux/arm64 to match the Graviton (t4g) staging box.
FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# 1) Prune the workspace to the `website` app + its internal deps.
FROM base AS prune
COPY . .
RUN pnpm dlx turbo@2.10.4 prune @autolokate/website --docker

# 2) Install dependencies from the pruned lockfile (cache-mounted pnpm store survives across builds).
FROM base AS install
RUN apk add --no-cache libc6-compat
COPY --from=prune /app/out/json/ .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile

# 3) Build website + its workspace deps. NEXT_PUBLIC_* are inlined into the client bundle at BUILD time
# by Next.js, so they must be present here (not at container runtime). They're all public, non-secret
# staging values passed in from the deploy workflow.
FROM install AS build
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL=$NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID
COPY --from=prune /app/out/full/ .
RUN pnpm turbo build --filter=@autolokate/website

# 4) Runtime image — Next.js standalone server only.
# In a monorepo, `output: "standalone"` emits the server at apps/website/server.js with a hoisted
# node_modules and package.json at the standalone root; static assets + public are copied alongside.
FROM base AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /app/apps/website/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/website/.next/static ./apps/website/.next/static
COPY --from=build --chown=nextjs:nodejs /app/apps/website/public ./apps/website/public

USER nextjs
EXPOSE 3000
CMD ["node", "apps/website/server.js"]
