export type MtrLangCode = 'TC' | 'EN'

/** Raw station schedule (UP/DOWN) from the MTR open-data API. */
export interface MtrStationSchedule {
  UP?: MtrTrainRouteRow[]
  DOWN?: MtrTrainRouteRow[]
  curr_time?: string
  sys_time?: string
}

export interface MtrTrainRouteRow {
  seq: string
  dest: string
  plat: string
  time: string
  ttnt?: string
  valid?: string
  source?: string
  /** EAL only */
  timetype?: string
  /** EAL only: `""` or `"RAC"` */
  route?: string
}

export interface MtrScheduleParsed {
  schedule: MtrStationSchedule | null
  isdelay: boolean
  curr_time: string | null
  sys_time: string | null
  alert: { message: string; url: string | null } | null
}
