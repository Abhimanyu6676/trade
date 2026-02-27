import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import store from "../../redux";
import { stocksSagaAction } from "../../redux/saga/stocksSaga";
import openAlgoClient, { useOnLtp } from "../../api";
import { getStockKeyId } from "../../util/helper";
import { _priceList, useOnPriceChange } from "./price";
import Decimal from "decimal.js";
import Alert from "../alert";
import {
  executeOrder,
  executeOrderType_i,
  exitTrade,
  handleLtp,
  updateTrade,
} from "./order";

//TODO [ ] if order status is received as PLACED and is PENDING keep checking for orderStatus in loop for buy & sell both order

const Block = (props: { stock: Stock_i }) => {
  const testingMode = false;
  const autoEnter = false;
  const [ltp, setLtp] = useState(0);
  const [orderPrice, setOrderPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [priceType, setPriceType] = useState<orderPriceType_i>("MARKET");
  const [productType, setProductType] = useState<orderProductType_i>(
    testingMode ? "CNC" : "MIS",
  );
  const [threshold, setThreshold] = useState(
    props.stock.buyOrder ? props.stock.buyOrder.threshold : 0.5,
  );
  const [thresholdCrossed, setThresholdCrossed] = useState(false);
  const [exitDrop, setExitDrop] = useState(
    props.stock.buyOrder ? props.stock.buyOrder.exitDrop : 0.25,
  );
  const [risk, setRisk] = useState(
    props.stock.buyOrder ? props.stock.buyOrder.risk : 0.25,
  );
  const [isModified, setIsModified] = useState(false);

  const isBuyOrderActive =
    props.stock.buyOrder && props.stock.buyOrder?.orderStatus == "ACTIVE";
  const isSellOrderActive =
    props.stock.sellOrder && props.stock.sellOrder?.orderStatus == "ACTIVE";
  const isOrderActive = isBuyOrderActive || isSellOrderActive;

  const upperThreshold = props.stock.buyOrder
    ? new Decimal(
        props.stock.buyOrder.price +
          (props.stock.buyOrder.price / 100) * props.stock.buyOrder.threshold,
      )
        .toDecimalPlaces(2)
        .toNumber()
    : 0;

  const lowerThreshold = props.stock.buyOrder
    ? new Decimal(
        props.stock.buyOrder.price -
          (props.stock.buyOrder.price / 100) * props.stock.buyOrder.threshold,
      )
        .toDecimalPlaces(2)
        .toNumber()
    : 0;

  const buyPnl = (() => {
    return new Decimal(
      props.stock?.buyOrder?.orderStatus == "ACTIVE"
        ? (ltp - props.stock.buyOrder.price) * props.stock.buyOrder.quantity
        : props.stock?.buyOrder?.orderStatus == "EXITED"
          ? //@ts-ignore
            (props.stock.buyOrder.exitPrice - props.stock.buyOrder.price) *
            props.stock.buyOrder.quantity
          : 0,
    )
      .toDecimalPlaces(2)
      .toNumber();
  })();
  const sellPnl = (() => {
    return new Decimal(
      props.stock?.sellOrder?.orderStatus == "ACTIVE"
        ? (props.stock.sellOrder.price - ltp) * props.stock.sellOrder.quantity
        : props.stock?.sellOrder?.orderStatus == "EXITED"
          ? //@ts-ignore
            (props.stock.sellOrder.price - props.stock.sellOrder.exitPrice) *
            props.stock.sellOrder.quantity
          : 0,
    )
      .toDecimalPlaces(2)
      .toNumber();
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

  /* useOnLtp(props.stock.key_id, (data) => {
    if (props.stock.key_id == getStockKeyId(data)) {
      setLtp(data.ltp);
    }
  }); */

  //TODO remove after testing
  useOnPriceChange({
    priceList: _priceList,
    callback: (data) => {
      setLtp(data.lp);
    },
  });

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

    if (testingMode) {
    } else {
      executeOrder({
        stock: props.stock,
        order: {
          ...orderTemplate,
          apiKey: openAlgoClient.getClient1().apiKey,
          action: "BUY",
        },
        tempPrice: testingMode ? ltp : 0,
      });
      executeOrder({
        stock: props.stock,
        order: {
          ...orderTemplate,
          apiKey: openAlgoClient.getClient2().apiKey,
          action: "SELL",
        },
        tempPrice: testingMode ? ltp : 0,
      });
    }
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
        <Row
          key1="Buy Order Price"
          value1Disabled={isBuyOrderActive}
          value1={
            props.stock.buyOrder ? props.stock.buyOrder.price : orderPrice
          }
          value1Setter={setOrderPrice}
          key2="Sell Order Price"
          value2Disabled={isSellOrderActive}
          value2={
            props.stock.sellOrder ? props.stock.sellOrder.price : orderPrice
          }
          value2Setter={setOrderPrice}
        />
        <Row
          key1="Buy/Sell Order Quantity"
          value1Disabled={isOrderActive}
          value1={
            props.stock.buyOrder ? props.stock.buyOrder.quantity : quantity
          }
          value1Setter={setQuantity}
          key2="Exit on Drop %"
          value2={exitDrop}
          value2Setter={setExitDrop}
        />
        <Row
          key1="Threshold %"
          value1={threshold}
          value1Setter={setThreshold}
          key2="Risk %"
          value2={risk}
          value2Setter={setRisk}
        />
        <Row
          key1="Upper Threshold"
          value1Disabled
          value1={upperThreshold}
          value2Disabled
          key2="Lower Threshold"
          value2={lowerThreshold}
        />
        <Row
          key1="Buy Position"
          value1Disabled
          value1={
            props.stock.buyOrder ? props.stock.buyOrder.orderStatus : "N/A"
          }
          key2="Sell Position"
          value2Disabled
          value2={
            props.stock.sellOrder ? props.stock.sellOrder.orderStatus : "N/A"
          }
        />
        <Row
          key1="Buy PnL"
          value1Disabled
          value1={buyPnl}
          key2="Sell PnL"
          value2Disabled
          value2={sellPnl}
        />
        <Row
          Col1={
            props.stock.buyOrder && props.stock.sellOrder ? (
              ThresholdView({
                thresholdCrossed,
                ltp,
                upperThreshold,
                lowerThreshold,
              })
            ) : (
              <></>
            )
          }
          key2="Net PnL"
          value2Disabled
          value2={pnl}
        />
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

const Row = (props: {
  Col1?: React.JSX.Element;
  key1?: string;
  value1?: number | string;
  value1Disabled?: boolean;
  value1Setter?: React.Dispatch<React.SetStateAction<number>>;
  col2?: React.JSX.Element;
  key2?: string;
  value2?: number | string;
  value2Disabled?: boolean;
  value2Setter?: React.Dispatch<React.SetStateAction<number>>;
}) => {
  return (
    <div
      style={{
        //backgroundColor: "#ff0000",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        //marginTop: 10,
      }}
    >
      <div style={{ flex: 1 }}>
        {props.Col1 ? (
          props.Col1
        ) : (
          <Coll
            disabled={props.value1Disabled}
            keyword={props.key1}
            value={props.value1}
            setValue={props.value1Setter}
          />
        )}
      </div>
      <div style={{ flex: 1 }}>
        {props.col2 ? (
          props.col2
        ) : (
          <Coll
            disabled={props.value2Disabled}
            keyword={props.key2}
            value={props.value2}
            setValue={props.value2Setter}
          />
        )}
      </div>
    </div>
  );
};

const Coll = (props: {
  keyword?: string;
  value?: number | string;
  disabled?: boolean;
  setValue?: React.Dispatch<React.SetStateAction<number>>;
}) => {
  return (
    <div
      className="container"
      style={{
        //backgroundColor: "#0000ff",
        flex: 1,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
      }}
    >
      <p style={{ fontWeight: "normal", fontSize: 15, margin: 0, padding: 0 }}>
        {props.keyword}
      </p>
      {props.value != undefined && (
        <div>
          <InputGroup className="">
            <Form.Control
              type={typeof props.value === "string" ? "string" : "number"}
              disabled={props.disabled}
              placeholder={"-----"}
              style={{ width: 100, height: 30, fontSize: 15 }}
              value={props.value}
              onChange={(e) => {
                props.setValue &&
                  props.setValue(
                    //@ts-ignore
                    typeof props.value === "string"
                      ? e.target.value
                      : parseFloat(e.target.value),
                  );
              }}
            />
          </InputGroup>
        </div>
      )}
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
  const thresholdViewHeight = 50;
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
          margin: "0px 20px",
        }}
      >
        <div // threshold pointer
          style={{
            backgroundColor: "#555",
            height: 55,
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
