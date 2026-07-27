import { SUPPORTED_LOCALES } from './locale-path'
import { describe, expect, it } from 'vitest'

describe('SUPPORTED_LOCALES', () => {
  it('lists tc and en', () => {
    expect(SUPPORTED_LOCALES).toEqual(['tc', 'en'])
  })
})
