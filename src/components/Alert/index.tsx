import React, { useEffect, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";

interface notification_i {
  id: string;
  heading: string;
  text?: string;
  timeout?: number;
}

const NotificationClass = new (class _notificationClass {
  private notificationArray = [];
  constructor() {}
})();
export default NotificationClass;

export const NotificationContainer = () => {
  return (
    <div
      style={{
        //backgroundColor: "red",
        width: 350,
        minWidth: 200,
        position: "absolute",
        right: 0,
        zIndex: 100,
      }}
    >
      <Notification heading="variant notify" variant="notify" />
      <Notification heading="variant success" variant="success" />
      <Notification heading="variant warning" variant="warning" />
      <Notification heading="variant error" variant="error" />
    </div>
  );
};

const Notification = ({
  variant = "notify",
  heading = "heading",
  text = "text",
  timeout = 0,
}: {
  variant?: "notify" | "success" | "warning" | "error";
  heading: string;
  text?: string;
  timeout?: number;
}) => {
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
      <h6>{heading}</h6>
      <p style={{ fontSize: 12 }}>{text}</p>
      <div // remove button
        style={{
          position: "absolute",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 20,
          width: 20,
          right: 10,
          top: 5,
          border: "1px solid #444444",
          borderRadius: 50,
        }}
      >
        <IoCloseSharp style={{ padding: 0, margin: 0 }} />
      </div>
    </div>
  );
};
