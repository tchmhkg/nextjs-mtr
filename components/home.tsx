'use client'

import CurrLocation from '@components/curr-location'
import ContextChip from '@components/picker/context-chip'
import InterchangeDialog from '@components/picker/interchange-dialog'
import LinePicker from '@components/picker/line-picker'
import LrRoutePicker from '@components/picker/lr-route-picker'
import LrStationList, { LR_COLOR } from '@components/picker/lr-station-list'
import ModeToggle from '@components/picker/mode-toggle'
import StationList from '@components/picker/station-list'
import Result from '@components/train/result'
import { useNearestStation } from '@hooks/useNearestStation'
import { useRouter } from '@i18n/navigation'
import type { NextTrainDto } from '@lib/schedules/contracts/next-train.dto'
import type { TransportMode } from '@lib/schedules/contracts/transport-mode'
import {
  getTrainState,
  setLine,
  setStation,
} from '@store/slices/trainSlice'
import { useDispatch, useSelector } from '@store/store'
import type { LrStation } from '@utils/lr-data'
import {
  getLrRouteStopIds,
  getLrStation,
  isKnownLrRoute,
} from '@utils/lr-data'
import type { ILine, IStation } from '@utils/next-train-data'
import { DATA } from '@utils/next-train-data'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

type Language = 'en' | 'tc'
type LrDir = 1 | 2

const getLanguage = (lang: string): Language =>
  lang === 'tc' ? 'tc' : 'en'

function parseLrDir(raw: string | null | undefined): LrDir {
  return raw === '2' ? 2 : 1
}

type HomeProps = Readonly<{
  heading?: string
  initialModeFromUrl?: TransportMode
  initialLineFromUrl?: string | null
  initialDirFromUrl?: string | null
  initialStaFromUrl?: string | null
  initialSchedule?: NextTrainDto | null
  initialScheduleFailed?: boolean
}>

type HomePickerBodyProps = Readonly<{
  pickerStep: 'line' | 'station'
  selectedLine: ILine | null
  selectedStation: IStation | null
  lineStations: ReturnType<typeof DATA.find>
  stationListRef: React.RefObject<HTMLDivElement | null>
  stationRefs: Record<string, React.RefObject<HTMLButtonElement | null>>
  lang: Language
  onChangeLine: (line: ILine) => void
  onSelectStation: (station: IStation) => void
  onInterchange: (station: IStation) => void
  onBackToLines: () => void
}>

function HomePickerBody({
  pickerStep,
  selectedLine,
  selectedStation,
  lineStations,
  stationListRef,
  stationRefs,
  lang,
  onChangeLine,
  onSelectStation,
  onInterchange,
  onBackToLines,
}: HomePickerBodyProps) {
  const t = useTranslations()

  return (
    <>
      {pickerStep === 'station' && selectedLine ? (
        <button
          type="button"
          onClick={onBackToLines}
          className="mb-2 text-sm text-muted hover:text-ink md:hidden"
          aria-label={t('Select a line')}
        >
          ← {t('Select a line')}
        </button>
      ) : null}

      <div className="flex flex-col gap-3 md:flex-row md:gap-0">
        <div
          className={`md:w-52 md:shrink-0 md:border-r md:border-border md:pr-2 ${pickerStep === 'station' ? 'hidden md:block' : 'block'
            }`}
        >
          <div className="mb-1 hidden px-2 text-xs font-medium uppercase tracking-wide text-muted md:block">
            {t('Select a line')}
          </div>
          <div className="md:hidden">
            <LinePicker
              selectedCode={selectedLine?.code}
              onSelect={onChangeLine}
              variant="chips"
            />
          </div>
          <div className="hidden md:block">
            <LinePicker
              selectedCode={selectedLine?.code}
              onSelect={onChangeLine}
              variant="rail"
            />
          </div>
        </div>

        {selectedLine ? (
          <div
            className={`min-w-0 flex-1 md:pl-2 ${pickerStep === 'line' ? 'hidden md:block' : 'block'
              }`}
          >
            <div
              className="mb-1 flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wide text-muted"
              style={{ borderLeft: `3px solid ${selectedLine.color}` }}
            >
              <span className="pl-2">
                {selectedLine.label[lang]} · {t('stations')}
              </span>
            </div>
            <StationList
              ref={stationListRef}
              stations={lineStations?.stations ?? []}
              selectedCode={selectedStation?.code}
              lineColor={selectedLine.color}
              onSelect={onSelectStation}
              onInterchange={onInterchange}
              stationRefs={stationRefs}
            />
          </div>
        ) : null}
      </div>
    </>
  )
}

