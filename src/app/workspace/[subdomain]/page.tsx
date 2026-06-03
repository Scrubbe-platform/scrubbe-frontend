"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Building2, Clock, Lock, Mail, Shield, User,
  CheckCircle2, ArrowRight,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { endpoint } from "@/lib/api/endpoint";

// ── Types ─────────────────────────────────────────────────────────

const schema = z.object({
  email:   z.string().email("Please enter a valid work email"),
  name:    z.string().optional(),
  message: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

type Workspace = {
  businessId: string; businessName: string; subdomain: string | null;
  workspaceUrl: string | null; logoUrl: string | null; isSetupComplete: boolean;
};
type AccessResponse = Workspace & {
  status: "INVITED_EXISTING_USER" | "INVITED_NEW_USER" | "NOT_INVITED";
  email: string; redirectUrl?: string; message?: string;
};

// ── Helpers ───────────────────────────────────────────────────────

function responseData<T>(value: { data?: { data?: T } | T }) {
  const payload = value.data as { data?: T } | T | undefined;
  return (payload && typeof payload === "object" && "data" in payload ? payload.data : payload) as T;
}

const inputCls =
  "w-full flex items-center gap-2.5 border border-gray-200 rounded-xl px-3.5 py-3.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all bg-white";

// ── Sub-components ────────────────────────────────────────────────

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[13px] font-semibold text-gray-800 mb-2">{children}</label>
);

const FieldHint = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-1.5 text-[12px] text-gray-400">{children}</p>
);

// Left panel info item — icon box + text
const InfoItem = ({
  icon, bg, title, desc,
}: {
  icon: React.ReactNode; bg: string; title: string; desc: string;
}) => (
  <div className="flex items-start gap-4 py-5 border-b border-white/10 last:border-0">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
      {icon}
    </div>
    <div>
      <p className="text-[14px] font-bold text-white mb-0.5">{title}</p>
      <p className="text-[13px] text-gray-400 leading-relaxed">{desc}</p>
    </div>
  </div>
);

