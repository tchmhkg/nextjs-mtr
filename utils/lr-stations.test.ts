import { describe, expect, it } from 'vitest'

import { getLrStation, isKnownLrStation, LR_STATIONS } from './lr-stations'

describe('lr-stations', () => {
  it('knows appendix station ids', () => {
    expect(LR_STATIONS.length).toBeGreaterThan(60)
    expect(isKnownLrStation('600')).toBe(true)
    expect(isKnownLrStation('9999')).toBe(false)
    expect(getLrStation('600')?.label.en).toBe('Yuen Long')
    expect(getLrStation('nope')).toBeUndefined()
  })
})
