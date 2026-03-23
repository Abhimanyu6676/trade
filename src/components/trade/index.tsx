import * as styles from "./index.module.scss";
import React, { useState } from "react";
import Block from "./block";
import { AddSymbol } from "./addSymbol";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";
import ClientStatus from "./clientStatus";
import { Button } from "react-bootstrap";
import { MdLightMode } from "react-icons/md";
import { MdDarkMode } from "react-icons/md";
import { DefaultRootTheme, RootThemes_e, RootThemes_t } from "../../styles/theme";

const lightTheme = {
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
  threshold: { pointer: "#555", text: "#888" },
};

const darkTheme = {
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
  threshold: { pointer: "#d1d4dc", text: "#848e9c" },
};

export default function TradeComponent() {
  const stocksState = useSelector((state: RootState) => state.stocks);
  const [theme, setTheme] = useState<RootThemes_t>(DefaultRootTheme); //NOTE don't change this value here, instead change `DefaultRootTheme` value in `styles/theme.ts`

  const ToggleTheme = () => {
    const currentThemeAttribute = document.documentElement.getAttribute("data-theme");

    if (currentThemeAttribute === RootThemes_e.dark) {
      document.documentElement.setAttribute("data-theme", RootThemes_e.light);
      document.documentElement.classList.add(RootThemes_e.light);
      document.documentElement.classList.remove(RootThemes_e.dark);
      setTheme(RootThemes_e.light);
    } else {
      document.documentElement.setAttribute("data-theme", RootThemes_e.dark);
      document.documentElement.classList.add(RootThemes_e.dark);
      document.documentElement.classList.remove(RootThemes_e.light);
      setTheme(RootThemes_e.dark);
    }
  };
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
        <div style={{ display: "flex", alignItems: "center" }}>
          <AddSymbol />
          <Button variant="outline-secondary" onClick={ToggleTheme} style={{ marginLeft: 10, height: 40 }}>
            {theme === RootThemes_e.light ? <MdDarkMode /> : <MdLightMode />}
          </Button>
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
