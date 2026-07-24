import { MTR_NEXT_TRAIN_API } from '@utils/api-urls'

import type { MtrLangCode } from './types'

export function normalizeMtrLang(input: string | null | undefined): MtrLangCode {
  const v = String(input ?? 'tc').toLowerCase()
  return v === 'en' ? 'EN' : 'TC'
}

/**
 * Fetches raw next-train JSON from the MTR open-data API.
 * Default: 30s ISR-style cache. Pass `fresh: true` to bypass the Data Cache.
 */
export async function fetchMtrSchedule(options: {
  line: string
  sta: string
  lang: string | null | undefined
  fresh?: boolean
}): Promise<unknown> {
  const { line, sta, lang, fresh = false } = options
  const mtrLang = normalizeMtrLang(lang)
  const url = new URL(MTR_NEXT_TRAIN_API)
  url.searchParams.set('line', line)
  url.searchParams.set('sta', sta)
  url.searchParams.set('lang', mtrLang)

  const res = await fetch(
    url.toString(),
    fresh ? { cache: 'no-store' } : { next: { revalidate: 30 } }
  )

  if (!res.ok) {
    const err = new Error(`MTR upstream HTTP ${res.status}`)
    ;(err as Error & { status?: number }).status = res.status
    throw err
  }

  return res.json()
}
