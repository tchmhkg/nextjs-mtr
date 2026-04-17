'use client'

import Alert from '@components/alert'
import type { MtrNextTrainParsed } from '@lib/mtr-next-train'
import {
  getTrainState,
  ILine,
  setLine,
  setStation,
} from '@store/slices/trainSlice'
import { useDispatch, useSelector } from '@store/store'
import type { MessageKey } from '@i18n/message-key'
import { DATA, ILineStation } from '@utils/next-train-data'
import _ from 'lodash'
import { useLocale, useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import CurrLocation from './curr-location'
import {
  Container,
  Header,
  Heading,
  Left,
  LineColor,
  LineOption,
  RelatedLine,
  RelatedLineWrapper,
  Right,
  SelectorWrapper,
  ShowMoreButton,
  StationOption,
} from './home.style'

type Language = 'en' | 'tc'

const getLanguage = (lang: string): Language => {
  return lang === 'tc' ? 'tc' : 'en'
}
import Result from './train/result'

type HomeProps = {
  heading?: string
  initialLineFromUrl?: string | null
  initialStaFromUrl?: string | null
  initialSchedule?: MtrNextTrainParsed | null
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
  const rightListRef = useRef<HTMLDivElement>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [showRelated, setShowRelated] = useState(false)
  const refs = React.useMemo(() => DATA.reduce((stationRef: Record<string, React.RefObject<HTMLDivElement | null>>, value) => {
    for (const station of value.stations) {
      stationRef[station.code] = React.createRef<HTMLDivElement | null>()
    }
    return stationRef
  }, {} as Record<string, React.RefObject<HTMLDivElement | null>>), [])

  const onChangeLine = useCallback(
    (line: ILine) => {
      if (line.code === selectedLine?.code) return
      dispatch(setLine(line))
      dispatch(setStation(null))
      rightListRef?.current?.scrollTo({ top: 0 })
    },
    [selectedLine, dispatch]
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
    // Error handled by component - could show user notification here
  }, [])

  const getCurrLocation = useCallback(() => {
    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,
    }
    navigator.geolocation.getCurrentPosition(
      getPositionSuccess,
      getPositionError,
      options
    )
  }, [getPositionError, getPositionSuccess])

  const scrollToStation = useCallback(() => {
    if (!selectedStation?.code) return
    refs[selectedStation.code]?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [selectedStation, refs])

  useEffect(() => {
    if (initialLineFromUrl && initialStaFromUrl) return
    getCurrLocation()
  }, [getCurrLocation, initialLineFromUrl, initialStaFromUrl])

  useLayoutEffect(() => {
    if (!initialLineFromUrl || !initialStaFromUrl) return
    const lineData = DATA.find((s) => s.line.code === initialLineFromUrl)
    const line = lineData?.line
    const station = lineData?.stations?.find((s) => s.code === initialStaFromUrl)
    if (line && station) {
      dispatch(setLine(line))
      dispatch(setStation(station))
    }
  }, [dispatch, initialLineFromUrl, initialStaFromUrl])

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

  const showMoreOptions = useCallback(() => {
    setShowRelated(true)
  }, [])

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
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        showMoreOptions()
      }
    },
    [showMoreOptions]
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
        />
      </Header>
      <SelectorWrapper role="tabpanel" aria-label={t('Train line and station selection')}>
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
        <Right
          ref={rightListRef}
          $bgColor={filterStations()?.line?.color || undefined}
          role="tabpanel"
          aria-label={`${selectedLine ? selectedLine.label[getLanguage(locale)] : ''} ${t('stations')}`}
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
                  {!_.isEmpty(s.related) && (
                    <ShowMoreButton
                      className="more-option"
                      onClick={showMoreOptions}
                      onKeyDown={handleKeyDownShowMore}
                      aria-label={`${t('Show interchange options for')} ${s.label[getLanguage(locale)]}`}
                      role="button"
                      tabIndex={0}
                    >
                      {'>'}
                    </ShowMoreButton>
                  )}
                </div>
              </StationOption>
            )
          })}
        </Right>
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
