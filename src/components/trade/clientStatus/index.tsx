import React, { useEffect, useState } from "react";
import { FaNetworkWired } from "react-icons/fa";
import { MdOutlineLink } from "react-icons/md";
import { MdOutlineLinkOff } from "react-icons/md";
import { FaServer } from "react-icons/fa";
import { GrTest } from "react-icons/gr";
import { CgMediaLive } from "react-icons/cg";
import socketService from "../../../services/socket";
import eventBus from "../../../util/eventBus";
import store from "../../../redux";

const getClientStatus = () => {
  eventBus.emitEvent({
    type: "OPENALGO",
    action: { type: "GET_CLIENT_STATUS", data: { userId: store.getState().user.user?.id ?? "" } },
  });
};

export const ClientStatus = (props: {}) => {
  const [client1Connected, setClient1Connected] = useState(false);
  const [client1WebSocketConnected, setClient1WebSocketConnected] = useState(false);
  const [client1Analyzer, setClient1Analyzer] = useState(false);

  const [client2Connected, setClient2Connected] = useState(false);
  const [client2WebSocketConnected, setClient2WebSocketConnected] = useState(false);
  const [client2Analyzer, setClient2Analyzer] = useState(false);
  const [serverSocketStatus, setServerSocketStatus] = useState(false);

  const interval = setInterval(() => {
    if (socketService.socketConnected != serverSocketStatus) setServerSocketStatus(socketService.socketConnected);
  }, 2000);

  const openAlgo_openAlgoCmdHandler = async (action: _getEventAction_t<"OPENALGO">) => {
    switch (action.type) {
      case "CLIENT_STATUS":
        const status = action.data.status;
        if (status.client1Connected != undefined) setClient1Connected(status.client1Connected);
        if (status.client1Analyzer != undefined) setClient1Analyzer(status.client1Analyzer);
        if (status.client1WebSocketConnected != undefined)
          setClient1WebSocketConnected(status.client1WebSocketConnected);

        if (status.client2Connected != undefined) setClient2Connected(status.client2Connected);
        if (status.client2Analyzer != undefined) setClient2Analyzer(status.client2Analyzer);
        if (status.client2WebSocketConnected != undefined)
          setClient2WebSocketConnected(status.client2WebSocketConnected);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    const openalgoClientStatusListenerID = "OPENALGO-CLIENT-STATUS-LISTENER";
    eventBus.setEventListener(openalgoClientStatusListenerID, "OPENALGO", openAlgo_openAlgoCmdHandler);
    setTimeout(() => {
      getClientStatus();
    }, 2000);
    return () => {
      clearInterval(interval);
      eventBus.removeEventListener(openalgoClientStatusListenerID, "OPENALGO");
    };
  }, [socketService.socketConnected]);

  return (
    <div
      className="container foreground"
      style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", borderRadius: 10, padding: 15 }}
    >
      <div // client status container
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Status
          clientId="Client 1"
          clientName="(Abhimanyu)"
          clientConnected={client1Connected}
          webSocketConnected={client1WebSocketConnected}
          clientAnalyzer={client1Analyzer}
          clientApiKey={process.env.client1ApiKey ? process.env.client1ApiKey : ""}
        />
        <div style={{ height: 10 }} />
        <Status
          clientId="Client 2"
          clientName="(Shiva)"
          clientConnected={client2Connected}
          webSocketConnected={client2WebSocketConnected}
          clientAnalyzer={client2Analyzer}
          clientApiKey={process.env.client2ApiKey ? process.env.client2ApiKey : ""}
        />
      </div>
      <div //server status
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <h6 style={{ marginRight: 15 }}>Backend Status</h6>
        <FaServer size={18} color={serverSocketStatus ? "#27F598" : "#F55427"} />
      </div>
    </div>
  );
};

const Status = (props: {
  clientId: string;
  clientName: string;
  clientConnected?: boolean;
  webSocketConnected?: boolean;
  clientAnalyzer: boolean;
  clientApiKey: string;
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
      <div className="-row --ve" style={{ width: 180 }}>
        <h5 style={{}}>{props.clientId}</h5>
        <p className="subtle-text" style={{ fontSize: 12, marginLeft: 5 }}>
          {props.clientName}
        </p>
      </div>
      <button
        title="Refresh Status"
        style={{
          all: "unset",
          cursor: "pointer",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          //border: "1px solid #000",
          padding: "0px 10px",
        }}
        onClick={() => {
          getClientStatus();
        }}
      >
        <FaNetworkWired size={18} color={props.clientConnected ? "#27F598" : "#F55427"} style={{ marginRight: 15 }} />
        <div style={{}}>
          {props.webSocketConnected ? (
            <MdOutlineLink color="#27F598" size={20} />
          ) : (
            <MdOutlineLinkOff color="#F55427" size={20} />
          )}
        </div>
      </button>
      <button
        title="Toggle Analyzer Mode"
        style={{
          all: "unset",
          cursor: "pointer",
          //border: "1px solid #000",
          padding: "0px 10px",
        }}
        onClick={() => {
          eventBus.emitEvent({
            type: "OPENALGO",
            action: {
              type: "TOGGLE_ANALYZER",
              data: {
                userId: store.getState().user.user?.id ?? "",
                analyzerOn: !props.clientAnalyzer,
                clientApiKey: props.clientApiKey,
              },
            },
          });
          setTimeout(() => {
            getClientStatus();
          }, 2000);
        }}
      >
        {props.clientAnalyzer ? <GrTest color="#27F598" size={16} /> : <CgMediaLive color="#F55427" size={16} />}
      </button>
    </div>
  );
};
