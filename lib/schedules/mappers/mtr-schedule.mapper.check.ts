import assert from 'node:assert/strict'

import { mapMtrUpstreamToDto } from './mtr-schedule.mapper'

const fixture = {
  sys_time: '2026-07-11 01:00:00',
  curr_time: '2026-07-11 01:00:05',
  isdelay: 'N',
  status: 0,
  message: 'Test alert',
  url: 'https://example.com',
  data: {
    'TWL-CEN': {
      UP: [{ seq: '1', dest: 'Tsuen Wan', plat: '1', time: '1 min' }],
      DOWN: [{ seq: '1', dest: 'Central', plat: '2', time: '2 min' }],
    },
  },
}

const result = mapMtrUpstreamToDto(fixture, 'TWL', 'CEN')

assert.equal(result.isDelayed, false)
assert.equal(result.lastUpdated, '2026-07-11 01:00:05')
assert.equal(result.up?.length, 1)
assert.equal(result.up?.[0]?.dest, 'Tsuen Wan')
assert.equal(result.down?.length, 1)
assert.equal(result.alert?.message, 'Test alert')
assert.equal(result.alert?.url, 'https://example.com')
