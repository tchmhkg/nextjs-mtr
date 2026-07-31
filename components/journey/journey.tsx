'use client'

import CurrLocation from '@components/curr-location'
import LinePicker from '@components/picker/line-picker'
import StationList from '@components/picker/station-list'
import { useNearestStation } from '@hooks/useNearestStation'
import { useQuery } from '@tanstack/react-query'
import { DATA, type ILine, type IStation } from '@utils/next-train-data'
import type { JourneyEstimate } from 'hk-journey-time'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useMemo, useRef, useState } from 'react'

type Language = 'en' | 'tc'
type Step = 'from' | 'to' | 'result'

function lang(locale: string): Language {
  return locale === 'tc' ? 'tc' : 'en'
}

function stationLabel(
  code: string,
  locale: Language,
  stationsByCode: Map<string, IStation>
): string {
  return stationsByCode.get(code)?.label[locale] ?? code
}

function lineColor(code: string): string {
  if (code === 'WALK') return '#888'
  return DATA.find((d) => d.line.code === code)?.line.color ?? '#666'
}

function minutes(seconds: number): number {
  return Math.round(seconds / 60)
}

async function fetchJourney(
  origin: string,
  destination: string,
  includeWaiting: boolean
): Promise<JourneyEstimate> {
  const qs = new URLSearchParams({
    origin,
    destination,
    includeWaiting: includeWaiting ? 'true' : 'false',
  })
  const res = await fetch(`/api/journey?${qs}`)
  const json = (await res.json()) as {
    success: boolean
    data: JourneyEstimate | null
    error?: { message: string }
  }
  if (!json.success || !json.data) {
    throw new Error(json.error?.message ?? 'Failed to estimate journey')
  }
  return json.data
}

