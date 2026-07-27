import type {
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

function routeNumber(row: LrRouteRow): string | null {
  if (row.special === 1) {
    const special = stringFromUnknown(row.additionalInfo1).trim()
    if (special) return special
  }
  const route = stringFromUnknown(row.route_no).trim()
  return route || null
}

function routeRemark(row: LrRouteRow, lang: string): string | null {
  const tc = lang.toLowerCase() === 'tc'
  const primary = tc
    ? stringFromUnknown(row.routeRemarkChi2).trim()
    : stringFromUnknown(row.routeRemarkEng2).trim()
  if (primary) return primary
  const fallback = tc
    ? stringFromUnknown(row.routeRemarkEng2).trim()
    : stringFromUnknown(row.routeRemarkChi2).trim()
  return fallback || null
}

function mapRouteRow(
  row: LrRouteRow,
  platformId: string,
  seq: number,
  lang: string
): TrainRouteRow {
  const tc = lang.toLowerCase() === 'tc'
  const dest = tc
    ? stringFromUnknown(row.dest_ch).trim() ||
      stringFromUnknown(row.dest_en).trim()
    : stringFromUnknown(row.dest_en).trim() ||
      stringFromUnknown(row.dest_ch).trim()
  const timeRaw = tc
    ? nullableTime(row.time_ch) ?? nullableTime(row.time_en)
    : nullableTime(row.time_en) ?? nullableTime(row.time_ch)
  const route = routeNumber(row)
  const trainLength =
    typeof row.train_length === 'number' ? row.train_length : undefined

  return {
    seq: String(seq),
    dest: dest || '-',
    plat: platformId,
    time: timeRaw ?? '-',
    ...(route ? { route } : {}),
    relativeEta: true,
    ...(trainLength != null ? { trainLength } : {}),
  }
}

function mapPlatform(platform: LrPlatform, lang: string): NextTrainPlatform {
  const id = String(platform.platform_id)
  const endService = platform.end_service_status === 1
  const routes = platform.route_list ?? []
  const trains = routes
    .filter((r) => r.stop !== 1)
    .map((r, i) => mapRouteRow(r, id, i + 1, lang))
  return { id, trains, endService }
}

function collectRemarks(
  platforms: LrPlatform[],
  lang: string
): string[] {
  const seen = new Set<string>()
  const remarks: string[] = []
  for (const platform of platforms) {
    for (const row of platform.route_list ?? []) {
      const remark = routeRemark(row, lang)
      if (!remark || seen.has(remark)) continue
      seen.add(remark)
      remarks.push(remark)
    }
  }
  return remarks
}

export function mapLrUpstreamToDto(
  raw: unknown,
  lang: string
): NextTrainDto {
  const data = (raw ?? {}) as LrScheduleResponse
  const status = Number(data.status)
  const systemTime = nullableTime(data.system_time)
  const upstreamPlatforms = data.platform_list ?? []
  const platforms = upstreamPlatforms
    .map((p) => mapPlatform(p, lang))
    .filter((p) => p.trains.length > 0 || p.endService)

  const remarks = collectRemarks(upstreamPlatforms, lang)
  const isAlert = status === 0
  const hasPlatforms = platforms.length > 0

  return {
    up: null,
    down: null,
    platforms: hasPlatforms ? platforms : null,
    remarks: remarks.length ? remarks : null,
    isDelayed: isAlert,
    lastUpdated: systemTime,
    alert: null,
  }
}
