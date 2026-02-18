import { reduxConstant_e } from "../baseAction";
import { _getWorker } from "./baseSaga";

export interface testSagaAction_Props {
  text: string;
}

export const [testSagaAction, testSagaWatcher] =
  _getWorker<testSagaAction_Props>({
    type: reduxConstant_e.SAGA_TEST,
    //shouldTakeLatest: true,
    callable: function* containersWorker({ text }) {
      console.log("text in device saga is ", text);
    },
  });
