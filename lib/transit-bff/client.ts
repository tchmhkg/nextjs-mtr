import { env } from '@lib/env'
import type { ApiErrorCode, ApiMeta } from '@lib/schedules/contracts/api-response'
import { ApiError } from '@lib/schedules/errors/api-error'

const ERROR_CODES = new Set<string>([
  'MISSING_PARAMS',
  'VALIDATION_ERROR',
  'UNKNOWN_STOP',
  'SAME_STOP',
  'UPSTREAM_ERROR',
  'NOT_FOUND',
  'NOT_IMPLEMENTED',
  'FORBIDDEN',
  'RATE_LIMITED',
])

type RemoteEnvelope<T> =
  | { success: true; data: T; meta: { source: string; revalidatedAt: string } }
  | { success: false; error: { code: string; message: string }; data: null }

function asErrorCode(code: string): ApiErrorCode {
  return ERROR_CODES.has(code) ? (code as ApiErrorCode) : 'UPSTREAM_ERROR'
}

export function useJavaBackend(): boolean {
  return env.BACKEND_PROVIDER === 'java'
}

export async function fetchTransitBff<T>(
  path: string,
  query: Record<string, string | undefined>
): Promise<{ data: T; meta: ApiMeta }> {
  const base = env.BACKEND_API_BASE_URL
  if (!base) {
    throw new ApiError('UPSTREAM_ERROR', 'BACKEND_API_BASE_URL is not set', 503)
  }

  const url = new URL(path, base.endsWith('/') ? base : `${base}/`)
  for (const [key, value] of Object.entries(query)) {
    if (value != null && value !== '') url.searchParams.set(key, value)
  }

  let res: Response
  try {
    res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Sec-Fetch-Site': 'same-origin',
      },
      cache: 'no-store',
    })
  } catch {
    throw new ApiError('UPSTREAM_ERROR', 'Failed to reach transit API', 503)
  }

  let body: RemoteEnvelope<T>
  try {
    body = (await res.json()) as RemoteEnvelope<T>
  } catch {
    throw new ApiError('UPSTREAM_ERROR', 'Invalid transit API response', 503)
  }

  if (!body || typeof body !== 'object' || !('success' in body)) {
    throw new ApiError('UPSTREAM_ERROR', 'Invalid transit API response', 503)
  }

  if (!body.success) {
    const code = asErrorCode(body.error?.code ?? 'UPSTREAM_ERROR')
    const message = body.error?.message || 'Transit API error'
    throw new ApiError(code, message, res.status || 503)
  }

  const source = body.meta?.source
  const revalidatedAt = body.meta?.revalidatedAt
  if (!source || !revalidatedAt) {
    throw new ApiError('UPSTREAM_ERROR', 'Invalid transit API meta', 503)
  }

  return {
    data: body.data,
    meta: {
      source: source === 'lr' ? 'lr' : 'mtr',
      revalidatedAt:
        typeof revalidatedAt === 'string'
          ? revalidatedAt
          : String(revalidatedAt),
    },
  }
}
