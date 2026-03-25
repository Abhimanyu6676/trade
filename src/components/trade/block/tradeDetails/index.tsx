import React, { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { ORDER_action, ORDER_status } from "../../../../../../backend/src/crud/order/order";
import { decimal } from "../../../../../../backend/src/util/helper";
import * as variables from "../../../../styles/themeVariables.module.scss";
//
import * as styles from "./index.module.scss";
import { ThresholdView } from "./thresholdView";

type Props = { stock: STOCK.all; trade: TRADE.all };

export const TradeDetails = (props: Props) => {
  const buyOrder = props.trade?.orders?.find((o) => o.action == ORDER_action.BUY);
  const sellOrder = props.trade?.orders?.find((o) => o.action == ORDER_action.SELL);

  const [ltp, setLtp] = useState(0);

  //Take average of both prices, sell and buy
  const [orderPrice, setOrderPrice] = useState(
    buyOrder?.price && sellOrder?.price
      ? decimal((buyOrder.price + sellOrder.price) / 2)
      : buyOrder?.price
        ? buyOrder.price
        : sellOrder?.price
          ? sellOrder.price
          : 1,
  );

  const quantity = buyOrder?.quantity || 1;
  const threshold = buyOrder?.threshold || 0.5;
  const risk = buyOrder?.risk || 0.15;
  const exitDrop = buyOrder?.exitDrop || 0.2;
  const exitProfit = buyOrder?.exitProfit || 0.2;
  const [isModified, setIsModified] = useState(false);

  const isBuyOrderActive = buyOrder && buyOrder?.status != ORDER_status.EXITED;
  const isSellOrderActive = sellOrder && sellOrder?.status != ORDER_status.EXITED;
  const isOrderActive = isBuyOrderActive || isSellOrderActive;
  const isAnyOfOneOrderExited =
    (buyOrder && buyOrder?.status == ORDER_status.EXITED) || (sellOrder && sellOrder?.status == ORDER_status.EXITED);

  const buyPnl = decimal(
    buyOrder?.status == ORDER_status.ACTIVE
      ? (ltp - buyOrder.price) * buyOrder.quantity
      : buyOrder?.status == ORDER_status.EXITED && buyOrder?.exitPrice
        ? (buyOrder.exitPrice - buyOrder.price) * buyOrder.quantity
        : 0,
  );
  const sellPnl = decimal(
    sellOrder?.status == ORDER_status.ACTIVE
      ? (sellOrder.price - ltp) * sellOrder.quantity
      : sellOrder?.status == ORDER_status.EXITED && sellOrder?.exitPrice
        ? (sellOrder.price - sellOrder.exitPrice) * sellOrder.quantity
        : 0,
  );
  const pnl = decimal(buyPnl + sellPnl);

  const quantityFieldRef = useRef<HTMLInputElement>(null);
  const thresholdFieldRef = useRef<HTMLInputElement>(null);
  const riskFieldRef = useRef<HTMLInputElement>(null);
  const exitDropFieldRef = useRef<HTMLInputElement>(null);
  const exitProfitFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (quantityFieldRef.current) quantityFieldRef.current.value = quantity.toString();

    if (thresholdFieldRef.current) thresholdFieldRef.current.value = threshold.toString();

    if (riskFieldRef.current) riskFieldRef.current.value = risk.toString();

    if (exitDropFieldRef.current) exitDropFieldRef.current.value = exitDrop.toString();

    if (exitProfitFieldRef.current) exitProfitFieldRef.current.value = exitProfit.toString();

    return () => {};
  }, [threshold, risk, exitDrop, exitProfit]);

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
        <MasterRow // Buy/Sell order price
        >
          <ChildRow heading="Buy Order Price">
            <Form.Control
              className={styles.input}
              type="number"
              disabled={isBuyOrderActive}
              value={buyOrder ? buyOrder.price : orderPrice}
              onChange={(e) => {
                setOrderPrice(parseFloat(e.target.value));
              }}
            />
          </ChildRow>
          <ChildRow heading="Sell Order Price">
            <Form.Control
              className={styles.input}
              type="number"
              disabled={isSellOrderActive}
              value={sellOrder ? sellOrder.price : orderPrice}
              onChange={(e) => {
                setOrderPrice(parseFloat(e.target.value));
              }}
            />
          </ChildRow>
        </MasterRow>

        <MasterRow // order quantity and threshold
        >
          <ChildRow heading="Buy/Sell Order Quantity">
            <Form.Control
              ref={quantityFieldRef}
              className={styles.input}
              type="number"
              disabled={isOrderActive}
              defaultValue={quantity}
            />
          </ChildRow>
          <ChildRow heading="Threshold %">
            <Form.Control
              ref={thresholdFieldRef}
              className={styles.input}
              type="number"
              defaultValue={threshold}
              onChange={modifyTrade}
            />
          </ChildRow>
        </MasterRow>

        <MasterRow // risk and exitDrop fields
        >
          <ChildRow heading="Risk %">
            <Form.Control
              ref={riskFieldRef}
              className={styles.input}
              type="number"
              defaultValue={risk}
              onChange={modifyTrade}
            />
          </ChildRow>
          <ChildRow heading="Exit on Drop %">
            <Form.Control
              ref={exitDropFieldRef}
              className={styles.input}
              type="number"
              defaultValue={exitDrop}
              onChange={modifyTrade}
            />
          </ChildRow>
        </MasterRow>

        {/*  <MasterRow // upper/lower threshold
          >
            <ChildRow heading="Upper Threshold" value={upperThreshold} />
            <ChildRow heading="Lower Threshold" value={lowerThreshold} />
          </MasterRow> */}

        <MasterRow // buy/sell prices for both orders
        >
          <ChildRow
            heading="Buy Order (Buy::Sell)"
            value={`${buyOrder?.price ? buyOrder?.price : "N/A"} :: ${buyOrder?.exitPrice ? buyOrder?.exitPrice : "N/A"}`}
          />
          <ChildRow
            heading="Sell Order (Buy::Sell)"
            value={`${sellOrder?.price ? sellOrder?.price : "N/A"} :: ${sellOrder?.exitPrice ? sellOrder?.exitPrice : "N/A"}`}
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
          <ChildRow heading="PnL %" value={decimal(((pnl / orderPrice) * 100) / quantity) + "%"} />
        </MasterRow>

        <MasterRow // threshold graph view
        >
          <div style={{ display: "flex", flex: 1, padding: "5px 20px" }}>
            {(true || buyOrder || sellOrder) &&
              ThresholdView({ ltp, orderPrice, threshold, risk, exitDrop, exitProfit, isAnyOfOneOrderExited })}
          </div>
          <ChildRow heading="" />
        </MasterRow>
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
              buyOrder && exitTrade({ stock: props.stock, orders: [buyOrder] });
              sellOrder && exitTrade({ stock: props.stock, orders: [sellOrder] });
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
              buyOrder && exitTrade({ stock: props.stock, orders: [buyOrder] });
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
              sellOrder && exitTrade({ stock: props.stock, orders: [sellOrder] });
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
              console.log("props", threshold, risk, exitDrop);
              updateTradeOnServer({ stock: props.stock, threshold, risk: risk, exitDrop });
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

const ChildRow = (props: { children?: React.JSX.Element; heading: string; value?: string | number }) => {
  return (
    <div className={styles.childRow}>
      <p className={styles.heading}>{props.heading}</p>
      <div>{props.value != undefined ? <p className={styles.value}>{props.value}</p> : props.children}</div>
    </div>
  );
};
