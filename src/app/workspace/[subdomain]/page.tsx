"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Info,
  Lock,
  Mail,
  Shield,
  User,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";

// ── Types ─────────────────────────────────────────────────────────
type Workspace = {
  businessId: string;
  businessName: string;
  subdomain: string | null;
  workspaceUrl: string | null;
  logoUrl: string | null;
  isSetupComplete: boolean;
};

type AccessStatus = "INVITED_EXISTING_USER" | "INVITED_NEW_USER" | "NOT_INVITED";
type AccessResponse = Workspace & { status: AccessStatus; email: string };

type Step = "email" | "login" | "signup" | "sent";

// ── Schemas ───────────────────────────────────────────────────────
const emailSchema = z.object({
  email: z.string().email("Please enter a valid work email"),
});
const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});
const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type EmailForm = z.infer<typeof emailSchema>;
type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

// ── Helpers ───────────────────────────────────────────────────────
function unwrap<T>(res: { data?: { data?: T } | T }): T {
  const d = res.data as { data?: T } | T | undefined;
  return (d && typeof d === "object" && "data" in d ? d.data : d) as T;
}

function redirectToApp(tokens: { accessToken: string; refreshToken?: string }) {
  const params = new URLSearchParams({ token: tokens.accessToken });
  if (tokens.refreshToken) params.set("refreshToken", tokens.refreshToken);
  window.location.href = `https://www.scrubbe.com/incident?${params.toString()}`;
}

// ── Sub-components ────────────────────────────────────────────────
const inputCls =
  "w-full flex items-center gap-2.5 border border-gray-200 rounded-xl px-3.5 py-3 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all bg-white";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[14px] font-semibold text-gray-800 mb-2">
      {children}
    </label>
  );
}

