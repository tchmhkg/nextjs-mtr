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
  const line = code === 'TKS' ? 'TKL' : code
  return DATA.find((d) => d.line.code === line)?.line.color ?? '#666'
}

function minutes(seconds: number): number {
  return Math.round(seconds / 60)
}

function stationsByCodeMap(): Map<string, IStation> {
  const map = new Map<string, IStation>()
  for (const { stations } of DATA) {
    for (const s of stations) {
      if (!map.has(s.code)) map.set(s.code, s)
    }
  }
  return map
}

function stationsForLine(line: ILine | null): IStation[] {
  if (!line) return []
  const stations = DATA.find((d) => d.line.code === line.code)?.stations ?? []
  return stations.map((s) => ({ ...s, related: undefined }))
}

type JourneyFetchError = Error & { code?: string }

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
    error?: { code?: string; message: string }
  }
  if (!json.success || !json.data) {
    const err = new Error(
      json.error?.message ?? 'Failed to estimate journey'
    ) as JourneyFetchError
    err.code = json.error?.code
    throw err
  }
  return json.data
}

type JourneyErrorKey =
  | 'UNKNOWN_STOP'
  | 'SAME_STOP'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'UPSTREAM_ERROR'
  | 'Failed to estimate journey'

const JOURNEY_ERROR_KEYS = new Set<string>([
  'UNKNOWN_STOP',
  'SAME_STOP',
  'NOT_FOUND',
  'VALIDATION_ERROR',
  'RATE_LIMITED',
  'UPSTREAM_ERROR',
  'Failed to estimate journey',
])

function journeyErrorMessage(
  error: Error | null,
  t: (key: JourneyErrorKey) => string
): string {
  const code = (error as JourneyFetchError | null)?.code
  if (code && JOURNEY_ERROR_KEYS.has(code)) return t(code as JourneyErrorKey)
  if (error?.message && JOURNEY_ERROR_KEYS.has(error.message)) {
    return t(error.message as JourneyErrorKey)
  }
  return t('Failed to estimate journey')
}

function chipClass(active: boolean, extra = ''): string {
  const base = 'rounded-full border px-3 py-1.5 text-sm'
  const tone = active
    ? 'border-ink bg-surface-alt text-ink'
    : 'border-border text-muted'
  return `${base} ${tone} ${extra}`.trim()
}

