const customLevels = {
  debug: "color: green; font-weight: bold;",
  info: "color: green;",
  warn: "color: yellow;",
  error: "color: red; font-weight: bold;",
  fatal: "color: red; font-weight: bold;",
};

const createLogger = () => {
  const printable = {
    eventBusTemplate: false, // don't delete/modify this as it is fixed for eventBusTemplate, which is also used by backend
    test: true,
  };
  const newCustomLevels = { ...customLevels, ...printable };
  const logger: Record<keyof typeof newCustomLevels, any> = {};

  for (const key in newCustomLevels) {
    if (Object.hasOwnProperty.call(newCustomLevels, key)) {
      // For each key, create a function that returns the original value
      logger[key] = function (...args: any[]) {
        let method = key in customLevels ? key : "info";
        let string = "";
        args.forEach((s, i) => {
          if (i == 0 && s in customLevels) method = s;
          else {
            string += " " + (typeof s === "object" ? JSON.stringify(s, null, 2) : s);
          }
        });
        if (key in printable && !printable[key]) {
        } else {
          console.log(`%c[${method.toUpperCase()}] ${string}`, customLevels[key]);
        }
      };
    }
  }

  return logger;
};

export const logger = createLogger();
