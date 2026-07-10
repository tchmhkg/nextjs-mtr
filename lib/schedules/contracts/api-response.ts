import type { TransportMode } from './transport-mode'

export type ApiErrorCode =
  | 'MISSING_PARAMS'
  | 'VALIDATION_ERROR'
  | 'UPSTREAM_ERROR'
  | 'NOT_FOUND'
  | 'NOT_IMPLEMENTED'

export interface ApiErrorBody {
  code: ApiErrorCode
  message: string
}

export interface ApiMeta {
  source: TransportMode
  revalidatedAt: string
}

export type ApiSuccessResponse<T> = {
  success: true
  data: T
  meta: ApiMeta
}

export type ApiErrorResponse = {
  success: false
  error: ApiErrorBody
  data: null
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
