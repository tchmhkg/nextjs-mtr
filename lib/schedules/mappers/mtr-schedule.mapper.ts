import { sanitizeAlertUrl } from '../sanitize-alert-url'
import type {
  MtrScheduleParsed,
  MtrStationSchedule,
  MtrTrainRouteRow,
} from '@lib/upstream/mtr/types'
import type {
  EalTimeType,
  NextTrainDto,
  TrainRouteRow,
} from '../contracts/next-train.dto'

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

/** Spec uses `"-" ` for absent timestamps. */
function nullableTime(value: unknown): string | null {
  if (value == null) return null
  const s = stringFromUnknown(value).trim()
  if (!s || s === '-') return null
  return s
}

function mapTimeType(raw: string | undefined): EalTimeType | null {
  if (raw === 'A' || raw === 'D') return raw
  return null
}

function mapRoute(raw: string | undefined): string | null {
  if (raw == null) return null
  const v = raw.trim()
  if (!v) return null
  return v
}

function mapTrainRow(row: MtrTrainRouteRow): TrainRouteRow | null {
  const time = nullableTime(row.time)
  if (!time) return null
  return {
    seq: String(row.seq ?? ''),
    dest: String(row.dest ?? ''),
    plat: String(row.plat ?? ''),
    time,
    timeType: mapTimeType(row.timetype),
    route: mapRoute(row.route),
  }
}

function mapDirection(
  rows: MtrTrainRouteRow[] | undefined
): TrainRouteRow[] | null {
  if (!rows?.length) return null
  const mapped = rows
    .map(mapTrainRow)
    .filter((r): r is TrainRouteRow => r != null)
  return mapped.length ? mapped : null
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
  // Prefer station-level curr_time; accept top-level curr_time or alert typo cur_time
  const curr_time =
    nullableTime(station?.curr_time) ??
    nullableTime(r?.curr_time) ??
    nullableTime(r?.cur_time)
  const sys_time =
    nullableTime(station?.sys_time) ?? nullableTime(r?.sys_time)
  const messageStr = stringFromUnknown(r.message)
  const urlRaw = r.url == null ? '' : stringFromUnknown(r.url)
  const alertUrl =
    urlRaw === '' ? null : sanitizeAlertUrl(decodeUriSafe(urlRaw))
  const alert =
    r?.status === 0 && messageStr
      ? {
          message: messageStr,
          url: alertUrl,
        }
      : null
  return {
    schedule: station,
    isdelay,
    curr_time,
    sys_time,
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
    up: mapDirection(parsed.schedule?.UP),
    down: mapDirection(parsed.schedule?.DOWN),
    isDelayed: parsed.isdelay,
    lastUpdated: parsed.curr_time,
    sysTime: parsed.sys_time,
    alert: parsed.alert,
  }
}
