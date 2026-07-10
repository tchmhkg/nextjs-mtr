export type MtrLangCode = 'TC' | 'EN'

/** Raw station schedule (UP/DOWN) from the MTR open-data API. */
export interface MtrStationSchedule {
  UP?: MtrTrainRouteRow[]
  DOWN?: MtrTrainRouteRow[]
}

export interface MtrTrainRouteRow {
  seq: string
  dest: string
  plat: string
  time: string
  [key: string]: unknown
}

export interface MtrScheduleParsed {
  schedule: MtrStationSchedule | null
  isdelay: boolean
  curr_time: string | null
  alert: { message: string; url: string | null } | null
}
