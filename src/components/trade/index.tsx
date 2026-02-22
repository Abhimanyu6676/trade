import React, { useEffect } from "react";
import Block from "./block";
import { AddSymbol } from "./addSymbol";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";
import ClientStatus from "./clientStatus";

export default function TradeComponent() {
  const stocksState = useSelector((state: RootState) => state.stocks);

  return (
    <div className="container" style={{ position: "relative" }}>
      <div //header
        style={{
          //backgroundColor: "red",
          marginTop: 20,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1>Dashboard</h1>
        <AddSymbol />
      </div>
      <ClientStatus />
      <div style={{}}>
        {stocksState.stocksList.map((stock, stockIndex) => (
          <Block key={stock.key_id} stock={stock} />
        ))}
      </div>
    </div>
  );
}
