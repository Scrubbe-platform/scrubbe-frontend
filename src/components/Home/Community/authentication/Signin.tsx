"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useAuthStore from "@/lib/stores/auth.store";
import Input from "@/components/ui/input";
import CButton from "@/components/ui/Cbutton";
import Modal from "@/components/ui/Modal";
import { useCommunityAuth } from "@/lib/stores/useCommunityAuth";

const IS_STANDALONE = process.env.NEXT_PUBLIC_IS_STANDALONE === "true";

// Define the form schema using zod
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// TypeScript type based on the schema
type LoginFormData = z.infer<typeof loginSchema>;

export default function SignIn() {
  const [rememberMe, setRememberMe] = useState(false);
  const { isLoading } = useAuthStore();
  const { modalType, open, setOpen, setClose } = useCommunityAuth();

  // Keep the form handling structure closer to the original
  // even though we're simplifying functionality
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log(data);

      // Reset loading state
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal isOpen={open && modalType === "signin"} onClose={setClose}>
      <div className="w-full p-6">
        <h1 className=" text-xl md:text-2xl dark:text-white font-semibold mb-6">
          Sign in to Scrubbe
        </h1>

        <form onSubmit={handleSubmit(onSubmit)}>
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

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                  isLoading ? "opacity-80 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>
            <div
              onClick={() => setOpen(true, "forgot-password")}
              className="text-sm text-blue-600 hover:underline cursor-pointer"
            >
              Forgot password?
            </div>
          </div>

          <CButton
            onClick={() => {}}
            type="submit"
            disabled={isLoading || !isValid}
          >
            {isLoading ? " Signing in..." : "Sign in"}
          </CButton>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            New User?{" "}
            <div
              onClick={() => setOpen(true, "signup")}
              className={`${
                IS_STANDALONE ? "text-IMSLightGreen" : "text-blue-600"
              } underline hover:underline inline-flex items-center`}
            >
              Create an Account
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
