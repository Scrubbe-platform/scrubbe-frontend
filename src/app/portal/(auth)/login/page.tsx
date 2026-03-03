"use client";
import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { COOKIE_KEYS } from "@/lib/constant";
import { zodResolver } from "@hookform/resolvers/zod";
import { setCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// TypeScript type based on the schema
type SignupFormData = z.infer<typeof signupSchema>;

const Page = () => {
  const [loading, setLoading] = useState(false);
  const { post } = useFetch();
  const router = useRouter();
  const {
    handleSubmit,
    formState: { errors, isValid },
    control,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });
  const handleSubmitForm = async (data: SignupFormData) => {
    setLoading(true);
    const res = await post(endpoint.portal.login, data);
    console.log(res);
    setLoading(false);
    if (res.success) {
      const token = res.data.data.token;
      setCookie(COOKIE_KEYS.TOKEN, token);
      router.push("/portal/dashboard");
      toast.success("Login successful");
    } else {
      toast.error(res.data ?? "Login failed");
    }
  };
  return (
    <div className=" flex justify-center items-center h-full w-full">
      <div className=" max-w-2xl w-full p-4 px-6 rounded-lg bg-white">
        <p className=" text-2xl text-center font-bold">
          Sign in to Customer Portal{" "}
        </p>
        <form
          onSubmit={handleSubmit(handleSubmitForm)}
          className="flex flex-col mt-4"
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                label="Email"
                placeholder="Enter Email"
                type="email"
                error={errors.email?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                label="Password"
                placeholder="Password"
                type="password"
                error={errors.password?.message}
                {...field}
              />
            )}
          />

          <CButton
            type="submit"
            disabled={loading || !isValid}
            isLoading={loading}
          >
            Create Account
          </CButton>

          <div className="text-center mt-3">
            New User?{" "}
            <Link
              href="/portal/register"
              className={`text-IMSLightGreen underline hover:underline inline-flex items-center text-base`}
            >
              Create an Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;