function useJourneyController() {
  const t = useTranslations()
  const l = lang(useLocale())

  const [step, setStep] = useState<Step>('from')
  const [fromLine, setFromLine] = useState<ILine | null>(null)
  const [toLine, setToLine] = useState<ILine | null>(null)
  const [fromStation, setFromStation] = useState<IStation | null>(null)
  const [toStation, setToStation] = useState<IStation | null>(null)
  const [leaveNow, setLeaveNow] = useState(false)

  const stationRefs = useRef<
    Record<string, React.RefObject<HTMLButtonElement | null>>
  >({})
  const stationsByCode = useMemo(stationsByCodeMap, [])

  const lineLabel = useCallback(
    (code: string) => {
      if (code === 'WALK') return t('Walk')
      const line = code === 'TKS' ? 'TKL' : code
      return DATA.find((d) => d.line.code === line)?.line.label[l] ?? code
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

  const pickingTo = step === 'to'
  const activeLine = pickingTo ? toLine : fromLine
  const activeStations = useMemo(
    () => stationsForLine(activeLine),
    [activeLine]
  )

  for (const s of activeStations) {
    if (!stationRefs.current[s.code]) {
      stationRefs.current[s.code] = { current: null }
    }
  }

  const ready = Boolean(
    fromStation && toStation && fromStation.code !== toStation.code
  )
  const showPicker = step === 'from' || pickingTo

  const query = useQuery({
    queryKey: ['journey', fromStation?.code, toStation?.code, leaveNow],
    queryFn: () =>
      fetchJourney(fromStation!.code, toStation!.code, leaveNow),
    enabled: ready && step === 'result',
    staleTime: 20_000,
  })

  const selectLine = useCallback(
    (line: ILine) => {
      if (pickingTo) {
        setToLine(line)
        setToStation(null)
        return
      }
      setFromLine(line)
      setFromStation(null)
    },
    [pickingTo]
  )

  const selectStation = useCallback(
    (station: IStation) => {
      if (pickingTo) {
        setToStation(station)
        setStep('result')
        return
      }
      setFromStation(station)
      setStep('to')
    },
    [pickingTo]
  )

  const reset = () => {
    setFromStation(null)
    setToStation(null)
    setFromLine(null)
    setToLine(null)
    setLeaveNow(false)
    setLocationError(null)
    setStep('from')
  }

  return {
    t,
    l,
    step,
    fromStation,
    toStation,
    leaveNow,
    setLeaveNow,
    locating,
    locationError,
    getCurrLocation,
    activeLine,
    activeStations,
    stationRefs,
    stationsByCode,
    lineLabel,
    ready,
    showPicker,
    pickingTo,
    query,
    selectLine,
    selectStation,
    reset,
    setStep,
  }
}

export default function Journey() {
  const c = useJourneyController()

  return (
    <div>
      <JourneyHeader
        showGeo={c.showPicker}
        locating={c.locating}
        onGeo={c.getCurrLocation}
      />
      {c.locationError && c.showPicker ? (
        <p className="mb-3 text-sm text-red-600">{c.t(c.locationError)}</p>
      ) : null}

      <JourneyStepChips
        step={c.step}
        locale={c.l}
        fromStation={c.fromStation}
        toStation={c.toStation}
        onFrom={() => c.setStep('from')}
        onTo={() => c.setStep('to')}
      />

      {c.showPicker ? (
        <JourneyPicker
          activeLine={c.activeLine}
          activeStations={c.activeStations}
          selectedCode={
            c.pickingTo ? c.toStation?.code : c.fromStation?.code
          }
          stationRefs={c.stationRefs.current}
          onSelectLine={c.selectLine}
          onSelectStation={c.selectStation}
        />
      ) : null}

      {c.step === 'result' && c.ready ? (
        <JourneyResultPanel
          query={c.query}
          locale={c.l}
          stationsByCode={c.stationsByCode}
          lineLabel={c.lineLabel}
          leaveNow={c.leaveNow}
          onLeaveNowChange={c.setLeaveNow}
          onReset={c.reset}
        />
      ) : null}
    </div>
  )
}

function JourneyHeader({
  showGeo,
  locating,
  onGeo,
}: Readonly<{
  showGeo: boolean
  locating: boolean
  onGeo: () => void
}>) {
  const t = useTranslations()
  return (
    <div className="mb-6 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="mb-1 text-2xl font-semibold text-ink">{t('Journey')}</h1>
        <p className="text-sm text-muted">
          {t('Journey subtitle')}
          <span className="text-muted/80"> · {t('Journey accuracy hint')}</span>
        </p>
      </div>
      {showGeo ? (
        <CurrLocation
          onClick={onGeo}
          aria-label={t('Find nearest station')}
          busy={locating}
        />
      ) : null}
    </div>
  )
}

function JourneyStepChips({
  step,
  locale,
  fromStation,
  toStation,
  onFrom,
  onTo,
}: Readonly<{
  step: Step
  locale: Language
  fromStation: IStation | null
  toStation: IStation | null
  onFrom: () => void
  onTo: () => void
}>) {
  const t = useTranslations()
  const pick = t('Select a station')
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onFrom}
        className={chipClass(step === 'from')}
      >
        {t('From')} {fromStation ? fromStation.label[locale] : pick}
      </button>
      <button
        type="button"
        onClick={onTo}
        disabled={!fromStation}
        className={chipClass(
          step === 'to',
          'enabled:hover:border-ink/40 disabled:opacity-40'
        )}
      >
        {t('To')} {toStation ? toStation.label[locale] : pick}
      </button>
    </div>
  )
}

function JourneyPicker({
  activeLine,
  activeStations,
  selectedCode,
  stationRefs,
  onSelectLine,
  onSelectStation,
}: Readonly<{
  activeLine: ILine | null
  activeStations: IStation[]
  selectedCode: string | undefined
  stationRefs: Record<string, React.RefObject<HTMLButtonElement | null>>
  onSelectLine: (line: ILine) => void
  onSelectStation: (station: IStation) => void
}>) {
  const t = useTranslations()
  return (
    <div className="space-y-3">
      <LinePicker
        variant="chips"
        selectedCode={activeLine?.code}
        onSelect={onSelectLine}
      />
      {activeLine ? (
        <StationList
          stations={activeStations}
          selectedCode={selectedCode}
          lineColor={activeLine.color}
          onSelect={onSelectStation}
          onInterchange={() => undefined}
          stationRefs={stationRefs}
        />
      ) : (
        <p className="text-sm text-muted">{t('Select a line')}</p>
      )}
    </div>
  )
}

