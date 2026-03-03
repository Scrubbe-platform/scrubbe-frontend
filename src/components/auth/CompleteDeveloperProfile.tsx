import React from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "../ui/select";
import CButton from "../ui/Cbutton";
import Input from "../ui/input";
import { useSession, signOut } from "next-auth/react";

export const developerProfileSignupSchema = z.object({
  githubUsername: z.string().optional(),
  experience: z.string().min(1, { message: "Please select experience level" }),
});

export type DeveloperProfileSignupFormData = z.infer<
  typeof developerProfileSignupSchema
>;

interface CompleteDeveloperProfileProps {
  onSubmit: (data: DeveloperProfileSignupFormData) => void;
  isLoading: boolean;
}

const CompleteDeveloperProfile = ({
  onSubmit,
  isLoading,
}: CompleteDeveloperProfileProps) => {
  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<DeveloperProfileSignupFormData>({
    resolver: zodResolver(developerProfileSignupSchema),
    mode: "onChange",
  });
  const session = useSession();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Company Size and Purpose Row */}
      <Controller
        name="githubUsername"
        control={control}
        render={({ field }) => (
          <Input
            label="GitHub Username (Optional)"
            placeholder="Enter username"
            defaultValue={session.data?.user.githubUsername}
            error={errors.githubUsername?.message}
            isLoading={isLoading}
            {...field}
          />
        )}
      />
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

      <div className="flex items-center gap-4">
        <CButton className="" onClick={signOut}>
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

export default CompleteDeveloperProfile;
