import React, { useEffect } from "react";
import { navigate } from "gatsby";

type ProtectedRouteProps = {
  component: React.ComponentType<any>;
  location?: { pathname?: string };
} & Record<string, unknown>;

const isBrowser = typeof window !== "undefined";

const isAuthenticated = (): boolean => {
  if (!isBrowser) return false;
  const user = window.localStorage.getItem("user");
  return Boolean(user);
};

export default function ProtectedRoute({
  component: Component,
  location,
  ...rest
}: ProtectedRouteProps): JSX.Element | null {
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/auth", {
        replace: true,
        state: { from: location?.pathname ?? "/" },
      });
    }
  }, [location?.pathname]);

  if (!isAuthenticated()) {
    return null;
  }

  return <Component {...rest} />;
}
