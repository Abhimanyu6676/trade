import Decimal from "decimal.js";

export const sleep = (timeout: number /** @param timeout [number] in milliseconds */) => {
  return new Promise((resolve) => setTimeout(resolve));
};

export const decimal = (value: number) => {
  return new Decimal(value).toDecimalPlaces(2).toNumber();
};
