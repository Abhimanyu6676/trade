import { io, Socket } from "socket.io-client";
import { uuidv4 } from "../util/uuid";
import store from "../redux";
import { stocksSagaAction } from "../redux/saga/stocksSaga";
import Alert from "../components/alert";
import subscribeClass from "../util/subscribeClass";

export default new (class SocketService {
  public classID = uuidv4();
  private socket: Socket | null = null;
  public socketConnected = false;

  public socketMessageSubscriberList = new subscribeClass<messageDataType_i>();
  public ltpSubscriberList = new subscribeClass<ltpData_i>();

  constructor(
    url = process.env.SOCKET_URL
      ? process.env.SOCKET_URL
      : "http://localhost:3000",
  ) {
    console.log(
      "socket.io service container created with classID:",
      this.classID,
    );
    console.log("socket url : ", process.env.SOCKET_URL);
    this.socket = io(url, {
      path: process.env.SOCKET_PATH,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    this.socket?.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
      this.socketConnected = true;
    });

    this.socket?.on("disconnect", () => {
      console.log("Socket disconnected");
      this.socketConnected = false;
    });

    this.socket?.on("error", (error) => {
      console.error("Socket error:", error);
      this.socketConnected = false;
    });

    this.socket?.on("message", (data: messageDataType_i) => {
      //console.log("message from socket.io onMessage ", data);
      this.socketMessageSubscriberList.notify(data);
    });

    this.socket?.on("ltp", (data: ltpData_i) => {
      //console.log("ltp from socket.io onLtp ", data);
      this.ltpSubscriberList.notify(data);
    });

    this.socket?.on("data", (stocks: Stock_i[]) => {
      console.log("data from socket.io onData ", stocks);
      store.dispatch(stocksSagaAction({ stocks: stocks })); // Dispatch action to update stocks in the store
    });

    this.socket?.on("alert", (alert: Omit<notification_i, "id">) => {
      //console.log("alert from socket.io onAlert ", alert);
      if (!alert || typeof alert !== "object" || !("heading" in alert)) {
        console.error("Invalid alert data structure:", alert);
        return;
      }
      Alert.notify(alert);
    });
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  private sendMessage({
    event = "message",
    data,
  }: {
    event?: "order" | "message";
    data: clientOrderCmd_i | messageDataType_i;
  }): void {
    if (this.socket) {
      //console.log("sending command ", event);
      this.socket.emit(event, data);
    } else {
      console.log("no socket available");
    }
  }

  public sendOrderCmd(D: clientOrderCmd_i): void {
    this.sendMessage({ event: "order", data: D });
  }

  public sendMsg(D: messageDataType_i): void {
    this.sendMessage({ event: "message", data: D });
  }
})();
