import { env } from '@lib/env'
import { ApiError } from '@lib/schedules/errors/api-error'

/** ponytail: per-instance Map until Branch 3 Upstash rate limit. */
const lastFreshByIp = new Map<string, number>()

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

/**
 * Require same-origin Sec-Fetch-Site and enforce per-IP fresh cooldown.
 * Throws ApiError on failure.
 */
export function assertFreshAllowed(request: Request): void {
  const site = request.headers.get('sec-fetch-site')
  if (site !== 'same-origin') {
    throw new ApiError(
      'FORBIDDEN',
      'Forced refresh is only allowed from same-origin requests',
      403
    )
  }

  const ip = clientIpFromRequest(request)
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

  // ponytail: bound Map growth; upgrade path = Upstash (Branch 3)
  if (lastFreshByIp.size > 10_000) {
    const cutoff = now - env.FRESH_COOLDOWN_MS
    for (const [key, ts] of lastFreshByIp) {
      if (ts < cutoff) lastFreshByIp.delete(key)
    }
  }
}
