import { MTR_NEXT_TRAIN_API } from '@utils/api-urls'

export type MtrLangCode = 'TC' | 'EN'

export function normalizeMtrLang(input: string | null | undefined): MtrLangCode {
  const v = String(input ?? 'tc').toLowerCase()
  return v === 'en' ? 'EN' : 'TC'
}

/** Parsed station schedule (UP/DOWN) from the MTR open-data API. */
export interface MtrStationSchedule {
  UP?: TrainRouteRow[]
  DOWN?: TrainRouteRow[]
}

export interface TrainRouteRow {
  seq: string
  dest: string
  plat: string
  time: string
  [key: string]: unknown
}

export interface MtrNextTrainParsed {
  data: MtrStationSchedule | null
  isdelay: boolean
  curr_time: string | null
  alert: { message: string; url: string | null } | null
}

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

export function parseMtrUpstreamBody(
  raw: unknown,
  line: string,
  sta: string
): MtrNextTrainParsed {
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
    data: station,
    isdelay,
    curr_time,
    alert,
  }
}

/**
 * Fetches next-train data from the upstream MTR API with a 30s ISR-style cache.
 * Use from Route Handlers and Server Components only.
 */
export async function fetchMtrNextTrain(options: {
  line: string
  sta: string
  lang: string | null | undefined
}): Promise<MtrNextTrainParsed> {
  const { line, sta, lang } = options
  const mtrLang = normalizeMtrLang(lang)
  const url = new URL(MTR_NEXT_TRAIN_API)
  url.searchParams.set('line', line)
  url.searchParams.set('sta', sta)
  url.searchParams.set('lang', mtrLang)

  const res = await fetch(url.toString(), {
    next: { revalidate: 30 },
  })

  if (!res.ok) {
    const err = new Error(`MTR upstream HTTP ${res.status}`)
    ;(err as Error & { status?: number }).status = res.status
    throw err
  }

  const raw: unknown = await res.json()
  return parseMtrUpstreamBody(raw, line, sta)
}
