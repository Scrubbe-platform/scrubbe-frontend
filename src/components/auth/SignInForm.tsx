"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import useAuthStore from "@/lib/stores/auth.store";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Loader2, Mail, ChevronRight, ArrowLeft } from "lucide-react";
import { AxiosError } from "axios";
import { getEmailDomain } from "@/lib/utils";
import { FaBuilding } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaGitlab } from "react-icons/fa";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth.schema";
import { getCookie } from "cookies-next";
import { COOKIE_KEYS } from "@/lib/constant";
import { endpoint } from "@/lib/api/endpoint";
import { apiClient } from "@/lib/api/client";
import { SsoProviderModal, SsoSlug } from "./SSOProvideModal";

const IS_STANDALONE = process.env.NEXT_PUBLIC_IS_STANDALONE === "true";

type SsoDiscoveryResult = {
  available?: boolean;
  enforced?: boolean;
  provider?: string | null;
  providerSlug?:
    | "google"
    | "github"
    | "gitlab"
    | "microsoft-entra-id"
    | "okta"
    | "onelogin"
    | null;
  domain?: string | null;
  ssoDomain?: string | null;
  businessId?: string | null;
  businessName?: string | null;
  loginUrl?: string | null;
};

// ── Provider configs ──────────────────────────────────────────────

const SSO_PROVIDERS = [
  {
    slug: "google",
    label: "Continue with Google",
    sub: "Google Workspace - OAuth 2.0",
    icon: "google",
  },
  {
    slug: "github",
    label: "Continue with GitHub",
    sub: "GitHub org sign-in",
    icon: "github",
  },
  {
    slug: "gitlab",
    label: "Continue with GitLab",
    sub: "GitLab cloud or self-managed",
    icon: "gitlab",
  },
  {
    slug: "microsoft-entra-id",
    label: "Continue with Microsoft",
    sub: "Microsoft 365 - Personal account",
    icon: "microsoft",
  },
  {
    slug: "okta",
    label: "Continue with Okta",
    sub: "Okta workforce identity",
    icon: "okta",
  },
  {
    slug: "onelogin",
    label: "Continue with OneLogin",
    sub: "OneLogin workforce identity",
    icon: "onelogin",
  },
] as const;

function ProviderIcon({ type }: { type: string }) {
  if (type === "google") return <FcGoogle size={22} />;
  if (type === "github") return <FaGithub size={20} className="text-gray-900" />;
  if (type === "gitlab") return <FaGitlab size={20} className="text-[#FC6D26]" />;
  if (type === "microsoft")
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="1" y="1" width="9" height="9" fill="#F25022" />
        <rect x="12" y="1" width="9" height="9" fill="#7FBA00" />
        <rect x="1" y="12" width="9" height="9" fill="#00A4EF" />
        <rect x="12" y="12" width="9" height="9" fill="#FFB900" />
      </svg>
    );
  if (type === "okta")
    return (
      <span className="text-[8px] font-black uppercase tracking-[0.18em] text-[#111827]">
        OKTA
      </span>
    );
  if (type === "onelogin")
    return (
      <span className="text-[8px] font-black uppercase tracking-[0.16em] text-[#0F172A]">
        1LOGIN
      </span>
    );
  return null;
}

function ProviderRow({
  icon,
  label,
  sub,
  onClick,
  disabled,
  highlighted,
}: {
  icon: string;
  label: string;
  sub: string;
  onClick: () => void;
  disabled?: boolean;
  highlighted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 border rounded-xl text-left transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        borderColor: highlighted ? "#22c55e" : "#e5e7eb",
        background: highlighted ? "#f0fdf4" : "#fff",
      }}
    >
      <div className="w-9 h-9 rounded-lg border border-gray-100 bg-white flex items-center justify-center shrink-0 shadow-sm">
        <ProviderIcon type={icon} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 leading-snug">{label}</p>
        <p className="text-[11.5px] text-gray-400 mt-0.5">{sub}</p>
      </div>
      <ChevronRight
        size={15}
        className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0"
      />
    </button>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

