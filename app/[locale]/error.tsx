'use client'

import * as Sentry from '@sentry/nextjs'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  padding: 20px;
  text-align: center;
`

type ErrorProps = Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>

export default function Error({ error, reset }: ErrorProps) {
  const t = useTranslations()

  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <Container>
      <h2>{t('Something went wrong')}</h2>
      <p>{t('Please try again')}</p>
      <button type="button" onClick={() => reset()}>
        {t('Retry')}
      </button>
    </Container>
  )
}
