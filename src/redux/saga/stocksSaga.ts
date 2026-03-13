import store from "..";
import { reduxConstant_e } from "../baseAction";
import { setStocks } from "../stocksReducer";
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

      console.log("\n\n\n\n");

      console.log("after mutation Current Stock Array :: ", newStockList);

      store.dispatch(setStocks(newStockList));
      store.dispatch(stocksSagaSideEffectAction(newStockList));
    },
  });

/* 
    // remove symbols
  props.removeStocks?.forEach((stock) => {
    if (newStockListObj[stock.key_id]) {
      console.log("removing stock - ", stock.key_id);
      // Remove  element from Object
      delete newStockListObj[stock.key_id];
      // Remove element at the found index
      let index = newStockList.findIndex(
        (item) => item.key_id === stock.key_id,
      );
      if (index > -1) {
        newStockList.splice(index, 1);
      }
    
    } else {
      console.log(
        "Cannot delete as stock - ",
        stock.key_id,
        " as not present in list",
      );
    }
  });

  //add symbols
  props.addStocks?.forEach((stock) => {
    if (!newStockListObj[stock.key_id]) {
      console.log("adding stock - ", stock.key_id);
      // add element from Object
      newStockListObj[stock.key_id] = stock;
      // add element or replace at the found index
      let index = newStockList.findIndex(
        (item) => item.key_id === stock.key_id,
      );
      if (index > -1) {
        newStockList.splice(index, 1, stock);
      } else {
        newStockList.push(stock);
      }
    } else {
      console.log("Stock - ", stock.key_id, " already Present");
    }
  });

  //update symbols
  props.updateStocks?.forEach((stock) => {
    // update element from Object if exists
    if (newStockListObj[stock.key_id]) {
      //console.log("updating stock - ", stock.key_id);
      newStockListObj[stock.key_id] = stock;
      // update element at the found index if exists
      let index = newStockList.findIndex(
        (item) => item.key_id === stock.key_id,
      );
      if (index > -1) {
        newStockList[index] = { ...newStockList[index], ...stock };
      }
    } else {
      console.log(
        "Cannot update as stock: - ",
        stock.key_id,
        " as not present in list",
      );
    }
  });*/
