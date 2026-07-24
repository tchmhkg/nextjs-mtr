'use client'

import * as Sentry from '@sentry/nextjs'
import { useTranslations } from 'next-intl'
import React, { Component, ErrorInfo, ReactNode } from 'react'

type Props = Readonly<{
  children: ReactNode
}>

interface State {
  hasError: boolean
  error?: Error
}

function ErrorFallback({
  error,
  onReload,
}: Readonly<{
  error?: Error
  onReload: () => void
}>) {
  const t = useTranslations()
  return (
    <div className="m-5 rounded-lg border border-border bg-surface-alt p-5 text-center text-ink">
      <h2 className="text-lg font-semibold">{t('Something went wrong')}</h2>
      <p className="mt-2 text-sm text-muted">{t('Please try again')}</p>
      <button
        type="button"
        onClick={onReload}
        className="mt-4 rounded-lg bg-ink px-4 py-2 text-sm text-[var(--surface-alt)]"
      >
        {t('Refresh Page')}
      </button>
      {process.env.NODE_ENV === 'development' && error ? (
        <details className="mt-5 text-left text-xs">
          <summary>Error Details (Development Only)</summary>
          <pre className="overflow-auto">{error.toString()}</pre>
        </details>
      ) : null}
    </div>
  )
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } },
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onReload={() => globalThis.location.reload()}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
