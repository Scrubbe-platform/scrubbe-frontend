// TicketForm.tsx
"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaChevronLeft } from "react-icons/fa";
import Select from "@/components/ui/select";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/text-area";
import CButton from "@/components/ui/Cbutton";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";

// Define the Zod schema for validation
const formSchema = z.object({
  shortDescription: z
    .string()
    .min(1, "Short description is required.")
    .max(100, "Short description cannot exceed 100 characters."),
  description: z
    .string()
    .min(1, "Description is required.")
    .max(500, "Description cannot exceed 500 characters."),
  priority: z.string().nonempty({ message: "Please select a priority." }),
  category: z.string().nonempty({ message: "Please select a category." }),
});

// Define the TypeScript type from the schema
type FormData = z.infer<typeof formSchema>;

const TicketForm: React.FC = () => {
  const {
    handleSubmit,
    control, // Get the control object for the Controller component
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });
  const router = useRouter();
  const { post } = useFetch();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const res = await post(endpoint.portal.create_incident, data);
    setLoading(false);
    if (res.success) {
      toast.success("Ticket created successfully");
      router.push("/portal/dashboard");
    } else {
      toast.error("Failde to create ticket");
    }
  };

  console.log(errors);

  return (
    <div className="bg-white p-8 rounded-lg w-full max-w-5xl mx-auto ">
      {/* "Back to dashboard" link */}
      <div
        onClick={() => router.push("/portal/dashboard")}
        className="flex items-center text-IMSLightGreen hover:underline mb-6 cursor-pointer"
      >
        <FaChevronLeft className="mr-2" /> back to dashboard
      </div>

      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Raise New Ticket
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Short Description (using register) */}
        <div>
          <Controller
            control={control}
            name="shortDescription"
            render={({ field }) => (
              <Input
                {...field}
                label="Short Description"
                placeholder="Short description of the incident"
                error={errors.shortDescription?.message}
              />
            )}
          />
        </div>

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextArea
              label="Description"
              info="Provide a detailed account of the incident"
              rows={4}
              {...field}
              placeholder="Provide a detailed account of the incident including any  relevant context or observations "
              className="w-full bg-transparent dark:!text-white !text-black border border-gray-300 rounded-md p-2 text-sm "
              error={errors.description?.message}
            />
          )}
        />

        {/* Priority and Category (using Controller) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priority */}
          <div>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select
                  label="Priority"
                  info="Select the priority level resolution"
                  options={[
                    { label: "Select Priority", value: "" },
                    { label: "P5-Informational", value: "INFORMATIONAL" },
                    { label: "P4-Low", value: "LOW" },
                    { label: "P3-Medium", value: "MEDIUM" },
                    { label: "P2-High", value: "HIGH" },
                    { label: "P1-Critical", value: "CRITICAL" },
                  ]}
                  {...field}
                  error={errors.priority?.message}
                  className=" text-black dark:text-white"
                />
              )}
            />
          </div>

          {/* Category */}
          <div>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select
                  label="Category"
                  info="Select incident category"
                  options={[
                    { label: "Select Category", value: "" },
                    { label: "Fraud", value: "Fraud" },
                    { label: "System", value: "System" },
                    { label: "User Report", value: "User Report" },
                    { label: "Others", value: "Others" },
                  ]}
                  {...field}
                  error={errors.category?.message}
                  className=" text-black dark:text-white"
                />
              )}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <CButton
            isLoading={loading}
            disabled={loading || !isValid}
            type="submit"
            className=" w-fit px-6"
          >
            Create Ticket
          </CButton>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;
