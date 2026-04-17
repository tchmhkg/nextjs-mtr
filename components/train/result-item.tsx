'use client'

import { format, formatDuration, intervalToDuration } from 'date-fns'
import React, { useCallback } from 'react'

import type { MessageKey } from '@i18n/message-key'
import { useLocale, useTranslations } from 'next-intl'
import { PlatForm, PlatFormWrapper } from './result-item.style'

interface TrainTime {
  seq: string
  dest: string
  plat: string
  time: string
}

interface ResultItemProps {
  times: TrainTime
  lineColor: string
  currTime?: string
}

const isValidDate = (d: any): d is Date => d instanceof Date // && !isNaN(d)

const humanTime = (time: Date | string = new Date()) => {
  return format(new Date(String(time).replace(' ', 'T')), 'HH:mm')
}

const ResultItem = ({ times, lineColor, currTime }: ResultItemProps) => {
  const locale = useLocale()
  const t = useTranslations()
  const humanDuration = useCallback(
    (time: string | null = null, locale = 'tc') => {
      if (!currTime) return '-'
      const start = new Date(Date.parse(time?.replaceAll('-', '/')))
      const end = new Date(Date.parse(currTime.replaceAll('-', '/')))
      if (!isValidDate(start) || !isValidDate(end)) {
        return '-'
      }
      const diffMSeconds = start.getTime() - end.getTime()
      const diffSeconds = diffMSeconds / 1000
      if (diffSeconds <= 0) return <span className="time-leaving">{t('leaving')}</span>
      if (diffSeconds <= 60) return <span className="time-arriving">{t('arriving')}</span>
      const duration = formatDuration(
        intervalToDuration({ start: 0, end: diffMSeconds }), //parseInt(minutesToArrive) * 1000 * 60 })
        { format: ['hours', 'minutes'] }
      )
      if (locale === 'tc') {
        return duration
          .replace(/\shours|\shour/g, '小時')
          .replace(/\sminutes|\sminute/g, '分鐘')
          .replace(/\sseconds|\ssecond/g, '秒')
      }
      return duration
        .replace(/hours/g, 'hrs')
        .replace(/hour/g, 'hr')
        .replace(/minutes/g, 'mins')
        .replace(/minute/g, 'min')
        .replace(/seconds/g, 'secs')
    },
    [currTime, t]
  )

  return (
    <div className="list-item" key={times.seq}>
      <div className="item-dest">{t(times?.dest as MessageKey)}</div>
      <PlatFormWrapper>
        <PlatForm $lineColor={lineColor}>{times?.plat}</PlatForm>
      </PlatFormWrapper>
      <div className="item-time">
        <div className="time-text">{humanTime(times?.time)}</div>
        <div className="time-diff">{humanDuration(times?.time, locale)}</div>
      </div>
    </div>
  )
}

export default React.memo(ResultItem)
