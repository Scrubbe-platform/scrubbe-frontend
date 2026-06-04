"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Image from "next/image";
import { apiClient } from "@/lib/api/client";
import {
  ArrowRight, Building2, CheckCircle2, Eye, EyeOff,
  Lock, Mail, Shield, Users, Sparkles, User,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────

type InviteData = {
  email: string; role: string; businessId: string;
  businessName: string; subdomain: string | null; workspaceUrl: string | null;
};
type DecodedInvite = { existingUser: boolean; inviteData: InviteData } & InviteData;

const loginSchema  = z.object({ password: z.string().min(1, "Password is required") });
const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName:  z.string().min(1, "Last name is required"),
  password:  z.string().min(8, "Password must be at least 8 characters"),
});
type LoginForm  = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

function unwrap<T>(res: { data?: { data?: T } | T }): T {
  const d = res.data as { data?: T } | T | undefined;
  return (d && typeof d === "object" && "data" in d ? d.data : d) as T;
}
function redirectToApp(tokens: { accessToken: string; refreshToken?: string }) {
  const params = new URLSearchParams({ token: tokens.accessToken });
  if (tokens.refreshToken) params.set("refreshToken", tokens.refreshToken);
  window.location.href = `https://www.scrubbe.com/incident?${params.toString()}`;
}

// ── Input style ───────────────────────────────────────────────────

const inputCls =
  "w-full flex items-center gap-2.5 border border-gray-200 rounded-xl px-3.5 py-3.5 focus-within:border-gray-400 transition-all bg-white";

// ── Left panel feature items ──────────────────────────────────────

const features = [
  {
    icon: <Shield size={18} className="text-gray-300" />,
    title: "Enterprise ready",
    desc: "Built with security, compliance and governance at the core.",
  },
  {
    icon: <Users size={18} className="text-gray-300" />,
    title: "Collaborate securely",
    desc: "Work with your team using role-based access and audit logs.",
  },
  {
    icon: <Sparkles size={18} className="text-gray-300" />,
    title: "AI that learns",
    desc: "Every incident makes Scrubbe smarter for your organization.",
  },
];

// ── Password rules ────────────────────────────────────────────────

function PasswordRules({ password }: { password: string }) {
  const rules = [
    { label: "8+ characters",      met: password.length >= 8                  },
    { label: "1 uppercase",        met: /[A-Z]/.test(password)                },
    { label: "1 number",           met: /[0-9]/.test(password)                },
    { label: "1 special character",met: /[^A-Za-z0-9]/.test(password)        },
  ];
  return (
    <div className="flex flex-wrap gap-3 mt-2">
      {rules.map(({ label, met }) => (
        <span key={label} className={`flex items-center gap-1 text-[12px] font-medium ${met ? "text-emerald-600" : "text-gray-400"}`}>
          <CheckCircle2 size={13} className={met ? "text-emerald-500" : "text-gray-300"} />
          {label}
        </span>
      ))}
    </div>
  );
}

// ── Inner page ────────────────────────────────────────────────────

function InvitePageInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [phase, setPhase]     = useState<"loading" | "error" | "login" | "signup" | "done">("loading");
  const [invite, setInvite]   = useState<DecodedInvite | null>(null);
  const [showPw, setShowPw]   = useState(false);
  const [busy, setBusy]       = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loginForm  = useForm<LoginForm>({ resolver: zodResolver(loginSchema)  });
  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });
  const watchedPassword = signupForm.watch("password", "");

  useEffect(() => {
    if (!token) { setErrorMsg("No invite token found in the link."); setPhase("error"); return; }
    (async () => {
      try {
        const res  = await apiClient.post("/business/decode-invite", { token });
        const data = unwrap<DecodedInvite>(res);
        setInvite(data);
        setPhase(data.existingUser ? "login" : "signup");
      } catch (err: any) {
        setErrorMsg(err?.response?.data?.message ?? "This invite link is invalid or has expired.");
        setPhase("error");
      }
    })();
  }, [token]);

  const doLogin = async (email: string, password: string) => {
    const res = await apiClient.post("/auth/login", { email, password });
    const { tokens } = unwrap<{ user: unknown; tokens: { accessToken: string; refreshToken: string } }>(res);
    return tokens;
  };

  const handleLogin = loginForm.handleSubmit(async ({ password }) => {
    setBusy(true);
    try {
      const tokens = await doLogin(invite!.email, password);
      setPhase("done");
      toast.success("Welcome back! Redirecting...");
      redirectToApp(tokens);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Incorrect password");
    } finally { setBusy(false); }
  });

  const handleSignup = signupForm.handleSubmit(async ({ firstName, lastName, password }) => {
    setBusy(true);
    try {
      await apiClient.post("/business/accept-invite", {
        firstName, lastName, email: invite!.email,
        password, businessId: invite!.businessId, token: token ?? undefined,
      });
      const tokens = await doLogin(invite!.email, password);
      setPhase("done");
      toast.success("Welcome to the workspace!");
      redirectToApp(tokens);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to join workspace");
    } finally { setBusy(false); }
  });

  const roleLabel = invite?.role.replace(/_/g, " ").toLowerCase() ?? "";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] min-h-[680px]">

          {/* ── Left dark panel ── */}
          <div
            className="px-10 py-12 flex flex-col"
            style={{ background: "linear-gradient(160deg, #0d1f0f 0%, #0b1a0d 40%, #071009 100%)" }}
          >
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-12">
              <div className="relative w-28 h-7">
                <Image src="/IMS/whitelogo.png" alt="Scrubbe" fill sizes="112px" className="object-contain object-left" />
              </div>
            </div>

            {/* Welcome text */}
            <div className="mb-10">
              <h2 className="text-[32px] font-black text-white leading-tight mb-1">
                Welcome to
              </h2>
              <h2 className="text-[32px] font-black text-emerald-400 leading-tight mb-5">
                Scrubbe
              </h2>
              <p className="text-[14px] text-gray-400 leading-relaxed max-w-[260px]">
                The AI-native platform for autonomous incident response and operational intelligence.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-1 flex-1">
              {features.map(({ icon, title, desc }, i) => (
                <div key={title}>
                  <div className="flex items-start gap-4 py-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                      {icon}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-white mb-0.5">{title}</p>
                      <p className="text-[13px] text-gray-400 leading-snug">{desc}</p>
                    </div>
                  </div>
                  {i < features.length - 1 && <div className="h-px bg-white/[0.06]" />}
                </div>
              ))}
            </div>

            {/* Security note */}
            <div className="flex items-start gap-3 mt-8">
              <Lock size={13} className="text-gray-500 shrink-0 mt-0.5" />
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Your data is encrypted and secure. We never share your information.
              </p>
            </div>
          </div>

          {/* ── Right white panel ── */}
          <div className="px-10 py-12">

            {/* Loading */}
            {phase === "loading" && (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500 text-sm">Verifying your invitation...</p>
              </div>
            )}

            {/* Error */}
            {phase === "error" && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <Lock size={26} className="text-red-500" />
                </div>
                <h1 className="text-[20px] font-black text-black mb-2">Invalid Invitation</h1>
                <p className="text-sm text-gray-500 max-w-xs">{errorMsg}</p>
              </div>
            )}

            {/* Done */}
            {phase === "done" && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={26} className="text-emerald-600" />
                </div>
                <h1 className="text-[20px] font-black text-black mb-2">You're in!</h1>
                <p className="text-sm text-gray-500">Redirecting to your workspace...</p>
              </div>
            )}

            {/* Form states */}
            {(phase === "login" || phase === "signup") && invite && (
              <div className="h-full flex flex-col">

                {/* Top row: step + workspace badge */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[13px] font-semibold text-emerald-600 mb-1">
                      Step 1 of 2
                    </p>
                    <h1 className="text-[28px] font-black text-black leading-tight mb-1.5">
                      {phase === "login" ? "Sign in to workspace" : "Complete your account"}
                    </h1>
                    <p className="text-[14px] text-gray-500 max-w-sm leading-relaxed">
                      {phase === "login"
                        ? "Enter your password to access this workspace."
                        : `You've been invited as ${roleLabel}. Set up your account to join ${invite.businessName} on Scrubbe.`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 shrink-0 ml-4">
                    <Building2 size={12} className="text-emerald-600" />
                    <span className="text-[12px] font-semibold text-emerald-700">
                      Joining {invite.businessName}
                    </span>
                  </div>
                </div>

                {/* Email (read-only) */}
                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-black mb-2">Work email</label>
                  <div className={inputCls} style={{ background: "#f9fafb" }}>
                    <Mail size={15} className="text-gray-400 shrink-0" />
                    <span className="flex-1 text-[14px] text-gray-500">{invite.email}</span>
                  </div>
                </div>

                {/* Login form */}
                {phase === "login" && (
                  <form onSubmit={handleLogin} className="space-y-5 flex-1 flex flex-col">
                    <div>
                      <label className="block text-[13px] font-semibold text-black mb-2">Password</label>
                      <div className={inputCls}>
                        <Lock size={15} className="text-gray-400 shrink-0" />
                        <input
                          type={showPw ? "text" : "password"}
                          className="flex-1 bg-transparent outline-none text-[14px] text-black placeholder-gray-400"
                          placeholder="Your password"
                          autoFocus
                          {...loginForm.register("password")}
                        />
                        <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-400 hover:text-gray-600">
                          {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="mt-1 text-[12px] text-red-500">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div className="flex-1" />
                    <SubmitButton busy={busy} label="Sign in to workspace" loadingLabel="Signing in..." />
                  </form>
                )}

                {/* Signup form */}
                {phase === "signup" && (
                  <form onSubmit={handleSignup} className="space-y-5 flex-1 flex flex-col">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[13px] font-semibold text-black mb-2">First name</label>
                        <div className={inputCls}>
                          <User size={15} className="text-gray-400 shrink-0" />
                          <input type="text" className="flex-1 bg-transparent outline-none text-[14px] text-black placeholder-gray-400" placeholder="Alex" autoFocus {...signupForm.register("firstName")} />
                        </div>
                        {signupForm.formState.errors.firstName && (
                          <p className="mt-1 text-[12px] text-red-500">{signupForm.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-black mb-2">Last name</label>
                        <div className={inputCls}>
                          <User size={15} className="text-gray-400 shrink-0" />
                          <input type="text" className="flex-1 bg-transparent outline-none text-[14px] text-black placeholder-gray-400" placeholder="Johnson" {...signupForm.register("lastName")} />
                        </div>
                        {signupForm.formState.errors.lastName && (
                          <p className="mt-1 text-[12px] text-red-500">{signupForm.formState.errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-black mb-2">Create password</label>
                      <div className={inputCls}>
                        <Lock size={15} className="text-gray-400 shrink-0" />
                        <input
                          type={showPw ? "text" : "password"}
                          className="flex-1 bg-transparent outline-none text-[14px] text-black placeholder-gray-400"
                          placeholder="Min. 8 characters"
                          {...signupForm.register("password")}
                        />
                        <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-400 hover:text-gray-600">
                          {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {signupForm.formState.errors.password && (
                        <p className="mt-1 text-[12px] text-red-500">{signupForm.formState.errors.password.message}</p>
                      )}
                      <PasswordRules password={watchedPassword} />
                    </div>

                    {/* Security note card */}
                    <div className="flex items-start gap-3 px-4 py-4 rounded-xl border border-gray-100 bg-gray-50">
                      <Shield size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[13px] font-semibold text-black mb-0.5">Enterprise security by default</p>
                        <p className="text-[12px] text-gray-500 leading-relaxed">
                          Your account is protected with industry-standard security and compliance controls.
                        </p>
                      </div>
                    </div>

                    <SubmitButton busy={busy} label="Join workspace" loadingLabel="Joining workspace..." />

                    <p className="text-center text-[12px] text-gray-400">
                      By joining, you agree to Scrubbe's{" "}
                      <span className="text-emerald-600 font-medium cursor-pointer hover:underline">Terms of Service</span>
                      {" "}and{" "}
                      <span className="text-emerald-600 font-medium cursor-pointer hover:underline">Privacy Policy</span>.
                    </p>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Submit button — gradient matching design ──────────────────────

const SubmitButton = ({ busy, label, loadingLabel }: { busy: boolean; label: string; loadingLabel: string }) => (
  <button
    type="submit"
    disabled={busy}
    className="w-full py-4 rounded-xl font-bold text-[15px] text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
    style={{ background: "linear-gradient(90deg, #0d1f0f 0%, #14532d 60%, #16a34a 100%)" }}
  >
    {busy ? loadingLabel : <>{label} <ArrowRight size={16} /></>}
  </button>
);

// ── Export ────────────────────────────────────────────────────────

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <InvitePageInner />
    </Suspense>
  );
}