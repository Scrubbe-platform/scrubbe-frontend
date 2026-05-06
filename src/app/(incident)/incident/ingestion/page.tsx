"use client";

import React, { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const PROVIDER_LABELS: Record<string, string> = {
  slack: "Slack",
  github: "GitHub",
  gitlab: "GitLab",
  bitbucket: "Bitbucket",
  googlemeet: "Google Meet",
};

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#08132F]">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-4 border-[#00CAD8] border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-white text-lg font-medium">Completing integration…</p>
      <p className="text-[#64748B] text-sm">You will be redirected automatically.</p>
    </div>
  </div>
);

const OAuthCallbackInner = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const connected = Array.from(searchParams.entries()).find(
      ([, value]) => value === "connected"
    );

    if (connected) {
      const [provider] = connected;
      const label = PROVIDER_LABELS[provider] ?? provider;
      toast.success(`${label} connected successfully!`);
    }

    const timer = setTimeout(() => {
      router.replace("/incident");
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  return <Spinner />;
};

const OAuthCallbackPage = () => (
  <Suspense fallback={<Spinner />}>
    <OAuthCallbackInner />
  </Suspense>
);

export default OAuthCallbackPage;
