import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import store from "../../redux";
import { stocksSagaAction } from "../../redux/saga/stocksSaga";
import { useOnLtp } from "../../api";
import { getStockKeyId } from "../../util/helper";

const Block = (props: { stock: Stock_i }) => {
  const [keyID, setKeyID] = useState(props.stock.key_id);
  const [ltp, setLtp] = useState(0);

  useOnLtp(keyID, (data) => {
    if (props.stock.key_id == getStockKeyId(data)) {
      setLtp(data.ltp);
    }
  });

  return (
    <div
      className="container"
      style={{
        backgroundColor: "#f1f1f1",
        border: "1px solid #eeeeee",
        borderRadius: 10,
        padding: 20,
        marginTop: 20,
      }}
    >
      <div //block
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <div style={{ minWidth: 200 }}>
            <p style={{ margin: 0, padding: 0, fontSize: 12 }}>Symbol Name</p>
            <div
              style={{
                //backgroundColor: "red",
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-end",
              }}
            >
              <h5 style={{ margin: 0, padding: 0 }}>{props.stock.symbol}</h5>
              <p
                style={{
                  fontSize: 12,
                  margin: 0,
                  marginLeft: 5,
                  border: "1px solid #000000",
                  padding: "0px 5px",
                }}
              >
                {props.stock.exchange}
              </p>
            </div>
          </div>
          <div style={{ minWidth: 100 }}>
            <p style={{ margin: 0, padding: 0, fontSize: 12 }}>Quantity</p>
            <h5>100</h5>
          </div>
          <div style={{ minWidth: 100 }}>
            <p style={{ margin: 0, padding: 0, fontSize: 12 }}>LTP</p>
            <h5>{ltp}</h5>
          </div>
        </div>
        <Button>Enter Trade</Button>
      </div>
      <div
        style={{
          marginTop: 20,
          backgroundColor: "#ffffff",
          borderRadius: 5,
          padding: "10px 0px",
        }}
      >
        <Row key1="Order Price" value1="276" key2="LTP" value2="276" />
        <Row key1="Threshold" value1="0.5%" key2="Risk" value2="0.25%" />
        <Row
          key1="Upper Threshold"
          value1="278"
          key2="Lower Threshold"
          value2="272"
        />
        <Row
          key1="Buy Position"
          value1="Active"
          key2="Sell Position"
          value2="Exited"
        />
        <Row key1="Buy PnL" value1="4045" key2="Sell PnL" value2="-1456" />
        <Row key2="Net PnL" value2="2301" />
      </div>
      <div
        style={{
          //backgroundColor: "red",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <div // left side buttons
          style={{
            //backgroundColor: "red",
            display: "flex",
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Button
            style={{
              backgroundColor: "#03fca5",
              border: 0,
              opacity: 1,
            }}
          >
            Update Order
          </Button>
          <Button
            style={{
              backgroundColor: "#f27474",
              marginLeft: 20,
              border: 0,
              opacity: 1,
            }}
          >
            Exit Trade
          </Button>
          <Button
            style={{
              backgroundColor: "#f27474",
              marginLeft: 20,
              border: 0,
              opacity: 0.2,
            }}
          >
            Exit Sell
          </Button>
          <Button
            style={{
              backgroundColor: "#f27474",
              marginLeft: 20,
              border: 0,
              opacity: 1,
            }}
          >
            Exit Buy
          </Button>
        </div>
        <div // right side buttons
          style={{
            //backgroundColor: "red",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Button
            style={{
              backgroundColor: "#f27474",
              border: 0,
              opacity: 1,
              marginLeft: 20,
            }}
            onClick={() => {
              store.dispatch(
                stocksSagaAction({
                  removeStocks: [props.stock],
                }),
              );
            }}
          >
            Remove Symbol
          </Button>
        </div>
      </div>
    </div>
  );
};

const Row = (props: {
  key1?: string;
  value1?: string;
  key2?: string;
  value2?: string;
}) => {
  return (
    <div
      style={{
        //backgroundColor: "#ff0000",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Coll keyword={props.key1} value={props.value1} />
      <Coll keyword={props.key2} value={props.value2} />
    </div>
  );
};

const Coll = (props: {
  keyword?: string;
  value?: string;
  disabled?: boolean;
}) => {
  return (
    <div
      className="container"
      style={{
        //backgroundColor: "#0000ff",
        flex: 1,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
      }}
    >
      <p style={{ fontWeight: "normal", fontSize: 15, margin: 0, padding: 0 }}>
        {props.keyword}
      </p>
      {props.value && (
        <div>
          <InputGroup className="">
            <Form.Control
              disabled={props.disabled}
              placeholder={props.value}
              style={{ width: 100, height: 30, fontSize: 15 }}
            />
          </InputGroup>
        </div>
      )}
    </div>
  );
};

export default Block;
