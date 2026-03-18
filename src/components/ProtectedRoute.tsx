import React, { useEffect } from "react";
import { navigate } from "gatsby";
import { useSelector } from "react-redux";
import { RootState } from "../redux";
import { useLocation } from "@reach/router";

type ProtectedRouteProps = {
  component: React.ComponentType<any>;
  location?: { pathname?: string };
} & Record<string, unknown>;

export const ProtectedRoute = ({
  component: Component,
  location,
  ...rest
}: ProtectedRouteProps): JSX.Element | null => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated,
  );
  const pathName = useLocation().pathname;

  useEffect(() => {
    console.log("ProtectedRoute current location is -- ", location);
    if (!isAuthenticated && !window.location.pathname.includes("/auth")) {
      navigate("/auth", {
        replace: true,
        state: { from: location?.pathname ?? "/" },
      });
    }
  }, [location?.pathname, isAuthenticated]);

  if (!isAuthenticated) return null;

  return <Component {...rest} />;
};
