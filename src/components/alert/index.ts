import { uuidWithSpecifiedSize } from "../../util/uuid";
import { _addNotification, _removeNotification } from "../../redux/notificationReducer";
import store from "../../redux";
import eventBus from "../../util/eventBus";

const Alert = new (class _notificationClass {
  public classID = uuidWithSpecifiedSize({ size: 12 });

  initiate() {
    eventBus.setEventListener("ALERT_COMP_TO_ALERT_LISTENER", "ALERT", async (props) => {
      this.notify(props.data);
    });
  }

  notify(props: Omit<notification_i, "id">) {
    const newNotification = { ...props, id: uuidWithSpecifiedSize({ size: 10 }) };
    store.dispatch(_addNotification(newNotification));
  }

  close(id: string) {
    store.dispatch(_removeNotification(id));
  }
})();

export default Alert;
