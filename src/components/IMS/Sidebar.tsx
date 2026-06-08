/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NewMenu } from "@/lib/constant/index";
import { useSidebar } from "@/lib/stores/useSidebar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import useGetConfig from "@/hooks/useConfig";
import { useState } from "react";

// Collapsed width — wide enough so icons breathe
const W_COLLAPSED = 64;
const W_EXPANDED  = 280;

const Sidebar = () => {
  const pathname  = usePathname();
  const { collapse } = useSidebar();
  const { imsConfig, isLoading } = useGetConfig();
  const [hovered, setHovered] = useState(false);

  const expanded = hovered; // icon-only by default, hover expands

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ width: expanded ? W_EXPANDED : W_COLLAPSED }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex flex-col py-5 overflow-hidden whitespace-nowrap z-40",
        "bg-white dark:bg-dark",
        "fixed inset-y-0 left-0 md:relative md:inset-auto md:flex",
        "border-r border-zinc-200 dark:border-white/[0.08]",
        "shrink-0",
        collapse && "hidden"
      )}
    >
      {/* ── Logo ── */}
      <div className="h-7 mb-5 overflow-hidden px-3 flex items-center">
        <AnimatePresence mode="wait" initial={false}>
          {expanded ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-7 w-[160px] shrink-0"
            >
              <img src="/IMS/whitelogo.png" alt="scrubbe" className="object-contain h-full hidden dark:block" />
              <img src="/IMS/blacklogo.png" alt="scrubbe" className="object-contain h-full block dark:hidden" />
            </motion.div>
          ) : (
            <motion.div
              key="logo-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center w-8 h-7"
            >
              <img src="/IMS/icons/scrubbe-white-icon.svg"      alt="S" className="h-6 w-6 object-contain hidden dark:block" />
              <img src="/IMS/icons/scrubbe-icon.svg" alt="S" className="h-6 w-6 object-contain block dark:hidden" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Org pill ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden px-3 mb-3"
          >
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 w-fit">
              <div className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-[12px] font-medium text-zinc-600 dark:text-zinc-300">
                {isLoading ? "Loading…" : imsConfig?.orgName || "Unknown"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Menu ── */}
      <div className="overflow-y-auto overflow-x-hidden flex-1 mt-1">
        {Object.entries(NewMenu).map(([key, items]) => (
          <div
            key={key}
            className="flex flex-col gap-0.5 mt-3 w-full border-b border-zinc-100 dark:border-white/[0.06] pb-3"
          >
            {/* Section label */}
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-[10px] text-zinc-400 dark:text-zinc-500 pl-3 pb-1.5 uppercase font-semibold tracking-widest"
                >
                  {key.replace("_", " ")}
                </motion.p>
              )}
            </AnimatePresence>

            {(items as any[]).map((item: any, index: number) => (
              <AdminSidebarItem
                key={index}
                item={item}
                pathname={pathname}
                expanded={expanded}
              />
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Sidebar;

// ── Sidebar item ──────────────────────────────────────────────────

const AdminSidebarItem = ({
  item,
  pathname,
  expanded,
}: {
  item: any;
  pathname: string;
  expanded: boolean;
}) => {
  const active = pathname === item.link;

  return (
    <Link href={item.link} className="w-full block px-2">
      <div
        title={!expanded ? item.name : undefined}
        className={cn(
          "flex items-center rounded-lg cursor-pointer transition-all duration-150 py-2.5 w-full border",
          // When collapsed: center the icon with equal padding
          // When expanded: left-align with gap and horizontal padding
          expanded ? "gap-3 px-2.5" : "justify-center px-0",
          active
            ? "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/60"
            : "border-transparent hover:bg-zinc-50 dark:hover:bg-white/5"
        )}
      >
        {/* Icon — always visible, never squished */}
        <item.Icon
          size={18}
          className={cn(
            "shrink-0",
            active
              ? "text-emerald-500 dark:text-emerald-400"
              : "text-zinc-400 dark:text-zinc-500"
          )}
        />

        {/* Label + description — animate in/out */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="overflow-hidden flex-1 min-w-0"
            >
              <p className={cn(
                "text-[13px] font-medium leading-tight truncate",
                active
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 dark:text-zinc-400"
              )}>
                {item.name}
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-600 leading-tight truncate mt-0.5">
                {item.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Link>
  );
};