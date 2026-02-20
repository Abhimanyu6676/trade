import React, { useEffect } from "react";
import { Provider } from "react-redux";
import reduxStore from ".";
import { getLocalData } from "../util/localStorage";
import { setStocks } from "./stocksReducer";

const ReduxWrapper = ({ children }: any) => {
  const store = reduxStore;

  useEffect(() => {
    setTimeout(async () => {
      let localStoreData: any = await getLocalData("stocksList");
      console.log("localStoreData :: ", localStoreData);
      if (localStoreData) store.dispatch(setStocks(localStoreData));
    }, 500);
    return () => {};
  }, []);

  return (
    <Provider store={store}>
      <div style={{}}>{children}</div>
    </Provider>
  );
};

export default ReduxWrapper;
