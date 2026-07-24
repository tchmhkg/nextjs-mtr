import { describe, expect, it } from 'vitest'

import { advanceMtrTimestamp, etaDiffSeconds } from './mtr-time'

describe('mtr-time', () => {
  it('advances an MTR timestamp by elapsed ms', () => {
    expect(advanceMtrTimestamp('2022-04-25 15:19:59', 65_000)).toBe(
      '2022-04-25 15:21:04'
    )
  })

  it('returns the original string when the timestamp is invalid', () => {
    expect(advanceMtrTimestamp('not-a-time', 1000)).toBe('not-a-time')
  })

  it('computes ETA diff in seconds', () => {
    expect(etaDiffSeconds('2022-04-25 15:21:04', '2022-04-25 15:19:59')).toBe(
      65
    )
  })

  it('returns null for invalid ETA inputs', () => {
    expect(etaDiffSeconds('bad', '2022-04-25 15:19:59')).toBeNull()
  })
})
