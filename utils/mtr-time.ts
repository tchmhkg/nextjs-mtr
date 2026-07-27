/**
 * Advance an MTR `yyyy-MM-dd HH:mm:ss` timestamp by wall-clock elapsed ms.
 * Uses the same Date.parse path as result-item (replace `-` with `/`).
 *
 * ponytail: simple local Date arithmetic; ceiling is TZ skew if the device
 * clock ≠ HKT. Upgrade: parse with explicit +08:00 offset.
 */
export function advanceMtrTimestamp(
  lastUpdated: string,
  elapsedMs: number
): string {
  const base = Date.parse(lastUpdated.replaceAll('-', '/'))
  if (Number.isNaN(base)) return lastUpdated
  const d = new Date(base + elapsedMs)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
