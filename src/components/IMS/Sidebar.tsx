/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NewMenu } from "@/lib/constant/index";
import { BsArrowBarLeft } from "react-icons/bs";
import { useSidebar } from "@/lib/stores/useSidebar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import useGetConfig from "@/hooks/useConfig";

const Sidebar = () => {
  const pathname = usePathname();
  const { collapse, toggle } = useSidebar();
  const { imsConfig, isLoading } = useGetConfig();

  return (
    <motion.div
      initial={false}
      animate={{
        width: collapse ? 0 : 300,
        opacity: collapse ? 0 : 1,
        x: collapse && typeof window !== "undefined" && window.innerWidth < 768 ? -300 : 0,
      }}
      className={cn(
        "flex flex-col justify-between py-5 overflow-x-hidden whitespace-nowrap z-40 px-3",
        "bg-white dark:bg-dark",
        "fixed inset-y-0 left-0 md:relative md:inset-auto md:flex",
        "border-r border-zinc-500 dark:border-white/[0.08]",
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
              <div className="flex items-center justify-between mb-4">
                <div className="h-[28px] w-[200px]">
                  <img src="/IMS/whitelogo.png" alt="scrubbe" className="object-contain h-full hidden dark:block" />
                  <img src="/IMS/blacklogo.png" alt="scrubbe" className="object-contain h-full block dark:hidden" />
                </div>
                <button
                  onClick={toggle}
                  className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  <BsArrowBarLeft />
                </button>
              </div>

              {/* Org status */}
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 w-fit mb-1">
                <div className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[12px] font-medium text-zinc-600 dark:text-zinc-300">
                  {isLoading ? "Loading…" : imsConfig?.orgName || "Unknown"}
                </span>
              </div>

              {/* Menu sections */}
              <div className="overflow-y-auto custom-scrollbar pr-1 mt-4">
                {Object.entries(NewMenu).map(([key, items]) => (
                  <div key={key} className="flex flex-col gap-0.5 mt-5 w-full border-b border-zinc-100 dark:border-white/[0.06] pb-4">
                    <p className="text-[10px] text-black dark:text-zinc-500 pl-3 pb-2 uppercase font-semibold tracking-widest">
                      {key.replace("_", " ")}
                    </p>
                    {(items as any[]).map((item: any, index: number) => (
                      <AdminSidebarItem item={item} pathname={pathname} key={index} />
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

const AdminSidebarItem = ({ item, pathname }: { item: any; pathname: string }) => {
  const active = pathname === item.link;

  return (
    <Link href={item.link} className="w-full">
      <div className={cn(
        "flex gap-3 rounded-lg cursor-pointer transition-all duration-150 px-3 py-2.5 w-full border",
        active
          ? "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/60"
          : "border-transparent hover:bg-zinc-50 dark:hover:bg-white/5"
      )}>
        <item.Icon
          size={17}
          className={cn(
            "shrink-0 mt-0.5",
            active ? "text-green-500 dark:text-green-400" : "text-zinc-400 dark:text-zinc-500"
          )}
        />
        <div className="flex-1 space-y-0.5 overflow-hidden">
          <div className="flex items-center justify-between">
            <p className={cn(
              "text-[13px] font-medium leading-tight",
              active ? "text-black dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"
            )}>
              {item.name}
            </p>
            
          </div>
          <p className="text-[11px] text-black dark:text-zinc-600 leading-tight line-clamp-1">
            {item.description}
          </p>
        </div>
      </div>
    </Link>
  );
};