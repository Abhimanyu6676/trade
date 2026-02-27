import React, { useEffect, useState } from "react";
import {
  _priceList,
  gailPriceList,
  ongcPriceList,
  useOnPriceChange,
} from "./price";
import { settledDecimal } from "./order";
import { Col, Container, Row } from "react-bootstrap";

export const TestStock = (props: {}) => {
  const [ltp, setLtp] = useState(0);
  const [enterPrice, setEnterPrice] = useState(0);
  const [buyExitPrice, setBuyExitPrice] = useState(0);
  const [sellExitPrice, setSellExitPrice] = useState(0);
  const [buyPnl, setBuyPnl] = useState(0);
  const [sellPnl, setSellPnl] = useState(0);
  const [thresholdCrossed, setThresholdCrossed] = useState(false);
  const [upperThresholdCrossed, setUpperThresholdCrossed] = useState(false);
  const [lowerThresholdCrossed, setLowerThresholdCrossed] = useState(false);

  const threshold = 0.5;
  const risk = 0.1;
  const downfallRisk = 0.2;

  const upperThreshold = settledDecimal(
    enterPrice + (enterPrice / 100) * threshold,
  );
  const lowerThreshold = settledDecimal(
    enterPrice - (enterPrice / 100) * threshold,
  );

  useOnPriceChange({
    priceList: ongcPriceList,
    callback: (data) => {
      false &&
        console.log(
          "time is ",
          new Date(data[0] * 1000).toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
          }),
        );
      setLtp(data[1]);
    },
  });

  //NOTE: this is custom price generator for algo testing
  /* useEffect(() => {
    let _entryPrice = 200;
    let diff = 0.2;
    let i = 0;
    let interval = setInterval(() => {
      console.log("iteration = ", i);
      let newP =
        i <= 10
          ? _entryPrice - i * diff
          : _entryPrice - 10 * diff + (i - 10) * diff;
      setLtp(i == 0 ? _entryPrice : newP);
      i++;
      if (i >= 20) clearInterval(interval);
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []); */

  useEffect(() => {
    //console.log("LTP updated new LTP = ", ltp, "enterPrice = ", enterPrice);
    if (!enterPrice && ltp) setEnterPrice(ltp);
    if (ltp && enterPrice && (!buyExitPrice || !sellExitPrice)) {
      handleLtp({ ltp });
    }
    return () => {};
  }, [ltp, enterPrice]);

  const handleLtp = (props: { ltp: number }) => {
    console.log(`\n\n\n\nhandleLtp called ${props.ltp}`);
    if (
      !thresholdCrossed &&
      (props.ltp <= lowerThreshold || props.ltp >= upperThreshold)
    ) //NOTE checking if any of the threshold limit is crossed
    {
      setThresholdCrossed(true);
      if (props.ltp >= upperThreshold) {
        console.log(
          "Upper Threshold crossed, EXITING SELL ORDER at price ",
          props.ltp,
        );
        setUpperThresholdCrossed(true);
        setSellExitPrice(props.ltp);
        setSellPnl(enterPrice - props.ltp);
      } else {
        console.log(
          "Lower Threshold crossed, EXITING BUY ORDER at price ",
          props.ltp,
        );
        setLowerThresholdCrossed(true);
        setBuyExitPrice(props.ltp);
        setBuyPnl(props.ltp - enterPrice);
      }
    } else if (
      thresholdCrossed
    ) // check for active order and handle pnl accordingly
    {
      console.log("Threshold is crossed");
      // only one order should be active to handle at this stage, but still check for both if exiting position api failed
      if (!buyExitPrice) // handle buy order
      {
        console.log("Handling Buy order");
        const newPnl = props.ltp - enterPrice;
        const hasUpperThresholdCrossed =
          ((buyPnl ? buyPnl : newPnl) / upperThreshold) * 100 >= 0;
        /* const riskThresholdPrice = hasUpperThresholdCrossed
          ? upperThreshold
          : upperThreshold - (enterPrice / 100) * risk; */
        const riskThresholdPrice = upperThreshold - (enterPrice / 100) * risk;
        const pnlChangePercentage = ((newPnl - buyPnl) / enterPrice) * 100;
        const downfallRiskValue = pnlChangePercentage + downfallRisk;
        const downfallRiskHit = downfallRiskValue <= 0 ? true : false;

        console.log(`preBuyPnl : ${buyPnl}, newPnl : ${newPnl}`);
        console.log(`hasUpperThresholdCrossed : ${hasUpperThresholdCrossed}`);
        console.log(`riskThresholdPrice : ${riskThresholdPrice}`);
        console.log(`pnlChangePercentage : ${pnlChangePercentage}`);
        console.log(`downfallRiskValue : ${downfallRiskValue}`);
        console.log(`downfallRiskHit : ${downfallRiskHit}`);

        if (props.ltp <= riskThresholdPrice) {
          console.log(
            "BUY risk Threshold crossed, exiting order at price ",
            props.ltp,
          );
          setBuyExitPrice(props.ltp);
          setBuyPnl(newPnl);
        } else {
          //TODO check if current pnl is greater than last pnl if greater than update highest pnl
          if (downfallRiskHit) {
            console.log(
              "Buy order down risk hit, booking profit and exiting order at price ",
              props.ltp,
            );
            setBuyExitPrice(props.ltp);
            setBuyPnl(newPnl);
          } else if (newPnl > buyPnl) {
            console.log(
              "buy order pnl is increased, setting new pnl as highest",
            );
            setBuyPnl(newPnl);
          }
        }
      }
      if (!sellExitPrice) // handle sell order
      {
        console.log("Handling Sell order");
        const newPnl = enterPrice - props.ltp;
        const hasLowerThresholdCrossed =
          ((sellPnl ? sellPnl : newPnl) / lowerThreshold) * 100 >= 0;
        /*  const riskThresholdPrice = hasLowerThresholdCrossed
          ? lowerThreshold
          : lowerThreshold + (enterPrice / 100) * risk; */
        const riskThresholdPrice = lowerThreshold + (enterPrice / 100) * risk;
        const pnlChangePercentage = ((newPnl - sellPnl) / enterPrice) * 100;
        const downfallRiskValue = pnlChangePercentage + downfallRisk;
        const downfallRiskHit = downfallRiskValue <= 0 ? true : false;

        console.log(`preSellPnl : ${sellPnl}, newPnl : ${newPnl}`);
        console.log(`hasLowerThresholdCrossed : ${hasLowerThresholdCrossed}`);
        console.log(`riskThresholdPrice : ${riskThresholdPrice}`);
        console.log(`pnlChangePercentage : ${pnlChangePercentage}`);
        console.log(`downfallRiskValue : ${downfallRiskValue}`);
        console.log(`downfallRiskHit : ${downfallRiskHit}`);

        if (props.ltp >= riskThresholdPrice) {
          console.log(
            "SELL risk Threshold crossed, exiting order at price ",
            props.ltp,
          );
          setSellExitPrice(props.ltp);
          setSellPnl(newPnl);
        } else {
          if (downfallRiskHit) {
            console.log(
              "Sell order down risk hit, booking profit and exiting order at price ",
              props.ltp,
            );
            setSellExitPrice(props.ltp);
            setSellPnl(newPnl);
          } else if (newPnl > sellPnl) {
            console.log(
              "sell order pnl is increased, setting new pnl as highest",
            );
            setSellPnl(newPnl);
          }
        }
      }
    } else {
      console.log("Price within threshold limits");
    }
  };

  return (
    <div>
      <Container>
        <Row // stock entryPrice and LTP
          style={{ marginTop: 10 }}
        >
          <Col
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h6>Stock Entry Point</h6>
            <h6>{enterPrice}</h6>
          </Col>
          <Col
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h6>LTP</h6>
            <h6>{ltp}</h6>
          </Col>
        </Row>
        <Row // upper and lower threshold price
          style={{ marginTop: 10 }}
        >
          <Col
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h6>Upper Threshold</h6>
            <h6>{upperThreshold}</h6>
          </Col>
          <Col
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h6>Lower Threshold</h6>
            <h6>{lowerThreshold}</h6>
          </Col>
        </Row>
        <Row // Buy and Sell orderStatus
          style={{ marginTop: 10 }}
        >
          <Col
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h6>Buy Order Status</h6>
            <h6
              style={{
                color: buyExitPrice ? "red" : "green",
              }}
            >
              {buyExitPrice ? "CLOSED" : "ACTIVE"}
            </h6>
          </Col>
          <Col
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h6>Sell Order Status</h6>
            <h6
              style={{
                color: sellExitPrice ? "red" : "green",
              }}
            >
              {sellExitPrice ? "CLOSED" : "ACTIVE"}
            </h6>
          </Col>
        </Row>
        <Row // Buy and sell exit prices
          style={{ marginTop: 10 }}
        >
          <Col
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h6>Buy Order (Buy::Sell)</h6>
            <h6>
              {enterPrice} :: {buyExitPrice}
            </h6>
          </Col>
          <Col
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h6>Sell Order (Buy::Sell)</h6>
            <h6>
              {sellExitPrice} :: {enterPrice}
            </h6>
          </Col>
        </Row>
        <Row // Buy and sell Pnl
          style={{ marginTop: 10 }}
        >
          <Col
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h6>Buy PnL</h6>
            <h6
              style={{
                color: buyPnl && buyPnl > 0 ? "green" : "red",
              }}
            >
              {settledDecimal(buyPnl)}
            </h6>
          </Col>
          <Col
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h6>Sell PnL</h6>
            <h6
              style={{
                color: sellPnl && sellPnl > 0 ? "green" : "red",
              }}
            >
              {settledDecimal(sellPnl)}
            </h6>
          </Col>
        </Row>
        <Row // net pnl
          style={{ marginTop: 10 }}
        >
          <Col
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h6>Net Pnl</h6>
            <h6
              style={{
                color: sellPnl + buyPnl > 0 ? "green" : "red",
              }}
            >
              {settledDecimal(sellPnl + buyPnl)}
            </h6>
          </Col>
          <Col
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h6>Net PnL %</h6>
            <h6
              style={{
                color: sellPnl + buyPnl > 0 ? "green" : "red",
              }}
            >
              {settledDecimal(((sellPnl + buyPnl) / enterPrice) * 100)}
            </h6>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
