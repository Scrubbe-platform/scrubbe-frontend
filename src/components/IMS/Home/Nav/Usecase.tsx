import { Pause, Play } from "lucide-react";
import Link from "next/link";
import React from "react";
import { CiWarning } from "react-icons/ci";
import { PiArrowBendDownRightBold, PiVideoCamera } from "react-icons/pi";

const Usecase = () => {
  const quickAccess = [
    {
      label: "Fintech Co.",
      sub: "68%MTTR in 90days",
      Icon: Play,
      href: "#",
    },
    {
      label: "Healthstack",
      sub: "Zero ungated prod actions",
      Icon: PiArrowBendDownRightBold,
      href: "#",
    },
    {
      label: "Cloudinc",
      sub: "Postmortems - 3hr-2mins",
      Icon: CiWarning,
      href: "#",
    },
  ];
  return (
    <div className="min-w-[200px] py-3 pl-2">
      <p className="text-sm text-neutral-300 uppercase">Case Studies</p>
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

      <Link href={"#"} className="flex items-center gap-2">
        <div className="size-10 rounded-sm flex justify-center items-center text-IMSCyan border-neutral-500 border">
          <PiVideoCamera size={14} />
        </div>
        <div>
          <p className="text-sm">Book a demo</p>
          <p className="text-sm text-neutral-300">
            See how scrubbe handles a live incident
          </p>
        </div>
      </Link>
    </div>
  );
};

export default Usecase;
