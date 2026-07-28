import { describe, expect, it } from 'vitest'

import { htmlLang } from './routing'

describe('htmlLang', () => {
  it('maps route locales to BCP 47 lang tags', () => {
    expect(htmlLang('tc')).toBe('zh-Hant')
    expect(htmlLang('en')).toBe('en')
  })
})
