'use client'

import ErrorBoundary from '@components/error-boundary'
import ThemeManager from '@theme/theme'
import { store } from '@store/store'
import { LayoutGroup } from 'framer-motion'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Provider } from 'react-redux'

NProgress.configure({ showSpinner: false })

export default function AppProviders({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  useEffect(() => {
    NProgress.start()
    const id = window.setTimeout(() => NProgress.done(), 220)
    return () => window.clearTimeout(id)
  }, [pathname])

  return (
    <Provider store={store}>
      <LayoutGroup>
        <ThemeManager>
          <ErrorBoundary>{children}</ErrorBoundary>
        </ThemeManager>
      </LayoutGroup>
    </Provider>
  )
}
