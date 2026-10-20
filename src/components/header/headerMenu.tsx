import React from "react";
import * as styles from "./headerMenu.module.scss";
import { ClientStatus } from "./clientStatus";

type MenuItem = { id: string; label: string; children: { id: string; label: string }[] };

const defaultMenuItems: MenuItem[] = [
  {
    id: "account",
    label: "Account",
    children: [
      { id: "profile", label: "Profile" },
      { id: "security", label: "Security" },
      { id: "billing", label: "Billing" },
    ],
  },
  {
    id: "trade",
    label: "Trade",
    children: [
      { id: "orders", label: "Orders" },
      { id: "positions", label: "Positions" },
      { id: "watchlist", label: "Watchlist" },
      { id: "backtest", label: "BackTest" },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    children: [
      { id: "alerts", label: "Alerts" },
      { id: "reports", label: "Reports" },
      { id: "api", label: "API Keys" },
    ],
  },
];

export const HeaderMenu = (props: { openItemId: string | null; toggleItem: (id: string) => void }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        paddingBottom: "10vh",
      }}
    >
      <nav className={styles.menuList}>
        {defaultMenuItems.map((item) => {
          const isOpen = props.openItemId === item.id;
          return (
            <div className={styles.menuItem} key={item.id}>
              <button className={styles.menuButton} onClick={() => props.toggleItem(item.id)} aria-expanded={isOpen}>
                <span>{item.label}</span>
                <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>v</span>
              </button>
              <div className={`${styles.subMenu} ${isOpen ? styles.subMenuOpen : ""}`}>
                <div className={styles.subMenuInner}>
                  {item.children.map((child: any) => (
                    <button className={styles.subMenuItem} key={child.id}>
                      {child.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div // client Status Comp
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <ClientStatus />
      </div>
    </div>
  );
};
