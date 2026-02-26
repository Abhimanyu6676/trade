import Decimal from "decimal.js";
import openAlgoClient from "../../api";
import store from "../../redux";
import { stocksSagaAction } from "../../redux/saga/stocksSaga";
import Alert from "../alert";
import { useState } from "react";
import { getStockKeyId } from "../../util/helper";

export type executeOrderType_i = Omit<
  Omit<Omit<order_i, "timestamp">, "orderStatus">,
  "id"
>;

export const executeOrder = async ({
  stock,
  order,
  tempPrice = 0,
}: {
  stock: Stock_i;
  order: executeOrderType_i;
  /** applicable if testing algo */
  tempPrice?: number;
}) => {
  const client = openAlgoClient.getClient(order.apiKey);

  //TODO execute and update order object in the store
  if (client) {
    const { apiKey, threshold, risk, exitDrop, ..._order } = order;
    await client
      .placeOrder(_order)
      .then(async (res: any) => {
        console.log("response :: ", res);
        if (res?.status == "success" && res?.orderid) {
          console.log("order placed");
          let _order: order_i = {
            ...order,
            id: res.orderid,
            orderStatus: "PENDING",
            timestamp: Date.now().toString(),
          };
          //TODO if priceType is `LIMIT/SL/SL-M` check order status if open or complete,
          // for open order `orderStatus` is PENDING for complete order `orderStatus` is ACTIVE
          await client
            .orderStatus({
              orderId: _order.id,
              strategy: "Test Strategy",
            })
            .then((res: any) => {
              console.log("orderStatusResponse... ", res);
              if (res?.status == "success" && res?.data?.orderid == _order.id) {
                Alert.notify({
                  heading: `${order.action} -- ${order.symbol}:${order.exchange}`,
                  text: `${order.action} order executed`,
                  variant: "success",
                });
                if (res?.data?.order_status == "complete") {
                  _order.orderStatus = "ACTIVE";
                } else {
                  //TODO start a timer to check orderStatus every 1 second
                }
                const updatedStock: Stock_i = { ...stock };
                if (_order.action == "BUY") {
                  updatedStock.buyOrder = _order;
                  updatedStock.buyOrder.price = tempPrice
                    ? tempPrice
                    : res?.data?.average_price;
                  updatedStock.buyOrder.timestamp = res?.data?.timestamp;
                }
                if (_order.action == "SELL") {
                  updatedStock.sellOrder = _order;
                  updatedStock.sellOrder.price = tempPrice
                    ? tempPrice
                    : res?.data?.average_price;
                  updatedStock.sellOrder.timestamp = res?.data?.timestamp;
                }
                store.dispatch(
                  stocksSagaAction({
                    updateStocks: [updatedStock],
                  }),
                );
              } else throw res;
            })
            .catch((err: any) => {
              console.log("orderStatusError... ", err);
              throw err;
            });
        } else {
          console.log("order ERROR");
          throw res;
        }
      })
      .catch((err: any) => {
        console.log("err :: ", err);
        Alert.notify({
          heading: `${order.action} -- ${order.symbol}:${order.exchange}`,
          text: `${order.action} order not executed\n${JSON.stringify(err)}`,
          variant: "error",
        });
      });
  }
};

export const updateTrade = async ({
  stock,
  threshold,
  risk,
  exitDrop,
}: {
  stock: Stock_i;
  threshold: number;
  risk: number;
  exitDrop: number;
}) => {
  //TODO update ACTIVE/PENDING trades `trigger_price` as per new threshold, risk and exitDrop
  // update BUY Order in openAlgoClient
  const _s: Stock_i = {
    ...stock,
    buyOrder: stock.buyOrder
      ? {
          ...stock.buyOrder,
          threshold,
          risk,
          exitDrop,
        }
      : undefined,
    sellOrder: stock.sellOrder
      ? {
          ...stock.sellOrder,
          threshold,
          risk,
          exitDrop,
        }
      : undefined,
  };
  console.log("updates stock state == ", _s);
  store.dispatch(
    stocksSagaAction({
      updateStocks: [_s],
    }),
  );
};

