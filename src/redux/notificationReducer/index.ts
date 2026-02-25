import { createSlice } from "@reduxjs/toolkit";

/**
 * @param timeout in seconds
 */
export interface notification_i {
  id: string;
  heading: string;
  variant?: "notify" | "success" | "warning" | "error";
  text?: string;
  /** timeout in seconds [could be 0.25]*/
  timeout?: number;
}

const initialState: notification_i[] = [];

export const notificationSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    addNotification: (
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
    removeNotification: (
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

export const { addNotification, removeNotification } =
  notificationSlice.actions;

export default notificationSlice.reducer;
