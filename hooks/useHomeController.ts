'use client'

import { useNearestStation } from '@hooks/useNearestStation'
import { useRouter } from '@i18n/navigation'
import type { NextTrainDto } from '@lib/schedules/contracts/next-train.dto'
import type { TransportMode } from '@lib/schedules/contracts/transport-mode'
import {
  clearLrSelection,
  getTrainState,
  hydrateFromUrl,
  type LrDir,
  setLine,
  setLrDir,
  setLrRouteCode,
  setLrStationId,
  setMode,
  setStation,
} from '@store/slices/trainSlice'
import { useDispatch, useSelector } from '@store/store'
import type { LrStation } from '@utils/lr-data'
import {
  findLrRouteServing,
  getLrRouteStopIds,
  getLrStation,
  isKnownLrRoute,
} from '@utils/lr-data'
import type { ILine, IStation } from '@utils/next-train-data'
import { DATA } from '@utils/next-train-data'
import { nextTransportQuery } from '@utils/transport-url'
import { useSearchParams } from 'next/navigation'
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

export type { LrDir }

function parseLrDir(raw: string | null | undefined): LrDir {
  return raw === '2' ? 2 : 1
}

function initialLrRouteCode(
  mode: TransportMode,
  line: string | null | undefined
): string | null {
  if (mode !== 'lr' || !line || !isKnownLrRoute(line)) return null
  return line
}

function initialEditing(
  mode: TransportMode,
  line: string | null | undefined,
  sta: string | null | undefined
): boolean {
  if (mode === 'lr') return !(line && isKnownLrRoute(line) && sta)
  return !(line && sta)
}

function initialLrPickerStep(
  mode: TransportMode,
  line: string | null | undefined
): 'route' | 'station' {
  if (mode === 'lr' && line && isKnownLrRoute(line)) return 'station'
  return 'route'
}