export default function Journey() {
  const t = useTranslations()
  const locale = useLocale()
  const l = lang(locale)

  const [step, setStep] = useState<Step>('from')
  const [fromLine, setFromLine] = useState<ILine | null>(null)
  const [toLine, setToLine] = useState<ILine | null>(null)
  const [fromStation, setFromStation] = useState<IStation | null>(null)
  const [toStation, setToStation] = useState<IStation | null>(null)
  const [leaveNow, setLeaveNow] = useState(false)

  const stationRefs = useRef<
    Record<string, React.RefObject<HTMLButtonElement | null>>
  >({})

  const stationsByCode = useMemo(() => {
    const map = new Map<string, IStation>()
    for (const { stations } of DATA) {
      for (const s of stations) {
        if (!map.has(s.code)) map.set(s.code, s)
      }
    }
    return map
  }, [])

  const lineLabel = useCallback(
    (code: string) => {
      if (code === 'WALK') return t('Walk')
      return DATA.find((d) => d.line.code === code)?.line.label[l] ?? code
    },
    [t, l]
  )

  const applyNearest = useCallback(
    (line: ILine, station: IStation) => {
      if (step === 'to') {
        setToLine(line)
        setToStation(station)
        setStep('result')
        return
      }
      setFromLine(line)
      setFromStation(station)
      setStep('to')
    },
    [step]
  )

  const { locating, locationError, getCurrLocation, setLocationError } =
    useNearestStation('mtr', {
      onFoundMtr: applyNearest,
      onFoundLr: () => undefined,
    })

  const activeLine = step === 'to' ? toLine : fromLine
  const activeStations = useMemo(() => {
    if (!activeLine) return []
    const stations =
      DATA.find((d) => d.line.code === activeLine.code)?.stations ?? []
    return stations.map((s) => ({ ...s, related: undefined }))
  }, [activeLine])

  const ensureRefs = useCallback((stations: IStation[]) => {
    for (const s of stations) {
      if (!stationRefs.current[s.code]) {
        stationRefs.current[s.code] = { current: null }
      }
    }
  }, [])

  ensureRefs(activeStations)

  const ready =
    Boolean(fromStation && toStation) && fromStation!.code !== toStation!.code

  const query = useQuery({
    queryKey: ['journey', fromStation?.code, toStation?.code, leaveNow],
    queryFn: () =>
      fetchJourney(fromStation!.code, toStation!.code, leaveNow),
    enabled: ready && step === 'result',
    staleTime: 20_000,
  })

  const onSelectFromLine = useCallback((line: ILine) => {
    setFromLine(line)
    setFromStation(null)
  }, [])

  const onSelectToLine = useCallback((line: ILine) => {
    setToLine(line)
    setToStation(null)
  }, [])

  const onSelectFromStation = useCallback((station: IStation) => {
    setFromStation(station)
    setStep('to')
  }, [])

  const onSelectToStation = useCallback((station: IStation) => {
    setToStation(station)
    setStep('result')
  }, [])

  const reset = () => {
    setFromStation(null)
    setToStation(null)
    setFromLine(null)
    setToLine(null)
    setLeaveNow(false)
    setLocationError(null)
    setStep('from')
  }

  const showPicker = step === 'from' || step === 'to'

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="mb-1 text-2xl font-semibold text-ink">
            {t('Journey')}
          </h1>
          <p className="text-sm text-muted">
            {t('Journey subtitle')}
            <span className="text-muted/80"> · {t('Journey accuracy hint')}</span>
          </p>
        </div>
        {showPicker ? (
          <CurrLocation
            onClick={getCurrLocation}
            aria-label={t('Find nearest station')}
            busy={locating}
          />
        ) : null}
      </div>

      {locationError && showPicker ? (
        <p className="mb-3 text-sm text-red-600">{t(locationError)}</p>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStep('from')}
          className={`rounded-full border px-3 py-1.5 text-sm ${step === 'from'
            ? 'border-ink bg-surface-alt text-ink'
            : 'border-border text-muted'
            }`}
        >
          {t('From')}{' '}
          {fromStation ? fromStation.label[l] : t('Select a station')}
        </button>
        <button
          type="button"
          onClick={() => setStep('to')}
          disabled={!fromStation}
          className={`rounded-full border px-3 py-1.5 text-sm enabled:hover:border-ink/40 disabled:opacity-40 ${step === 'to'
            ? 'border-ink bg-surface-alt text-ink'
            : 'border-border text-muted'
            }`}
        >
          {t('To')} {toStation ? toStation.label[l] : t('Select a station')}
        </button>
      </div>

      {showPicker ? (
        <div className="space-y-3">
          <LinePicker
            variant="chips"
            selectedCode={activeLine?.code}
            onSelect={step === 'from' ? onSelectFromLine : onSelectToLine}
          />
          {activeLine ? (
            <StationList
              stations={activeStations}
              selectedCode={
                step === 'from' ? fromStation?.code : toStation?.code
              }
              lineColor={activeLine.color}
              onSelect={
                step === 'from' ? onSelectFromStation : onSelectToStation
              }
              onInterchange={() => undefined}
              stationRefs={stationRefs.current}
            />
          ) : (
            <p className="text-sm text-muted">{t('Select a line')}</p>
          )}
        </div>
      ) : null}

      {step === 'result' && ready ? (
        <div className="space-y-4">
          {query.isLoading ? (
            <p className="text-sm text-muted">{t('Estimating journey')}</p>
          ) : null}
          {query.isError ? (
            <p className="text-sm text-red-600">
              {(query.error as Error).message || t('Failed to estimate journey')}
            </p>
          ) : null}
          {query.data ? (
            <JourneyResult
              data={query.data}
              locale={l}
              stationsByCode={stationsByCode}
              lineLabel={lineLabel}
              leaveNow={leaveNow}
              onLeaveNowChange={setLeaveNow}
            />
          ) : null}

          <button
            type="button"
            className="text-sm text-muted underline"
            onClick={reset}
          >
            {t('Start over')}
          </button>
        </div>
      ) : null}
    </div>
  )
}

