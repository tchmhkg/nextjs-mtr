'use client'

import type { MessageKey } from '@i18n/message-key'
import type { TrainRouteRow } from '@lib/schedules/contracts/next-train.dto'
import { format, formatDuration, intervalToDuration } from 'date-fns'
import { useLocale, useTranslations } from 'next-intl'
import React, { useCallback } from 'react'

type ResultItemProps = Readonly<{
  times: TrainRouteRow
  lineColor: string
  currTime?: string
}>

const isValidDate = (d: unknown): d is Date =>
  d instanceof Date && !Number.isNaN(d.getTime())

const MTR_WALL_CLOCK = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/

const humanTime = (time: Date | string = new Date()) =>
  format(new Date(String(time).replace(' ', 'T')), 'HH:mm')

/** Compact date-fns duration labels without ambiguous regex. */
function compactDuration(duration: string, locale: string): string {
  if (locale === 'tc') {
    return duration
      .replaceAll(' hours', '小時')
      .replaceAll(' hour', '小時')
      .replaceAll(' minutes', '分鐘')
      .replaceAll(' minute', '分鐘')
      .replaceAll(' seconds', '秒')
      .replaceAll(' second', '秒')
      .replaceAll(' ', '')
  }
  return duration
    .replaceAll(' hours', 'h')
    .replaceAll(' hour', 'h')
    .replaceAll(' minutes', 'm')
    .replaceAll(' minute', 'm')
    .replaceAll(' seconds', 's')
    .replaceAll(' second', 's')
    .replaceAll('  ', ' ')
    .trim()
}

function ResultItem({ times, lineColor, currTime }: ResultItemProps) {
  const locale = useLocale()
  const t = useTranslations()
  const dest =
    times.destLabel?.trim() ||
    (times.dest ? t(times.dest as MessageKey) : '-')

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
      return compactDuration(duration, locale)
    },
    [currTime, locale, t]
  )

  const metaBits: string[] = []
  if (times.route && times.route !== 'RAC') metaBits.push(times.route)
  if (times.timeType === 'A') metaBits.push(t('Arrival'))
  if (times.timeType === 'D') metaBits.push(t('Departure'))
  if (times.route === 'RAC') metaBits.push(t('Via Racecourse'))

  const relative = times.relativeEta || !MTR_WALL_CLOCK.test(times.time)

  return (
    <div className="flex min-h-11 items-center gap-2 py-2">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-ink">{dest}</div>
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
        {relative ? (
          <div className="whitespace-nowrap text-base font-semibold leading-tight text-ink">
            {times.time === '-' ? (
              <span className="font-semibold text-emerald-500">
                {t('arriving')}
              </span>
            ) : (
              times.time
            )}
          </div>
        ) : (
          <>
            <div className="whitespace-nowrap text-base font-semibold tabular-nums leading-tight text-ink">
              {humanTime(times.time)}
            </div>
            <div className="whitespace-nowrap text-xs text-muted">
              {humanDuration(times.time)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default React.memo(ResultItem)
