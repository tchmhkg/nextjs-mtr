import { appleSplashAsset } from '@lib/apple-splash'
import { describe, expect, it } from 'vitest'

describe('appleSplashAsset', () => {
  it('names files by pixel size, not device', () => {
    const a = appleSplashAsset({ cssW: 440, cssH: 956, dpr: 3 })
    expect(a.href).toBe('/splashscreens/1320x2868.png')
    expect(a.media).toContain('device-width: 440px')
    expect(a.media).toContain('device-height: 956px')
    expect(a.media).toContain('-webkit-device-pixel-ratio: 3')
  })

  it('honors Plus pixel override', () => {
    const a = appleSplashAsset({
      cssW: 621,
      cssH: 1104,
      dpr: 3,
      pxW: 1242,
      pxH: 2208,
    })
    expect(a.href).toBe('/splashscreens/1242x2208.png')
  })
})
