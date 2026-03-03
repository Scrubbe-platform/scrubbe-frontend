import DashboardWrapper from "@/components/developer/DashboardWrapper";
import InterceptorWrapper from "@/provider/InterceptorProvider";
import { RedirectProvider } from "@/provider/RedirectProvider";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <RedirectProvider>
      <DashboardWrapper>
        <InterceptorWrapper />
        {children}
      </DashboardWrapper>
    </RedirectProvider>
  );
};

export default DashboardLayout;
