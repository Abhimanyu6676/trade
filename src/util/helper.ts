import Decimal from "decimal.js";

/**
 *
 * @param userID [string]
 * @param stock [STOCK.base | searchSymbolResponseData_i | ltpData_i]
 * @returns `${userID}-${stock.symbol}:${stock.exchange}`
 */
export const getStockKeyId = (userID: string, stock: STOCK.base | searchSymbolResponseData_i | ltpData_i) => {
  return `${userID}-${stock.symbol}:${stock.exchange}`;
};

export const sleep = (timeout: number /** @param timeout [number] in milliseconds */) => {
  return new Promise((resolve) => setTimeout(resolve));
};

export const decimal = (value: number) => {
  return new Decimal(value).toDecimalPlaces(2).toNumber();
};
