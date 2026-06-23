import Dropdown from "@/components/ui/Dropdown";
import React from "react";
import { GiChatBubble } from "react-icons/gi";
import { IoChatboxOutline } from "react-icons/io5";

const MOCK_VIEWERS = [
  {
    name: "Paschal I.",
    role: "Incident Commander",
    department: "Platform Eng",
    colorClass: "bg-zinc-900 text-white font-mono",
    isYou: true,
  },
  {
    name: "Aisha R.",
    role: "Incoming Commander",
    department: "On-Call / SRE",
    colorClass: "bg-purple-600 text-white font-mono",
  },
  {
    name: "Dev K.",
    role: "Senior SRE",
    department: "On-Call / SRE",
    colorClass: "bg-cyan-700 text-white font-mono",
  },
  {
    name: "Mo F.",
    role: "Platform Engineer",
    department: "Platform Eng",
    colorClass: "bg-amber-700 text-white font-mono",
  },
  {
    name: "Sara N.",
    role: "Engineering Manager",
    department: "Management",
    colorClass: "bg-pink-700 text-white font-mono",
  },
];
type Props = {
  title: string;
};
const LiveViewers = ({ title }: Props) => {
  return (
    <div>
      <Dropdown
        trigger={
          <div className=" border items-center flex gap-2 p-1 px-2 rounded-md bg-gray-50">
            <div className="flex items-center -space-x-2 select-none">
              {MOCK_VIEWERS.slice(0, 4).map((viewer, idx) => (
                <div
                  key={idx}
                  className={`relative h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-2xs dark:border-zinc-950 cursor-pointer transition-transform hover:-translate-y-0.5 z-10 ${viewer.colorClass}`}
                  title={`${viewer.name} — ${viewer.role}`}
                >
                  {viewer.name?.slice(0, 2)}
                </div>
              ))}
              {MOCK_VIEWERS.length - 4 > 0 && (
                <div className="h-8 w-8 rounded-full border-2 border-white bg-stone-200 text-stone-600 flex items-center justify-center text-[10px] font-bold dark:border-zinc-950 dark:bg-zinc-800 dark:text-zinc-400">
                  +{MOCK_VIEWERS.length - 4}
                </div>
              )}
            </div>
            <p className="text-sm font-medium">Viewing</p>
          </div>
        }
      >
        <div className="min-w-[250px] px-4 py-4">
          <div>
            <p className="text-base font-bold">{title}</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {MOCK_VIEWERS.length} team members · live
            </p>
          </div>

          <div className="mt-3">
            {MOCK_VIEWERS.map((viewer, idx) => (
              <div className="flex justify-between items-center py-2">
                <div className="flex items-end gap-3">
                  <div
                    key={idx}
                    className={`relative h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-2xs dark:border-zinc-950 cursor-pointer transition-transform hover:-translate-y-0.5 z-10 ${viewer.colorClass}`}
                    title={`${viewer.name} — ${viewer.role}`}
                  >
                    {viewer.name?.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      {viewer.name} {viewer.isYou && "(You)"}
                    </p>
                    <p className="text-xs">{viewer.department}</p>
                  </div>
                </div>
                <div className=" cursor-pointer">
                  <IoChatboxOutline />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Dropdown>
    </div>
  );
};

export default LiveViewers;
