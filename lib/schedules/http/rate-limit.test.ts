import { describe, expect, it } from 'vitest'

import { MemorySlidingWindow } from './rate-limit'

describe('MemorySlidingWindow', () => {
  it('admits up to the limit inside the window and then rejects', () => {
    const limiter = new MemorySlidingWindow(2, 1_000)
    const now = 1_000_000
    expect(limiter.tryAcquire('a', now)).toBe(true)
    expect(limiter.tryAcquire('a', now + 10)).toBe(true)
    expect(limiter.tryAcquire('a', now + 20)).toBe(false)
  })

  it('admits another request after the window slides', () => {
    const limiter = new MemorySlidingWindow(1, 500)
    const now = 1_000_000
    expect(limiter.tryAcquire('a', now)).toBe(true)
    expect(limiter.tryAcquire('a', now + 400)).toBe(false)
    expect(limiter.tryAcquire('a', now + 501)).toBe(true)
  })

  it('isolates keys and fails closed when the map is full', () => {
    const limiter = new MemorySlidingWindow(1, 60_000, 2)
    expect(limiter.tryAcquire('one', 1)).toBe(true)
    expect(limiter.tryAcquire('two', 1)).toBe(true)
    expect(limiter.tryAcquire('three', 1)).toBe(false)
    expect(limiter.trackedKeys).toBe(2)
  })
})