export const exitTrade = async ({
  stock,
  orders,
}: {
  stock: Stock_i;
  orders: order_i[];
}) => {
  const updateOrderInStoreAsClosed = (order: order_i) => {
    const updatedStock: Stock_i = { ...stock };
    if (order.action == "BUY") {
      updatedStock.buyOrder = { ...order };
      updatedStock.buyOrder.orderStatus = "EXITED";
      //TODO fetch exitPrice an update
    }
    if (order.action == "SELL") {
      updatedStock.sellOrder = { ...order };
      updatedStock.sellOrder.orderStatus = "EXITED";
    }
    store.dispatch(
      stocksSagaAction({
        updateStocks: [updatedStock],
      }),
    );
  };
  orders.map(async (item) => {
    //TODO fetch order status
    const client = openAlgoClient.getClient(item.apiKey);

    client &&
      (await client
        .orderStatus({
          orderId: item.id,
          strategy: "nodeJS",
        })
        .then(async (res: any) => {
          console.log("orderStatusResponse... ", res);
          if (res?.status == "success" && res?.data?.orderid == item.id) {
            if (res?.data?.order_status == "complete") {
              //TODO if order is `complete` close position
              await client
                .placeSmartOrder({
                  strategy: "NodeJS",
                  symbol: item.symbol,
                  action: "BUY",
                  exchange: item.exchange,
                  priceType: "MARKET",
                  product: item.product,
                  quantity: 0,
                  positionSize: 0,
                })
                .then((res: any) => {
                  if (res?.status == "success") {
                    console.log(
                      `Position closed for ${item.symbol}:${item.exchange}`,
                      res,
                    );
                    //TODO update stock status in redux store
                    Alert.notify({
                      heading: `${item.action} Position closed : ${item.symbol}:${item.exchange}`,
                      variant: "success",
                    });
                    updateOrderInStoreAsClosed(item);
                  } else throw res;
                })
                .catch((err: any) => {
                  console.log(
                    `error while closing position for ${item.symbol}:${item.exchange}`,
                    err,
                  );
                  throw err;
                });
            } else {
              //TODO if order is `open` cancel order
              await client
                .cancelOrder({
                  orderId: item.id,
                  strategy: "NodeJS",
                })
                .then((res: any) => {
                  if (res?.status == "success" && res?.orderid == item.id) {
                    console.log(
                      `order cancelled for ${item.symbol}:${item.exchange}`,
                      res,
                    );
                    Alert.notify({
                      heading: `Order cancelled : ${item.symbol}:${item.exchange}`,
                      variant: "success",
                    });
                    updateOrderInStoreAsClosed(item);
                  } else throw res;
                })
                .catch((err: any) => {
                  console.log(
                    `error while canceling order for ${item.symbol}:${item.exchange}`,
                    err,
                  );
                  throw err;
                });
            }
          } else throw res;
        })
        .catch((err: any) => {
          console.log("orderExitError... ", err);
          Alert.notify({
            heading: `${item.symbol}:${item.exchange} exit failed`,
            text: JSON.stringify(err),
            variant: "error",
          });
          throw err;
        }));
  });
};

export const handleLtp = (props: {
  stock: Stock_i;
  ltp: number;
  thresholdCrossed: boolean;
}) => {
  //console.log("handle LTP", props.stock);
  const stocksList = store.getState().stocks.stocksList;
  const stockIndex = stocksList.findIndex(
    (item) => item.key_id === props.stock.key_id,
  );

  if (stockIndex > -1) {
    const stock = stocksList[stockIndex];

    //console.log("threshold status ", props.thresholdCrossed);
    props.stock.buyOrder &&
      handleOrder({
        stock,
        ltp: props.ltp,
        order: props.stock.buyOrder,
        thresholdCrossed: props.thresholdCrossed,
      });
    props.stock.sellOrder &&
      handleOrder({
        stock,
        ltp: props.ltp,
        order: props.stock.sellOrder,
        thresholdCrossed: props.thresholdCrossed,
      });
  } else {
    console.log("handleLTP error ", props);
  }
};

const handleOrder = async (props: {
  stock: Stock_i;
  order: order_i;
  ltp: number;
  thresholdCrossed: boolean;
}) => {
  if (props.ltp) {
    //console.log("handling order :: ", props.order);
    //TODO handle buy order
    //TODO handle sell order
    const ltp = props.ltp;
    const enterPrice = props.order.price;
    const thresholdCrossed = props.thresholdCrossed;
    const upperThreshold = settledDecimal(
      enterPrice + (enterPrice / 100) * props.order.threshold,
    );
    const lowerThreshold = settledDecimal(
      enterPrice - (enterPrice / 100) * props.order.threshold,
    );
    const stopLossPriceDifference = enterPrice * (props.order.risk / 100);

    const stopLossPrice = thresholdCrossed
      ? props.order.action == "SELL"
        ? enterPrice + stopLossPriceDifference
        : enterPrice - stopLossPriceDifference
      : props.order.action == "SELL"
        ? upperThreshold
        : lowerThreshold;

    const pnl: number = (() => {
      let t = ltp - enterPrice;
      return props.order.action == "SELL" ? -t : t;
    })();

    console.log(`STOP LOSS PRICE FOR ${props.order.action} = ${stopLossPrice}`);
    console.log(`PNL FOR ${props.order.action} = ${pnl}`);

    //TODO if pnl is greater then riskPrice then exit trade

    let shouldExit =
      props.order.action == "SELL"
        ? ltp > stopLossPrice
          ? true
          : false
        : ltp < stopLossPrice
          ? true
          : false;

    console.log("should exit ", shouldExit);

    if (props.order.action == "SELL") {
      if (ltp >= stopLossPrice) shouldExit = true;
    } else if (props.order.action == "BUY") {
      if (ltp <= stopLossPrice) shouldExit = true;
    }

    if (props.order.orderStatus == "ACTIVE") {
      console.log("Let's handle this order");
      if (shouldExit) {
        console.log("EXITING ORDER");
        exitTrade({ stock: props.stock, orders: [props.order] });
      }
    } else {
      console.log("order is not ACTIVE ");
    }
  }
};

const settledDecimal = (value: number) => {
  return new Decimal(value).toDecimalPlaces(2).toNumber();
};