function JourneyResult({
  data,
  locale,
  stationsByCode,
  lineLabel,
  leaveNow,
  onLeaveNowChange,
}: Readonly<{
  data: JourneyEstimate
  locale: Language
  stationsByCode: Map<string, IStation>
  lineLabel: (code: string) => string
  leaveNow: boolean
  onLeaveNowChange: (v: boolean) => void
}>) {
  const t = useTranslations()
  const originName = stationLabel(data.origin, locale, stationsByCode)
  const rideMin = minutes(data.breakdown.ridingSeconds)
  const transferMin = minutes(data.breakdown.transferSeconds)
  const waitMin =
    data.breakdown.waitingSeconds != null
      ? minutes(data.breakdown.waitingSeconds)
      : null

  let warningText: string | null = null
  if (data.warnings?.includes('NO_UPCOMING_TRAIN')) {
    warningText = t('No upcoming train')
  } else if (data.warnings?.length) {
    warningText = t('Waiting unavailable')
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface-alt/40 p-4">
        <p className="text-3xl font-semibold tabular-nums text-ink">
          {data.durationMinutes}
          <span className="ml-1 text-base font-medium text-muted">
            {t('min')}
          </span>
        </p>
        <p className="mt-1 text-sm text-muted">
          {data.transferCount === 0
            ? t('Journey meta direct')
            : t('Journey meta transfers', { count: data.transferCount })}
        </p>
        <p className="mt-0.5 text-xs text-muted">{t('Journey estimate note')}</p>

        <dl className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{t('Riding')}</dt>
            <dd className="tabular-nums text-ink">
              {rideMin} {t('min')}
            </dd>
          </div>
          {transferMin > 0 ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">
                {t('Transfers')}
                <span className="mt-0.5 block text-xs">
                  {t('Transfers hint')}
                </span>
              </dt>
              <dd className="shrink-0 tabular-nums text-ink">
                {transferMin} {t('min')}
              </dd>
            </div>
          ) : null}
          {waitMin != null ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">
                {t('Origin wait at', { station: originName })}
              </dt>
              <dd className="tabular-nums text-ink">
                {waitMin} {t('min')}
              </dd>
            </div>
          ) : null}
        </dl>

        {warningText ? (
          <p className="mt-3 text-xs text-muted">{warningText}</p>
        ) : null}
      </div>

      <label className="flex items-start gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={leaveNow}
          onChange={(e) => onLeaveNowChange(e.target.checked)}
          className="mt-0.5 size-4 shrink-0"
        />
        <span>
          {t('Leave now')}
          <span className="mt-0.5 block text-xs text-muted">
            {t('Leave now hint')}
          </span>
        </span>
      </label>

      <div>
        <p className="mb-2 text-sm font-medium text-ink">{t('Route')}</p>
        <ol className="space-y-0">
          {data.legs.map((leg, i) => (
            <li key={`${leg.line}-${leg.origin}-${leg.destination}-${i}`}>
              {leg.transferInSeconds != null && leg.transferInSeconds > 0 ? (
                <p className="my-2 pl-4 text-xs text-muted">
                  {t('Transfer at', {
                    station: stationLabel(leg.origin, locale, stationsByCode),
                    minutes: minutes(leg.transferInSeconds),
                  })}
                </p>
              ) : null}
              <div className="flex items-start gap-2 py-1">
                <span
                  className="mt-1.5 size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: lineColor(leg.line) }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">
                    {lineLabel(leg.line)}
                  </p>
                  <p className="text-sm text-muted">
                    {stationLabel(leg.origin, locale, stationsByCode)}
                    {' → '}
                    {stationLabel(leg.destination, locale, stationsByCode)}
                  </p>
                  <p className="text-xs text-muted">
                    {minutes(leg.ridingSeconds)} {t('min')}
                    {i === 0 &&
                      leg.boardingWaitSeconds != null &&
                      leg.boardingWaitSeconds > 0
                      ? ` · ${t('Next train in', { minutes: minutes(leg.boardingWaitSeconds) })}`
                      : null}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
