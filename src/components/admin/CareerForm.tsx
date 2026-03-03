"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Input from "../ui/input";
import Select from "../ui/select";
import TextArea from "../ui/text-area";
import CButton from "../ui/Cbutton";

// Helper function to validate date format (mm/dd/yy)
// This is a simple regex for the specified format. For full date validity (e.g., leap years),
// consider using a dedicated library like 'date-fns' or more complex Zod refinements.
const DateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{2}$/;

// --- Enum Definitions (assuming specific options for dropdowns) ---
// You should replace these with the actual values your application uses.

// Example Departments
const Departments = z.enum([
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
]);

// Example Employment Types
const EmploymentTypes = z.enum([
  "Full-Time",
  "Part-Time",
  "Contract",
  "Internship",
  "Temporary",
]);

// Example Job Levels
const JobLevels = z.enum([
  "Entry-Level",
  "Mid-Level",
  "Senior",
  "Executive",
  "Director",
]);

// The main Zod schema for the entire job creation form
export const NewJobSchema = z.object({
  // 1. Job Title
  title: z
    .string()
    .min(5, "The job title must be at least 5 characters long.")
    .max(100, "The job title cannot exceed 100 characters."),

  // 2. Department (Dropdown)
  department: Departments, // Enforces selection from the defined enum

  // 3. Employment Type (Dropdown)
  employmentType: EmploymentTypes, // Enforces selection from the defined enum

  // 4. Location
  location: z
    .string()
    .min(
      3,
      "The location must be at least 3 characters long (e.g., 'remote' or 'Lagos')."
    )
    .max(100, "The location field cannot exceed 100 characters."),

  // 5. Job Level (Dropdown)
  jobLevel: JobLevels, // Enforces selection from the defined enum

  // 6. Salary Range
  // Example format: "60k-90k/year". Validation should enforce a non-empty string.
  // For more robust validation (e.g., two numbers separated by a dash), you'd use a regex.
  salaryRange: z
    .string()
    .min(3, "Please enter a valid salary range (e.g., '60k-90k/year').")
    .max(80, "The salary range entry is too long."),

  // 7. Description (Detailed Role Overview)
  description: z
    .string()
    .min(
      100,
      "The detailed role overview must be at least 100 characters long."
    )
    .max(5000, "The description cannot exceed 5,000 characters."),

  // 8. Responsibilities (List of duties)
  responsibilities: z
    .string()
    .min(50, "Please list the key responsibilities (minimum 50 characters).")
    .max(5000, "The responsibilities section cannot exceed 5,000 characters."),

  // 9. Requirements (Skills, experience)
  requirements: z
    .string()
    .min(
      50,
      "Please list the necessary skills and experience (minimum 50 characters)."
    )
    .max(5000, "The requirements section cannot exceed 5,000 characters."),

  // 10. Benefits (Optional)
  benefits: z
    .string()
    .max(3000, "The benefits section cannot exceed 3,000 characters.")
    .optional()
    .or(z.literal("")), // Treat empty string as optional/valid

  // 11. Application Deadline
  // The format is explicitly mm/dd/yy
  applicationDeadline: z
    .string()
    .min(8, "The application deadline must be in 'mm/dd/yy' format.")
    .max(8, "The application deadline must be in 'mm/dd/yy' format.")
    .regex(
      DateRegex,
      "Date must be in the 'mm/dd/yy' format (e.g., 10/25/24)."
    ),

  // 12. Application Link
  applicationLink: z
    .string()
    .url(
      "The application link must be a valid URL (e.g., https://example.com/apply)."
    )
    .max(300, "The application link cannot exceed 300 characters.")
    // You might allow empty string if you handle the application internally
    .optional()
    .or(z.literal("")),
});

type NewPostType = z.infer<typeof NewJobSchema>;

const CareerForm = () => {
  const {
    control,
    // handleSubmit,
    // watch,
    // setValue,
    formState: { errors },
  } = useForm<NewPostType>({
    resolver: zodResolver(NewJobSchema),
  });
  return (
    <div>
      <p className=" text-3xl font-bold">Create New Job</p>
      <div>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Title"
              placeholder="Enter job title"
              required
              error={errors.title?.message}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <Select
                options={[
                  { value: "Engineering", label: "Engineering / Technology" },
                  { value: "Product", label: "Product Management" },
                  { value: "Design", label: "Design / UX" },
                  { value: "Marketing", label: "Marketing / Communications" },
                  { value: "Sales", label: "Sales / Business Development" },
                  { value: "HR", label: "Human Resources / Talent" },
                  { value: "Finance", label: "Finance / Accounting" },
                  { value: "Operations", label: "Operations / Logistics" },
                ]}
                {...field}
                label="Department"
                error={errors.department?.message}
              />
            )}
          />
          <Controller
            name="employmentType"
            control={control}
            render={({ field }) => (
              <Select
                options={[
                  { value: "Full-Time", label: "Full-Time" },
                  { value: "Part-Time", label: "Part-Time" },
                  { value: "Contract", label: "Contract" },
                  { value: "Internship", label: "Internship" },
                  { value: "Temporary", label: "Temporary / Seasonal" },
                ]}
                {...field}
                label="Employee Type"
                error={errors.employmentType?.message}
              />
            )}
          />
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Location"
                error={errors.location?.message}
              />
            )}
          />
          <Controller
            name="jobLevel"
            control={control}
            render={({ field }) => (
              <Select
                options={[
                  {
                    value: "Entry-Level",
                    label: "Entry-Level (0-2 years exp)",
                  },
                  { value: "Mid-Level", label: "Mid-Level (3-5 years exp)" },
                  { value: "Senior", label: "Senior (6+ years exp)" },
                  { value: "Manager", label: "Manager / Team Lead" },
                  { value: "Director", label: "Director / VP" },
                  { value: "Executive", label: "Executive (C-Suite)" },
                ]}
                {...field}
                label="Job Level"
                error={errors.jobLevel?.message}
              />
            )}
          />
        </div>

        <Controller
          name="salaryRange"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Salary Range"
              placeholder="eg  60k-90k/year"
              required
              error={errors.salaryRange?.message}
            />
          )}
        />

        <Controller
          name="responsibilities"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              label="Responsibilities"
              placeholder="List of  duties (use bullets)"
              required
              error={errors.responsibilities?.message}
            />
          )}
        />

        <Controller
          name="requirements"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              label="Requirements"
              placeholder="Skills, experience(use bullets)"
              required
              error={errors.requirements?.message}
            />
          )}
        />
        <Controller
          name="benefits"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              label="Benefits(Optional)"
              placeholder="Company Benefits"
              error={errors.requirements?.message}
            />
          )}
        />

        <Controller
          name="applicationDeadline"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Application Deadline"
              type="date"
              required
              error={errors.applicationDeadline?.message}
            />
          )}
        />
        <Controller
          name="applicationLink"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Application Link"
              placeholder="URL/Internal form"
              type="url"
              required
              error={errors.applicationLink?.message}
            />
          )}
        />

        <div className="flex items-center justify-end gap-3">
          <CButton className="w-fit">Save as Draft</CButton>
          <CButton className="w-fit">Publish Job</CButton>
        </div>
      </div>
    </div>
  );
};

export default CareerForm;
