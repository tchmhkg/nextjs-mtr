# syntax=docker/dockerfile:1

FROM node:26-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat \
  && npm install -g yarn@1.22.22 --ignore-scripts
COPY package.json yarn.lock ./
# ponytail: skip package lifecycle scripts in image builds (Sonar/CWE supply-chain).
# Native bins (e.g. SWC) are fetched during `next build`, not install.
RUN yarn install --frozen-lockfile --production=false --ignore-scripts

FROM node:26-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=true
RUN npm install -g yarn@1.22.22 --ignore-scripts
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
