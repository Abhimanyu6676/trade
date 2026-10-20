import React, { useEffect, useState } from "react";
import { MdOutlineLink } from "react-icons/md";
import { MdOutlineLinkOff, MdKey, MdKeyOff } from "react-icons/md";
import { GrTest } from "react-icons/gr";
import { CgMediaLive } from "react-icons/cg";
import socketService from "../../services/socket";
import eventBus from "../../util/eventBus";
import store from "../../redux";
import { FaServer } from "react-icons/fa6";

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

  const openAlgo_openAlgoCmdHandler = async (action: _getEventAction_t<"OPENALGO">) => {
    switch (action.type) {
      case "CLIENT_STATUS":
        const status = action.data.status;
        if (status.client1Connected != undefined && client1Connected != status.client1Connected)
          setClient1Connected(status.client1Connected);
        if (status.client1Analyzer != undefined && client1Analyzer != status.client1Analyzer)
          setClient1Analyzer(status.client1Analyzer);
        if (
          status.client1WebSocketConnected != undefined &&
          client1WebSocketConnected != status.client1WebSocketConnected
        )
          setClient1WebSocketConnected(status.client1WebSocketConnected);

        if (status.client2Connected != undefined && client2Connected != status.client2Connected)
          setClient2Connected(status.client2Connected);
        if (status.client2Analyzer != undefined && client2Analyzer != status.client2Analyzer)
          setClient2Analyzer(status.client2Analyzer);
        if (
          status.client2WebSocketConnected != undefined &&
          client2WebSocketConnected != status.client2WebSocketConnected
        )
          setClient2WebSocketConnected(status.client2WebSocketConnected);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    const openalgoClientStatusListenerID = "OPENALGO-CLIENT-STATUS-LISTENER";
    eventBus.setEventListener(openalgoClientStatusListenerID, "OPENALGO", openAlgo_openAlgoCmdHandler);
    const clientStatusInterval = setInterval(() => {
      getClientStatus();
    }, 2000);
    const socketStatusInterval = setInterval(() => {
      setServerSocketStatus(socketService.socketConnected);
    }, 2000);

    return () => {
      clearInterval(clientStatusInterval);
      clearInterval(socketStatusInterval);
      eventBus.removeEventListener(openalgoClientStatusListenerID, "OPENALGO");
    };
  }, [socketService.socketConnected]);

  return (
    <div
      className="container foreground"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 10, padding: 10 }}
    >
      <p className="subtle-text" style={{ fontSize: 10 }}>
        Client's status
      </p>
      <div // client status container
        style={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        <Status
          clientId="Client 1"
          clientName="Abhimanyu"
          clientConnected={client1Connected}
          webSocketConnected={client1WebSocketConnected}
          clientAnalyzer={client1Analyzer}
          clientApiKey={process.env.client1ApiKey ? process.env.client1ApiKey : ""}
        />
        <div style={{ height: 6 }} />
        <Status
          clientId="Client 2"
          clientName="Shiva"
          clientConnected={client2Connected}
          webSocketConnected={client2WebSocketConnected}
          clientAnalyzer={client2Analyzer}
          clientApiKey={process.env.client2ApiKey ? process.env.client2ApiKey : ""}
        />
        <div style={{ height: 10 }} />
        <div //server status
          style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <p className="subtle-text" style={{ fontSize: 10 }}>
            Backend Socket
          </p>
          <FaServer size={12} color={serverSocketStatus ? "#27F598" : "#F55427"} style={{ marginRight: 10 }} />
        </div>
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
    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <p className="subtle-text" style={{ fontSize: 10 }}>
        {props.clientName}
      </p>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
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
          }}
          onClick={() => {
            getClientStatus();
          }}
        >
          <div style={{ marginRight: 10 }}>
            {props.clientConnected ? <MdKey color="#27F598" size={15} /> : <MdKeyOff color="#F55427" size={15} />}
          </div>
          <div style={{}}>
            {props.webSocketConnected ? (
              <MdOutlineLink color="#27F598" size={15} />
            ) : (
              <MdOutlineLinkOff color="#F55427" size={15} />
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
          {props.clientAnalyzer ? <GrTest color="#27F598" size={16} /> : <CgMediaLive color="#F55427" size={12} />}
        </button>
      </div>
    </div>
  );
};
