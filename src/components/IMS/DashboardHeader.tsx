"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Settings, LogOut } from "lucide-react";
import Image from "next/image";
import useLogout from "@/hooks/useLogout";
import { useCurrentUser, User } from "@/lib/api";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
}

export default function Header({ title = "Dashboard" }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { handleLogout } = useLogout();
  const { execute: getUser } = useCurrentUser();
  const [user, setUser] = useState<User | null>();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const resp = await getUser();
      setUser(resp as User);
    })();
  }, []);
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white shadow-sm shadow-light">
      {/* Title */}
      <h1 className="text-2xl font-ibm font-medium text-zinc-900">{title}</h1>

      {/* User dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-3 hover:bg-zinc-50 rounded-xl px-3 py-2 transition-colors"
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-200 shrink-0">
            {user?.profileImage ? (
              <Image
                src={user.profileImage}
                alt={user.firstName}
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center uppercase justify-center text-base font-bold bg-indigo-500 text-white ">
                {user?.firstName?.slice(0, 2)}
              </div>
            )}
          </div>

          {/* Name + role */}
          <div className="text-left">
            <p className="text-sm font-semibold capitalize text-zinc-900 leading-tight">
              {user?.firstName}
            </p>
            <p className="text-xs text-zinc-400 leading-tight">
              {user?.roles[0]}
            </p>
          </div>

          <ChevronDown
            size={16}
            className={`text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-[calc(100%+6px)] w-48 bg-white border border-zinc-200 rounded-xl shadow-lg py-1.5 z-50">
            <button
              type="button"
              onClick={() => router.push("/incident/settings")}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-zinc-700 font-medium hover:bg-zinc-50 transition-colors"
            >
              <Settings size={15} className="text-zinc-400" />
              Settings
            </button>

            <div className="h-px bg-zinc-100 my-1" />

            <button
              type="button"
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 font-medium hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
