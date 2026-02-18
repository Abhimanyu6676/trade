import { call, takeEvery, takeLatest } from "redux-saga/effects";
import { _baseAction_t, _baseAction_Props } from "../baseRedux";
import { reduxConstant_e } from "../baseAction";

interface _getWorker_i<T> {
  type: reduxConstant_e;
  callable: (props: T) => any;
  shouldTakeLatest?: boolean;
}
/**
 * @param type redux action type
 * @param callable generator function to be called upon action is dispatched
 * @optional `shouldTakeLatest` tale latest if true, `default false`, take Every in default case
 *
 * @returns [sagaAction , sagaWatcher]
 *  - `actionCaller` action caller for particular watcher
 *  - `watcher` yet to be registered saga watcher
 */
export const _getWorker: <R>(
  _props: _getWorker_i<R>,
) => [_baseAction_t<R>, any] = <R>(_props: _getWorker_i<R>) => {
  //console.log("[GET WORKER]")

  //TODO add try/catch block around `callable`
  const worker = function* _baseWorker(props: _baseAction_Props<R>) {
    //console.log("[BASE WORKER] >> " + JSON.stringify(props));
    if (props?.props) yield call(_props.callable, props.props);
  };

  let sagaWatcher;
  if (_props.shouldTakeLatest)
    sagaWatcher = function* _baseWatcher() {
      //console.log("[BASE WATCHER] takeLatest")
      //@ts-ignore
      yield takeLatest(_props.type, worker);
    };
  else
    sagaWatcher = function* _baseWatcher() {
      //console.log("[BASE WORKER] takeEvery")
      //@ts-ignore
      yield takeEvery(_props.type, worker);
    };

  return [
    /** action */
    (actionProps) => {
      return {
        type: _props.type,
        props: actionProps,
      } as const;
    },
    /** saga worker watcher as function */
    sagaWatcher,
  ];
};

export const sagaDelay = (ms: number) =>
  new Promise((res) => setTimeout(res, ms));
