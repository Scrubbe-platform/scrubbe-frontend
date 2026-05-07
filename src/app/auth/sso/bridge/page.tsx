"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";

export default function SsoBridgePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    const provider = searchParams.get("provider");
    const to = searchParams.get("to");
    const dryRun = searchParams.get("dryrun") === "1";

    if (!provider) {
      router.replace("/auth/signin?error=sso_provider_missing");
      return;
    }

    const callbackUrl = `/auth/signin${
      to ? `?to=${encodeURIComponent(to)}` : ""
    }${dryRun ? `${to ? "&" : "?"}dryrun=1` : ""}`;

    void signIn(provider, {
      redirectTo: callbackUrl,
    });
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#08132F] flex items-center justify-center px-6">
      <div className="flex items-center gap-3 text-white text-sm">
        <Loader2 className="size-4 animate-spin" />
        <span>Redirecting to your identity provider…</span>
      </div>
    </div>
  );
}
