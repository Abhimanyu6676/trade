import React from "react";
import ReduxWrapper from "../redux/reduxWrapper";
import { NotificationContainer } from "./alert/notificationContainer";
import socketService from "../services/socketService";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/global.css";
import { log } from "console";

export const GlobalRootComp = ({ element }: any) => {
  return (
    <div style={{ position: "relative" }}>
      {(() => {
        // NOTE this file is necessary to initialize socketService class
        console.log("Socket.io classID = ", socketService.classID);
        return null;
      })()}
      <ReduxWrapper>
        <NotificationContainer />
        {element}
      </ReduxWrapper>
    </div>
  );
};
