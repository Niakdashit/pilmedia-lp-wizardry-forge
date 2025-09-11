// @ts-nocheck
// Redux app slice for TemplatedQuiz component

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebar: {
    isOpen: true,
    activeTab: 'design'
  }
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSidebar: (state, action) => {
      state.sidebar = { ...state.sidebar, ...action.payload };
    }
  }
});

export const { setSidebar } = appSlice.actions;
export default appSlice.reducer;
