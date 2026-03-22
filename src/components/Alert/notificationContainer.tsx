import React, { useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";
import Alert from ".";

export const NotificationContainer = () => {
  //TODO remove notification from redux and create a map of notifications in container itself
  // use eventBus to listen to Alerts messages and add notification to map
  const notifications = useSelector((state: RootState) => state.notification);

  return (
    <div style={{ position: "sticky", top: 0, right: 0, zIndex: 100 }}>
      <div
        style={{
          //backgroundColor: "red",
          width: 350,
          minWidth: 200,
          overflow: "scroll",
          maxHeight: 500,
          scrollbarWidth: "none",
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 100,
          padding: "0px 10px",
        }}
      >
        {notifications.map((notification) => {
          return (
            <NotificationCard
              key={notification.id}
              id={notification.id}
              heading={notification.heading}
              text={notification.text}
              variant={notification.variant}
              timeout={notification.timeout}
            />
          );
        })}
      </div>
    </div>
  );
};

const NotificationCard = ({ variant = "notify", timeout, ...props }: notification_i) => {
  const removeNotification = () => {
    Alert.close(props.id);
  };

  if (timeout === undefined && variant !== "error") timeout = 5000;
  useEffect(() => {
    let timer = undefined;
    if (timeout)
      timer = setTimeout(() => {
        removeNotification();
      }, timeout);
    return () => {};
  }, []);

  return (
    <div
      style={{
        position: "relative",
        padding: "10px 10px",
        marginTop: 10,
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 5,
        maxHeight: 150,
        backgroundColor:
          variant == "notify"
            ? "#e2e3e5"
            : variant == "success"
              ? "#d4edda"
              : variant == "warning"
                ? "#fff3cd"
                : "#f8d7da",
        color:
          variant == "notify"
            ? "#383d41"
            : variant == "success"
              ? "#155724"
              : variant == "warning"
                ? "#856404"
                : "#721c24",
        borderColor:
          variant == "notify"
            ? "#d6d8db"
            : variant == "success"
              ? "#c3e6cb"
              : variant == "warning"
                ? "#ffeeba"
                : "#f5c6cb",
      }}
    >
      <h6>{props.heading}</h6>
      <p style={{ fontSize: 12, overflow: "hidden", marginTop: 10 }}>{props.text}</p>
      <button // remove button
        style={{
          position: "absolute",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 20,
          width: 20,
          padding: 0,
          right: 10,
          top: 5,
          border: "1px solid #444444",
          borderRadius: 50,
          backgroundColor: "#ffffff00",
        }}
        onClick={() => {
          console.log("removing notification");
          removeNotification();
        }}
      >
        <IoCloseSharp style={{ padding: 0, margin: 0 }} />
      </button>
    </div>
  );
};
