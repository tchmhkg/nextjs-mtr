import type {
  EalTimeType,
  NextTrainDto,
  NextTrainPlatform,
  TrainRouteRow,
} from '../contracts/next-train.dto'
import type {
  LrPlatform,
  LrRouteRow,
  LrScheduleResponse,
} from '@lib/upstream/lr/types'

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

function nullableTime(value: unknown): string | null {
  if (value == null) return null
  const s = stringFromUnknown(value).trim()
  if (!s) return null
  return s
}

function mapTimeType(raw: string | undefined): EalTimeType | null {
  if (raw === 'A' || raw === 'D') return raw
  return null
}

function routeNumber(row: LrRouteRow): string | null {
  if (row.special === 1) {
    const special = stringFromUnknown(row.additionalInfo1).trim()
    if (special) return special
  }
  const route = stringFromUnknown(row.route_no).trim()
  return route || null
}

function mapRouteRow(
  row: LrRouteRow,
  platformId: string,
  seq: number,
  lang: string
): TrainRouteRow {
  const tc = lang.toLowerCase() === 'tc'
  const destLabel = tc
    ? stringFromUnknown(row.dest_ch).trim() ||
      stringFromUnknown(row.dest_en).trim()
    : stringFromUnknown(row.dest_en).trim() ||
      stringFromUnknown(row.dest_ch).trim()
  const timeRaw = tc
    ? nullableTime(row.time_ch) ?? nullableTime(row.time_en)
    : nullableTime(row.time_en) ?? nullableTime(row.time_ch)

  return {
    seq: String(seq),
    dest: destLabel || '-',
    destLabel: destLabel || '-',
    plat: platformId,
    time: timeRaw ?? '-',
    timeType: mapTimeType(row.arrival_departure),
    route: routeNumber(row),
    relativeEta: true,
    trainLength:
      typeof row.train_length === 'number' ? row.train_length : null,
  }
}

function mapPlatform(platform: LrPlatform, lang: string): NextTrainPlatform {
  const id = String(platform.platform_id)
  const routes = platform.route_list ?? []
  const trains = routes
    .filter((r) => r.stop !== 1)
    .map((r, i) => mapRouteRow(r, id, i + 1, lang))
  return { id, trains }
}

export function mapLrUpstreamToDto(
  raw: unknown,
  lang: string
): NextTrainDto {
  const data = (raw ?? {}) as LrScheduleResponse
  const status = Number(data.status)
  const systemTime = nullableTime(data.system_time)
  const platforms = (data.platform_list ?? [])
    .map((p) => mapPlatform(p, lang))
    .filter((p) => p.trains.length > 0)

  const isAlert = status === 0
  const hasTrains = platforms.length > 0

  return {
    up: null,
    down: null,
    platforms: hasTrains ? platforms : null,
    isDelayed: isAlert,
    lastUpdated: systemTime,
    sysTime: systemTime,
    alert: null,
  }
}
