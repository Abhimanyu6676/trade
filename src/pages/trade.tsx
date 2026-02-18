import React from "react";
import TradeComponent from "../components/trade";

export default function TradePage({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <TradeComponent />
    </div>
  );
}
