import { describe, expect, it } from 'vitest'

import { ApiError } from '@lib/schedules/errors/api-error'
import { toErrorResponse, toSuccessResponse } from './respond'

describe('toSuccessResponse', () => {
  it('returns JSON with poll cache headers by default', async () => {
    const res = toSuccessResponse(
      { ok: true },
      { source: 'mtr', revalidatedAt: '2026-01-01T00:00:00.000Z' }
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toMatch(/s-maxage=/)
    await expect(res.json()).resolves.toMatchObject({
      success: true,
      data: { ok: true },
    })
  })

  it('uses no-store when fresh', () => {
    const res = toSuccessResponse(
      { ok: true },
      { source: 'mtr', revalidatedAt: '2026-01-01T00:00:00.000Z' },
      { fresh: true }
    )
    expect(res.headers.get('Cache-Control')).toBe('private, no-store')
  })
})

describe('toErrorResponse', () => {
  it('maps ApiError to the error envelope', async () => {
    const res = toErrorResponse(
      new ApiError('VALIDATION_ERROR', 'bad query', 400)
    )
    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'bad query' },
      data: null,
    })
  })
})
