// app/auth/AuthTabs.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthTabs() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap dark:text-white dark:bg-dark bg-white border border-gray-300 rounded-t-[20px] overflow-hidden">
      <Link
        href="/auth/signin"
        className={`flex-1 py-3 md:py-4 px-2 flex items-center justify-center md:px-6 text-center border-r border-r-gray-300  text-sm md:text-base bor ${
          pathname === "/auth/signin" || pathname === "/auth/forgot-password"
            ? "bg-[#EFF6FF] dark:bg-subDark font-bold border-b-4 border-[#1F40AE]"
            : "hover:bg-gray-200 dark:hover:bg-subDark"
        }`}
      >
        Sign In
      </Link>
      {/* <Link
        href="/auth/forgot-password"
        className={`flex-1 py-3 md:py-4 px-2 md:px-6 text-center text-sm md:text-base ${
          pathname === "/auth/forgot-password"
            ? "bg-[#EFF6FF] font-bold border-b-4 border-[#1F40AE]"
            : "hover:bg-gray-200"
        }`}
      >
        Forgot Password
      </Link> */}
      <Link
        href="/auth/business-signup"
        className={`flex-1 py-3 md:py-4 px-2 flex items-center justify-center md:px-6 text-center border-r border-r-gray-300 text-sm md:text-base ${
          pathname === "/auth/business-signup"
            ? "bg-[#EFF6FF] dark:bg-subDark font-bold border-b-4 border-[#1F40AE]"
            : "hover:bg-gray-200 dark:hover:bg-subDark"
        }`}
      >
        Business Signup
      </Link>
      <Link
        href="/auth/developer-signup"
        className={`flex-1 py-3 md:py-4 px-2 flex items-center justify-center md:px-6 text-center text-sm md:text-base ${
          pathname === "/auth/developer-signup"
            ? "bg-[#EFF6FF] dark:bg-subDark font-bold border-b-4 border-[#1F40AE]"
            : "hover:bg-gray-200 dark:hover:bg-subDark"
        }`}
      >
        Developer Signup
      </Link>
    </div>
  );
}