function JourneyResultPanel({
  query,
  locale,
  stationsByCode,
  lineLabel,
  leaveNow,
  onLeaveNowChange,
  onReset,
}: Readonly<{
  query: {
    isLoading: boolean
    isError: boolean
    error: Error | null
    data: JourneyEstimate | undefined
  }
  locale: Language
  stationsByCode: Map<string, IStation>
  lineLabel: (code: string) => string
  leaveNow: boolean
  onLeaveNowChange: (v: boolean) => void
  onReset: () => void
}>) {
  const t = useTranslations()
  return (
    <div className="space-y-4">
      {query.isLoading ? (
        <p className="text-sm text-muted">{t('Estimating journey')}</p>
      ) : null}
      {query.isError ? (
        <p className="text-sm text-red-600">
          {journeyErrorMessage(query.error, t)}
        </p>
      ) : null}
      {query.data ? (
        <JourneyResult
          data={query.data}
          locale={locale}
          stationsByCode={stationsByCode}
          lineLabel={lineLabel}
          leaveNow={leaveNow}
          onLeaveNowChange={onLeaveNowChange}
        />
      ) : null}
      <button
        type="button"
        className="text-sm text-muted underline"
        onClick={onReset}
      >
        {t('Start over')}
      </button>
    </div>
  )
}

function warningFor(
  warnings: string[] | undefined,
  t: ReturnType<typeof useTranslations>
): string | null {
  if (!warnings?.length) return null
  if (warnings.includes('NO_UPCOMING_TRAIN')) return t('No upcoming train')
  return t('Waiting unavailable')
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
  const warningText = warningFor(data.warnings, t)
  const meta =
    data.transferCount === 0
      ? t('Journey meta direct')
      : t('Journey meta transfers', { count: data.transferCount })

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface-alt/40 p-4">
        <p className="text-3xl font-semibold tabular-nums text-ink">
          {data.durationMinutes}
          <span className="ml-1 text-base font-medium text-muted">
            {t('min')}
          </span>
        </p>
        <p className="mt-1 text-sm text-muted">{meta}</p>
        <p className="mt-0.5 text-xs text-muted">{t('Journey estimate note')}</p>

        <dl className="mt-4 space-y-1.5 text-sm">
          <BreakdownRow label={t('Riding')} value={`${rideMin} ${t('min')}`} />
          {transferMin > 0 ? (
            <BreakdownRow
              label={t('Transfers')}
              hint={t('Transfers hint')}
              value={`${transferMin} ${t('min')}`}
            />
          ) : null}
          {waitMin != null ? (
            <BreakdownRow
              label={t('Origin wait at', { station: originName })}
              value={`${waitMin} ${t('min')}`}
            />
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

      <JourneyLegs
        data={data}
        locale={locale}
        stationsByCode={stationsByCode}
        lineLabel={lineLabel}
      />
    </div>
  )
}

function BreakdownRow({
  label,
  hint,
  value,
}: Readonly<{ label: string; hint?: string; value: string }>) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">
        {label}
        {hint ? <span className="mt-0.5 block text-xs">{hint}</span> : null}
      </dt>
      <dd className="shrink-0 tabular-nums text-ink">{value}</dd>
    </div>
  )
}

function JourneyLegs({
  data,
  locale,
  stationsByCode,
  lineLabel,
}: Readonly<{
  data: JourneyEstimate
  locale: Language
  stationsByCode: Map<string, IStation>
  lineLabel: (code: string) => string
}>) {
  const t = useTranslations()
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">{t('Route')}</p>
      <ol className="space-y-0">
        {data.legs.map((leg, i) => (
          <JourneyLegRow
            key={`${leg.line}-${leg.origin}-${leg.destination}-${i}`}
            leg={leg}
            index={i}
            locale={locale}
            stationsByCode={stationsByCode}
            lineLabel={lineLabel}
          />
        ))}
      </ol>
    </div>
  )
}

function JourneyLegRow({
  leg,
  index,
  locale,
  stationsByCode,
  lineLabel,
}: Readonly<{
  leg: JourneyEstimate['legs'][number]
  index: number
  locale: Language
  stationsByCode: Map<string, IStation>
  lineLabel: (code: string) => string
}>) {
  const t = useTranslations()
  const transferIn = leg.transferInSeconds
  const boardWait = leg.boardingWaitSeconds
  const nextTrain =
    index === 0 && boardWait != null && boardWait > 0
      ? ` · ${t('Next train in', { minutes: minutes(boardWait) })}`
      : ''

  return (
    <li>
      {transferIn != null && transferIn > 0 ? (
        <p className="my-2 pl-4 text-xs text-muted">
          {t('Transfer at', {
            station: stationLabel(leg.origin, locale, stationsByCode),
            minutes: minutes(transferIn),
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
          <p className="text-sm font-medium text-ink">{lineLabel(leg.line)}</p>
          <p className="text-sm text-muted">
            {stationLabel(leg.origin, locale, stationsByCode)}
            {' → '}
            {stationLabel(leg.destination, locale, stationsByCode)}
          </p>
          <p className="text-xs text-muted">
            {minutes(leg.ridingSeconds)} {t('min')}
            {nextTrain}
          </p>
        </div>
      </div>
    </li>
  )
}
