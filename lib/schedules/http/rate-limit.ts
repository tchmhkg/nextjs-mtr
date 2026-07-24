import { env } from '@lib/env'
import { ApiError } from '@lib/schedules/errors/api-error'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function hasUpstash(): boolean {
  return Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN)
}

function slidingWindow(requests: number, windowMs: number) {
  return Ratelimit.slidingWindow(requests, `${windowMs} ms`)
}

let generalLimiter: Ratelimit | null | undefined
let freshLimiter: Ratelimit | null | undefined

function getGeneralLimiter(): Ratelimit | null {
  if (generalLimiter !== undefined) return generalLimiter
  if (!hasUpstash()) {
    generalLimiter = null
    return null
  }
  generalLimiter = new Ratelimit({
    redis: new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    }),
    limiter: slidingWindow(env.RATE_LIMIT_REQUESTS, env.RATE_LIMIT_WINDOW_MS),
    prefix: 'mtr:rl:general',
  })
  return generalLimiter
}

function getFreshLimiter(): Ratelimit | null {
  if (freshLimiter !== undefined) return freshLimiter
  if (!hasUpstash()) {
    freshLimiter = null
    return null
  }
  freshLimiter = new Ratelimit({
    redis: new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    }),
    limiter: slidingWindow(
      env.FRESH_RATE_LIMIT_REQUESTS,
      env.FRESH_RATE_LIMIT_WINDOW_MS
    ),
    prefix: 'mtr:rl:fresh',
  })
  return freshLimiter
}

export async function assertGeneralRateLimit(ip: string): Promise<void> {
  const limiter = getGeneralLimiter()
  if (!limiter) return
  const { success } = await limiter.limit(ip)
  if (!success) {
    throw new ApiError(
      'RATE_LIMITED',
      'Please wait before refreshing again',
      429
    )
  }
}

export async function assertFreshRateLimit(ip: string): Promise<void> {
  const limiter = getFreshLimiter()
  if (!limiter) return
  const { success } = await limiter.limit(ip)
  if (!success) {
    throw new ApiError(
      'RATE_LIMITED',
      'Please wait before refreshing again',
      429
    )
  }
}
