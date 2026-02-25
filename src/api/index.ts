//@ts-ignore
import OpenAlgo from "./src";
import { uuidWithSpecifiedSize } from "../util/uuid";
import store from "../redux";
import { updateClientState } from "../redux/clientReducer";
import { useEffect, useState } from "react";

export interface onLtpData_i {
  ltp: number;
  ltt: number;
  symbol: string;
  exchange: exchange_i;
  timestamp: number;
}

interface onLtpCallback_i {
  callback_ID: string;
  callback?: (props: onLtpData_i) => void;
}

interface instrumentForLTP_i {
  symbol: string;
  exchange: string;
}

const openAlgoClient = new (class openAlgoClass {
  public classID = uuidWithSpecifiedSize({ size: 12 });

  private client1: any = undefined;
  private client2: any = undefined;

  private onLtpCallback_array: onLtpCallback_i[] = [];

  /**
   * instrument format '${symbol}:${exchange}'
   */
  private symbolsForLTP: string[] = [];

  constructor() {
    console.log("Open Algo Class Constructor");
    this.client1 = new OpenAlgo(
      "66a729fc8f34b86d82276c0e756e09adf3e015fca30085b3263e22be5dadf239",
      "http://127.0.0.1:5001",
      "v1",
      "ws://127.0.0.1:8765",
    );
    this.client2 = new OpenAlgo(
      "3ebf6bcd2157c9d81105d3ef31221968078ac7d94df152737deb82e6019a28af",
      "http://127.0.0.1:5002",
      "v1",
      "ws://127.0.0.1:8766",
    );

    setTimeout(() => {
      this.checkApiStatus();
      this.connectWebSocket();
    }, 500);
  }

  async checkApiStatus() {
    const response1 = await this.client1.symbol({
      symbol: "RELIANCE",
      exchange: "NSE",
    });
    console.log("ping Result = ", JSON.stringify(response1));
    if (response1?.status == "success") {
      store.dispatch(
        updateClientState({
          client1Connected: true,
          client1Authenticated: true,
        }),
      );
    }

    const response2 = await this.client2.symbol({
      symbol: "SBIN",
      exchange: "NSE",
    });
    console.log("ping Result = ", JSON.stringify(response2));
    if (response2?.status == "success") {
      store.dispatch(
        updateClientState({
          client2Connected: true,
          client2Authenticated: true,
        }),
      );
    }
  }

  async connectWebSocket() {
    console.log("now connecting to websocket for client 1");
    console.log("websocket status", this.client1?._wsClient?.isConnected);

    await this.client1.connect({
      onOpen: () => {
        console.log("onOpen Listener Socket opened");
        store.dispatch(
          updateClientState({
            client1WebSocketConnected: true,
          }),
        );
      },
      onMessage: (message: any) => {
        console.log("onMessage Listener :: ", message);
        if (
          message?.type == "auth" &&
          message.message == "Authentication successful"
        ) {
          store.dispatch(
            updateClientState({
              client1WebSocketAuthenticated: true,
            }),
          );
          setTimeout(() => {
            this.subscribeLTP();
          }, 500);
        }
      },
      onClose: () => {
        console.log("onClose Listener Socket Closed");
        store.dispatch(
          updateClientState({
            client1WebSocketConnected: false,
            client1WebSocketAuthenticated: false,
          }),
        );
      },
    });
    if (this.client1?._wsClient?.isConnected) {
      console.log("websocket connected");
    } else {
      console.log("websocket cannot connect");
    }
  }

  async subscribeLTP(stocksList?: Stock_i[]) {
    if (stocksList == undefined) {
      stocksList = store.getState().stocks.stocksList;
      console.log("websocket found following stocks to subscribe", stocksList);
    }

    let instrumentForLTP: instrumentForLTP_i[] = [];
    stocksList.map((stock) => {
      this.symbolsForLTP.push(stock.key_id);
      instrumentForLTP.push({ symbol: stock.symbol, exchange: stock.exchange });
    });
    if (instrumentForLTP.length > 0) {
      this.client1.subscribe_ltp(instrumentForLTP, (data: any) => {
        //console.log("LTP Update Received:");
        //console.log(JSON.stringify(data, null, 2));
        this.onLtpCallback_array.forEach((cb) => {
          cb?.callback && cb?.callback(data);
        });
      });
    }
  }

  async unSubscribeLTP(stocksList?: Stock_i[]) {
    let instrumentForUnsubscribeLTP: instrumentForLTP_i[] = [];
    stocksList?.map((stock) => {
      let index = this.symbolsForLTP.findIndex((item) => item === stock.key_id);
      if (index > -1) {
        this.symbolsForLTP.splice(index, 1);
        instrumentForUnsubscribeLTP.push({
          symbol: stock.symbol,
          exchange: stock.exchange,
        });
      }
    });
    if (instrumentForUnsubscribeLTP.length > 0) {
      console.log("unsubscribing following symbols");
      console.log(instrumentForUnsubscribeLTP);
      this.client1.unsubscribe_ltp(instrumentForUnsubscribeLTP);
    }
  }

  registerLtpCallback(props: onLtpCallback_i) {
    console.log("==========Registering new LTP callback==========");
    console.log(
      "adding LTP callbackID" +
        ` ${props.callback_ID} ` +
        "in LTP Class : " +
        this.classID,
    );
    let alreadyHasSameCallback = false;
    let newLtpCallbackArray = this.onLtpCallback_array.map((temp) => {
      let newLtpCallback = { ...temp };
      if (temp.callback_ID == props.callback_ID) {
        alreadyHasSameCallback = true;
        newLtpCallback = { ...props };
      }
      return newLtpCallback;
    });
    if (!alreadyHasSameCallback) {
      newLtpCallbackArray.push(props);
    }
    this.onLtpCallback_array = newLtpCallbackArray;
  }

  deRegisterLtpCallback(callbackID: string) {
    console.log("***********unRegistering LTP callback**********");
    console.log(
      "removing callbackID" +
        ` ${callbackID} ` +
        "from API Class : " +
        this.classID,
    );
    let newLtpCallbackArray = [...this.onLtpCallback_array];
    console.log("before removing onLTP array is ");
    console.log(newLtpCallbackArray);

    let index = newLtpCallbackArray.findIndex(
      (item) => item.callback_ID === callbackID,
    );
    console.log("found item at index :: ", index);
    if (index > -1) {
      newLtpCallbackArray.splice(index, 1);
    }

    console.log("after removing onLTP array is ");
    console.log(newLtpCallbackArray);
    this.onLtpCallback_array = newLtpCallbackArray;
  }

  getClient(apiKey: string) {
    if (apiKey === this.client1.apiKey) return this.client1;
    else if (apiKey === this.client2.apiKey) return this.client2;
    else return undefined;
  }

  getClient1() {
    return this.client1;
  }

  getClient2() {
    return this.client2;
  }
})();

export default openAlgoClient;

export const useOnLtp = (
  /**
   * @param callback [`${symbol}:${exchange}`]
   */
  callbackId: string,
  onLtp: (props: onLtpData_i) => void,
) => {
  useEffect(() => {
    console.log(
      `adding onLtpCallback ${callbackId} to openAlgo Class : ${openAlgoClient.classID}`,
    );
    openAlgoClient.registerLtpCallback({
      callback_ID: callbackId,
      callback: onLtp,
    });
    return () => {
      //TODO ERROR - while removing first element always last element is unregistered
      console.log(
        `removing onLtpCallback ${callbackId} from openAlgo Class : ${openAlgoClient.classID}`,
      );
      openAlgoClient.deRegisterLtpCallback(callbackId);
    };
  }, []);

  return undefined;
};
