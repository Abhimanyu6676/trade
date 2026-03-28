import store from "../../redux";
import { stocksSagaAction } from "../../redux/saga/stocksSaga";
import eventBus from "../../util/eventBus";

class DataEventsListenerClass {
  initiate() {
    eventBus.setEventListener("DATA_EVENTS_LISTENER_FOR_DataEventsListenerClass", "DATA", async (action) => {
      switch (action.type) {
        case "STOCK_LIST":
          store.dispatch(stocksSagaAction({ stocks: action.data.stocks }));
          break;

        default:
          break;
      }
    });
  }
}

export default new DataEventsListenerClass();
