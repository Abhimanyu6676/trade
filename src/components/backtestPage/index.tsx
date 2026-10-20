import React, { useState } from "react";
import * as variables from "../../styles/themeVariables.module.scss";
import { _colors } from "../../styles/colors";
import { ORDER_exchange } from "../../../../tradeServer/src/crud/order/order_constants";
import api from "../../services/api/axios";
import Alert from "../alert";
import { compareCandleArrays, convertCandleTimeline } from "./backtestUtility";

const BackTest = () => {
  const [symbol, setSymbol] = useState("");
  const [exchange, setExchange] = useState(ORDER_exchange.NSE);
  const [date, setDate] = useState("2026-10-16");
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [isTestingStrategy, setIsTestingStrategy] = useState(false);

  const [_1mCandles, set_1mCandles] = useState<OPENALGO.history.historyCandles[] | undefined>(undefined);
  const [_3mCandles, set_3mCandles] = useState<OPENALGO.history.historyCandles[] | undefined>(undefined);
  const [_5mCandles, set_5mCandles] = useState<OPENALGO.history.historyCandles[] | undefined>(undefined);

  const getHistory = async () => {
    if (!symbol) {
      Alert.notify({ heading: "Symbol is Empty", text: "Symbol must have a value", timeout: 2000, variant: "warning" });
      return;
    }

    setIsFetchingHistory(true);
    set_1mCandles(undefined);
    set_3mCandles(undefined);
    set_5mCandles(undefined);
    console.log("Now fetching History");

    try {
      const [history1m /* , history3m, history5m */] = await Promise.all([
        api.post("getHistory", "/trade/history", { symbol, exchange, date }),
        //api.post("getHistory", "/trade/history", { symbol, exchange, date, interval: "3m" }),
        //api.post("getHistory", "/trade/history", { symbol, exchange, date, interval: "5m" }),
      ]);

      if (history1m.data) {
        console.log("history1m length", history1m.data?.length, "data", history1m.data);
        set_1mCandles((history1m as any)?.data ?? undefined);
        const new3MCandles = convertCandleTimeline({ _1mCandles: history1m.data, newCandlePeriod: 3 });
        if (new3MCandles) set_3mCandles(new3MCandles);
        const new5MCandles = convertCandleTimeline({ _1mCandles: history1m.data, newCandlePeriod: 5 });
        if (new5MCandles) set_5mCandles(new5MCandles);
      }

      /* if (history3m.data) {
        console.log("history3m length", history3m.data?.length, "data", history3m.data);
        set_3mCandles((history3m as any)?.data ?? undefined);
      }
      if (history5m.data) {
        console.log("history5m length", history5m.data?.length, "data", history5m.data);
        set_5mCandles((history5m as any)?.data ?? undefined);
      } */
    } catch (error) {
      Alert.notify({
        heading: "History Fetch Failed",
        text: "Unable to fetch the requested history data.",
        timeout: 2000,
        variant: "error",
      });
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const testStrategy = async () => {
    setIsTestingStrategy(true);
    console.log("Now testing Strategy");
    setIsTestingStrategy(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
      <div
        style={{ backgroundColor: variables.primaryColorLight, borderRadius: 10, marginTop: 100, padding: "10px 20px" }}
      >
        <h3 style={{ textAlign: "center" }}>BackTest</h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            height: 400,
            width: 300,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginTop: 20,
              }}
            >
              <h5 style={{ color: variables.subtleText }}>Stock</h5>
              <input
                type="text"
                value={symbol}
                placeholder="Symbol"
                onChange={(e) => {
                  setSymbol(e.target.value);
                }}
                style={{ width: 100 }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginTop: 20,
              }}
            >
              <h5 style={{ color: variables.subtleText }}>Exchange</h5>
              <select
                id="city-select"
                value={exchange}
                onChange={(e) => {
                  //@ts-ignore
                  setExchange(e.target.value);
                }}
              >
                <option value={ORDER_exchange.NSE}>NSE</option>
                <option value={ORDER_exchange.BSE}>BSE</option>
              </select>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginTop: 20,
              }}
            >
              <h5 style={{ color: variables.subtleText }}>Date</h5>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                }}
                style={{ width: 100 }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginTop: 20,
              }}
            >
              <h5 style={{ color: variables.subtleText }}>Testing</h5>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 20,
                  backgroundColor: isTestingStrategy ? _colors.success : _colors.warning,
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <button disabled={isFetchingHistory} onClick={getHistory}>
              {isFetchingHistory ? "Fetching Records..." : "Fetch History"}
            </button>
            <div style={{ marginTop: 10 }} />
            <button disabled={isTestingStrategy || !_1mCandles || !_3mCandles || !_5mCandles} onClick={testStrategy}>
              {isTestingStrategy ? "Testing..." : "Test Strategy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackTest;
