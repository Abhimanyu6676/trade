import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ReduxWrapper from "./src/redux/reduxWrapper";

export const wrapRootElement = ({ element }) => {
  return (
    <div>
      <ReduxWrapper>{element}</ReduxWrapper>
    </div>
  );
};
