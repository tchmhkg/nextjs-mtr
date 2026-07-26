export type EalTimeType = 'A' | 'D'

export interface TrainRouteRow {
  seq: string
  dest: string
  /** Display label when dest is not an i18n MessageKey (e.g. Light Rail). */
  destLabel?: string
  plat: string
  time: string
  /** EAL / LR: Arrival or Departure */
  timeType?: EalTimeType | null
  /** EAL via Racecourse, or LR route_no */
  route?: string | null
  /** Relative ETA (LR); skip wall-clock duration when true. */
  relativeEta?: boolean
  trainLength?: number | null
}

export interface NextTrainAlert {
  message: string
  url: string | null
}

export interface NextTrainPlatform {
  id: string
  trains: TrainRouteRow[]
  /** Light Rail: platform service has ended for today. */
  endService?: boolean
}

export interface NextTrainDto {
  up: TrainRouteRow[] | null
  down: TrainRouteRow[] | null
  /** Light Rail: trains grouped by platform. */
  platforms?: NextTrainPlatform[] | null
  /** Light Rail: deduped route remarks for the station. */
  remarks?: string[] | null
  isDelayed: boolean
  lastUpdated: string | null
  sysTime: string | null
  alert: NextTrainAlert | null
}
