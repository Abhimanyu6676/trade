import React, { ReactNode, useEffect } from "react";
import ReduxWrapper from "../../redux/reduxWrapper";
import eventBus from "../../util/eventBus";
import { SocketContainer } from "../../services/socket/socketContainer";
import { NotificationContainer } from "../alert/notificationContainer";
import { TabSync } from "../auth/TabSync";
import DataEventsListenerClass from "./dataEventsListener";
// these imports are supposed to be imported at last
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/global.scss";
//
export const GlobalRootComp: React.FC<{ element: ReactNode }> = ({ element }) => {
  return (
    <div>
      <InitiateClasses />
      <ReduxWrapper>
        <SocketContainer />
        <TabSync />
        <NotificationContainer />
        {element}
      </ReduxWrapper>
    </div>
  );
};

const InitiateClasses = () => {
  const initiateClasses = () => {
    const isBrowser = typeof window !== undefined;
    if (isBrowser) {
      eventBus._constructor();
      DataEventsListenerClass._constructor();
    }
  };

  useEffect(() => {
    initiateClasses();
    return () => {};
  }, []);

  return null;
};
