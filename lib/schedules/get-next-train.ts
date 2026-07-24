import { fetchLrSchedule } from '@lib/upstream/lr/client'
import { fetchMtrSchedule } from '@lib/upstream/mtr/client'
import type { ApiMeta } from './contracts/api-response'
import type { NextTrainDto } from './contracts/next-train.dto'
import type { TransportMode } from './contracts/transport-mode'
import { ApiError, getUpstreamStatus, isApiError } from './errors/api-error'
import { mapMtrUpstreamToDto } from './mappers/mtr-schedule.mapper'

export type GetNextTrainInput = {
  mode?: TransportMode
  line: string
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

async function getMtrNextTrain(
  input: GetNextTrainInput
): Promise<GetNextTrainResult> {
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
    if (isApiError(error)) throw error

    const status = getUpstreamStatus(error)
    if (status === 404) {
      throw new ApiError('NOT_FOUND', 'Schedule not found', 404)
    }
    if (status === 429) {
      throw new ApiError('UPSTREAM_ERROR', 'Too many requests to MTR API', 429)
    }
    if (status && status >= 400 && status < 500) {
      throw new ApiError('UPSTREAM_ERROR', 'MTR API returned an error', status)
    }
    throw new ApiError('UPSTREAM_ERROR', 'Failed to fetch train data', 503)
  }
}

async function getLrNextTrain(
  input: GetNextTrainInput
): Promise<GetNextTrainResult> {
  await fetchLrSchedule({
    line: input.line,
    sta: input.sta,
    lang: input.lang,
  })
  throw new ApiError(
    'NOT_IMPLEMENTED',
    'Light Rail schedule is not yet supported',
    501
  )
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
