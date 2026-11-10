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

/**
 * In-process sliding window used when Upstash is not configured.
 * Per replica by construction; set Upstash for multi-instance correctness.
 * The key set is bounded so a rotating identity cannot grow the map without limit.
 */
export class MemorySlidingWindow {
  private readonly windows = new Map<string, number[]>()

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maxTracked = 10_000
  ) {}

  tryAcquire(key: string, now = Date.now()): boolean {
    const cutoff = now - this.windowMs
    let stamps = this.windows.get(key)
    if (!stamps) {
      if (this.windows.size >= this.maxTracked) {
        this.sweep(now)
        if (this.windows.size >= this.maxTracked) return false
      }
      stamps = []
      this.windows.set(key, stamps)
    }
    while (stamps.length > 0 && stamps[0]! <= cutoff) {
      stamps.shift()
    }
    if (stamps.length >= this.limit) return false
    stamps.push(now)
    return true
  }

  /** Visible for tests. */
  get trackedKeys(): number {
    return this.windows.size
  }

  private sweep(now: number): void {
    const cutoff = now - this.windowMs
    for (const [key, stamps] of this.windows) {
      while (stamps.length > 0 && stamps[0]! <= cutoff) {
        stamps.shift()
      }
      if (stamps.length === 0) this.windows.delete(key)
    }
  }
}

const memoryGeneral = new MemorySlidingWindow(
  env.RATE_LIMIT_REQUESTS,
  env.RATE_LIMIT_WINDOW_MS
)
const memoryFresh = new MemorySlidingWindow(
  env.FRESH_RATE_LIMIT_REQUESTS,
  env.FRESH_RATE_LIMIT_WINDOW_MS
)

function reject(): never {
  throw new ApiError(
    'RATE_LIMITED',
    'Please wait before refreshing again',
    429
  )
}

export async function assertGeneralRateLimit(ip: string): Promise<void> {
  const limiter = getGeneralLimiter()
  if (limiter) {
    const { success } = await limiter.limit(ip)
    if (!success) reject()
    return
  }
  if (!memoryGeneral.tryAcquire(ip)) reject()
}

export async function assertFreshRateLimit(ip: string): Promise<void> {
  const limiter = getFreshLimiter()
  if (limiter) {
    const { success } = await limiter.limit(ip)
    if (!success) reject()
    return
  }
  if (!memoryFresh.tryAcquire(ip)) reject()
}
