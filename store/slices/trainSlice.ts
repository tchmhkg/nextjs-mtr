import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'

export interface TrainState {
  line: string
  station: string
}

/**
 * Default state object with initial values.
 */
const initialState: TrainState = {
  line: '',
  station: '',
} as const

/**
 * Create a slice as a reducer containing actions.
 *
 * In this example actions are included in the slice. It is fine and can be
 * changed based on your needs.
 */
export const trainSlice = createSlice({
  name: 'train',
  initialState,
  reducers: {
    setLine: (
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.line>
    ) => {
      state.line = action.payload
    },
    setStation: (
      state: Draft<typeof initialState>,
      action: PayloadAction<typeof initialState.station>
    ) => {
      state.station = action.payload
    },
  },
})

// A small helper of train state for `useSelector` function.
export const getTrainState = (state: { train: TrainState }) => state.train

// Exports all actions
export const { setLine, setStation } = trainSlice.actions

export default trainSlice.reducer