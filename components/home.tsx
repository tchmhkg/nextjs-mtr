'use client'

import Alert from '@components/alert'
import { useRouter } from '@i18n/navigation'
import type { MessageKey } from '@i18n/message-key'
import type { NextTrainDto } from '@lib/schedules/contracts/next-train.dto'
import {
  getTrainState,
  ILine,
  IStation,
  setLine,
  setStation,
} from '@store/slices/trainSlice'
import { useDispatch, useSelector } from '@store/store'
import { DATA, ILineStation } from '@utils/next-train-data'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import CurrLocation from './curr-location'
import {
  Container,
  Header,
  Heading,
  Left,
  LineColor,
  LineOption,
  LocationMessage,
  MobileBackButton,
  PickerPanel,
  PickerRow,
  RelatedLine,
  RelatedLineWrapper,
  Right,
  SelectorWrapper,
  ShowMoreButton,
  StationOption,
} from './home.style'
import Result from './train/result'

type Language = 'en' | 'tc'

const getLanguage = (lang: string): Language => {
  return lang === 'tc' ? 'tc' : 'en'
}

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
  const rightListRef = useRef<HTMLDivElement>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<MessageKey | null>(null)
  const [showRelated, setShowRelated] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [pickerStep, setPickerStep] = useState<'line' | 'station'>('line')
  const refs = React.useMemo(() => DATA.reduce((stationRef: Record<string, React.RefObject<HTMLDivElement | null>>, value) => {
    for (const station of value.stations) {
      stationRef[station.code] = React.createRef<HTMLDivElement | null>()
    }
    return stationRef
  }, {} as Record<string, React.RefObject<HTMLDivElement | null>>), [])

  const onChangeLine = useCallback(
    (line: ILine) => {
      if (line.code === selectedLine?.code) {
        if (isMobile) setPickerStep('station')
        return
      }
      dispatch(setLine(line))
      dispatch(setStation(null))
      rightListRef?.current?.scrollTo({ top: 0 })
      if (isMobile) setPickerStep('station')
    },
    [selectedLine, dispatch, isMobile]
  )
  const filterStations = useCallback((): ILineStation | undefined => {
    if (!selectedLine?.code) return undefined
    return DATA.find((s) => s.line.code === selectedLine.code)
  }, [selectedLine])

  const calcDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number, unit: string) => {
      const radLat1 = (Math.PI * lat1) / 180
      const radLat2 = (Math.PI * lat2) / 180
      const theta = lon1 - lon2
      const radTheta = (Math.PI * theta) / 180
      let dist =
        Math.sin(radLat1) * Math.sin(radLat2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta)
      if (dist > 1) {
        dist = 1
      }
      dist = Math.acos(dist)
      dist = (dist * 180) / Math.PI
      dist = dist * 60 * 1.1515
      if (unit == 'K') {
        dist = dist * 1.609344
      }
      if (unit == 'N') {
        dist = dist * 0.8684
      }
      return dist
    },
    []
  )

  const findNearestStation = useCallback(
    (lat: number, lng: number) => {
      if (!lat || !lng) return
      let closestStation = null
      let closestLine: ILine | null = null
      let closestDistance: number | null = null

      for (const lineStation of DATA) {
        for (const station of lineStation.stations) {
          const distance = calcDistance(
            lat,
            lng,
            station.location.lat,
            station.location.lng,
            'K'
          )
          if (!closestStation || closestDistance === null || distance < closestDistance) {
            closestDistance = distance
            closestLine = lineStation.line
            closestStation = station
          }
        }
      }
      if (closestLine && closestStation) {
        dispatch(setLine(closestLine))
        dispatch(setStation(closestStation))
        setGettingLocation(true)
      }
    },
    [calcDistance, dispatch]
  )

  const getPositionSuccess = useCallback(
    (pos: { coords: { latitude: number; longitude: number } }) => {
      const crd = pos.coords
      findNearestStation(crd.latitude, crd.longitude)
    },
    [findNearestStation]
  )

  const getPositionError = useCallback((err: GeolocationPositionError) => {
    setLocating(false)
    setLocationError(
      err.code === err.PERMISSION_DENIED
        ? 'Location permission denied'
        : 'Location unavailable'
    )
  }, [])

  const getCurrLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Location unavailable')
      return
    }
    setLocationError(null)
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        getPositionSuccess(pos)
        setLocating(false)
      },
      getPositionError,
      { enableHighAccuracy: true, maximumAge: 0 }
    )
  }, [getPositionError, getPositionSuccess])

  const scrollToStation = useCallback(() => {
    if (!selectedStation?.code) return
    refs[selectedStation.code]?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [selectedStation, refs])

  useLayoutEffect(() => {
    if (!initialLineFromUrl || !initialStaFromUrl) return
    const lineData = DATA.find((s) => s.line.code === initialLineFromUrl)
    const line = lineData?.line
    const station = lineData?.stations?.find((s) => s.code === initialStaFromUrl)
    if (line && station) {
      dispatch(setLine(line))
      dispatch(setStation(station))
      setPickerStep('station')
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
    if (gettingLocation) {
      scrollToStation()
      queueMicrotask(() => setGettingLocation(false))
    }
  }, [selectedStation, gettingLocation, scrollToStation])

  useEffect(() => {
    if (selectedStation?.code) {
      scrollToStation()
    }
  }, [selectedLine, selectedStation, scrollToStation])

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
          if (station) {
            dispatch(setStation(station))
          }
        }
      }
      setShowRelated(false)
    },
    [dispatch]
  )

  const onCloseAlert = useCallback(() => {
    setShowRelated(false)
  }, [])

  const handleKeyDownShowMore = useCallback(
    (e: React.KeyboardEvent, station: IStation) => {
      if (e.key === 'Enter') {
        e.stopPropagation()
        showInterchangeOptions(station)
      }
    },
    [showInterchangeOptions]
  )

  const scheduleForResult =
    initialSchedule &&
      initialLineFromUrl &&
      initialStaFromUrl &&
      selectedLine?.code === initialLineFromUrl &&
      selectedStation?.code === initialStaFromUrl
      ? initialSchedule
      : undefined

  return (
    <Container>
      <Header>
        <Heading>{heading}</Heading>
        <CurrLocation
          onClick={getCurrLocation}
          aria-label={t('Find nearest station')}
          busy={locating}
        />
      </Header>
      {locationError ? (
        <LocationMessage role="alert">{t(locationError)}</LocationMessage>
      ) : null}
      <SelectorWrapper role="tabpanel" aria-label={t('Train line and station selection')}>
        {isMobile && pickerStep === 'station' && selectedLine ? (
          <MobileBackButton
            type="button"
            onClick={() => setPickerStep('line')}
            aria-label={t('Select a line')}
          >
            ← {t('Select a line')}
          </MobileBackButton>
        ) : null}
        <PickerRow>
          {(!isMobile || pickerStep === 'line') && (
            <PickerPanel>
              <Left role="tablist" aria-label={t('Select train line')}>
              {DATA.map((l) => (
                <LineOption
                  key={l.line.code}
                  onClick={() => onChangeLine(l.line)}
                  $selected={l.line.code === selectedLine?.code}
                  $color={l.line.color}
                  role="tab"
                  aria-selected={l.line.code === selectedLine?.code}
                  aria-label={`${t('Select')} ${l.line.label[getLanguage(locale)]}`}
                  tabIndex={l.line.code === selectedLine?.code ? 0 : -1}
                >
                  <LineColor $color={l.line.color} aria-hidden="true" />
                  <div className="option-name">{l.line.label[getLanguage(locale)]}</div>
                </LineOption>
              ))}
            </Left>
          </PickerPanel>
          )}
          {(!isMobile || pickerStep === 'station') && selectedLine ? (
            <PickerPanel>
              <Right
              ref={rightListRef}
              $bgColor={filterStations()?.line?.color || undefined}
              role="tabpanel"
              aria-label={`${selectedLine.label[getLanguage(locale)]} ${t('stations')}`}
            >
              {filterStations()?.stations?.map((s) => {
                return (
                  <StationOption
                    ref={refs[s.code]}
                    key={s.code}
                    onClick={() => dispatch(setStation(s))}
                    $selected={s.code === selectedStation?.code}
                    role="button"
                    tabIndex={0}
                    aria-label={`${t('Select station')} ${s.label[getLanguage(locale)]}`}
                  >
                    <div className="option-name station">
                      {s.label[getLanguage(locale)]}
                      {(s.related?.length ?? 0) > 0 && (
                        <ShowMoreButton
                          className="more-option"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            showInterchangeOptions(s)
                          }}
                          onKeyDown={(e) => handleKeyDownShowMore(e, s)}
                          aria-label={`${t('Show interchange options for')} ${s.label[getLanguage(locale)]}`}
                        >
                          {'>'}
                        </ShowMoreButton>
                      )}
                    </div>
                  </StationOption>
                )
              })}
            </Right>
          </PickerPanel>
          ) : null}
        </PickerRow>
      </SelectorWrapper>
      {selectedLine?.code && selectedStation?.code && (
        <Result
          line={selectedLine.code}
          sta={selectedStation.code}
          initialSchedule={scheduleForResult}
        />
      )}
      {showRelated && selectedStation && (
        <Alert onPressClose={onCloseAlert}>
          <RelatedLineWrapper>
            {selectedStation.related?.map((rStation) => (
              <RelatedLine
                key={rStation.lineCode}
                type="button"
                $lineColor={rStation.color}
                onClick={() =>
                  switchLine(rStation.lineCode, rStation.stationCode)
                }
              >
                {t(rStation.lineCode as MessageKey)}
              </RelatedLine>
            ))}
          </RelatedLineWrapper>
        </Alert>
      )}
    </Container>
  )
}
export default React.memo(Home)
