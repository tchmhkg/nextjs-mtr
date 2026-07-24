export type EalTimeType = 'A' | 'D'

export interface TrainRouteRow {
  seq: string
  dest: string
  plat: string
  time: string
  /** EAL only: Arrival or Departure */
  timeType?: EalTimeType | null
  /** EAL only: via Racecourse when `"RAC"` */
  route?: string | null
}

export interface NextTrainAlert {
  message: string
  url: string | null
}

export interface NextTrainDto {
  up: TrainRouteRow[] | null
  down: TrainRouteRow[] | null
  isDelayed: boolean
  lastUpdated: string | null
  sysTime: string | null
  alert: NextTrainAlert | null
}
