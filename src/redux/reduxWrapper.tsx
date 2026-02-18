import React from "react";
import { Provider } from "react-redux";
import reduxStore from ".";

// eslint-disable-next-line react/display-name, react/prop-types
const ReduxWrapper = ({ children }: any) => {
  const store = reduxStore;
  //return <Provider store={store}>{element}</Provider>;
  return (
    <Provider store={store}>
      <div style={{}}>{children}</div>
    </Provider>
  );
};

export default ReduxWrapper;
