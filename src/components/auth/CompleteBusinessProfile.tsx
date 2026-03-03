import React from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "../ui/select";
import CButton from "../ui/Cbutton";
import Input from "../ui/input";
import { signOut } from "next-auth/react";

export const businessProfileSignupSchema = z.object({
  businessAddress: z
    .string()
    .min(1, { message: "Business address is required" }),
  companySize: z.string().min(1, { message: "Please select company size" }),
  // purpose: z.string().min(1, { message: "Please select a purpose" }),
});

export type BusinessProfileSignupFormData = z.infer<
  typeof businessProfileSignupSchema
>;

interface CompleteBusinessProfileProps {
  onSubmit: (data: BusinessProfileSignupFormData) => void;
  isLoading: boolean;
}

const CompleteBusinessProfile = ({
  onSubmit,
  isLoading,
}: CompleteBusinessProfileProps) => {
  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<BusinessProfileSignupFormData>({
    resolver: zodResolver(businessProfileSignupSchema),
    defaultValues: {
      businessAddress: "",
      companySize: "",
      // purpose: "",
    },
    mode: "onChange",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Company Size and Purpose Row */}
      <Controller
        name="businessAddress"
        control={control}
        render={({ field }) => (
          <Input
            label="Business Address"
            placeholder="Enter Business Address"
            {...field}
            error={errors.businessAddress?.message}
          />
        )}
      />
      <div className="grid grid-cols-1 gap-4 mb-4">
        <Controller
          name="companySize"
          control={control}
          render={({ field }) => (
            <Select
              label="Company's size"
              options={[
                { value: "", label: "Select Size" },
                { value: "1-10", label: "1-10 employees" },
                { value: "11-50", label: "11-50 employees" },
                { value: "51-200", label: "51-200 employees" },
                { value: "201-500", label: "201-500 employees" },
                { value: "500+", label: "500+ employees" },
              ]}
              error={errors.companySize?.message}
              isLoading={isLoading}
              labelClassName="text-white"
              className="text-white"
              {...field}
            />
          )}
        />
        {/* <Controller
          name="purpose"
          control={control}
          render={({ field }) => (
            <Select
              label="What do you need scrubbe for?"
              options={[
                { value: "", label: "Select Purpose" },
                {
                  value: "IMS",
                  label: "Incident Management System (IMS)",
                },
                {
                  value: "FRAUD_MANAGEMENT_IMS",
                  label: "Fraud Management + Incident Management",
                },
              ]}
              error={errors.purpose?.message}
              isLoading={isLoading}
              {...field}
            />
          )}
        /> */}
      </div>
      <div className="flex items-center gap-4">
        <CButton
          className="border border-colorScBlue bg-transparent hover:text-white text-colorScBlue"
          onClick={signOut}
        >
          Back
        </CButton>
        <CButton
          type="submit"
          disabled={isLoading || !isValid}
          isLoading={isLoading}
        >
          {isLoading ? "Processing..." : "Create Account"}
        </CButton>
      </div>
    </form>
  );
};

export default CompleteBusinessProfile;
