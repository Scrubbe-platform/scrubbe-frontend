import NextJsTopLoader from "@/lib/NextJsTopLoader";
// import { RedirectProviderIMS } from "@/provider/RedirectProviderIMS";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";
import { Toaster } from "sonner";

const IS_STANDALONE = process.env.NEXT_PUBLIC_IS_STANDALONE === "true";
const IncidentDashboard = ({ children }: { children: ReactNode }) => {
  if (!IS_STANDALONE) {
    // If we're in standalone mode, redirect any dashboard page to the incident page.
    redirect("/");
  }
  return (
    // <RedirectProviderIMS>
    <>
      <NextJsTopLoader />
      {children}
      <Toaster position="top-center" />
    </>
    // </RedirectProviderIMS>
  );
};

export default IncidentDashboard;
