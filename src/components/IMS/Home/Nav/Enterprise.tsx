import { Pause, Play, Shield } from "lucide-react";
import Link from "next/link";
import React from "react";
import { BiSupport } from "react-icons/bi";
import { PiArrowBendDownRightBold, PiVideoCamera } from "react-icons/pi";

const Enterprise = () => {
  const quickAccess = [
    {
      label: "Talk to Sales",
      sub: "Custom pricing and Contracts",
      Icon: BiSupport,
      href: "#",
    },
    {
      label: "Enterprise Roadmap",
      sub: "What’s coming for enterprise",
      Icon: PiArrowBendDownRightBold,
      href: "#",
    },
    {
      label: "Security Overview",
      sub: "Architecture & Trust docs",
      Icon: Shield,
      href: "#",
    },
  ];
  return (
    <div className="min-w-[200px] py-3 pl-2">
      <p className="text-sm text-neutral-300 uppercase">Get Started</p>
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

      <p className="text-sm text-neutral-300 uppercase mt-3">Compliance</p>

      <div className="space-y-2">
        <div className="space-y-1 pt-2">
          <p className="text-xs">SOC 2 TYPE II</p>
          <p className="text-sm">Audit in progress</p>
          <p className=" bg-IMSCyan/10 text-IMSCyan rounded p-1 px-2 text-sm w-fit">
            In Progress
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs">GDPR</p>
          <p className="text-sm">DPA available on request</p>
          <p className=" bg-IMSCyan/10 text-IMSCyan rounded p-1 px-2 text-sm w-fit">
            Available
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs">ISO 27001</p>
          <p className="text-sm">Planned Q4 2026</p>
          <p className=" bg-IMSCyan/10 text-IMSCyan rounded p-1 px-2 text-sm w-fit">
            Planned
          </p>
        </div>
      </div>
    </div>
  );
};

export default Enterprise;
