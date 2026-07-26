import { describe, expect, it } from 'vitest'

import {
  DEFAULT_LOCALE,
  localizedPath,
  stripLocalePrefix,
} from './locale-path'

describe('stripLocalePrefix', () => {
  it('strips /en prefix', () => {
    expect(stripLocalePrefix('/en')).toBe('/')
    expect(stripLocalePrefix('/en/about')).toBe('/about')
    expect(stripLocalePrefix('/tc/about')).toBe('/tc/about')
  })
})

describe('localizedPath', () => {
  it('omits prefix for the default locale', () => {
    expect(DEFAULT_LOCALE).toBe('tc')
    expect(localizedPath('tc', '/en/foo')).toBe('/foo')
    expect(localizedPath('tc', '/')).toBe('/')
  })

  it('prefixes en paths', () => {
    expect(localizedPath('en', '/')).toBe('/en')
    expect(localizedPath('en', '/foo')).toBe('/en/foo')
  })
})
