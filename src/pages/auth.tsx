import React from "react";
import AuthUI from "../components/auth";
import Header from "../components/header";

export default function Auth({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <main>
      <Header />
      <AuthUI />
    </main>
  );
}
