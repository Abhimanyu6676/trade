import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import store from "../../redux";
import { stocksSagaAction } from "../../redux/saga/stocksSaga";
import * as styles from "./block.module.css";
import { getStockKeyId, settledDecimal } from "../../util/helper";
import { useOnLtp } from "../../hooks/useLtpHook";

//TODO [ ] if order status is received as PLACED and is PENDING keep checking for orderStatus in loop for buy & sell both order

const Block = (props: { stock: Stock_i }) => {
  const [ltp, setLtp] = useState(0);

  const buyOrder = props.stock?.orders?.find((o) => o.action == "BUY");
  const sellOrder = props.stock?.orders?.find((o) => o.action == "SELL");

  const [orderPrice, setOrderPrice] = useState(buyOrder?.price || 0);
  const [quantity, setQuantity] = useState(buyOrder?.quantity || 0);
  const [priceType, setPriceType] = useState<orderPriceType_i>(
    buyOrder?.priceType || "MARKET",
  );
  const [productType, setProductType] = useState<orderProductType_i>(
    buyOrder?.product || "MIS",
  );
  const [threshold, setThreshold] = useState(buyOrder?.threshold || 0);
  const [risk, setRisk] = useState(buyOrder?.risk || 0);
  const [exitDrop, setExitDrop] = useState(buyOrder?.exitDrop || 0);
  const [isModified, setIsModified] = useState(false);

  const isBuyOrderActive = buyOrder?.orderStatus != "EXITED";
  const isSellOrderActive = sellOrder?.orderStatus != "EXITED";
  const isOrderActive = isBuyOrderActive || isSellOrderActive;

  const upperThreshold = settledDecimal(
    buyOrder
      ? buyOrder?.price + (buyOrder?.price / 100) * buyOrder?.threshold
      : 0,
  );
  const lowerThreshold = settledDecimal(
    buyOrder
      ? buyOrder?.price - (buyOrder?.price / 100) * buyOrder?.threshold
      : 0,
  );

  const buyPnl = settledDecimal(
    buyOrder?.orderStatus == "ACTIVE"
      ? (ltp - buyOrder.price) * buyOrder.quantity
      : buyOrder?.orderStatus == "EXITED" && buyOrder?.exitPrice
        ? (buyOrder.exitPrice - buyOrder.price) * buyOrder.quantity
        : 0,
  );
  const sellPnl = settledDecimal(
    sellOrder?.orderStatus == "ACTIVE"
      ? (sellOrder.price - ltp) * sellOrder.quantity
      : sellOrder?.orderStatus == "EXITED" && sellOrder?.exitPrice
        ? (sellOrder.price - sellOrder.exitPrice) * sellOrder.quantity
        : 0,
  );
  const pnl = buyPnl + sellPnl;

  useEffect(() => {
    if (isOrderActive) setIsModified(true);
    return () => {};
  }, [threshold, risk, exitDrop]);

  useOnLtp({
    id: props.stock.key_id,
    callback: (data) => {
      //console.log(`ltpdata in stock block ${props.stock.key_id}`, data);
      const dataKeyId = getStockKeyId(data);
      if (props.stock.key_id == dataKeyId) setLtp(parseFloat(data.ltp));
    },
  });

  const enterTrade = async () => {
    let orderTemplate: Omit<Omit<enterTradeOrder_i, "action">, "apiKey"> = {
      key_id: props.stock.key_id,
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
      risk,
      exitDrop,
    };

    const order1 = {
      stock: props.stock,
      order: {
        ...orderTemplate,
        apiKey: "",
        action: "BUY",
      },
    };
    const order2 = {
      stock: props.stock,
      order: {
        ...orderTemplate,
        apiKey: "",
        action: "SELL",
      },
    };
  };

  const updateTrade = async (props: {
    stock: Stock_i;
    threshold: number;
    risk: number;
    exitDrop: number;
  }) => {
    //TODO update order with new threshold, risk and exitDrop values
  };

  const exitTrade = async (props: { stock: Stock_i; orders: order_i[] }) => {};

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
            <h5>{`${buyOrder ? buyOrder.quantity : "--"} : ${sellOrder ? sellOrder.quantity : "--"}`}</h5>
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
            //onClick={enterTrade}
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
              className={styles.input}
              type="number"
              disabled={isOrderActive}
              value={buyOrder ? buyOrder.quantity : quantity}
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
          <ChildRow heading="PnL %" value={"to be set"} />
        </MasterRow>

        <MasterRow // threshold graph view
        >
          <ChildRow heading="Threshold View">
            {(true || buyOrder || sellOrder) &&
              ThresholdView({
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
              buyOrder &&
                exitTrade({
                  stock: props.stock,
                  orders: [buyOrder],
                });
              sellOrder &&
                exitTrade({
                  stock: props.stock,
                  orders: [sellOrder],
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
              buyOrder &&
                exitTrade({
                  stock: props.stock,
                  orders: [buyOrder],
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
              sellOrder &&
                exitTrade({
                  stock: props.stock,
                  orders: [sellOrder],
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
  ltp: number;
  upperThreshold: number;
  lowerThreshold: number;
}) => {
  /** keep this even number array automatically add a center stick */

  const thresholdCrossed =
    props.ltp >= props.lowerThreshold && props.ltp <= props.upperThreshold;

  const pointerPlace = thresholdCrossed
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
