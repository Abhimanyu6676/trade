import React from "react";
import { ProtectedRoute } from "../components/auth";

type DashboardProps = {
  location?: { pathname?: string };
};

function Dashboard(): JSX.Element {
  return (
    <main>
      <h1>Dashboard</h1>
    </main>
  );
}

export default function DashboardPage(props: DashboardProps): JSX.Element {
  return <ProtectedRoute component={Dashboard} {...props} />;
}