function InfoItem({
  icon,
  iconBg,
  title,
  desc,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div>
        <p className="text-[14px] font-bold text-gray-900 mb-0.5">{title}</p>
        <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
function WorkspaceAccessPageInner() {
  const params = useParams<{ subdomain: string }>();
  const searchParams = useSearchParams();
  const subdomain = params.subdomain;

  // URL params from invite redirect (e.g. ?invite=true&email=...&businessId=...)
  const urlEmail = searchParams.get("email") ?? "";
  const urlInvite = searchParams.get("invite") === "true";
  const urlBusinessId = searchParams.get("businessId") ?? "";

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isResolving, setIsResolving] = useState(true);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("email");
  const [activeEmail, setActiveEmail] = useState("");
  const [activeBusinessId, setActiveBusinessId] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: urlEmail },
    mode: "onChange",
  });
  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  // Resolve workspace metadata on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsResolving(true);
        const res = await apiClient.get(
          `/business/workspace/${encodeURIComponent(subdomain)}`
        );
        if (!cancelled) {
          setWorkspace(unwrap<Workspace>(res));
          setResolveError(null);
        }
      } catch {
        if (!cancelled) {
          setResolveError(
            "Workspace not found. Please check the URL or contact your administrator."
          );
        }
      } finally {
        if (!cancelled) setIsResolving(false);
      }
    })();
    return () => { cancelled = true; };
  }, [subdomain]);

  // If landing from invite redirect with ?invite=true&email=..., go straight to signup
  useEffect(() => {
    if (urlInvite && urlEmail && urlBusinessId) {
      setActiveEmail(urlEmail);
      setActiveBusinessId(urlBusinessId);
      setStep("signup");
    }
  }, [urlInvite, urlEmail, urlBusinessId]);

  // ── Login helper (shared) ──────────────────────────────────────
  const doLogin = async (email: string, password: string) => {
    const res = await apiClient.post("/auth/login", { email, password });
    const { tokens } = unwrap<{
      user: unknown;
      tokens: { accessToken: string; refreshToken: string };
    }>(res);
    return tokens;
  };

  // ── Step 1: Email check ────────────────────────────────────────
  const onEmailSubmit = emailForm.handleSubmit(async ({ email }) => {
    setBusy(true);
    try {
      const res = await apiClient.post(
        `/business/workspace/${encodeURIComponent(subdomain)}/access-check`,
        { email }
      );
      const result = unwrap<AccessResponse>(res);
      const resolvedEmail = result.email ?? email;
      setActiveEmail(resolvedEmail);
      setActiveBusinessId(result.businessId ?? "");

      if (result.status === "INVITED_EXISTING_USER") {
        setStep("login");
      } else if (result.status === "INVITED_NEW_USER") {
        setStep("signup");
      } else {
        toast.error(
          "You haven't been invited to this workspace. Please contact your administrator."
        );
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Unable to check workspace access"
      );
    } finally {
      setBusy(false);
    }
  });

  // ── Step 2a: Login existing member ─────────────────────────────
  const onLoginSubmit = loginForm.handleSubmit(async ({ password }) => {
    setBusy(true);
    try {
      const tokens = await doLogin(activeEmail, password);
      toast.success("Welcome back! Redirecting...");
      redirectToApp(tokens);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Incorrect password");
    } finally {
      setBusy(false);
    }
  });

  // ── Step 2b: Signup new invited user ───────────────────────────
  const onSignupSubmit = signupForm.handleSubmit(
    async ({ firstName, lastName, password }) => {
      setBusy(true);
      try {
        await apiClient.post("/business/accept-invite", {
          firstName,
          lastName,
          email: activeEmail,
          password,
          businessId: activeBusinessId,
        });
        const tokens = await doLogin(activeEmail, password);
        toast.success("Welcome to the workspace!");
        redirectToApp(tokens);
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message ?? "Failed to join workspace"
        );
      } finally {
        setBusy(false);
      }
    }
  );

  // ── Render ─────────────────────────────────────────────────────
  const leftPanel = (
    <div className="px-10 py-12 lg:border-r border-gray-100">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-6">
        <Building2 size={14} />
        {workspace?.workspaceUrl ?? `${subdomain}.scrubbe.com`}
      </div>

      <h1
        className="font-black text-gray-900 leading-[1.1] tracking-tight mb-4"
        style={{ fontSize: "clamp(22px, 2.5vw, 32px)" }}
      >
        Access {workspace?.businessName ?? "your organization's"}
        <br />
        Scrubbe workspace
      </h1>

      <p className="text-[14px] text-gray-500 leading-relaxed mb-10 max-w-sm">
        Enter your work email. We will check whether this workspace has invited
        you and guide you to the right next step.
      </p>

      <div className="space-y-6 mb-10">
        <InfoItem
          icon={<Shield size={18} className="text-emerald-600" />}
          iconBg="#f0fdf4"
          title="Invite-gated access"
          desc="Only invited users can enter this workspace."
        />
        <InfoItem
          icon={<Mail size={18} className="text-purple-500" />}
          iconBg="#faf5ff"
          title="Work email required"
          desc="Use the email your administrator invited."
        />
        <InfoItem
          icon={<Clock size={18} className="text-blue-500" />}
          iconBg="#eff6ff"
          title="No invite yet?"
          desc="We will help you contact the workspace administrators."
        />
      </div>

      <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-blue-50 border border-blue-100">
        <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[13px] text-blue-700 leading-relaxed">
          Access is verified server-side — workspace membership cannot be
          spoofed from the browser.
        </p>
      </div>
    </div>
  );

  const rightPanel = () => {
    if (isResolving) {
      return (
        <div className="h-full flex items-center justify-center text-sm text-gray-500">
          Loading workspace...
        </div>
      );
    }

    if (resolveError) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
            <Lock size={28} className="text-red-500" />
          </div>
          <h2 className="text-[20px] font-black text-gray-900 mb-2">
            Workspace unavailable
          </h2>
          <p className="text-[14px] text-gray-500 leading-relaxed max-w-xs">
            {resolveError}
          </p>
        </div>
      );
    }

    if (step === "sent") {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center py-16">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
            <Shield size={28} className="text-emerald-600" />
          </div>
          <h2 className="text-[20px] font-black text-gray-900 mb-2">
            Request sent
          </h2>
          <p className="text-[14px] text-gray-500 leading-relaxed max-w-xs">
            Your administrator has been notified and will respond by email with
            next steps.
          </p>
        </div>
      );
    }

    if (step === "email") {
      return (
        <>
          <h2 className="text-[22px] font-black text-gray-900 mb-1">
            Tell us who you are
          </h2>
          <p className="text-[13.5px] text-gray-500 mb-8">
            We will verify your invitation for{" "}
            {workspace?.businessName ?? subdomain}.
          </p>

          <form onSubmit={onEmailSubmit} className="space-y-5">
            <div>
              <FieldLabel>Work email</FieldLabel>
              <div className={inputCls}>
                <Mail size={15} className="text-gray-400 shrink-0" />
                <input
                  type="email"
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                  placeholder="name@company.com"
                  autoFocus
                  {...emailForm.register("email")}
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className="mt-1.5 text-xs text-red-500">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
              style={{
                background:
                  "linear-gradient(90deg,#1a2a1a 0%,#14532d 55%,#22c55e 100%)",
              }}
            >
              {busy ? "Checking access..." : "Continue to workspace"}
            </button>
          </form>
        </>
      );
    }

    if (step === "login") {
      return (
        <>
          <button
            onClick={() => setStep("email")}
            className="text-xs text-gray-400 hover:text-gray-700 mb-5 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <h2 className="text-[22px] font-black text-gray-900 mb-1">
            Sign in to workspace
          </h2>
          <p className="text-[13.5px] text-gray-500 mb-6">
            Enter your password for{" "}
            <span className="font-semibold text-gray-700">{activeEmail}</span>
          </p>

          <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span className="text-xs text-emerald-700 font-medium">
              You have access to {workspace?.businessName}
            </span>
          </div>

          {/* Email read-only */}
          <div className="mb-5">
            <FieldLabel>Email</FieldLabel>
            <div className={inputCls} style={{ background: "#f9fafb" }}>
              <Mail size={15} className="text-gray-400 shrink-0" />
              <span className="flex-1 text-sm text-gray-500">
                {activeEmail}
              </span>
            </div>
          </div>

          <form onSubmit={onLoginSubmit} className="space-y-4">
            <div>
              <FieldLabel>Password</FieldLabel>
              <div className={inputCls}>
                <Lock size={15} className="text-gray-400 shrink-0" />
                <input
                  type={showPw ? "text" : "password"}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                  placeholder="Your password"
                  autoFocus
                  {...loginForm.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? (
                    <EyeOff size={15} className="text-gray-400" />
                  ) : (
                    <Eye size={15} className="text-gray-400" />
                  )}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="mt-1.5 text-xs text-red-500">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
              style={{
                background:
                  "linear-gradient(90deg,#1a2a1a 0%,#14532d 55%,#22c55e 100%)",
              }}
            >
              {busy ? "Signing in..." : "Sign in to workspace"}
            </button>
          </form>
        </>
      );
    }

    if (step === "signup") {
      return (
        <>
          {!urlInvite && (
            <button
              onClick={() => setStep("email")}
              className="text-xs text-gray-400 hover:text-gray-700 mb-5 flex items-center gap-1 transition-colors"
            >
              ← Back
            </button>
          )}
          <h2 className="text-[22px] font-black text-gray-900 mb-1">
            Join workspace
          </h2>
          <p className="text-[13.5px] text-gray-500 mb-6">
            Create your account to access{" "}
            <span className="font-semibold text-gray-700">
              {workspace?.businessName ?? subdomain}
            </span>
            .
          </p>

          <div className="mb-5 p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-blue-500 shrink-0" />
            <span className="text-xs text-blue-700 font-medium">
              Invitation confirmed for{" "}
              <span className="font-bold">{activeEmail}</span>
            </span>
          </div>

          {/* Email read-only */}
          <div className="mb-5">
            <FieldLabel>Email</FieldLabel>
            <div className={inputCls} style={{ background: "#f9fafb" }}>
              <Mail size={15} className="text-gray-400 shrink-0" />
              <span className="flex-1 text-sm text-gray-500">
                {activeEmail}
              </span>
            </div>
          </div>

          <form onSubmit={onSignupSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>First name</FieldLabel>
                <div className={inputCls}>
                  <User size={15} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                    placeholder="Alex"
                    autoFocus
                    {...signupForm.register("firstName")}
                  />
                </div>
                {signupForm.formState.errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">
                    {signupForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <FieldLabel>Last name</FieldLabel>
                <div className={inputCls}>
                  <User size={15} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                    placeholder="Johnson"
                    {...signupForm.register("lastName")}
                  />
                </div>
                {signupForm.formState.errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">
                    {signupForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <FieldLabel>Create password</FieldLabel>
              <div className={inputCls}>
                <Lock size={15} className="text-gray-400 shrink-0" />
                <input
                  type={showPw ? "text" : "password"}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                  placeholder="Min. 8 characters"
                  {...signupForm.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? (
                    <EyeOff size={15} className="text-gray-400" />
                  ) : (
                    <Eye size={15} className="text-gray-400" />
                  )}
                </button>
              </div>
              {signupForm.formState.errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {signupForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
              style={{
                background:
                  "linear-gradient(90deg,#1a2a1a 0%,#14532d 55%,#22c55e 100%)",
              }}
            >
              {busy ? "Joining workspace..." : "Join workspace"}
            </button>
          </form>
        </>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[1100px] bg-white rounded-3xl shadow-sm overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <div className="relative w-32 h-8 xl:w-40 xl:h-10">
            <Image
              src="/IMS/blacklogo.png"
              alt="Scrubbe Logo"
              fill
              sizes="(max-width: 1280px) 128px, 160px"
              className="object-contain"
            />
          </div>
          <Link
            href="/auth/signin"
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign in
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[620px]">
          {leftPanel}
          <div className="px-10 py-12">{rightPanel()}</div>
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceAccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WorkspaceAccessPageInner />
    </Suspense>
  );
}
