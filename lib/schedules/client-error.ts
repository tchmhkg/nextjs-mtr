import type { ApiErrorCode } from '@lib/schedules/contracts/api-response'
import type { MessageKey } from '@i18n/message-key'

export class ScheduleFetchError extends Error {
  readonly code: ApiErrorCode
  readonly status: number

  constructor(code: ApiErrorCode, status: number) {
    super(code)
    this.name = 'ScheduleFetchError'
    this.code = code
    this.status = status
  }
}

export function isScheduleFetchError(
  error: unknown
): error is ScheduleFetchError {
  return error instanceof ScheduleFetchError
}

const API_CODES: ReadonlySet<string> = new Set([
  'MISSING_PARAMS',
  'VALIDATION_ERROR',
  'UPSTREAM_ERROR',
  'NOT_FOUND',
  'NOT_IMPLEMENTED',
  'FORBIDDEN',
  'RATE_LIMITED',
])

export function parseApiErrorCode(raw: unknown): ApiErrorCode {
  if (typeof raw === 'string' && API_CODES.has(raw)) {
    return raw as ApiErrorCode
  }
  return 'UPSTREAM_ERROR'
}

/** Map API error codes to next-intl message keys. Never display API `message`. */
export function apiErrorToMessageKey(code: ApiErrorCode): MessageKey {
  switch (code) {
    case 'RATE_LIMITED':
      return 'Please wait before refreshing again'
    case 'FORBIDDEN':
      return 'Refresh is unavailable'
    case 'NOT_FOUND':
    case 'VALIDATION_ERROR':
    case 'MISSING_PARAMS':
      return 'Station not available'
    case 'NOT_IMPLEMENTED':
      return 'Failed to load schedule'
    case 'UPSTREAM_ERROR':
    default:
      return 'Failed to load schedule'
  }
}