function scrollToSchedulePanel() {
  queueMicrotask(() => {
    document
      .getElementById('schedule-panel')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function buildStationRefs() {
  return DATA.reduce(
    (acc, value) => {
      for (const station of value.stations) {
        acc[station.code] = React.createRef<HTMLButtonElement | null>()
      }
      return acc
    },
    {} as Record<string, React.RefObject<HTMLButtonElement | null>>
  )
}

function resolveMtrFromUrl(lineCode: string, staCode: string) {
  const lineData = DATA.find((s) => s.line.code === lineCode)
  const station = lineData?.stations.find((s) => s.code === staCode)
  if (!lineData || !station) return null
  return { line: lineData.line, station }
}

function applyInterchangeLine(
  dispatch: ReturnType<typeof useDispatch>,
  lineCode: string,
  stationCode: string | undefined,
  interchangeCode: string | undefined
) {
  const lineData = DATA.find((s) => s.line.code === lineCode)
  if (!lineData?.line) return
  dispatch(setLine(lineData.line))
  const code = stationCode ?? interchangeCode
  if (!code) return
  const station = lineData.stations.find((sta) => sta.code === code)
  dispatch(setStation(station ?? null))
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

function useHydrateSelectionFromUrl(
  modeFromUrl: TransportMode,
  line: string | null | undefined,
  sta: string | null | undefined,
  dir: string | null | undefined
) {
  const dispatch = useDispatch()
  useLayoutEffect(() => {
    if (modeFromUrl === 'lr') {
      dispatch(
        hydrateFromUrl({
          mode: 'lr',
          line: null,
          station: null,
          lrRouteCode: initialLrRouteCode('lr', line),
          lrStationId: sta ?? null,
          lrDir: parseLrDir(dir),
        })
      )
      return
    }
    if (!line || !sta) {
      dispatch(hydrateFromUrl({ mode: 'mtr' }))
      return
    }
    const resolved = resolveMtrFromUrl(line, sta)
    if (!resolved) return
    dispatch(
      hydrateFromUrl({
        mode: 'mtr',
        line: resolved.line,
        station: resolved.station,
        lrRouteCode: null,
        lrStationId: null,
      })
    )
  }, [dispatch, modeFromUrl, line, sta, dir])
}

function useSyncTransportUrl(
  mode: TransportMode,
  lrRouteCode: string | null,
  lrStationId: string | null,
  lrDir: LrDir,
  mtrLine?: string | null,
  mtrSta?: string | null
) {
  const router = useRouter()
  const searchParams = useSearchParams()
  useEffect(() => {
    const next = nextTransportQuery(
      searchParams,
      mode,
      lrRouteCode,
      lrStationId,
      lrDir,
      mtrLine,
      mtrSta
    )
    if (next) router.replace(next, { scroll: false })
  }, [
    mode,
    lrRouteCode,
    lrStationId,
    lrDir,
    mtrLine,
    mtrSta,
    router,
    searchParams,
  ])
}

function useScrollSelectedStation(
  mode: TransportMode,
  editing: boolean,
  stationCode: string | undefined,
  listRef: React.RefObject<HTMLDivElement | null>,
  stationRefs: Record<string, React.RefObject<HTMLButtonElement | null>>
) {
  useLayoutEffect(() => {
    if (mode !== 'mtr' || !editing || !stationCode) return
    const list = listRef.current
    const el = stationRefs[stationCode]?.current
    if (!list || !el) return
    const nextTop =
      list.scrollTop +
      (el.getBoundingClientRect().top - list.getBoundingClientRect().top) -
      (list.clientHeight / 2 - el.clientHeight / 2)
    list.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' })
  }, [mode, editing, stationCode, listRef, stationRefs])
}

export type HomeControllerProps = Readonly<{
  initialModeFromUrl?: TransportMode
  initialLineFromUrl?: string | null
  initialDirFromUrl?: string | null
  initialStaFromUrl?: string | null
  initialSchedule?: NextTrainDto | null
  initialScheduleFailed?: boolean
}>

export function useHomeController({
  initialModeFromUrl = 'mtr',
  initialLineFromUrl = null,
  initialDirFromUrl = null,
  initialStaFromUrl = null,
  initialSchedule = null,
  initialScheduleFailed = false,
}: HomeControllerProps) {
  const dispatch = useDispatch()
  const router = useRouter()
  const {
    mode,
    line: selectedLine,
    station: selectedStation,
    lrRouteCode,
    lrStationId,
    lrDir,
  } = useSelector(getTrainState)
  const stationListRef = useRef<HTMLDivElement>(null)
  const lrListRef = useRef<HTMLDivElement>(null)
  const [interchangeFor, setInterchangeFor] = useState<IStation | null>(null)
  const [editing, setEditing] = useState(() =>
    initialEditing(initialModeFromUrl, initialLineFromUrl, initialStaFromUrl)
  )
  const [pickerStep, setPickerStep] = useState<'line' | 'station'>(() =>
    initialLineFromUrl && initialStaFromUrl ? 'station' : 'line'
  )
  const [lrPickerStep, setLrPickerStep] = useState<'route' | 'station'>(() =>
    initialLrPickerStep(initialModeFromUrl, initialLineFromUrl)
  )

  const stationRefs = useMemo(() => buildStationRefs(), [])

  const onFoundNearestMtr = useCallback(
    (line: ILine, station: IStation) => {
      dispatch(setMode('mtr'))
      dispatch(setLine(line))
      dispatch(setStation(station))
      dispatch(clearLrSelection())
      setEditing(false)
      setPickerStep('station')
    },
    [dispatch]
  )

  const onFoundNearestLr = useCallback(
    (station: LrStation) => {
      dispatch(setLine(null))
      dispatch(setStation(null))
      const serving = findLrRouteServing(station.id, lrRouteCode, lrDir)
      if (serving) {
        dispatch(setLrRouteCode(serving.routeCode))
        dispatch(setLrDir(serving.dir))
      }
      dispatch(setLrStationId(station.id))
      setLrPickerStep(serving ? 'station' : 'route')
      setEditing(false)
      scrollToSchedulePanel()
    },
    [dispatch, lrRouteCode, lrDir]
  )

  const { locating, locationError, getCurrLocation, setLocationError } =
    useNearestStation(mode, {
      onFoundMtr: onFoundNearestMtr,
      onFoundLr: onFoundNearestLr,
    })

  const onChangeMode = useCallback(
    (next: TransportMode) => {
      if (next === mode) return
      dispatch(setMode(next))
      setEditing(true)
      setInterchangeFor(null)
      setLocationError(null)
      dispatch(clearLrSelection())
      setPickerStep('line')
      if (next !== 'lr') return
      dispatch(setLine(null))
      dispatch(setStation(null))
      dispatch(setLrDir(1))
      setLrPickerStep('route')
      // Eager URL update so SSR props don't re-hydrate MTR before sync effect runs
      router.replace('?mode=lr', { scroll: false })
    },
    [mode, dispatch, setLocationError, router]
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
      scrollToSchedulePanel()
    },
    [dispatch]
  )

  const onSelectLrRoute = useCallback(
    (routeCode: string) => {
      dispatch(setLrRouteCode(routeCode))
      dispatch(setLrStationId(null))
      setLrPickerStep('station')
      setEditing(true)
      lrListRef.current?.scrollTo({ top: 0 })
    },
    [dispatch]
  )

  const onChangeLrDir = useCallback(
    (d: LrDir) => {
      dispatch(setLrDir(d))
      dispatch(setLrStationId(null))
      setEditing(true)
      setLrPickerStep('station')
    },
    [dispatch]
  )

  const onSelectLrStation = useCallback(
    (station: LrStation) => {
      dispatch(setLrStationId(station.id))
      setEditing(false)
      scrollToSchedulePanel()
    },
    [dispatch]
  )

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

  useHydrateSelectionFromUrl(
    initialModeFromUrl,
    initialLineFromUrl,
    initialStaFromUrl,
    initialDirFromUrl
  )

  useSyncTransportUrl(
    mode,
    lrRouteCode,
    lrStationId,
    lrDir,
    selectedLine?.code,
    selectedStation?.code
  )

  useScrollSelectedStation(
    mode,
    editing,
    selectedStation?.code,
    stationListRef,
    stationRefs
  )

  const showInterchangeOptions = useCallback((station: IStation) => {
    setInterchangeFor(station)
  }, [])

  const switchLine = useCallback(
    (lineCode: string, stationCode?: string) => {
      applyInterchangeLine(
        dispatch,
        lineCode,
        stationCode,
        interchangeFor?.code
      )
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
  const showGlance =
    (mode === 'lr' ? hasLrSelection : hasMtrSelection) && !editing
  const hasInterchange = (selectedStation?.related?.length ?? 0) > 0

  const scheduleLine = mode === 'lr' ? lrRouteCode : selectedLine?.code
  const scheduleSta = mode === 'lr' ? lrStationId : selectedStation?.code
  const scheduleForResult = scheduleMatchesSelection(
    initialSchedule,
    initialModeFromUrl,
    initialLineFromUrl,
    initialStaFromUrl,
    mode,
    scheduleLine,
    scheduleSta
  )

  const mtrScheduleFailed =
    initialScheduleFailed &&
    initialModeFromUrl === 'mtr' &&
    selectedLine?.code === initialLineFromUrl &&
    selectedStation?.code === initialStaFromUrl

  const lrScheduleFailed =
    initialScheduleFailed &&
    initialModeFromUrl === 'lr' &&
    lrStationId === initialStaFromUrl

  return {
    mode,
    locating,
    locationError,
    getCurrLocation,
    selectedLine,
    selectedStation,
    lineStations,
    stationListRef,
    stationRefs,
    pickerStep,
    setPickerStep,
    lrPickerStep,
    setLrPickerStep,
    lrRouteCode,
    lrDir,
    lrStationId,
    lrStation,
    lrStops,
    lrListRef,
    editing,
    showGlance,
    hasMtrSelection,
    hasInterchange,
    interchangeFor,
    setInterchangeFor,
    scheduleForResult,
    mtrScheduleFailed,
    lrScheduleFailed,
    onChangeMode,
    onChangeLine,
    onSelectStation,
    onSelectLrRoute,
    onChangeLrDir,
    onSelectLrStation,
    showInterchangeOptions,
    switchLine,
    startEditing,
  }
}

export type HomeController = ReturnType<typeof useHomeController>
