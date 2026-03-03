"use client";

import React, { useState } from "react";
import Input from "./input";
import Select from "./select";
import CButton from "./Cbutton";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";

// Zod Schema for validation
const memberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z
    .string({ message: "Please select a role" })
    .nonempty({ message: "Please select a role" }),
  level: z
    .string({ message: "Please select a level" })
    .nonempty({ message: "Please select a level" }),
  permissions: z.array(z.string()).optional(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

const InviteTeamMember = () => {
  const { post } = useFetch();
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      email: "",
      role: "",
      level: "",
      permissions: [],
    },
  });

  const onSubmit = async (data: MemberFormValues) => {
    console.log("Form data submitted:", data);
    const value = {
      inviteEmail: data.email,
      level: data.level,
      accessPermissions: data.permissions,
      role: data.role,
    };
    setLoading(true);
    const res = await post(endpoint.auth.invite_member, value);
    setLoading(false);
    if (res.success) {
      toast.success(`${data.email} has been sent an invite`);
      reset();
    } else {
      toast.error(res.data ?? "Couldn't send invite");
    }
  };

  const allPermissions = [
    { label: "View Dashboard", value: "VIEW_DASHBOARD" },
    { label: "Modify Dashboard", value: "MODIFY_DASHBOARD" },
    { label: "Execute Actions", value: "EXECUTE_ACTIONS" },
    { label: "Manage Users", value: "MANAGE_USERS" },
  ];

  return (
    <div className="">
      <p className="dark:text-white text-lg font-semibold mb-3">
        Invite Team Member
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Email"
              placeholder="Enter Email"
              type="email"
              className="dark:!text-black"
              labelClassName="dark:!text-black"
              error={errors.email?.message}
            />
          )}
        />

        {/* Level Select */}
        <Controller
          name="level"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Level"
              className="dark:!text-black"
              labelClassName="dark:!text-black"
              options={[
                { value: "", label: "Select Level" },
                { value: "1st_Line", label: "1st Line" },
                { value: "2nd_Line", label: "2nd Line" },
                { value: "3rd_Line", label: "3rd Line" },
                { value: "Manager", label: "Manager" },
              ]}
              error={errors.level?.message}
            />
          )}
        />

        {/* Role Select */}
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Role"
              className="dark:!text-black"
              labelClassName="dark:!text-black"
              options={[
                { value: "", label: "Select role" },
                { value: "ADMIN", label: "Admin" },
                { value: "MANAGER", label: "Manager" },
                { value: "ANALYST", label: "Analyst" },
                { value: "VIEWER", label: "Viewer" },
              ]}
              error={errors.role?.message}
            />
          )}
        />

        {/* Access Permissions */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Permissions</h4>
          <div className="flex flex-wrap items-center gap-4">
            <Controller
              name="permissions"
              control={control}
              render={({ field }) => (
                <>
                  {allPermissions.map((permission) => (
                    <div
                      key={permission.value}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={permission.value}
                        checked={field?.value?.includes(permission.value)}
                        onChange={(e) => {
                          const newPermissions = e.target.checked
                            ? [...(field?.value || []), permission.value]
                            : field?.value?.filter(
                                (item) => item !== permission.value
                              );
                          field.onChange(newPermissions);
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label
                        htmlFor={permission.value}
                        className="text-sm text-gray-700"
                      >
                        {permission.label}
                      </label>
                    </div>
                  ))}
                </>
              )}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <CButton
            isLoading={loading}
            type="submit"
            className="bg-IMSLightGreen hover:bg-IMSDarkGreen"
          >
            Invite Team Member
          </CButton>
        </div>
      </form>
    </div>
  );
};

export default InviteTeamMember;
