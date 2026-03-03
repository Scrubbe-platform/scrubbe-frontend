"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useAuthStore from "@/lib/stores/auth.store";
import Input from "@/components/ui/input";
import CButton from "@/components/ui/Cbutton";
import { useRouter } from "next/navigation";

// Define the form schema using zod
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// TypeScript type based on the schema
type LoginFormData = z.infer<typeof loginSchema>;

export default function Page() {
  const [rememberMe, setRememberMe] = useState(false);
  const { isLoading } = useAuthStore();
  const router = useRouter();

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
    <div className=" flex justify-center items-center min-h-screen bg-neutral-50">
      <div className="w-full p-6 max-w-lg bg-white border rounded-lg">
        <h1 className=" text-xl md:text-2xl dark:text-white font-semibold mb-6">
          Log in to Admin Dashboard
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
              onClick={() => router.push("/admin-auth/forgot-password")}
              className="text-sm text-IMSLightGreen hover:underline cursor-pointer"
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
        </form>
      </div>
    </div>
  );
}
