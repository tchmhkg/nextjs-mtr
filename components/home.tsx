'use client'

import Alert from '@components/alert'
import ContextChip from '@components/picker/context-chip'
import LinePicker from '@components/picker/line-picker'
import StationList from '@components/picker/station-list'
import CurrLocation from '@components/curr-location'
import Result from '@components/train/result'
import { useNearestStation } from '@hooks/useNearestStation'
import { useRouter } from '@i18n/navigation'
import type { MessageKey } from '@i18n/message-key'
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
  const [showRelated, setShowRelated] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
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
      if (isMobile) setPickerStep('station')
    },
    [selectedLine, dispatch, isMobile]
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
    const mq = window.matchMedia('(max-width: 768px)')
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

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

  const showInterchangeOptions = useCallback(
    (station: IStation) => {
      dispatch(setStation(station))
      setShowRelated(true)
    },
    [dispatch]
  )

  const switchLine = useCallback(
    (lineCode: string, stationCode?: string) => {
      const lineData = DATA.find((s) => s.line.code === lineCode)
      const line = lineData?.line
      if (line) {
        dispatch(setLine(line))
        if (stationCode) {
          const station = lineData?.stations?.find(
            (sta) => sta.code === stationCode
          )
          if (station) dispatch(setStation(station))
        }
      }
      setShowRelated(false)
      setEditing(false)
    },
    [dispatch]
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
          {isMobile && pickerStep === 'station' && selectedLine ? (
            <button
              type="button"
              onClick={() => setPickerStep('line')}
              className="mb-2 text-sm text-muted hover:text-ink"
              aria-label={t('Select a line')}
            >
              ← {t('Select a line')}
            </button>
          ) : null}

          <div className="flex flex-col gap-3 md:flex-row md:gap-0">
            {(!isMobile || pickerStep === 'line') && (
              <div
                className={`md:w-52 md:shrink-0 md:border-r md:border-border md:pr-2 ${
                  isMobile ? '' : ''
                }`}
              >
                {!isMobile ? (
                  <div className="mb-1 px-2 text-xs font-medium uppercase tracking-wide text-muted">
                    {t('Select a line')}
                  </div>
                ) : null}
                <LinePicker
                  selectedCode={selectedLine?.code}
                  onSelect={onChangeLine}
                  variant={isMobile ? 'chips' : 'rail'}
                />
              </div>
            )}

            {(!isMobile || pickerStep === 'station') && selectedLine ? (
              <div className="min-w-0 flex-1 md:pl-2">
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
        </section>
      )}

      {hasSelection && selectedLine && selectedStation ? (
        <Result
          line={selectedLine.code}
          sta={selectedStation.code}
          initialSchedule={scheduleForResult}
        />
      ) : null}

      {showRelated && selectedStation ? (
        <Alert onPressClose={() => setShowRelated(false)}>
          <div className="flex flex-col gap-2">
            {selectedStation.related?.map((rStation) => (
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
