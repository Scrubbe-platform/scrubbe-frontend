import DashboardWrapper from "@/components/dashboard/DashboardWrapper";
import InterceptorWrapper from "@/provider/InterceptorProvider";
import { RedirectProvider } from "@/provider/RedirectProvider";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <RedirectProvider>
      <DashboardWrapper>
        <InterceptorWrapper />
        {children}
      </DashboardWrapper>
    </RedirectProvider>
  );
};

export default layout;
