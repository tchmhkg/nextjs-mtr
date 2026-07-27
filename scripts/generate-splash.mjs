/**
 * Generate iOS apple-touch-startup-image PNGs from data/apple-splash.json.
 * Filenames are pixel size only (e.g. 1320x2868.png) — not device names.
 *
 * Usage: yarn generate:splash
 * New screen size: add a { cssW, cssH, dpr } row to data/apple-splash.json, re-run.
 */
import { readFileSync, readdirSync, unlinkSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outDir = path.join(root, 'public/splashscreens')
const iconPath = path.join(root, 'public/assets/icon-192x192.png')
const sizesPath = path.join(root, 'data/apple-splash.json')

const BG = '#e2e8f0'

/** @type {{ cssW: number, cssH: number, dpr: number, pxW?: number, pxH?: number }[]} */
const sizes = JSON.parse(readFileSync(sizesPath, 'utf8'))

function pixels(s) {
  return {
    pxW: s.pxW ?? s.cssW * s.dpr,
    pxH: s.pxH ?? s.cssH * s.dpr,
  }
}

async function make(pxW, pxH) {
  const iconSize = Math.round(Math.min(pxW, pxH) * 0.22)
  const icon = await sharp(iconPath).resize(iconSize, iconSize).png().toBuffer()
  const left = Math.round((pxW - iconSize) / 2)
  const top = Math.round((pxH - iconSize) / 2)
  const file = `${pxW}x${pxH}.png`
  await sharp({
    create: { width: pxW, height: pxH, channels: 3, background: BG },
  })
    .composite([{ input: icon, left, top }])
    .png({ palette: true, colors: 64 })
    .toFile(path.join(outDir, file))
  console.log('wrote', file)
  return file
}

const keep = new Set()
for (const s of sizes) {
  const { pxW, pxH } = pixels(s)
  keep.add(await make(pxW, pxH))
}

for (const name of readdirSync(outDir)) {
  if (!name.endsWith('.png')) continue
  if (keep.has(name)) continue
  unlinkSync(path.join(outDir, name))
  console.log('removed', name)
}
