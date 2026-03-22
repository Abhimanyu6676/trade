import React, { useEffect } from "react";
import eventBus from "../util/eventBus";

type Props = {};

export const InitiateClasses = (props: Props) => {
  console.log("test-1 ");

  const initiateClasses = () => {
    const isBrowser = typeof window !== undefined;
    if (isBrowser) {
      eventBus._constructor();
    }
  };

  useEffect(() => {
    initiateClasses();
    return () => {};
  }, []);

  return null;
};
