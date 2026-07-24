import { nextTrainQuerySchema } from '@lib/schedules/contracts/next-train.query'
import { ApiError, isApiError } from '@lib/schedules/errors/api-error'
import { getNextTrain } from '@lib/schedules/get-next-train'
import { toErrorResponse, toSuccessResponse } from '@lib/schedules/http/respond'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = {
    mode: searchParams.get('mode') ?? undefined,
    line: searchParams.get('line') ?? undefined,
    sta: searchParams.get('sta') ?? undefined,
    lang: searchParams.get('lang') ?? undefined,
    fresh: searchParams.get('fresh') ?? undefined,
  }

  if (!raw.line || !raw.sta) {
    return toErrorResponse(
      new ApiError(
        'MISSING_PARAMS',
        'Missing required parameters: line and sta',
        400
      )
    )
  }

  const parsed = nextTrainQuerySchema.safeParse(raw)
  if (!parsed.success) {
    return toErrorResponse(
      new ApiError(
        'VALIDATION_ERROR',
        parsed.error.issues[0]?.message ?? 'Invalid parameters',
        400
      )
    )
  }

  try {
    const result = await getNextTrain(parsed.data)
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
