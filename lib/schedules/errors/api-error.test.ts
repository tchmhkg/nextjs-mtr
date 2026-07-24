import { describe, expect, it } from 'vitest'

import {
  ApiError,
  getUpstreamStatus,
  isApiError,
} from './api-error'

describe('ApiError', () => {
  it('stores code, message, and status', () => {
    const err = new ApiError('NOT_FOUND', 'missing', 404)
    expect(err.code).toBe('NOT_FOUND')
    expect(err.message).toBe('missing')
    expect(err.status).toBe(404)
    expect(isApiError(err)).toBe(true)
    expect(isApiError(new Error('x'))).toBe(false)
  })
})

describe('getUpstreamStatus', () => {
  it('reads a finite status from error-like objects', () => {
    expect(getUpstreamStatus({ status: 502 })).toBe(502)
    expect(getUpstreamStatus({ status: 'nope' })).toBeUndefined()
    expect(getUpstreamStatus(null)).toBeUndefined()
  })
})
