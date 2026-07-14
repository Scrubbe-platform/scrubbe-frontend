import Header from "@/components/IMS/DashboardHeader";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header title="Incident Library" />
      {children}
    </>
  );
};

export default Layout;
