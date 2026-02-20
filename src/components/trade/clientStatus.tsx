import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";

const ClientStatus = () => {
  const clientState = useSelector((state: RootState) => state.client);
  const [showClientStatus, setShowClientStatus] = useState(true);

  return (
    <div
      style={{
        marginTop: 20,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Form>
        <Form.Check // prettier-ignore
          reverse
          type="switch"
          id="custom-switch"
          label="Show Client Status"
          defaultChecked={showClientStatus}
          onChange={(e) => {
            setShowClientStatus(e.target.checked);
          }}
        />
      </Form>
      {showClientStatus && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Status
            clientName="Client 1 (Abhimanyu)"
            API_Auth={clientState.client1Connected}
            API_Connected={clientState.client1Authenticated}
            Websocket={clientState.client1WebSocketConnected}
            WS_Auth={clientState.client1WebSocketAuthenticated}
          />

          <Status
            clientName="Client 2 (Shiva)"
            API_Auth={clientState.client2Connected}
            API_Connected={clientState.client2Authenticated}
            Websocket={clientState.client2WebSocketConnected}
            WS_Auth={clientState.client2WebSocketAuthenticated}
          />
        </div>
      )}
    </div>
  );
};

const Status = (props: {
  clientName: string;
  API_Connected?: boolean;
  API_Auth?: boolean;
  Websocket?: boolean;
  WS_Auth?: boolean;
}) => {
  return (
    <div
      style={{
        border: "1px solid #aaaaaa",
        minWidth: 200,
        padding: 10,
        marginLeft: 30,
      }}
    >
      <h6 style={{ marginBottom: 10 }}>{props.clientName}</h6>
      <StatusRow
        propertyLabel="API Connected"
        propertyStatus={props.API_Connected}
      />
      <StatusRow propertyLabel="API Auth" propertyStatus={props.API_Auth} />
      <StatusRow propertyLabel="Websocket" propertyStatus={props.Websocket} />
      <StatusRow propertyLabel="WS Auth" propertyStatus={props.WS_Auth} />
    </div>
  );
};

const StatusRow = (props: {
  propertyLabel: string;
  propertyStatus?: boolean;
}) => {
  return (
    <div style={{}}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "3px 0px",
        }}
      >
        <p style={{ fontSize: 10 }}>{props.propertyLabel}</p>
        <div
          style={{
            borderRadius: 50,
            width: 10,
            height: 10,
            backgroundColor: props.propertyStatus ? "green" : "red",
          }}
        />
      </div>
    </div>
  );
};

export default ClientStatus;
