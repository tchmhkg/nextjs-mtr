import { describe, expect, it } from 'vitest'

import {
  findLrRouteServing,
  getLrRouteStopIds,
  getLrStation,
  isKnownLrRoute,
  isKnownLrStation,
  LR_ROUTES,
  LR_STATIONS,
} from './lr-data'

describe('lr-data', () => {
  it('has catalog stations and routes from the CSV', () => {
    expect(LR_STATIONS).toHaveLength(68)
    expect(LR_ROUTES).toHaveLength(11)
    expect(isKnownLrStation('600')).toBe(true)
    expect(isKnownLrRoute('505')).toBe(true)
    expect(isKnownLrRoute('999')).toBe(false)
  })

  it('uses CSV names and stop codes', () => {
    expect(getLrStation('250')).toMatchObject({
      code: 'TSP',
      label: { en: 'Hoi Wong Road', tc: '海皇路' },
    })
    expect(getLrStation('920')?.code).toBe('SAS')
  })

  it('includes OSM-sourced coordinates for each station', () => {
    const ferry = getLrStation('1')
    expect(ferry?.location.lat).toBeCloseTo(22.37, 1)
    expect(ferry?.location.lng).toBeCloseTo(113.97, 1)
    expect(
      LR_STATIONS.every(
        (s) =>
          typeof s.location?.lat === 'number' &&
          typeof s.location?.lng === 'number'
      )
    ).toBe(true)
  })

  it('orders route 505 direction sequences', () => {
    const dir1 = getLrRouteStopIds('505', 1)
    const dir2 = getLrRouteStopIds('505', 2)
    expect(dir1[0]).toBe('920')
    expect(dir1.at(-1)).toBe('100')
    expect(dir2[0]).toBe('100')
    expect(dir2.at(-1)).toBe('920')
  })

  it('findLrRouteServing keeps preferred route when it still serves', () => {
    expect(findLrRouteServing('1', '610', 1)).toEqual({
      routeCode: '610',
      dir: 1,
    })
    expect(findLrRouteServing('1', '610', 2)).toEqual({
      routeCode: '610',
      dir: 2,
    })
  })

  it('findLrRouteServing picks the first route by code when none preferred', () => {
    // 507 and 610 both serve Ferry Pier; first by code is 507
    expect(findLrRouteServing('1')).toEqual({ routeCode: '507', dir: 1 })
  })
})
