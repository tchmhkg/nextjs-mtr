import { env } from '@lib/env'
import { NextResponse } from 'next/server'

import type { ApiMeta, ApiResponse } from '../contracts/api-response'
import type { ApiError } from '../errors/api-error'

function pollCacheControl(): string {
  return `public, s-maxage=${env.SCHEDULE_S_MAXAGE_SECONDS}, stale-while-revalidate=${env.SCHEDULE_STALE_WHILE_REVALIDATE_SECONDS}`
}

const CACHE_CONTROL_FRESH = 'private, no-store'

export function toSuccessResponse<T>(
  data: T,
  meta: ApiMeta,
  options?: { fresh?: boolean }
): NextResponse<ApiResponse<T>> {
  const cacheControl = options?.fresh ? CACHE_CONTROL_FRESH : pollCacheControl()
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
