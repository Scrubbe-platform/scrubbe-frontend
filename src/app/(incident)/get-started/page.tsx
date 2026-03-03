"use client";
import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { TeamMember } from "@/store/slices/enterpriseSetupSlice";
import { useAppStore } from "@/store/StoreProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { PenLine } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const purpose = [
  "IT Ops",
  "Devops",
  "SRE",
  "Support",
  "Cybersecurity/Security Operations Center",
  "Compliance & Risk Team",
  "Customer Success/ Client Services",
  "Business continuity / Crisis Management Team",
  "Cybersecurity/Security Operations Center",
  "Product/ Engineering Team",
  "Financial Services (Banking , Fintech , Insurance)",
  "Government/Public Sector IT",
];

const companyInfoSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyPurpose: z.string().min(1, "Company size is required"),
});

type formType = z.infer<typeof companyInfoSchema>;

export interface IMember {
  id: string;
  level: string;
  email: string;
  role: string;
  permissions: string[];
}

const Page = () => {
  const router = useRouter();
  const handleSkip = () => {
    router.push(`/incident/tickets`);
  };
  const searchParams = useSearchParams();
  const path = searchParams.get("to");

  const { enterpriseSetup, addTeamMember, updateTeamMember, removeTeamMember } =
    useAppStore((state) => state);

  const {
    handleSubmit,
    formState: { errors: formErrors },
    control,
    watch,
  } = useForm({
    resolver: zodResolver(companyInfoSchema),
  });
  const [loading, setLoading] = useState(false);
  const { post } = useFetch();

  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberForm, setMemberForm] = useState({
    email: "",
    role: "",
    level: "",
    permissions: [] as string[],
  });

  const resetMemberForm = () => {
    setMemberForm({
      email: "",
      role: "",
      level: "",
      permissions: [],
    });
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setMemberForm({
      level: member.level ?? "",
      email: member.email,
      role: member.role,
      permissions: member.permissions,
    });
  };

  const handleSaveMember = () => {
    if (!memberForm.email.trim()) {
      toast.error("please fill all details");
      return;
    }

    if (editingMember) {
      updateTeamMember(editingMember.id, memberForm);
    } else {
      addTeamMember(memberForm);
    }

    resetMemberForm();
    setEditingMember(null);
  };

  const handleDeleteMember = (id: string) => {
    removeTeamMember(id);
  };

  const onSubmit = async (value: formType) => {
    const data = {
      ...value,
      inviteMembers: enterpriseSetup.teamMembers.map((value) => ({
        inviteEmail: value.email,
        role: value.role,
        accessPermissions: value.permissions,
        Level: value.level,
      })),
    };

    setLoading(true);
    const res = await post(endpoint.auth.ims_setup, data);
    setLoading(false);
    console.log(res);
    if (res.success) {
      toast.success("Welcome to scrubbe IMS");
      if (path === "payment") {
        router.replace("/pricing");
        return;
      }
      if (path === "community") {
        router.replace("/community");
        return;
      }
      router.replace("/incident/tickets");
    } else {
      console.log(res.data);
      const message =
        typeof res.data === "object" ? res.data.join(",") : res.data;
      toast.error(message ?? "Failed to submit enterprise setup");
    }
    console.log(data);
  };
  return (
    <section className="w-full bg-[#F9FAFB] min-h-screen p-4">
      <div className="flex justify-end  w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={handleSkip}
          type="button"
          className="px-4 py-2 text-IMSLightGreen border border-blue-200 rounded-md  focus:outline-none focus:ring-2 focus:ring-IMSLightGreen focus:ring-offset-2 transition-colors text-[16px] font-medium flex items-center space-x-2"
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
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="h-full max-w-[1440px] w-full mx-auto flex flex-col px-4 sm:px-6 lg:px-8"
      >
        <div className="py-6 md:py-8 lg:py-10">
          <h1 className="font-bold text-2xl md:text-3xl leading-[130%] tracking-[1%] text-[#1F2937] ">
            Welcome to Scrubbe IMS
          </h1>
          <p>Launch your IMS Workspace</p>
        </div>

        <div className="bg-white p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-8">
            Enterprise Setup
          </h2>

          {/* Company Name and Industry Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <Controller
                name="companyName"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Company Name"
                    placeholder="Flutterwave"
                    className="dark:!text-black"
                    labelClassName="dark:!text-black"
                    error={formErrors.companyName?.message}
                    {...field}
                  />
                )}
              />
              <p className=" text-sm">
                Your workspace:{" "}
                <b className=" capitalize">
                  {watch("companyName") ?? "Example"}
                </b>
                .incidents.scrubbe.com
              </p>
            </div>

            <Controller
              name="companyPurpose"
              control={control}
              render={({ field }) => (
                <Select
                  label="What do you need scrubbe IMS for"
                  className="dark:!text-black"
                  labelClassName="dark:!text-black"
                  options={[
                    { value: "", label: "Select your use case" },
                    ...purpose.map((option) => ({
                      value: option,
                      label: option,
                    })),
                  ]}
                  error={formErrors.companyPurpose?.message}
                  {...field}
                />
              )}
            />
          </div>
        </div>

        <article className="w-full mx-auto mt-12">
          <div className="bg-white p-6">
            <div className="bg-white rounded-lg w-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingMember ? "Edit Team Member" : "Add Team Member"}
                </h3>
              </div>

              <div className="">
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 gap-6">
                  <Input
                    label="Email"
                    placeholder="Enter Email"
                    type="email"
                    value={memberForm.email}
                    className="dark:!text-black"
                    labelClassName="dark:!text-black"
                    onChange={(e) =>
                      setMemberForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Role */}
                <Select
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
                  value={memberForm.level}
                  onChange={(e) =>
                    setMemberForm((prev) => ({
                      ...prev,
                      level: (e.target as HTMLSelectElement).value,
                    }))
                  }
                />

                <Select
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
                  value={memberForm.role}
                  onChange={(e) =>
                    setMemberForm((prev) => ({
                      ...prev,
                      role: (e.target as HTMLSelectElement).value,
                    }))
                  }
                />

                {/* Access Permissions */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Access Permissions
                  </h4>
                  <div className="flex items-center gap-4">
                    {[
                      { label: "View Dashboard", value: "VIEW_DASHBOARD" },
                      {
                        label: "Modify Dashboard",
                        value: "MODIFY_DASHBOARD",
                      },
                      { label: "Execute Actions", value: "EXECUTE_ACTIONS" },
                      { label: "Manage Users", value: "MANAGE_USERS" },
                    ].map((permission) => (
                      <div
                        key={permission.label}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={permission.value}
                          checked={memberForm.permissions.includes(
                            permission.value
                          )}
                          onChange={() =>
                            setMemberForm((prev) => {
                              if (prev.permissions.includes(permission.value)) {
                                const filterPermission =
                                  prev.permissions.filter(
                                    (item) => item !== permission.value
                                  );
                                return {
                                  ...prev,
                                  permissions: filterPermission,
                                };
                              } else {
                                return {
                                  ...prev,
                                  permissions: [
                                    ...prev.permissions,
                                    permission.value,
                                  ],
                                };
                              }
                            })
                          }
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
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 pt-6">
                  {/* <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetMemberForm();
                      setEditingMember(null);
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button> */}

                  <button
                    type="button"
                    onClick={handleSaveMember}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
                  >
                    + Add Another Team Member
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6 mt-10">
              {/* Team Members List */}
              {enterpriseSetup.teamMembers.length > 0 && (
                <div className="space-y-4">
                  {enterpriseSetup.teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate capitalize">
                          {member.name}
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base truncate">
                          {member.email}
                        </p>
                        <span className="inline-block mt-1 sm:mt-2 px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm border-darkEzra rounded-full border">
                          {member.role}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleEditMember(member)}
                          className="px-2 py-1 sm:px-4 sm:py-2 text-IMSLightGreen border border-IMSLightGreen rounded-md hover:bg-blue-50 transition-colors text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2"
                        >
                          <PenLine size={17} />

                          <span className="text-xs sm:text-sm">
                            Edit details
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member.id)}
                          className="px-2 py-1 sm:px-4 sm:py-2 text-IMSLightGreen border border-IMSLightGreen rounded-md hover:bg-blue-50 transition-colors text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2"
                        >
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <span className="text-xs sm:text-sm">Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Team Member Button */}
            </div>
          </div>
        </article>

        <div className=" flex justify-end mt-4">
          <CButton
            isLoading={loading}
            disabled={loading}
            type="submit"
            className=" bg-IMSLightGreen w-[100px] text-base "
          >
            Submit
          </CButton>
        </div>
      </form>
    </section>
  );
};

export default Page;
