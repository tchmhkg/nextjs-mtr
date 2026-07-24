import { describe, expect, it } from 'vitest'

import { normalizeMtrLang } from './client'

describe('normalizeMtrLang', () => {
  it('maps en to EN and everything else to TC', () => {
    expect(normalizeMtrLang('en')).toBe('EN')
    expect(normalizeMtrLang('EN')).toBe('EN')
    expect(normalizeMtrLang('tc')).toBe('TC')
    expect(normalizeMtrLang(null)).toBe('TC')
    expect(normalizeMtrLang(undefined)).toBe('TC')
  })
})
