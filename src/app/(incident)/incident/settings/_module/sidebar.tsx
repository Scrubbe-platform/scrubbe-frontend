"use client";
import React from "react";
import {
  Building2,
  Users2,
  GitBranch,
  Bell,
  ListTodo,
  ShieldCheck,
  Database,
  Sparkles,
  Lock,
  CheckCircle2,
  Sliders,
  Download,
  Upload,
  Command,
  Moon,
  Sun,
  Laptop,
} from "lucide-react";
import { PiPlug } from "react-icons/pi";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useThemeStore } from "@/lib/stores/theme.store";

const Sidebar = () => {
  const navItems = [
    {
      icon: <Building2 size={18} className="text-yellow-400" />,
      path: "/incident/settings",
      label: "Organization",
      active: true,
    },
    {
      icon: <Users2 size={18} className="text-indigo-400" />,
      path: "/incident/settings/roles",
      label: "User & Roles",
    },
    {
      icon: <PiPlug size={18} className="text-pink-400" />,
      path: "/incident/settings/integrations",
      label: "Integrations",
    },
    {
      icon: <GitBranch size={18} className="text-orange-400" />,
      path: "/incident/settings/ingestion",
      label: "CI/CD & PR Ingestion",
    },
    {
      icon: <Bell size={18} className="text-emerald-400" />,
      path: "/incident/settings/notification",
      label: "Notifications",
    },
    {
      icon: <ListTodo size={18} className="text-lime-400" />,
      path: "/incident/settings/defaults",
      label: "Defaults",
    },
    {
      icon: <ShieldCheck size={18} className="text-green-400" />,
      path: "/incident/settings/policies",
      label: "Policies",
      margin: "mt-8",
    },
    {
      icon: <Database size={18} className="text-lime-400" />,
      path: "/incident/settings/code-engine",
      label: "Code & Engine",
    },
    {
      icon: <Sparkles size={18} className="text-green-400" />,
      path: "/incident/settings/ezra",
      label: "Ezra",
    },
    {
      icon: <Lock size={18} className="text-lime-400" />,
      path: "/incident/settings/security",
      label: "Security & SSO",
    },
    {
      icon: <CheckCircle2 size={18} className="text-red-400" />,
      path: "/incident/settings/compliance",
      label: "Compliance",
    },
    {
      icon: <Sliders size={18} className="text-lime-400" />,
      path: "/incident/settings/features-flags",
      label: "Features Flags",
    },
  ];

  const router = useRouter();
  const pathname = usePathname();

  type Theme = "light" | "dark" | "system";

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <Sun size={18} /> },
    { value: "dark", label: "Dark", icon: <Moon size={18} /> },
    // { value: "system", label: "System", icon: <Laptop size={18} /> },
  ];

  const { theme, setTheme } = useThemeStore();
  const handleSelect = (value: Theme) => {
    setTheme(value);
    // hook into next-themes or your own theme context here
    // e.g. setTheme(value) from useTheme()
  };

  return (
    <div className=" min-h-screen dark:bg-[#030D25] dark:text-[#D1D5DB] p-6 flex flex-col font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-[13px] font-bold uppercase tracking-wider dark:text-white">
          Navigation
        </h2>
        <Command size={18} className="text-[#94A3B8]" />
      </div>
      <p className="text-sm text-[#94A3B8] mb-8">Admin-only configuration</p>

      {/* NAVIGATION ITEMS */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item, idx) => {
          const active = pathname === item.path;
          return (
            <Link
              key={idx}
              href={item.path}
              className={`
              flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 
              ${item.margin || ""}
              ${
                active
                  ? "bg-[#0B1224] border-[1.5px] border-[#00CAD8] text-white bg-gradient-to-t from-[#004B571A] to-[#0074834D]"
                  : "hover:bg-[#0B1224] text-[#94A3B8] hover:text-white border-[1.5px] border-transparent"
              }
            `}
            >
              <span className={active ? "text-[#00CAD8]" : "text-[#64748B]"}>
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER BUTTONS */}

      <div className=" space-y-3 mt-4">
        <div className="flex flex-col gap-1">
          {options.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className={`
            flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer
            transition-all duration-200 border-[1.5px] text-sm font-medium w-full text-left
            ${
              theme === value
                ? "bg-[#0B1224] text-white border-[#1e3a5f]"
                : "text-[#94A3B8] border-transparent hover:bg-[#0B1224] hover:text-white"
            }
          `}
            >
              <span className="text-[#64748B]">{icon}</span>
              <span>{label}</span>
              {theme === value && (
                <span className="ml-auto text-[11px] bg-[#1e293b] text-[#94a3b8] px-2 py-0.5 rounded-md">
                  Active
                </span>
              )}
            </button>
          ))}
        </div>
        <button className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border-[1.5px] border-[#00CAD8] text-[#00CAD8] font-bold text-sm hover:bg-[#00CAD8]/5 transition-colors">
          <Download size={18} />
          Export Settings (JSON)
        </button>
        <button className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border-[1.5px] border-[#00CAD8] text-[#00CAD8] font-bold text-sm hover:bg-[#00CAD8]/5 transition-colors">
          <Upload size={18} />
          Import Settings
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
