import { Bolt, Clock, Pause, Play, Shield } from "lucide-react";
import Link from "next/link";
import React from "react";
import { BiSupport } from "react-icons/bi";
import { BsFillCameraVideoFill } from "react-icons/bs";
import { PiArrowBendDownRightBold, PiVideoCamera } from "react-icons/pi";

const Enterprise = () => {
  const quickAccess = [
    {
      label: "Open API Specs",
      sub: "Download full version 1 spec",
      Icon: BsFillCameraVideoFill,
      href: "#",
    },
    {
      label: "Agent SDK",
      sub: "Build custom agents",
      Icon: Bolt,
      href: "#",
    },
    {
      label: "Catalog",
      sub: "Latest resources",
      Icon: Clock,
      href: "#",
    },
  ];
  return (
    <div className="min-w-[200px] py-3 pl-2">
      <p className="text-sm text-neutral-300 uppercase">Useful Links</p>
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

      <p className="text-sm text-neutral-300 uppercase mt-3">
        Recently Uploaded
      </p>

      <div className="space-y-2">
        <div className="space-y-1 pt-2">
          <p className="text-xs">12 MAR 2026</p>
          <p className="text-sm">Gate dry-run mode docs updated</p>
          <p className=" bg-IMSCyan/10 text-IMSCyan rounded p-1 px-2 text-sm w-fit">
            Reference
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs">01 MAR 2026</p>
          <p className="text-sm">Policy versioning guide added</p>
          <p className=" bg-IMSCyan/10 text-IMSCyan rounded p-1 px-2 text-sm w-fit">
            Tutorial
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs">14 FEB 2026</p>
          <p className="text-sm">Slack integration guide published</p>
          <p className=" bg-IMSCyan/10 text-IMSCyan rounded p-1 px-2 text-sm w-fit">
            Integration
          </p>
        </div>
      </div>
    </div>
  );
};

export default Enterprise;
