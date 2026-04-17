import { createMiddleware } from 'next-i18next/middleware'
import type { NextRequest } from 'next/server'

import i18nConfig from './i18n.config'

const handler = createMiddleware(i18nConfig)

export function proxy(request: NextRequest) {
  return handler(request)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next/data|monitoring|.*\\..*).*)',
  ],
}
