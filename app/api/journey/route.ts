import { getJourney } from '@lib/journeys/get-journey'
import { journeyQuerySchema } from '@lib/journeys/journey.query'
import { ApiError, isApiError } from '@lib/schedules/errors/api-error'
import { clientIpFromRequest } from '@lib/schedules/http/fresh-guard'
import { assertGeneralRateLimit } from '@lib/schedules/http/rate-limit'
import { toErrorResponse, toSuccessResponse } from '@lib/schedules/http/respond'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = journeyQuerySchema.safeParse({
    origin: searchParams.get('origin') ?? undefined,
    destination: searchParams.get('destination') ?? undefined,
    includeWaiting: searchParams.get('includeWaiting') ?? undefined,
  })

  if (!parsed.success) {
    return toErrorResponse(
      new ApiError('VALIDATION_ERROR', 'Invalid origin or destination', 400)
    )
  }

  try {
    await assertGeneralRateLimit(clientIpFromRequest(request))
  } catch (error) {
    if (isApiError(error)) return toErrorResponse(error)
    throw error
  }

  try {
    const result = await getJourney(parsed.data)
    return toSuccessResponse(result.data, result.meta, { fresh: true })
  } catch (error) {
    console.error('Journey API error:', error)
    if (isApiError(error)) return toErrorResponse(error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPSTREAM_ERROR',
          message: 'Failed to estimate journey',
        },
        data: null,
      },
      { status: 503 }
    )
  }
}
