type exchange_i = "NSE" | "BSE";

type orderPriceType_i = "LIMIT" | "MARKET" | "SL" | "SL-M";

type orderAction_i = "BUY" | "SELL";

type orderProductType_i = "MIS" | "CNC" | "NRML";

type orderStatus_i = "PENDING" | "ACTIVE" | "EXITED";

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
  apiKey: string;
  strategy?: string;
  id: string;
  timestamp: string;
  symbol: string;
  action: orderAction_i;
  exchange: exchange_i;
  priceType: orderPriceType_i;
  product: orderProductType_i;
  quantity: number;
  price: number;
  exitPrice?: number;
  triggerPrice?: number;
  disclosedQuantity: number;
  threshold: number;
  risk: number;
  exitDrop: number;
  orderStatus: orderStatus_i;
  exitOrderID?: string;
}
