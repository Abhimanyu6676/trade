import React, { useEffect, useMemo, useState } from "react";
import { Button, Dropdown } from "react-bootstrap";
import { MdAccountCircle, MdDarkMode, MdLightMode } from "react-icons/md";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";
import { authApi } from "../../services/api/auth";
import { DefaultRootTheme, RootThemes_e, RootThemes_t } from "../../styles/theme";
import { HeaderMenu } from "./headerMenu";
import * as styles from "./index.module.scss";

type HeaderProps = { onLogout?: () => void };

const Header = ({ onLogout }: HeaderProps) => {
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
      .post("/tradeServer/test")
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
            //disabled
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
          <span className={styles.menuTitle}>Trade View</span>
          <button className={styles.closeBtn} onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
            x
          </button>
        </div>

        <HeaderMenu openItemId={openItemId} toggleItem={toggleItem} />
      </aside>
    </>
  );
};

export default Header;
