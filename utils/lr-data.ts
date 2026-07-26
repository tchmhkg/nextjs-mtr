/**
 * Light Rail catalog accessors.
 * Station/route payloads live in data/lr-catalog.json (yarn build:lr-data).
 */
import catalog from '../data/lr-catalog.json'

export type LrStation = {
  id: string
  code: string
  label: { en: string; tc: string }
  location: { lat: number; lng: number }
}

export type LrRouteDirection = {
  dir: 1 | 2
  stopIds: readonly string[]
}

export type LrRoute = {
  code: string
  directions: readonly LrRouteDirection[]
}

export const LR_STATIONS: readonly LrStation[] = catalog.stations

export const LR_ROUTES: readonly LrRoute[] = catalog.routes as LrRoute[]

const KNOWN_LR_STATION = new Set(LR_STATIONS.map((s) => s.id))
const KNOWN_LR_ROUTE = new Set(LR_ROUTES.map((r) => r.code))
const STATION_BY_ID = new Map(LR_STATIONS.map((s) => [s.id, s]))
const ROUTE_BY_CODE = new Map(LR_ROUTES.map((r) => [r.code, r]))

export function isKnownLrStation(stationId: string): boolean {
  return KNOWN_LR_STATION.has(stationId)
}

export function isKnownLrRoute(routeCode: string): boolean {
  return KNOWN_LR_ROUTE.has(routeCode)
}

export function getLrStation(stationId: string): LrStation | undefined {
  return STATION_BY_ID.get(stationId)
}

export function getLrRoute(routeCode: string): LrRoute | undefined {
  return ROUTE_BY_CODE.get(routeCode)
}

export function getLrRouteStopIds(
  routeCode: string,
  dir: 1 | 2
): readonly string[] {
  const route = getLrRoute(routeCode)
  const direction = route?.directions.find((d) => d.dir === dir)
  return direction?.stopIds ?? []
}

/** Prefer current route/dir when they still serve the stop; else first route by code. */
export function findLrRouteServing(
  stationId: string,
  preferRouteCode?: string | null,
  preferDir: 1 | 2 = 1
): { routeCode: string; dir: 1 | 2 } | null {
  const serves = (routeCode: string, dir: 1 | 2) =>
    getLrRouteStopIds(routeCode, dir).includes(stationId)

  if (preferRouteCode && isKnownLrRoute(preferRouteCode)) {
    if (serves(preferRouteCode, preferDir)) {
      return { routeCode: preferRouteCode, dir: preferDir }
    }
    const other: 1 | 2 = preferDir === 1 ? 2 : 1
    if (serves(preferRouteCode, other)) {
      return { routeCode: preferRouteCode, dir: other }
    }
  }

  for (const route of LR_ROUTES) {
    if (serves(route.code, 1)) return { routeCode: route.code, dir: 1 }
    if (serves(route.code, 2)) return { routeCode: route.code, dir: 2 }
  }
  return null
}
