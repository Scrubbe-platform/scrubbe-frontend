// context/RedirectContext.tsx
"use client";
import useIdle from "@/hooks/useIdle";
import useLogout from "@/hooks/useLogout";
import { COOKIE_KEYS } from "@/lib/constant";
import useAuthStore from "@/lib/stores/auth.store";
import { getCookie, deleteCookie } from "cookies-next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

export const RedirectProviderIMS = ({ children }: { children: ReactNode }) => {
  const { handleLogout } = useLogout();
  const { refreshAccessToken } = useAuthStore();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.toString();
  const callbackUrl = query ? `${pathname}?${query}` : pathname;

  const triggerRedirect = async () => {
    // Clear any authentication tokens from storage
    await handleLogout();
    router.replace(
      `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`,
    );
  };

  // Log out at 15 minutes of inactivity
  useIdle(900000, triggerRedirect, refreshAccessToken);

  return <>{children}</>;
};
