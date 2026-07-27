import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'
import type { TransportMode } from '@lib/schedules/contracts/transport-mode'
import type { ILine, IStation } from '@utils/next-train-data'

export type { ILine, IStation, IRelatedLine } from '@utils/next-train-data'

export type LrDir = 1 | 2

export interface TrainState {
  mode: TransportMode
  line: ILine | null
  station: IStation | null
  lrRouteCode: string | null
  lrStationId: string | null
  lrDir: LrDir
}

const initialState: TrainState = {
  mode: 'mtr',
  line: null,
  station: null,
  lrRouteCode: null,
  lrStationId: null,
  lrDir: 1,
}

export const trainSlice = createSlice({
  name: 'train',
  initialState,
  reducers: {
    setMode: (
      state: Draft<TrainState>,
      action: PayloadAction<TransportMode>
    ) => {
      state.mode = action.payload
    },
    setLine: (
      state: Draft<TrainState>,
      action: PayloadAction<TrainState['line']>
    ) => {
      state.line = action.payload
    },
    setStation: (
      state: Draft<TrainState>,
      action: PayloadAction<TrainState['station']>
    ) => {
      state.station = action.payload
    },
    setLrRouteCode: (
      state: Draft<TrainState>,
      action: PayloadAction<string | null>
    ) => {
      state.lrRouteCode = action.payload
    },
    setLrStationId: (
      state: Draft<TrainState>,
      action: PayloadAction<string | null>
    ) => {
      state.lrStationId = action.payload
    },
    setLrDir: (state: Draft<TrainState>, action: PayloadAction<LrDir>) => {
      state.lrDir = action.payload
    },
    clearLrSelection: (state: Draft<TrainState>) => {
      state.lrRouteCode = null
      state.lrStationId = null
    },
    hydrateFromUrl: (
      state: Draft<TrainState>,
      action: PayloadAction<{
        mode: TransportMode
        line?: ILine | null
        station?: IStation | null
        lrRouteCode?: string | null
        lrStationId?: string | null
        lrDir?: LrDir
      }>
    ) => {
      const p = action.payload
      state.mode = p.mode
      if (p.line !== undefined) state.line = p.line
      if (p.station !== undefined) state.station = p.station
      if (p.lrRouteCode !== undefined) state.lrRouteCode = p.lrRouteCode
      if (p.lrStationId !== undefined) state.lrStationId = p.lrStationId
      if (p.lrDir !== undefined) state.lrDir = p.lrDir
    },
  },
})

export const getTrainState = (state: { train: TrainState }) => state.train

export const {
  setMode,
  setLine,
  setStation,
  setLrRouteCode,
  setLrStationId,
  setLrDir,
  clearLrSelection,
  hydrateFromUrl,
} = trainSlice.actions

export default trainSlice.reducer
