import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@lib/schedules/errors/api-error'

vi.mock('@lib/env', () => ({
  env: {
    FRESH_COOLDOWN_MS: 500,
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
  it('prefers the first x-forwarded-for hop', () => {
    expect(
      clientIpFromRequest(
        requestWith({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' })
      )
    ).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip then unknown', () => {
    expect(
      clientIpFromRequest(requestWith({ 'x-real-ip': '9.9.9.9' }))
    ).toBe('9.9.9.9')
    expect(clientIpFromRequest(requestWith({}))).toBe('unknown')
  })
})

describe('assertFreshAllowed', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('rejects cross-origin Sec-Fetch-Site', async () => {
    await expect(
      assertFreshAllowed(
        requestWith({ 'sec-fetch-site': 'cross-site', 'x-real-ip': '10.0.0.1' })
      )
    ).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 })
  })

  it('allows same-origin then rate-limits rapid repeats', async () => {
    vi.useFakeTimers()
    const ip = `test-${Date.now()}`
    const headers = {
      'sec-fetch-site': 'same-origin',
      'x-real-ip': ip,
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
    const ip = `cooldown-${Date.now()}`
    const headers = {
      'sec-fetch-site': 'same-origin',
      'x-real-ip': ip,
    }
    await assertFreshAllowed(requestWith(headers))
    vi.advanceTimersByTime(600)
    await expect(assertFreshAllowed(requestWith(headers))).resolves.toBeUndefined()
  })
})
