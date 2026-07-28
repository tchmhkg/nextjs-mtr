import assert from 'node:assert/strict'
import { htmlLang } from './routing'

assert.equal(htmlLang('tc'), 'zh-Hant')
assert.equal(htmlLang('en'), 'en')
