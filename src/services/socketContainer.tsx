import React, { useEffect } from "react";
import socketService from ".";

export const SocketContainer = () => {
  useEffect(() => {
    const isBrowser = typeof window !== undefined;
    if (isBrowser) {
      socketService._constructor();
    }

    return () => {};
  }, []);

  return null;
};
