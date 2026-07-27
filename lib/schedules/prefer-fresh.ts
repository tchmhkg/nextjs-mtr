/**
 * Prefer a fresh (cache-bypass) load; fall back to the poll/CDN path on any failure.
 * Used when selecting a station so ETAs are not s-maxage-stale.
 */
export async function preferFreshThenPoll<T>(
  fresh: () => Promise<T>,
  poll: () => Promise<T>
): Promise<{ data: T; source: 'fresh' | 'poll' }> {
  try {
    return { data: await fresh(), source: 'fresh' }
  } catch {
    return { data: await poll(), source: 'poll' }
  }
}
