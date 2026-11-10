import { describe, expect, it, vi } from 'vitest'

vi.mock('@lib/env', () => ({
  env: {
    TRUSTED_PROXIES: '',
  },
}))

const { clientIpFromRequest } = await import('./client-ip')

function requestWith(headers: Record<string, string>) {
  return new Request('http://localhost/api/next-train', { headers })
}

describe('clientIpFromRequest without trusted proxies', () => {
  it('ignores spoofed X-Forwarded-For and X-Real-IP', () => {
    expect(
      clientIpFromRequest(
        requestWith({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' })
      )
    ).toBe('unknown')
    expect(
      clientIpFromRequest(requestWith({ 'x-real-ip': '9.9.9.9' }))
    ).toBe('unknown')
    expect(clientIpFromRequest(requestWith({}))).toBe('unknown')
  })

  it('still honours x-vercel-forwarded-for', () => {
    expect(
      clientIpFromRequest(
        requestWith({
          'x-forwarded-for': '9.9.9.9',
          'x-vercel-forwarded-for': '203.0.113.10',
        })
      )
    ).toBe('203.0.113.10')
  })
})
