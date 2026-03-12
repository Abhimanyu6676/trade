import React from "react";
import ReduxWrapper from "../redux/reduxWrapper";
import { NotificationContainer } from "./alert/notificationContainer";
import socketService from "../services/socketService";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/global.scss";

export const GlobalRootComp = ({ element }: any) => {
  return (
    <div className="rootClass" style={{ position: "relative" }}>
      {(() => {
        // NOTE this file is necessary to initialize socketService class
        console.log("Socket.io classID = ", socketService.classID);
        return null;
      })()}
      <ReduxWrapper>
        <div
          style={{
            position: "sticky",
            top: 0,
            right: 0,
            zIndex: 100,
          }}
        >
          <NotificationContainer />
        </div>
        {element}
      </ReduxWrapper>
    </div>
  );
};
