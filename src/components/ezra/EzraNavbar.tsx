"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import useAuthStore from "@/lib/stores/auth.store";
import { useEffect, useRef, useState } from "react";

const EzraNavbar = () => {
  const pathname = usePathname();
  const isIncidentTicket = pathname.split("/").includes("incident-ticket");
  const { user } = useAuthStore();
  const [menu, setMenu] = useState(false);
  const statusFilterRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menu) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target as Node)
      ) {
        setMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menu]);
  return (
    <div>
      <div className="h-[80px] w-full border-b border-blue-400/50  flex justify-between items-center px-[3%]">
        <div className=" w-[50%] dark:bg-zinc-800 bg-zinc-100 flex gap-3 items-center border border-zinc-200 dark:border-zinc-600 rounded-lg h-[38px] px-2">
          <img src="/ezrastar.svg" alt="" className="size-6" />
          <input
            type="text"
            placeholder="Ask Ezra to summarise incidents for today"
            className="bg-transparent outline-none dark:text-white w-full text-base "
          />
        </div>

        <div className="flex items-center gap-1">
          <div
            onClick={() => setMenu((prev) => !prev)}
            className="flex items-center gap-1 relative"
          >
            <div className=" cursor-pointer size-9 rounded-full bg-zinc-700 flex justify-center items-center text-[80%] text-white">
              {user?.firstName?.[0]}.{user?.lastName?.[0]}
            </div>
            <ChevronDown className=" text-zinc-400" />

            {menu && (
              <div
                ref={statusFilterRef}
                className=" w-auto border z-50 border-gray-200 p-2 absolute   h-fit bg-white rounded-md top-full right-0 transform  mt-1"
              >
                <div className="flex items-center gap-3 text-sm cursor-pointer text-gray-500 px-2 py-1 hover:bg-colorScBlue hover:text-white rounded-md transition-colors">
                  <div className=" size-7 text-sm rounded-full bg-zinc-700 flex justify-center items-center text-white">
                    {user?.firstName?.[0]}.{user?.lastName?.[0]}
                  </div>
                  <p className=" text-nowrap">
                    {user?.firstName} {user?.lastName} (You)
                  </p>
                </div>
              </div>
            )}
          </div>

          {isIncidentTicket && (
            <Button variant="destructive" size="sm" className="px-2 ml-2">
              <p className="  text-white">48 active threats</p>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EzraNavbar;
