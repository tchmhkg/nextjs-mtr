import { fetchLrSchedule } from '@lib/upstream/lr/client'
import { fetchMtrSchedule } from '@lib/upstream/mtr/client'
import type { ApiMeta } from './contracts/api-response'
import type { NextTrainDto } from './contracts/next-train.dto'
import type { TransportMode } from './contracts/transport-mode'
import { ApiError, getUpstreamStatus, isApiError } from './errors/api-error'
import { mapLrUpstreamToDto } from './mappers/lr-schedule.mapper'
import { mapMtrUpstreamToDto } from './mappers/mtr-schedule.mapper'

export type GetNextTrainInput = {
  mode?: TransportMode
  line?: string
  sta: string
  lang: string
  fresh?: boolean
}

export type GetNextTrainResult = {
  data: NextTrainDto
  meta: ApiMeta
}

function buildMeta(source: TransportMode): ApiMeta {
  return {
    source,
    revalidatedAt: new Date().toISOString(),
  }
}

function mapUpstreamError(error: unknown): never {
  if (isApiError(error)) throw error

  const status = getUpstreamStatus(error)
  if (status === 404) {
    throw new ApiError('NOT_FOUND', 'Station not available', 404)
  }
  if (status === 429) {
    throw new ApiError('RATE_LIMITED', 'Please wait before refreshing again', 429)
  }
  if (status && status >= 400 && status < 500) {
    throw new ApiError('UPSTREAM_ERROR', 'Failed to load schedule', status)
  }
  throw new ApiError('UPSTREAM_ERROR', 'Failed to load schedule', 503)
}

async function getMtrNextTrain(
  input: GetNextTrainInput
): Promise<GetNextTrainResult> {
  if (!input.line) {
    throw new ApiError('MISSING_PARAMS', 'Station not available', 400)
  }
  try {
    const raw = await fetchMtrSchedule({
      line: input.line,
      sta: input.sta,
      lang: input.lang,
      fresh: input.fresh,
    })
    const data = mapMtrUpstreamToDto(raw, input.line, input.sta)
    return { data, meta: buildMeta('mtr') }
  } catch (error) {
    mapUpstreamError(error)
  }
}

async function getLrNextTrain(
  input: GetNextTrainInput
): Promise<GetNextTrainResult> {
  try {
    const raw = await fetchLrSchedule({
      stationId: input.sta,
      withSpecial: true,
      fresh: input.fresh,
    })
    const data = mapLrUpstreamToDto(raw, input.lang)
    return { data, meta: buildMeta('lr') }
  } catch (error) {
    mapUpstreamError(error)
  }
}

export async function getNextTrain(
  input: GetNextTrainInput
): Promise<GetNextTrainResult> {
  const mode = input.mode ?? 'mtr'

  switch (mode) {
    case 'mtr':
      return getMtrNextTrain(input)
    case 'lr':
      return getLrNextTrain(input)
    default:
      throw new ApiError('VALIDATION_ERROR', `Unknown mode: ${mode}`, 400)
  }
}
