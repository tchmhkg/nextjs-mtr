import { describe, expect, it } from 'vitest'

import { journeyQuerySchema } from './journey.query'

describe('journeyQuerySchema', () => {
  it('parses origin destination and waiting flag', () => {
    const parsed = journeyQuerySchema.parse({
      origin: 'adm',
      destination: 'tko',
      includeWaiting: 'true',
    })
    expect(parsed).toEqual({
      origin: 'ADM',
      destination: 'TKO',
      includeWaiting: true,
    })
  })

  it('rejects bad codes', () => {
    expect(() =>
      journeyQuerySchema.parse({ origin: '1', destination: 'TKO' })
    ).toThrow()
  })
})
