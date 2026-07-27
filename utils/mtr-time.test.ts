import { describe, expect, it } from 'vitest'

import { advanceMtrTimestamp } from './mtr-time'

describe('advanceMtrTimestamp', () => {
  it('adds elapsed wall time to an MTR timestamp', () => {
    expect(advanceMtrTimestamp('2022-04-25 15:19:59', 65_000)).toBe(
      '2022-04-25 15:21:04'
    )
  })

  it('returns the input when the timestamp is unparseable', () => {
    expect(advanceMtrTimestamp('bad', 1000)).toBe('bad')
  })
})
