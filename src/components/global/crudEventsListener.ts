import store from "../../redux";
import { stocksSagaAction } from "../../redux/saga/stocksSaga";
import eventBus from "../../util/eventBus";

class CrudEventsListenerClass {
  initiate() {
    eventBus.setEventListener("CRUD_EVENTS_LISTENER_FOR_CrudEventsListenerClass", "CRUD", async (action) => {
      switch (action.type) {
        case "STOCK_ADDED":
          store.dispatch(stocksSagaAction({ addStocks: [action.data.stock] }));
          break;

        case "STOCK_MODIFIED":
          console.log("CRUD_EVENTS_LISTENER_FOR_CrudEventsListenerClass, STOCK_MODIFIED");
          store.dispatch(stocksSagaAction({ updateStocks: [action.data.stock] }));
          break;

        default:
          break;
      }
    });
  }
}

export default new CrudEventsListenerClass();
