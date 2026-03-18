import { io, Socket } from "socket.io-client";
import { uuid_v4 } from "../util/uuid";
import store from "../redux";
import { stocksSagaAction } from "../redux/saga/stocksSaga";
import Alert from "../components/alert";
import subscribeClass from "../util/subscribeClass";

export default new (class SocketService {
  public classID = uuid_v4();
  private socket: Socket | null = null;
  public socketConnected = false;

  public socketMessageSubscriberList = new subscribeClass<messageDataType_i>();
  public ltpSubscriberList = new subscribeClass<ltpData_i>();

  _constructor(
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
      auth: {
        token: "Bearer accessToken",
      },
      path: process.env.SOCKET_PATH,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: false,
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
      console.error("Socket error:");
      this.socketConnected = false;
    });

    // either by directly modifying the `auth` attribute
    this?.socket?.on("connect_error", (error) => {
      console.log("connect_error", error.message);
      const isBrowser = typeof window !== "undefined";
      if (isBrowser) {
        console.log("socket status ", this.socket?.active);
        if (error.message.includes("error")) {
          if (!this.socket?.active) {
            setTimeout(() => {
              if (this.socket) {
                const token = localStorage.getItem("accessToken");
                if (token) this.socket.auth = { token: `Bearer ${token}` };
              }
              this.socket?.connect();
            }, 5000);
          }
        } else {
          console.log("Socket connected-------------------------");
        }
      }
    });

    this?.socket?.on("reconnect_attempt", () => {
      console.log("reconnect_attempt");
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
      this.socket.auth = { token: "Bearer undefined" };
    }
  }

  public connect(): void {
    if (this.socket && !this.socket.active) {
      this.socket.connect();
    }
  }

  private sendMessage({
    event = "message",
    data,
  }: {
    event?: "order" | "message";
    data: orderDataType_i | messageDataType_i;
  }): void {
    if (this.socket) {
      //console.log("sending command ", event);
      this.socket.emit(event, data);
    } else {
      console.log("no socket available");
    }
  }

  public sendOrderCmd(D: orderDataType_i): void {
    this.sendMessage({ event: "order", data: D });
  }

  public sendMsg(D: messageDataType_i): void {
    this.sendMessage({ event: "message", data: D });
  }
})();
