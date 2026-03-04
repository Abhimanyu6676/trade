import { createSlice } from "@reduxjs/toolkit";

const initialState: notification_i[] = [];

export const notificationSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    _addNotification: (
      state,
      action: {
        type: string;
        payload: notification_i;
      },
    ) => {
      let newState = [...state];
      newState.push(action.payload);
      return newState;
    },
    /** @param id [string] notification to remove */
    _removeNotification: (
      state,
      action: {
        type: string;
        payload: string;
      },
    ) => {
      let newState = [...state];
      let index = newState.findIndex((item) => item.id === action.payload);
      if (index > -1) newState.splice(index, 1);
      return newState;
    },
  },
});

export const { _addNotification, _removeNotification } =
  notificationSlice.actions;

export default notificationSlice.reducer;
