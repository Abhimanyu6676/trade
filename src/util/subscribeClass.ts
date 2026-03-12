import { uuid_v4 } from "./uuid";

interface subscribeArray_i<T> {
  id: string;
  callback: (props: T) => void;
}

class subscribeClass<CallbackProps> {
  public classID = uuid_v4();
  private subscribeArray: subscribeArray_i<CallbackProps>[] = [];

  constructor() {}

  subscribe(props: subscribeArray_i<CallbackProps>) {
    let index = this.subscribeArray.findIndex((item) => item.id == props.id);
    if (index < 0) this.subscribeArray.push(props);
    else this.subscribeArray.splice(index, 1, props);
  }

  unSubscribe(id: string) {
    let index = this.subscribeArray.findIndex((item) => item.id == id);
    if (index > -1) this.subscribeArray.slice(index, 1);
  }

  notify(data: CallbackProps) {
    this.subscribeArray.map((item) => {
      item.callback(data);
    });
  }
}

export default subscribeClass;
