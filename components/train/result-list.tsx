'use client'

import type { TrainRouteRow } from '@lib/schedules/contracts/next-train.dto'
import { useTranslations } from 'next-intl'
import React, { useCallback } from 'react'
import ResultItem from './result-item'
import { ListWrapper, Wrapper } from './result-list.style'

interface ResultListProps {
  left?: boolean
  right?: boolean
  label?: string
  data?: TrainRouteRow[]
  lineColor?: string
  delay?: boolean
  currTime?: string
}

const ResultList = ({
  left = false,
  right = false,
  label = '',
  data = [],
  lineColor = '#999',
  delay = false,
  currTime,
}: ResultListProps) => {
  const t = useTranslations()

  const renderResult = useCallback(() => {
    if (delay) return <div>{t('Service not available')}</div>
    if (!data?.length) return <div>{t('End Service')}</div>
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
    <Wrapper $left={left} $right={right}>
      <div className="label">{label && `${t('To')}: ${label}`}</div>
      <ListWrapper>{renderResult()}</ListWrapper>
    </Wrapper>
  )
}

export default React.memo(ResultList)
