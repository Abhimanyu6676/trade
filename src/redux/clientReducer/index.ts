import { createSlice } from "@reduxjs/toolkit";

interface clientReducerInitialState_i {
  client1Connected?: boolean;
  client1Authenticated?: boolean;
  client1WebSocketConnected?: boolean;
  client1WebSocketAuthenticated?: boolean;
  client1AnalyzerMode?: boolean;

  client2Connected?: boolean;
  client2Authenticated?: boolean;
  client2WebSocketConnected?: boolean;
  client2WebSocketAuthenticated?: boolean;
  client2AnalyzerMode?: boolean;
}

const initialState: clientReducerInitialState_i = {
  client1Connected: false,
  client1Authenticated: false,
  client1WebSocketConnected: false,
  client1WebSocketAuthenticated: false,
  client1AnalyzerMode: false,

  client2Connected: false,
  client2Authenticated: false,
  client2WebSocketConnected: false,
  client2WebSocketAuthenticated: false,
  client2AnalyzerMode: false,
};

export const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    updateClientState: (
      state,
      action: {
        type: string;
        payload: clientReducerInitialState_i;
      },
    ) => {
      let newState = { ...state };
      if (action.payload.client1Connected != undefined)
        newState.client1Connected = action.payload.client1Connected;

      if (action.payload.client1Authenticated != undefined)
        newState.client1Authenticated = action.payload.client1Authenticated;

      if (action.payload.client1WebSocketConnected != undefined)
        newState.client1WebSocketConnected =
          action.payload.client1WebSocketConnected;

      if (action.payload.client1WebSocketAuthenticated != undefined)
        newState.client1WebSocketAuthenticated =
          action.payload.client1WebSocketAuthenticated;

      if (action.payload.client1AnalyzerMode != undefined)
        newState.client1AnalyzerMode = action.payload.client1AnalyzerMode;

      // client 2 update actions

      if (action.payload.client2Connected != undefined)
        newState.client2Connected = action.payload.client2Connected;

      if (action.payload.client2Authenticated != undefined)
        newState.client2Authenticated = action.payload.client2Authenticated;

      if (action.payload.client2WebSocketConnected != undefined)
        newState.client2WebSocketConnected =
          action.payload.client2WebSocketConnected;

      if (action.payload.client2WebSocketAuthenticated != undefined)
        newState.client2WebSocketAuthenticated =
          action.payload.client2WebSocketAuthenticated;

      if (action.payload.client2AnalyzerMode != undefined)
        newState.client2AnalyzerMode = action.payload.client2AnalyzerMode;

      return newState;
    },
  },
});

export const { updateClientState } = clientSlice.actions;

export default clientSlice.reducer;
