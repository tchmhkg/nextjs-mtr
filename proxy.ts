import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'

import { routing } from './i18n/routing'
import { preferTcIfChinese } from './utils/locale-path'

const handleI18n = createMiddleware(routing)

export default function proxy(request: NextRequest) {
  const accept = request.headers.get('accept-language')
  const rewritten = preferTcIfChinese(accept)
  if (rewritten === accept) {
    return handleI18n(request)
  }
  const headers = new Headers(request.headers)
  headers.set('accept-language', rewritten!)
  return handleI18n(new NextRequest(request, { headers }))
}

// Next.js only accepts a plain string literal in `matcher` (not String.raw); escaped `\` is required.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next/data|monitoring|serwist|.*\\..*).*)', // NOSONAR: Next.js requires a literal here; String.raw fails segment-config validation
  ],
}
