import store from "..";
import { reduxConstant_e } from "../baseAction";
import { _addUpdateStocks, _setStocks } from "../stocksReducer";
import { _getWorker } from "./baseSaga";
import { stocksSagaSideEffectAction } from "./stocksSagaSideEffect";

export interface stocksSagaAction_Props {
  /** @param stocks (STOCK.all[]) */
  stocks?: STOCK.all[];
  addStocks?: STOCK.all[];
  updateStocks?: STOCK.all[];
  /** @deprecated */
  removeStocks?: STOCK.all[];
}

export const [stocksSagaAction, stocksSagaWatcher] = _getWorker<stocksSagaAction_Props>({
  type: reduxConstant_e.SAGA_STOCKS,
  //shouldTakeLatest: true,
  callable: function* containersWorker(props) {
    if (props.stocks) {
      store.dispatch(_setStocks(props.stocks));
      store.dispatch(stocksSagaSideEffectAction({ stocks: props.stocks }));
    } else if (props.addStocks) {
      store.dispatch(_addUpdateStocks(props.addStocks));
      store.dispatch(stocksSagaSideEffectAction({ stocks: props.addStocks }));
    } else if (props.updateStocks) {
      store.dispatch(_addUpdateStocks(props.updateStocks));
      store.dispatch(stocksSagaSideEffectAction({ stocks: props.updateStocks }));
    }
  },
});
