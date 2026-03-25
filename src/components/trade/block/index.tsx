import React, { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { IoEye, IoEyeOff } from "react-icons/io5";
import {
  ORDER_action,
  ORDER_priceType,
  ORDER_productType,
  ORDER_status,
} from "../../../../../backend/src/crud/order/order";
import store from "../../../redux";
import eventBus from "../../../util/eventBus";
import { TradeDetails } from "./tradeDetails";
// theme modules are to be imported at last
import * as variables from "../../../styles/themeVariables.module.scss";

//TODO [ ] if order status is received as PLACED and is PENDING keep checking for orderStatus in loop for buy & sell both order

export const Block = (props: { stock: STOCK.all }) => {
  const buyOrder = props.stock.trade?.orders?.find((o) => o.action == ORDER_action.BUY);
  const sellOrder = props.stock.trade?.orders?.find((o) => o.action == ORDER_action.SELL);

  const [ltp, setLtp] = useState(props.stock.ltp || 0);
  const [ltpColor, setLtpColor] = useState("");
  const [fieldsHidden, setFieldsHidden] = useState(!props.stock.trade);
  const previousLtpRef = useRef(props.stock.ltp || 0);

  const [priceType, setPriceType] = useState<ORDER_priceType>(buyOrder?.priceType || ORDER_priceType.MARKET);
  const [productType, setProductType] = useState<ORDER_productType>(buyOrder?.product || ORDER_productType.MIS);

  const isBuyOrderActive = buyOrder && buyOrder?.status != ORDER_status.EXITED;
  const isSellOrderActive = sellOrder && sellOrder?.status != ORDER_status.EXITED;
  const isOrderActive = isBuyOrderActive || isSellOrderActive;

  /*  const enterTrade = async () => {
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

  const ModifyTrade = () => {}; */

  const enterTrade = (props: any) => {};
  useEffect(() => {
    const ltpListenerIdRef = `TRADE_BLOCK_LTP_${props.stock.keyId}`;
    eventBus.setEventListener(ltpListenerIdRef, "OPENALGO", async (action) => {
      switch (action.type) {
        case "LTP":
          {
          }
          break;

        default:
          break;
      }
    });

    return () => {
      eventBus.removeEventListener(ltpListenerIdRef, "OPENALGO");
    };
  }, [props.stock.keyId]);

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
                  buyOrder?.status == "ACTIVE" ? "#33EB45" : buyOrder?.status == "EXITED" ? "#F83725" : "#82829B",
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
                  sellOrder?.status == "ACTIVE" ? "#33EB45" : sellOrder?.status == "EXITED" ? "#F83725" : "#82829B",
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
                setPriceType(ORDER_priceType.MARKET);
              }}
            >
              MARKET
            </Dropdown.Item>
            <Dropdown.Item
              disabled
              onClick={() => {
                setPriceType(ORDER_priceType.LIMIT);
              }}
            >
              LIMIT
            </Dropdown.Item>
            <Dropdown.Item
              disabled
              onClick={() => {
                setPriceType(ORDER_priceType.SL);
              }}
            >
              SL
            </Dropdown.Item>
            <Dropdown.Item
              disabled
              onClick={() => {
                setPriceType(ORDER_priceType.SL_M);
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
                setProductType(ORDER_productType.MIS);
              }}
            >
              MIS
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                setProductType(ORDER_productType.CNC);
              }}
            >
              CNC
            </Dropdown.Item>
            <Dropdown.Item
              disabled
              onClick={() => {
                setProductType(ORDER_productType.NRML);
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
                eventBus.emitEvent({
                  type: "OPENALGO",
                  action: {
                    type: "REMOVE_STOCK",
                    data: { stocks: [props.stock], userId: store.getState().user.user?.id ?? "" },
                  },
                });
              }}
            >
              DELETE SYMBOL
            </Dropdown.Item>
          </DropdownButton>
        </div>
      </div>
      {props.stock.trade && <TradeDetails stock={props.stock} trade={props.stock.trade} />}
    </div>
  );
};
