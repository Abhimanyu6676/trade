import React, { useEffect, useMemo, useState } from "react";
import * as styles from "./index.module.scss";
import { authApi } from "../../api/auth";
import api from "../../api/axios";

type MenuItem = {
  id: string;
  label: string;
  children: { id: string; label: string }[];
};

type HeaderProps = {
  onLogout?: () => void;
  menuItems?: MenuItem[];
};

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

const Header = ({ onLogout, menuItems = defaultMenuItems }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [path, setPath] = useState("/");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPath(window.location.pathname || "/");
    }
  }, []);

  const pathLabel = useMemo(() => {
    if (!path || path === "/") return "Home";
    const parts = path.split("/").filter(Boolean);
    return parts.join(" / ");
  }, [path]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const toggleItem = (id: string) => {
    setOpenItemId((prev) => (prev === id ? null : id));
  };

  const handleLogout = onLogout ?? authApi.logout;

  /* const handleLogout = () => {
    console.log("sending test request");
    api.instance
      .post("/backend/test")
      .then((res) => res)
      .catch((err) => err);
  }; */

  return (
    <>
      <header className={styles.header}>
        <div className={styles.left}>
          <button
            className={styles.hamburger}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={toggleMenu}
          >
            <span className={isMenuOpen ? styles.hamburgerOpen : ""} />
            <span className={isMenuOpen ? styles.hamburgerOpen : ""} />
            <span className={isMenuOpen ? styles.hamburgerOpen : ""} />
          </button>
          <div className={styles.path} title={path}>
            {pathLabel}
          </div>
        </div>
        <div className={styles.right}>
          <button className={styles.logout} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div
        className={`${styles.overlay} ${isMenuOpen ? styles.overlayOpen : ""}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden={!isMenuOpen}
      />

      <aside
        className={`${styles.sideMenu} ${isMenuOpen ? styles.sideMenuOpen : ""}`}
        aria-hidden={!isMenuOpen}
      >
        <div className={styles.menuHeader}>
          <span className={styles.menuTitle}>Menu</span>
          <button
            className={styles.closeBtn}
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            x
          </button>
        </div>

        <nav className={styles.menuList}>
          {menuItems.map((item) => {
            const isOpen = openItemId === item.id;
            return (
              <div className={styles.menuItem} key={item.id}>
                <button
                  className={styles.menuButton}
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                >
                  <span>{item.label}</span>
                  <span
                    className={`${styles.chevron} ${
                      isOpen ? styles.chevronOpen : ""
                    }`}
                  >
                    v
                  </span>
                </button>
                <div
                  className={`${styles.subMenu} ${
                    isOpen ? styles.subMenuOpen : ""
                  }`}
                >
                  <div className={styles.subMenuInner}>
                    {item.children.map((child) => (
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
      </aside>
    </>
  );
};

export default Header;
