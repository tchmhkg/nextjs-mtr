import { describe, expect, it } from 'vitest'

import { nextTrainQuerySchema } from './next-train.query'

describe('nextTrainQuerySchema', () => {
  it('accepts a known MTR line/station with defaults', () => {
    const parsed = nextTrainQuerySchema.parse({ line: 'TKL', sta: 'TKO' })
    expect(parsed).toMatchObject({
      mode: 'mtr',
      line: 'TKL',
      sta: 'TKO',
      lang: 'tc',
      fresh: false,
    })
  })

  it('parses fresh flags', () => {
    expect(
      nextTrainQuerySchema.parse({ line: 'TKL', sta: 'TKO', fresh: '1' }).fresh
    ).toBe(true)
    expect(
      nextTrainQuerySchema.parse({ line: 'TKL', sta: 'TKO', fresh: 'true' })
        .fresh
    ).toBe(true)
    expect(
      nextTrainQuerySchema.parse({ line: 'TKL', sta: 'TKO', fresh: '0' }).fresh
    ).toBe(false)
  })

  it('rejects unknown MTR line/station pairs', () => {
    expect(() =>
      nextTrainQuerySchema.parse({ line: 'ZZZ', sta: 'YYY' })
    ).toThrow(/Unknown line\/station/)
  })

  it('allows lr mode without known-station check', () => {
    const parsed = nextTrainQuerySchema.parse({
      mode: 'lr',
      line: '505',
      sta: '1',
      lang: 'en',
    })
    expect(parsed.mode).toBe('lr')
    expect(parsed.lang).toBe('en')
  })
})
