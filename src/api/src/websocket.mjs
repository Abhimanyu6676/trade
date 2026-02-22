/**
 * OpenAlgo WebSocket Client for Real-time Data Streaming
 * https://docs.openalgo.in
 */

class OpenAlgoWebSocket {
  onOpen = undefined;
  onMessage = undefined;
  onClose = undefined;

  /**
   * Initialize WebSocket client
   *
   * @param {string} apiKey - User's API key
   * @param {string} [wsUrl="ws://127.0.0.1:8765"] - WebSocket server URL
   */
  constructor(apiKey, wsUrl = "ws://127.0.0.1:8765") {
    this.apiKey = apiKey;
    this.wsUrl = wsUrl;
    this.ws = null;
    this.isConnected = false;
    this.subscriptions = new Map();
    this.messageQueue = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 3000;
    this.shouldReconnect = true;
  }

  /**
   * Connect to WebSocket server
   *
   * @returns {Promise<void>}
   */
  connect({ onOpen, onMessage, onClose }) {
    return new Promise((resolve, reject) => {
      try {
        this.onOpen = onOpen;
        this.onMessage = onMessage;
        this.onClose = onClose;
        this.shouldReconnect = true;
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.onOpen();
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Send authentication (use api_key with underscore)
          this._sendMessage({
            action: "authenticate",
            api_key: this.apiKey,
          });

          // Send any queued messages
          while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this._sendMessage(message);
          }

          resolve();
        };

        this.ws.onmessage = ({ data }) => {
          try {
            const message = JSON.parse(data.toString());
            this._handleMessage(message);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.onClose();
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("WebSocket disconnected");
          this.isConnected = false;
          this.onClose();
          this._attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.ws) {
      this.shouldReconnect = false;
      this.isConnected = false;
      this.ws.close();
      this.ws = null;
      this.subscriptions.clear();
    }
  }

  /**
   * Subscribe to LTP (Last Traded Price) updates
   *
   * @param {Array<Object>} instruments - Array of instruments to subscribe
   * @param {Function} onDataReceived - Callback function for receiving data
   * @example
   * const instruments = [
   *     { exchange: "NSE", symbol: "RELIANCE" },
   *     { exchange: "NSE", symbol: "INFY" }
   * ];
   * client.subscribe_ltp(instruments, (data) => {
   *     console.log("LTP Update:", data);
   * });
   */
  subscribe_ltp(instruments, onDataReceived) {
    const subscriptionKey = "ltp";
    this.subscriptions.set(subscriptionKey, onDataReceived);

    const message = {
      action: "subscribe",
      mode: "LTP",
      symbols: instruments,
    };

    if (this.isConnected) {
      this._sendMessage(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  /**
   * Unsubscribe from LTP updates
   *
   * @param {Array<Object>} instruments - Array of instruments to unsubscribe
   */
  unsubscribe_ltp(instruments) {
    const message = {
      action: "unsubscribe",
      mode: "LTP",
      symbols: instruments,
    };

    if (this.isConnected) {
      this._sendMessage(message);
    }

    //this.subscriptions.delete("ltp");
    /* instruments.map(async (stock, index) => {
      const message = {
        action: "unsubscribe",
        mode: "LTP",
        symbol: stock.symbol,
        exchange: stock.exchange,
      };
      if (this.isConnected) {
        this._sendMessage(message);
      }
      await setTimeout(() => {}, 500);
    }); */
  }

  /**
   * Subscribe to Quote updates
   *
   * @param {Array<Object>} instruments - Array of instruments to subscribe
   * @param {Function} onDataReceived - Callback function for receiving data
   * @example
   * const instruments = [
   *     { exchange: "NSE", symbol: "RELIANCE" },
   *     { exchange: "NSE", symbol: "INFY" }
   * ];
   * client.subscribe_quote(instruments, (data) => {
   *     console.log("Quote Update:", data);
   * });
   */
  subscribe_quote(instruments, onDataReceived) {
    const subscriptionKey = "quote";
    this.subscriptions.set(subscriptionKey, onDataReceived);

    const message = {
      action: "subscribe",
      mode: "Quote",
      symbols: instruments,
    };

    if (this.isConnected) {
      this._sendMessage(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  /**
   * Unsubscribe from Quote updates
   *
   * @param {Array<Object>} instruments - Array of instruments to unsubscribe
   */
  unsubscribe_quote(instruments) {
    const message = {
      action: "unsubscribe",
      mode: "Quote",
      symbols: instruments,
    };

    if (this.isConnected) {
      this._sendMessage(message);
    }

    this.subscriptions.delete("quote");
  }

  /**
   * Subscribe to Market Depth updates
   *
   * @param {Array<Object>} instruments - Array of instruments to subscribe
   * @param {Function} onDataReceived - Callback function for receiving data
   * @example
   * const instruments = [
   *     { exchange: "NSE", symbol: "RELIANCE" },
   *     { exchange: "NSE", symbol: "INFY" }
   * ];
   * client.subscribe_depth(instruments, (data) => {
   *     console.log("Depth Update:", data);
   * });
   */
  subscribe_depth(instruments, onDataReceived) {
    const subscriptionKey = "depth";
    this.subscriptions.set(subscriptionKey, onDataReceived);

    const message = {
      action: "subscribe",
      mode: "Depth",
      symbols: instruments,
    };

    if (this.isConnected) {
      this._sendMessage(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  /**
   * Unsubscribe from Market Depth updates
   *
   * @param {Array<Object>} instruments - Array of instruments to unsubscribe
   */
  unsubscribe_depth(instruments) {
    const message = {
      action: "unsubscribe",
      mode: "Depth",
      symbols: instruments,
    };

    if (this.isConnected) {
      this._sendMessage(message);
    }

    this.subscriptions.delete("depth");
  }

  /**
   * Send a message to WebSocket server
   *
   * @param {Object} message - Message to send
   * @private
   */
  _sendMessage(message) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Handle incoming WebSocket messages
   *
   * @param {Object} message - Received message
   * @private
   */
  _handleMessage(message) {
    // Handle market_data type messages
    if (message.type === "market_data") {
      const mode = message.mode;
      if (mode === 1 && this.subscriptions.has("ltp")) {
        this.subscriptions.get("ltp")(message.data);
      } else if (mode === 2 && this.subscriptions.has("quote")) {
        this.subscriptions.get("quote")(message.data);
      } else if (mode === 3 && this.subscriptions.has("depth")) {
        this.subscriptions.get("depth")(message.data);
      }
    } else if (message.status || message.type) {
      // Handle status and other messages
      console.log("WebSocket status:", message);
      this.onMessage(message);
    }
  }

  /**
   * Attempt to reconnect to WebSocket server
   *
   * @private
   */
  _attemptReconnect() {
    if (!this.shouldReconnect) {
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );

      setTimeout(() => {
        this.connect({
          onOpen: this.onOpen,
          onMessage: this.onMessage,
          onClose: this.onClose,
        }).catch((error) => {
          console.error("Reconnection failed:", error);
        });
      }, this.reconnectDelay);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }
}

export default OpenAlgoWebSocket;
