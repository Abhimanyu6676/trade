import React, { useEffect, useMemo, useState } from "react";
import { Button, Dropdown } from "react-bootstrap";
import { MdDarkMode, MdLightMode, MdAccountCircle } from "react-icons/md";
import { useSelector } from "react-redux";
import { authApi } from "../../services/api/auth";
import { RootState } from "../../redux";
import { DefaultRootTheme, RootThemes_e, RootThemes_t } from "../../styles/theme";
import * as styles from "./index.module.scss";

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

type MenuItem = { id: string; label: string; children: { id: string; label: string }[] };

type HeaderProps = { onLogout?: () => void; menuItems?: MenuItem[] };

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
  const [theme, setTheme] = useState<RootThemes_t>(DefaultRootTheme);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userState = useSelector((state: RootState) => state.user);
  const isAuthenticated = userState?.isAuthenticated ?? false;

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

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      } else {
        await authApi.logout();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setShowUserDropdown(false);
  };

  const ToggleTheme = () => {
    const currentThemeAttribute = document.documentElement.getAttribute("data-theme");

    if (currentThemeAttribute === RootThemes_e.dark) {
      document.documentElement.setAttribute("data-theme", RootThemes_e.light);
      document.documentElement.classList.remove(RootThemes_e.dark);
      document.documentElement.classList.add(RootThemes_e.light);
      setTheme(RootThemes_e.light);
    } else {
      document.documentElement.setAttribute("data-theme", RootThemes_e.dark);
      document.documentElement.classList.remove(RootThemes_e.light);
      document.documentElement.classList.add(RootThemes_e.dark);
      setTheme(RootThemes_e.dark);
    }
  };

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
            disabled
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
          <Button
            variant="outline-secondary"
            onClick={ToggleTheme}
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: 40, minWidth: 40, marginRight: 20 }}
          >
            {theme === RootThemes_e.light ? <MdDarkMode /> : <MdLightMode />}
          </Button>
          <Dropdown
            show={showUserDropdown && isAuthenticated}
            onToggle={(show) => isAuthenticated && setShowUserDropdown(show)}
          >
            <Dropdown.Toggle
              variant="outline-secondary"
              id="user-dropdown"
              className="d-flex align-items-center justify-content-center"
              style={{
                minHeight: 40,
                minWidth: 40,
                cursor: isAuthenticated ? "pointer" : "not-allowed",
                opacity: isAuthenticated ? 1 : 0.5,
              }}
              disabled={!isAuthenticated}
            >
              <MdAccountCircle size={24} />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
              <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </header>

      <div
        className={`${styles.overlay} ${isMenuOpen ? styles.overlayOpen : ""}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden={!isMenuOpen}
      />

      <aside className={`${styles.sideMenu} ${isMenuOpen ? styles.sideMenuOpen : ""}`} aria-hidden={!isMenuOpen}>
        <div className={styles.menuHeader}>
          <span className={styles.menuTitle}>Menu</span>
          <button className={styles.closeBtn} onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
            x
          </button>
        </div>

        <nav className={styles.menuList}>
          {menuItems.map((item) => {
            const isOpen = openItemId === item.id;
            return (
              <div className={styles.menuItem} key={item.id}>
                <button className={styles.menuButton} onClick={() => toggleItem(item.id)} aria-expanded={isOpen}>
                  <span>{item.label}</span>
                  <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>v</span>
                </button>
                <div className={`${styles.subMenu} ${isOpen ? styles.subMenuOpen : ""}`}>
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