function scheduleMatchesSelection(
  initialSchedule: NextTrainDto | null | undefined,
  initialMode: TransportMode,
  initialLineFromUrl: string | null | undefined,
  initialStaFromUrl: string | null | undefined,
  mode: TransportMode,
  lineCode?: string | null,
  staCode?: string | null
): NextTrainDto | undefined {
  if (!initialSchedule || !initialStaFromUrl || mode !== initialMode) {
    return undefined
  }
  if (mode === 'lr') {
    return staCode === initialStaFromUrl ? initialSchedule : undefined
  }
  if (
    !initialLineFromUrl ||
    lineCode !== initialLineFromUrl ||
    staCode !== initialStaFromUrl
  ) {
    return undefined
  }
  return initialSchedule
}

const Home = ({
  heading = 'MTR Next Train',
  initialModeFromUrl = 'mtr',
  initialLineFromUrl = null,
  initialDirFromUrl = null,
  initialStaFromUrl = null,
  initialSchedule = null,
  initialScheduleFailed = false,
}: HomeProps) => {
  const dispatch = useDispatch()
  const { line: selectedLine, station: selectedStation } =
    useSelector(getTrainState)
  const locale = useLocale()
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const stationListRef = useRef<HTMLDivElement>(null)
  const lrListRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<TransportMode>(initialModeFromUrl)
  const [lrRouteCode, setLrRouteCode] = useState<string | null>(() =>
    initialModeFromUrl === 'lr' &&
      initialLineFromUrl &&
      isKnownLrRoute(initialLineFromUrl)
      ? initialLineFromUrl
      : null
  )
  const [lrDir, setLrDir] = useState<LrDir>(() =>
    parseLrDir(initialDirFromUrl)
  )
  const [lrStationId, setLrStationId] = useState<string | null>(() =>
    initialModeFromUrl === 'lr' ? initialStaFromUrl : null
  )
  const [interchangeFor, setInterchangeFor] = useState<IStation | null>(null)
  const [editing, setEditing] = useState(() => {
    if (initialModeFromUrl === 'lr') {
      return !(
        initialLineFromUrl &&
        isKnownLrRoute(initialLineFromUrl) &&
        initialStaFromUrl
      )
    }
    return !(initialLineFromUrl && initialStaFromUrl)
  })
  const [pickerStep, setPickerStep] = useState<'line' | 'station'>(() =>
    initialLineFromUrl && initialStaFromUrl ? 'station' : 'line'
  )
  const [lrPickerStep, setLrPickerStep] = useState<'route' | 'station'>(() =>
    initialModeFromUrl === 'lr' &&
      initialLineFromUrl &&
      isKnownLrRoute(initialLineFromUrl)
      ? 'station'
      : 'route'
  )

  const stationRefs = useMemo(
    () =>
      DATA.reduce(
        (acc, value) => {
          for (const station of value.stations) {
            acc[station.code] = React.createRef<HTMLButtonElement | null>()
          }
          return acc
        },
        {} as Record<string, React.RefObject<HTMLButtonElement | null>>
      ),
    []
  )

  const onFoundNearest = useCallback(
    (line: ILine, station: IStation) => {
      setMode('mtr')
      dispatch(setLine(line))
      dispatch(setStation(station))
      setLrRouteCode(null)
      setLrStationId(null)
      setEditing(false)
      setPickerStep('station')
    },
    [dispatch]
  )

  const { locating, locationError, getCurrLocation, setLocationError } =
    useNearestStation(onFoundNearest)

  const onChangeMode = useCallback(
    (next: TransportMode) => {
      if (next === mode) return
      setMode(next)
      setEditing(true)
      setInterchangeFor(null)
      setLocationError(null)
      if (next === 'lr') {
        dispatch(setLine(null))
        dispatch(setStation(null))
        setLrRouteCode(null)
        setLrStationId(null)
        setLrDir(1)
        setLrPickerStep('route')
        setPickerStep('line')
      } else {
        setLrRouteCode(null)
        setLrStationId(null)
        setPickerStep('line')
      }
    },
    [mode, dispatch, setLocationError]
  )

  const onChangeLine = useCallback(
    (line: ILine) => {
      if (line.code !== selectedLine?.code) {
        dispatch(setLine(line))
        dispatch(setStation(null))
        stationListRef.current?.scrollTo({ top: 0 })
      }
      setPickerStep('station')
    },
    [selectedLine, dispatch]
  )

  const onSelectStation = useCallback(
    (station: IStation) => {
      dispatch(setStation(station))
      setEditing(false)
      queueMicrotask(() => {
        document
          .getElementById('schedule-panel')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    },
    [dispatch]
  )

  const onSelectLrRoute = useCallback((routeCode: string) => {
    setLrRouteCode(routeCode)
    setLrStationId(null)
    setLrPickerStep('station')
    setEditing(true)
    lrListRef.current?.scrollTo({ top: 0 })
  }, [])

  const onChangeLrDir = useCallback((d: LrDir) => {
    setLrDir(d)
    // Drop stop so URL sync won't snap back to glance mode, and the list
    // stays interactive for the new direction.
    setLrStationId(null)
    setEditing(true)
    setLrPickerStep('station')
  }, [])

  const onSelectLrStation = useCallback((station: LrStation) => {
    setLrStationId(station.id)
    setEditing(false)
    queueMicrotask(() => {
      document
        .getElementById('schedule-panel')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const lineStations = useMemo(() => {
    if (!selectedLine?.code) return undefined
    return DATA.find((s) => s.line.code === selectedLine.code)
  }, [selectedLine])

  const lrStation = lrStationId ? getLrStation(lrStationId) : undefined
  const lrStops = useMemo(() => {
    if (!lrRouteCode) return []
    return getLrRouteStopIds(lrRouteCode, lrDir)
      .map((id) => getLrStation(id))
      .filter((s): s is LrStation => Boolean(s))
  }, [lrRouteCode, lrDir])

  useLayoutEffect(() => {
    if (initialModeFromUrl === 'lr') return
    if (!initialLineFromUrl || !initialStaFromUrl) return
    const lineData = DATA.find((s) => s.line.code === initialLineFromUrl)
    const line = lineData?.line
    const station = lineData?.stations?.find(
      (s) => s.code === initialStaFromUrl
    )
    if (line && station) {
      dispatch(setLine(line))
      dispatch(setStation(station))
    }
  }, [dispatch, initialModeFromUrl, initialLineFromUrl, initialStaFromUrl])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (mode === 'lr') {
      if (!lrRouteCode || !lrStationId) {
        if (!lrRouteCode) {
          // Switching from MTR (or clearing route): bare mode=lr. Do not leave
          // mode=mtr&line=… or a soft-nav remount snaps the tab back to MTR.
          const alreadyBare =
            searchParams.get('mode') === 'lr' &&
            !searchParams.get('line') &&
            !searchParams.get('sta') &&
            !searchParams.get('dir')
          if (alreadyBare) return
          params.set('mode', 'lr')
          params.delete('line')
          params.delete('sta')
          params.delete('dir')
          router.replace(`?${params.toString()}`, { scroll: false })
          return
        }
        // Route chosen, stop not yet: never write line/dir-only (remount snaps
        // mobile picker). Only strip a stale sta, and force mode=lr if needed.
        if (searchParams.get('mode') !== 'lr') {
          params.set('mode', 'lr')
          params.delete('line')
          params.delete('sta')
          params.delete('dir')
          router.replace(`?${params.toString()}`, { scroll: false })
          return
        }
        if (searchParams.get('sta')) {
          params.delete('sta')
          router.replace(`?${params.toString()}`, { scroll: false })
        }
        return
      }

      if (
        searchParams.get('mode') === 'lr' &&
        searchParams.get('line') === lrRouteCode &&
        searchParams.get('sta') === lrStationId &&
        searchParams.get('dir') === String(lrDir)
      ) {
        return
      }
      params.set('mode', 'lr')
      params.set('line', lrRouteCode)
      params.set('sta', lrStationId)
      params.set('dir', String(lrDir))
      router.replace(`?${params.toString()}`, { scroll: false })
      return
    }

    if (!selectedLine?.code || !selectedStation?.code) {
      // Mirror: leaving LR must not keep mode=lr in the URL.
      if (searchParams.get('mode') === 'lr' || searchParams.get('dir')) {
        params.set('mode', 'mtr')
        params.delete('line')
        params.delete('sta')
        params.delete('dir')
        router.replace(`?${params.toString()}`, { scroll: false })
      }
      return
    }
    if (
      (searchParams.get('mode') === 'mtr' || !searchParams.get('mode')) &&
      searchParams.get('line') === selectedLine.code &&
      searchParams.get('sta') === selectedStation.code &&
      !searchParams.get('dir')
    ) {
      return
    }
    params.set('mode', 'mtr')
    params.set('line', selectedLine.code)
    params.set('sta', selectedStation.code)
    params.delete('dir')
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [
    mode,
    lrRouteCode,
    lrDir,
    lrStationId,
    selectedLine,
    selectedStation,
    router,
    searchParams,
  ])

  useLayoutEffect(() => {
    if (mode !== 'mtr' || !editing || !selectedStation?.code) return
    const list = stationListRef.current
    const el = stationRefs[selectedStation.code]?.current
    if (!list || !el) return
    const nextTop =
      list.scrollTop +
      (el.getBoundingClientRect().top - list.getBoundingClientRect().top) -
      (list.clientHeight / 2 - el.clientHeight / 2)
    list.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' })
  }, [mode, editing, selectedLine, selectedStation, stationRefs])

  const showInterchangeOptions = useCallback((station: IStation) => {
    setInterchangeFor(station)
  }, [])

  const switchLine = useCallback(
    (lineCode: string, stationCode?: string) => {
      const lineData = DATA.find((s) => s.line.code === lineCode)
      const line = lineData?.line
      if (line) {
        dispatch(setLine(line))
        const code = stationCode ?? interchangeFor?.code
        if (code) {
          const station = lineData?.stations?.find((sta) => sta.code === code)
          if (station) dispatch(setStation(station))
          else dispatch(setStation(null))
        }
      }
      setInterchangeFor(null)
      setEditing(false)
    },
    [dispatch, interchangeFor]
  )

  const startEditing = useCallback(() => {
    setEditing(true)
    if (mode === 'mtr') {
      setPickerStep(selectedLine ? 'station' : 'line')
      return
    }
    setLrPickerStep(lrRouteCode ? 'station' : 'route')
  }, [mode, selectedLine, lrRouteCode])

  const hasMtrSelection = Boolean(selectedLine?.code && selectedStation?.code)
  const hasLrSelection = Boolean(lrRouteCode && lrStationId)
  const hasSelection = mode === 'lr' ? hasLrSelection : hasMtrSelection
  const showGlance = hasSelection && !editing
  const hasInterchange = (selectedStation?.related?.length ?? 0) > 0
  const lang = getLanguage(locale)

  const scheduleForResult = scheduleMatchesSelection(
    initialSchedule,
    initialModeFromUrl,
    initialLineFromUrl,
    initialStaFromUrl,
    mode,
    mode === 'lr' ? lrRouteCode : selectedLine?.code,
    mode === 'lr' ? lrStationId : selectedStation?.code
  )

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h1 className="min-w-0 flex-1 text-xl font-semibold tracking-tight text-ink md:text-2xl">
          {heading}
        </h1>
        {/* Fixed slot so MTR↔LR mode switch does not shift the header / schedule refresh. */}
        <div className="flex size-11 shrink-0 items-center justify-center">
          {mode === 'mtr' ? (
            <CurrLocation
              onClick={getCurrLocation}
              aria-label={t('Find nearest station')}
              busy={locating}
            />
          ) : null}
        </div>
      </header>

      <ModeToggle mode={mode} onChange={onChangeMode} />

      {locationError && mode === 'mtr' ? (
        <p className="mb-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {t(locationError)}
        </p>
      ) : null}

      {showGlance && mode === 'mtr' && selectedLine && selectedStation ? (
        <ContextChip
          lineLabel={selectedLine.label[lang]}
          stationLabel={selectedStation.label[lang]}
          lineColor={selectedLine.color}
          changeLabel={t('Change')}
          onChange={startEditing}
          interchangeLabel={hasInterchange ? t('Interchange') : undefined}
          onInterchange={
            hasInterchange
              ? () => showInterchangeOptions(selectedStation)
              : undefined
          }
        />
      ) : null}

      {showGlance && mode === 'lr' && lrRouteCode && lrStation ? (
        <ContextChip
          lineLabel={`${t('Light Rail')} ${lrRouteCode}`}
          stationLabel={lrStation.label[lang]}
          lineColor={LR_COLOR}
          changeLabel={t('Change')}
          onChange={startEditing}
        />
      ) : null}

      {!showGlance ? (
        <section
          className="mb-4 rounded-xl border border-border bg-surface-alt/80 p-3"
          aria-label={t('Train line and station selection')}
        >
          {mode === 'mtr' ? (
            <HomePickerBody
              pickerStep={pickerStep}
              selectedLine={selectedLine}
              selectedStation={selectedStation}
              lineStations={lineStations}
              stationListRef={stationListRef}
              stationRefs={stationRefs}
              lang={lang}
              onChangeLine={onChangeLine}
              onSelectStation={onSelectStation}
              onInterchange={showInterchangeOptions}
              onBackToLines={() => setPickerStep('line')}
            />
          ) : (
            <>
              {lrPickerStep === 'station' && lrRouteCode ? (
                <button
                  type="button"
                  onClick={() => setLrPickerStep('route')}
                  className="mb-2 text-sm text-muted hover:text-ink md:hidden"
                  aria-label={t('Select a route')}
                >
                  ← {t('Select a route')}
                </button>
              ) : null}

              <div className="flex flex-col gap-3 md:flex-row md:gap-0">
                <div
                  className={`md:w-40 md:shrink-0 md:border-r md:border-border md:pr-2 ${lrPickerStep === 'station' ? 'hidden md:block' : 'block'
                    }`}
                >
                  <div className="mb-1 hidden px-2 text-xs font-medium uppercase tracking-wide text-muted md:block">
                    {t('Select a route')}
                  </div>
                  <div className="md:hidden">
                    <LrRoutePicker
                      selectedCode={lrRouteCode}
                      onSelect={onSelectLrRoute}
                      variant="chips"
                    />
                  </div>
                  <div className="hidden md:block">
                    <LrRoutePicker
                      selectedCode={lrRouteCode}
                      onSelect={onSelectLrRoute}
                      variant="rail"
                    />
                  </div>
                </div>

                {lrRouteCode ? (
                  <div
                    className={`min-w-0 flex-1 md:pl-2 ${lrPickerStep === 'route' ? 'hidden md:block' : 'block'
                      }`}
                  >
                    <div
                      className="mb-2 flex flex-wrap items-center gap-2 px-1"
                      style={{ borderLeft: `3px solid ${LR_COLOR}` }}
                    >
                      <span className="pl-2 text-xs font-medium uppercase tracking-wide text-muted">
                        {lrRouteCode} · {t('stations')}
                      </span>
                      <div
                        className="ml-auto flex gap-1 rounded-md border border-border p-0.5"
                        role="group"
                        aria-label={t('Direction')}
                      >
                        {([1, 2] as const).map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => onChangeLrDir(d)}
                            className={`rounded px-2 py-0.5 text-xs tabular-nums ${lrDir === d
                              ? 'bg-surface-alt font-medium text-ink'
                              : 'text-muted hover:text-ink'
                              }`}
                          >
                            {t('Direction')} {d}
                          </button>
                        ))}
                      </div>
                    </div>
                    <LrStationList
                      key={`${lrRouteCode}-${lrDir}`}
                      ref={lrListRef}
                      stations={lrStops}
                      selectedId={lrStationId}
                      onSelect={onSelectLrStation}
                    />
                  </div>
                ) : null}
              </div>
            </>
          )}
        </section>
      ) : null}

      {mode === 'mtr' && hasMtrSelection && selectedLine && selectedStation ? (
        <div id="schedule-panel">
          <Result
            mode="mtr"
            line={selectedLine.code}
            sta={selectedStation.code}
            initialSchedule={scheduleForResult}
            initialScheduleFailed={
              initialScheduleFailed &&
              initialModeFromUrl === 'mtr' &&
              selectedLine.code === initialLineFromUrl &&
              selectedStation.code === initialStaFromUrl
            }
          />
        </div>
      ) : null}

      {mode === 'lr' && lrStationId ? (
        <div id="schedule-panel">
          <Result
            mode="lr"
            sta={lrStationId}
            initialSchedule={scheduleForResult}
            initialScheduleFailed={
              initialScheduleFailed &&
              initialModeFromUrl === 'lr' &&
              lrStationId === initialStaFromUrl
            }
          />
        </div>
      ) : null}

      {interchangeFor ? (
        <InterchangeDialog
          station={interchangeFor}
          onSelect={switchLine}
          onClose={() => setInterchangeFor(null)}
        />
      ) : null}
    </div>
  )
}

export default React.memo(Home)
