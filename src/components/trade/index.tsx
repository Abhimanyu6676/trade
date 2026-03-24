import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";
import { AddSymbol } from "./addSymbol";
import { Block } from "./block";
import { ClientStatus } from "./clientStatus";

export default function TradeComponent() {
  const stocksState = useSelector((state: RootState) => state.stocks);
  return (
    <div className="container" style={{ position: "relative" }}>
      <AddSymbol />
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
