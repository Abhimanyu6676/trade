import store from "..";
import openAlgoClient from "../../api";
import { reduxConstant_e } from "../baseAction";
import { setStocks } from "../stocksReducer";
import { _getWorker } from "./baseSaga";
import { stocksSagaSideEffectAction } from "./stocksSagaSideEffect";

export interface stocksSagaAction_Props {
  addStocks?: Stock_i[];
  removeStocks?: Stock_i[];
  updateStocks?: Stock_i[];
}

export const [stocksSagaAction, stocksSagaWatcher] =
  _getWorker<stocksSagaAction_Props>({
    type: reduxConstant_e.SAGA_STOCKS,
    //shouldTakeLatest: true,
    callable: function* containersWorker(props) {
      console.log("stocks saga called.");

      const previousStockList: Stock_i[] = store.getState().stocks.stocksList;
      const previousStockListObj = store.getState().stocks.stocksObj;

      console.log("Current Stock Array : ", previousStockList);
      console.log("Current Stock Object : ", previousStockListObj);

      let newStockList = [...previousStockList];
      let newStockListObj = { ...previousStockListObj };

      // remove symbols
      openAlgoClient.unSubscribeLTP(props.removeStocks);
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
          /* newStockList = newStockList.filter(
            (item) => item.key_id !== stock.key_id,
          ); */
        } else {
          console.log(
            "Cannot delete as stock - ",
            stock.key_id,
            " as not present in list",
          );
        }
      });

      //add symbols
      if (props.addStocks) openAlgoClient.subscribeLTP(props.addStocks);
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
          console.log("updating stock - ", stock.key_id);
          newStockListObj[stock.key_id] = stock;
          // update element at the found index if exists
          let index = newStockList.findIndex(
            (item) => item.key_id === stock.key_id,
          );
          if (index > -1) {
            newStockList.splice(index, 1, stock);
          }
        } else {
          console.log(
            "Cannot update as stock: - ",
            stock.key_id,
            " as not present in list",
          );
        }
      });

      console.log("after mutation previous Stock Array : ", previousStockList);
      console.log(
        "after mutation previous Stock Object : ",
        previousStockListObj,
      );

      console.log("\n\n\n\n");

      console.log("after mutation Current Stock Array :: ", newStockList);
      console.log("after mutation Current Stock Object :: ", newStockListObj);

      store.dispatch(setStocks(newStockList));
      //TODO add new stockList to localStorage
      store.dispatch(stocksSagaSideEffectAction(newStockList));
    },
  });
