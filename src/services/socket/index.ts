import { io, Socket } from "socket.io-client";
import eventBus from "../../util/eventBus";
import { getLocalData } from "../../util/localStorage";
import { uuid_v4 } from "../../util/uuid";

class SocketService {
  public classID = uuid_v4();
  private url = process.env.SOCKET_URL ? process.env.SOCKET_URL : "http://localhost:3000";
  private socket: Socket | null = null;
  public socketConnected = false;

  constructor() {
    this.emit = this.emit.bind(this);
    eventBus.setEmitter(this.emit);
    console.log("\n\nsocket.io class initiated with classID :", this.classID);
    eventBus.setEventListener("SOCKET_CLASS_AUTH_LISTENER", "AUTH", (props) => {
      switch (props.type) {
        case "LOGIN":
          console.log("This is socket class auth listener login event, user just logged in");
          this.connect();

          break;

        case "LOGOUT":
          console.log("This is socket class auth listener login event, user just logged out");
          this.disconnect();
          break;

        default:
          break;
      }
    });
  }

  async initiate() {
    const token = await getLocalData("accessToken");
    this.socket = io("http://localhost:3000", {
      auth: { token: `Bearer ${token}` },
      extraHeaders: { authorization: `Bearer ${token}` },
      path: process.env.SOCKET_PATH,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: false,
    });
    this.setupSocketEventsListeners();
  }

  private setupSocketEventsListeners() {
    console.log("setting socket event listeners");
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

    this.socket?.on("data", (event: _eventBusModals) => {
      console.log("data from socket.io onData", event);
      eventBus.emitEvent(event, false);
    });
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

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.auth = { token: "Bearer undefined" };
      this.socket.io.opts.extraHeaders = { ...this.socket.io.opts.extraHeaders, authorization: "Bearer undefined" };
    }
  }

  public connect(): void {
    if (this.socket && !this.socket.active) {
      this.updateAuthTokenAndConnect();
    }
  }

  async emit(data: _eventBusModals) {
    if (this.socket) {
      //console.log("sending command ", event);
      this.socket.emit("data", data);
    } else {
      console.log("no socket available");
    }
  }
}

export default new SocketService();
