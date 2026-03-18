import { createSlice } from "@reduxjs/toolkit";

interface authReducerInitialState_i {
  isAuthenticated: boolean;
  user: user_i | null;
  loading: boolean;
}

const initialState: authReducerInitialState_i = {
  isAuthenticated: false,
  user: null,
  loading: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (
      state,
      action: {
        type: string;
        payload: Partial<Omit<authReducerInitialState_i, "isAuthenticated">>;
      },
    ) => {
      let newState = { ...state };
      if (action.payload.user !== undefined) {
        newState.isAuthenticated = !!action.payload.user;
        newState.user = action.payload.user;
      }
      if (action.payload.loading !== undefined)
        newState.loading = action.payload.loading;
      return newState;
    },
  },
});

export const { setAuthState } = authSlice.actions;

export default authSlice.reducer;
