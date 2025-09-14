// @ts-nocheck
// Redux canvas slice for TemplatedQuiz component

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  zoom: 1,
  panX: 0,
  panY: 0
};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setZoom: (state, action) => {
      state.zoom = action.payload;
    },
    setPan: (state, action) => {
      state.panX = action.payload.x;
      state.panY = action.payload.y;
    }
  }
});

export const { setZoom, setPan } = canvasSlice.actions;
export default canvasSlice.reducer;
