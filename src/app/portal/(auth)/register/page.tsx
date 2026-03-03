"use client";
import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import Select from "@/components/ui/select";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { COOKIE_KEYS } from "@/lib/constant";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { setCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const signupSchema = z
  .object({
    fullName: z.string().min(1, { message: "Full name is required" }),
    companyName: z.string().min(1, { message: "company name is required" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    companyUserId: z.string().nonempty({ message: "Select Company " }),
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

const Page = () => {
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const { get, post } = useFetch();
  const router = useRouter();
  const {
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    control,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });
  const handleSubmitForm = async (data: SignupFormData) => {
    setLoading(true);
    const res = await post(endpoint.portal.register, data);
    setLoading(false);
    if (res.success) {
      const token = res.data.data.token;
      setCookie(COOKIE_KEYS.TOKEN, token);
      router.push("/portal/dashboard");
      toast.success("Registration successful");
    } else {
      toast.error(res.data ?? "Registration failed");
    }
  };
  const { data } = useQuery<
    { business: { name: string }; id: string; name: string }[]
  >({
    queryKey: ["BUSINESS"],
    queryFn: async () => {
      const data = await get(endpoint.portal.get_companies);
      console.log(data);
      return data?.data.data;
    },
  });

  const item =
    data
      ?.filter((value) => value.id)
      .map((value) => ({ label: value.name, value: value.id })) ?? [];
  return (
    <div className=" flex justify-center items-center h-full w-full">
      <div className=" max-w-2xl w-full p-4 px-6 rounded-lg bg-white">
        <p className=" text-2xl text-center font-bold">
          Customer Portal Registration
        </p>
        <form
          onSubmit={handleSubmit(handleSubmitForm)}
          className="flex flex-col mt-4"
        >
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <Input
                label="Full Name"
                placeholder="john doe"
                error={errors.email?.message}
                {...field}
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
                type="email"
                error={errors.email?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="companyName"
            control={control}
            render={({ field }) => (
              <Input
                label="Company Name"
                placeholder="Enter company name"
                error={errors.companyName?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="companyUserId"
            control={control}
            render={({ field }) => (
              <Select
                label="Company"
                options={[{ label: "Select Company", value: "" }].concat(item)}
                error={errors.companyUserId?.message}
                {...field}
              />
            )}
          />

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
            control={control}
            render={({ field }) => (
              <Input
                label="Confirm Password"
                placeholder="Confirm Password"
                type="password"
                error={errors.confirmPassword?.message}
                {...field}
              />
            )}
          />

          <CButton
            type="submit"
            disabled={loading || !isValid || !isPasswordValid}
            isLoading={loading}
          >
            Create Account
          </CButton>

          <div className="text-center mt-3">
            Already have an account?{" "}
            <Link
              href="/portal/login"
              className={`text-IMSLightGreen underline hover:underline inline-flex items-center text-base`}
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;
