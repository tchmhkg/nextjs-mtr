#!/usr/bin/env node
/**
 * Reads data/light_rail_routes_and_stops.csv + data/lr-station-coords.json
 * and writes data/lr-catalog.json.
 * Run: yarn build:lr-data  (refresh coords: yarn fetch:lr-coords)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const csvPath = path.join(root, 'data/light_rail_routes_and_stops.csv')
const coordsPath = path.join(root, 'data/lr-station-coords.json')
const outPath = path.join(root, 'data/lr-catalog.json')

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').trimEnd().split(/\r?\n/)
  const header = lines[0].split(',')
  const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]))
  const required = [
    'Line Code',
    'Direction',
    'Stop Code',
    'Stop ID',
    'Chinese Name',
    'English Name',
    'Sequence',
  ]
  for (const col of required) {
    if (idx[col] == null) throw new Error(`Missing CSV column: ${col}`)
  }
  return lines
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const cols = line.split(',')
      return {
        route: cols[idx['Line Code']].trim(),
        dir: Number(cols[idx['Direction']].trim()),
        stopCode: cols[idx['Stop Code']].trim(),
        stopId: cols[idx['Stop ID']].trim(),
        tc: cols[idx['Chinese Name']].trim(),
        en: cols[idx['English Name']].trim(),
        seq: Number(cols[idx['Sequence']].trim()),
      }
    })
}

const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'))
/** @type {Record<string, { lat: number, lng: number }>} */
const coordsById = JSON.parse(fs.readFileSync(coordsPath, 'utf8'))

/** @type {Map<string, { id: string, code: string, label: { en: string, tc: string }, location: { lat: number, lng: number } }>} */
const stations = new Map()
/** @type {Map<string, Map<number, { seq: number, id: string }[]>>} */
const routeDirs = new Map()

for (const row of rows) {
  if (!stations.has(row.stopId)) {
    const location = coordsById[row.stopId]
    if (
      !location ||
      typeof location.lat !== 'number' ||
      typeof location.lng !== 'number'
    ) {
      throw new Error(`build-lr-data: missing coords for Stop ID ${row.stopId}`)
    }
    stations.set(row.stopId, {
      id: row.stopId,
      code: row.stopCode,
      label: { en: row.en, tc: row.tc },
      location: { lat: location.lat, lng: location.lng },
    })
  }
  if (!routeDirs.has(row.route)) routeDirs.set(row.route, new Map())
  const dirs = routeDirs.get(row.route)
  if (!dirs.has(row.dir)) dirs.set(row.dir, [])
  dirs.get(row.dir).push({ seq: row.seq, id: row.stopId })
}

function dedupeConsecutive(ids) {
  const out = []
  for (const id of ids) {
    if (out.at(-1) !== id) out.push(id)
  }
  return out
}

const stationList = [...stations.values()].sort(
  (a, b) => Number(a.id) - Number(b.id)
)

const routes = [...routeDirs.keys()]
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
  .map((code) => {
    const dirs = routeDirs.get(code)
    const directions = [...dirs.keys()]
      .sort((a, b) => a - b)
      .map((dir) => {
        const ordered = dirs
          .get(dir)
          .sort((a, b) => a.seq - b.seq)
          .map((x) => x.id)
        return { dir, stopIds: dedupeConsecutive(ordered) }
      })
    return { code, directions }
  })

const catalog = { stations: stationList, routes }
fs.writeFileSync(outPath, `${JSON.stringify(catalog)}\n`)
console.error(
  `build-lr-data: ${stationList.length} stations, ${routes.length} routes → ${path.relative(root, outPath)}`
)
