import type { MtrScheduleParsed, MtrStationSchedule } from '@lib/upstream/mtr/types'
import type { NextTrainDto } from '../contracts/next-train.dto'

function stringFromUnknown(value: unknown): string {
  if (typeof value === 'string') return value
  if (value == null) return ''
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return '[unserializable]'
  }
}

function decodeUriSafe(value: string): string {
  try {
    return decodeURI(value)
  } catch {
    return value
  }
}

export function parseMtrUpstreamRaw(
  raw: unknown,
  line: string,
  sta: string
): MtrScheduleParsed {
  const r = raw as Record<string, unknown>
  const key = `${line}-${sta}`
  const dataBlock = r?.data as Record<string, unknown> | undefined
  const station = (dataBlock?.[key] as MtrStationSchedule | undefined) ?? null
  const isdelay = r?.isdelay === 'Y'
  const curr_time = (r?.curr_time as string | null | undefined) ?? null
  const messageStr = stringFromUnknown(r.message)
  const urlRaw = r.url == null ? '' : stringFromUnknown(r.url)
  const alert =
    r?.status === 0 && messageStr
      ? {
        message: messageStr,
        url: urlRaw === '' ? null : decodeUriSafe(urlRaw),
      }
      : null
  return {
    schedule: station,
    isdelay,
    curr_time,
    alert,
  }
}

export function mapMtrUpstreamToDto(
  raw: unknown,
  line: string,
  sta: string
): NextTrainDto {
  const parsed = parseMtrUpstreamRaw(raw, line, sta)
  return {
    up: parsed.schedule?.UP ?? null,
    down: parsed.schedule?.DOWN ?? null,
    isDelayed: parsed.isdelay,
    lastUpdated: parsed.curr_time,
    alert: parsed.alert,
  }
}
