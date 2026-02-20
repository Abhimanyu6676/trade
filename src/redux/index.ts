import { configureStore } from "@reduxjs/toolkit";
import countReducer from "./countReducer";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./saga";
import stocksReducer from "./stocksReducer";
import clientReducer from "./clientReducer";

const sagaMiddleware = createSagaMiddleware();
const middleware = [sagaMiddleware];

const store = configureStore({
  reducer: {
    counter: countReducer,
    stocks: stocksReducer,
    client: clientReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: [
          "props.log",
          "payload.log",
          "props.onActionComplete",
        ],
      },
    }).concat(middleware),
});

sagaMiddleware.run(rootSaga);

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
