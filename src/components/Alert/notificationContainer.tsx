import React, { useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";
import { notification_i } from "../../redux/notificationReducer";
import Alert from ".";

export const NotificationContainer = () => {
  const notifications = useSelector((state: RootState) => state.notification);

  return (
    <div
      style={{
        //backgroundColor: "red",
        width: 350,
        minWidth: 200,
        overflow: "scroll",
        scrollbarWidth: "none",
        position: "absolute",
        right: 0,
        zIndex: 100,
      }}
    >
      {notifications.map((notification) => {
        return (
          <Notification
            id={notification.id}
            heading={notification.heading}
            variant={notification.variant}
            text={notification.text}
            timeout={notification.timeout}
          />
        );
      })}
    </div>
  );
};

const Notification = ({
  variant = "notify",
  timeout = 5,
  ...props
}: notification_i) => {
  const removeNotification = () => {
    Alert.removeNotification(props);
  };

  useEffect(() => {
    let timer = undefined;
    if (timeout)
      timer = setTimeout(() => {
        //removeNotification();
      }, timeout * 1000);
    return () => {};
  }, []);

  return (
    <div
      style={{
        position: "relative",
        padding: "10px 20px",
        margin: "0px 50px 20px 0px",
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 5,
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
      <p style={{ fontSize: 12 }}>{props.text}</p>
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
