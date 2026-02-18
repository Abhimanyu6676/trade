import { all } from "redux-saga/effects";
import { testSagaWatcher } from "./testSaga";
import { stocksSagaWatcher } from "./stocksSaga";
import { stocksSagaSideEffectWatcher } from "./stocksSagaSideEffect";

export default function* rootSaga() {
  yield all([
    testSagaWatcher(),
    stocksSagaWatcher(),
    stocksSagaSideEffectWatcher(),
  ]);
}
