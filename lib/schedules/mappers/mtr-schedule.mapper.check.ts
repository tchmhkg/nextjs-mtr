import assert from 'node:assert/strict'

import { mapMtrUpstreamToDto } from './mtr-schedule.mapper'

const alertFixture = {
  sys_time: '2026-07-11 01:00:00',
  curr_time: '2026-07-11 01:00:05',
  isdelay: 'N',
  status: 0,
  message: 'Test alert',
  url: 'https://example.com',
  data: {
    'TWL-CEN': {
      UP: [{ seq: '1', dest: 'TSW', plat: '1', time: '2026-07-11 01:01:05' }],
      DOWN: [{ seq: '1', dest: 'CEN', plat: '2', time: '2026-07-11 01:02:05' }],
    },
  },
}

const alertResult = mapMtrUpstreamToDto(alertFixture, 'TWL', 'CEN')
assert.equal(alertResult.isDelayed, false)
assert.equal(alertResult.lastUpdated, '2026-07-11 01:00:05')
assert.equal(alertResult.sysTime, '2026-07-11 01:00:00')
assert.equal(alertResult.up?.[0]?.dest, 'TSW')
assert.equal(alertResult.alert?.message, 'Test alert')
assert.equal(alertResult.alert?.url, null) // example.com not allowlisted

const mtrAlertFixture = {
  ...alertFixture,
  url: 'https://www.mtr.com.hk/alert/alert_title_wap.html',
}
const mtrAlert = mapMtrUpstreamToDto(mtrAlertFixture, 'TWL', 'CEN')
assert.equal(
  mtrAlert.alert?.url,
  'https://www.mtr.com.hk/alert/alert_title_wap.html'
)

const successFixture = {
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
}
const success = mapMtrUpstreamToDto(successFixture, 'TKL', 'TKO')
assert.equal(success.alert, null)
assert.equal(success.up?.[0]?.dest, 'POA')

const specialFixture = {
  status: 0,
  message: 'Special train service arrangements are now in place on this line.',
  url: 'https://www.mtr.com.hk/alert/alert_title_wap.html',
  cur_time: '2019-06-13 17:34:58',
}
const special = mapMtrUpstreamToDto(specialFixture, 'TKL', 'TKO')
assert.equal(special.lastUpdated, '2019-06-13 17:34:58')
assert.equal(special.up, null)
assert.equal(
  special.alert?.url,
  'https://www.mtr.com.hk/alert/alert_title_wap.html'
)

const absenceFixture = {
  sys_time: '-',
  curr_time: '-',
  data: { 'TKL-TKO': { curr_time: '-', sys_time: '-' } },
  status: 1,
  message: 'successful',
  isdelay: 'Y',
}
const absence = mapMtrUpstreamToDto(absenceFixture, 'TKL', 'TKO')
assert.equal(absence.isDelayed, true)
assert.equal(absence.lastUpdated, null)

const ealFixture = {
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
}
const eal = mapMtrUpstreamToDto(ealFixture, 'EAL', 'TAW')
assert.equal(eal.up?.[0]?.timeType, 'D')
assert.equal(eal.up?.[0]?.route, 'RAC')

assert.equal(
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
  ).up,
  null
)

console.error('mtr-schedule.mapper.check: ok')
