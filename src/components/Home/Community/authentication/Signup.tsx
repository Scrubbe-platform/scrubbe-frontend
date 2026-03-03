"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useAuthStore from "@/lib/stores/auth.store";
import Input from "@/components/ui/input";
import CButton from "@/components/ui/Cbutton";
import Modal from "@/components/ui/Modal";
import { useCommunityAuth } from "@/lib/stores/useCommunityAuth";
import { Suspense, useState } from "react";
import { BiCheck } from "react-icons/bi";
import OtpInput from "@/components/ui/OtpInput";
import { toast } from "sonner";

const IS_STANDALONE = process.env.NEXT_PUBLIC_IS_STANDALONE === "true";

// Define the form schema using zod
const signupSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    fullName: z.string().email({ message: "Please enter your full name" }),
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

// TypeScript type based on the schema
type SignupFormData = z.infer<typeof signupSchema>;

export default function SignUp() {
  const { isLoading } = useAuthStore();
  const { modalType, open, setOpen, setClose } = useCommunityAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOTP, setIsOTP] = useState(false);

  // Keep the form handling structure closer to the original
  // even though we're simplifying functionality
  const {
    control,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      console.log(data);
      setIsOTP(true);
      // Reset loading state
    } catch (error) {
      console.log(error);
    }
  };

  const handleVerifyOTP = async (code: string) => {
    try {
      if (code.length != 6) {
        toast.error("Incorrect OTP code");
        return;
      }
      setRefreshing(true);
      //   await verifyEmail(code);
      setRefreshing(false);
      toast.success("Email verified successfully");
      setShowSuccess(true);
    } catch (_) {
      console.log(_);
    }
  };

  const handleResendOTP = async () => {
    try {
      setRefreshing(true);
      //   await resendOTP();
      setRefreshing(false);
      toast.success("OTP sent successfully");
    } catch (_) {
      console.log(_);
      //   toast.error(JSON.stringify(error));
    }
  };

  const VerifyAccount = async () => {
    return (
      <div>
        <OtpInput
          email={watch("email") ?? ""}
          handleResend={handleResendOTP}
          onSubmit={handleVerifyOTP}
          isLoading={refreshing}
        />
      </div>
    );
  };

  const SuccessPage = ({ fullname }: { fullname: string }) => {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <div className="w-full p-6 flex flex-col items-center justify-center min-h-96">
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
            Welcome {fullname}! You have successfully created an account.
          </p>
        </div>
      </Suspense>
    );
  };

  return (
    <Modal isOpen={open && modalType === "signup"} onClose={setClose}>
      {showSuccess && <SuccessPage fullname={watch("fullName") || ""} />}
      {!showSuccess && (
        <>
          {isOTP ? (
            <VerifyAccount />
          ) : (
            <div className="w-full">
              <h1 className=" text-xl md:text-2xl dark:text-white font-semibold mb-6">
                Sign up to Scrubbe Community
              </h1>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Full Name"
                      placeholder="Enter full name"
                      {...field}
                      error={errors.fullName?.message}
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Email"
                      placeholder="Enter Email"
                      {...field}
                      error={errors.email?.message}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Password"
                      placeholder="Enter Password"
                      {...field}
                      type="password"
                      error={errors.password?.message}
                    />
                  )}
                />
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Confirm Password"
                      placeholder="Enter Password"
                      {...field}
                      type="password"
                      error={errors.confirmPassword?.message}
                    />
                  )}
                />
                <br />
                <CButton
                  onClick={() => {}}
                  type="submit"
                  disabled={isLoading || !isValid}
                >
                  {isLoading ? " Signing in..." : "Sign in"}
                </CButton>

                <div className="text-center mt-4">
                  Already have an account?{" "}
                  <div
                    onClick={() => setOpen(true, "signin")}
                    className={`${
                      IS_STANDALONE ? "text-IMSLightGreen" : "text-blue-600"
                    } underline hover:underline inline-flex items-center cursor-pointer`}
                  >
                    Sign in
                  </div>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
