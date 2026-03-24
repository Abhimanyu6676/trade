import * as styles from "./index.module.scss";
import React from "react";
import Block from "./block";
import { AddSymbol } from "./addSymbol";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";
import ClientStatus from "./clientStatus";

export default function TradeComponent() {
  const stocksState = useSelector((state: RootState) => state.stocks);
  return (
    <div className="container" style={{ position: "relative" }}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mt-3 mb-4">
        <h1 className="mb-0">Dashboard</h1>
        <div className="d-flex align-items-center gap-2">
          <AddSymbol />
        </div>
      </div>
      <ClientStatus />
      <div style={{}}>
        {stocksState.stocksList.map((stock, stockIndex) => (
          <Block key={stockIndex + stock.keyId} stock={stock} />
        ))}
        <div style={{ height: 100 }} />
      </div>
    </div>
  );
}
