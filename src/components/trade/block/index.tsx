import React, { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { IoEye, IoEyeOff } from "react-icons/io5";
import {
  ORDER_action,
  ORDER_exchange,
  ORDER_priceType,
  ORDER_productType,
  ORDER_status,
} from "../../../../../backend/src/crud/order/order.d";
import store from "../../../redux";
import eventBus from "../../../util/eventBus";
import { logger } from "../../../util/logger";
import { TradeDetails } from "./tradeDetails";
// theme modules are to be imported at last
import * as styles from "./index.module.scss";
import { getStockKeyId, getSymbolKey } from "../../../../../backend/src/util/helper";

//TODO [ ] if order status is received as PLACED and is PENDING keep checking for orderStatus in loop for buy & sell both order

export const Block = (props: { stock: STOCK.all }) => {
  const ltpFieldId = `ltp_${props.stock.keyId}`;

  const buyOrder = props.stock.trade?.orders?.find((o) => o.action == ORDER_action.BUY);
  const sellOrder = props.stock.trade?.orders?.find((o) => o.action == ORDER_action.SELL);

  const [fieldsHidden, setFieldsHidden] = useState(!props.stock.trade);

  const [priceType, setPriceType] = useState<ORDER_priceType>(buyOrder?.priceType || ORDER_priceType.MARKET);
  const [productType, setProductType] = useState<ORDER_productType>(buyOrder?.product || ORDER_productType.MIS);

  const isBuyOrderActive = buyOrder && buyOrder?.status != ORDER_status.EXITED;
  const isSellOrderActive = sellOrder && sellOrder?.status != ORDER_status.EXITED;
  const isOrderActive = isBuyOrderActive || isSellOrderActive;

  const enterTrade = (props: any) => {
    eventBus.emitEvent({
      type: "TRADE",
      action: {
        type: "ENTER_TRADE",
        data: {
          userId: store.getState().user.user?.id ?? "",
          trade: {
            keyId: "",
            symbol: "",
            exchange: "",
            orders: [
              {
                keyId: "",
                apiKey: "",
                orderId: "",
                symbol: "",
                exchange: ORDER_exchange.BSE,
                action: ORDER_action.BUY,
              },
              {
                keyId: "",
                apiKey: "",
                orderId: "",
                symbol: "",
                exchange: ORDER_exchange.BSE,
                action: ORDER_action.BUY,
              },
            ],
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
              const LTP_FIELD = document.getElementById(ltpFieldId);
              if (LTP_FIELD) {
                const preValue = parseFloat(LTP_FIELD.innerText);
                LTP_FIELD.innerText = action.data.ltp.toString();
                if (action.data.ltp > preValue) {
                  LTP_FIELD.style.color = "#00cc00";
                } else if (action.data.ltp < preValue) {
                  LTP_FIELD.style.color = "#aa0000";
                }
              }
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
  }, [props.stock]);

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
              <h5
                className={styles.valueText}
              >{`${buyOrder ? buyOrder.quantity : "--"} : ${sellOrder ? sellOrder.quantity : "--"}`}</h5>
            </div>
            <div className={[styles.infoCard, styles.ltpCard].join(" ")}>
              <p className={`${styles.labelText}`}>LTP</p>
              <h5 id={ltpFieldId} className={styles.valueText}>
                0
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
          <DropdownButton disabled={isOrderActive} variant="outline-secondary" title={""}>
            <Dropdown.Item
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
      {props.stock.trade && <TradeDetails stock={props.stock} trade={props.stock.trade} />}
    </div>
  );
};
