"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  User,
  Shield,
  BellRing,
  Clock,
  Info,
  Lock,
  Building2,
} from "lucide-react";
import Image from "next/image";

// ─────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────

const schema = z.object({
  workEmail: z.string().email("Please enter a valid work email"),
  name: z.string().optional(),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// ─────────────────────────────────────────────────────────────────
// Info item (left column)
// ─────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────
// Field wrapper
// ─────────────────────────────────────────────────────────────────

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

const inputCls =
  "w-full flex items-center gap-2.5 border border-gray-200 rounded-xl px-3.5 py-3 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all bg-white";

// ─────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────

export default function ContactAdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { workEmail: "", name: "", message: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      // TODO: wire to your API
      await new Promise((res) => setTimeout(res, 1200));
      setSent(true);
      toast.success("Access request sent!", {
        description: "Your administrator will review and respond via email.",
      });
    } catch {
      toast.error("Failed to send request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Outer page — light grey background
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 md:p-8">
      {/* Card */}
      <div className="w-full max-w-[1100px] bg-white rounded-3xl shadow-sm overflow-hidden">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          {/* Logo */}
          <div className="relative w-32 h-8 xl:w-40 xl:h-10">
            <Image
              src="/IMS/blacklogo.png"
              alt="Scrubbe Logo"
              fill
              sizes="(max-width: 1280px) 128px, 160px"
              className="object-contain"
            />
          </div>

          {/* Back to sign in */}
          <Link
            href="/auth/signin"
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to sign in
          </Link>
        </div>

        {/* ── Main content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[620px]">
          {/* LEFT */}
          <div className="px-10 py-12 lg:border-r border-gray-100">
            <h1
              className="font-black text-gray-900 leading-[1.1] tracking-tight mb-4"
              style={{ fontSize: "clamp(22px, 2.5vw, 32px)" }}
            >
              Request access to your
              <br />
              organization's workspace
            </h1>

            <p className="text-[14px] text-gray-500 leading-relaxed mb-10 max-w-sm">
              You don't have access to any Scrubbe workspaces yet. We'll notify
              your administrator so they can review and approve your request.
            </p>

            {/* Info items */}
            <div className="space-y-6 mb-10">
              <InfoItem
                icon={<Shield size={18} className="text-emerald-600" />}
                iconBg="#f0fdf4"
                title="Secure and private"
                desc="Your information is transmitted securely and used only to process your request."
              />
              <InfoItem
                icon={<Mail size={18} className="text-purple-500" />}
                iconBg="#faf5ff"
                title="Administrator notification"
                desc="We'll send your request to the appropriate administrators in your organization."
              />
              <InfoItem
                icon={<Clock size={18} className="text-blue-500" />}
                iconBg="#eff6ff"
                title="What happens next?"
                desc="Your administrator will review your request and email you with next steps."
              />
            </div>

            {/* Info callout */}
            <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-blue-50 border border-blue-100">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[13px] text-blue-700 leading-relaxed">
                Make sure to use your work email address. This helps us route
                your request to the right people in your organization.
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="px-10 py-12">
            {sent ? (
              // Success state
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                  <Shield size={28} className="text-emerald-600" />
                </div>
                <h2 className="text-[20px] font-black text-gray-900 mb-2">
                  Request sent!
                </h2>
                <p className="text-[14px] text-gray-500 leading-relaxed max-w-xs">
                  Your administrator has been notified and will respond to you
                  via email with next steps.
                </p>
                <Link
                  href="/auth/signin"
                  className="mt-8 text-sm font-semibold text-emerald-600 hover:underline"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-[22px] font-black text-gray-900 mb-1">
                  Tell us who you are
                </h2>
                <p className="text-[13.5px] text-gray-500 mb-8">
                  Provide your details so we can route your request.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Work email */}
                  <div>
                    <FieldLabel>Work email</FieldLabel>
                    <Controller
                      name="workEmail"
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
                    {errors.workEmail ? (
                      <p className="mt-1.5 text-xs text-red-500">
                        {errors.workEmail.message}
                      </p>
                    ) : (
                      <FieldHint>Use your company email address</FieldHint>
                    )}
                  </div>

                  {/* Name */}
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
                    <FieldHint>
                      Helps administrators identify your request
                    </FieldHint>
                  </div>

                  {/* Message */}
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
                          placeholder="Let your administrator know why you need access to scrubbe"
                        />
                      )}
                    />
                    <FieldHint>
                      Include any additional context about your request
                    </FieldHint>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!isValid || isLoading}
                    className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                    style={{
                      background:
                        "linear-gradient(90deg,#1a2a1a 0%,#14532d 55%,#22c55e 100%)",
                    }}
                  >
                    {isLoading ? "Sending…" : "Send access request"}
                  </button>

                  {/* Privacy note */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <Lock size={15} className="text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-[12.5px] text-gray-500 leading-relaxed">
                      By submitting this request, you agree to our{" "}
                      <Link href="" className="text-blue-500 hover:underline">
                        Privacy Policy
                      </Link>{" "}
                      and acknowledge that your information will be used to
                      process your request.
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* ── Bottom bar ── */}
      </div>
    </div>
  );
}
