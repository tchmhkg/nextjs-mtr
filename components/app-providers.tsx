'use client'

import ErrorBoundary from '@components/error-boundary'
import ThemeManager from '@theme/theme'
import { store } from '@store/store'
import { Provider } from 'react-redux'

type AppProvidersProps = Readonly<{
  children: React.ReactNode
}>

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeManager>
        <ErrorBoundary>{children}</ErrorBoundary>
      </ThemeManager>
    </Provider>
  )
}
