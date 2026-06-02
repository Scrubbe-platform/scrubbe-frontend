/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NewMenu } from "@/lib/constant/index";
import useLogout from "@/hooks/useLogout";
import { BsArrowBarLeft } from "react-icons/bs";
import { useSidebar } from "@/lib/stores/useSidebar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "@/lib/stores/auth.store";
import useGetConfig from "@/hooks/useConfig";

const Sidebar = () => {
  const pathname = usePathname();
  const { collapse, toggle } = useSidebar();
  const { imsConfig , isLoading } = useGetConfig();
  return (
    <motion.div
      initial={false}
      animate={{
        width: collapse ? 0 : 300,
        opacity: collapse ? 0 : 1,
        x:
          collapse && typeof window !== "undefined" && window.innerWidth < 768
            ? -300
            : 0,
      }}
      className={cn(
        "flex flex-col justify-between py-5 overflow-x-hidden whitespace-nowrap z-40 px-3",
        // theme-aware background + border
        "bg-white dark:bg-dark",
        "fixed inset-y-0 left-0 md:relative md:inset-auto md:flex",
        "border-r border-zinc-200 dark:border-white/20",
        collapse ? "pointer-events-none border-none" : "pointer-events-auto"
      )}
    >
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
              {/* Logo + collapse toggle */}
              <div className="flex items-center justify-between">
                <div className="h-[30px] w-[220px]">
                  {/* light logo / dark logo */}
                  <img
                    src="/IMS/whitelogo.png"
                    alt="scrubbe"
                    className="object-contain h-full hidden dark:block"
                  />
                  <img
                    src="/IMS/blacklogo.png"
                    alt="scrubbe"
                    className="object-contain h-full block dark:hidden"
                  />
                </div>
                <button
                  onClick={toggle}
                  className="cursor-pointer text-zinc-400 dark:text-white/60 hover:text-zinc-700 dark:hover:text-white transition-colors"
                >
                  <BsArrowBarLeft />
                </button>
              </div>

              {/* Status badge */}
              <div className="border border-zinc-200 dark:border-white/20 p-1 px-2 rounded-lg flex items-center gap-2 mt-3 w-fit">
                <div className="size-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-zinc-700 dark:text-white">
                  {isLoading ? "Loading config..." : imsConfig?.orgName || "Unknown status"}
                </span>
              </div>

              {/* Menu sections */}
              <div className="overflow-y-auto custom-scrollbar pr-1">
                {Object.entries(NewMenu).map(([key, items]) => (
                  <div
                    key={key}
                    className="flex flex-col gap-1 mt-6 w-full border-b border-zinc-100 dark:border-white/10 pb-4"
                  >
                    <p className="text-[10px] text-zinc-400 dark:text-white/50 pl-3 pb-2 uppercase font-bold tracking-widest">
                      {key.replace("_", " ")}
                    </p>
                    {(items as any[]).map((item: any, index: number) => (
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
    </motion.div>
  );
};

export default Sidebar;

// ── Sidebar item ──────────────────────────────────────────────────

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
          "flex gap-3 rounded-lg cursor-pointer transition-all duration-200 px-3 py-3 w-full border",
          active
            ? [
                // dark active
                "dark:bg-gradient-to-t dark:from-[#004B571A] dark:to-[#0074834D]",
                "dark:border-IMSCyan dark:shadow-[inset_0_0_10px_rgba(0,116,131,0.2)]",
                // light active
                "bg-cyan-50 border-cyan-300",
              ]
            : ["border-transparent", "hover:bg-zinc-100 dark:hover:bg-white/5"]
        )}
      >
        <item.Icon
          size={18}
          className={cn(
            active
              ? "text-IMSCyan dark:text-IMSCyan"
              : "text-zinc-400 dark:text-white/70"
          )}
        />
        <div className="flex-1 space-y-1 -mt-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <p
              className={cn(
                "text-sm font-medium",
                active
                  ? "text-cyan-700 dark:text-white"
                  : "text-zinc-700 dark:text-white/80"
              )}
            >
              {item.name}
            </p>
            {item.pillText && (
              <p
                className={cn(
                  "border rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase",
                  item.pillBorderColor ||
                    "border-zinc-300 dark:border-zinc-500",
                  item.pillTextColor || "text-zinc-500 dark:text-zinc-400"
                )}
              >
                {item.pillText}
              </p>
            )}
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-white/40 leading-tight line-clamp-1">
            {item.description}
          </p>
        </div>
      </div>
    </Link>
  );
};
