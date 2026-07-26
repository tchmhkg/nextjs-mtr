#!/usr/bin/env node
/**
 * Fetches MTR Light Rail stop coordinates from OpenStreetMap (Overpass)
 * and writes data/lr-station-coords.json keyed by official Stop ID.
 *
 * Join key: OSM tag `ref` is the numeric Stop ID (zero-padded, e.g. "001" → "1").
 * Skips non-catalog nodes (e.g. Hung Tin Road Emergency Platform ref=385).
 *
 * Data © OpenStreetMap contributors, ODbL.
 * Run: yarn fetch:lr-coords
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const catalogPath = path.join(root, 'data/lr-catalog.json')
const outPath = path.join(root, 'data/lr-station-coords.json')

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const QUERY = `[out:json][timeout:90];
(
  node["railway"="station"]["station"="light_rail"](22.35,113.90,22.50,114.15);
  node["railway"="halt"]["station"="light_rail"](22.35,113.90,22.50,114.15);
);
out body;`

// Self-check: Tuen Mun Ferry Pier (id 1) should land near the pier.
const FERRY_PIER = { id: '1', lat: 22.37, lng: 113.97, tol: 0.02 }

function catalogStationIds() {
  // Prefer CSV-derived IDs via existing catalog (routes/stations without coords ok).
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
  return new Set(catalog.stations.map((s) => String(s.id)))
}

async function fetchOverpass() {
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // Overpass returns 406 without a non-default User-Agent.
      'User-Agent': 'Node.js',
    },
    body: new URLSearchParams({ data: QUERY }),
  })
  if (!res.ok) {
    throw new Error(`Overpass HTTP ${res.status}: ${await res.text()}`)
  }
  return res.json()
}

const wanted = catalogStationIds()
const data = await fetchOverpass()
const elements = data.elements ?? []

/** @type {Record<string, { lat: number, lng: number }>} */
const coords = {}
for (const el of elements) {
  const ref = el.tags?.ref
  if (ref == null || el.lat == null || el.lon == null) continue
  const id = String(Number.parseInt(String(ref), 10))
  if (!wanted.has(id)) continue
  coords[id] = { lat: el.lat, lng: el.lon }
}

const missing = [...wanted].filter((id) => !coords[id]).sort((a, b) => a - b)
if (missing.length) {
  throw new Error(
    `fetch-lr-coords: missing coords for Stop IDs: ${missing.join(', ')}`
  )
}
if (Object.keys(coords).length !== wanted.size) {
  throw new Error(
    `fetch-lr-coords: expected ${wanted.size} stations, got ${Object.keys(coords).length}`
  )
}

const ferry = coords[FERRY_PIER.id]
if (
  !ferry ||
  Math.abs(ferry.lat - FERRY_PIER.lat) > FERRY_PIER.tol ||
  Math.abs(ferry.lng - FERRY_PIER.lng) > FERRY_PIER.tol
) {
  throw new Error(
    `fetch-lr-coords: Stop ID ${FERRY_PIER.id} coords look wrong: ${JSON.stringify(ferry)}`
  )
}

const ordered = Object.fromEntries(
  [...Object.entries(coords)].sort((a, b) => Number(a[0]) - Number(b[0]))
)
fs.writeFileSync(outPath, `${JSON.stringify(ordered, null, 2)}\n`)
console.error(
  `fetch-lr-coords: ${Object.keys(ordered).length} stations → ${path.relative(root, outPath)}`
)
