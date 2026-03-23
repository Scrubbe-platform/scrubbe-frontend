import { Bolt, Clock, Pause, Play, Shield } from "lucide-react";
import Link from "next/link";
import React from "react";
import { BiSupport } from "react-icons/bi";
import { BsFillCameraVideoFill } from "react-icons/bs";
import { PiArrowBendDownRightBold, PiVideoCamera } from "react-icons/pi";

const Enterprise = () => {
  const quickAccess = [
    {
      label: "Product Demo",
      sub: "Full Incident Walkthrough",
      Icon: BsFillCameraVideoFill,
      href: "#",
    },
    {
      label: "Next Webinar",
      sub: "25 march - AI generated  ODS",
      Icon: Bolt,
      href: "#",
    },
  ];
  return (
    <div className="min-w-[200px] py-3 pl-2">
      <p className="text-sm text-neutral-300 uppercase">Featured</p>
      <div className="space-y-2 mt-3 border-b border-neutral-600 pb-3">
        {quickAccess.map((item, index) => (
          <Link
            href={item.href}
            className="flex items-center gap-2"
            key={index}
          >
            <div className="size-10 rounded-sm flex justify-center items-center text-IMSCyan border-neutral-500 border">
              <item.Icon size={14} />
            </div>
            <div>
              <p className="text-sm">{item.label}</p>
              <p className="text-sm text-neutral-300">{item.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-sm text-neutral-300 uppercase mt-3">Latest Posts</p>

      <div className="space-y-2">
        <div className="space-y-1 pt-2">
          <p className="text-xs">10 MAR 2026</p>
          <p className="text-sm">Why governance must precede automation</p>
          <p className=" bg-IMSCyan/10 text-IMSCyan rounded p-1 px-2 text-sm w-fit">
            Engineering
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs">24 FEB 2026</p>
          <p className="text-sm">Designing the execution gate</p>
          <p className=" bg-IMSCyan/10 text-IMSCyan rounded p-1 px-2 text-sm w-fit">
            Architecture
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs">10 FEB 2026</p>
          <p className="text-sm">The case for immutable audit events</p>
          <p className=" bg-IMSCyan/10 text-IMSCyan rounded p-1 px-2 text-sm w-fit">
            Governance
          </p>
        </div>
      </div>
    </div>
  );
};

export default Enterprise;
