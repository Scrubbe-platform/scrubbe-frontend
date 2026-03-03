import NewNavbar from "@/components/landing/header/NewNavbar";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <NewNavbar />
      {children}
    </div>
  );
};

export default AuthLayout;
