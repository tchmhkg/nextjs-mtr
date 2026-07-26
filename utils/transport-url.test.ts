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

  it('updates line when switching LR route before picking a station', () => {
    const sp = new URLSearchParams('mode=lr&line=614P&sta=200&dir=1')
    expect(nextTransportQuery(sp, 'lr', '610', null, 1)).toBe(
      '?mode=lr&line=610&dir=1'
    )
  })

  it('returns null when LR route-only URL already matches', () => {
    const sp = new URLSearchParams('mode=lr&line=610&dir=1')
    expect(nextTransportQuery(sp, 'lr', '610', null, 1)).toBeNull()
  })

  it('returns null when already in sync', () => {
    const sp = new URLSearchParams('mode=mtr&line=EAL&sta=TAW')
    expect(nextTransportQuery(sp, 'mtr', null, null, 1, 'EAL', 'TAW')).toBeNull()
  })
})
