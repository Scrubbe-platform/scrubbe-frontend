import DashboardWrapper from "@/components/IMS/DashboardWrapper";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const IS_STANDALONE = process.env.NEXT_PUBLIC_IS_STANDALONE === "true";
const IncidentDashboard = ({ children }: { children: ReactNode }) => {
  if (!IS_STANDALONE) {
    // If we're in standalone mode, redirect any dashboard page to the incident page.
    redirect("/");
  }
  return <>
  <DashboardWrapper>
  {children}
  </DashboardWrapper>
  </>;
};

export default IncidentDashboard;
