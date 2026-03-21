import { uuid_v4 } from "../uuid";
import { subscribeClassTemplate } from "../subscribeClass";
import {
  _evenBusEvents_map_with_type_key,
  _evenBusEventsUnion,
  _eventBusEvent_types,
  _getEventAction_t,
  _getEventEmitter_t,
} from "./eventBusTypes";

type _eventBusSubscribeListMap<K extends _eventBusEvent_types> = Map<
  _evenBusEvents_map_with_type_key[K]["type"],
  subscribeClassTemplate<_getEventAction_t<K>>
>;

class EventBussClassTemplate {
  public classID = uuid_v4();

  private subscribeClassMap: _eventBusSubscribeListMap<_eventBusEvent_types> =
    new Map();

  _constructor() {
    /* console.log("at start eventCallbacksMap length", this.subscribeClassMap.size);
    setInterval(() => {
      console.log("eventCallbacksMap length", this.subscribeClassMap.size);
      this.subscribeClassMap.forEach((sc, i) => {
        console.log(i, "sc class ID", sc.classID, "length", sc.subscribeArray.length);
      });
    }, 5000); */
  }

  setEventListener<T extends _eventBusEvent_types>(
    id: string,
    type: T,
    cb: (props: _getEventAction_t<T>) => void,
  ) {
    let subscribeClassInstance = this.subscribeClassMap.get(type);
    if (!subscribeClassInstance) {
      console.log("creating new subscribe list for event", type);
      subscribeClassInstance = new subscribeClassTemplate<
        _getEventAction_t<T>
      >();
      subscribeClassInstance.subscribe({ id, callback: cb });
      this.subscribeClassMap.set(type, subscribeClassInstance);
    } else {
      console.log(
        "adding to existing",
        type,
        "scList with ID",
        subscribeClassInstance.classID,
      );
      subscribeClassInstance.subscribe({ id, callback: cb });
    }
  }

  removeEventListener<T extends _eventBusEvent_types>(id: string, type: T) {
    const subscribeClassList = this.subscribeClassMap.get(type);
    if (subscribeClassList) {
      subscribeClassList.unSubscribe(id);
    }
  }

  private emitEvent(event: _evenBusEventsUnion) {
    const subscribeClassInstance = this.subscribeClassMap.get(event.type);
    if (subscribeClassInstance) {
      subscribeClassInstance.notify(event.action);
    }
  }

  getEmitter: _getEventEmitter_t = (type) => {
    return (props) => {
      this.emitEvent(props);
    };
  };
}

export default new EventBussClassTemplate();
