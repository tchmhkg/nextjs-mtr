import { env } from '@lib/env'
import { ApiError } from '@lib/schedules/errors/api-error'
import { assertFreshRateLimit } from '@lib/schedules/http/rate-limit'

/** ponytail: per-instance Map when Upstash is unset; ceiling is multi-instance drift. */
const lastFreshByIp = new Map<string, number>()

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

function assertMemoryFreshCooldown(ip: string): void {
  const now = Date.now()
  const last = lastFreshByIp.get(ip)
  if (last != null && now - last < env.FRESH_COOLDOWN_MS) {
    throw new ApiError(
      'RATE_LIMITED',
      'Please wait before refreshing again',
      429
    )
  }
  lastFreshByIp.set(ip, now)
  if (lastFreshByIp.size > 10_000) {
    const cutoff = now - env.FRESH_COOLDOWN_MS
    for (const [key, ts] of lastFreshByIp) {
      if (ts < cutoff) lastFreshByIp.delete(key)
    }
  }
}

/**
 * Require same-origin Sec-Fetch-Site and enforce fresh rate limits.
 * Throws ApiError on failure.
 */
export async function assertFreshAllowed(request: Request): Promise<void> {
  const site = request.headers.get('sec-fetch-site')
  if (site !== 'same-origin') {
    throw new ApiError(
      'FORBIDDEN',
      'Forced refresh is only allowed from same-origin requests',
      403
    )
  }

  const ip = clientIpFromRequest(request)
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    await assertFreshRateLimit(ip)
    return
  }
  assertMemoryFreshCooldown(ip)
}
