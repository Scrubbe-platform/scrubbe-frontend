/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import type React from "react";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
// import OtpInput from "../ui/OtpInput";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import { FaEnvelope } from "react-icons/fa";
import { PasswordInput } from "@/components/ui/password-input";
import Input from "@/components/ui/input";
import CButton from "@/components/ui/Cbutton";

export default function Page() {
  const [stage, setStage] = useState<number>(1);
  const [email, setEmail] = useState<string>("");
  const { post } = useFetch();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const router = useRouter();
  // Add zod schema for password reset
  const passwordSchema = z
    .object({
      password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
      confirmPassword: z
        .string()
        .min(6, { message: "Confirm password must be at least 6 characters" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  type PasswordFormData = z.infer<typeof passwordSchema>;

  const {
    control: passwordControl,
    handleSubmit: handlePasswordFormSubmit,
    formState: { errors: passwordErrors },
    watch,
    setValue,
    reset: resetPasswordForm,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Handle timer for resend code
  // useEffect(() => {
  //   let interval: NodeJS.Timeout;

  //   if (stage === 2 && resendTimer > 0) {
  //     interval = setInterval(() => {
  //       setResendTimer((prev) => prev - 1);
  //     }, 1000);
  //   }

  //   if (resendTimer === 0) {
  //     setIsResendDisabled(false);
  //   }

  //   return () => {
  //     if (interval) clearInterval(interval);
  //   };
  // }, [stage, resendTimer]);

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setLoading(true);
      const res = await post(endpoint.auth.forgot_password, { email });
      setLoading(false);
      if (res.success) {
        setStage(2);
        toast.success(res.data.message);
      } else {
        toast.error("Something went wrong, Try again!");
      }
    }
  };

  // Handle verification code input

  // Handle verification code submission
  // const handleVerificationSubmit = (value: string) => {
  //   console.log(value);
  //   setStage(3);
  // };

  // Handle password creation
  const handlePasswordSubmit = async (value: PasswordFormData) => {
    setLoading(true);
    const res = await post(endpoint.auth.reset_password, {
      token,
      password: value.password,
    });
    setLoading(false);
    if (res.success) {
      resetPasswordForm();
      setStage(4);
    }
  };

  useEffect(() => {
    const validateToken = async () => {
      const res = await post(endpoint.auth.valid_token, { token });
      console.log({ res });
      if (res.success) {
        if (!res.data.valid) {
          toast.error("Invalid or Expired token");
          setStage(1);
          return;
        }
        return;
      }
      toast.error("Invalid or Expired token");
      setStage(1);
    };
    if (token) {
      setStage(3);
      validateToken();
    }
  }, [token]);

  // Handle resend code
  // const handleResendCode = () => {};

  // Render different stages
  const renderStage = () => {
    switch (stage) {
      case 1:
        return (
          <div className="w-full mx-auto">
            <h1 className="text-xl font-semibold dark:text-white">
              Forgot Password?
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-base my-3">
              Put your email address to get started
            </p>

            <form onSubmit={handleEmailSubmit}>
              <Input
                label="Email"
                placeholder="Enter email"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                required
              />

              <CButton isLoading={loading} type="submit" disabled={!email}>
                Submit
              </CButton>
            </form>
          </div>
        );

      case 2:
        return (
          <div className="w-full  mx-auto">
            <div
              className=" flex gap-2 text-sm items-center mb-3 opacity-60 hover:opacity-100 cursor-pointer dark:text-white"
              onClick={() => setStage(1)}
            >
              <ChevronLeft />
              <p>back</p>
            </div>
            <div className="mx-auto flex justify-center w-full">
              <div className=" bg-blue-50 rounded-full size-16 flex justify-center items-center text-blue-600 ring-4 ring-blue-100/15">
                <FaEnvelope size={35} />
              </div>
            </div>
            <h1 className="text-2xl font-semibold mb-2 dark:text-white text-center">
              Check your Email
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-center text-sm">
              We have sent a password reset link to this email -{" "}
              <span className=" text-blue-600 font-bold">{email} </span>
              <br />
              If your email is registered, you will receive a password reset
              link
            </p>
          </div>
        );

      case 3:
        return (
          <div className="w-full  mx-auto">
            <h1 className="text-xl font-semibold mb-2 dark:text-white">
              Create New Password
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-base">
              Enter a password you will remember
            </p>

            <form onSubmit={handlePasswordFormSubmit(handlePasswordSubmit)}>
              <PasswordInput
                label="Password"
                // {...field}
                value={watch("password")}
                onValueChange={(value) => setValue("password", value)}
                onValidationChange={setIsPasswordValid}
                error={!isPasswordValid ? "complete all requirement" : ""}
              />
              <Controller
                name="confirmPassword"
                control={passwordControl}
                render={({ field }) => (
                  <Input
                    label="Confirm Password"
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    type="password"
                    error={passwordErrors.confirmPassword?.message}
                    {...field}
                  />
                )}
              />
              <CButton
                type="submit"
                isLoading={loading}
                className="w-full bg-IMSLightGreen text-white py-3 px-4 rounded-md hover:bg-IMSDarkGreen transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create Password
              </CButton>
            </form>
          </div>
        );

      case 4:
        return (
          <div className="w-full  mx-auto flex flex-col items-center justify-center">
            <div className="mb-5">
              <div className="relative flex items-center justify-center scale-85">
                {/* <div className="size-[100px] bg-blue-300 rounded-full absolute z-10" /> */}
                <div className="size-[90px] bg-blue-200/70 rounded-full absolute z-10" />
                <div className="size-[110px] bg-blue-100/50 rounded-full absolute z-10" />
                <div className="size-[130px] bg-blue-100/30 rounded-full absolute z-10" />
                <div className="flex items-center size-[80px] rounded-full justify-center bg-blue-700 z-20">
                  <img src={"/check.svg"} alt="" />
                </div>
              </div>
            </div>

            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Successful
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-center mb-5 text-sm">
              Your password has been reseted successfully
            </p>

            <Link
              href="/auth/signin"
              className="w-full bg-IMSLightGreen text-white py-2 px-4 text-sm font-semibold rounded-md hover:bg-IMSDarkGreen transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center"
            >
              Back to log in
            </Link>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className=" flex justify-center items-center min-h-screen bg-neutral-50">
      <div className="w-full p-6 max-w-lg bg-white border rounded-lg">
        {renderStage()}

        <div
          onClick={() => router.push("/admin-auth/signin")}
          className=" text-sm text-IMSLightGreen text-center font-medium pt-3 cursor-pointer"
        >
          Back to Login
        </div>
      </div>
    </div>
  );
}
