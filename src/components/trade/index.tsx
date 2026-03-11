import React, { useEffect, useState } from "react";
import Block from "./block";
import { AddSymbol } from "./addSymbol";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";
import ClientStatus from "./clientStatus";
import { Button } from "react-bootstrap";
import { MdLightMode } from "react-icons/md";
import { MdDarkMode } from "react-icons/md";

export const lightTheme = {
  background: "#f1f1f1",
  border: "#eeeeee",
  containerBackground: "#ffffff",
  text: "#000000",
  subtleText: "#777777",
  headingText: "#000000",
  valueText: "#000000",
  icon: "#888888",
  iconMuted: "#aaaaaa",
  stockExchangeBorder: "#000000",
  threshold: {
    pointer: "#555",
    text: "#888",
  },
};

export const darkTheme = {
  background: "#222730",
  border: "#333942",
  containerBackground: "#161a21",
  text: "#d1d4dc",
  subtleText: "#848e9c",
  headingText: "#d1d4dc",
  valueText: "#d1d4dc",
  icon: "#848e9c",
  iconMuted: "#666",
  stockExchangeBorder: "#d1d4dc",
  threshold: {
    pointer: "#d1d4dc",
    text: "#848e9c",
  },
};

export default function TradeComponent() {
  const stocksState = useSelector((state: RootState) => state.stocks);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const currentTheme = theme === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    document.body.style.backgroundColor =
      theme === "dark" ? "#161a21" : "#f8f9fa";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, [theme]);
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
        <h1 style={{ color: theme === "dark" ? "#d1d4dc" : "#000000" }}>
          Dashboard
        </h1>
        <div style={{ display: "flex", alignItems: "center" }}>
          <AddSymbol theme={theme} />
          <Button
            variant="outline-secondary"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            style={{ marginLeft: 10, height: 40 }}
          >
            {theme === "light" ? <MdDarkMode /> : <MdLightMode />}
          </Button>
        </div>
      </div>
      <ClientStatus theme={theme === "dark" ? darkTheme : lightTheme} />
      <div style={{}}>
        {stocksState.stocksList.map((stock, stockIndex) => (
          <Block
            key={stockIndex + stock.key_id}
            stock={stock}
            theme={theme === "dark" ? darkTheme : lightTheme}
          />
        ))}
        <div style={{ height: 100 }} />
      </div>
    </div>
  );
}
