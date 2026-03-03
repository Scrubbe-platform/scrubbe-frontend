"use client";
import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const developerSchema = z.object({
  fullName: z.string().min(1, "full name is required"),
  email: z.string().email().min(1, "email is required"),
  company: z.string().min(1, "company is required"),
  useCase: z.string().min(1, "use case is required"),
  role: z.string().min(1, "role is required"),
  projectDescription: z.string().min(1, "projectDescription is required"),
});

type DeveloperFormData = z.infer<typeof developerSchema>;

const roleOption = [
  "Finance",
  "Healthcare",
  "Technology",
  "Manufacturing",
  "Retail",
  "Education",
  "Government",
  "Energy",
  "Transportation",
  "Other",
];
const DeveloperSetup = () => {
  const {
    handleSubmit,
    formState: { errors: formErrors },
    control,
  } = useForm<DeveloperFormData>({
    resolver: zodResolver(developerSchema),
  });

  const onSubmit = (value: DeveloperFormData) => {
    console.log(value);
  };
  return (
    <section className="w-full min-h-screen bg-[#F9FAFB]">
      {/* Skip Button */}
      <div className="flex justify-end  w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link href="/data-sources">
          <button
            type="button"
            className="px-4 py-2 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-[16px] font-medium flex items-center space-x-2"
          >
            <span>Skip</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </Link>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="h-full max-w-[1440px] w-full mx-auto flex flex-col px-4 sm:px-6 lg:px-8"
      >
        <h1 className="font-bold text-center text-[22px] sm:text-[24px] lg:text-[28px] xl:text-[30px] leading-[130%] tracking-[1%] text-[#1F2937] mx-auto py-6 md:py-8 lg:py-10">
          Welcome to Scrubbe&apos;s enterprise developer environment. Access our
          comprehensive suite of APIs for device fingerprinting, authentication,
          and behavioral analysis with industry-leading security and reliability
        </h1>

        <article className="w-full mx-auto">
          <div className="bg-white p-6">
            <h2 className="text-[24px] font-semibold text-gray-900 ">
              Developer Profile
            </h2>

            <p className="mb-5 mt-2">
              Complete your developer profile to unlock personalized features
              and receive tailored recommendations for your integration needs.
            </p>
            <div className=" grid grid-cols-1 md:grid-cols-2 gap-5">
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    className="dark:!text-black"
                    labelClassName="dark:!text-black"
                    error={formErrors?.fullName?.message}
                    //   isLoading={isSubmitting}
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
                    placeholder="johndoe@gmail.com"
                    className="dark:!text-black"
                    labelClassName="dark:!text-black"
                    error={formErrors?.email?.message}
                    //   isLoading={isSubmitting}
                    {...field}
                  />
                )}
              />
              <Controller
                name="company"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Campany"
                    placeholder="company name"
                    className="dark:!text-black"
                    labelClassName="dark:!text-black"
                    error={formErrors?.email?.message}
                    //   isLoading={isSubmitting}
                    {...field}
                  />
                )}
              />

              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Role"
                    className="dark:!text-black"
                    labelClassName="dark:!text-black"
                    options={[
                      { value: "", label: "Select Role" },
                      ...roleOption.map((option) => ({
                        value: option,
                        label: option,
                      })),
                    ]}
                    error={formErrors.role?.message}
                    {...field}
                  />
                )}
              />
            </div>

            <Controller
              name="useCase"
              control={control}
              render={({ field }) => (
                <Select
                  label="Role"
                  className="dark:!text-black"
                  labelClassName="dark:!text-black"
                  options={[
                    { value: "", label: "Select primary use case" },
                    ...roleOption.map((option) => ({
                      value: option,
                      label: option,
                    })),
                  ]}
                  error={formErrors.role?.message}
                  {...field}
                />
              )}
            />

            <div className="space-y-2">
              <p className="font-medium text-sm ">Project Description</p>
              <textarea
                rows={4}
                placeholder="Describre your project"
                className="w-full bg-transparent border border-gray-300 rounded-md p-2 text-sm "
              />
            </div>

            <CButton type="submit" className=" w-fit float-end md:w-[30%] mt-5">
              Submit
            </CButton>
          </div>
        </article>
      </form>
    </section>
  );
};

export default DeveloperSetup;
