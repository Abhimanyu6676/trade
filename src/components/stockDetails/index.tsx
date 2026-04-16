import React, { useEffect, useState } from "react";
import { decimal, getSymbolKeyFromKeyId } from "../../../../backend/src/util/helper";
import { uuid_v4 } from "../../util/uuid";
import * as themeVariables from "../../styles/themeVariables.module.scss";
import Form from "react-bootstrap/Form";
import { ORDER_action } from "../../../../backend/src/crud/order/order_constants";
import api from "../../services/api/axios";

export const StockDetailsComp = () => {
  const params = new URLSearchParams(location.search);
  const keyId = params.get("keyId");

  const [date, setDate] = useState<{ day: number; month: number; year: number }>({
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [trades, setTrades] = useState<TRADE.all[] | undefined>([]);

  useEffect(() => {
    if (keyId)
      api.db.trade
        .getUserTradesByDate({ ...date, keyId })
        .then((res) => {
          console.log("getUserTradesByDate RESPONSE : ", res);
          if (res.data?.trades) {
            console.log("we got the trades.", res.data?.trades?.length);
            setTrades(res.data.trades);
          }
        })
        .catch((err) => {
          console.log("getUserTradesByDate ERROR : ", err);
        });

    return () => {};
  }, [date]);

  if (!keyId) return null;
  else
    return (
      <div className="container">
        <div style={{ display: "flex", flexDirection: "column", gap: 30, marginTop: 30 }}>
          <div
            className="foreground"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              borderRadius: 5,
              padding: 10,
            }}
          >
            <div style={{ display: "flex", flexDirection: "row", gap: 30 }}>
              <OrderDetailBlock subText="Stock Name" heading={getSymbolKeyFromKeyId({ keyId: keyId })} />
              <OrderDetailBlock
                subText="Total Pnl"
                heading={(() => {
                  let totalPnl = 0;
                  let pnlPercentage = 0;
                  trades?.forEach((trade) => {
                    const buyOrder = trade?.orders?.find((order) => order.action == ORDER_action.BUY);
                    const sellOrder = trade?.orders?.find((order) => order.action == ORDER_action.SELL);

                    if (!trade || !buyOrder || !sellOrder) return null;

                    const buyOrderPnl = buyOrder.exitPrice ? buyOrder.exitPrice - buyOrder.price : 0;
                    const sellOrderPnl = sellOrder.exitPrice ? sellOrder.price - sellOrder.exitPrice : 0;

                    const _netPnl = decimal(buyOrderPnl + sellOrderPnl);
                    const _totalPnl = _netPnl * buyOrder.quantity;
                    const _pnlPercentage = decimal((_netPnl / buyOrder.price) * 100);

                    totalPnl += _totalPnl;
                    pnlPercentage += _pnlPercentage;
                  });
                  return `${totalPnl} (${pnlPercentage}%)`;
                })()}
              />
            </div>
            <Form.Group controlId="trade_date_selector_id">
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <Form.Control
                  type="date"
                  name="dob"
                  defaultValue={`${date.year}-${date.month}-${date.day}`}
                  placeholder=""
                  onChange={(e) => {
                    const _date = e.target.value;
                    console.log("Selected date = ", _date);
                    const dateSplit = _date.split("-");
                    setDate({
                      day: parseInt(dateSplit[2]),
                      month: parseInt(dateSplit[1]),
                      year: parseInt(dateSplit[0]),
                    });
                    console.log("newDate =", date);
                  }}
                />
              </div>
            </Form.Group>
          </div>
          {trades?.map((trade) => (
            <TradeDetails trade={trade} />
          ))}
        </div>
      </div>
    );
};

const TradeDetails = (props: { trade: TRADE.all }) => {
  const trade = props.trade;

  const buyOrder = trade?.orders?.find((order) => order.action == ORDER_action.BUY);
  const sellOrder = trade?.orders?.find((order) => order.action == ORDER_action.SELL);

  if (!trade || !buyOrder || !sellOrder) return null;

  const buyOrderPnl = buyOrder.exitPrice ? buyOrder.exitPrice - buyOrder.price : 0;
  const sellOrderPnl = sellOrder.exitPrice ? sellOrder.price - sellOrder.exitPrice : 0;

  const netPnl = decimal(buyOrderPnl + sellOrderPnl);
  const totalPnl = netPnl * buyOrder.quantity;
  const pnlPercentage = decimal((netPnl / buyOrder.price) * 100);

  return (
    <div className="foreground" style={{ borderRadius: 5, padding: 10 }}>
      <div style={{ display: "flex", flexDirection: "row", gap: 30, alignItems: "center" }}>
        <OrderDetailBlock subText="Trade ID" heading={trade.id} />
        <OrderDetailBlock subText="Started At" heading={new Date(trade.createdAt).toLocaleTimeString()} />
        <OrderDetailBlock subText="Quantity" heading={buyOrder.quantity} />
        <OrderDetailBlock
          subText="Net PnL%"
          heading={pnlPercentage}
          headingStyle={{ color: pnlPercentage > 0 ? "#00ff00" : "#ff0000" }}
        />
        <OrderDetailBlock
          subText="Net PnL"
          heading={totalPnl}
          headingStyle={{ color: totalPnl > 0 ? "#00ff00" : "#ff0000" }}
        />
      </div>
      <OrderDetails order={buyOrder} />
      <OrderDetails order={sellOrder} />
    </div>
  );
};
const OrderDetails = (props: { order: ORDER.base }) => {
  const buyPrice = props.order?.action == ORDER_action.BUY ? props.order.price : props.order?.exitPrice;
  const sellPrice = props.order?.action == ORDER_action.BUY ? props.order.exitPrice : props.order?.price;

  if (!buyPrice || !sellPrice) return null;

  const pnl = decimal(sellPrice - buyPrice);
  const totalPnl = pnl * props.order.quantity;
  const pnlPercentage = decimal((pnl / buyPrice) * 100);

  return (
    <div style={{ backgroundColor: themeVariables.primaryColorDark, padding: 10, borderRadius: 5, marginTop: 20 }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 20 }}>
        <OrderDetailBlock subText="Order Action" heading={props.order?.action} />
        <OrderDetailBlock subText="Buy Price" heading={buyPrice} />
        <OrderDetailBlock subText="Sell Price" heading={sellPrice} />
        <OrderDetailBlock subText="Quantity" heading={props.order?.quantity} />
        <OrderDetailBlock
          subText="PnL"
          heading={totalPnl}
          headingStyle={{ color: totalPnl > 0 ? "#00ff00" : "#ff0000" }}
        />
        <OrderDetailBlock
          subText="PnL%"
          heading={pnlPercentage}
          headingStyle={{ color: pnlPercentage > 0 ? "#00ff00" : "#ff0000" }}
        />
      </div>
    </div>
  );
};

const OrderDetailBlock = (props: { subText: string; heading: any; headingStyle?: React.CSSProperties }) => {
  return (
    <div>
      <div>
        <p style={{ fontSize: 12, color: themeVariables.subtleText }}>{props.subText}</p>
        <p style={{ ...props.headingStyle }}>{props.heading}</p>
      </div>
    </div>
  );
};
