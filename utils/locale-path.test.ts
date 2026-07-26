import { describe, expect, it } from 'vitest'

import {
  DEFAULT_LOCALE,
  localizedPath,
  preferTcIfChinese,
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

describe('preferTcIfChinese', () => {
  it('rewrites when a Chinese tag is present', () => {
    expect(preferTcIfChinese('zh-HK,zh;q=0.9,en;q=0.8')).toBe('tc,en;q=0.8')
    expect(preferTcIfChinese('zh-CN,zh;q=0.9,en;q=0.8')).toBe('tc,en;q=0.8')
    expect(preferTcIfChinese('zh')).toBe('tc,en;q=0.8')
  })

  it('leaves non-Chinese headers unchanged', () => {
    expect(preferTcIfChinese('en-US,en;q=0.9')).toBe('en-US,en;q=0.9')
    expect(preferTcIfChinese(null)).toBeNull()
  })
})
