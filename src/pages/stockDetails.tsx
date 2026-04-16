import React from "react";
import { ProtectedRoute } from "../components/global/ProtectedRoute";
import Header from "../components/header";
import { StockDetailsComp } from "../components/stockDetails";

type StockDetailsProps = { location?: { pathname?: string } };

const comp = (props: any) => {
  return (
    <main>
      <Header />
      <StockDetailsComp {...props} />
    </main>
  );
};

export default function StockDetails(props: StockDetailsProps): JSX.Element {
  return <ProtectedRoute component={comp} {...props} />;
}
