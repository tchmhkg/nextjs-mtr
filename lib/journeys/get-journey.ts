import { env } from '@lib/env'
import { ApiError } from '@lib/schedules/errors/api-error'
import {
  AppError,
  createJourneyRuntime,
  type JourneyEstimate,
} from 'hk-journey-time'

function mapAppError(error: AppError): ApiError {
  switch (error.code) {
    case 'VALIDATION_ERROR':
    case 'UNKNOWN_STOP':
    case 'SAME_STOP':
      return new ApiError('VALIDATION_ERROR', error.message, 400)
    case 'NO_ROUTE':
      return new ApiError('NOT_FOUND', error.message, 404)
    case 'RATE_LIMITED':
      return new ApiError('RATE_LIMITED', error.message, 429)
    case 'NOT_READY':
      return new ApiError('UPSTREAM_ERROR', error.message, 503)
    default:
      return new ApiError('UPSTREAM_ERROR', 'Failed to estimate journey', 503)
  }
}

export type GetJourneyInput = {
  origin: string
  destination: string
  includeWaiting?: boolean
}

export type GetJourneyResult = {
  data: JourneyEstimate
  meta: { source: 'mtr'; revalidatedAt: string }
}

export async function getJourney(
  input: GetJourneyInput
): Promise<GetJourneyResult> {
  try {
    const runtime = createJourneyRuntime()
    const waitingProvider = input.includeWaiting
      ? runtime.createNextTrainWaitingProvider({
        baseUrl: env.MTR_NEXT_TRAIN_API_URL,
        timeoutMs: 3000,
      })
      : undefined

    const data = await runtime.estimate(
      {
        origin: input.origin,
        destination: input.destination,
        includeWaiting: input.includeWaiting,
      },
      waitingProvider
    )

    return {
      data,
      meta: {
        source: 'mtr',
        revalidatedAt: new Date().toISOString(),
      },
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw mapAppError(error)
    }
    // Surface ENOENT / missing graph data instead of a blank 503.
    const message =
      error instanceof Error ? error.message : 'Failed to estimate journey'
    throw new ApiError('UPSTREAM_ERROR', message, 503)
  }
}
