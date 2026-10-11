import { useEffect } from "react";
import eventBus from "../../util/eventBus";
import { logger } from "../../util/logger";
import socketService from "./";

export const SocketContainer = () => {
  const dataEventListener = async (action: _getEventAction_t<"DATA">) => {
    switch (action.type) {
      case "SERVER_LOGS":
        logger.SERVER_LOGS(action.data.method, action.data.logString);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    const isBrowser = typeof window !== undefined;
    if (isBrowser) socketService.initiate();

    const dataEventsListenerId = "SEVER_LOGS_LISTENER";
    eventBus.setEventListener(dataEventsListenerId, "DATA", dataEventListener);

    return () => {
      eventBus.removeEventListener(dataEventsListenerId, "DATA");
    };
  }, []);

  return null;
};
