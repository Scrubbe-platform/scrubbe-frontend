"use client";

import Link from "next/link";
import {
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import useAuthStore from "@/lib/stores/auth.store";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Loader2, Mail, ChevronDown, Shield, Lock } from "lucide-react";
import { AxiosError } from "axios";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaGitlab } from "react-icons/fa";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth.schema";
import { getCookie } from "cookies-next";
import { COOKIE_KEYS } from "@/lib/constant";
import { endpoint } from "@/lib/api/endpoint";
import { apiClient } from "@/lib/api/client";
import { motion, AnimatePresence } from "framer-motion";

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
  if (type === "github")
    return <FaGithub size={20} className="text-black" />;
  if (type === "gitlab")
    return <FaGitlab size={20} className="text-[#FC6D26]" />;
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

function MsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="1" width="8" height="8" fill="#F25022" />
      <rect x="11" y="1" width="8" height="8" fill="#7FBA00" />
      <rect x="1" y="11" width="8" height="8" fill="#00A4EF" />
      <rect x="11" y="11" width="8" height="8" fill="#FFB900" />
    </svg>
  );
}

function OktaIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle
        cx="10"
        cy="10"
        r="8.5"
        stroke="#1d1d1b"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="10" cy="10" r="3.5" fill="#1d1d1b" />
      <circle cx="10" cy="2" r="1.5" fill="#1d1d1b" />
      <circle cx="10" cy="18" r="1.5" fill="#1d1d1b" />
      <circle cx="2" cy="10" r="1.5" fill="#1d1d1b" />
      <circle cx="18" cy="10" r="1.5" fill="#1d1d1b" />
    </svg>
  );
}

function OneLoginIcon() {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        background: "#f3f4f6",
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 6,
        fontWeight: 900,
        color: "#374151",
        lineHeight: 1.1,
        textAlign: "center",
      }}
    >
      one
      <br />
      login
    </div>
  );
}

function EnterpriseSsoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect
        x="2"
        y="7"
        width="16"
        height="11"
        rx="2"
        stroke="#16a34a"
        strokeWidth="1.4"
        fill="none"
      />
      <path
        d="M6 7V5a4 4 0 018 0v2"
        stroke="#16a34a"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="10" cy="13" r="2" fill="#16a34a" />
    </svg>
  );
}

function BitbucketIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="4" fill="#2684FF" />
      <path d="M3 4l2 12 5-6 5 6 2-12z" fill="white" opacity="0.9" />
    </svg>
  );
}

// ─── Shared row ───────────────────────────────────────────────────

function ProviderRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors group border-b border-gray-100 last:border-0 bg-transparent cursor-pointer"
    >
      <div className="w-8 h-8 rounded-lg border border-gray-100 bg-white flex items-center justify-center shrink-0 shadow-sm">
        {icon}
      </div>
      <span className="flex-1 text-[14px] font-medium text-black group-hover:text-black">
        {label}
      </span>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className="text-gray-300 group-hover:text-gray-500 transition-colors"
      >
        <path
          d="M5 3l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

// ─── Provider group card ─────────────────────────────────────────

function ProviderGroup({
  title,
  badge,
  badgeColor,
  subtitle,
  children,
}: {
  title: string;
  badge: string;
  badgeColor: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-4 py-3.5 bg-white">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[15px] font-black text-black">{title}</span>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: badgeColor === "green" ? "#f0fdf4" : "#eff6ff",
              color: badgeColor === "green" ? "#16a34a" : "#2563eb",
            }}
          >
            {badge}
          </span>
        </div>
        <p className="text-[12.5px] text-gray-400">{subtitle}</p>
      </div>
      <div className="border-t border-gray-100">{children}</div>
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────

