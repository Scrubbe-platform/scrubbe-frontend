/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem, NewMenu } from "@/lib/constant/index";
import { useSidebar } from "@/lib/stores/useSidebar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import useGetConfig from "@/hooks/useConfig";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useCurrentUser } from "@/lib/api";
import { User } from "@/lib/stores/auth.store";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import useLogout from "@/hooks/useLogout";

const W_COLLAPSED = 64;
const W_EXPANDED = 280;

const TRANSITION = { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] };

const Sidebar = () => {
  const pathname = usePathname();
  const { collapse } = useSidebar();
  const [user, setUser] = useState<User | null>();
  const { execute: getUser } = useCurrentUser();
  const [expanded, setExpanded] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const { handleLogout } = useLogout();

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (expanded) {
      t = setTimeout(() => setShowLabels(true), 60);
    } else {
      setShowLabels(false);
    }
    return () => clearTimeout(t);
  }, [expanded]);

  useEffect(() => {
    (async () => {
      const resp = await getUser();
      setUser(resp as User);
    })();
  }, []);

  return (
    <motion.div
      animate={{ width: expanded ? W_EXPANDED : W_COLLAPSED }}
      transition={TRANSITION as any}
      className={cn(
        "flex flex-col py-5 overflow-hidden whitespace-nowrap z-40",
        "bg-[#111827] dark:bg-dark",
        "fixed inset-y-0 left-0 md:relative md:inset-auto md:flex",
        "border-r border-zinc-200 dark:border-white/[0.08]",
        "shrink-0",
        collapse && "hidden",
      )}
    >
      {/* ── Logo + toggle ── */}
      <div className="h-7 mb-5 overflow-hidden px-3 flex items-center justify-between">
        <AnimatePresence mode="wait" initial={false}>
          {showLabels ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-7 w-[160px] border-white -ml-4 shrink-0 relative"
            >
              <Image
                src="/IMS/whitelogo.png"
                alt="scrubbe"
                fill
                className="object-contain"
              />
            </motion.div>
          ) : (
            <></>
          )}
        </AnimatePresence>

        {/* Toggle button — always visible */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="shrink-0 flex items-center justify-center w-7 h-7 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors duration-150"
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? (
            <PanelLeftClose size={15} />
          ) : (
            <PanelLeftOpen size={15} />
          )}
        </button>
      </div>

      {/* ── Menu ── */}
      <div className="overflow-y-auto overflow-x-hidden flex-1 mt-1 no-scrollbar">
        {Object.entries(NewMenu).map(([key, items]) => (
          <div
            key={key}
            className="flex flex-col gap-0.5 mt-3 w-full border-b border-white/15 pb-3"
          >
            <div className="h-6 overflow-hidden">
              <motion.p
                animate={{
                  opacity: showLabels ? 0.6 : 0,
                  y: showLabels ? 0 : 4,
                }}
                transition={TRANSITION as any}
                className="text-[10px] text-white pl-3 pb-1.5 uppercase tracking-widest"
              >
                {key.replace("_", " ")}
              </motion.p>
            </div>

            {(items as any[]).map((item: NavItem, index: number) => (
              <AdminSidebarItem
                key={index}
                item={item}
                pathname={pathname}
                expanded={expanded}
                showLabels={showLabels}
              />
            ))}
          </div>
        ))}
      </div>

      {/* ── User ── */}
      <div className="pl-3 flex items-center gap-2 pt-3">
        <div className="size-8 min-w-8 rounded-full border-2 border-white/40 flex justify-center items-center bg-indigo-500 text-white font-semibold text-sm uppercase">
          {user?.firstName?.slice(0, 2)}
        </div>
        <motion.div
          animate={{ opacity: showLabels ? 1 : 0, x: showLabels ? 0 : -4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-1 min-w-0 overflow-hidden"
        >
          <p className="text-[13px] leading-tight truncate pr-2 capitalize text-white font-medium">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-[10px] leading-tight text-white/50">
            {user?.roles[0]}
          </p>
        </motion.div>
      </div>

      {/* ── Logout ── */}
      <div
        className="pl-5 flex items-center gap-2 py-3 mt-4 hover:bg-[#02DD86]/10 dark:hover:bg-white/5 cursor-pointer"
        onClick={handleLogout}
      >
        <LogOut className="text-white shrink-0" size={18} />
        <motion.div
          animate={{ opacity: showLabels ? 1 : 0, x: showLabels ? 0 : -4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-1 min-w-0 overflow-hidden"
        >
          <p className="text-[13px] leading-tight truncate pr-2 capitalize text-white font-medium">
            Logout
          </p>
        </motion.div>
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
  showLabels,
}: {
  item: NavItem;
  pathname: string;
  expanded: boolean;
  showLabels: boolean;
}) => {
  const active = pathname === item.link;
  const isDone = item.isActive;

  return (
    <Link href={isDone ? item.link : ""} className="w-full block px-2">
      <div
        title={!expanded ? item.name : undefined}
        className={cn(
          "flex items-center justify-center cursor-pointer py-2.5 w-full gap-0",
          "border-l-2 transition-colors duration-150",
          active
            ? "border-[#02DD86] bg-[#02DD86]/20 dark:bg-zinc-800/60"
            : "border-transparent hover:bg-[#02DD86]/10 dark:hover:bg-white/5",
          !isDone && "opacity-30 cursor-not-allowed",
        )}
      >
        <div className="w-9 flex items-center justify-center shrink-0">
          <item.Icon size={18} className="shrink-0 text-white" />
        </div>

        <motion.div
          animate={{ opacity: showLabels ? 1 : 0, x: showLabels ? 0 : -4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-1 min-w-0 overflow-hidden"
        >
          <p
            className={cn(
              "text-[13px] leading-tight truncate pr-2",
              active ? "text-white font-medium" : "text-zinc-300",
            )}
          >
            {item.name}
          </p>
        </motion.div>
      </div>
    </Link>
  );
};
