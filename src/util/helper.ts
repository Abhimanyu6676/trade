import Decimal from "decimal.js";
import { onLtpData_i } from "../api";

export const getStockKeyId = (
  stock: Stock_i | StockListSearchResult_i | onLtpData_i,
) => {
  return `${stock.symbol}:${stock.exchange}`;
};

export const sleep = (
  timeout: number /** @param timeout [number] in milliseconds */,
) => {
  return new Promise((resolve) => setTimeout(resolve));
};

export const settledDecimal = (value: number) => {
  return new Decimal(value).toDecimalPlaces(2).toNumber();
};
