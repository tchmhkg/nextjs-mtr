import { nextTrainQuerySchema } from '@lib/schedules/contracts/next-train.query'
import { ApiError, isApiError } from '@lib/schedules/errors/api-error'
import { getNextTrain } from '@lib/schedules/get-next-train'
import {
  assertFreshAllowed,
  clientIpFromRequest,
} from '@lib/schedules/http/fresh-guard'
import { assertGeneralRateLimit } from '@lib/schedules/http/rate-limit'
import { toErrorResponse, toSuccessResponse } from '@lib/schedules/http/respond'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = {
    mode: searchParams.get('mode') ?? undefined,
    line: searchParams.get('line') ?? undefined,
    sta: searchParams.get('sta') ?? undefined,
    lang: searchParams.get('lang') ?? undefined,
    dir: searchParams.get('dir') ?? undefined,
    fresh: searchParams.get('fresh') ?? undefined,
  }

  if (!raw.sta) {
    return toErrorResponse(
      new ApiError(
        'MISSING_PARAMS',
        'Station not available',
        400
      )
    )
  }

  const mode = raw.mode ?? 'mtr'
  if (mode !== 'lr' && !raw.line) {
    return toErrorResponse(
      new ApiError(
        'MISSING_PARAMS',
        'Station not available',
        400
      )
    )
  }

  const parsed = nextTrainQuerySchema.safeParse(raw)
  if (!parsed.success) {
    return toErrorResponse(
      new ApiError(
        'VALIDATION_ERROR',
        'Station not available',
        400
      )
    )
  }

  try {
    await assertGeneralRateLimit(clientIpFromRequest(request))
    if (parsed.data.fresh) {
      await assertFreshAllowed(request)
    }
  } catch (error) {
    if (isApiError(error)) return toErrorResponse(error)
    throw error
  }

  try {
    const { dir: _dir, ...input } = parsed.data
    const result = await getNextTrain(input)
    return toSuccessResponse(result.data, result.meta, {
      fresh: Boolean(parsed.data.fresh),
    })
  } catch (error) {
    console.error('Next train API error:', error)
    if (isApiError(error)) {
      return toErrorResponse(error)
    }
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UPSTREAM_ERROR', message: 'Failed to fetch train data' },
        data: null,
      },
      { status: 503 }
    )
  }
}
