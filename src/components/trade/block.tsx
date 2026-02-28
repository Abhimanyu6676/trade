import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import store from "../../redux";
import { stocksSagaAction } from "../../redux/saga/stocksSaga";
import openAlgoClient, { useOnLtp } from "../../api";
import { getStockKeyId } from "../../util/helper";
import { _priceList, useOnPriceChange } from "./price";
import Alert from "../alert";
import {
  executeOrder,
  executeOrderType_i,
  exitTrade,
  handleLtp,
  settledDecimal,
  updateTrade,
} from "./order";
import * as styles from "./block.module.css";

//TODO [ ] if order status is received as PLACED and is PENDING keep checking for orderStatus in loop for buy & sell both order

const Block = (props: { stock: Stock_i }) => {
  const autoEnter = false;
  const [ltp, setLtp] = useState(0);
  const [orderPrice, setOrderPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [priceType, setPriceType] = useState<orderPriceType_i>("MARKET");
  const [productType, setProductType] = useState<orderProductType_i>("MIS");
  const [threshold, setThreshold] = useState(
    props.stock.buyOrder ? props.stock.buyOrder.threshold : 0.5,
  );
  const [risk, setRisk] = useState(
    props.stock.buyOrder ? props.stock.buyOrder.risk : 0.1,
  );
  const [exitDrop, setExitDrop] = useState(
    props.stock.buyOrder ? props.stock.buyOrder.exitDrop : 0.2,
  );
  const [thresholdCrossed, setThresholdCrossed] = useState(false);
  const [isModified, setIsModified] = useState(false);

  const isBuyOrderActive =
    props.stock.buyOrder && props.stock.buyOrder?.orderStatus == "ACTIVE";
  const isSellOrderActive =
    props.stock.sellOrder && props.stock.sellOrder?.orderStatus == "ACTIVE";
  const isOrderActive = isBuyOrderActive || isSellOrderActive;

  const upperThreshold = props.stock.buyOrder
    ? settledDecimal(
        props.stock.buyOrder.price +
          (props.stock.buyOrder.price / 100) * props.stock.buyOrder.threshold,
      )
    : 0;
  const lowerThreshold = props.stock.buyOrder
    ? settledDecimal(
        props.stock.buyOrder.price -
          (props.stock.buyOrder.price / 100) * props.stock.buyOrder.threshold,
      )
    : 0;

  const buyPnl = (() => {
    return settledDecimal(
      props.stock?.buyOrder?.orderStatus == "ACTIVE"
        ? (ltp - props.stock.buyOrder.price) * props.stock.buyOrder.quantity
        : props.stock?.buyOrder?.orderStatus == "EXITED"
          ? //@ts-ignore
            (props.stock.buyOrder.exitPrice - props.stock.buyOrder.price) *
            props.stock.buyOrder.quantity
          : 0,
    );
  })();
  const sellPnl = (() => {
    return settledDecimal(
      props.stock?.sellOrder?.orderStatus == "ACTIVE"
        ? (props.stock.sellOrder.price - ltp) * props.stock.sellOrder.quantity
        : props.stock?.sellOrder?.orderStatus == "EXITED"
          ? //@ts-ignore
            (props.stock.sellOrder.price - props.stock.sellOrder.exitPrice) *
            props.stock.sellOrder.quantity
          : 0,
    );
  })();
  const pnl = buyPnl + sellPnl;

  useEffect(() => {
    //TODO if BUY or SELL order active update StopLoss and trigger as per new threshold and risk
    if (isOrderActive) setIsModified(true);
    return () => {};
  }, [threshold, risk, exitDrop]);

  useEffect(() => {
    if (isOrderActive) {
      if (!thresholdCrossed && upperThreshold && lowerThreshold) {
        let _thresholdCrossed = ltp >= upperThreshold || ltp <= lowerThreshold;
        if (_thresholdCrossed) {
          Alert.notify({
            heading: `Threshold crossed for ${props.stock.key_id}`,
            variant: "warning",
          });
          setThresholdCrossed(true);
          const exitSell = ltp >= upperThreshold;
          const exitBuy = ltp <= lowerThreshold;
          const _o: order_i | undefined = exitSell
            ? props.stock.sellOrder
            : exitBuy
              ? props.stock.buyOrder
              : undefined;
          //_o && exitTrade({ stock: props.stock, orders: [{ ..._o }] });
        }
      }
      handleLtp({
        stock: props.stock,
        ltp,
        thresholdCrossed,
      });
    }

    return () => {};
  }, [ltp]);

  useOnLtp(props.stock.key_id, (data) => {
    if (props.stock.key_id == getStockKeyId(data)) {
      setLtp(data.ltp);
    }
  });

  //TODO remove after testing
  /* useOnPriceChange({
    priceList: _priceList,
    callback: (data) => {
      setLtp(data.lp);
    },
  }); */

  const enterTrade = async () => {
    console.log(
      `Entering Trade for ${props.stock.symbol} at ${props.stock.exchange}`,
    );

    let orderTemplate: Omit<Omit<executeOrderType_i, "action">, "apiKey"> = {
      strategy: "nodeJS",
      symbol: props.stock.symbol,
      exchange: props.stock.exchange,
      priceType: priceType,
      product: productType,
      quantity,
      price: priceType == "LIMIT" ? orderPrice : 0,
      triggerPrice: 0,
      disclosedQuantity: 0,
      threshold,
      risk,
      exitDrop,
    };

    executeOrder({
      stock: props.stock,
      order: {
        ...orderTemplate,
        apiKey: openAlgoClient.getClient1().apiKey,
        action: "BUY",
      },
    });
    executeOrder({
      stock: props.stock,
      order: {
        ...orderTemplate,
        apiKey: openAlgoClient.getClient2().apiKey,
        action: "SELL",
      },
    });
  };

  useEffect(() => {
    autoEnter && enterTrade();
    return () => {};
  }, []);

  return (
    <div
      className="container"
      style={{
        backgroundColor: "#f1f1f1",
        border: "1px solid #eeeeee",
        borderRadius: 10,
        padding: 20,
        marginTop: 20,
      }}
    >
      <div //block
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div // Stock Name, Quantity and LTP Views
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <div style={{ minWidth: 200 }}>
            <p style={{ margin: 0, padding: 0, fontSize: 12 }}>Symbol Name</p>
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
                style={{
                  fontSize: 12,
                  margin: 0,
                  marginLeft: 5,
                  border: "1px solid #000000",
                  padding: "0px 5px",
                }}
              >
                {props.stock.exchange}
              </p>
            </div>
          </div>
          <div style={{ minWidth: 100 }}>
            <p style={{ margin: 0, padding: 0, fontSize: 12 }}>Quantity</p>
            <h5>{`${props.stock.buyOrder ? props.stock.buyOrder.quantity : "--"} : ${props.stock.sellOrder ? props.stock.sellOrder.quantity : "--"}`}</h5>
          </div>
          <div style={{ minWidth: 100 }}>
            <p style={{ margin: 0, padding: 0, fontSize: 12 }}>LTP</p>
            <h5>{ltp}</h5>
          </div>
        </div>
        <div // Enter trade & trade priceType Button
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Button
            style={{
              marginRight: 10,
            }}
            onClick={enterTrade}
            disabled={isOrderActive}
          >
            Enter Trade
          </Button>
          <DropdownButton
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
          <DropdownButton
            disabled={isOrderActive}
            variant="outline-secondary"
            title={productType}
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
        </div>
      </div>
      <div // data rows
        style={{
          marginTop: 20,
          backgroundColor: "#ffffff",
          borderRadius: 5,
          padding: "10px 0px",
        }}
      >
        <MasterRow // Buy/Sell order price
        >
          <ChildRow heading="Buy Order Price">
            <Form.Control
              className={styles.input}
              type="number"
              disabled={isBuyOrderActive}
              value={
                props.stock.buyOrder ? props.stock.buyOrder.price : orderPrice
              }
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
              value={
                props.stock.sellOrder ? props.stock.sellOrder.price : orderPrice
              }
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
              className={styles.input}
              type="number"
              disabled={isOrderActive}
              value={
                props.stock.buyOrder ? props.stock.buyOrder.quantity : quantity
              }
              onChange={(e) => {
                setQuantity(parseInt(e.target.value));
              }}
            />
          </ChildRow>
          <ChildRow heading="Threshold %">
            <Form.Control
              className={styles.input}
              type="number"
              value={threshold}
              onChange={(e) => {
                setThreshold(parseFloat(e.target.value));
              }}
            />
          </ChildRow>
        </MasterRow>

        <MasterRow // risk and dropDownExit fields
        >
          <ChildRow heading="Risk %">
            <Form.Control
              className={styles.input}
              type="number"
              value={risk}
              onChange={(e) => {
                setRisk(parseInt(e.target.value));
              }}
            />
          </ChildRow>
          <ChildRow heading="Exit on Drop %">
            <Form.Control
              className={styles.input}
              type="number"
              value={exitDrop}
              onChange={(e) => {
                setExitDrop(parseFloat(e.target.value));
              }}
            />
          </ChildRow>
        </MasterRow>

        <MasterRow // upper/lower threshold
        >
          <ChildRow heading="Upper Threshold" value={upperThreshold} />
          <ChildRow heading="Lower Threshold" value={lowerThreshold} />
        </MasterRow>

        <MasterRow // buy/sell prices for both orders
        >
          <ChildRow
            heading="Buy Order (Buy::Sell)"
            value={`${props.stock.buyOrder?.price ? props.stock.buyOrder?.price : "N/A"} :: ${props.stock.buyOrder?.exitPrice ? props.stock.buyOrder?.exitPrice : "N/A"}`}
          />
          <ChildRow
            heading="Sell Order (Buy::Sell)"
            value={`${props.stock.sellOrder?.price ? props.stock.sellOrder?.price : "N/A"} :: ${props.stock.sellOrder?.exitPrice ? rops.stock.sellOrder?.exitPrice : "N/A"}`}
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
          <ChildRow heading="PnL %" value={"to be set"} />
        </MasterRow>

        <MasterRow // threshold graph view
        >
          <ChildRow heading="Threshold View">
            {(true || (props.stock.buyOrder && props.stock.sellOrder)) &&
              ThresholdView({
                thresholdCrossed,
                ltp,
                upperThreshold,
                lowerThreshold,
              })}
          </ChildRow>
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
            variant={isModified ? "success" : "outline-success"}
            disabled={!isModified}
            onClick={() => {
              console.log("updating Order -- ", isOrderActive);
              console.log("props", threshold, risk, exitDrop);
              updateTrade({ stock: props.stock, threshold, risk, exitDrop });
              setIsModified(false);
            }}
          >
            Update Order
          </Button>
          <Button
            variant={isOrderActive ? "danger" : "outline-danger"}
            disabled={!isOrderActive}
            style={{
              marginLeft: 20,
            }}
            onClick={() => {
              console.log("Exit Order");
              props.stock.buyOrder &&
                exitTrade({
                  stock: props.stock,
                  orders: [props.stock.buyOrder],
                });
              props.stock.sellOrder &&
                exitTrade({
                  stock: props.stock,
                  orders: [props.stock.sellOrder],
                });
            }}
          >
            Exit Trade
          </Button>
          <Button
            variant={isBuyOrderActive ? "danger" : "outline-danger"}
            disabled={!isBuyOrderActive}
            style={{
              marginLeft: 20,
            }}
            onClick={() => {
              console.log("Exit Buy Order");
              props.stock.buyOrder &&
                exitTrade({
                  stock: props.stock,
                  orders: [props.stock.buyOrder],
                });
            }}
          >
            Exit Buy
          </Button>
          <Button
            variant={isSellOrderActive ? "danger" : "outline-danger"}
            disabled={!isSellOrderActive}
            style={{
              marginLeft: 20,
            }}
            onClick={() => {
              console.log("Exit Sell Order");
              props.stock.sellOrder &&
                exitTrade({
                  stock: props.stock,
                  orders: [props.stock.sellOrder],
                });
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
            variant="outline-danger"
            disabled={isOrderActive}
            style={{
              marginLeft: 20,
            }}
            onClick={() => {
              console.log("removing Symbol from List ", props.stock.key_id);
              store.dispatch(
                stocksSagaAction({
                  removeStocks: [props.stock],
                }),
              );
            }}
          >
            Remove Symbol
          </Button>
        </div>
      </div>
    </div>
  );
};

const MasterRow = (props: { children?: any }) => {
  return <div className={styles.masterRow}>{props.children}</div>;
};

const ChildRow = (props: {
  children?: React.JSX.Element;
  heading: string;
  value?: string | number;
}) => {
  return (
    <div className={styles.childRow}>
      <p className={styles.heading}>{props.heading}</p>
      <div>
        {props.value != undefined ? (
          <p className={styles.value}>{props.value}</p>
        ) : (
          props.children
        )}
      </div>
    </div>
  );
};

const ThresholdView = (props: {
  thresholdCrossed: boolean;
  ltp: number;
  upperThreshold: number;
  lowerThreshold: number;
}) => {
  /** keep this even number array automatically add a center stick */
  const pointerPlace = props.thresholdCrossed
    ? 0
    : ((props.ltp - props.lowerThreshold) /
        (props.upperThreshold - props.lowerThreshold)) *
      100;
  const thresholdViewSticksCount = 14;
  const thresholdViewHeight = 40;
  const thresholdViewHeightDecline = 3;
  return (
    <div
      className="container"
      style={{
        //backgroundColor: "#eeeeee",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ fontSize: 12, color: "#777" }}>{props.lowerThreshold}</p>
      <div // threshold bar container
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          //border: "1px solid #000000",
          position: "relative",
          margin: "0px 10px",
        }}
      >
        <div // threshold pointer
          style={{
            backgroundColor: "#555",
            height: thresholdViewHeight + 5,
            width: 3,
            borderRadius: 20,
            position: "absolute",
            left: `${pointerPlace}%`,
            opacity: pointerPlace ? 1 : 0,
          }}
        />
        {Array(thresholdViewSticksCount + 1)
          .fill(0)
          .map((i, index) => {
            return (
              <div
                style={{
                  /*  height:
                    index > 7 ? 50 - 7 * 3 + (index - 7) * 3 : 50 - index * 3, */
                  height:
                    index > thresholdViewSticksCount / 2
                      ? thresholdViewHeight -
                        (thresholdViewSticksCount / 2) *
                          thresholdViewHeightDecline +
                        (index - thresholdViewSticksCount / 2) *
                          thresholdViewHeightDecline
                      : thresholdViewHeight -
                        index * thresholdViewHeightDecline,
                  width: 5,
                  borderRadius: 20,
                  marginRight: index == thresholdViewSticksCount ? 0 : 6,
                  backgroundColor: `rgb(${255 - index * 15}, ${35 + index * 15}, 50)`,
                }}
              ></div>
            );
          })}
      </div>
      <p style={{ fontSize: 12, color: "#777" }}>{props.upperThreshold}</p>
    </div>
  );
};

export default Block;
