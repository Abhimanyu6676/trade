import React from "react";
import AuthUI from "../components/auth";

export default function Auth({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <main>
      <AuthUI />
    </main>
  );
}
