import { describe, expect, it } from 'vitest'

import { mapLrUpstreamToDto } from './lr-schedule.mapper'

describe('mapLrUpstreamToDto', () => {
  it('maps platforms and routes for English', () => {
    const dto = mapLrUpstreamToDto(
      {
        status: 1,
        system_time: '2026-07-25 12:00:00',
        platform_list: [
          {
            platform_id: 1,
            route_list: [
              {
                train_length: 2,
                arrival_departure: 'A',
                dest_en: 'Siu Hong',
                dest_ch: '兆康',
                time_en: '3 min',
                time_ch: '3分鐘',
                route_no: '615P',
                stop: 0,
                special: 0,
              },
            ],
          },
          { platform_id: 2, route_list: [] },
        ],
      },
      'en'
    )
    expect(dto.up).toBeNull()
    expect(dto.down).toBeNull()
    expect(dto.lastUpdated).toBe('2026-07-25 12:00:00')
    expect(dto.platforms).toHaveLength(1)
    expect(dto.platforms?.[0]).toMatchObject({
      id: '1',
      endService: false,
      trains: [
        {
          dest: 'Siu Hong',
          plat: '1',
          time: '3 min',
          route: '615P',
          relativeEta: true,
          trainLength: 2,
        },
      ],
    })
  })

  it('uses Chinese dest/time and special route number', () => {
    const dto = mapLrUpstreamToDto(
      {
        status: 1,
        system_time: '2026-07-25 12:00:00',
        platform_list: [
          {
            platform_id: 3,
            route_list: [
              {
                arrival_departure: 'D',
                dest_en: 'Tin Yat',
                dest_ch: '天逸',
                time_en: 'arriving',
                time_ch: '即將抵達',
                route_no: '751',
                special: 1,
                additionalInfo1: '751P*',
                stop: 0,
              },
            ],
          },
        ],
      },
      'tc'
    )
    expect(dto.platforms?.[0]?.trains[0]).toMatchObject({
      dest: '天逸',
      time: '即將抵達',
      route: '751P*',
    })
    expect(dto.platforms?.[0]?.trains[0]?.destLabel).toBeUndefined()
    expect(dto.platforms?.[0]?.trains[0]?.timeType).toBeUndefined()
  })

  it('keeps ended platforms and dedupes remarks', () => {
    const dto = mapLrUpstreamToDto(
      {
        status: 1,
        system_time: '2026-07-27 01:08:24',
        platform_list: [
          { platform_id: 2, end_service_status: 1 },
          {
            platform_id: 5,
            end_service_status: 0,
            route_list: [
              {
                dest_en: 'Tin Yat',
                dest_ch: '天逸',
                time_en: '10 min',
                time_ch: '10分鐘',
                route_no: '761P',
                stop: 0,
                routeRemarkEng2: 'Special note',
                routeRemarkChi2: '特別班次說明',
              },
              {
                dest_en: 'Yuen Long',
                dest_ch: '元朗',
                time_en: '12 min',
                time_ch: '12分鐘',
                route_no: '610',
                stop: 0,
                routeRemarkEng2: 'Special note',
                routeRemarkChi2: '特別班次說明',
              },
            ],
          },
        ],
      },
      'tc'
    )
    expect(dto.platforms).toHaveLength(2)
    expect(dto.platforms?.[0]).toMatchObject({
      id: '2',
      endService: true,
      trains: [],
    })
    expect(dto.platforms?.[1]?.trains).toHaveLength(2)
    expect(dto.remarks).toEqual(['特別班次說明'])
  })

  it('drops stopped routes and empty non-ended platforms', () => {
    const dto = mapLrUpstreamToDto(
      {
        status: 2,
        system_time: '2026-07-25 03:00:00',
        platform_list: [
          { platform_id: 1 },
          {
            platform_id: 2,
            route_list: [{ dest_en: 'X', stop: 1, route_no: '505' }],
          },
        ],
      },
      'en'
    )
    expect(dto.platforms).toBeNull()
    expect(dto.remarks).toBeNull()
    expect(dto.isDelayed).toBe(false)
    expect(dto.alert).toBeNull()
  })

  it('marks status 0 as delayed', () => {
    const dto = mapLrUpstreamToDto(
      { status: 0, system_time: '2026-07-25 12:00:00', platform_list: [] },
      'en'
    )
    expect(dto.isDelayed).toBe(true)
    expect(dto.alert).toBeNull()
  })
})
