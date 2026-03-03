import Navbar from "@/components/IMS/Portal/Navbar";
import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className=" min-h-screen  bg-neutral-50 w-full">
      <Navbar />
      <div className="p-4 container mx-auto">{children}</div>
    </div>
  );
};

export default layout;
