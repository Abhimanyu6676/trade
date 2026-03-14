import { createSlice } from "@reduxjs/toolkit";

interface stocksSplice_i {
  stocksList: Stock_i[];
  stocksObj: StocksListObject_i;
}

const initialState: stocksSplice_i = {
  stocksList: [],
  stocksObj: {},
};

/**
 * this reducer actions only to be used in stockSaga which will handle setting new state
 * entirely or just adding or removing specified fields
 */
export const stocksSlice = createSlice({
  name: "stocks",
  initialState,
  reducers: {
    /**
     * @note only to be used in stockSaga
     *
     * @description sets the stock list as new array and new stockListObj entirely with new references
     *
     * @returns entirely new state object with previous state items also but as a new reference
     */
    _setStocks: (
      state,
      action: {
        type: string;
        payload: Stock_i[];
      },
    ) => {
      //console.log("current State:", state);
      //console.log("Setting stocks:", action);
      let newStocksList: Stock_i[] = [];
      let newStocksListObj: StocksListObject_i = {};

      action.payload.forEach((stock, stockIndex) => {
        newStocksList.push(stock);
        newStocksListObj[stock.key_id] = stock;
      });
      return {
        ...state,
        stocksList: action.payload,
        stocksObj: newStocksListObj,
      };
    },
    /**
     * @note only to be used in stockSaga which defines which command came and forward particular action
     *
     * @description adds or update new items to existing state object without returning new state
     * without creating new state object reference and without modifying the reference of existing items
     * if new objects is to be added or modified this action will do it via splice and push methods
     *
     * @returns void as mutation is handled by redux-toolkit
     */
    _addUpdateStocks: (
      state,
      action: {
        payload: Stock_i[];
        type: string;
      },
    ) => {
      action.payload.map((stock) => {
        const index = state.stocksList.findIndex(
          (s) => s.key_id === stock.key_id,
        );
        if (index > -1) {
          //state.stocksList.splice(index, 1, stock);
          state.stocksList[index] = stock;
          state.stocksObj[stock.key_id] = stock;
        } else {
          state.stocksList.push(stock);
          state.stocksObj[stock.key_id] = stock;
        }
      });
      // NOTE no need to return state as redux-toolkit will handle mutable methods modification
    },
    /**
     * @note only to be used in stockSaga which defines which command came and forward particular action
     *
     * @description removes items from existing state object without returning new state
     * without creating new state object reference and without modifying the reference of existing items
     * if new objects is to be removed this action will do it via splice and delete methods
     *
     * @returns void as mutation is handled by redux-toolkit
     */
    _removeStocks: (
      state,
      action: {
        payload: Stock_i[];
        type: string;
      },
    ) => {
      action.payload.map((stock) => {
        const index = state.stocksList.findIndex(
          (s) => s.key_id === stock.key_id,
        );
        if (index > -1) {
          state.stocksList.splice(index, 1);
          delete state.stocksObj[stock.key_id];
        }
      });
      // NOTE no need to return state as redux-toolkit will handle mutable methods modification
    },
  },
});

export const { _setStocks, _addUpdateStocks } = stocksSlice.actions;

export default stocksSlice.reducer;
