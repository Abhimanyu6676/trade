import React, { ReactNode } from "react";
import ReduxWrapper from "../redux/reduxWrapper";
import { SocketContainer } from "../services/socket/socketContainer";
import { NotificationContainer } from "./alert/notificationContainer";
import { TabSync } from "./auth/TabSync";
import { InitiateClasses } from "./initiateClasses";
// these imports are supposed to be imported at last
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/global.scss";
//
export const GlobalRootComp: React.FC<{ element: ReactNode }> = ({ element }) => {
  return (
    <div>
      <ReduxWrapper>
        <InitiateClasses />
        <TabSync />
        <SocketContainer />
        <NotificationContainer />
        {element}
      </ReduxWrapper>
    </div>
  );
};