// Trust badge in bottom of right panel
const TrustBadge = ({
  icon, title, desc,
}: {
  icon: React.ReactNode; title: string; desc: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="text-emerald-600 shrink-0 mt-0.5">{icon}</div>
    <div>
      <p className="text-[13px] font-semibold text-gray-800">{title}</p>
      <p className="text-[12px] text-gray-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────

export default function WorkspaceAccessPage() {
  const params = useParams<{ subdomain: string }>();
  const router = useRouter();
  const subdomain = params.subdomain;

  const [workspace, setWorkspace]   = useState<Workspace | null>(null);
  const [isResolving, setIsResolving] = useState(true);
  const [isLoading, setIsLoading]   = useState(false);
  const [sent, setSent]             = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", name: "", message: "" },
    mode: "onChange",
  });

  useEffect(() => {
    let cancelled = false;
    const loadWorkspace = async () => {
      try {
        setIsResolving(true);
        const res = await apiClient.get(`${endpoint.auth.workspace_resolve}/${encodeURIComponent(subdomain)}`);
        if (!cancelled) { setWorkspace(responseData<Workspace>(res)); setError(null); }
      } catch {
        if (!cancelled) setError("Workspace not found. Please check the URL or contact your administrator.");
      } finally {
        if (!cancelled) setIsResolving(false);
      }
    };
    void loadWorkspace();
    return () => { cancelled = true; };
  }, [subdomain]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const res = await apiClient.post(
        `${endpoint.auth.workspace_access_check}/${encodeURIComponent(subdomain)}/access-check`, data
      );
      const result = responseData<AccessResponse>(res);
      if (result.redirectUrl) { router.push(result.redirectUrl); return; }
      setSent(true);
      toast.success("Access request sent!", { description: result.message ?? "Your administrator will review your request." });
    } catch (err: any) {
      toast.error("Unable to check workspace access", { description: err?.response?.data?.message ?? "Please try again or contact your administrator." });
    } finally {
      setIsLoading(false);
    }
  };

  const workspaceUrl = workspace?.workspaceUrl ?? `https://${subdomain}.scrubbe.com`;
  const businessName = workspace?.businessName ?? "your organization's";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[1100px] bg-white rounded-3xl shadow-sm overflow-hidden">

        {/* ── Top nav bar ── */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
          <div className="relative w-32 h-8">
            <Image src="/IMS/blacklogo.png" alt="Scrubbe" fill sizes="128px" className="object-contain" />
          </div>
          <Link href="/auth/signin" className="text-[13px] font-semibold text-gray-500 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
        </div>

        {/* ── Two-column body ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] min-h-[640px]">

          {/* ── Left panel — dark ── */}
          <div
            className="px-10 py-12 flex flex-col"
            style={{
              background: "linear-gradient(160deg, #0d1f0f 0%, #0a1a0c 40%, #061208 100%)",
            }}
          >
            {/* Logo (white version) */}
            <div className="relative w-32 h-8 mb-10">
              <Image src="/IMS/whitelogo.png" alt="Scrubbe" fill sizes="128px" className="object-contain object-left" />
            </div>

            {/* Workspace URL badge */}
            <div className="inline-flex items-center gap-2 text-[13px] text-emerald-400 font-medium mb-8">
              <Building2 size={14} />
              {workspaceUrl}
            </div>

            {/* Title */}
            <h1 className="font-black text-white leading-[1.15] tracking-tight mb-4" style={{ fontSize: "clamp(26px, 2.8vw, 36px)" }}>
              Access{" "}
              <span className="text-emerald-400">{businessName}</span>
              <br />
              Scrubbe workspace
            </h1>

            <p className="text-[14px] text-gray-400 leading-relaxed mb-10 max-w-sm">
              Enter your work email. We'll verify whether this workspace has invited you and guide you to the right next steps.
            </p>

            {/* Info items */}
            <div className="flex-1">
              <InfoItem
                icon={<Shield size={18} className="text-emerald-400" />}
                bg="bg-emerald-500/10"
                title="Invite-gated access"
                desc="Only invited users can enter this workspace."
              />
              <InfoItem
                icon={<Mail size={18} className="text-violet-400" />}
                bg="bg-violet-500/10"
                title="Work email required"
                desc="Use the email your administrator invited."
              />
              <InfoItem
                icon={<User size={18} className="text-sky-400" />}
                bg="bg-sky-500/10"
                title="No invite yet?"
                desc="We'll help you contact the workspace administrators."
              />
            </div>

            {/* Bottom note */}
            <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 mt-8">
              <Lock size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[12px] text-gray-400 leading-relaxed">
                Access is verified server-side — workspace membership cannot be spoofed from the browser.
              </p>
            </div>
          </div>

          {/* ── Right panel — white ── */}
          <div className="px-10 py-12 flex flex-col">
            {isResolving ? (
              <div className="flex-1 flex items-center justify-center text-[13px] text-gray-400">
                Loading workspace…
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
                  <Lock size={26} className="text-red-500" />
                </div>
                <h2 className="text-[20px] font-black text-gray-900 mb-2">Workspace unavailable</h2>
                <p className="text-[14px] text-gray-500 leading-relaxed max-w-xs">{error}</p>
              </div>
            ) : sent ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                  <Shield size={26} className="text-emerald-600" />
                </div>
                <h2 className="text-[20px] font-black text-gray-900 mb-2">Request sent</h2>
                <p className="text-[14px] text-gray-500 leading-relaxed max-w-xs">
                  Your administrator has been notified and will respond by email with next steps.
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <h2 className="text-[26px] font-black text-gray-900 mb-1">Tell us who you are</h2>
                <p className="text-[13.5px] text-gray-500 mb-8">
                  We'll verify your invitation for {businessName}.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 flex-1">
                  {/* Email */}
                  <div>
                    <FieldLabel>Work email</FieldLabel>
                    <Controller name="email" control={control} render={({ field }) => (
                      <div className={inputCls}>
                        <Mail size={15} className="text-gray-400 shrink-0" />
                        <input {...field} type="email" className="flex-1 bg-transparent outline-none text-[14px] text-gray-800 placeholder-gray-400" placeholder="name@company.com" />
                      </div>
                    )} />
                    {errors.email
                      ? <p className="mt-1.5 text-[12px] text-red-500">{errors.email.message}</p>
                      : <FieldHint>Use your invited company email address</FieldHint>}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!isValid || isLoading}
                    className="w-full py-4 rounded-xl font-bold text-[15px] text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                    style={{ background: "linear-gradient(90deg, #1a2a1a 0%, #14532d 55%, #22c55e 100%)" }}
                  >
                    {isLoading ? "Checking access…" : "Continue to workspace"}
                    {!isLoading && <ArrowRight size={16} />}
                  </button>
                </form>

                {/* Trust badges */}
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <p className="text-center text-[12px] text-gray-400 font-medium tracking-wide uppercase mb-6">
                    Secure by design
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <TrustBadge icon={<Lock size={16} />}         title="Enterprise security" desc="Built with industry-standard security and compliance." />
                    <TrustBadge icon={<Shield size={16} />}       title="Your data is safe"   desc="We never share your information." />
                    <TrustBadge icon={<CheckCircle2 size={16} />} title="Verified access"     desc="We verify every request to keep your workspace secure." />
                  </div>
                </div>

                <p className="text-center text-[13px] text-gray-400 mt-8">
                  Need help?{" "}
                  <span className="text-emerald-600 font-semibold cursor-pointer hover:underline">
                    Contact your workspace administrator.
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}