"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/input";
import CButton from "@/components/ui/Cbutton";
import useAuthStore from "@/lib/stores/auth.store";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth.schema";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { resetPassword } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { 
      token: token,
      password: "" 
    },
    mode: "onChange",
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Invalid reset link", {
        description: "The password reset link is invalid or has expired.",
      });
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(token, data.password);
      
      toast.success("Password reset successful!", {
        description: "You can now sign in with your new password.",
      });
      
      setIsSuccess(true);
    } catch (error) {
      toast.error("Password reset failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
          Password Reset Successful!
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Your password has been reset successfully. You can now sign in with your new password.
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

  if (!token) {
    return (
      <div className="w-full mx-auto p-6">
        <div
          className="flex gap-2 items-center mb-3 opacity-60 hover:opacity-100 cursor-pointer w-fit"
          onClick={() => router.push("/auth/forgot-password")}
        >
          <ChevronLeft />
          <p>back</p>
        </div>
        
        <h1 className="text-2xl font-semibold mb-2">Invalid Reset Link</h1>
        <p className="text-gray-600 mb-6">
          The password reset link is invalid or has expired. Please request a new one.
        </p>

        <Link
          href="/auth/forgot-password"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center block"
        >
          Request New Link
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
      
      <h1 className="text-2xl font-semibold mb-2">Reset Your Password</h1>
      <p className="text-gray-600 mb-6">
        Enter a new password for your account
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              label="New Password"
              placeholder="Enter new password"
              type="password"
              error={errors.password?.message}
              disabled={isLoading}
              {...field}
            />
          )}
        />

        <CButton 
          type="submit"
          disabled={isLoading || !isValid}
          isLoading={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </CButton>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/auth/signin"
          className="text-blue-600 hover:underline text-sm"
        >
          Remember your password? Sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