function Divider({ label, icon }: { label?: string; icon?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-200" />
      {label ? (
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">
          {label}
        </span>
      ) : (
        <>{icon}</>
      )}
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────

export default function SignInForm() {
  const { login, oauthLogin, requestMagicLink, consumeMagicLink } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = searchParams.get("to");
  const errorCode = searchParams.get("error");
  const magicToken = searchParams.get("magic");
  const inviteEmail = searchParams.get("email");
  const callbackUrl = searchParams.get("callbackUrl") || undefined;
  const isAuthRef = useRef(false);
  const shownErrorRef = useRef<string | null>(null);

  // Step 1 = email entry, Step 2 = password entry (after SSO discovery finds no enforced SSO)
  const [step, setStep] = useState<"email" | "password">("email");
  const [ssoResult, setSsoResult] = useState<SsoDiscoveryResult | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDiscoveryLoading, setIsDiscoveryLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [altExpanded, setAltExpanded] = useState(false);

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
  const emailValue = watch("email");

 const redirectAfterLogin = useCallback(
  (accountType?: string | null, purpose?: string | null) => {
    if (IS_STANDALONE) {
      if (path === "payment")    { window.location.replace("/pricing");   return; }
      if (path === "community")  { window.location.replace("/community"); return; }
      return;
    }

    if (path === "ezra") { window.location.replace("/ezra/dashboard"); return; }

    if (accountType === "BUSINESS") {
      if (purpose === "IMS") {
        const token        = getCookie(COOKIE_KEYS.TOKEN);
        const refreshToken = getCookie(COOKIE_KEYS.REFRESH_TOKEN);
        const url          = process.env.NEXT_PUBLIC_INCIDENT_URL ?? "https://incidents.scrubbe.com";
        const redirectUrl  = new URL("/incident/tickets", url);
        if (typeof token === "string"        && token.length > 0)        redirectUrl.searchParams.set("token", token);
        if (typeof refreshToken === "string" && refreshToken.length > 0) redirectUrl.searchParams.set("refreshToken", refreshToken);
        window.location.replace(redirectUrl.toString());
        return;
      }
      console.log("Redirecting business user to:", callbackUrl || "/incident");
      window.location.replace(callbackUrl || "/incident");
      return;
    }

    if (accountType === "DEVELOPER") {
      window.location.replace("/developer/dashboard");
      return;
    }

    window.location.replace(callbackUrl || "/incident");
  },
  [callbackUrl, path]
);

  // Step 1: discover SSO for this email domain
  const handleContinue = async () => {
    const email = emailValue.trim();
    if (!email) { toast.error("Please enter your email first"); return; }
    try {
      setIsDiscoveryLoading(true);
      const res = await apiClient.get(endpoint.auth.sso_discover, { params: { email } });
      const result: SsoDiscoveryResult = res.data?.data ?? res.data ?? {};
      setSsoResult(result);

      if (result.enforced) {
        // SSO is enforced — redirect to the identity provider
        if (result.loginUrl) {
          window.location.href = result.loginUrl;
          return;
        }
        if (result.providerSlug && ["google", "github", "gitlab", "microsoft-entra-id"].includes(result.providerSlug)) {
          void signIn(result.providerSlug as "google" | "github" | "gitlab" | "microsoft-entra-id", {
            callbackUrl: `/auth/signin${path ? `?to=${encodeURIComponent(path)}` : ""}`,
          });
          return;
        }
      }
      // No enforced SSO — show password field
      setStep("password");
    } catch {
      // SSO discovery failed — fall through to password login
      setSsoResult(null);
      setStep("password");
    } finally {
      setIsDiscoveryLoading(false);
    }
  };

  // Step 2: sign in with email + password
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailValue.trim();
    if (!password.trim()) { toast.error("Please enter your password"); return; }
    try {
      setIsLoginLoading(true);
      const user = await login(email, password);
      toast.success("Signed in successfully", { id: "login-success" });
      redirectAfterLogin(user?.accountType, (user as any)?.purpose ?? null);
    } catch (err) {
      toast.error(
        err instanceof AxiosError
          ? err.response?.data?.message ?? "Invalid email or password"
          : "Sign in failed"
      );
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Magic link request
  const handleMagicLink = async () => {
    const email = emailValue.trim();
    if (!email) { toast.error("Please enter your email first"); return; }
    try {
      setIsMagicLinkLoading(true);
      await requestMagicLink(email, path);
      setMagicLinkSent(true);
      toast.success("Magic link sent — check your inbox");
    } catch (err) {
      toast.error(
        err instanceof AxiosError
          ? err.response?.data?.message ?? "Failed to send magic link"
          : "Failed to send magic link"
      );
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  const handleProviderSignIn = useCallback(
    (provider: "google" | "github" | "gitlab" | "microsoft-entra-id") =>
      signIn(provider, {
        callbackUrl: `/auth/signin${path ? `?to=${encodeURIComponent(path)}` : ""}`,
      }),
    [path]
  );

  const handleComingSoon = (name: string) => {
    toast.info(name + " sign-in coming soon", { description: "This provider will be available shortly." });
  };

  const onSubmitOAuth = useCallback(async () => {
    try {
      if (!session.data) return;
      const d = await oauthLogin(
        session.data.user.email ?? "",
        session.data.user.id ?? "",
        session.data.user.oAuthProvider ?? ""
      );
      toast.success("Successfully signed in!", { duration: 10000, id: "redirect" });
      await signOut({ redirect: false });
      redirectAfterLogin(d?.accountType, (d as any)?.purpose ?? null);
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 404) {
        const p = new URLSearchParams();
        if (session.data?.user.email) p.set("email", session.data.user.email);
        if (path) p.set("to", path);
        router.push("/auth/business-signup?" + p.toString());
        return;
      }
      toast.error("Login failed");
    }
  }, [oauthLogin, path, redirectAfterLogin, router, session.data]);

  useEffect(() => {
    if (session.status === "authenticated" && session.data?.user && !isAuthRef.current && !magicToken) {
      isAuthRef.current = true;
      void onSubmitOAuth();
    }
  }, [magicToken, onSubmitOAuth, session.data?.user, session.status]);

  useEffect(() => {
    if (inviteEmail) setValue("email", inviteEmail);
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
        toast.success("Successfully signed in!", { duration: 10000, id: "magic-link-redirect" });
        redirectAfterLogin(d?.accountType, (d as any)?.purpose ?? null);
      } catch {
        if (!mounted) return;
        toast.error("Magic link failed");
        router.replace("/auth/signin" + (path ? "?to=" + path : ""));
      } finally {
        if (mounted) setIsMagicLinkLoading(false);
      }
    };
    void run();
    return () => { mounted = false; };
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

        {/* Help */}
        <div className="text-right mb-6 text-sm text-gray-500">
          Need help?{" "}
          <Link href="/contact-us" className="text-emerald-600 font-semibold hover:underline">
            contact support
          </Link>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-black text-black tracking-tight mb-1">Welcome to Scrubbe</h1>
          <p className="text-sm text-gray-400 mb-5">Secure access for engineering workspace</p>
          <p className="text-[17px] font-bold text-black">Sign in to your workspace</p>
          <p className="text-sm text-gray-400 mt-1">
            {step === "email" ? "Enter your email to continue" : "Enter your password to sign in"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* ── STEP 1: EMAIL ───────────────────────────────────────────── */}
          {step === "email" && (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSubmit(handleContinue)} className="space-y-3 mb-2">
                <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-3.5 py-3.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all bg-white">
                  <Mail size={15} className="text-gray-400 shrink-0" />
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="email"
                        autoFocus
                        className="flex-1 bg-transparent outline-none text-sm text-black placeholder-gray-400"
                        placeholder="name@company.com"
                      />
                    )}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                <button
                  type="submit"
                  disabled={!isValid || isDiscoveryLoading}
                  className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                  style={{ background: "linear-gradient(90deg,#1a2a1a 0%,#14532d 55%,#22c55e 100%)" }}
                >
                  {isDiscoveryLoading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Continue"}
                </button>
              </form>

              <Divider label="OR" />

              {/* Collapsible alternative sign-in */}
              <button
                type="button"
                onClick={() => setAltExpanded((v) => !v)}
                className="w-full flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl text-left hover:bg-gray-50 transition-colors bg-white cursor-pointer mb-4"
              >
                <Shield size={17} className="text-gray-500 shrink-0" />
                <span className="flex-1 text-[14px] font-medium text-black">Sign in via different way</span>
                <motion.div animate={{ rotate: altExpanded ? 180 : 0 }} transition={{ duration: 0.22 }}>
                  <ChevronDown size={16} className="text-gray-400" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {altExpanded && (
                  <motion.div
                    key="alt"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="space-y-4 pb-2">
                      <ProviderGroup title="Enterprise SSO" badge="For organizations" badgeColor="green" subtitle="Use your organization's identity provider">
                        <ProviderRow icon={<FcGoogle size={20} />} label="Google Workspace" onClick={() => void handleProviderSignIn("google")} />
                        <ProviderRow icon={<MsIcon />} label="Microsoft / Entra ID" onClick={() => void handleProviderSignIn("microsoft-entra-id")} />
                        <ProviderRow icon={<OktaIcon />} label="Okta" onClick={() => handleComingSoon("Okta")} />
                        <ProviderRow icon={<OneLoginIcon />} label="Onelogin" onClick={() => handleComingSoon("OneLogin")} />
                        <ProviderRow icon={<EnterpriseSsoIcon />} label="Enterprise SSO (OIDC/SAML)" onClick={() => handleComingSoon("Enterprise SSO (OIDC/SAML)")} />
                      </ProviderGroup>
                      <ProviderGroup title="Engineering sign-in" badge="For developers" badgeColor="blue" subtitle="Use your developer account">
                        <ProviderRow icon={<FaGithub size={20} className="text-black" />} label="Github" onClick={() => void handleProviderSignIn("github")} />
                        <ProviderRow icon={<FaGitlab size={20} className="text-orange-500" />} label="Gitlab" onClick={() => void handleProviderSignIn("gitlab")} />
                        <ProviderRow icon={<BitbucketIcon />} label="Bitbucket" onClick={() => handleComingSoon("Bitbucket")} />
                      </ProviderGroup>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── STEP 2: PASSWORD ─────────────────────────────────────────── */}
          {step === "password" && (
            <motion.div
              key="password-step"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {/* SSO suggestion banner (if SSO available but not enforced) */}
              {ssoResult?.available && !ssoResult.enforced && ssoResult.providerSlug && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <p className="text-xs text-emerald-700 font-medium">
                    Your org uses {ssoResult.provider ?? "SSO"} — sign in faster with it
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (ssoResult.loginUrl) { window.location.href = ssoResult.loginUrl!; return; }
                      if (ssoResult.providerSlug && ["google","github","gitlab","microsoft-entra-id"].includes(ssoResult.providerSlug)) {
                        void handleProviderSignIn(ssoResult.providerSlug as "google" | "github" | "gitlab" | "microsoft-entra-id");
                      }
                    }}
                    className="text-xs font-bold text-emerald-600 hover:underline whitespace-nowrap ml-3"
                  >
                    Use SSO
                  </button>
                </div>
              )}

              {/* Email display (read-only) */}
              <div className="flex items-center gap-2.5 border border-gray-100 rounded-xl px-3.5 py-3 mb-3 bg-gray-50">
                <Mail size={14} className="text-gray-400 shrink-0" />
                <span className="flex-1 text-sm text-black truncate">{emailValue}</span>
                <button
                  type="button"
                  onClick={() => { setStep("email"); setPassword(""); setSsoResult(null); setMagicLinkSent(false); }}
                  className="text-xs text-emerald-600 font-semibold hover:underline shrink-0"
                >
                  Change
                </button>
              </div>

              {magicLinkSent ? (
                <div className="text-center py-6 space-y-2">
                  <p className="text-emerald-600 font-bold text-base">Magic link sent!</p>
                  <p className="text-sm text-gray-500">Check your inbox at <strong>{emailValue}</strong> and click the link to sign in.</p>
                  <button type="button" onClick={() => setMagicLinkSent(false)} className="text-xs text-gray-400 hover:underline mt-2">
                    Try password instead
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-3">
                  {/* Password field */}
                  <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-3.5 py-3.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all bg-white">
                    <Lock size={14} className="text-gray-400 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm text-black placeholder-gray-400"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-gray-400 hover:text-gray-600 text-xs shrink-0"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <Link href="/auth/forgot-password" className="text-xs text-emerald-600 font-semibold hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={!password.trim() || isLoginLoading}
                    className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                    style={{ background: "linear-gradient(90deg,#1a2a1a 0%,#14532d 55%,#22c55e 100%)" }}
                  >
                    {isLoginLoading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Sign In"}
                  </button>

                  <Divider label="OR" />

                  <button
                    type="button"
                    onClick={handleMagicLink}
                    disabled={isMagicLinkLoading}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-black border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isMagicLinkLoading
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Mail size={14} className="text-gray-500" />}
                    Send me a magic link instead
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom */}
        <div className="text-center mt-6">
          <Divider icon={<Lock size={16} className="text-gray-300 w-10" />} />
          <p className="text-sm text-gray-400 mb-3">Don&apos;t have access yet?</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/contact-admin" className="text-sm font-semibold text-emerald-600 hover:underline">
              Contact your administrator
            </Link>
            <div className="w-px h-4 bg-gray-200" />
            <Link href="/auth/business-signup" className="text-sm font-semibold text-emerald-600 hover:underline">
              Create a workspace
            </Link>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
