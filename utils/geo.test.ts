import { describe, expect, it } from 'vitest'

import { calcDistanceKm } from './geo'

describe('calcDistanceKm', () => {
  it('returns ~0 for the same point', () => {
    expect(calcDistanceKm(22.3, 114.2, 22.3, 114.2)).toBeLessThan(0.001)
  })

  it('returns a positive distance between distinct points', () => {
    const d = calcDistanceKm(22.3193, 114.1694, 22.3964, 114.1095)
    expect(d).toBeGreaterThan(5)
    expect(d).toBeLessThan(20)
  })
})
