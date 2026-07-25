/**
 * Light Rail catalog accessors.
 * Station/route payloads live in data/lr-catalog.json (yarn build:lr-data).
 */
import catalog from '../data/lr-catalog.json'

export type LrStation = {
  id: string
  code: string
  label: { en: string; tc: string }
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
