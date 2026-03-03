import React from "react";

const ImsSidebar = () => {
  return (
    <div className="bg-[#DCFFDD] w-full min-h-screen p-6 flex">
      <div className="bg-[#1C401D] w-full h-full rounded-2xl flex-col flex justify-between items-center overflow-clip">
        <div className=" p-6">
          <p className=" font-bigshotOne text-5xl text-white leading-[3.5rem]">
            Incident Management Simplified
          </p>
          <p className=" text-white mt-4 text-sm">
            Scrubbe IMS helps DevOps and SRE teams reduce MTTR, meet SLAs, and
            keep critical systems online.
          </p>
        </div>
        <div className=" rounded-t-full w-[160%] overflow-clip h-[70%] relative">
          <img
            src="/IMS/auth_image.png"
            alt=""
            className=" scale-80 absolute translate-y-[-10%]"
          />
        </div>
      </div>
    </div>
  );
};

export default ImsSidebar;
