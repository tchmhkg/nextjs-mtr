import { preferFreshThenPoll } from '@lib/schedules/prefer-fresh'
import { describe, expect, it, vi } from 'vitest'

describe('preferFreshThenPoll', () => {
  it('returns fresh when fresh succeeds', async () => {
    const poll = vi.fn(async () => 'cached')
    const r = await preferFreshThenPoll(async () => 'live', poll)
    expect(r).toEqual({ data: 'live', source: 'fresh' })
    expect(poll).not.toHaveBeenCalled()
  })

  it('falls back to poll when fresh fails', async () => {
    const r = await preferFreshThenPoll(
      async () => {
        throw new Error('RATE_LIMITED')
      },
      async () => 'cached'
    )
    expect(r).toEqual({ data: 'cached', source: 'poll' })
  })

  it('propagates poll failure after fresh failure', async () => {
    await expect(
      preferFreshThenPoll(
        async () => {
          throw new Error('fresh')
        },
        async () => {
          throw new Error('poll')
        }
      )
    ).rejects.toThrow('poll')
  })
})
