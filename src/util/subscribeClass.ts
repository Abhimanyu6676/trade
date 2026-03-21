import { uuid_v4 } from "../util/uuid";

interface subscribeArray_i<T> {
  id: string;
  callback: (props: T) => void;
}

export class subscribeClassTemplate<CallbackProps> {
  public classID = uuid_v4();
  public subscribeArray: subscribeArray_i<CallbackProps>[] = [];

  constructor() {}

  subscribe(props: subscribeArray_i<CallbackProps>) {
    const index = this.subscribeArray.findIndex((item) => item.id == props.id);
    if (index < 0) this.subscribeArray.push(props);
    else {
      console.warn(
        "Callback with same ID already exists. replacing existing with new Instance",
      );
      console.warn(
        "Consider changing Callback ID if you want both callback to exist",
      );
      this.subscribeArray.splice(index, 1, props);
    }
  }

  unSubscribe(id: string) {
    const index = this.subscribeArray.findIndex((item) => item.id == id);
    if (index > -1) this.subscribeArray.slice(index, 1);
  }

  notify(data: CallbackProps) {
    this.subscribeArray.map((item) => {
      item.callback(data);
    });
  }
}
