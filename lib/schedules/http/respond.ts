import { NextResponse } from 'next/server'

import type { ApiMeta, ApiResponse } from '../contracts/api-response'
import type { ApiError } from '../errors/api-error'

const CACHE_CONTROL = 'public, s-maxage=30, stale-while-revalidate=60'

export function toSuccessResponse<T>(
  data: T,
  meta: ApiMeta
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: true, data, meta },
    { headers: { 'Cache-Control': CACHE_CONTROL } }
  )
}

export function toErrorResponse(error: ApiError): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error: { code: error.code, message: error.message },
      data: null,
    },
    { status: error.status }
  )
}
