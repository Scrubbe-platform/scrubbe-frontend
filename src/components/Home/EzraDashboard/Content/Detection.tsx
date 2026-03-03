import React from "react";

const Detection = () => {
  return (
    <div className=" w-full h-full relative">
      <div className=" absolute top-0 flex justify-between items-center w-full z-10">
        <p className="text-white text-[110%] font-medium">
          Customizable Anomaly Detection Dashboard
        </p>
      </div>
      <img src="/anomaly_bg.png" className=" scale-105"  alt="anomaly_bg.png"/>
    </div>
  );
};

export default Detection;
