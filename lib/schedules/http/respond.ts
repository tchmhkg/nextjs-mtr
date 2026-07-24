import { NextResponse } from 'next/server'

import type { ApiMeta, ApiResponse } from '../contracts/api-response'
import type { ApiError } from '../errors/api-error'

const CACHE_CONTROL_POLL = 'public, s-maxage=30, stale-while-revalidate=60'
const CACHE_CONTROL_FRESH = 'private, no-store'

export function toSuccessResponse<T>(
  data: T,
  meta: ApiMeta,
  options?: { fresh?: boolean }
): NextResponse<ApiResponse<T>> {
  const cacheControl = options?.fresh ? CACHE_CONTROL_FRESH : CACHE_CONTROL_POLL
  return NextResponse.json(
    { success: true, data, meta },
    { headers: { 'Cache-Control': cacheControl } }
  )
}

export function toErrorResponse(
  error: ApiError
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error: { code: error.code, message: error.message },
      data: null,
    },
    { status: error.status }
  )
}
