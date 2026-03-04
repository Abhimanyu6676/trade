import { io, Socket } from "socket.io-client";
import { uuidv4 } from "../util/uuid";
import store from "../redux";
import { stocksSagaAction } from "../redux/saga/stocksSaga";
import { ltpSubscriberList } from "../hooks/useLtpHook";
import Alert from "../components/alert";

export default new (class SocketService {
  public classID = uuidv4();
  private socket: Socket | null = null;

  constructor(url: string = "http://localhost:3000") {
    console.log(
      "socket.io service container created with classID:",
      this.classID,
    );
    this.socket = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    this.socket?.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
    });

    this.socket?.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket?.on("error", (error) => {
      console.error("Socket error:", error);
    });

    this.socket?.on("message", (msg: any) => {
      console.log("message from socket.io onMessage ", msg);
    });

    this.socket?.on("ltp", (data: ltpData_i) => {
      //console.log("ltp from socket.io onLtp ", data);
      ltpSubscriberList.notify(data);
    });

    this.socket?.on("data", (stocks: Stock_i[]) => {
      console.log("data from socket.io onData ", stocks);
      store.dispatch(stocksSagaAction({ stocks: stocks })); // Dispatch action to update stocks in the store
    });

    this.socket?.on("alert", (alert: Omit<notification_i, "id">) => {
      console.log("alert from socket.io onAlert ", alert);
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
    cmd,
  }: {
    event?: "order" | "data" | "message";
    cmd: any;
  }): void {
    if (this.socket) {
      this.socket.emit(event, cmd);
    }
  }

  public sendOrderCmd(cmd: clientOrderCmd_i): void {
    this.sendMessage({ event: "order", cmd });
  }
})();
