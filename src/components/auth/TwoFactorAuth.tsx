"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Copy, KeyRound, ArrowLeft } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { MfaSetup } from "@/lib/stores/auth.store";

type TwoFactorAuthProps = {
  mode: "verify" | "setup";
  email?: string;
  mfaSetup?: MfaSetup;
  isLoading?: boolean;
  onVerify: (code: string) => Promise<void>;
  onBack?: () => void;
};

export default function TwoFactorAuth({
  mode,
  email,
  mfaSetup,
  isLoading,
  onVerify,
  onBack,
}: TwoFactorAuthProps) {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const secret = mfaSetup?.secret ?? "";
  const otpauthUrl = mfaSetup?.otpauthUrl ?? "";
  const isSetup = mode === "setup" && Boolean(secret);

  const secretGroups = useMemo(() => {
    const s = secret.toUpperCase();
    const groups: string[] = [];
    for (let i = 0; i < s.length; i += 4) groups.push(s.slice(i, i + 4));
    return groups;
  }, [secret]);

  const handleChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...code];
    next[idx] = value;
    setCode(next);
    if (value && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData
      .getData("Text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");
    if (!digits.length) return;
    const next = ["", "", "", "", "", ""];
    digits.forEach((d, i) => (next[i] = d));
    setCode(next);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = code.join("");
    if (value.length !== 6) {
      toast.error("Enter the 6-digit code from your authenticator app");
      return;
    }
    try {
      setSubmitting(true);
      await onVerify(value);
    } catch (err) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Invalid code. Please try again."
      );
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      toast.success("Setup key copied");
    } catch {
      toast.error("Could not copy. Copy it manually.");
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-gray-400 hover:text-black transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
          <ShieldCheck size={18} className="text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-black">
          {isSetup ? "Set up authenticator app" : "Two-factor verification"}
        </h2>
      </div>

      {isSetup ? (
        <div className="mb-5 space-y-4">
          <p className="text-sm text-gray-500">
            Scan the QR code with your authenticator app, or enter the setup
            key below manually. This is required to secure your account.
          </p>

          {otpauthUrl && (
            <div className="flex justify-center rounded-xl border border-gray-200 bg-white p-4">
              <QRCodeSVG
                value={otpauthUrl}
                size={176}
                level="M"
                marginSize={2}
                title="Scan with your authenticator app"
              />
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Setup key
            </p>
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-emerald-600 shrink-0" />
              <code className="flex-1 text-sm font-bold tracking-wider text-black break-all">
                {secretGroups.join(" ")}
              </code>
              <button
                type="button"
                onClick={copySecret}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition-colors"
                title="Copy setup key"
              >
                <Copy size={14} className="text-gray-500" />
              </button>
            </div>
          </div>

          <ol className="text-sm text-gray-500 space-y-1.5 list-decimal pl-5">
            <li>
              Open Google Authenticator, Authy, or Microsoft Authenticator.
            </li>
            <li>
              Tap <span className="font-semibold text-black">+</span> and choose{" "}
              <span className="font-semibold text-black">
                Enter a setup key
              </span>
              .
            </li>
            <li>Enter the key above and press Add.</li>
            <li>Type the 6-digit code it generates below.</li>
          </ol>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-5">
          Enter the 6-digit code from your authenticator app for{" "}
          <span className="font-semibold text-black">{email}</span>.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-2 justify-center">
          {code.map((value, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              autoFocus={idx === 0}
              maxLength={1}
              value={value}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-xl font-bold text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={submitting || isLoading || code.some((c) => !c)}
          className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 flex items-center justify-center gap-2"
          style={{
            background:
              "linear-gradient(90deg,#1a2a1a 0%,#14532d 55%,#22c55e 100%)",
          }}
        >
          {submitting || isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : null}
          {isSetup ? "Verify & continue" : "Verify & sign in"}
        </button>
      </form>
    </div>
  );
}

