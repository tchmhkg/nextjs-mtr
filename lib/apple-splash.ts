import sizes from '../data/apple-splash.json'

export type AppleSplashSize = {
  cssW: number
  cssH: number
  dpr: number
  /** Override when PNG pixels ≠ css × dpr (iPhone Plus quirk). */
  pxW?: number
  pxH?: number
}

export function appleSplashPixels(s: AppleSplashSize): {
  pxW: number
  pxH: number
} {
  return {
    pxW: s.pxW ?? s.cssW * s.dpr,
    pxH: s.pxH ?? s.cssH * s.dpr,
  }
}

export function appleSplashAsset(s: AppleSplashSize): {
  href: string
  media: string
  pxW: number
  pxH: number
} {
  const { pxW, pxH } = appleSplashPixels(s)
  return {
    href: `/splashscreens/${pxW}x${pxH}.png`,
    media: `(device-width: ${s.cssW}px) and (device-height: ${s.cssH}px) and (-webkit-device-pixel-ratio: ${s.dpr})`,
    pxW,
    pxH,
  }
}

/** Unique CSS viewport × DPR rows for apple-touch-startup-image. */
export const APPLE_SPLASH = (sizes as AppleSplashSize[]).map(appleSplashAsset)
