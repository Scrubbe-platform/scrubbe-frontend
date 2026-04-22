/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SubSidebar, NewMenu } from "@/lib/constant/index";
import { FaSignOutAlt } from "react-icons/fa";
import useLogout from "@/hooks/useLogout";
import { BsArrowBarLeft } from "react-icons/bs";
import { useSidebar } from "@/lib/stores/useSidebar";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion
import { toggle } from "@heroui/react";

const Sidebar = () => {
  const pathname = usePathname();
  const { handleLogout } = useLogout();
  const { collapse, toggle } = useSidebar();

  return (
    <motion.div
      initial={false}
      animate={{
        width: collapse ? 0 : 300,
        opacity: collapse ? 0 : 1,
        // Add x translation for mobile overlay feel
        x:
          collapse && typeof window !== "undefined" && window.innerWidth < 768
            ? -300
            : 0,
      }}
      className={cn(
        "flex flex-col justify-between bg-dark py-5 overflow-x-hidden whitespace-nowrap z-[60] px-3",
        // MOBILE: Make it fixed overlay | DESKTOP: Make it relative/border
        "fixed inset-y-0 left-0 md:relative md:inset-auto md:flex md:border-r md:border-white/20",
        collapse ? "pointer-events-none border-none" : "pointer-events-auto"
      )}
    >
      {/* Wrap content in AnimatePresence to fade it out before the width hits 0 */}
      <AnimatePresence>
        {!collapse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col h-full justify-between"
          >
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="h-[30px] w-[220px]">
                  <img
                    src="/IMS/whitelogo.png"
                    alt="scrubbe.png"
                    className="object-contain h-full"
                  />
                </div>

                <div onClick={toggle} className="cursor-pointer">
                  <BsArrowBarLeft className="text-white" />
                </div>
              </div>

              {/* Status Badge - Governance Lineage requirement [cite: 47] */}
              <div className="border border-white/20 p-1 px-2 rounded-lg flex items-center gap-2 text-white mt-3 w-fit">
                <div className="size-2 rounded-full bg-emerald-400" />
                <span className="text-sm">Acme Payments PROD</span>
              </div>

              {/* Menu Sections - Scrollable Area */}
              <div className="overflow-y-auto  custom-scrollbar pr-1">
                {Object.entries(NewMenu).map(([key, items]) => (
                  <div
                    key={key}
                    className="flex flex-col gap-1 mt-6 w-full border-b border-white/10 pb-4"
                  >
                    <p className="text-[10px] text-white/50 pl-3 pb-2 uppercase font-bold tracking-widest">
                      {key.replace("_", " ")}
                    </p>
                    {items.map((item: any, index: number) => (
                      <AdminSidebarItem
                        item={item}
                        pathname={pathname}
                        key={index}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Toggle Button when collapsed */}
      {collapse && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed left-4 top-4 z-50 cursor-pointer bg-IMSLightGreen p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
          onClick={toggle}
        >
          <BsArrowBarLeft className="text-white rotate-180" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default Sidebar;

// Sidebar Item Component remains largely the same but with added CN for cleanliness
const AdminSidebarItem = ({
  item,
  pathname,
}: {
  item: any;
  pathname: string;
}) => {
  const active = pathname === item.link;
  return (
    <Link href={item.link} className="w-full">
      <div
        className={cn(
          "flex text-white gap-3 rounded-lg cursor-pointer transition-all duration-200 px-3 py-3 w-full border border-transparent",
          active
            ? "bg-gradient-to-t from-[#004B571A] to-[#0074834D] border-IMSCyan shadow-[inset_0_0_10px_rgba(0,116,131,0.2)]"
            : "hover:bg-white/5"
        )}
      >
        <item.Icon
          size={18}
          className={cn(active ? "text-IMSCyan" : "text-white/70")}
        />
        <div className="flex-1 space-y-1 -mt-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <p
              className={cn(
                "text-sm font-medium",
                active ? "text-white" : "text-white/80"
              )}
            >
              {item.name}
            </p>
            {item.pillText && (
              <p
                className={cn(
                  "border rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase",
                  item.pillBorderColor || "border-zinc-500",
                  item.pillTextColor || "text-zinc-400"
                )}
              >
                {item.pillText}
              </p>
            )}
          </div>
          <p className="text-[10px] text-white/40 leading-tight line-clamp-1">
            {item.description}
          </p>
        </div>
      </div>
    </Link>
  );
};
