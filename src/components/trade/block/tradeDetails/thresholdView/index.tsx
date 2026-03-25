import React from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa6";
import { decimal } from "../../../../../util/helper";
//
import * as styles from "./index.module.scss";

export const ThresholdView = ({
  ltp,
  orderPrice,
  threshold,
  risk,
  exitDrop,
  exitProfit,
  isAnyOfOneOrderExited,
}: {
  ltp: number;
  orderPrice: number;
  threshold: number;
  risk: number;
  exitDrop: number;
  exitProfit: number;
  isAnyOfOneOrderExited: boolean | undefined;
}) => {
  const upperBound = decimal(orderPrice + (orderPrice / 100) * (threshold * 3));
  const lowerBound = decimal(orderPrice - (orderPrice / 100) * (threshold * 3));

  const upperThreshold = decimal(orderPrice + (orderPrice / 100) * threshold);
  const lowerThreshold = decimal(orderPrice - (orderPrice / 100) * threshold);

  const buyRiskPrice = decimal(upperThreshold - (orderPrice / 100) * risk);
  const sellRiskPrice = decimal(lowerThreshold + (orderPrice / 100) * risk);

  /** if offset manipulation is not required for some calculation than send `0` as offset */
  const getPointLocation: (point: number, offset?: number) => number = (point) => {
    return ((point - lowerBound) / (upperBound - lowerBound)) * 100;
  };

  const pointerLocation = getPointLocation(ltp);
  const outOfView = ltp > upperBound || ltp < lowerBound;

  const thresholdViewSticksCount = 80; // max 200 set as per `$max-children` in `thresholdView.module.scss`. increase this limit if more children to be added

  return (
    <div
      className="container"
      style={{
        //backgroundColor: "#eeeeee",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 80,
      }}
    >
      <div className="-col --vc" style={{ position: "relative" }}>
        <div // risks points container
          style={{ position: "relative", flex: 1 }}
        >
          <div // sell risk price
            className={styles.thresholdPoints}
            style={{ left: `${getPointLocation(sellRiskPrice)}%`, transform: `translateX(-50%) translateY(-100%)` }}
          >
            {sellRiskPrice}
            <FaCaretDown />
          </div>
          <div // buy risk price
            className={styles.thresholdPoints}
            style={{ left: `${getPointLocation(buyRiskPrice)}%`, transform: `translateX(-50%) translateY(-100%)` }}
          >
            {buyRiskPrice}
            <FaCaretDown />
          </div>
        </div>
        <div // ltp pointer
          hidden={outOfView}
          className={styles.thresholdPointer}
          style={{ left: `${pointerLocation}%`, transform: `translateX(-50%)`, zIndex: 100 }}
        />
        <div // threshold bars container
          className={`-row --vc ${styles.thresholdBarContainer}`}
        >
          {Array(thresholdViewSticksCount)
            .fill(0)
            .map((i, index) => {
              return <div />;
            })}
        </div>
        <div // threshold points container
          style={{
            //backgroundColor: "green",
            position: "relative",
            flex: 1,
          }}
        >
          <div // lower bound
            className={styles.thresholdPoints}
            style={{ left: 0 }}
          >
            <FaCaretUp />
            {lowerBound}
          </div>

          <div // lower threshold
            className={styles.thresholdPoints}
            style={{ fontSize: 10, left: `${getPointLocation(lowerThreshold)}%` }}
          >
            <FaCaretUp />
            {lowerThreshold}
          </div>
          <div // upper threshold
            className={styles.thresholdPoints}
            style={{ fontSize: 10, left: `${getPointLocation(upperThreshold)}%` }}
          >
            <FaCaretUp />
            {upperThreshold}
          </div>
          <div // upper bound
            className={styles.thresholdPoints}
            style={{ left: "100%" }}
          >
            <FaCaretUp />
            {upperBound}
          </div>
        </div>
      </div>
    </div>
  );
};
