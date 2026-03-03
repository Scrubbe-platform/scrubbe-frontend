"use client";
import { useAppStore } from "@/store/StoreProvider";
import { TeamMember } from "@/store/slices/enterpriseSetupSlice";
import type React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FiUpload } from "react-icons/fi";

import { Controller } from "react-hook-form";
import Select from "@/components/ui/select";
import Input from "@/components/ui/input";
import CButton from "@/components/ui/Cbutton";
import { PenLine } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import useAuthStore from "@/lib/stores/auth.store";

// Zod schema for form validation
const companyInfoSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  companySize: z.string().min(1, "Company size is required"),
  primaryRegion: z.string().min(1, "Primary region is required"),
});

type CompanyInfoFormData = z.infer<typeof companyInfoSchema>;

const AccountSetup = () => {
  const {
    enterpriseSetup,
    setCompanyInfo,
    setCompanyLogo,
    errors,
    setError,
    clearError,
    setAdminContact,
    setDashboardPreferences,
    toggleNotificationChannel,
    toggleIncidentPriority,
    submitEnterpriseSetup,
    isSubmitting,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    isSuccess,
  } = useAppStore((state) => state);
  const { user } = useAuthStore();
  // Fixed: Initialize with the file from companyLogo object
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(
    enterpriseSetup.companyLogo?.file || null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const path = searchParams.get("to");
  const {
    handleSubmit,
    formState: { errors: formErrors },
    control,
  } = useForm<CompanyInfoFormData>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      companyName: enterpriseSetup.companyName,
      industry: enterpriseSetup.industry,
      companySize: enterpriseSetup.companySize,
      primaryRegion: enterpriseSetup.primaryRegion,
    },
  });

  const industryOptions = [
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

  const companySizeOptions = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1000+ employees",
  ];

  const regionOptions = [
    "London",
    "New York",
    "Abuja",
    "Toronto",
    "Sydney",
    "Tokyo",
    "Mumbai",
    "Berlin",
    "Paris",
    "Singapore",
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png"];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!validTypes.includes(file.type)) {
        setError("companyLogo", "Please upload a JPEG or PNG file");
        return;
      }

      if (file.size > maxSize) {
        setError("companyLogo", "File size must be less than 2MB");
        return;
      }

      // Set the uploaded logo for immediate local preview
      setUploadedLogo(file);

      // Also update the store (this will handle base64 conversion asynchronously)
      setCompanyLogo(file);
      clearError("companyLogo");
    }
  };

  const onSubmit = async (data: CompanyInfoFormData) => {
    setCompanyInfo(data);

    // Call the submitEnterpriseSetup function
    await submitEnterpriseSetup();
  };

  // Helper function to get image source for preview
  const getImageSrc = (): string | null => {
    // First check if we have a base64 string from the store
    if (enterpriseSetup.companyLogo?.base64) {
      return enterpriseSetup.companyLogo.base64;
    }

    // If we have an uploaded file but no base64 yet, create object URL
    if (uploadedLogo) {
      return URL.createObjectURL(uploadedLogo);
    }

    return null;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    role: "",
    permissions: [] as string[],
  });

  const resetMemberForm = () => {
    setMemberForm({
      name: "",
      email: "",
      role: "",
      permissions: [],
    });
  };

  const handleAddMember = () => {
    setEditingMember(null);
    resetMemberForm();
    setIsModalOpen(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setMemberForm({
      name: member.name ?? "",
      email: member.email,
      role: member.role,
      permissions: member.permissions,
    });
    setIsModalOpen(true);
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

    setIsModalOpen(false);
    resetMemberForm();
    setEditingMember(null);
  };

  const handleDeleteMember = (id: string) => {
    removeTeamMember(id);
  };

  const router = useRouter();

  useEffect(() => {
    if (user) {
      setAdminContact({
        adminEmail: user.email,
        adminName: `${user.firstName} ${user.lastName}`,
      });
    }
    if (isSuccess) {
      if (path && path === "ezra") {
        toast.success("Account setup successful");
        router.push(`/alert-settings?to=${path}`);
      } else {
        router.push(`/alert-settings`);
      }
    }
  }, [isSuccess, path, router, user]);

  const handleSkip = () => {
    if (path && path === "ezra") {
      router.push(`/alert-settings?to=${path}`);
    } else {
      router.push(`/alert-settings`);
    }
  };

  return (
    <section className="w-full h-auto bg-[#F9FAFB]">
      {/* Skip Button */}
      <div className="flex justify-end  w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={handleSkip}
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
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="h-full max-w-[1440px] w-full mx-auto flex flex-col px-4 sm:px-6 lg:px-8"
      >
        <h1 className="font-bold text-center text-[22px] sm:text-[24px] lg:text-[28px] xl:text-[30px] leading-[130%] tracking-[1%] text-[#1F2937] mx-auto py-6 md:py-8 lg:py-10">
          Welcome! Set up your enterprise account to configure your Scrubbe
          dashboard.
        </h1>

        <article className="w-full mx-auto">
          <div className="bg-white p-6">
            <h2 className="text-[24px] font-semibold text-gray-900 mb-8">
              Enterprise Setup
            </h2>

            <div className="space-y-6">
              {/* Company Name and Industry Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <Controller
                  name="companyName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Company Name"
                      placeholder="Flutterwave"
                      className="dark:!text-black"
                      labelClassName="dark:!text-black"
                      error={
                        formErrors.companyName?.message || errors.companyName
                      }
                      isLoading={isSubmitting}
                      {...field}
                    />
                  )}
                />

                {/* Industry */}
                <Controller
                  name="industry"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Industry"
                      className="dark:!text-black"
                      labelClassName="dark:!text-black"
                      options={[
                        { value: "", label: "Select Industry" },
                        ...industryOptions.map((option) => ({
                          value: option,
                          label: option,
                        })),
                      ]}
                      error={formErrors.industry?.message || errors.industry}
                      isLoading={isSubmitting}
                      {...field}
                    />
                  )}
                />
              </div>

              {/* Company Size and Primary Region Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Size */}
                <Controller
                  name="companySize"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Company Size"
                      className="dark:!text-black"
                      labelClassName="dark:!text-black"
                      options={[
                        { value: "", label: "Select Company Size" },
                        ...companySizeOptions.map((option) => ({
                          value: option,
                          label: option,
                        })),
                      ]}
                      error={
                        formErrors.companySize?.message || errors.companySize
                      }
                      isLoading={isSubmitting}
                      {...field}
                    />
                  )}
                />

                {/* Primary Region */}
                <Controller
                  name="primaryRegion"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Primary Region"
                      className="dark:!text-black"
                      labelClassName="dark:!text-black"
                      options={[
                        { value: "", label: "Select Region" },
                        ...regionOptions.map((option) => ({
                          value: option,
                          label: option,
                        })),
                      ]}
                      error={
                        formErrors.primaryRegion?.message ||
                        errors.primaryRegion
                      }
                      isLoading={isSubmitting}
                      {...field}
                    />
                  )}
                />
              </div>

              {/* Company Logo Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 ">
                  Upload company Logo
                </label>
                {/* Upload Area */}
                {!uploadedLogo && !enterpriseSetup.companyLogo ? (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <FiUpload className="w-8 h-8 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Supported files: .Jpeg, PNG (Max 2mb)
                      </p>
                      <button
                        type="button"
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors text-sm font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Choose file
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {uploadedLogo?.name ||
                              enterpriseSetup.companyLogo?.file?.name ||
                              "Company Logo"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {uploadedLogo
                              ? `${(uploadedLogo.size / 1024).toFixed(1)} KB`
                              : "Image file"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedLogo(null);
                            setCompanyLogo(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {errors.companyLogo && (
                  <p className="text-sm text-red-600">{errors.companyLogo}</p>
                )}
                {/* Uploaded Logo Preview */}
                {(uploadedLogo || enterpriseSetup.companyLogo) && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Preview:
                    </p>
                    <div className="w-32 h-20 relative border rounded-lg overflow-hidden bg-gray-50">
                      {getImageSrc() ? (
                        <Image
                          src={getImageSrc()! || "/placeholder.svg"}
                          alt="Company Logo Preview"
                          fill
                          sizes="(min-width: 360px) 128px"
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Loading...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
            </div>
          </div>
        </article>
        {/* Admin Contact Section */}
        <article className="w-full  mx-auto mt-12">
          <div className="bg-white p-6">
            <h2 className="text-[24px] font-semibold text-gray-900 mb-8">
              Admin Contact
            </h2>

            <div className="space-y-6">
              {/* Admin Name and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Admin Name */}
                <Input
                  label="Admin Name"
                  placeholder="Enter Name"
                  value={enterpriseSetup.adminName}
                  defaultValue={user?.firstName + " " + user?.lastName}
                  className="dark:!text-black"
                  labelClassName="dark:!text-black"
                  onChange={(e) => {
                    setAdminContact({ adminName: e.target.value });
                    clearError("adminName");
                  }}
                  error={errors.adminName}
                  isLoading={isSubmitting}
                />
                {/* Admin Email */}
                <Input
                  label="Admin Email"
                  placeholder="Enter Email"
                  type="email"
                  value={enterpriseSetup.adminEmail}
                  defaultValue={user?.email}
                  className="dark:!text-black"
                  labelClassName="dark:!text-black"
                  onChange={(e) => {
                    setAdminContact({ adminEmail: e.target.value });
                    clearError("adminEmail");
                  }}
                  error={errors.adminEmail}
                  isLoading={isSubmitting}
                  // readOnly
                />
              </div>

              {/* Admin Phone and Job Title Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Admin Phone */}
                <Input
                  label="Admin Phone number"
                  placeholder="Enter Phone number"
                  type="tel"
                  value={enterpriseSetup.adminPhone}
                  className="dark:!text-black"
                  labelClassName="dark:!text-black"
                  onChange={(e) => {
                    setAdminContact({ adminPhone: e.target.value });
                    clearError("adminPhone");
                  }}
                  error={errors.adminPhone}
                  isLoading={isSubmitting}
                />
                {/* Admin Job Title */}
                <Input
                  label="Admin Job title"
                  placeholder="Enter job title"
                  value={enterpriseSetup.adminJobTitle}
                  className="dark:!text-black"
                  labelClassName="dark:!text-black"
                  onChange={(e) => {
                    setAdminContact({ adminJobTitle: e.target.value });
                    clearError("adminJobTitle");
                  }}
                  error={errors.adminJobTitle}
                  isLoading={isSubmitting}
                />
              </div>
            </div>
          </div>
        </article>

        {/* Team Members Section */}
        <article className="w-full mx-auto mt-12">
          <div className="bg-white p-6">
            <h2 className="text-[24px] font-semibold text-gray-900 mb-8">
              Invite Team Members
            </h2>

            <div className="space-y-6">
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
                          className="px-2 py-1 sm:px-4 sm:py-2 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2"
                        >
                          <PenLine size={17} />

                          <span className="text-xs sm:text-sm">
                            Edit details
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member.id)}
                          className="px-2 py-1 sm:px-4 sm:py-2 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2"
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
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm font-medium border border-gray-300"
                >
                  + Add Another Team Member
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Team Member Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingMember ? "Edit Team Member" : "Add Team Member"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetMemberForm();
                    setEditingMember(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "View Dashboard", value: "VIEW_DASHBOARD" },
                      { label: "Modify Dashboard", value: "MODIFY_DASHBOARD" },
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
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetMemberForm();
                      setEditingMember(null);
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMember}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Dashboard Preferences Section */}
        <article className="w-full mx-auto mt-12 mb-8">
          <div className="bg-white p-6">
            <h2 className="text-[24px] font-semibold text-gray-900 mb-2">
              Dashboard Preferences
            </h2>
            <p className="text-gray-600 mb-8">
              Customize your dashboard experience
            </p>

            <div className="space-y-8">
              {/* Color Scheme */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Colour Scheme
                </h3>
                <div className="flex gap-6">
                  {/* Primary Color */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Primary Colour
                    </label>
                    <div className="flex items-center space-x-3">
                      <label htmlFor={`primary`} className="">
                        <div
                          className="w-16 h-10 rounded border border-gray-300 flex items-center justify-center text-xs text-gray-500"
                          style={{
                            backgroundColor:
                              enterpriseSetup.colorScheme.primaryColor ||
                              "#F73737",
                          }}
                        >
                          <input
                            type="color"
                            id={`primary`}
                            name="colorPicker"
                            className="invisible w-full h-full"
                            value={enterpriseSetup.colorScheme.primaryColor}
                            onChange={(e) => {
                              setDashboardPreferences({
                                colorScheme: {
                                  ...enterpriseSetup.colorScheme,
                                  primaryColor: e.target.value,
                                },
                              });
                            }}
                          />
                          {!enterpriseSetup.colorScheme.primaryColor && "Red"}
                        </div>
                      </label>
                      <input
                        type="text"
                        value={enterpriseSetup.colorScheme.primaryColor}
                        onChange={(e) => {
                          setDashboardPreferences({
                            colorScheme: {
                              ...enterpriseSetup.colorScheme,
                              primaryColor: e.target.value,
                            },
                          });
                        }}
                        className=" px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Red"
                      />
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Secondary Colour
                    </label>
                    <div className="flex items-center space-x-3">
                      <label htmlFor={`secondary`} className="">
                        <div
                          className="w-16 h-10 rounded border border-gray-300 flex items-center justify-center text-xs text-gray-500"
                          style={{
                            backgroundColor:
                              enterpriseSetup.colorScheme.secondaryColor ||
                              "#1F9237",
                          }}
                        >
                          <input
                            type="color"
                            id={`secondary`}
                            name="colorPicker"
                            className="invisible w-full h-full"
                            value={enterpriseSetup.colorScheme.secondaryColor}
                            onChange={(e) => {
                              setDashboardPreferences({
                                colorScheme: {
                                  ...enterpriseSetup.colorScheme,
                                  secondaryColor: e.target.value,
                                },
                              });
                            }}
                          />
                        </div>
                      </label>
                      <input
                        type="text"
                        value={enterpriseSetup.colorScheme.secondaryColor}
                        onChange={(e) => {
                          setDashboardPreferences({
                            colorScheme: {
                              ...enterpriseSetup.colorScheme,
                              secondaryColor: e.target.value,
                            },
                          });
                        }}
                        className=" px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Green"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Default Dashboard */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Default Dashboard
                </h3>
                <p className="text-sm text-gray-600">You can only select one</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="siemDashboard"
                      name="defaultDashboard"
                      value="SIEM"
                      checked={enterpriseSetup.defaultDashboard === "SIEM"}
                      onChange={(e) => {
                        setDashboardPreferences({
                          defaultDashboard: e.target.value as
                            | "SIEM"
                            | "SOAR"
                            | "Custom",
                        });
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <label
                      htmlFor="siemDashboard"
                      className="text-sm text-gray-700"
                    >
                      Scrubbe Dashboard SIEM
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="soarDashboard"
                      name="defaultDashboard"
                      value="SOAR"
                      checked={enterpriseSetup.defaultDashboard === "SOAR"}
                      onChange={(e) => {
                        setDashboardPreferences({
                          defaultDashboard: e.target.value as
                            | "SIEM"
                            | "SOAR"
                            | "Custom",
                        });
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <label
                      htmlFor="soarDashboard"
                      className="text-sm text-gray-700"
                    >
                      Scrubbe Dashboard SOAR
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="customDashboard"
                      name="defaultDashboard"
                      value="Custom"
                      checked={enterpriseSetup.defaultDashboard === "Custom"}
                      onChange={(e) => {
                        setDashboardPreferences({
                          defaultDashboard: e.target.value as
                            | "SIEM"
                            | "SOAR"
                            | "Custom",
                        });
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <label
                      htmlFor="customDashboard"
                      className="text-sm text-gray-700"
                    >
                      Custom
                    </label>
                  </div>
                </div>
              </div>

              {/* Preferred Integration */}

              {/* Notification Channels */}
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Notification Channels
                      </h3>
                      <p className="text-sm text-gray-600">
                        You can select more than one
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  {["Slack", "Microsoft Teams", "Email", "SMS"].map(
                    (channel) => (
                      <div
                        key={channel}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={channel.toLowerCase().replace(" ", "")}
                          checked={enterpriseSetup.notificationChannels.includes(
                            channel
                          )}
                          onChange={() => toggleNotificationChannel(channel)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label
                          htmlFor={channel.toLowerCase().replace(" ", "")}
                          className="text-sm text-gray-700"
                        >
                          {channel}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Default Incident Priority */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Default Incident Priority
                </h3>

                <div className="flex flex-wrap gap-4">
                  {["HIGH", "MEDIUM", "LOW"].map((priority) => (
                    <div key={priority} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={priority.toLowerCase()}
                        checked={enterpriseSetup.defaultIncidentPriority.includes(
                          priority
                        )}
                        onChange={() => toggleIncidentPriority(priority)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label
                        htmlFor={priority.toLowerCase()}
                        className="text-sm text-gray-700"
                      >
                        {priority}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
            </div>
          </div>
          <div className="flex justify-end pt-6">
            <CButton
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className=" w-fit px-10"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </CButton>
          </div>
        </article>
      </form>
    </section>
  );
};

export default AccountSetup;
