'use client'

import type { MessageKey } from '@i18n/message-key'
import type { TransportMode } from '@lib/schedules/contracts/transport-mode'
import { calcDistanceKm } from '@utils/geo'
import type { LrStation } from '@utils/lr-data'
import { LR_STATIONS } from '@utils/lr-data'
import type { ILine, IStation } from '@utils/next-train-data'
import { DATA } from '@utils/next-train-data'
import { useCallback, useState } from 'react'

type NearestHandlers = {
  onFoundMtr: (line: ILine, station: IStation) => void
  onFoundLr: (station: LrStation) => void
}

function findNearestMtr(lat: number, lng: number): {
  line: ILine
  station: IStation
} | null {
  let closestStation: IStation | null = null
  let closestLine: ILine | null = null
  let closestDistance: number | null = null

  for (const lineStation of DATA) {
    for (const station of lineStation.stations) {
      const distance = calcDistanceKm(
        lat,
        lng,
        station.location.lat,
        station.location.lng
      )
      if (
        !closestStation ||
        closestDistance === null ||
        distance < closestDistance
      ) {
        closestDistance = distance
        closestLine = lineStation.line
        closestStation = station
      }
    }
  }
  return closestLine && closestStation
    ? { line: closestLine, station: closestStation }
    : null
}

function findNearestLr(lat: number, lng: number): LrStation | null {
  let closest: LrStation | null = null
  let closestDistance: number | null = null
  for (const station of LR_STATIONS) {
    const distance = calcDistanceKm(
      lat,
      lng,
      station.location.lat,
      station.location.lng
    )
    if (!closest || closestDistance === null || distance < closestDistance) {
      closestDistance = distance
      closest = station
    }
  }
  return closest
}

export function useNearestStation(
  mode: TransportMode,
  { onFoundMtr, onFoundLr }: NearestHandlers
) {
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<MessageKey | null>(null)

  const findNearest = useCallback(
    (lat: number, lng: number) => {
      if (mode === 'lr') {
        const station = findNearestLr(lat, lng)
        if (station) onFoundLr(station)
        return
      }
      const hit = findNearestMtr(lat, lng)
      if (hit) onFoundMtr(hit.line, hit.station)
    },
    [mode, onFoundMtr, onFoundLr]
  )

  const getCurrLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Location unavailable')
      return
    }
    setLocationError(null)
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        findNearest(pos.coords.latitude, pos.coords.longitude)
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied'
            : 'Location unavailable'
        )
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    )
  }, [findNearest])

  return { locating, locationError, getCurrLocation, setLocationError }
}
