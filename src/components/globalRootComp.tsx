import "bootstrap/dist/css/bootstrap.min.css";
import React, { ReactNode } from "react";
import ReduxWrapper from "../redux/reduxWrapper";
import { SocketContainer } from "../services/socket/socketContainer";
import "../styles/global.scss";
import { NotificationContainer } from "./alert/notificationContainer";
import { TabSync } from "./auth/TabSync";

export const GlobalRootComp: React.FC<{ element: ReactNode }> = ({
  element,
}) => {
  return (
    <div>
      <ReduxWrapper>
        <TabSync />
        <SocketContainer />
        <NotificationContainer />
        {element}
      </ReduxWrapper>
    </div>
  );
};
