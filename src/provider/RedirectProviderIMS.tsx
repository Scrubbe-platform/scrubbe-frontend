// context/RedirectContext.tsx
"use client";
import useIdle from "@/hooks/useIdle";
import useLogout from "@/hooks/useLogout";
import useAuthStore from "@/lib/stores/auth.store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { ReactNode, useEffect, useRef } from "react";

// Refresh 90 minutes into a 2h JWT — keeps the session alive for active users.
const PROACTIVE_REFRESH_MS = 90 * 60 * 1000;

export const RedirectProviderIMS = ({ children }: { children: ReactNode }) => {
  const { handleLogout } = useLogout();
  const { refreshAccessToken } = useAuthStore();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const refreshRef = useRef(refreshAccessToken);
  useEffect(() => { refreshRef.current = refreshAccessToken; }, [refreshAccessToken]);

  const query = searchParams.toString();
  const callbackUrl = query ? `${pathname}?${query}` : pathname;

  const triggerRedirect = async () => {
    await handleLogout();
    router.replace(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  };

  // Proactively refresh the access token every 90 minutes while the user is active.
  // This keeps the session alive for users who work longer than the JWT lifetime
  // without relying on the 401 → refresh cycle for normal navigation.
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        await refreshRef.current();
      } catch {
        // Silent — the axios interceptor will handle 401s if this fails.
      }
    }, PROACTIVE_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  // Log out after 15 minutes of genuine inactivity (mousemove / click / keydown etc.)
  useIdle(900000, triggerRedirect);

  return <>{children}</>;
};
