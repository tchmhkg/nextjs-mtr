import assert from 'node:assert/strict'

import { advanceMtrTimestamp, etaDiffSeconds } from './mtr-time'

const advanced = advanceMtrTimestamp('2022-04-25 15:19:59', 65_000)
assert.equal(advanced, '2022-04-25 15:21:04')
assert.equal(etaDiffSeconds('2022-04-25 15:21:04', '2022-04-25 15:19:59'), 65)
assert.equal(etaDiffSeconds('bad', '2022-04-25 15:19:59'), null)

console.error('mtr-time.check: ok')
