import React from "react";
import { TestStock } from "../components/trade/testStock";

export default function TestPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="container">
      <h1 style={{ marginTop: 20 }}>Testing</h1>
      <TestStock />
    </div>
  );
}
