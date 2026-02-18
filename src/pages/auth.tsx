import axios from "axios";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

export default function ModalScreen() {
  const abhimanyuToken = "35bd08ae-1857-4a3c-a1b9-ba570ae48f28";
  const abhimanyuMobile = "+919582463222";
  const abhimanyuUcc = "V11PB";
  const ShivaToken = "";
  const ShivaMobile = "";
  const ShivaUcc = "";

  const [token, setToken] = useState("");
  const [mobile, setMobile] = useState("");
  const [ucc, setUcc] = useState("");
  const [totp, setTotp] = useState("950802");

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2
        style={{
          marginTop: 100,
        }}
      >
        Authenticate User
      </h2>
      <div
        style={{ display: "flex", flexDirection: "row", padding: "20px 0px" }}
      >
        <Button
          variant="primary"
          style={{ marginRight: 20 }}
          onClick={() => {
            setToken(abhimanyuToken);
            setMobile(abhimanyuMobile);
            setUcc(abhimanyuUcc);
          }}
        >
          Abhimanyu
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            setToken(ShivaToken);
            setMobile(ShivaMobile);
            setUcc(ShivaUcc);
          }}
        >
          Shiva
        </Button>
      </div>
      <div // Form for user authentication
        style={{
          backgroundColor: "#eeeeee",
          padding: 20,
          borderRadius: 25,
          minWidth: 300,
        }}
      >
        <Form>
          <Form.Group controlId="formBasicToken">
            <Form.Label>Enter API Token</Form.Label>
            <Form.Control
              type="text"
              placeholder="Token"
              value={token}
              disabled
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicMobile">
            <Form.Label>Enter Mobile Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Mobile Number"
              value={mobile}
              disabled
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicUcc">
            <Form.Label>Enter Unique Client Code</Form.Label>
            <Form.Control
              type="text"
              placeholder="Unique Client Code"
              value={ucc}
              disabled
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicTotp">
            <Form.Label>Enter TOTP</Form.Label>
            <Form.Control
              type="text"
              placeholder="TOTP"
              value={totp}
              onChange={(e) => setTotp(e.target.value)}
            />
          </Form.Group>
        </Form>
      </div>

      <Button
        style={{ marginTop: 20 }}
        variant="primary"
        onClick={() => {
          console.log("Auth button pressed");
          if (token && mobile && ucc && totp) {
            console.log("Now authenticating...");
            AuthenticateUser({ token, mobile, ucc, totp });
          } else {
            console.log("Please fill in all fields");
          }
        }}
      >
        Authenticate
      </Button>
    </div>
  );
}

const AuthenticateUser = async (props: {
  token: string;
  mobile: string;
  ucc: string;
  totp: string;
}) => {
  try {
    const response = await axios.post(
      "https://mis.kotaksecurities.com/login/1.0/tradeApiLogin",
      {
        mobileNumber: props.mobile,
        ucc: props.ucc,
        totp: props.totp,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          "neo-fin-key": "neotradeapi",
          Authorization: props.token,
        },
        withCredentials: false,
      },
    );
    console.log("Authentication response::", response);
    alert("response: " + JSON.stringify(response.data));
  } catch (error) {
    console.error("Error during authentication::", error);
    alert("Error: " + JSON.stringify(error));
  }
};
