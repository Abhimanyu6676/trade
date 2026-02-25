import Decimal from "decimal.js";
import { onLtpData_i } from "../api";

export const getStockKeyId = (
  stock: Stock_i | StockListSearchResult_i | onLtpData_i,
) => {
  return `${stock.symbol}:${stock.exchange}`;
};
