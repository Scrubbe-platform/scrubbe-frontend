"use client";
import React, { FormEvent, ReactNode, useState } from "react";
import { Table } from "../ui/table";
import Input from "../ui/input";
import Select from "../ui/select";
import CButton from "../ui/Cbutton";
import Modal from "../ui/Modal";
import { CellContext } from "@tanstack/react-table";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { querykeys } from "@/lib/constant";
import clsx from "clsx";
import TableLoader from "../ui/LoaderUI/TableLoader";
import EmptyState from "../ui/EmptyState";
import Pagination from "../ui/Pagination";

interface IAPIKey {
  name: string;
  environment: string;
  key: string;
  responseTime: string;
  status: string;
  action: string;
}

const columns = [
  {
    accessorKey: "name",
    header: () => <span className="font-semibold">Key Name</span>,
    cell: (info: CellContext<IAPIKey, unknown>) => info.getValue(),
  },
  {
    accessorKey: "environment",
    header: () => <span className="font-semibold">Environment</span>,
    cell: (info: CellContext<IAPIKey, unknown>) =>
      (info.getValue() as string).toLowerCase(),
  },
  {
    accessorKey: "key",
    header: () => <span className="font-semibold">Secret key</span>,
    cell: (info: CellContext<IAPIKey, unknown>) => info.getValue() ?? "-----",
  },

  {
    accessorKey: "isActive",
    header: () => <span className="font-semibold">Status</span>,
    cell: (info: CellContext<IAPIKey, unknown>) => (
      <span
        className={clsx(
          `px-2 py-1 rounded font-semibold text-xs`,
          (info.getValue() as boolean) === true
            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            : "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
        )}
      >
        {(info.getValue() as boolean) ? "Active" : "In-active"}{" "}
      </span>
    ),
  },
  {
    accessorKey: "action",
    header: () => <span className="font-semibold">Action</span>,
    cell: () => (
      <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded font-medium text-xs border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
        Rotate
      </button>
    ),
  },
];

const permissionsOptions = [
  { value: "api-key:create", label: "Read API" },
  { value: "api-key:read", label: "Write API" },
];

const APIkeys = () => {
  const [openGenerate, setOpenGenerate] = React.useState(false);
  const [keyName, setKeyName] = React.useState("");
  const [environment, setEnvironment] = React.useState("PRODUCTION");
  const [permissions, setPermissions] = React.useState<string[]>([
    "api-key:read",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { post, get } = useFetch();
  // Add an action property to each row for the Rotate button
  const {
    data: apiKeys,
    isPending,
    refetch,
  } = useQuery({
    queryKey: [querykeys.API_KEYS],
    queryFn: async function () {
      try {
        const res = await get(endpoint.api_key.get);
        console.log(res.data);
        if (res.success) {
          return res.data;
        }
        return [];
      } catch (error) {
        console.log(error);
      }
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = apiKeys?.map((row: any) => ({ ...row, action: "Rotate" }));

  const columnsWithAction = columns.map((col) =>
    col.accessorKey === "action"
      ? {
          ...col,
          cell: () => (
            <button
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded font-medium text-xs border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              onClick={() => setOpenGenerate(true)}
            >
              Rotate
            </button>
          ),
        }
      : col
  );

  const handlePermissionChange = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleCreateApikey = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = {
      name: keyName,
      environment,
      scopes: permissions,
    };

    try {
      setIsLoading(true);
      const res = await post(endpoint.api_key.create, data);
      setIsLoading(false);
      if (res.success) {
        toast.success("New Api Key Created");
        setOpenGenerate(false);
        setKeyName("");
        setEnvironment("PRODUCTION");
        setPermissions(["api-key:read"]);
        refetch();
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.success("Failed To Create Api Key");
    }
  };

  let content: ReactNode;
  if (isPending) {
    content = <TableLoader />;
  }
  if (!isPending && (!apiKeys || apiKeys?.length < 1)) {
    content = (
      <EmptyState
        title="You have no api key yet"
        action={
          <CButton
            onClick={() => setOpenGenerate(true)}
            className="w-fit border-colorScBlue hover:text-white border bg-transparent text-colorScBlue"
          >
            Generate New Key
          </CButton>
        }
      />
    );
  }
  if (apiKeys?.length > 0) {
    content = (
      <div>
        <Table columns={columnsWithAction} data={data} />
        <div className="flex justify-end">
          <Pagination page={1} totalPages={10} onPageChange={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 dark:text-white">API Keys</h2>
      <div className="bg-white dark:bg-dark rounded-2xl p-8 shadow-sm  ">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold dark:text-white">
            API Key Management
          </h3>
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            onClick={() => setOpenGenerate(true)}
          >
            Generate New Key
          </button>
        </div>
        {content}
      </div>
      <Modal isOpen={openGenerate} onClose={() => setOpenGenerate(false)}>
        <div className="p-4 min-w-[340px] md:min-w-[480px]">
          <h2 className="text-2xl font-semibold mb-6 dark:text-white">
            Generate New API Key
          </h2>
          <form onSubmit={handleCreateApikey} className="space-y-4">
            <Input
              label="Key Name"
              placeholder="Enter Key name"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
            />
            <Select
              label="Environment"
              options={[
                { value: "", label: "SELECT ENVIRONMENT" },
                { value: "PRODUCTION", label: "Production" },
                { value: "DEVELOPMENT", label: "Development" },
              ]}
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
            />
            <div>
              <div className="font-medium mb-2 dark:text-white">
                Permissions
              </div>
              <div className="flex flex-col gap-2">
                {permissionsOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={permissions.includes(opt.value)}
                      onChange={() => handlePermissionChange(opt.value)}
                      className="accent-blue-600 w-5 h-5 rounded"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <CButton
                className="border w-fit border-colorScBlue bg-transparent text-colorScBlue hover:text-white"
                onClick={() => setOpenGenerate(false)}
              >
                Cancel
              </CButton>
              <CButton type="submit" className="w-fit" isLoading={isLoading}>
                Generate Key
              </CButton>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default APIkeys;
