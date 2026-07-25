import { describe, expect, it } from 'vitest'

import { nextTransportQuery } from './transport-url'

describe('nextTransportQuery', () => {
  it('clears MTR crumbs when switching to bare LR', () => {
    const sp = new URLSearchParams('mode=mtr&line=EAL&sta=TAW')
    expect(nextTransportQuery(sp, 'lr', null, null, 1)).toBe('?mode=lr')
  })

  it('writes full LR selection', () => {
    const sp = new URLSearchParams('mode=lr')
    expect(nextTransportQuery(sp, 'lr', '505', '100', 1)).toBe(
      '?mode=lr&line=505&sta=100&dir=1'
    )
  })

  it('returns null when already in sync', () => {
    const sp = new URLSearchParams('mode=mtr&line=EAL&sta=TAW')
    expect(nextTransportQuery(sp, 'mtr', null, null, 1, 'EAL', 'TAW')).toBeNull()
  })
})
