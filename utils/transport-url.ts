import type { TransportMode } from '@lib/schedules/contracts/transport-mode'

type LrDir = 1 | 2

function clearLineStaDir(params: URLSearchParams, mode: TransportMode) {
  params.set('mode', mode)
  params.delete('line')
  params.delete('sta')
  params.delete('dir')
}

function isBareLrUrl(sp: URLSearchParams): boolean {
  return (
    sp.get('mode') === 'lr' &&
    !sp.get('line') &&
    !sp.get('sta') &&
    !sp.get('dir')
  )
}

function nextLrQuery(
  searchParams: URLSearchParams,
  lrRouteCode: string | null,
  lrStationId: string | null,
  lrDir: LrDir
): string | null {
  const params = new URLSearchParams(searchParams.toString())
  if (!lrRouteCode || !lrStationId) {
    if (!lrRouteCode) {
      if (isBareLrUrl(searchParams)) return null
      clearLineStaDir(params, 'lr')
      return `?${params.toString()}`
    }
    if (searchParams.get('mode') !== 'lr') {
      clearLineStaDir(params, 'lr')
      return `?${params.toString()}`
    }
    if (!searchParams.get('sta')) return null
    params.delete('sta')
    return `?${params.toString()}`
  }
  if (
    searchParams.get('mode') === 'lr' &&
    searchParams.get('line') === lrRouteCode &&
    searchParams.get('sta') === lrStationId &&
    searchParams.get('dir') === String(lrDir)
  ) {
    return null
  }
  params.set('mode', 'lr')
  params.set('line', lrRouteCode)
  params.set('sta', lrStationId)
  params.set('dir', String(lrDir))
  return `?${params.toString()}`
}

function nextMtrQuery(
  searchParams: URLSearchParams,
  mtrLine?: string | null,
  mtrSta?: string | null
): string | null {
  const params = new URLSearchParams(searchParams.toString())
  if (!mtrLine || !mtrSta) {
    if (searchParams.get('mode') !== 'lr' && !searchParams.get('dir')) {
      return null
    }
    clearLineStaDir(params, 'mtr')
    return `?${params.toString()}`
  }
  if (
    (searchParams.get('mode') === 'mtr' || !searchParams.get('mode')) &&
    searchParams.get('line') === mtrLine &&
    searchParams.get('sta') === mtrSta &&
    !searchParams.get('dir')
  ) {
    return null
  }
  params.set('mode', 'mtr')
  params.set('line', mtrLine)
  params.set('sta', mtrSta)
  params.delete('dir')
  return `?${params.toString()}`
}

/** Returns the next `?…` query, or null when the URL is already in sync. */
export function nextTransportQuery(
  searchParams: URLSearchParams,
  mode: TransportMode,
  lrRouteCode: string | null,
  lrStationId: string | null,
  lrDir: LrDir,
  mtrLine?: string | null,
  mtrSta?: string | null
): string | null {
  if (mode === 'lr') {
    return nextLrQuery(searchParams, lrRouteCode, lrStationId, lrDir)
  }
  return nextMtrQuery(searchParams, mtrLine, mtrSta)
}
