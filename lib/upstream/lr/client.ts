import { ApiError } from '@lib/schedules/errors/api-error'

import type { LrScheduleRequest } from './types'

/**
 * Stub for future Light Rail schedule integration.
 * Spec: docs/LR_Next_Train_API_Spec_v1.1.pdf
 */
export async function fetchLrSchedule(
  _options: LrScheduleRequest
): Promise<never> {
  throw new ApiError(
    'NOT_IMPLEMENTED',
    'Light Rail schedule is not yet supported',
    501
  )
}
