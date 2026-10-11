import { customLogLevels, getLogString } from "../../../tradeServer/src/util/logger/loggerHelper";

const printable = {
  eventBusTemplate: false, // don't delete/modify this as it is fixed for eventBusTemplate, which is also used by backend
  socketService: false,
  SERVER_LOGS: true,
};

const createLogger = () => {
  const newCustomLogLevels = { ...customLogLevels, ...printable };
  const logger = {} as Record<keyof typeof newCustomLogLevels, any>;

  for (const key of Object.keys(newCustomLogLevels) as Array<keyof typeof newCustomLogLevels>) {
    logger[key] = function (...args: any[]) {
      if (key in printable && !printable[key as keyof typeof printable]) return;

      const { method, logString } = getLogString({ key, args });

      console.log(`%c[LOG] ${logString}`, customLogLevels[method].browser);
    };
  }

  return logger;
};

export const logger = createLogger();
