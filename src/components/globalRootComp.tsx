import React from "react";
import ReduxWrapper from "../redux/reduxWrapper";
import { NotificationContainer } from "./Alert";

export const GlobalRootComp = ({ element }: any) => {
  return (
    <div style={{ position: "relative" }}>
      <ReduxWrapper>
        <NotificationContainer />
        {element}
      </ReduxWrapper>
    </div>
  );
};
