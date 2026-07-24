import { env } from '@lib/env'
import { LR_NEXT_TRAIN_API } from '@utils/api-urls'

import type { LrScheduleRequest } from './types'

/**
 * Fetches Light Rail next-train JSON.
 * Spec: docs/LR_Next_Train_API_Spec_v1.1.pdf
 */
export async function fetchLrSchedule(
  options: LrScheduleRequest
): Promise<unknown> {
  if (!LR_NEXT_TRAIN_API) {
    const err = new Error('LR upstream URL is not configured')
    ;(err as Error & { status?: number }).status = 503
    throw err
  }

  const { stationId, withSpecial = true, fresh = false } = options
  const url = new URL(LR_NEXT_TRAIN_API)
  url.searchParams.set('station_id', stationId)
  url.searchParams.set('with_special', withSpecial ? '1' : '0')

  const res = await fetch(
    url.toString(),
    fresh
      ? { cache: 'no-store' }
      : { next: { revalidate: env.SCHEDULE_REVALIDATE_SECONDS } }
  )

  if (!res.ok) {
    const err = new Error(`LR upstream HTTP ${res.status}`)
    ;(err as Error & { status?: number }).status = res.status
    throw err
  }

  return res.json()
}
