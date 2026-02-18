type exchange_i = "NSE" | "BSE";

interface StockListSearchResult_i {
  brexchange: exchange_i;
  brsymbol: string;
  exchange: exchange_i;
  expiry?: any;
  freeze_qty?: number;
  instrumenttype?: string;
  lotsize?: number;
  name: string;
  strike?: number;
  symbol: string;
  tick_size?: number;
  token: string;
}

interface StocksListObject_i {
  [key: string]: Stock_i;
}

interface Stock_i {
  key_id: string;
  name: string;
  symbol: string;
  brSymbol: string;
  exchange: exchange_i;
  ltp?: number;
  buyOrder?: order_i;
  sellOrder?: order_i;
}

interface order_i {
  apikey: string;
  strategy: string;
  id?: string;
  timestamp: number;
  symbol: string;
  action: "BUY" | "SELL" | "SL" | "SL-M";
  exchange: exchange_i;
  priceType: "LIMIT" | "MARKET";
  product: "MIS" | "CNC" | "NRML";
  quantity: number;
  price?: number;
  triggerPrice?: number;
  disclosedQuantity: number;
  threshold: number;
  risk: number;
  orderStatus: "PENDING" | "ACTIVE" | "EXITED";
}
