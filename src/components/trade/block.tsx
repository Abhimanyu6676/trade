import React, { useEffect, useMemo, useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { getStockKeyId, decimal } from "../../util/helper";
import socketService from "../../services/socket";
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import * as variables from "../../styles/themeVariables.module.scss";
import * as styles from "./block.module.scss";
import { ThresholdView } from "./thresholdView";

//TODO [ ] if order status is received as PLACED and is PENDING keep checking for orderStatus in loop for buy & sell both order

const Block = (props: { stock: Stock_i }) => {
  console.log(`${props.stock.keyId}-----------------------`);
  const buyOrder = props.stock?.orders?.find((o) => o.action == "BUY");
  const sellOrder = props.stock?.orders?.find((o) => o.action == "SELL");

  const [ltp, setLtp] = useState(0);
  const [ltpColor, setLtpColor] = useState("");
  const [fieldsHidden, setFieldsHidden] = useState(!props.stock.orders.length);

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

  const [priceType, setPriceType] = useState<orderPriceType_i>(buyOrder?.priceType || "MARKET");
  const [productType, setProductType] = useState<orderProductType_i>(buyOrder?.product || "MIS");

  const quantity = buyOrder?.quantity || 1;
  const threshold = buyOrder?.threshold || 0.5;
  const risk = buyOrder?.risk || 0.15;
  const exitDrop = buyOrder?.exitDrop || 0.2;
  const exitProfit = buyOrder?.exitProfit || 0.2;
  const [isModified, setIsModified] = useState(false);

  const isBuyOrderActive = buyOrder && buyOrder?.orderStatus != "EXITED";
  const isSellOrderActive = sellOrder && sellOrder?.orderStatus != "EXITED";
  const isOrderActive = isBuyOrderActive || isSellOrderActive;
  const isAnyOfOneOrderExited =
    (buyOrder && buyOrder?.orderStatus == "EXITED") || (sellOrder && sellOrder?.orderStatus == "EXITED");

  const buyPnl = decimal(
    buyOrder?.orderStatus == "ACTIVE"
      ? (ltp - buyOrder.price) * buyOrder.quantity
      : buyOrder?.orderStatus == "EXITED" && buyOrder?.exitPrice
        ? (buyOrder.exitPrice - buyOrder.price) * buyOrder.quantity
        : 0,
  );
  const sellPnl = decimal(
    sellOrder?.orderStatus == "ACTIVE"
      ? (sellOrder.price - ltp) * sellOrder.quantity
      : sellOrder?.orderStatus == "EXITED" && sellOrder?.exitPrice
        ? (sellOrder.price - sellOrder.exitPrice) * sellOrder.quantity
        : 0,
  );
  const pnl = decimal(buyPnl + sellPnl);

  const enterTrade = async () => {
    console.log("Entering trade");
    let orderTemplate: Omit<Omit<enterTradeOrder_i, "action">, "apiKey"> = {
      keyId: props.stock.keyId,
      strategy: "nodeJS",
      symbol: props.stock.symbol,
      exchange: props.stock.exchange,
      priceType: priceType,
      product: productType,
      quantity,
      price: priceType == "LIMIT" ? orderPrice : ltp,
      triggerPrice: 0,
      disclosedQuantity: 0,
      threshold,
      risk: risk,
      exitDrop,
    };

    const order1: enterTradeOrder_i = {
      ...orderTemplate,
      apiKey: process.env.client1ApiKey ? process.env.client1ApiKey : "",
      action: "BUY",
    };
    const order2: enterTradeOrder_i = {
      ...orderTemplate,
      apiKey: process.env.client2ApiKey ? process.env.client2ApiKey : "",
      action: "SELL",
    };

    socketService.sendOrderCmd({ cmd: "enterTrade", data: [order1, order2] });
  };

  const updateTrade = async (props: { stock: Stock_i; threshold: number; risk: number; exitDrop: number }) => {
    if (isModified) {
      console.log("order is modified send new values to backend");
      socketService.sendOrderCmd({
        cmd: "modifyTrade",
        data: { keyId: props.stock.keyId, threshold: props.threshold, risk: props.risk, exitDrop: props.exitDrop },
      });
    }
  };

  const exitTrade = async (props: { stock: Stock_i; orders: Order_i[] }) => {
    socketService.sendOrderCmd({
      cmd: "exitTrade",
      data: { keyId: props.stock.keyId, id: props.orders.map((o) => o.orderId) },
    });
  };

  const ModifyTrade = () => {};

  const quantityFieldRef = useRef<HTMLInputElement>(null);
  const thresholdFieldRef = useRef<HTMLInputElement>(null);
  const riskFieldRef = useRef<HTMLInputElement>(null);
  const exitDropFieldRef = useRef<HTMLInputElement>(null);
  const exitProfitFieldRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    console.log(`${props.stock.keyId}-----------***************--------------`);

    if (quantityFieldRef.current) quantityFieldRef.current.value = quantity.toString();

    if (thresholdFieldRef.current) thresholdFieldRef.current.value = threshold.toString();

    if (riskFieldRef.current) riskFieldRef.current.value = risk.toString();

    if (exitDropFieldRef.current) exitDropFieldRef.current.value = exitDrop.toString();

    if (exitProfitFieldRef.current) exitProfitFieldRef.current.value = exitProfit.toString();

    return () => {};
  }, [threshold, risk, exitDrop, exitProfit]);

  // subscribe to LTP
  useEffect(() => {
    socketService.ltpSubscriberList.subscribe({
      id: props.stock.keyId,
      callback: (data) => {
        /* console.log(
          `ltp data in stock block via new subscriberList ${props.stock.keyId}`,
          data,
        ); */
        const dataKeyId = getStockKeyId(data);
        if (props.stock.keyId == dataKeyId) {
          setLtp((prevLtp) => {
            if (data.ltp < prevLtp) setLtpColor("#ff0000");
            else if (data.ltp > prevLtp) setLtpColor("#27F565");
            return data.ltp;
          });
        }
      },
    });

    return () => {
      socketService.ltpSubscriberList.unSubscribe(props.stock.keyId);
    };
  }, []);

  return (
    <div className="container foreground" style={{ borderRadius: 10, padding: 15, marginTop: 20 }}>
      <div // top buttons
        style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
      >
        <div // Stock Name, Quantity and LTP Views
          style={{ display: "flex", flexDirection: "row" }}
        >
          <div // stock name
            style={{
              //backgroundColor: "red"
              minWidth: 200,
            }}
          >
            <p className="subtle-text" style={{ margin: 0, padding: 0, fontSize: 12 }}>
              Symbol Name
            </p>
            <div
              style={{
                //backgroundColor: "red",
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-end",
              }}
            >
              <h5 style={{ margin: 0, padding: 0 }}>{props.stock.symbol}</h5>
              <p
                //className="highlighted-border"
                style={{
                  fontSize: 12,
                  margin: 0,
                  marginLeft: 5,
                  padding: "0px 5px",
                  //border: "1px solid var(--text-color)",
                  border: `1px solid ${variables.highlightedBorder}`,
                }}
              >
                {props.stock.exchange}
              </p>
            </div>
          </div>
          <div // buy sell quantity
            style={{ minWidth: 100 }}
          >
            <p style={{ margin: 0, padding: 0, fontSize: 12, color: variables.subtleText }}>Quantity</p>
            <h5>{`${buyOrder ? buyOrder.quantity : "--"} : ${sellOrder ? sellOrder.quantity : "--"}`}</h5>
          </div>
          <div // LTP
            style={{ minWidth: 100 }}
          >
            <p style={{ margin: 0, padding: 0, fontSize: 12, color: variables.subtleText }}>LTP</p>
            <h5 style={{ color: ltpColor }}>{ltp}</h5>
          </div>
          <div // buy/sell status
            style={{
              //backgroundColor: "red",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                backgroundColor:
                  buyOrder?.orderStatus == "ACTIVE"
                    ? "#33EB45"
                    : buyOrder?.orderStatus == "EXITED"
                      ? "#F83725"
                      : "#82829B",
                padding: "0px 5px",
                borderRadius: 3,
                boxShadow: "2px 2px 5px rgba(0,0,0,0.3)",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              B
            </div>
            <div
              style={{
                backgroundColor:
                  sellOrder?.orderStatus == "ACTIVE"
                    ? "#33EB45"
                    : sellOrder?.orderStatus == "EXITED"
                      ? "#F83725"
                      : "#82829B",
                padding: "0px 5px",
                borderRadius: 3,
                boxShadow: "2px 2px 5px rgba(0,0,0,0.3)",
                color: "#fff",
                fontWeight: "bold",
                marginLeft: 5,
              }}
            >
              S
            </div>
          </div>
        </div>
        <div // Enter trade & trade priceType Button
          style={{ display: "flex", flexDirection: "row" }}
        >
          <button // show hide field button
            style={{
              all: "unset",
              cursor: "pointer",
              border: "0px solid #aaaaaa",
              width: 30,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
            }}
            onClick={() => {
              setFieldsHidden(!fieldsHidden);
            }}
          >
            {fieldsHidden ? <IoEyeOff size={22} color="#aaaaaa" /> : <IoEye size={22} color="#666666" />}
          </button>
          <DropdownButton //Product type selector
            disabled={isOrderActive}
            variant="outline-secondary"
            title={priceType}
          >
            <Dropdown.Item
              onClick={() => {
                setPriceType("MARKET");
              }}
            >
              MARKET
            </Dropdown.Item>
            <Dropdown.Item
              disabled
              onClick={() => {
                setPriceType("LIMIT");
              }}
            >
              LIMIT
            </Dropdown.Item>
            <Dropdown.Item
              disabled
              onClick={() => {
                setPriceType("SL");
              }}
            >
              SL
            </Dropdown.Item>
            <Dropdown.Item
              disabled
              onClick={() => {
                setPriceType("SL-M");
              }}
            >
              SL-M
            </Dropdown.Item>
          </DropdownButton>
          <DropdownButton // price type selector
            disabled={isOrderActive}
            variant="outline-secondary"
            title={productType}
            style={{ marginRight: 10 }}
          >
            <Dropdown.Item
              onClick={() => {
                setProductType("MIS");
              }}
            >
              MIS
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                setProductType("CNC");
              }}
            >
              CNC
            </Dropdown.Item>
            <Dropdown.Item
              disabled
              onClick={() => {
                setProductType("NRML");
              }}
            >
              NRML
            </Dropdown.Item>
          </DropdownButton>
          <Button // enterTrade button
            style={{ marginRight: 10 }}
            onClick={enterTrade}
            disabled={isOrderActive}
          >
            Enter Trade
          </Button>
          <DropdownButton //delete symbol selector button
            disabled={isOrderActive}
            variant="outline-secondary"
            title={""}
          >
            <Dropdown.Item
              onClick={() => {
                socketService.sendOrderCmd({ cmd: "deleteSymbol", data: { keyId: props.stock.keyId } });
              }}
            >
              DELETE SYMBOL
            </Dropdown.Item>
          </DropdownButton>
        </div>
      </div>

      <div // input fields and bottom buttons container
        hidden={fieldsHidden}
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
                onChange={ModifyTrade}
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
                onChange={ModifyTrade}
              />
            </ChildRow>
            <ChildRow heading="Exit on Drop %">
              <Form.Control
                ref={exitDropFieldRef}
                className={styles.input}
                type="number"
                defaultValue={exitDrop}
                onChange={ModifyTrade}
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
                updateTrade({ stock: props.stock, threshold, risk: risk, exitDrop });
                setIsModified(false);
              }}
            >
              Update Order
            </Button>
          </div>
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

export default Block;
