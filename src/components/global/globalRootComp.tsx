import React, { ReactNode, useEffect } from "react";
import ReduxWrapper from "../../redux/reduxWrapper";
import { SocketContainer } from "../../services/socket/socketContainer";
import eventBus from "../../util/eventBus";
import { NotificationContainer } from "../alert/notificationContainer";
import { TabSync } from "../auth/TabSync";
// these imports are supposed to be imported at last
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/global.scss";
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

const InitiateClasses = () => {
  console.log("test-1 ");

  const initiateClasses = () => {
    const isBrowser = typeof window !== undefined;
    if (isBrowser) {
      eventBus._constructor();
    }
  };

  useEffect(() => {
    initiateClasses();
    return () => {};
  }, []);

  return null;
};
