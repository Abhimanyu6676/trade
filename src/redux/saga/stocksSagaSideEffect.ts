import { storeLocalData } from "../../util/localStorage";
import { reduxConstant_e } from "../baseAction";
import { _getWorker } from "./baseSaga";

export type stocksSagaSideEffectAction_Props = Stock_i[];

export const [stocksSagaSideEffectAction, stocksSagaSideEffectWatcher] =
  _getWorker<stocksSagaSideEffectAction_Props>({
    type: reduxConstant_e.SAGA_STOCKS_SIDE_EFFECT,
    //shouldTakeLatest: true,
    callable: function* containersWorker(stocksList) {
      //console.log( "Stocks Saga SideEffect Called with stocksList : ", stocksList,);
      (async () => {
        storeLocalData("stocksList", stocksList);
      })();
    },
  });
