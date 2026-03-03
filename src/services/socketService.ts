/* import { io, Socket } from "socket.io-client";
import { uuidv4 } from "../util/uuid";

export default new (class SocketService {
  public classID = uuidv4();
  private socket: Socket | null = null;

  constructor(url: string = "http://localhost:3000") {
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

    this.socket?.on("message", (msg) => {
      console.log("data from socket.io onMessage ", msg);
    });

    this.socket?.on("ltp", (data) => {
      console.log("ltp from socket.io onMessage ", data);
    });

    this.socket?.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket?.on("error", (error) => {
      console.error("Socket error:", error);
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
})();
 */
