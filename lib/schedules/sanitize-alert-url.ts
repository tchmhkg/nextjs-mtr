import { alertUrlAllowedHosts } from '@lib/env'

/** Returns the URL only if https and host is under an allowlisted suffix. */
export function sanitizeAlertUrl(
  raw: string | null | undefined,
  allowedHosts: string[] = alertUrlAllowedHosts()
): string | null {
  if (raw == null) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const u = new URL(trimmed)
    if (u.protocol !== 'https:') return null
    const host = u.hostname.toLowerCase()
    const ok = allowedHosts.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`)
    )
    return ok ? u.toString() : null
  } catch {
    return null
  }
}
