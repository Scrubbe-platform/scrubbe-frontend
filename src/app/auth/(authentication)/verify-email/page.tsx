"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
 import CButton from "@/components/ui/Cbutton";
import useAuthStore from "@/lib/stores/auth.store";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const userId = searchParams.get("userId") || "";
  
  const [verificationCode, setVerificationCode] = useState<string[]>(Array(6).fill(""));
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [isResendDisabled, setIsResendDisabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  const { verifyEmail, resendOTP } = useAuthStore();

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (resendTimer > 0 && isResendDisabled) {
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
  }, [resendTimer, isResendDisabled]);

  const handleVerify = async () => {
    const code = verificationCode.join("");
    
    if (code.length !== 6) {
      toast.error("Invalid code", {
        description: "Please enter the complete 6-digit code.",
      });
      return;
    }

    if (!userId) {
      toast.error("Missing user ID", {
        description: "Unable to verify email. Please try signing up again.",
      });
      return;
    }

    try {
      setIsLoading(true);
      await verifyEmail(code);
      
      toast.success("Email verified successfully!", {
        description: "You can now sign in to your account.",
      });
      
      setIsVerified(true);
    } catch (error) {
      toast.error("Verification failed", {
        description: error instanceof Error ? error.message : "Invalid or expired code.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (isResendDisabled || !userId) return;

    try {
      setIsLoading(true);
      await resendOTP();
      
      // Reset timer
      setResendTimer(60);
      setIsResendDisabled(true);
      setVerificationCode(Array(6).fill(""));
      
      toast.success("Code resent!", {
        description: "A new verification code has been sent to your email.",
      });
    } catch (error) {
      toast.error("Failed to resend code", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="w-full mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <div className="mb-8">
          <div className="relative flex items-center justify-center">
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="100" cy="100" r="95" fill="#E6F3FF" opacity="0.4" />
              <circle cx="100" cy="100" r="75" fill="#CCE7FF" opacity="0.6" />
              <circle cx="100" cy="100" r="55" fill="#99D6FF" opacity="0.8" />
              <circle cx="100" cy="100" r="35" fill="#2563EB" />
              <path
                d="M85 100L95 110L115 90"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Email Verified!
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Your email has been successfully verified. You can now sign in to your account.
        </p>

        <Link
          href="/auth/signin"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-6">
      <div
        className="flex gap-2 items-center mb-3 opacity-60 hover:opacity-100 cursor-pointer w-fit"
        onClick={() => router.back()}
      >
        <ChevronLeft />
        <p>back</p>
      </div>
      
      <h1 className="text-2xl font-semibold mb-2">Verify Your Email</h1>
      <p className="text-gray-600 mb-4">
        We have sent a verification code to your email address
      </p>

      {email && (
        <p className="text-blue-600 mb-6 font-bold">{email}</p>
      )}

      <div className="flex gap-2 mb-6 justify-center">
        {/* <OtpInput
          value={verificationCode}
          onChange={setVerificationCode}
          disabled={isLoading}
        /> */}
      </div>

      <CButton 
        onClick={handleVerify} 
        disabled={isLoading || verificationCode.some(digit => !digit)}
        isLoading={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify Email"
        )}
      </CButton>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={isResendDisabled || isLoading || !userId}
          className={`text-sm ${
            isResendDisabled || !userId
              ? "text-gray-400"
              : "text-blue-600 hover:underline"
          }`}
        >
          {isResendDisabled 
            ? `Resend code in ${resendTimer}s` 
            : "Resend code"
          }
        </button>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/auth/signin"
          className="text-blue-600 hover:underline text-sm"
        >
          Already verified? Sign in
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="w-full mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
