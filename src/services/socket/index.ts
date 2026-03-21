import { io, Socket } from "socket.io-client";
import { uuid_v4 } from "../../util/uuid";
import store from "../../redux";
import { stocksSagaAction } from "../../redux/saga/stocksSaga";
import Alert from "../../components/alert";
import { subscribeClassTemplate } from "../../util/subscribeClass";
import { getLocalData } from "../../util/localStorage";
import eventBus from "../../util/eventBus";

export default new (class SocketService {
  public classID = uuid_v4();
  private socket: Socket | null = null;
  public socketConnected = false;

  public socketMessageSubscriberList =
    new subscribeClassTemplate<messageDataType_i>();
  public ltpSubscriberList = new subscribeClassTemplate<ltpData_i>();

  constructor() {
    console.log(
      "socket.io service container created with classID:",
      this.classID,
    );

    eventBus.setEventListener("SOCKET_CLASS_AUTH_LISTENER", "AUTH", (props) => {
      switch (props.type) {
        case "LOGIN":
          console.log(
            "This is socket class auth listener login event, user just logged in",
          );
          this.connect();

          break;

        case "LOGOUT":
          console.log(
            "This is socket class auth listener login event, user just logged out",
          );
          this.disconnect();
          break;

        default:
          break;
      }
    });
  }

  async initiate(
    /* url = process.env.SOCKET_URL
      ? process.env.SOCKET_URL
      : "http://localhost:3000", */
    url = "http://localhost:3000",
  ) {
    const token = await getLocalData("accessToken");
    console.log("socket url : ", process.env.SOCKET_URL);
    console.log("socket token : ", token);
    this.socket = io(url, {
      auth: {
        token: `Bearer ${token}`,
      },
      extraHeaders: {
        authorization: `Bearer ${token}`,
      },
      path: process.env.SOCKET_PATH,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: false,
    });

    this.setupListeners();
  }

  private updateAuthTokenAndConnect(error?: any) {
    if (typeof window !== "undefined") {
      console.log("socket status ", this.socket?.active);
      if (!error || error.message.includes("error")) {
        if (!this.socket?.active)
          setTimeout(() => {
            if (this.socket) {
              const token = getLocalData("accessToken");
              if (token) {
                this.socket.auth = { token: `Bearer ${token}` };
                this.socket.io.opts.extraHeaders = {
                  ...this.socket.io.opts.extraHeaders,
                  authorization: `Bearer ${token}`,
                };
              }
            }
            this.socket?.connect();
          }, 3000);
      }
    }
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
      this.updateAuthTokenAndConnect(error);
    });

    this?.socket?.on("reconnect_attempt", () => {
      console.log("reconnect_attempt");
      this.updateAuthTokenAndConnect();
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
      this.socket.io.opts.extraHeaders = {
        ...this.socket.io.opts.extraHeaders,
        authorization: "Bearer undefined",
      };
    }
  }

  public connect(): void {
    if (this.socket && !this.socket.active) {
      this.updateAuthTokenAndConnect();
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
