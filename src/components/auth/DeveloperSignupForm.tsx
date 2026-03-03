"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import * as z from "zod";
import Input from "../ui/input";
import { Controller } from "react-hook-form";
import CButton from "../ui/Cbutton";
import Select from "../ui/select";
import useAuthStore from "@/lib/stores/auth.store";
import { signIn, signOut, useSession } from "next-auth/react";
import CompleteDeveloperProfile, {
  DeveloperProfileSignupFormData,
} from "./CompleteDeveloperProfile";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import OtpInput from "../ui/OtpInput";
import { PasswordInput } from "../ui/password-input";
import { AxiosError } from "axios";
import { BiCheck } from "react-icons/bi";

// Define the form schema using zod
export const developerSignupSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    githubUsername: z.string().optional(),
    experience: z
      .string()
      .min(1, { message: "Please select experience level" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(100, { message: "Password must be less than 100 characters" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string().min(1, { message: "Confirm password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// TypeScript type based on the schema
type DeveloperSignupFormData = z.infer<typeof developerSignupSchema>;

// Success Page Component Props Type
interface SuccessPageProps {
  firstName: string;
  lastName: string;
}

export default function DeveloperSignupForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] =
    useState<Partial<DeveloperSignupFormData> | null>(null);
  const {
    developerSignup,
    isLoading,
    developerProfileSignup,
    resendOTP,
    verifyEmail,
  } = useAuthStore();

  const session = useSession();
  const [profileComplete, setProfileComplete] = useState(false);
  const searchParams = useSearchParams();
  const path = searchParams.get("to");
  const inviteEmail = searchParams.get("email");
  const invite = searchParams.get("invite");
  const isInvite = Boolean(invite);

  const router = useRouter();
  const [isOTP, setIsOTP] = useState(false);
  // const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const {
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    control,
  } = useForm<DeveloperSignupFormData>({
    resolver: zodResolver(developerSignupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      githubUsername: "",
      experience: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: DeveloperSignupFormData) => {
    try {
      // Log form values
      console.log(data, " developer registration");

      // Simulate a 5-second delay
      await developerSignup(data);
      // Store form data and show success page
      setFormData(data);
      setIsOTP(true);
    } catch (error) {
      toast.error("Registration failed", {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : "Signup failed",
      });
    }
  };

  const onProfileSubmit = async (data: DeveloperProfileSignupFormData) => {
    try {
      console.log(data, " business registration");
      // Simulate a 5-second delay
      const details = {
        ...data,
        ...session.data?.user,
      };
      await developerProfileSignup(details);

      // Store form data and show success page
      setFormData({ ...data, ...session.data?.user });
      await signOut({ redirect: false });
      setShowSuccess(true);

      // Reset loading state
    } catch (error) {
      toast.error("Registration failed", {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : "Signup failed",
      });
    }
  };

  useEffect(() => {
    if (session.status == "authenticated" && !profileComplete) {
      setProfileComplete(true);
    }
  }, [session.status, profileComplete]);

  useEffect(() => {
    if (showSuccess) {
      const timeout = setTimeout(() => {
        if (path) {
          router.push(`/auth/developer-setup?=${path}`);
        } else {
          router.push(`/auth/developer-setup`);
        }
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [showSuccess, router, path]);

  useEffect(() => {
    if (invite && inviteEmail) {
      setValue("email", inviteEmail);
    }
  }, [invite, inviteEmail, setValue]);
  // Success Page Component
  const SuccessPage = ({ firstName, lastName }: SuccessPageProps) => {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <div className="w-full p-6 flex flex-col items-center justify-center min-h-96">
          {session.status == "loading" && (
            <div className=" absolute inset-0 bg-black/20 z-50 flex justify-center pt-[20%]">
              <Loader2 className=" animate-spin text-primary-500" size={30} />
            </div>
          )}
          <div className="mb-8">
            {/* Enhanced Success Icon with concentric circles */}
            <div className="relative flex items-center justify-center translate-y-[-50px]">
              <div className=" size-[150px] rounded-full bg-emerald-100 absolute animate-ping" />
              <div className=" size-[130px] rounded-full bg-emerald-200 absolute" />
              <div className=" size-[110px] rounded-full bg-emerald-300 absolute" />
              <div className=" size-[90px] rounded-full bg-emerald-500 absolute" />
              <BiCheck className=" absolute text-white" size={40} />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Successful
          </h1>

          <p className="text-gray-600 dark:text-gray-300 text-center">
            Welcome {firstName} {lastName}! You have successfully created an
            account.
          </p>
        </div>
      </Suspense>
    );
  };

  const handleVerifyOTP = async (code: string) => {
    try {
      if (code.length != 6) {
        toast.error("Incorrect OTP code");
        return;
      }
      await verifyEmail(code);
      toast.success("Email verified successfully");
      setShowSuccess(true);
    } catch (error) {
      toast.error("Verification failed", {
        description:
          error instanceof AxiosError
            ? error.response?.data?.message
            : "verification failed",
      });
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP();
      toast.success("OTP sent successfully");
    } catch (error) {
      toast.error(
        error instanceof AxiosError ? error.response?.data?.message : "failed"
      );
    }
  };
  const VerifyAccount = () => {
    return (
      <div>
        <OtpInput
          email={formData?.email ?? ""}
          handleResend={handleResendOTP}
          onSubmit={handleVerifyOTP}
        />
      </div>
    );
  };
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full p-6">
        {showSuccess && formData && (
          <SuccessPage
            firstName={formData.firstName ?? ""}
            lastName={formData.lastName ?? ""}
          />
        )}
        <>
          {profileComplete && !showSuccess && (
            <>
              <h1 className="text-xl md:text-2xl dark:text-white font-semibold mb-2 ">
                Complete Your Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Just a few more details to get started
              </p>

              <CompleteDeveloperProfile
                onSubmit={onProfileSubmit}
                isLoading={isLoading}
              />
            </>
          )}

          {!profileComplete && !showSuccess && (
            <>
              {isOTP ? (
                <VerifyAccount />
              ) : (
                <>
                  <h1 className=" text-xl md:text-2xl font-semibold mb-6 dark:text-white">
                    Developer Signup
                  </h1>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    {/* First Name and Last Name Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="First Name"
                            placeholder="First Name"
                            error={errors.firstName?.message}
                            isLoading={isLoading}
                            {...field}
                          />
                        )}
                      />
                      <Controller
                        name="lastName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Last Name"
                            placeholder="Last Name"
                            error={errors.lastName?.message}
                            isLoading={isLoading}
                            {...field}
                          />
                        )}
                      />
                    </div>

                    {/* Email and GitHub Username Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Email"
                            placeholder="Enter Email"
                            type="email"
                            error={errors.email?.message}
                            isLoading={isLoading}
                            {...field}
                          />
                        )}
                      />
                      <Controller
                        name="githubUsername"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="GitHub Username (Optional)"
                            placeholder="Enter username"
                            error={errors.githubUsername?.message}
                            isLoading={isLoading}
                            {...field}
                          />
                        )}
                      />
                    </div>

                    {/* Experience Level Full Row */}
                    <div className="mb-4">
                      <Controller
                        name="experience"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Experience Level"
                            {...field}
                            id="experience"
                            options={[
                              { label: "Beginner", value: "beginner" },
                              { label: "Intermediate", value: "intermediate" },
                              { label: "Advanced", value: "advanced" },
                              { label: "Expert", value: "expert" },
                            ]}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isLoading
                                ? "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"
                                : "border-gray-300"
                            }`}
                            disabled={isLoading}
                          />
                        )}
                      />
                      {errors.experience && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.experience.message}
                        </p>
                      )}
                    </div>

                    {/* Password Fields Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {/* <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                          
                          <Input
                            label="Create Password"
                            placeholder="Enter password"
                            type="password"
                            error={errors.password?.message}
                            isLoading={isLoading}
                            {...field}
                          />
                        )}
                      /> */}
                      <PasswordInput
                        label="Password"
                        // {...field}
                        value={watch("password")}
                        onValueChange={(value) => setValue("password", value)}
                        onValidationChange={setIsPasswordValid}
                        error={
                          !isPasswordValid ? "complete all requirement" : ""
                        }
                      />
                      <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                          <Input
                            label="Confirm Password"
                            placeholder="Confirm Password"
                            type="password"
                            error={errors.confirmPassword?.message}
                            isLoading={isLoading}
                            {...field}
                          />
                        )}
                      />
                    </div>

                    {/* Submit Button */}
                    <CButton
                      type="submit"
                      disabled={isLoading || !isValid || !isPasswordValid}
                      isLoading={isLoading}
                    >
                      {isLoading ? "  Processing..." : "Create Account"}
                    </CButton>

                    {/* Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">OR</span>
                      </div>
                    </div>

                    {/* OAuth Buttons */}
                    {isInvite ? null : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6 ">
                        <button
                          type="button"
                          className="w-full flex gap-3 items-center justify-center px-3 py-1 border border-gray-300 rounded-md  transition-colors"
                          onClick={() => signIn("google")}
                        >
                          <div>
                            <FcGoogle size={33} />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-white">
                            Google
                          </span>
                        </button>
                        <button
                          type="button"
                          className="w-full gap-3 group flex items-center justify-center px-3 py-1 border border-gray-300 rounded-md   transition-colors"
                          onClick={() =>
                            signIn("github", {
                              // callbackUrl: "/auth/account-setup",
                            })
                          }
                        >
                          <div>
                            <FaGithub size={33} className=" dark:text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-white">
                            GitHub
                          </span>
                        </button>

                        <button
                          type="button"
                          className="w-full flex items-center justify-center px-3 py-1 border border-gray-300 rounded-md transition-colors"
                          onClick={() =>
                            signIn("gitlab", {
                              // callbackUrl: "/auth/account-setup",
                            })
                          }
                        >
                          <Image
                            src="/icon-auth-gitlab.svg"
                            alt="GitLab"
                            width={38}
                            height={38}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-white">
                            GitLab
                          </span>
                        </button>

                        <button
                          type="button"
                          className="w-full flex items-center justify-center px-3 py-1 border border-gray-300 rounded-md transition-colors"
                        >
                          <Image
                            src="/icon-auth-aws.svg"
                            alt="AWS"
                            width={38}
                            height={38}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-white">
                            AWS
                          </span>
                        </button>

                        <button
                          type="button"
                          className="w-full flex items-center justify-center px-3 py-1 border border-gray-300 rounded-md transition-colors"
                          onClick={() =>
                            signIn("microsoft-entra-id", {
                              // callbackUrl: "/auth/account-setup",
                            })
                          }
                        >
                          <Image
                            src="/icon-auth-azure.svg"
                            alt="Azure"
                            width={38}
                            height={38}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-white">
                            Azure
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Demo Page Link */}
                    <div className="text-center">
                      <Link
                        href="/auth/demo-page"
                        className="text-blue-600 hover:underline inline-flex items-center"
                      >
                        Looking for our demo page?
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </Link>
                    </div>
                  </form>
                </>
              )}
            </>
          )}
        </>
      </div>
    </Suspense>
  );
}
