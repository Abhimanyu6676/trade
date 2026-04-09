import React, { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import {
  ORDER_action,
  ORDER_defaults,
  ORDER_exchange,
  ORDER_priceType,
  ORDER_productType,
  ORDER_status,
} from "../../../../../backend/src/crud/order/order_constants";
import { getSymbolKey } from "../../../../../backend/src/util/helper";
import api from "../../../api/axios";
import store from "../../../redux";
import eventBus from "../../../util/eventBus";
import { TradeDetails } from "./tradeDetails";
// theme modules are to be imported at last
import * as styles from "./index.module.scss";

//TODO [ ] if order status is received as PLACED and is PENDING keep checking for orderStatus in loop for buy & sell both order

export const Block = (props: { stock: STOCK.all }) => {
  const buyOrder = props.stock.trade?.orders?.find((o) => o.action == ORDER_action.BUY);
  const sellOrder = props.stock.trade?.orders?.find((o) => o.action == ORDER_action.SELL);

  const [ltp, setLtp] = useState(0);
  const [fieldsHidden, setFieldsHidden] = useState(props.stock?.trade == undefined);

  const [priceType, setPriceType] = useState<ORDER_priceType>(buyOrder?.priceType || ORDER_priceType.MARKET);
  const [productType, setProductType] = useState<ORDER_productType>(buyOrder?.product || ORDER_productType.MIS);

  const isBuyOrderActive = buyOrder && buyOrder?.status != ORDER_status.EXITED;
  const isSellOrderActive = sellOrder && sellOrder?.status != ORDER_status.EXITED;
  const isOrderActive = isBuyOrderActive || isSellOrderActive;

  const ltpFieldRef = useRef<HTMLInputElement>(null);
  const buyPriceFieldRef = useRef<HTMLInputElement>(null);
  const sellPriceFieldRef = useRef<HTMLInputElement>(null);
  const quantityFieldRef = useRef<HTMLInputElement>(null);
  const thresholdFieldRef = useRef<HTMLInputElement>(null);
  const riskFieldRef = useRef<HTMLInputElement>(null);
  const exitDropFieldRef = useRef<HTMLInputElement>(null);
  const exitProfitFieldRef = useRef<HTMLInputElement>(null);

  const quantity = buyOrder?.quantity ?? ORDER_defaults.quantity;
  const threshold = buyOrder?.threshold ?? ORDER_defaults.threshold;
  const risk = buyOrder?.risk ?? ORDER_defaults.risk;
  const exitDrop = buyOrder?.exitDrop ?? ORDER_defaults.exitDrop;
  const exitProfit = buyOrder?.exitProfit ?? ORDER_defaults.exitProfit;

  const enterTrade = () => {
    let execute_buyOrder: Omit<ORDER.executeOrderFields, "action"> & { action: ORDER_action.BUY } = {
      keyId: props.stock.keyId,
      apiKey: process.env.client1ApiKey ?? "",
      strategy: ORDER_defaults.strategy,
      symbol: props.stock.symbol,
      exchange: ORDER_exchange.BSE,
      quantity: quantityFieldRef.current ? parseInt(quantityFieldRef.current.value) : quantity,
      price: buyPriceFieldRef.current ? parseFloat(buyPriceFieldRef.current.value) : ORDER_defaults.price,
      priceType,
      product: productType,
      action: ORDER_action.BUY,
      threshold: thresholdFieldRef.current ? parseFloat(thresholdFieldRef.current?.value) : threshold,
      risk: riskFieldRef.current ? parseFloat(riskFieldRef.current.value) : risk,
      exitDrop: exitDropFieldRef.current ? parseFloat(exitDropFieldRef.current.value) : exitDrop,
      exitProfit: exitProfitFieldRef.current ? parseFloat(exitProfitFieldRef.current.value) : exitProfit,
    };

    const execute_sellOrder: Omit<ORDER.executeOrderFields, "action"> & { action: ORDER_action.SELL } = {
      keyId: props.stock.keyId,
      apiKey: process.env.client2ApiKey ?? "",
      strategy: ORDER_defaults.strategy,
      symbol: props.stock.symbol,
      exchange: ORDER_exchange.BSE,
      quantity: quantityFieldRef.current ? parseInt(quantityFieldRef.current.value) : quantity,
      price: buyPriceFieldRef.current ? parseFloat(buyPriceFieldRef.current.value) : ORDER_defaults.price,
      priceType,
      product: productType,
      action: ORDER_action.SELL,
      threshold: thresholdFieldRef.current ? parseFloat(thresholdFieldRef.current?.value) : threshold,
      risk: riskFieldRef.current ? parseFloat(riskFieldRef.current.value) : risk,
      exitDrop: exitDropFieldRef.current ? parseFloat(exitDropFieldRef.current.value) : exitDrop,
      exitProfit: exitProfitFieldRef.current ? parseFloat(exitProfitFieldRef.current.value) : exitProfit,
    };
    api.event({
      data: {
        event: {
          type: "TRADE",
          action: {
            type: "ENTER_TRADE",
            data: {
              userId: store.getState().user.user?.id ?? "",
              trade: {
                keyId: props.stock.keyId,
                symbol: props.stock.symbol,
                exchange: props.stock.exchange,
                priceType,
                product: productType,
                threshold: thresholdFieldRef.current ? parseFloat(thresholdFieldRef.current?.value) : threshold,
                risk: riskFieldRef.current ? parseFloat(riskFieldRef.current.value) : risk,
                exitDrop: exitDropFieldRef.current ? parseFloat(exitDropFieldRef.current.value) : exitDrop,
                exitProfit: exitProfitFieldRef.current ? parseFloat(exitProfitFieldRef.current.value) : exitProfit,
                orders: [execute_buyOrder, execute_sellOrder],
              },
            },
          },
        },
      },
    });
  };

  useEffect(() => {
    const ltpListenerIdRef = `tradeBlockHeader_openAlgoListener_${props.stock.keyId}`;

    eventBus.setEventListener(ltpListenerIdRef, "OPENALGO", async (action) => {
      switch (action.type) {
        case "LTP":
          {
            if (
              props.stock.keyId.includes(getSymbolKey({ symbol: action.data.symbol, exchange: action.data.exchange }))
            ) {
              setLtp((preLtp) => {
                if (action.data.ltp > preLtp) {
                  if (ltpFieldRef.current) ltpFieldRef.current.style.color = "#00cc00";
                } else if (action.data.ltp < preLtp) {
                  if (ltpFieldRef.current) ltpFieldRef.current.style.color = "#aa0000";
                }
                return action.data.ltp;
              });
            }
          }
          break;

        default:
          break;
      }
    });

    return () => {
      eventBus.removeEventListener(ltpListenerIdRef, "OPENALGO");
    };
  }, []);

  return (
    <div className={`foreground ${styles.container}`}>
      <div className={styles.topSection}>
        <div className={styles.stockInfoGroup}>
          <div className={styles.topInfoRow}>
            <div className={`${styles.infoCard} ${styles.stockNameCard}`}>
              <p className={`subtle-text ${styles.labelText}`}>Symbol Name</p>
              <div className={styles.symbolContainer}>
                <h5 className={styles.symbolText}>{props.stock.symbol}</h5>
                <p className={styles.exchangeBadge}>{props.stock.exchange}</p>
              </div>
            </div>
            <div className={`${styles.infoCard} ${styles.centerCard}`}>
              <p className={`${styles.labelText}`}>Quantity</p>
              <div
                className={styles.valueText}
                style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}
              >
                <h5
                  title={buyOrder?.status}
                  style={{
                    color:
                      buyOrder?.status == "ACTIVE" ? "#00ff00" : buyOrder?.status == "EXITED" ? "#ff0000" : undefined,
                  }}
                >
                  {buyOrder ? buyOrder.quantity : "--"}
                </h5>
                <h5 style={{ margin: "0px 5px" }}>:</h5>
                <h5
                  title={sellOrder?.status}
                  style={{
                    color:
                      sellOrder?.status == "ACTIVE" ? "#00ff00" : sellOrder?.status == "EXITED" ? "#ff0000" : undefined,
                  }}
                >
                  {sellOrder ? sellOrder.quantity : "--"}
                </h5>
              </div>
            </div>
            <div className={[styles.infoCard, styles.ltpCard].join(" ")}>
              <p className={`${styles.labelText}`}>LTP</p>
              <h5 ref={ltpFieldRef} className={styles.valueText}>
                {ltp}
              </h5>
            </div>
          </div>
        </div>
        <div className={styles.actionsGroup}>
          <DropdownButton disabled={isOrderActive} variant="outline-secondary" title={priceType}>
            <Dropdown.Item
              onClick={() => {
                setPriceType(ORDER_priceType.MARKET);
              }}
            >
              MARKET
            </Dropdown.Item>
            <Dropdown.Item
              //disabled
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
          <DropdownButton disabled={isOrderActive} variant="outline-secondary" title={productType}>
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
          <Button onClick={enterTrade} disabled={isOrderActive}>
            Enter Trade
          </Button>
          <DropdownButton variant="outline-secondary" title={""}>
            <Dropdown.Item
              onClick={() => {
                setFieldsHidden(!fieldsHidden);
              }}
            >
              {fieldsHidden ? "EXPAND" : "COLLAPSE"}
            </Dropdown.Item>
            <Dropdown.Item
              disabled={isOrderActive}
              style={{ color: "red" }}
              onClick={() => {
                eventBus.emitEvent({
                  type: "CRUD",
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
      {!fieldsHidden && (
        <TradeDetails
          stock={props.stock}
          buyPriceFieldRef={buyPriceFieldRef}
          sellPriceFieldRef={sellPriceFieldRef}
          quantityFieldRef={quantityFieldRef}
          thresholdFieldRef={thresholdFieldRef}
          riskFieldRef={riskFieldRef}
          exitDropFieldRef={exitDropFieldRef}
          exitProfitFieldRef={exitProfitFieldRef}
          quantity={quantity}
          threshold={threshold}
          risk={risk}
          exitDrop={exitDrop}
          exitProfit={exitProfit}
          ltp={ltp}
        />
      )}
    </div>
  );
};
