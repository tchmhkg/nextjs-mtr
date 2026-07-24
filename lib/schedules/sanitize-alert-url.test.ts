import { describe, expect, it } from 'vitest'

import { sanitizeAlertUrl } from './sanitize-alert-url'

const hosts = ['mtr.com.hk']

describe('sanitizeAlertUrl', () => {
  it('allows https URLs under an allowlisted host', () => {
    expect(
      sanitizeAlertUrl('https://www.mtr.com.hk/alert/x.html', hosts)
    ).toBe('https://www.mtr.com.hk/alert/x.html')
  })

  it('rejects non-https and non-allowlisted hosts', () => {
    expect(sanitizeAlertUrl('http://www.mtr.com.hk/x', hosts)).toBeNull()
    expect(sanitizeAlertUrl('https://example.com/x', hosts)).toBeNull()
  })

  it('rejects empty and invalid values', () => {
    expect(sanitizeAlertUrl(null, hosts)).toBeNull()
    expect(sanitizeAlertUrl('   ', hosts)).toBeNull()
    expect(sanitizeAlertUrl('not a url', hosts)).toBeNull()
  })
})
