import { createSlice } from "@reduxjs/toolkit";

interface stocksSplice_i {
  stocksList: Stock_i[];
  stocksObj: StocksListObject_i;
}

const initialState: stocksSplice_i = {
  stocksList: [],
  stocksObj: {},
};

export const stocksSlice = createSlice({
  name: "stocks",
  initialState,
  reducers: {
    setStocks: (
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
    addStocks: (
      state,
      action: {
        payload: Stock_i[];
        type: string;
      },
    ) => {
      //console.log("Adding stocks:");
      //console.log("current State:", state);
      //console.log("Setting stocks:", action);
      let newStocksList = [...state.stocksList];
      let newStocksListObj = { ...state.stocksObj };
      action.payload.map((stock) => {
        if (stock.key_id in newStocksListObj) {
          //console.log("Stock already exists:", stock);
        } else {
          newStocksList.push(stock);
          newStocksListObj[stock.key_id] = stock;
          //console.log("Adding new stock:", stock);
        }
      });
      return {
        ...state,
        stocksList: newStocksList,
        stocksObj: newStocksListObj,
      };
    },
  },
});

export const { setStocks, addStocks } = stocksSlice.actions;

export default stocksSlice.reducer;
