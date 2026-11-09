import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@lib/schedules/errors/api-error'

vi.mock('@lib/env', () => ({
  env: {
    BACKEND_PROVIDER: 'java',
    BACKEND_API_BASE_URL: 'https://bff.example',
  },
}))

const { fetchTransitBff, useJavaBackend } = await import('./client')

describe('fetchTransitBff', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses the Java backend when the base URL is set', () => {
    expect(useJavaBackend()).toBe(true)
  })

  it('unwraps a success envelope', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          success: true,
          data: { up: [], down: null },
          meta: { source: 'mtr', revalidatedAt: '2026-11-09T16:00:00Z' },
        })
      )
    )

    const result = await fetchTransitBff<{ up: unknown[] }>('/api/next-train', {
      line: 'AEL',
      sta: 'HOK',
      lang: 'en',
    })

    expect(result.data.up).toEqual([])
    expect(result.meta.source).toBe('mtr')
    expect(vi.mocked(fetch).mock.calls[0][0].toString()).toBe(
      'https://bff.example/api/next-train?line=AEL&sta=HOK&lang=en'
    )
  })

  it('maps a failure envelope to ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Station not available' },
            data: null,
          },
          { status: 404 }
        )
      )
    )

    await expect(
      fetchTransitBff('/api/next-train', { sta: 'XXX', lang: 'en' })
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    } satisfies Partial<ApiError>)
  })
})
