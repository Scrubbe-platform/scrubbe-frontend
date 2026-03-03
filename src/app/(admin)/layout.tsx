import React, { ReactNode } from "react";
import { Toaster } from "sonner";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-screen">
      {children}
      <Toaster position="top-center" />
    </div>
  );
};

export default Layout;
