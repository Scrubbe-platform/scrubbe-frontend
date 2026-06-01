"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Building2, Clock, Info, Lock, Mail, Shield, User } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { endpoint } from "@/lib/api/endpoint";

const schema = z.object({
  email: z.string().email("Please enter a valid work email"),
  name: z.string().optional(),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Workspace = {
  businessId: string;
  businessName: string;
  subdomain: string | null;
  workspaceUrl: string | null;
  logoUrl: string | null;
  isSetupComplete: boolean;
};

type AccessResponse = Workspace & {
  status: "INVITED_EXISTING_USER" | "INVITED_NEW_USER" | "NOT_INVITED";
  email: string;
  redirectUrl?: string;
  message?: string;
};

const inputCls =
  "w-full flex items-center gap-2.5 border border-gray-200 rounded-xl px-3.5 py-3 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all bg-white";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[14px] font-semibold text-gray-800 mb-2">
      {children}
    </label>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[12.5px] text-gray-400">{children}</p>;
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

function responseData<T>(value: { data?: { data?: T } | T }) {
  const payload = value.data as { data?: T } | T | undefined;
  return (payload && typeof payload === "object" && "data" in payload
    ? payload.data
    : payload) as T;
}

export default function WorkspaceAccessPage() {
  const params = useParams<{ subdomain: string }>();
  const router = useRouter();
  const subdomain = params.subdomain;
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isResolving, setIsResolving] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", name: "", message: "" },
    mode: "onChange",
  });

  useEffect(() => {
    let cancelled = false;

    const loadWorkspace = async () => {
      try {
        setIsResolving(true);
        const res = await apiClient.get(
          `${endpoint.auth.workspace_resolve}/${encodeURIComponent(subdomain)}`
        );
        if (!cancelled) {
          setWorkspace(responseData<Workspace>(res));
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Workspace not found. Please check the URL or contact your administrator.");
        }
      } finally {
        if (!cancelled) setIsResolving(false);
      }
    };

    void loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [subdomain]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const res = await apiClient.post(
        `${endpoint.auth.workspace_access_check}/${encodeURIComponent(subdomain)}/access-check`,
        data
      );
      const result = responseData<AccessResponse>(res);

      if (result.redirectUrl) {
        router.push(result.redirectUrl);
        return;
      }

      setSent(true);
      toast.success("Access request sent!", {
        description: result.message ?? "Your administrator will review your request.",
      });
    } catch (err: any) {
      toast.error("Unable to check workspace access", {
        description:
          err?.response?.data?.message ?? "Please try again or contact your administrator.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[1100px] bg-white rounded-3xl shadow-sm overflow-hidden">
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
              Enter your work email. We will check whether this workspace has
              invited you and guide you to the right next step.
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
                This check is performed by Scrubbe's server so workspace access
                cannot be spoofed from the browser.
              </p>
            </div>
          </div>

          <div className="px-10 py-12">
            {isResolving ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                Loading workspace...
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
                  <Lock size={28} className="text-red-500" />
                </div>
                <h2 className="text-[20px] font-black text-gray-900 mb-2">
                  Workspace unavailable
                </h2>
                <p className="text-[14px] text-gray-500 leading-relaxed max-w-xs">
                  {error}
                </p>
              </div>
            ) : sent ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                  <Shield size={28} className="text-emerald-600" />
                </div>
                <h2 className="text-[20px] font-black text-gray-900 mb-2">
                  Request sent
                </h2>
                <p className="text-[14px] text-gray-500 leading-relaxed max-w-xs">
                  Your administrator has been notified and will respond by email
                  with next steps.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-[22px] font-black text-gray-900 mb-1">
                  Tell us who you are
                </h2>
                <p className="text-[13.5px] text-gray-500 mb-8">
                  We will verify your invitation for {workspace?.businessName}.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <FieldLabel>Work email</FieldLabel>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <div className={inputCls}>
                          <Mail size={15} className="text-gray-400 shrink-0" />
                          <input
                            {...field}
                            type="email"
                            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                            placeholder="name@company.com"
                          />
                        </div>
                      )}
                    />
                    {errors.email ? (
                      <p className="mt-1.5 text-xs text-red-500">
                        {errors.email.message}
                      </p>
                    ) : (
                      <FieldHint>Use your invited company email address</FieldHint>
                    )}
                  </div>

                  <div>
                    <FieldLabel>Your name (optional)</FieldLabel>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <div className={inputCls}>
                          <User size={15} className="text-gray-400 shrink-0" />
                          <input
                            {...field}
                            type="text"
                            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                            placeholder="e.g Alex Johnson"
                          />
                        </div>
                      )}
                    />
                    <FieldHint>Helps administrators identify your request</FieldHint>
                  </div>

                  <div>
                    <FieldLabel>Message (optional)</FieldLabel>
                    <Controller
                      name="message"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows={4}
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all bg-white resize-none"
                          placeholder="Tell your administrator why you need access"
                        />
                      )}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!isValid || isLoading}
                    className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                    style={{
                      background:
                        "linear-gradient(90deg,#1a2a1a 0%,#14532d 55%,#22c55e 100%)",
                    }}
                  >
                    {isLoading ? "Checking access..." : "Continue to workspace"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
