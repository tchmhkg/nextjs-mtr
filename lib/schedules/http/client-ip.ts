import { isIP, BlockList } from 'node:net'

import { env } from '@lib/env'

/**
 * Client IP for rate limiting.
 *
 * Prefer Vercel's `x-vercel-forwarded-for` when present — the platform sets it and clients cannot
 * override it. Otherwise walk `X-Forwarded-For` right to left and take the first hop that is not
 * in `TRUSTED_PROXIES`. An empty trust list means forwarding headers are ignored (bucket key
 * `unknown`), because this Request has no socket peer to authenticate a proxy against.
 */
export function clientIpFromRequest(request: Request): string {
  const vercel = firstHop(request.headers.get('x-vercel-forwarded-for'))
  if (vercel && isLiteralIp(vercel)) {
    return vercel
  }

  const trust = trustList()
  const chain = forwardedChain(request)
  if (trust === null) {
    return 'unknown'
  }

  let leftmostUsable: string | null = null
  for (let i = chain.length - 1; i >= 0; i--) {
    const candidate = chain[i]
    if (!candidate || !isLiteralIp(candidate)) continue
    leftmostUsable = candidate
    if (!isTrusted(candidate, trust)) {
      return candidate
    }
  }
  return leftmostUsable ?? 'unknown'
}

function firstHop(value: string | null): string | null {
  if (!value) return null
  const first = value.split(',')[0]?.trim()
  return first ? normalise(first) : null
}

function forwardedChain(request: Request): string[] {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded
      .split(',')
      .map((part) => normalise(part))
      .filter(Boolean)
  }
  const realIp = request.headers.get('x-real-ip')
  return realIp ? [normalise(realIp)] : []
}

function trustList(): BlockList | null {
  const entries = env.TRUSTED_PROXIES.split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
  if (entries.length === 0) return null
  const list = new BlockList()
  for (const entry of entries) {
    const slash = entry.indexOf('/')
    const address = slash >= 0 ? entry.slice(0, slash).trim() : entry
    const normalised = normalise(address)
    const version = ipVersion(normalised)
    if (!version) continue
    const prefix =
      slash >= 0
        ? Number(entry.slice(slash + 1).trim())
        : version === 'ipv4'
          ? 32
          : 128
    if (!Number.isInteger(prefix)) continue
    try {
      list.addSubnet(normalised, prefix, version)
    } catch {
      // Skip malformed CIDRs rather than failing startup on a typo in an optional list.
    }
  }
  return list
}

function isTrusted(address: string, trust: BlockList): boolean {
  const version = ipVersion(address)
  return version !== null && trust.check(address, version)
}

function ipVersion(address: string): 'ipv4' | 'ipv6' | null {
  const kind = isIP(address)
  if (kind === 4) return 'ipv4'
  if (kind === 6) return 'ipv6'
  return null
}

function isLiteralIp(address: string): boolean {
  return ipVersion(address) !== null
}

/** Strips IPv6 brackets and a zone id, and lowercases for a stable bucket key. */
function normalise(address: string): string {
  let value = address.trim()
  if (value.startsWith('[') && value.includes(']')) {
    value = value.slice(1, value.indexOf(']'))
  }
  const scope = value.indexOf('%')
  if (scope >= 0) {
    value = value.slice(0, scope)
  }
  return value.toLowerCase()
}
