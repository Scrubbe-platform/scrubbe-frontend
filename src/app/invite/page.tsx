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
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";

type InviteData = {
  email: string;
  role: string;
  businessId: string;
  businessName: string;
  subdomain: string | null;
  workspaceUrl: string | null;
};

type DecodedInvite = {
  existingUser: boolean;
  inviteData: InviteData;
} & InviteData;

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});
const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

function unwrap<T>(res: { data?: { data?: T } | T }): T {
  const d = res.data as { data?: T } | T | undefined;
  return (d && typeof d === "object" && "data" in d ? d.data : d) as T;
}

function redirectToApp(tokens: { accessToken: string; refreshToken?: string }) {
  // Pass tokens in URL so the main-app middleware can set them as cookies on www.scrubbe.com
  const params = new URLSearchParams({ token: tokens.accessToken });
  if (tokens.refreshToken) params.set("refreshToken", tokens.refreshToken);
  window.location.href = `https://www.scrubbe.com/incident?${params.toString()}`;
}

const inputCls =
  "w-full flex items-center gap-2.5 border border-gray-200 rounded-xl px-3.5 py-3 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all bg-white";

function InvitePageInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [phase, setPhase] = useState<
    "loading" | "error" | "login" | "signup" | "done"
  >("loading");
  const [invite, setInvite] = useState<DecodedInvite | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (!token) {
      setErrorMsg("No invite token found in the link.");
      setPhase("error");
      return;
    }
    (async () => {
      try {
        const res = await apiClient.post("/business/decode-invite", { token });
        const data = unwrap<DecodedInvite>(res);
        setInvite(data);
        setPhase(data.existingUser ? "login" : "signup");
      } catch (err: any) {
        setErrorMsg(
          err?.response?.data?.message ??
            "This invite link is invalid or has expired."
        );
        setPhase("error");
      }
    })();
  }, [token]);

  const doLogin = async (email: string, password: string) => {
    const res = await apiClient.post("/auth/login", { email, password });
    const { tokens } = unwrap<{
      user: unknown;
      tokens: { accessToken: string; refreshToken: string };
    }>(res);
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
    } finally {
      setBusy(false);
    }
  });

  const handleSignup = signupForm.handleSubmit(
    async ({ firstName, lastName, password }) => {
      setBusy(true);
      try {
        await apiClient.post("/business/accept-invite", {
          firstName,
          lastName,
          email: invite!.email,
          password,
          businessId: invite!.businessId,
          token: token ?? undefined,
        });
        const tokens = await doLogin(invite!.email, password);
        setPhase("done");
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <div className="relative w-32 h-8">
            <Image
              src="/IMS/blacklogo.png"
              alt="Scrubbe"
              fill
              sizes="128px"
              className="object-contain"
            />
          </div>
          {invite && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
              <Building2 size={12} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">
                {invite.businessName}
              </span>
            </div>
          )}
        </div>

        <div className="px-8 py-10">
          {phase === "loading" && (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 text-sm">
                Verifying your invitation...
              </p>
            </div>
          )}

          {phase === "error" && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-red-500" />
              </div>
              <h1 className="text-xl font-black text-gray-900 mb-2">
                Invalid Invitation Link
              </h1>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                {errorMsg}
              </p>
            </div>
          )}

          {phase === "done" && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-emerald-600" />
              </div>
              <h1 className="text-xl font-black text-gray-900 mb-2">
                You&apos;re in!
              </h1>
              <p className="text-sm text-gray-500">
                Redirecting to your workspace...
              </p>
            </div>
          )}

          {(phase === "login" || phase === "signup") && invite && (
            <>
              <div className="mb-7">
                <h1 className="text-2xl font-black text-gray-900 mb-1.5">
                  {phase === "login"
                    ? "Sign in to workspace"
                    : "Complete your account"}
                </h1>
                <p className="text-sm text-gray-500">
                  {phase === "login"
                    ? "Enter your password to access this workspace."
                    : `You've been invited as ${invite.role.replace(/_/g, " ").toLowerCase()}.`}
                </p>
              </div>

              {/* Role badge */}
              {phase === "signup" && (
                <div className="mb-5 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100">
                  <Building2 size={14} className="text-blue-500 shrink-0" />
                  <span className="text-[13px] text-blue-700">
                    Joining{" "}
                    <span className="font-bold">{invite.businessName}</span> as{" "}
                    <span className="font-bold capitalize">
                      {invite.role.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </span>
                </div>
              )}

              {/* Email (read-only) */}
              <div className="mb-5">
                <label className="block text-[14px] font-semibold text-gray-800 mb-2">
                  Email
                </label>
                <div
                  className={inputCls}
                  style={{ background: "#f9fafb", cursor: "default" }}
                >
                  <Mail size={15} className="text-gray-400 shrink-0" />
                  <span className="flex-1 text-sm text-gray-500">
                    {invite.email}
                  </span>
                </div>
              </div>

              {phase === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[14px] font-semibold text-gray-800 mb-2">
                      Password
                    </label>
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
                      <p className="mt-1 text-xs text-red-500">
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
              )}

              {phase === "signup" && (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[14px] font-semibold text-gray-800 mb-2">
                        First name
                      </label>
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
                      <label className="block text-[14px] font-semibold text-gray-800 mb-2">
                        Last name
                      </label>
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
                    <label className="block text-[14px] font-semibold text-gray-800 mb-2">
                      Create password
                    </label>
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InvitePageInner />
    </Suspense>
  );
}
