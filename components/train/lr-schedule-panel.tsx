'use client'

import { LR_COLOR } from '@components/picker/lr-station-list'
import type {
  NextTrainDto,
  NextTrainPlatform,
  TrainRouteRow,
} from '@lib/schedules/contracts/next-train.dto'
import { useLocale, useTranslations } from 'next-intl'
import { memo, useMemo, useState } from 'react'

type LrTab = 'platform' | 'route'

type LrSchedulePanelProps = Readonly<{
  data: NextTrainDto
}>

function platformHeading(id: string, locale: string, platformLabel: string) {
  if (locale === 'tc') return `${id}號月台`
  return `${platformLabel} ${id}`
}

function routeHeading(route: string, routeLabel: string) {
  return `${routeLabel} ${route}`
}

function DualCarMark() {
  return (
    <span
      className="inline-flex items-center gap-0.5 text-muted"
      title="2"
      aria-hidden
    >
      <span className="inline-block size-1.5 rounded-[1px] bg-current" />
      <span className="inline-block size-1.5 rounded-[1px] bg-current" />
    </span>
  )
}

function LrEta({ time }: Readonly<{ time: string }>) {
  const t = useTranslations()
  if (time === '-') {
    return (
      <span className="font-semibold text-emerald-500">{t('arriving')}</span>
    )
  }
  return <span className="font-semibold text-ink">{time}</span>
}

function RouteBadge({ route }: Readonly<{ route: string }>) {
  return (
    <span
      className="inline-flex min-w-10 items-center justify-center rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums text-white"
      style={{ backgroundColor: LR_COLOR }}
    >
      {route}
    </span>
  )
}

function PlatformBadge({ plat }: Readonly<{ plat: string }>) {
  return (
    <span className="inline-flex min-w-7 items-center justify-center rounded bg-ink/80 px-1.5 py-0.5 text-xs font-semibold text-white">
      {plat}
    </span>
  )
}

function LrTrainRow({
  train,
  show,
}: Readonly<{
  train: TrainRouteRow
  show: 'route' | 'platform'
}>) {
  const dest = train.destLabel?.trim() || train.dest || '-'
  return (
    <div className="flex min-h-11 items-center gap-2 border-b border-border/60 py-2 last:border-b-0">
      <div className="w-14 shrink-0">
        {show === 'route' && train.route ? (
          <RouteBadge route={train.route} />
        ) : (
          <PlatformBadge plat={train.plat} />
        )}
      </div>
      <div className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
        {dest}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 text-sm">
        {train.trainLength === 2 ? <DualCarMark /> : null}
        <LrEta time={train.time} />
      </div>
    </div>
  )
}

function groupByRoute(platforms: NextTrainPlatform[]) {
  const map = new Map<string, TrainRouteRow[]>()
  for (const platform of platforms) {
    for (const train of platform.trains) {
      const key = train.route?.trim() || '?'
      const list = map.get(key)
      if (list) list.push(train)
      else map.set(key, [train])
    }
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
}

function LrSchedulePanel({ data }: LrSchedulePanelProps) {
  const t = useTranslations()
  const locale = useLocale()
  const [tab, setTab] = useState<LrTab>('platform')
  const platforms = data.platforms ?? []
  const routeGroups = useMemo(() => groupByRoute(platforms), [platforms])
  const allEnded =
    platforms.length > 0 && platforms.every((p) => p.endService && !p.trains.length)

  return (
    <div>
      {data.isDelayed ? (
        <div className="mb-3 rounded-lg border border-amber-400/60 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {t('Service delayed')}
        </div>
      ) : null}

      <div
        className="mb-3 flex border-b border-border"
        role="tablist"
        aria-label={t('Light Rail')}
      >
        {(['platform', 'route'] as const).map((key) => {
          const selected = tab === key
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(key)}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                selected
                  ? 'border-b-2 border-ink text-ink'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {key === 'platform' ? t('Platform') : t('Route')}
            </button>
          )
        })}
      </div>

      <div className="mb-1 grid grid-cols-[3.5rem_1fr_auto] gap-2 px-0.5 text-xs text-muted">
        <span>{tab === 'platform' ? t('Route') : t('Platform')}</span>
        <span>{t('Destination')}</span>
        <span className="text-right">{t('Next train')}</span>
      </div>

      {tab === 'platform' ? (
        <div className="space-y-3">
          {platforms.map((platform) => (
            <section key={platform.id}>
              <h3 className="rounded bg-surface-alt px-2 py-1.5 text-sm font-medium text-ink">
                {platformHeading(platform.id, locale, t('Platform'))}
              </h3>
              {platform.endService && !platform.trains.length ? (
                <p className="px-2 py-3 text-sm text-muted">{t('End Service')}</p>
              ) : (
                platform.trains.map((train) => (
                  <LrTrainRow
                    key={`${platform.id}-${train.seq}`}
                    train={train}
                    show="route"
                  />
                ))
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {allEnded ? (
            <p className="py-3 text-sm text-muted">{t('End Service')}</p>
          ) : (
            routeGroups.map(([route, trains]) => (
              <section key={route}>
                <h3 className="rounded bg-surface-alt px-2 py-1.5 text-sm font-medium text-ink">
                  {routeHeading(route, t('Route'))}
                </h3>
                {trains.map((train) => (
                  <LrTrainRow
                    key={`${route}-${train.plat}-${train.seq}`}
                    train={train}
                    show="platform"
                  />
                ))}
              </section>
            ))
          )}
        </div>
      )}

      {data.remarks?.length ? (
        <div className="mt-4 space-y-2 text-xs leading-relaxed text-muted">
          {data.remarks.map((remark) => (
            <p key={remark}>{remark}</p>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default memo(LrSchedulePanel)
