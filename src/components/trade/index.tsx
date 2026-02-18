import React, { useEffect } from "react";
import Block from "./block";
import { AddSymbol } from "./addSymbol";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";

export default function TradeComponent() {
  const stocksState = useSelector((state: RootState) => state.stocks);

  return (
    <div className="container">
      <div //header
        style={{
          //backgroundColor: "red",
          marginTop: 20,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: 70,
        }}
      >
        <h1>Dashboard</h1>
        <AddSymbol />
      </div>
      <div style={{}}>
        {stocksState.stocksList.map((stock, stockIndex) => (
          <Block key={stockIndex} stock={stock} />
        ))}
      </div>
    </div>
  );
}
