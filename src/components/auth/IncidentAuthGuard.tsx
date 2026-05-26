"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { COOKIE_KEYS } from "@/lib/constant";

type JwtPayload = {
  exp?: number;
};

const decodeJwtPayload = (token?: string | null): JwtPayload | null => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    return JSON.parse(window.atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
};

const hasUsableToken = () => {
  const token = getCookie(COOKIE_KEYS.TOKEN);
  if (typeof token !== "string" || token.length === 0) return false;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;

  return Date.now() < payload.exp * 1000;
};

export default function IncidentAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (hasUsableToken()) {
      setIsAllowed(true);
      return;
    }

    const query = searchParams.toString();
    const callbackUrl = query ? `${pathname}?${query}` : pathname;
    router.replace(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }, [pathname, router, searchParams]);

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
