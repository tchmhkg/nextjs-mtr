import { describe, expect, it } from 'vitest'

import {
  apiErrorToMessageKey,
  isScheduleFetchError,
  parseApiErrorCode,
  ScheduleFetchError,
} from './client-error'

describe('ScheduleFetchError', () => {
  it('stores code and status', () => {
    const err = new ScheduleFetchError('RATE_LIMITED', 429)
    expect(err.code).toBe('RATE_LIMITED')
    expect(err.status).toBe(429)
    expect(isScheduleFetchError(err)).toBe(true)
    expect(isScheduleFetchError(new Error('x'))).toBe(false)
  })
})

describe('parseApiErrorCode', () => {
  it('accepts known codes', () => {
    expect(parseApiErrorCode('FORBIDDEN')).toBe('FORBIDDEN')
  })

  it('falls back to UPSTREAM_ERROR', () => {
    expect(parseApiErrorCode('NOPE')).toBe('UPSTREAM_ERROR')
    expect(parseApiErrorCode(null)).toBe('UPSTREAM_ERROR')
  })
})

describe('apiErrorToMessageKey', () => {
  it('maps codes to message keys', () => {
    expect(apiErrorToMessageKey('RATE_LIMITED')).toBe(
      'Please wait before refreshing again'
    )
    expect(apiErrorToMessageKey('FORBIDDEN')).toBe('Refresh is unavailable')
    expect(apiErrorToMessageKey('NOT_FOUND')).toBe('Station not available')
    expect(apiErrorToMessageKey('UPSTREAM_ERROR')).toBe(
      'Failed to load schedule'
    )
  })
})
