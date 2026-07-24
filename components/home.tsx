'use client'

import CurrLocation from '@components/curr-location'
import ContextChip from '@components/picker/context-chip'
import InterchangeDialog from '@components/picker/interchange-dialog'
import LinePicker from '@components/picker/line-picker'
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
import type { LrStation } from '@utils/lr-stations'
import { getLrStation } from '@utils/lr-stations'
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

const getLanguage = (lang: string): Language =>
  lang === 'tc' ? 'tc' : 'en'

type HomeProps = Readonly<{
  heading?: string
  initialModeFromUrl?: TransportMode
  initialLineFromUrl?: string | null
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
          className={`md:w-52 md:shrink-0 md:border-r md:border-border md:pr-2 ${
            pickerStep === 'station' ? 'hidden md:block' : 'block'
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
            className={`min-w-0 flex-1 md:pl-2 ${
              pickerStep === 'line' ? 'hidden md:block' : 'block'
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
  const [lrStationId, setLrStationId] = useState<string | null>(() =>
    initialModeFromUrl === 'lr' ? initialStaFromUrl : null
  )
  const [interchangeFor, setInterchangeFor] = useState<IStation | null>(null)
  const [editing, setEditing] = useState(() => {
    if (initialModeFromUrl === 'lr') return !initialStaFromUrl
    return !(initialLineFromUrl && initialStaFromUrl)
  })
  const [pickerStep, setPickerStep] = useState<'line' | 'station'>(() =>
    initialLineFromUrl && initialStaFromUrl ? 'station' : 'line'
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
      setLrStationId(null)
      setEditing(false)
      setPickerStep('station')
    },
    [dispatch]
  )

  const { locating, locationError, getCurrLocation } =
    useNearestStation(onFoundNearest)

  const onChangeMode = useCallback(
    (next: TransportMode) => {
      if (next === mode) return
      setMode(next)
      setEditing(true)
      setInterchangeFor(null)
      if (next === 'lr') {
        dispatch(setLine(null))
        dispatch(setStation(null))
        setPickerStep('line')
      } else {
        setLrStationId(null)
        setPickerStep('line')
      }
    },
    [mode, dispatch]
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
      if (!lrStationId) return
      if (
        searchParams.get('mode') === 'lr' &&
        searchParams.get('sta') === lrStationId &&
        !searchParams.get('line')
      ) {
        return
      }
      params.set('mode', 'lr')
      params.set('sta', lrStationId)
      params.delete('line')
      router.replace(`?${params.toString()}`, { scroll: false })
      return
    }

    if (!selectedLine?.code || !selectedStation?.code) return
    if (
      (searchParams.get('mode') === 'mtr' || !searchParams.get('mode')) &&
      searchParams.get('line') === selectedLine.code &&
      searchParams.get('sta') === selectedStation.code
    ) {
      return
    }
    params.set('mode', 'mtr')
    params.set('line', selectedLine.code)
    params.set('sta', selectedStation.code)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [mode, lrStationId, selectedLine, selectedStation, router, searchParams])

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
    if (mode === 'mtr') setPickerStep(selectedLine ? 'station' : 'line')
  }, [mode, selectedLine])

  const hasMtrSelection = Boolean(selectedLine?.code && selectedStation?.code)
  const hasLrSelection = Boolean(lrStationId)
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
    mode === 'lr' ? null : selectedLine?.code,
    mode === 'lr' ? lrStationId : selectedStation?.code
  )

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">
          {heading}
        </h1>
        {mode === 'mtr' ? (
          <CurrLocation
            onClick={getCurrLocation}
            aria-label={t('Find nearest station')}
            busy={locating}
          />
        ) : null}
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

      {showGlance && mode === 'lr' && lrStation ? (
        <ContextChip
          lineLabel={t('Light Rail')}
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
              <div className="mb-1 px-1 text-xs font-medium uppercase tracking-wide text-muted">
                {t('Select a station')}
              </div>
              <LrStationList
                ref={lrListRef}
                selectedId={lrStationId}
                onSelect={onSelectLrStation}
              />
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
