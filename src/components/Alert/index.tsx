import React from "react";
import { uuidWithSpecifiedSize } from "../../util/uuid";
import {
  addNotification,
  notification_i,
  removeNotification,
} from "../../redux/notificationReducer";
import store from "../../redux";

const Alert = new (class _notificationClass {
  public classID = uuidWithSpecifiedSize({ size: 12 });
  constructor() {}

  notify(props: Omit<notification_i, "id">) {
    const newNotification = {
      ...props,
      id: uuidWithSpecifiedSize({ size: 10 }),
    };
    store.dispatch(addNotification(newNotification));
  }

  removeNotification(props: notification_i) {
    store.dispatch(removeNotification(props.id));
  }
})();

export default Alert;
