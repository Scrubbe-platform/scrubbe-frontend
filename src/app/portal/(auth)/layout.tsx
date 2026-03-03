import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen h-full w-full relative z-10 flex justify-center items-center">
      <img
        src="/IMS/portal-auth-bg.jpg"
        alt=""
        className=" w-full h-full absolute -z-10"
      />
      {children}
    </div>
  );
};

export default layout;
