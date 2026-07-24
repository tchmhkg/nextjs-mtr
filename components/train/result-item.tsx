'use client'

import type { MessageKey } from '@i18n/message-key'
import type { TrainRouteRow } from '@lib/schedules/contracts/next-train.dto'
import { format, formatDuration, intervalToDuration } from 'date-fns'
import { useLocale, useTranslations } from 'next-intl'
import React, { useCallback } from 'react'

interface ResultItemProps {
  times: TrainRouteRow
  lineColor: string
  currTime?: string
}

const isValidDate = (d: unknown): d is Date =>
  d instanceof Date && !Number.isNaN(d.getTime())

const humanTime = (time: Date | string = new Date()) =>
  format(new Date(String(time).replace(' ', 'T')), 'HH:mm')

function ResultItem({ times, lineColor, currTime }: ResultItemProps) {
  const locale = useLocale()
  const t = useTranslations()
  const humanDuration = useCallback(
    (time: string | null = null) => {
      if (!currTime) return '-'
      const start = new Date(Date.parse(time?.replaceAll('-', '/') ?? ''))
      const end = new Date(Date.parse(currTime.replaceAll('-', '/')))
      if (!isValidDate(start) || !isValidDate(end)) return '-'
      const diffMSeconds = start.getTime() - end.getTime()
      const diffSeconds = diffMSeconds / 1000
      if (diffSeconds <= 0)
        return <span className="font-semibold text-red-500">{t('leaving')}</span>
      if (diffSeconds <= 60)
        return (
          <span className="font-semibold text-emerald-500">{t('arriving')}</span>
        )
      const duration = formatDuration(
        intervalToDuration({ start: 0, end: diffMSeconds }),
        { format: ['hours', 'minutes'] }
      )
      if (locale === 'tc') {
        // Compact one-line: "4小時14分鐘"
        return duration
          .replace(/\s*hours?/g, '小時')
          .replace(/\s*minutes?/g, '分鐘')
          .replace(/\s*seconds?/g, '秒')
          .replace(/\s+/g, '')
      }
      return duration
        .replace(/\shours?/g, 'h')
        .replace(/\sminutes?/g, 'm')
        .replace(/\sseconds?/g, 's')
        .replace(/\s+/g, ' ')
        .trim()
    },
    [currTime, locale, t]
  )

  const metaBits: string[] = []
  if (times.timeType === 'A') metaBits.push(t('Arrival'))
  if (times.timeType === 'D') metaBits.push(t('Departure'))
  if (times.route === 'RAC') metaBits.push(t('Via Racecourse'))

  return (
    <div className="flex min-h-11 items-center gap-2 py-2">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-ink">
          {t(times.dest as MessageKey)}
        </div>
        {metaBits.length ? (
          <div className="truncate text-xs text-muted">
            {metaBits.join(' · ')}
          </div>
        ) : null}
      </div>
      <div className="flex w-9 shrink-0 justify-center">
        <span
          className="inline-flex min-w-7 items-center justify-center rounded px-1.5 py-0.5 text-xs font-semibold text-white"
          style={{ backgroundColor: lineColor }}
        >
          {times.plat}
        </span>
      </div>
      <div className="min-w-[5.75rem] shrink-0 text-right">
        <div className="text-xs text-muted">{humanTime(times.time)}</div>
        <div className="whitespace-nowrap text-base font-semibold leading-tight text-ink">
          {humanDuration(times.time)}
        </div>
      </div>
    </div>
  )
}

export default React.memo(ResultItem)
