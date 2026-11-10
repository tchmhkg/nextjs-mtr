import { env } from '@lib/env'
import { ApiError } from '@lib/schedules/errors/api-error'
import { clientIpFromRequest } from '@lib/schedules/http/client-ip'
import { assertFreshRateLimit } from '@lib/schedules/http/rate-limit'

export { clientIpFromRequest }

/** Per-instance cooldown map. Each replica tracks its own clients. */
const lastFreshByIp = new Map<string, number>()

function assertMemoryFreshCooldown(ip: string): void {
  if (env.FRESH_COOLDOWN_MS <= 0) return
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
      'Refresh is unavailable',
      403
    )
  }

  const ip = clientIpFromRequest(request)
  assertMemoryFreshCooldown(ip)
  await assertFreshRateLimit(ip)
}
