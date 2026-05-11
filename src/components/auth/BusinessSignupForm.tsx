"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Loader2,
  User,
  Mail,
  Lock,
  Building2,
  Globe,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import { AxiosError } from "axios";
import { BiCheck } from "react-icons/bi";
import useAuthStore from "@/lib/stores/auth.store";
import CompleteBusinessProfile, {
  BusinessProfileSignupFormData,
} from "./CompleteBusinessProfile";
import OtpInput from "../ui/OtpInput";

const IS_STANDALONE = process.env.NEXT_PUBLIC_IS_STANDALONE === "true";

// ─────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────

const PUBLIC_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "mail.com",
  "gmx.com",
  "protonmail.com",
  "zoho.com",
  "yandex.com",
  "msn.com",
  "live.com",
  "ymail.com",
  "inbox.com",
  "me.com",
];

export const businessSignupSchema = z.object({
  firstName: z.string().min(1, "Full name is required"),
  lastName: z.string().optional(),
  businessEmail: z
    .string()
    .email("Please enter a valid email address")
    .refine((email) => {
      const domain = email.split("@")[1]?.toLowerCase();
      return domain && !PUBLIC_DOMAINS.includes(domain);
    }, "Please use your business email address (not a public provider)"),
  businessName: z.string().min(3, "Please provide a valid workspace name"),
  workspaceUrl: z
    .string()
    .min(2, "Workspace URL must be at least 2 characters")
    .max(63)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
      "Must include uppercase, lowercase, number, and symbol"
    ),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms" }),
  }),
});

type BusinessSignupFormData = z.infer<typeof businessSignupSchema>;

// ─────────────────────────────────────────────────────────────────
// Field components
// ─────────────────────────────────────────────────────────────────

function FieldLabel({ label, info }: { label: string; info?: string }) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-sm font-semibold text-gray-900">{label}</label>
      {info && (
        <button
          type="button"
          title={info}
          className="text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <Info size={16} />
        </button>
      )}
    </div>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs text-gray-500">{children}</p>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

const inputCls =
  "w-full flex items-center gap-2.5 border border-gray-200 rounded-lg px-3.5 py-3 text-sm text-gray-800 placeholder-gray-400 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all bg-white";

// ─────────────────────────────────────────────────────────────────
// Success page
// ─────────────────────────────────────────────────────────────────

