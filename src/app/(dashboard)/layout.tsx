import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

const IS_STANDALONE = process.env.NEXT_PUBLIC_IS_STANDALONE === "true";

const ScrubbeDashboard = ({ children }: { children: ReactNode }) => {
  if (IS_STANDALONE) {
    // If we're in standalone mode, redirect any dashboard page to the incident page.
    redirect("/incident");
  }

  return <>{children}</>;
};

export default ScrubbeDashboard;
