'use client'

import Alert from '@components/alert'
import CurrLocation from '@components/curr-location'
import ContextChip from '@components/picker/context-chip'
import LinePicker from '@components/picker/line-picker'
import StationList from '@components/picker/station-list'
import Result from '@components/train/result'
import { useNearestStation } from '@hooks/useNearestStation'
import type { MessageKey } from '@i18n/message-key'
import { useRouter } from '@i18n/navigation'
import type { NextTrainDto } from '@lib/schedules/contracts/next-train.dto'
import {
  getTrainState,
  setLine,
  setStation,
} from '@store/slices/trainSlice'
import { useDispatch, useSelector } from '@store/store'
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

type HomeProps = {
  heading?: string
  initialLineFromUrl?: string | null
  initialStaFromUrl?: string | null
  initialSchedule?: NextTrainDto | null
}

const Home = ({
  heading = 'MTR Next Train',
  initialLineFromUrl = null,
  initialStaFromUrl = null,
  initialSchedule = null,
}: HomeProps) => {
  const dispatch = useDispatch()
  const { line: selectedLine, station: selectedStation } =
    useSelector(getTrainState)
  const locale = useLocale()
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const stationListRef = useRef<HTMLDivElement>(null)
  const [interchangeFor, setInterchangeFor] = useState<IStation | null>(null)
  const [editing, setEditing] = useState(
    () => !(initialLineFromUrl && initialStaFromUrl)
  )
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
      dispatch(setLine(line))
      dispatch(setStation(station))
      setEditing(false)
      setPickerStep('station')
    },
    [dispatch]
  )

  const { locating, locationError, getCurrLocation } =
    useNearestStation(onFoundNearest)

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
    },
    [dispatch]
  )

  const lineStations = useMemo(() => {
    if (!selectedLine?.code) return undefined
    return DATA.find((s) => s.line.code === selectedLine.code)
  }, [selectedLine])

  useLayoutEffect(() => {
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
  }, [dispatch, initialLineFromUrl, initialStaFromUrl])

  useEffect(() => {
    if (!selectedLine?.code || !selectedStation?.code) return
    if (
      searchParams.get('line') === selectedLine.code &&
      searchParams.get('sta') === selectedStation.code
    ) {
      return
    }
    const params = new URLSearchParams(searchParams.toString())
    params.set('line', selectedLine.code)
    params.set('sta', selectedStation.code)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [selectedLine, selectedStation, router, searchParams])

  useEffect(() => {
    if (!selectedStation?.code || editing) return
    stationRefs[selectedStation.code]?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [selectedLine, selectedStation, stationRefs, editing])

  // Open interchange without touching Redux/URL — avoids RSC remount wiping dialog state
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
    setPickerStep(selectedLine ? 'station' : 'line')
  }, [selectedLine])

  const hasSelection = Boolean(selectedLine?.code && selectedStation?.code)
  const showGlance = hasSelection && !editing
  const lang = getLanguage(locale)

  const scheduleForResult =
    initialSchedule &&
    initialLineFromUrl &&
    initialStaFromUrl &&
    selectedLine?.code === initialLineFromUrl &&
    selectedStation?.code === initialStaFromUrl
      ? initialSchedule
      : undefined

  const pickerBody = (
    <>
      {pickerStep === 'station' && selectedLine ? (
        <button
          type="button"
          onClick={() => setPickerStep('line')}
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
              onInterchange={showInterchangeOptions}
              stationRefs={stationRefs}
            />
          </div>
        ) : null}
      </div>
    </>
  )

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">
          {heading}
        </h1>
        {(editing || !hasSelection) && (
          <CurrLocation
            onClick={getCurrLocation}
            aria-label={t('Find nearest station')}
            busy={locating}
          />
        )}
      </header>

      {locationError ? (
        <p className="mb-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {t(locationError)}
        </p>
      ) : null}

      {showGlance && selectedLine && selectedStation ? (
        <ContextChip
          lineLabel={selectedLine.label[lang]}
          stationLabel={selectedStation.label[lang]}
          lineColor={selectedLine.color}
          changeLabel={t('Change')}
          onChange={startEditing}
        />
      ) : (
        <section
          className="mb-4 rounded-xl border border-border bg-surface-alt/80 p-3"
          aria-label={t('Train line and station selection')}
        >
          {pickerBody}
        </section>
      )}

      {hasSelection && selectedLine && selectedStation ? (
        <Result
          line={selectedLine.code}
          sta={selectedStation.code}
          initialSchedule={scheduleForResult}
        />
      ) : null}

      {interchangeFor ? (
        <Alert onPressClose={() => setInterchangeFor(null)}>
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-sm text-muted">
              {interchangeFor.label[lang]}
            </p>
            {interchangeFor.related?.map((rStation) => (
              <button
                key={rStation.lineCode}
                type="button"
                className="rounded-lg px-4 py-3 text-left text-sm font-medium text-white"
                style={{ backgroundColor: rStation.color }}
                onClick={() =>
                  switchLine(rStation.lineCode, rStation.stationCode)
                }
              >
                {t(rStation.lineCode as MessageKey)}
              </button>
            ))}
          </div>
        </Alert>
      ) : null}
    </div>
  )
}

export default React.memo(Home)
