import React, { ReactNode, useEffect } from "react";
import ReduxWrapper from "../../redux/reduxWrapper";
import { SocketContainer } from "../../services/socket/socketContainer";
import eventBus from "../../util/eventBus";
import Alert from "../alert";
import { NotificationContainer } from "../alert/notificationContainer";
import { TabSync } from "../auth/TabSync";
import CrudEventsListenerClass from "./crudEventsListener";
import DataEventsListenerClass from "./dataEventsListener";
// these imports are supposed to be imported at last
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/global.scss";
import { logger } from "../../util/logger";
import { Script } from "gatsby";
//
export const GlobalRootComp: React.FC<{ element: ReactNode }> = ({ element }) => {
  return (
    <div>
      <Script key="react-devtools-script" src="http://localhost:8097" />
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
      eventBus.initiate(logger);
      DataEventsListenerClass.initiate();
      CrudEventsListenerClass.initiate();
      Alert.initiate();
    }
  };

  useEffect(() => {
    initiateClasses();
    return () => {};
  }, []);

  return null;
};
