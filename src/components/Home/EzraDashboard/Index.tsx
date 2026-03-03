"use client";
import { useEzraMockStore } from "@/lib/stores/ezraMock.store";
import clsx from "clsx";
import {
  ChevronDown,
  LayoutDashboard,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { TbRouteSquare } from "react-icons/tb";
import DashboardContent from "./DashboardContent";
import { Button } from "@/components/ui/button";
import { FaCodepen } from "react-icons/fa6";
import { BsQuestionOctagon } from "react-icons/bs";
import { useEffect } from "react";

export const navItem = [
  {
    name: "Dashboard",
    Icon: LayoutDashboard,
    link: "dashboard",
    enable: true,
  },
  {
    name: "Natural Language rule Input",
    Icon: TbRouteSquare,
    link: "natural_language",
    enable: true,
  },
  {
    name: "Anomaly Detection",
    Icon: LayoutDashboard,
    link: "detection",
    enable: true,
  },
  {
    name: "Playbook Builder",
    Icon: FaCodepen,
    link: "playbook",
    enable: true,
  },
  {
    name: "Incident Ticket",
    Icon: ShieldCheck,
    link: "ticket",
    enable: false,
  },
  {
    name: "Notification Settings",
    Icon: Settings,
    link: "settings",
    enable: false,
  },
  {
    name: "Support",
    Icon: BsQuestionOctagon,
    link: "support",
    enable: false,
  },
];
interface EzraDashboardProps {
  path?: string;
}
const EzraDashboard = ({ path = "dashboard" }: EzraDashboardProps) => {
  const { pathname, setPathname } = useEzraMockStore();

  useEffect(() => {
    setPathname(path);
  }, [path, setPathname]);
  return (
    <div className=" w-full bg-[#111827] h-full flex">
      <div className=" w-[26%] border-r border-[#94C5FC] h-full p-4">
        {/* sidebar */}
        <p className=" text-colorScBlue text-[200%] font-bold">Ezra</p>

        <div className="flex flex-col gap-2  items-center mt-[15%]">
          {navItem.map(({ Icon, link, name, enable }) => {
            const isActive = pathname === link;
            return (
              <div
                onClick={() => {
                  if (enable) {
                    setPathname(link);
                  }
                }}
                className={clsx(
                  "flex items-center gap-2 max-h-10 h-full rounded-lg  cursor-pointer transition-all duration-300 px-3 py-3 w-full",
                  isActive
                    ? "bg-colorScBlue  text-white font-semibold"
                    : "bg-transparent opacity-60 hover:opacity-100 text-white"
                )}
                key={name}
              >
                <div className="">
                  <Icon size={16} className={clsx("")} />
                </div>
                <p
                  className={clsx(
                    "text-[70%] transition-all delay-200 duration-100"
                  )}
                >
                  {name}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <div className=" w-full h-full">
        <div className="h-[58px] w-full border-b border-[#94C5FC]  flex justify-between items-center px-[3%]">
          <div className=" w-[50%] bg-zinc-800 flex gap-3 items-center border border-zinc-600 rounded-lg h-9 px-2">
            <img src="ezrastar.svg" alt="ezrastar.svg" />
            <p className="  text-zinc-400 text-[70%] sm:text-[90%] ">
              Ask Ezra to summarise incidents for today
            </p>
          </div>

          <div className="flex items-center gap-1">
            <div className=" size-9 rounded-full bg-zinc-700 flex justify-center items-center text-[80%] text-white">
              E.S
            </div>
            <ChevronDown className=" text-zinc-400" />
            <Button variant="destructive" className=" h-[80%] px-2 ml-2">
              <p className=" text-[80%] text-white">48 active threats</p>
            </Button>
          </div>
        </div>
        <div className=" p-4 bg-[#1F2937] overflow-clip">
          <DashboardContent />
        </div>
      </div>
    </div>
  );
};

export default EzraDashboard;
