"use client";
import CButton from "@/components/ui/Cbutton";
import { useRouter } from "next/navigation";
import React from "react";

const CTA = () => {
  const router = useRouter();
  return (
    <div className="py-10 md:px-10 px-5 flex justify-center flex-col items-center gap-7 overflow-clip relative">
      <div className="absolute left-1/3 translate-x-[-15%] bg-gradient-to-r from-IMSCyan to-cyan-200 blur-3xl opacity-20 w-[50%] h-full rounded-full" />
      <p className="text-white">WORK WITH US</p>
      <p className="text-3xl md:text-5xl font-bigshotOne text-white max-w-3xl text-center">
        If your incidents touch{" "}
        <span className=" text-IMSCyan">code, pipelines and fraud</span> —
        Scrubbe is being built for you.
      </p>
      <p className=" text-white">
        We’re onboarding early teams carefully to keep the product sharp,
        opinionated and reliability-obsessed.
      </p>

      <div className="flex flex-col sm:flex-row md:justify-start justify-center gap-4 md:max-w-sm w-full mt-3">
        <CButton
          onClick={() => router.push("/partners")}
          className="  w-full px-5 h-[45px] bg-IMSCyan hover:bg-IMSDarkGreen shadow-none text-base"
        >
          Join Early Design Partners
        </CButton>
        <CButton className=" w-full px-5  h-[45px] border bg-transparent hover:bg-transparent border-IMSCyan text-IMSCyan shadow-none text-base">
          Contact the Founders
        </CButton>
      </div>
    </div>
  );
};

export default CTA;
