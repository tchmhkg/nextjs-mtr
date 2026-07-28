'use client'

import ErrorBoundary from '@components/error-boundary'
import AppToaster from '@components/app-toaster'
import FontSizeProvider from '@components/font-size-provider'
import ThemeProvider from '@components/theme-provider'
import { store } from '@store/store'
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Provider } from 'react-redux'

type AppProvidersProps = Readonly<{
  children: React.ReactNode
}>

function useQueryFocusForPwa() {
  useEffect(() => {
    focusManager.setEventListener((handleFocus) => {
      const onChange = () => {
        handleFocus(document.visibilityState === 'visible')
      }
      document.addEventListener('visibilitychange', onChange)
      window.addEventListener('focus', onChange)
      window.addEventListener('pageshow', onChange)
      onChange()
      return () => {
        document.removeEventListener('visibilitychange', onChange)
        window.removeEventListener('focus', onChange)
        window.removeEventListener('pageshow', onChange)
      }
    })
  }, [])
}

export default function AppProviders({ children }: AppProvidersProps) {
  useQueryFocusForPwa()
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            refetchOnWindowFocus: true,
            retry: 3,
          },
        },
      })
  )

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FontSizeProvider>
            <AppToaster />
            <ErrorBoundary>{children}</ErrorBoundary>
          </FontSizeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}
