import Decimal from "decimal.js";

export const getStockKeyId = (
  stock: Stock_i | searchSymbolResponseData_i | ltpData_i,
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
