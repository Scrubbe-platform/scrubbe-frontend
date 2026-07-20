import Header from "@/components/IMS/DashboardHeader";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header title="Playbook Library" />
      {children}
    </>
  );
};

export default Layout;