function SuccessPage({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  const name = [firstName, lastName].filter(Boolean).join(" ");
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-96 py-12">
      <div className="relative flex items-center justify-center mb-10">
        <div className="size-[150px] rounded-full bg-emerald-100 absolute animate-ping" />
        <div className="size-[130px] rounded-full bg-emerald-200 absolute" />
        <div className="size-[110px] rounded-full bg-emerald-300 absolute" />
        <div className="size-[90px] rounded-full bg-emerald-500 absolute" />
        <BiCheck className="absolute text-white" size={40} />
      </div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Workspace created!
      </h1>
      <p className="text-gray-500 text-center text-sm">
        Welcome {name}! Setting up your Scrubbe workspace…
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main form
// ─────────────────────────────────────────────────────────────────

export default function BusinessSignupForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] =
    useState<Partial<BusinessSignupFormData> | null>(null);
  const [isOTP, setIsOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteEmail = searchParams.get("email");
  const session = useSession();

  const {
    businessSignup,
    businessProfileSignup,
    isLoading,
    verifyEmail,
    resendOTP,
    error,
  } = useAuthStore();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<BusinessSignupFormData>({
    resolver: zodResolver(businessSignupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      businessEmail: "",
      businessName: "",
      workspaceUrl: "",
      password: "",
      acceptTerms: undefined,
    },
    mode: "onChange",
  });

  // Auto-generate workspace URL from workspace name
  const watchedName = watch("businessName");
  useEffect(() => {
    if (watchedName) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 63);
      setValue("workspaceUrl", slug, { shouldValidate: true });
    }
  }, [watchedName, setValue]);

  useEffect(() => {
    if (inviteEmail) setValue("businessEmail", inviteEmail);
  }, [inviteEmail, setValue]);

  // OAuth business email check
  useEffect(() => {
    if (
      session.status === "authenticated" &&
      session.data?.user &&
      !profileComplete
    ) {
      const domain = session.data.user.email?.split("@")[1]?.toLowerCase();
      if (domain && !PUBLIC_DOMAINS.includes(domain)) {
        setProfileComplete(true);
        return;
      }
      toast.error("Please use your business email address");
      setTimeout(() => signOut(), 4000);
    }
  }, [session, profileComplete]);

  useEffect(() => {
    if (showSuccess) {
      const t = setTimeout(() => router.replace("/auth/account-setup"), 3000);
      return () => clearTimeout(t);
    }
  }, [showSuccess, router]);

  const onSubmit = async (data: BusinessSignupFormData) => {
    try {
      await businessSignup(data);
      setFormData(data);
      setIsOTP(true);
    } catch (err) {
      toast.error("Registration failed", {
        description:
          err instanceof AxiosError
            ? err.response?.data?.message
            : "Signup failed",
      });
    }
  };

  const onProfileSubmit = async (data: BusinessProfileSignupFormData) => {
    try {
      await businessProfileSignup({ ...data, ...session.data?.user });
      setFormData({ ...data, ...session.data?.user } as any);
      await signOut({ redirect: false });
      setShowSuccess(true);
    } catch (err) {
      toast.error("Registration failed", {
        description:
          err instanceof AxiosError
            ? err.response?.data?.message
            : "Signup failed",
      });
    }
  };

  const handleVerifyOTP = async (code: string) => {
    if (code.length !== 6) {
      toast.error("Incorrect OTP code");
      return;
    }
    try {
      setRefreshing(true);
      await verifyEmail(code);
      toast.success("Email verified successfully");
      setShowSuccess(true);
    } catch {
      toast.error(JSON.stringify(error));
    } finally {
      setRefreshing(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setRefreshing(true);
      await resendOTP();
      toast.success("OTP sent successfully");
    } catch {
      toast.error(JSON.stringify(error));
    } finally {
      setRefreshing(false);
    }
  };

  // ── Render states ──────────────────────────────────────────────

  if (showSuccess && formData) {
    return (
      <SuccessPage
        firstName={formData.firstName ?? ""}
        lastName={formData.lastName ?? ""}
      />
    );
  }

  if (profileComplete) {
    return (
      <div className="w-full">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">
          Complete your profile
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Just a few more details to get started
        </p>
        <CompleteBusinessProfile
          onSubmit={onProfileSubmit}
          isLoading={isLoading}
        />
      </div>
    );
  }

  if (isOTP) {
    return (
      <OtpInput
        email={formData?.businessEmail ?? ""}
        handleResend={handleResendOTP}
        onSubmit={handleVerifyOTP}
        isLoading={refreshing}
      />
    );
  }

  // ── Main form ──────────────────────────────────────────────────

  return (
    <Suspense fallback={<div>Loading…</div>}>
      <div className="w-full">
        {/* Loading overlay for OAuth */}
        {session.status === "loading" && (
          <div className="absolute inset-0 bg-black/20 z-[1000] flex justify-center pt-[20%]">
            <Loader2 className="animate-spin text-emerald-500" size={30} />
          </div>
        )}

        {/* Help link */}
        <div className="text-right mb-6 text-sm text-gray-500">
          Need help?{" "}
          <Link
            href="/support"
            className="text-emerald-600 font-semibold hover:underline"
          >
            contact support
          </Link>
        </div>

        {/* Page heading */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-black text-gray-900 tracking-tight mb-1">
            Create your workspace
          </h1>
          <p className="text-sm text-gray-500">
            Set up your organization to start using Scrubbe
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full name */}
          <div>
            <FieldLabel label="Full name" />
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <div className={inputCls}>
                  <User size={15} className="text-gray-400 shrink-0" />
                  <input
                    {...field}
                    className="flex-1 bg-transparent outline-none text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              )}
            />
            <FieldError message={errors.firstName?.message} />
            <FieldHint>Use your legal or company display name.</FieldHint>
          </div>

          {/* Work email */}
          <div>
            <FieldLabel label="Work email" />
            <Controller
              name="businessEmail"
              control={control}
              render={({ field }) => (
                <div className={inputCls}>
                  <Mail size={15} className="text-gray-400 shrink-0" />
                  <input
                    {...field}
                    type="email"
                    className="flex-1 bg-transparent outline-none text-sm"
                    placeholder="Enter your work email address"
                  />
                </div>
              )}
            />
            <FieldError message={errors.businessEmail?.message} />
            <FieldHint>
              We will use this to set up your account and workspace.
            </FieldHint>
          </div>

          {/* Password */}
          <div>
            <FieldLabel label="Create Password" />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <div className={inputCls}>
                  <Lock size={15} className="text-gray-400 shrink-0" />
                  <input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    className="flex-1 bg-transparent outline-none text-sm"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              )}
            />
            <FieldError message={errors.password?.message} />
            <FieldHint>
              Minimum 8 characters with uppercase, lowercase, number, and
              symbol.
            </FieldHint>
          </div>

          {/* Workspace name */}
          <div>
            <FieldLabel
              label="Workspace name"
              info="This will be the display name for your Scrubbe workspace"
            />
            <Controller
              name="businessName"
              control={control}
              render={({ field }) => (
                <div className={inputCls}>
                  <Building2 size={15} className="text-gray-400 shrink-0" />
                  <input
                    {...field}
                    className="flex-1 bg-transparent outline-none text-sm"
                    placeholder="Enter your organization or company name"
                  />
                </div>
              )}
            />
            <FieldError message={errors.businessName?.message} />
            <FieldHint>This is the name of your Scrubbe workspace.</FieldHint>
          </div>

          {/* Workspace URL */}
          <div>
            <FieldLabel
              label="Workspace url"
              info="Your workspace will be accessible at this URL"
            />
            <Controller
              name="workspaceUrl"
              control={control}
              render={({ field }) => (
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all">
                  <div className="flex items-center gap-2 flex-1 px-3.5 py-3">
                    <Globe size={15} className="text-gray-400 shrink-0" />
                    <input
                      {...field}
                      className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 min-w-0"
                      placeholder="acme"
                    />
                  </div>
                  <div
                    className="px-4 py-3 text-sm font-medium shrink-0 border-l border-gray-200"
                    style={{ background: "#f9fafb", color: "#6b7280" }}
                  >
                    .scrubbe.com
                  </div>
                </div>
              )}
            />
            <FieldError message={errors.workspaceUrl?.message} />
            <FieldHint>
              Example:{" "}
              <span className="text-gray-700">
                {watch("workspaceUrl") || "acme"}.scrubbe.com
              </span>
              .
            </FieldHint>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-3">
            <Controller
              name="acceptTerms"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(field.value ? undefined : true)}
                  className="mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all"
                  style={{
                    borderColor: field.value ? "#22c55e" : "#d1d5db",
                    background: field.value ? "#22c55e" : "transparent",
                  }}
                >
                  {field.value && <BiCheck size={14} color="white" />}
                </button>
              )}
            />
            <p className="text-sm text-gray-600 leading-relaxed">
              By creating a workspace, you agree to Scrubbe's{" "}
              <Link
                href="/terms"
                className="underline text-gray-800 hover:text-emerald-600"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline text-gray-800 hover:text-emerald-600"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          {errors.acceptTerms && (
            <p className="text-xs text-red-500 -mt-3">
              {errors.acceptTerms.message}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
            style={{
              background:
                isLoading || !isValid
                  ? "#374151"
                  : "linear-gradient(90deg, #1a2a1a 0%, #14532d 55%, #22c55e 100%)",
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Creating workspace…
              </span>
            ) : (
              "Sign-up"
            )}
          </button>

          {/* Sign in link */}
          <p className="text-center text-sm text-gray-600 pb-2">
            Already created an account?{" "}
            <Link
              href="/auth/signin"
              className="text-emerald-600 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </Suspense>
  );
}
