"use client";
import React, { useEffect, useRef, useState } from "react";
import CButton from "./Cbutton";

interface OtpInputProps {
  onSubmit: (value: string) => void;
  handleResend: () => void;
  length?: number;
  email: string;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
}

const OtpInput = ({
  onSubmit,
  length = 6,
  disabled = false,
  className = "",
  email,
  handleResend,
  isLoading,
}: OtpInputProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState<number>(51);
  const [isResendDisabled, setIsResendDisabled] = useState<boolean>(true);
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array(6).fill("")
  );
  const handleChange = (idx: number, val: string) => {
    if (!/^[0-9a-zA-Z]?$/.test(val)) return;
    const newValue = [...verificationCode];
    newValue[idx] = val;
    setVerificationCode(newValue);
    if (val && idx < length - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !verificationCode[idx] && idx > 0) {
      setVerificationCode(
        verificationCode.map((v, i) => (i === idx - 1 ? "" : v))
      );
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("Text").slice(0, length).split("");
    if (pasted.length) {
      const newValue = [...verificationCode];
      for (let i = 0; i < length; i++) {
        newValue[i] = pasted[i] || "";
      }
      setVerificationCode(newValue);
      // Focus last filled
      const lastIdx = pasted.findIndex((v) => !v);
      inputRefs.current[lastIdx === -1 ? length - 1 : lastIdx]?.focus();
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }

    if (resendTimer === 0) {
      setIsResendDisabled(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleResendCode = () => {
    if (!isResendDisabled) return;

    // Reset verification code
    setVerificationCode(Array(6).fill(""));
    // Reset timer
    setResendTimer(51);
    setIsResendDisabled(true);
    handleResend();
    // Focus first input
    inputRefs.current[0]?.focus();
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // if (verificationCode.every((code) => code !== "")) {
    //   setStage(3);
    // }
    onSubmit(verificationCode.join(""));
  };

  return (
    <div className="w-full  mx-auto">
      {/* <div
              className=" flex gap-2 items-center mb-3 opacity-60 hover:opacity-100 cursor-pointer dark:text-white"
              onClick={() => setStage(1)}
            >
              <ChevronLeft />
              <p>back</p>
            </div> */}
      <h1 className="text-2xl font-semibold mb-2 dark:text-white">
        Email Verification
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        We have sent a code to your email address to confirm it&rsquo;s yours
      </p>

      <p className="text-blue-600 mb-6 font-bold">{email}</p>

      <form onSubmit={handleVerificationSubmit}>
        <div className={`flex gap-2 ${className}`}>
          {Array.from({ length }).map((_, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={verificationCode[idx] || ""}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center dark:text-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
              disabled={disabled}
            />
          ))}
        </div>
        <CButton
          isLoading={isLoading}
          disabled={isLoading}
          type="submit"
          className="mt-6"
        >
          Continue
        </CButton>
        <div className="text-center mt-2">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResendDisabled}
            className={`text-sm ${
              isResendDisabled
                ? "text-gray-400"
                : "text-blue-600 hover:underline"
            }`}
          >
            Resend code {isResendDisabled && `${resendTimer}s`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OtpInput;