export default function SignInForm() {
  const { oauthLogin, requestMagicLink, consumeMagicLink } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = searchParams.get("to");
  const errorCode = searchParams.get("error");
  const magicToken = searchParams.get("magic");
  const inviteEmail = searchParams.get("email");
  const isAuthRef = useRef(false);
  const shownErrorRef = useRef<string | null>(null);
  const [steps, setSteps] = useState<"email" | "authenticate">("email");
  const [ssoDiscovery, setSsoDiscovery] = useState<SsoDiscoveryResult | null>(
    null
  );
  const [ssoModal, setSsoModal] = useState<SsoSlug | null>(null);

  const [isDiscoveryLoading, setIsDiscoveryLoading] = useState(false);
  const [isSsoLoading, setIsSsoLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const {
    control,
    setValue,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    defaultValues: { email: "" },
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });
  const session = useSession();

  const redirectAfterLogin = useCallback(
    (accountType?: string | null, purpose?: string | null) => {
      if (IS_STANDALONE) {
        if (path === "payment") {
          router.replace("/pricing");
          return;
        }
        if (path === "community") {
          router.replace("/community");
          return;
        }
        return;
      }
      if (path === "ezra") {
        router.push("/ezra/dashboard");
        return;
      }
      if (accountType === "BUSINESS") {
        if (purpose === "IMS") {
          const token = getCookie(COOKIE_KEYS.TOKEN);
          const refreshToken = getCookie(COOKIE_KEYS.REFRESH_TOKEN);
          const url =
            process.env.NEXT_PUBLIC_INCIDENT_URL ??
            "https://incidents.scrubbe.com";
          const redirectUrl = new URL("/incident/tickets", url);
          if (typeof token === "string" && token.length > 0) {
            redirectUrl.searchParams.set("token", token);
          }
          if (typeof refreshToken === "string" && refreshToken.length > 0) {
            redirectUrl.searchParams.set("refreshToken", refreshToken);
          }
          window.location.href = redirectUrl.toString();
          return;
        }
        router.push("/incident");
        return;
      }
      if (accountType === "DEVELOPER") {
        router.push("/developer/dashboard");
        return;
      }
      router.push("/incident");
    },
    [path, router]
  );

  const handleContinue = async () => {
    const email = watch("email").trim();
    if (!email) {
      toast.error("Please enter your work email first");
      return;
    }
    try {
      setIsDiscoveryLoading(true);
      const res = await apiClient.get(endpoint.auth.sso_discover, {
        params: { email },
      });
      setSsoDiscovery(res.data?.data ?? res.data ?? null);
    } catch {
      setSsoDiscovery(null);
    } finally {
      setIsDiscoveryLoading(false);
      setSteps("authenticate");
    }
  };

  const handleContinueWithSso = async ({
    email,
    tenant,
  }: {
    email?: string;
    tenant?: string;
  }) => {
    try {
      setIsSsoLoading(true);
      const res = await apiClient.get(endpoint.auth.sso_login, {
        params: {
          ...(email ? { email } : {}),
          ...(tenant ? { tenant } : {}),
          ...(path ? { to: path } : {}),
          dryrun: 1,
        },
      });
      const url = (res.data?.data ?? res.data)?.redirectUrl as string;
      if (!url) throw new Error();
      window.location.href = url;
    } catch {
      toast.error("SSO login failed");
    } finally {
      setIsSsoLoading(false);
    }
  };

  const handleRequestMagicLink = async () => {
    try {
      setIsMagicLinkLoading(true);
      await requestMagicLink(watch("email").trim(), path);
      toast.success("Check your inbox", {
        description: "If your account exists, we sent a magic sign-in link.",
      });
    } catch {
      toast.error("Unable to send magic link");
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  const workspaceProviderSlug = ssoDiscovery?.providerSlug ?? null;
  const enforceWorkspaceSso = Boolean(ssoDiscovery?.enforced);
  const ssoBridgeUnavailable = Boolean(
    ssoDiscovery?.available && !ssoDiscovery?.providerSlug
  );
  const lockProviderButtons = Boolean(
    enforceWorkspaceSso && workspaceProviderSlug
  );
  const disableProviderButtons = Boolean(
    enforceWorkspaceSso && ssoBridgeUnavailable
  );
  const startDirect = useCallback(
    (p: string) =>
      signIn(p, {
        callbackUrl: `/auth/signin${
          path ? `?to=${encodeURIComponent(path)}` : ""
        }`,
      }),
    [path]
  );

  const handleProviderSelection = async (provider: string) => {
    if (disableProviderButtons) {
      toast.error("Workspace SSO not available");
      return;
    }
    if (workspaceProviderSlug && provider === workspaceProviderSlug) {
      await handleContinueWithSso({ email: watch("email").trim() });
      return;
    }
    if (lockProviderButtons && provider !== workspaceProviderSlug) {
      toast.info("Use your workspace provider");
      return;
    }
    await startDirect(provider);
  };

  const onSubmitOAuth = useCallback(async () => {
    try {
      if (!session.data) return;
      const d = await oauthLogin(
        session.data.user.email ?? "",
        session.data.user.id ?? "",
        session.data.user.oAuthProvider ?? ""
      );
      toast.success("Successfully signed in!", {
        duration: 10000,
        id: "redirect",
      });
      await signOut({ redirect: false });
      redirectAfterLogin(d?.accountType, d?.purpose ?? null);
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 404) {
        const p = new URLSearchParams();
        if (session.data?.user.email) p.set("email", session.data.user.email);
        if (path) p.set("to", path);
        router.push(`/auth/business-signup?${p.toString()}`);
        return;
      }
      toast.error("Login failed");
    }
  }, [oauthLogin, path, redirectAfterLogin, router, session.data]);

  useEffect(() => {
    if (
      session.status === "authenticated" &&
      session.data?.user &&
      !isAuthRef.current &&
      !magicToken
    ) {
      isAuthRef.current = true;
      void onSubmitOAuth();
    }
  }, [magicToken, onSubmitOAuth, session.data?.user, session.status]);

  useEffect(() => {
    if (inviteEmail) {
      setValue("email", inviteEmail);
      setSsoDiscovery(null);
    }
  }, [inviteEmail, setValue]);

  useEffect(() => {
    if (!errorCode || shownErrorRef.current === errorCode) return;
    shownErrorRef.current = errorCode;
    toast.error("SSO sign-in failed");
  }, [errorCode]);

  useEffect(() => {
    if (!magicToken || isAuthRef.current) return;
    let mounted = true;
    const run = async () => {
      try {
        setIsMagicLinkLoading(true);
        isAuthRef.current = true;
        const d = await consumeMagicLink(magicToken);
        if (!mounted) return;
        await signOut({ redirect: false });
        toast.success("Successfully signed in!", {
          duration: 10000,
          id: "magic-link-redirect",
        });
        redirectAfterLogin(d?.accountType, d?.purpose ?? null);
      } catch {
        if (!mounted) return;
        toast.error("Magic link failed");
        router.replace(`/auth/signin${path ? `?to=${path}` : ""}`);
      } finally {
        if (mounted) setIsMagicLinkLoading(false);
      }
    };
    void run();
    return () => {
      mounted = false;
    };
  }, [consumeMagicLink, magicToken, path, redirectAfterLogin, router]);

  const isSpinning = session.status === "loading" || isMagicLinkLoading;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full relative">
        {isSpinning && (
          <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center rounded-2xl">
            <Loader2 className="animate-spin text-emerald-500" size={28} />
          </div>
        )}

        <div className="text-right mb-6 text-sm text-gray-500">
          Need help?{" "}
          <Link
            href="/support"
            className="text-emerald-600 font-semibold hover:underline"
          >
            contact support
          </Link>
        </div>

        <div className="text-center mb-7">
          <h1 className="text-[28px] font-black text-gray-900 tracking-tight mb-1">
            Welcome to Scrubbe
          </h1>
          <p className="text-sm text-gray-500">
            Sign in to your workspace to continue
          </p>
        </div>

        {steps === "email" && (
          <>
            <Divider label="Single Sign-On" />
            <div className="space-y-2.5">
              {SSO_PROVIDERS.map((p) => (
                <ProviderRow
                  key={p.slug}
                  icon={p.icon}
                  label={p.label}
                  sub={p.sub}
                  onClick={() => setSsoModal(p.slug)}
                  disabled={isSsoLoading}
                />
              ))}
            </div>
            <Divider label="Or with work email" />
            <form onSubmit={handleSubmit(handleContinue)}>
              <label className="text-sm font-semibold text-gray-900 block mb-2">
                Continue with work email
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2.5 border border-gray-200 rounded-xl px-3.5 py-3 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all bg-white">
                  <Mail size={15} className="text-gray-400 shrink-0" />
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="email"
                        className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                        placeholder="name@company.com"
                      />
                    )}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!isValid || isDiscoveryLoading}
                  className="shrink-0 px-5 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                  style={{
                    background:
                      "linear-gradient(90deg,#1a2a1a 0%,#14532d 55%,#22c55e 100%)",
                    minWidth: 100,
                  }}
                >
                  {isDiscoveryLoading ? (
                    <Loader2 size={15} className="animate-spin mx-auto" />
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1.5">
                  {errors.email.message}
                </p>
              )}
            </form>
            <p className="text-center text-sm text-gray-600 mt-6">
              {"Don't have access? "}
              <Link
                href="/support"
                className="text-emerald-600 font-semibold hover:underline"
              >
                Contact your administrator
              </Link>
            </p>
          </>
        )}

        {steps === "authenticate" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <button
                type="button"
                onClick={() => {
                  setSsoDiscovery(null);
                  setSteps("email");
                }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors bg-transparent border-none cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-full text-xs text-gray-600 bg-gray-50">
                  <FaBuilding size={11} className="text-gray-400" />
                  {getEmailDomain(watch("email")).domain}
                </span>
                <span className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-full text-xs text-gray-600 bg-gray-50">
                  <MdOutlineEmail size={12} className="text-gray-400" />
                  {watch("email")}
                </span>
              </div>
            </div>
            {ssoDiscovery?.available && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
                <p className="font-semibold text-emerald-800">
                  {ssoDiscovery.businessName ?? ssoDiscovery.ssoDomain}{" "}
                  {enforceWorkspaceSso ? "requires" : "supports"} workspace SSO.
                </p>
              </div>
            )}
            <Divider label="Single Sign-On" />
            <div className="space-y-2.5">
              {SSO_PROVIDERS.map((p) => {
                const matched = p.slug === workspaceProviderSlug;
                const locked = lockProviderButtons && !matched;
                return (
                  <ProviderRow
                    key={p.slug}
                    icon={p.icon}
                    label={
                      matched && ssoDiscovery?.available
                        ? `${p.label} (Workspace SSO)`
                        : p.label
                    }
                    sub={p.sub}
                    onClick={() => void handleProviderSelection(p.slug)}
                    disabled={isSsoLoading || locked || disableProviderButtons}
                    highlighted={matched && Boolean(ssoDiscovery?.available)}
                  />
                );
              })}
            </div>
            <Divider label="Or" />
            <button
              type="button"
              onClick={handleRequestMagicLink}
              disabled={isMagicLinkLoading || enforceWorkspaceSso}
              className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white"
            >
              <Mail size={15} /> Email me a magic link
            </button>
            <p className="text-center text-sm text-gray-600 mt-5">
              {"Don't have access? "}
              <Link
                href="/support"
                className="text-emerald-600 font-semibold hover:underline"
              >
                Contact your administrator
              </Link>
            </p>
          </>
        )}
      </div>

      <SsoProviderModal
        providerSlug={ssoModal}
        onClose={() => setSsoModal(null)}
        onContinue={(workspace) => {
          setSsoModal(null);
          void handleContinueWithSso({ tenant: workspace });
        }}
      />
    </Suspense>
  );
}
