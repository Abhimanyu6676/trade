import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { ORDER_action, ORDER_status } from "../../../../../../backend/src/crud/order/order_constants";
import { decimal } from "../../../../../../backend/src/util/helper";
import store from "../../../../redux/index";
import * as variables from "../../../../styles/themeVariables.module.scss";
import eventBus from "../../../../util/eventBus/index";
import * as styles from "./index.module.scss";
import { ThresholdView } from "./thresholdView";

type Props = {
  stock: STOCK.all;
  priceFieldRef: React.RefObject<HTMLInputElement>;
  quantityFieldRef: React.RefObject<HTMLInputElement>;
  thresholdFieldRef: React.RefObject<HTMLInputElement>;
  riskFieldRef: React.RefObject<HTMLInputElement>;
  exitDropFieldRef: React.RefObject<HTMLInputElement>;
  exitProfitFieldRef: React.RefObject<HTMLInputElement>;
  autoReEnterFieldRef: React.RefObject<HTMLInputElement>;
  quantity: number;
  threshold: number;
  risk: number;
  exitDrop: number;
  exitProfit: number;
  autoReEnter: boolean;
  setAutoReEnter: React.Dispatch<React.SetStateAction<boolean>>;
  ltp: number;
};

export const TradeDetails = (props: Props) => {
  const buyOrder = props.stock?.trade?.orders?.find((o) => o.action == ORDER_action.BUY);
  const sellOrder = props.stock?.trade?.orders?.find((o) => o.action == ORDER_action.SELL);

  //Take average of both prices, sell and buy
  const orderPrice =
    buyOrder?.price && sellOrder?.price
      ? decimal((buyOrder.price + sellOrder.price) / 2)
      : buyOrder?.price
        ? buyOrder.price
        : sellOrder?.price
          ? sellOrder.price
          : 1;

  const [isModified, setIsModified] = useState(false);

  const isBuyOrderActive = buyOrder && buyOrder?.status != ORDER_status.EXITED;
  const isSellOrderActive = sellOrder && sellOrder?.status != ORDER_status.EXITED;
  const isOrderActive = isBuyOrderActive || isSellOrderActive;
  const isAnyOfOneOrderExited =
    (buyOrder && buyOrder?.status == ORDER_status.EXITED) || (sellOrder && sellOrder?.status == ORDER_status.EXITED);

  const buyPnl = decimal(
    buyOrder?.status == ORDER_status.ACTIVE
      ? (props.ltp - buyOrder.price) * buyOrder.quantity
      : buyOrder?.status == ORDER_status.EXITED && buyOrder?.exitPrice
        ? (buyOrder.exitPrice - buyOrder.price) * buyOrder.quantity
        : 0,
  );
  const sellPnl = decimal(
    sellOrder?.status == ORDER_status.ACTIVE
      ? (sellOrder.price - props.ltp) * sellOrder.quantity
      : sellOrder?.status == ORDER_status.EXITED && sellOrder?.exitPrice
        ? (sellOrder.price - sellOrder.exitPrice) * sellOrder.quantity
        : 0,
  );
  const pnl = decimal(buyPnl + sellPnl);

  useEffect(() => {
    if (props.quantityFieldRef.current) props.quantityFieldRef.current.value = props.quantity.toString();
    if (props.thresholdFieldRef.current) props.thresholdFieldRef.current.value = props.threshold.toString();
    if (props.riskFieldRef.current) props.riskFieldRef.current.value = props.risk.toString();
    if (props.exitDropFieldRef.current) props.exitDropFieldRef.current.value = props.exitDrop.toString();
    if (props.exitProfitFieldRef.current) props.exitProfitFieldRef.current.value = props.exitProfit.toString();
    return () => {};
  }, [props.stock]);

  const modifyTrade = (props: any) => {};
  const exitTrade = (props: any) => {};
  const updateTradeOnServer = (props: any) => {};

  return (
    <div // input fields and bottom buttons container
      style={{}}
    >
      <div // data rows
        style={{ marginTop: 20, backgroundColor: variables.primaryColorDark, borderRadius: 5, padding: "10px 0px" }}
      >
        <MasterRow // order price & order quantity
        >
          <ChildRow heading="Order Price">
            <Form.Control
              ref={props.priceFieldRef}
              className={styles.input}
              type="number"
              disabled={isBuyOrderActive}
              defaultValue={buyOrder ? buyOrder.price : orderPrice}
            />
          </ChildRow>
          <ChildRow heading="Order Quantity">
            <Form.Control
              ref={props.quantityFieldRef}
              className={styles.input}
              type="number"
              disabled={isOrderActive}
              defaultValue={props.quantity}
            />
          </ChildRow>
        </MasterRow>

        <MasterRow // threshold & risk
        >
          <ChildRow heading="Threshold %">
            <Form.Control
              ref={props.thresholdFieldRef}
              className={styles.input}
              type="number"
              defaultValue={props.threshold}
              onChange={modifyTrade}
            />
          </ChildRow>

          <ChildRow heading="Risk %">
            <Form.Control
              ref={props.riskFieldRef}
              className={styles.input}
              type="number"
              defaultValue={props.risk}
              onChange={modifyTrade}
            />
          </ChildRow>
        </MasterRow>

        <MasterRow // exitDrop & exitProfit
        >
          <ChildRow heading="Exit on Drop %">
            <Form.Control
              ref={props.exitDropFieldRef}
              className={styles.input}
              type="number"
              defaultValue={props.exitDrop}
              onChange={modifyTrade}
            />
          </ChildRow>

          <ChildRow heading="Exit on Profit %">
            <Form.Control
              ref={props.exitProfitFieldRef}
              className={styles.input}
              type="number"
              defaultValue={props.exitProfit}
              onChange={modifyTrade}
            />
          </ChildRow>
        </MasterRow>

        <MasterRow // buy/sell prices for both orders
        >
          <ChildRow heading="Buy Order (Buy::Sell)" value={`${buyOrder?.price ?? 0} :: ${buyOrder?.exitPrice ?? 0}`} />
          <ChildRow
            heading="Sell Order (Buy::Sell)"
            value={`${sellOrder?.exitPrice ?? 0} :: ${sellOrder?.price ?? 0}`}
          />
        </MasterRow>

        <MasterRow // buy/sell PnL
        >
          <ChildRow heading="Buy PnL" value={buyPnl} />
          <ChildRow heading="Sell PnL" value={sellPnl} />
        </MasterRow>

        <MasterRow // net PnL & %
        >
          <ChildRow heading="Net PnL" value={pnl} />
          <ChildRow heading="PnL %" value={decimal(((pnl / orderPrice) * 100) / props.quantity) + "%"} />
        </MasterRow>

        <MasterRow // net PnL & %
        >
          <ChildRow>
            <Form>
              <Form.Check
                reverse
                type="switch"
                id="custom-switch"
                label="Toggle Auto-Enter"
                checked={props.autoReEnter}
                onChange={(e) => {
                  console.log("switch toggled", e.target.checked);
                  if (props.stock.trade) {
                    eventBus.emitEvent({
                      type: "TRADE",
                      action: {
                        type: "MODIFY_TRADE",
                        data: {
                          tradeId: props.stock?.trade?.id ?? "",
                          data: { autoReEntry: e.target.checked },
                          userId: store.getState().user.user?.id ?? "",
                        },
                      },
                    });
                  } else {
                    props.setAutoReEnter(e.target.checked);
                  }
                }}
              />
            </Form>
          </ChildRow>
          <ChildRow />
        </MasterRow>

        {props.stock.trade && (
          <MasterRow // threshold graph view
          >
            <div style={{ display: "flex", flex: 1, padding: "5px 20px" }}>
              {(true || buyOrder || sellOrder) &&
                ThresholdView({
                  ltp: props.ltp,
                  orderPrice,
                  threshold: props.threshold,
                  risk: props.risk,
                  exitDrop: props.exitDrop,
                  exitProfit: props.exitProfit,
                  isAnyOfOneOrderExited,
                })}
            </div>
            <ChildRow heading="" />
          </MasterRow>
        )}
      </div>
      <div // bottom Buttons
        style={{
          //backgroundColor: "red",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <div // left side buttons
          style={{
            //backgroundColor: "red",
            display: "flex",
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Button
            variant={isOrderActive ? "danger" : "outline-danger"}
            disabled={!isOrderActive}
            style={{}}
            onClick={() => {
              console.log("Exit Order");
              const trade = props.stock?.trade;
              if (trade?.id && trade.status == "ACTIVE" && trade.orders) {
                eventBus.emitEvent({
                  type: "TRADE",
                  action: {
                    type: "EXIT_TRADE",
                    data: { userId: store.getState().user.user?.id ?? "", trade: { ...trade, orders: trade.orders } },
                  },
                });
              }
            }}
          >
            Exit Trade
          </Button>
          <Button
            variant={isBuyOrderActive ? "danger" : "outline-danger"}
            disabled={!isBuyOrderActive}
            style={{ marginLeft: 20 }}
            onClick={() => {
              console.log("Exit Buy Order");
              if (buyOrder?.id && buyOrder?.status != "EXITED") {
                eventBus.emitEvent({
                  type: "TRADE",
                  action: {
                    type: "EXIT_ORDER",
                    data: { userId: store.getState().user.user?.id ?? "", order: buyOrder },
                  },
                });
              }
            }}
          >
            Exit Buy
          </Button>
          <Button
            variant={isSellOrderActive ? "danger" : "outline-danger"}
            disabled={!isSellOrderActive}
            style={{ marginLeft: 20 }}
            onClick={() => {
              console.log("Exit Sell Order");
              if (sellOrder?.id && sellOrder?.status != "EXITED") {
                eventBus.emitEvent({
                  type: "TRADE",
                  action: {
                    type: "EXIT_ORDER",
                    data: { userId: store.getState().user.user?.id ?? "", order: sellOrder },
                  },
                });
              }
            }}
          >
            Exit Sell
          </Button>
        </div>
        <div // right side buttons
          style={{
            //backgroundColor: "red",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Button
            variant={isModified ? "success" : "outline-success"}
            disabled={!isModified}
            onClick={() => {
              console.log("updating Order -- ", isOrderActive);
              console.log("props", props.threshold, props.risk, props.exitDrop);
              updateTradeOnServer({
                stock: props.stock,
                threshold: props.threshold,
                risk: props.risk,
                exitDrop: props.exitDrop,
              });
              setIsModified(false);
            }}
          >
            Update Order
          </Button>
        </div>
      </div>
    </div>
  );
};

const MasterRow = (props: { children?: any }) => {
  return <div className={styles.masterRow}>{props.children}</div>;
};

const ChildRow = (props: { children?: React.JSX.Element; heading?: string; value?: string | number }) => {
  return (
    <div className={styles.childRow}>
      {props.heading && <p className={styles.heading}>{props.heading}</p>}
      <div>{props.value != undefined ? <p className={styles.value}>{props.value}</p> : props.children}</div>
    </div>
  );
};
