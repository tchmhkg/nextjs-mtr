import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchLrSchedule } from './client'

describe('fetchLrSchedule', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('calls station_id and with_special=1', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 1, platform_list: [] }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await fetchLrSchedule({ stationId: '600', fresh: true })

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('station_id=600')
    expect(url).toContain('with_special=1')
    expect(init.cache).toBe('no-store')
  })

  it('throws with status on HTTP errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 429 })
    )
    await expect(fetchLrSchedule({ stationId: '1' })).rejects.toMatchObject({
      status: 429,
    })
  })
})
