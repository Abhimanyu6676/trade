import React, { useEffect } from "react";
import { authApi } from "../../api/auth";
import store from "../../redux";
import { setAuthState } from "../../redux/authReducer";
import { getLocalData } from "../../util/localStorage";

/**
 *
 * @description handles silent session restore at start & tabSync for persistent session across multiple tabs
 */
export const TabSync: React.FC = () => {
  /* DES-5 restore session on first with refreshToken */
  useEffect(() => {
    // You can add logic here to check for an existing session from localStorage
    // For example, verify a token and fetch user data.
    (async () => {
      await authApi.refresh({});
    })();
  }, []);

  /* DES-6 TAB SYNC */

  useEffect(() => {
    const syncLogout = (event: any) => {
      if (event.key === "auth_event") {
        console.log("Auth Event");
        const token = getLocalData("accessToken");

        if (!token) {
          store.dispatch(
            setAuthState({
              user: null,
            }),
          );
        }
      }
    };

    window.addEventListener("storage", syncLogout);

    return () => {
      window.removeEventListener("storage", syncLogout);
    };
  }, []);

  return null;
};
