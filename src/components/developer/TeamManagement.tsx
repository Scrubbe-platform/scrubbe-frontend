"use client";
import { CellContext } from "@tanstack/react-table";
import React, { useState } from "react";
import { Table } from "../ui/table";
import CButton from "../ui/Cbutton";
import Modal from "../ui/Modal";
import Input from "../ui/input";
import Select from "../ui/select";
import { Button } from "@heroui/react";

type IMember = {
  name: string;
  email: string;
  role: string;
  lastActive: string;
};

const Members: IMember[] = [
  {
    name: "John Doe",
    email: "johndoe@gmail.com",
    role: "owner",
    lastActive: "online",
  },
  {
    name: "Jane Smith",
    email: "jane@gmail.com",
    role: "developer",
    lastActive: "2 hour ago",
  },
];

const columns = [
  {
    accessorKey: "name",
    header: () => <span className="font-semibold">Name</span>,
    cell: (info: CellContext<IMember, unknown>) => info.getValue(),
  },
  {
    accessorKey: "email",
    header: () => <span className="font-semibold">Email</span>,
    cell: (info: CellContext<IMember, unknown>) => info.getValue(),
  },
  {
    accessorKey: "role",
    header: () => <span className="font-semibold">Role</span>,
    cell: (info: CellContext<IMember, unknown>) => info.getValue(),
  },
  {
    accessorKey: "lastActive",
    header: () => <span className="font-semibold">Last Active</span>,
    cell: (info: CellContext<IMember, unknown>) => info.getValue(),
  },
  {
    accessorKey: "action",
    header: () => <span className="font-semibold">Action</span>,
    cell: () => <Button>Edit</Button>,
  },
];

const TeamManagement = () => {
  const [openNewMemberModal, setOpenNewMemberModal] = useState(false);
  const [openEditMemberModal, setOpenEditMemberModal] = useState(false);
  const [role, setRole] = useState("");
  const [permissions, setPermissions] = useState({
    apiAccess: true,
    userManagement: true,
    billingAccess: true,
    securitySettings: true,
  });
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [status, setStatus] = useState("Active");

  const handleRowClick = (value: IMember) => {
    setFullName(value.name);
    setEmailAddress(value.email);
    setRole(value.role);
    setOpenEditMemberModal(true);
  };

  const handlePermissionChange = (permission: keyof typeof permissions) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };
  return (
    <div className="p-6 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 dark:text-white">
        Team Management
      </h2>

      <div className=" bg-white dark:bg-dark rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-2xl font-semibold dark:text-white">Team Members</p>
          <CButton
            className=" w-fit"
            onClick={() => setOpenNewMemberModal(true)}
          >
            Invite Member
          </CButton>
        </div>
        <Table columns={columns} data={Members} onRowClick={handleRowClick} />
      </div>

      <Modal
        onClose={() => setOpenNewMemberModal(false)}
        isOpen={openNewMemberModal}
      >
        <div>
          <p className="text-2xl font-semibold dark:text-white">
            Invite Team Member
          </p>
          <div className=" mt-6">
            <Input label="Full Name" />
            <Input label="Email Address" />
            <Select
              label="Role"
              options={[
                { value: "developer", label: "Developer" },
                { value: "admin", label: "Admin" },
                { value: "viewer", label: "Viewer" },
              ]}
            />
            <div className="space-y-2 relative">
              <p className="dark:text-white font-medium text-sm ">
                Message(Optional)
              </p>
              <textarea
                placeholder="Welcome to the team"
                className="w-full bg-transparent text-white border border-gray-300 rounded-md p-2 text-sm "
              />
            </div>
          </div>

          <div className="flex items-center justify-end mt-6 gap-4">
            <CButton
              onClick={() => setOpenNewMemberModal(false)}
              className="w-fit bg-transparent border border-colorScBlue text-colorScBlue hover:text-white"
            >
              Cancel
            </CButton>
            <CButton className=" w-fit">Send Invitation</CButton>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={openEditMemberModal}
        onClose={() => setOpenEditMemberModal(false)}
      >
        <div className=" flex items-center justify-center transition-colors duration-300">
          <div className=" w-full">
            {/* Close Button (top right) - using a simple X icon or component */}

            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Edit Team Member
            </h1>

            {/* Full Name Input */}
            <Input
              label="Full Name"
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mb-4"
            />

            {/* Email Address Input */}
            <Input
              label="Email Address"
              id="email-address"
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="mb-4"
            />

            {/* Role Select */}
            <Select
              label="Role"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: "Owner", label: "Owner" },
                { value: "Admin", label: "Admin" },
                { value: "Member", label: "Member" },
              ]}
              className="mb-6"
            />

            {/* Permissions Checkboxes */}
            <div className="mb-6">
              <h2 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Permissions
              </h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="api-access"
                    type="checkbox"
                    checked={permissions.apiAccess}
                    onChange={() => handlePermissionChange("apiAccess")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="api-access"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    API Access
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="user-management"
                    type="checkbox"
                    checked={permissions.userManagement}
                    onChange={() => handlePermissionChange("userManagement")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="user-management"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    User Management
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="billing-access"
                    type="checkbox"
                    checked={permissions.billingAccess}
                    onChange={() => handlePermissionChange("billingAccess")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="billing-access"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Billing Access
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="security-settings"
                    type="checkbox"
                    checked={permissions.securitySettings}
                    onChange={() => handlePermissionChange("securitySettings")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="security-settings"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Security Settings
                  </label>
                </div>
              </div>
            </div>

            {/* Status Select */}
            <Select
              label="Status"
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Suspended", label: "Suspended" },
              ]}
              className="mb-6"
            />

            {/* Note */}
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-8">
              Note: Changes to user roles and permissions will take effect
              immediately.
            </p>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <CButton
                className="w-fit bg-transparent border border-colorScBlue text-colorScBlue hover:text-white"
                onClick={() => setOpenEditMemberModal(false)}
              >
                Cancel
              </CButton>
              <CButton
                className="bg-rose-500 hover:bg-rose-600 w-fit"
                onClick={() => console.log("Remove Member")}
              >
                Remove Member
              </CButton>
              <CButton
                className="w-fit"
                onClick={() => console.log("Update Member")}
              >
                Update Member
              </CButton>
            </div>
          </div>

          {/* Dark Theme Toggle for demonstration */}
        </div>
      </Modal>
    </div>
  );
};

export default TeamManagement;
