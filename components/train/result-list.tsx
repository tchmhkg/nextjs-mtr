'use client'

import type { TrainRouteRow } from '@lib/schedules/contracts/next-train.dto'
import { useTranslations } from 'next-intl'
import React, { useCallback } from 'react'
import ResultItem from './result-item'

type ResultListProps = Readonly<{
  label?: string
  data?: TrainRouteRow[]
  lineColor?: string
  delay?: boolean
  currTime?: string
}>

function ResultList({
  label = '',
  data = [],
  lineColor = '#999',
  delay = false,
  currTime,
}: ResultListProps) {
  const t = useTranslations()

  const renderResult = useCallback(() => {
    if (delay) return <div className="text-sm text-muted">{t('Service not available')}</div>
    if (!data?.length)
      return <div className="text-sm text-muted">{t('End Service')}</div>
    return data.map((times) => (
      <ResultItem
        key={times.seq}
        times={times}
        lineColor={lineColor}
        currTime={currTime}
      />
    ))
  }, [currTime, data, delay, lineColor, t])

  return (
    <div>
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
        {label ? `${t('To')}: ${label}` : null}
      </div>
      <div className="divide-y divide-border/70">{renderResult()}</div>
    </div>
  )
}

export default React.memo(ResultList)
