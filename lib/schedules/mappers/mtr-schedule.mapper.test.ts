import { describe, expect, it } from 'vitest'

import { mapMtrUpstreamToDto } from './mtr-schedule.mapper'

describe('mapMtrUpstreamToDto', () => {
  it('maps alert payloads and strips non-allowlisted URLs', () => {
    const alertResult = mapMtrUpstreamToDto(
      {
        sys_time: '2026-07-11 01:00:00',
        curr_time: '2026-07-11 01:00:05',
        isdelay: 'N',
        status: 0,
        message: 'Test alert',
        url: 'https://example.com',
        data: {
          'TWL-CEN': {
            UP: [
              { seq: '1', dest: 'TSW', plat: '1', time: '2026-07-11 01:01:05' },
            ],
            DOWN: [
              { seq: '1', dest: 'CEN', plat: '2', time: '2026-07-11 01:02:05' },
            ],
          },
        },
      },
      'TWL',
      'CEN'
    )
    expect(alertResult.isDelayed).toBe(false)
    expect(alertResult.lastUpdated).toBe('2026-07-11 01:00:05')
    expect(alertResult.up?.[0]?.dest).toBe('TSW')
    expect(alertResult.alert?.message).toBe('Test alert')
    expect(alertResult.alert?.url).toBeNull()
  })

  it('keeps allowlisted MTR alert URLs', () => {
    const mtrAlert = mapMtrUpstreamToDto(
      {
        sys_time: '2026-07-11 01:00:00',
        curr_time: '2026-07-11 01:00:05',
        isdelay: 'N',
        status: 0,
        message: 'Test alert',
        url: 'https://www.mtr.com.hk/alert/alert_title_wap.html',
        data: {
          'TWL-CEN': {
            UP: [
              { seq: '1', dest: 'TSW', plat: '1', time: '2026-07-11 01:01:05' },
            ],
          },
        },
      },
      'TWL',
      'CEN'
    )
    expect(mtrAlert.alert?.url).toBe(
      'https://www.mtr.com.hk/alert/alert_title_wap.html'
    )
  })

  it('maps a successful schedule payload', () => {
    const success = mapMtrUpstreamToDto(
      {
        sys_time: '2022-04-25 15:19:59',
        curr_time: '2022-04-25 15:19:59',
        status: 1,
        message: 'successful',
        isdelay: 'N',
        data: {
          'TKL-TKO': {
            curr_time: '2022-04-25 15:19:59',
            sys_time: '2022-04-25 15:19:59',
            UP: [
              {
                ttnt: '1',
                valid: 'Y',
                plat: '1',
                time: '2022-04-25 15:20:00',
                source: '-',
                dest: 'POA',
                seq: '1',
              },
            ],
            DOWN: [
              {
                ttnt: '2',
                valid: 'Y',
                plat: '2',
                time: '2022-04-25 15:21:00',
                source: '-',
                dest: 'NOP',
                seq: '1',
              },
            ],
          },
        },
      },
      'TKL',
      'TKO'
    )
    expect(success.alert).toBeNull()
    expect(success.up?.[0]?.dest).toBe('POA')
  })

  it('accepts cur_time typo and special service alerts', () => {
    const special = mapMtrUpstreamToDto(
      {
        status: 0,
        message:
          'Special train service arrangements are now in place on this line.',
        url: 'https://www.mtr.com.hk/alert/alert_title_wap.html',
        cur_time: '2019-06-13 17:34:58',
      },
      'TKL',
      'TKO'
    )
    expect(special.lastUpdated).toBe('2019-06-13 17:34:58')
    expect(special.up).toBeNull()
    expect(special.alert?.url).toBe(
      'https://www.mtr.com.hk/alert/alert_title_wap.html'
    )
  })

  it('treats dash timestamps as absent and maps delay', () => {
    const absence = mapMtrUpstreamToDto(
      {
        sys_time: '-',
        curr_time: '-',
        data: { 'TKL-TKO': { curr_time: '-', sys_time: '-' } },
        status: 1,
        message: 'successful',
        isdelay: 'Y',
      },
      'TKL',
      'TKO'
    )
    expect(absence.isDelayed).toBe(true)
    expect(absence.lastUpdated).toBeNull()
  })

  it('maps EAL timeType and route', () => {
    const eal = mapMtrUpstreamToDto(
      {
        sys_time: '2022-04-25 15:19:59',
        curr_time: '2022-04-25 15:19:59',
        status: 1,
        message: 'successful',
        isdelay: 'N',
        data: {
          'EAL-TAW': {
            UP: [
              {
                seq: '1',
                dest: 'LOW',
                plat: '1',
                time: '2022-04-25 15:25:00',
                timetype: 'D',
                route: 'RAC',
              },
            ],
          },
        },
      },
      'EAL',
      'TAW'
    )
    expect(eal.up?.[0]?.timeType).toBe('D')
    expect(eal.up?.[0]?.route).toBe('RAC')
  })

  it('drops train rows with dash times', () => {
    expect(
      mapMtrUpstreamToDto(
        {
          status: 1,
          message: 'successful',
          isdelay: 'N',
          curr_time: '2022-04-25 15:19:59',
          data: {
            'TKL-TKO': {
              UP: [{ seq: '1', dest: 'POA', plat: '1', time: '-' }],
            },
          },
        },
        'TKL',
        'TKO'
      ).up
    ).toBeNull()
  })
})
