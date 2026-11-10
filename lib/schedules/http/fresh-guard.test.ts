import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@lib/schedules/errors/api-error'

vi.mock('@lib/env', () => ({
  env: {
    FRESH_COOLDOWN_MS: 500,
    FRESH_RATE_LIMIT_REQUESTS: 30,
    FRESH_RATE_LIMIT_WINDOW_MS: 60_000,
    RATE_LIMIT_REQUESTS: 60,
    RATE_LIMIT_WINDOW_MS: 60_000,
    TRUSTED_PROXIES: '10.0.0.0/8',
    UPSTASH_REDIS_REST_URL: undefined,
    UPSTASH_REDIS_REST_TOKEN: undefined,
  },
}))

const { assertFreshAllowed, clientIpFromRequest } = await import('./fresh-guard')

function requestWith(
  headers: Record<string, string>,
  url = 'http://localhost/api/next-train?fresh=1'
) {
  return new Request(url, { headers })
}

describe('clientIpFromRequest', () => {
  it('prefers x-vercel-forwarded-for over a spoofed X-Forwarded-For chain', () => {
    expect(
      clientIpFromRequest(
        requestWith({
          'x-forwarded-for': '9.9.9.9, 10.0.0.1',
          'x-vercel-forwarded-for': '203.0.113.10',
        })
      )
    ).toBe('203.0.113.10')
  })

  it('takes the right-most untrusted hop behind a trusted proxy', () => {
    expect(
      clientIpFromRequest(
        requestWith({ 'x-forwarded-for': '9.9.9.9, 1.2.3.4, 10.0.0.1' })
      )
    ).toBe('1.2.3.4')
  })

  it('does not treat the leftmost spoofed hop as the client', () => {
    expect(
      clientIpFromRequest(
        requestWith({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' })
      )
    ).not.toBe('1.2.3.4')
  })
})

describe('assertFreshAllowed', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('rejects cross-origin Sec-Fetch-Site', async () => {
    await expect(
      assertFreshAllowed(
        requestWith({
          'sec-fetch-site': 'cross-site',
          'x-forwarded-for': '10.0.0.99, 10.0.0.1',
        })
      )
    ).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 })
  })

  it('allows same-origin then rate-limits rapid repeats', async () => {
    vi.useFakeTimers()
    const ip = `203.0.113.${(Date.now() % 200) + 1}`
    const headers = {
      'sec-fetch-site': 'same-origin',
      'x-forwarded-for': `${ip}, 10.0.0.1`,
    }
    await expect(assertFreshAllowed(requestWith(headers))).resolves.toBeUndefined()
    await expect(assertFreshAllowed(requestWith(headers))).rejects.toBeInstanceOf(
      ApiError
    )
    await expect(assertFreshAllowed(requestWith(headers))).rejects.toMatchObject({
      code: 'RATE_LIMITED',
      status: 429,
    })
  })

  it('allows another fresh after the cooldown window', async () => {
    vi.useFakeTimers()
    const ip = `198.51.100.${(Date.now() % 200) + 1}`
    const headers = {
      'sec-fetch-site': 'same-origin',
      'x-forwarded-for': `${ip}, 10.0.0.1`,
    }
    await assertFreshAllowed(requestWith(headers))
    vi.advanceTimersByTime(600)
    await expect(assertFreshAllowed(requestWith(headers))).resolves.toBeUndefined()
  })
})
