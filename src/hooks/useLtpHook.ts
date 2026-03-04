import React, { useEffect } from "react";
import subscribeClass from "../util/subscribeClass";

export const ltpSubscriberList = new subscribeClass<ltpData_i>();

export const useOnLtp = (props: {
  id: string;
  callback: (props: ltpData_i) => void;
}) => {
  useEffect(() => {
    ltpSubscriberList.subscribe({
      id: props.id,
      callback: props.callback,
    });
    return () => {
      ltpSubscriberList.unSubscribe(props.id);
    };
  }, []);

  return null;
};
