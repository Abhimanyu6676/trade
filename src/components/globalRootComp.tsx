import React, { useEffect } from "react";
import ReduxWrapper from "../redux/reduxWrapper";
import { NotificationContainer } from "./alert/notificationContainer";
//import socketService from "../services/socketService";

export const GlobalRootComp = ({ element }: any) => {
  useEffect(() => {
    /** //NOTE this line is important to initialize socketService */
    //console.log("Socket.io class id = ", socketService.classID);
    return () => {};
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <h1>hhh</h1>
      {/*  <ReduxWrapper>
        <NotificationContainer />
        {element}
      </ReduxWrapper> */}
    </div>
  );
};
