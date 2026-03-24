import React from "react";
import { ProtectedRoute } from "../components/global/ProtectedRoute";
import TradeComponent from "../components/trade";
import Header from "../components/header";

type DashboardProps = { location?: { pathname?: string } };

function Dashboard(): JSX.Element {
  return (
    <main>
      <Header />
      <TradeComponent />
    </main>
  );
}

export default function DashboardPage(props: DashboardProps): JSX.Element {
  return <ProtectedRoute component={Dashboard} {...props} />;
}
