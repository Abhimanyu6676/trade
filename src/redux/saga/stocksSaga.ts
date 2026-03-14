import store from "..";
import { reduxConstant_e } from "../baseAction";
import { _setStocks } from "../stocksReducer";
import { _getWorker } from "./baseSaga";
import { stocksSagaSideEffectAction } from "./stocksSagaSideEffect";

export interface stocksSagaAction_Props {
  /** @deprecated */
  addStocks?: Stock_i[];
  /** @deprecated */
  removeStocks?: Stock_i[];
  /** @deprecated */
  updateStocks?: Stock_i[];
  /** @param stocks (Stock_i[]) */
  stocks?: Stock_i[];
}

export const [stocksSagaAction, stocksSagaWatcher] =
  _getWorker<stocksSagaAction_Props>({
    type: reduxConstant_e.SAGA_STOCKS,
    //shouldTakeLatest: true,
    callable: function* containersWorker(props) {
      //console.log("stocks saga called.");

      const previousStockList = store.getState().stocks.stocksList;

      //console.log("Current Stock Array : ", previousStockList);
      //console.log("Current Stock Object : ", previousStockListObj);

      let newStockList = [...previousStockList];

      // update stocks in state
      if (props.stocks) {
        props.stocks.forEach((stock) => {
          let indexInPresentList = newStockList.findIndex(
            (s) => s.key_id === stock.key_id,
          );
          if (indexInPresentList > -1) {
            newStockList[indexInPresentList] = stock;
          } else {
            newStockList.push(stock);
          }
        });
      }
      //remove stocks from state that are not present in new list
      newStockList.forEach((stock, index) => {
        if (props.stocks?.findIndex((s) => s.key_id === stock.key_id) === -1) {
          newStockList.splice(index, 1);
        }
      });

      console.log("after mutation Current Stock Array :: ", newStockList);

      store.dispatch(_setStocks(newStockList));
      store.dispatch(stocksSagaSideEffectAction(newStockList));
    },
  });
