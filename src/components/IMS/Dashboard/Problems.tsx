import CButton from "@/components/ui/Cbutton";
import EmptyState from "@/components/ui/EmptyState";
import TableLoader from "@/components/ui/LoaderUI/TableLoader";
import Modal from "@/components/ui/Modal";
import { Table } from "@/components/ui/table";
import { CellContext } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { IoFilterOutline } from "react-icons/io5";
import ProblemForm from "./ProblemForm";

export type Problems = {
  id: string;
  problemId: string;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL";
  status: "OPEN" | "FCA Found" | "INANALYSIS" | "RESOLVED";
  impact: string;
  owner: string;
  createdAt: string;
  description: string;
};

const columns = [
  {
    accessorKey: "problemId",
    header: () => <span className="font-semibold">Problem ID</span>,
    cell: (info: CellContext<Problems, unknown>) => info.getValue(),
  },

  {
    accessorKey: "title",
    header: () => <span className="font-semibold">Title</span>,
    cell: (info: CellContext<Problems, unknown>) => (
      <div className=" truncate text-nowrap max-w-sm">
        {info.getValue() as string}
      </div>
    ),
  },
  {
    accessorKey: "owner",
    header: () => <span className="font-semibold">Owner</span>,
    cell: (info: CellContext<Problems, unknown>) => (
      <div className=" truncate text-nowrap max-w-sm">
        {info.getValue() as string}
      </div>
    ),
  },
  {
    accessorKey: "priority",
    header: () => <span className="font-semibold">Priority</span>,
    cell: (info: CellContext<Problems, unknown>) => (
      <div className="flex items-center gap-2">{info.getValue() as string}</div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <span className="font-semibold">Status</span>,
    cell: (info: CellContext<Problems, unknown>) => (
      <div className="flex items-center gap-2">{info.getValue() as string}</div>
    ),
  },
  {
    accessorKey: "incidents",
    header: () => <span className="font-semibold">Linked Incident</span>,
    cell: (info: CellContext<Problems, unknown>) => (
      <div className="flex items-center gap-2">{info.getValue() as string}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => <span className="font-semibold">Date Opened</span>,
    cell: (info: CellContext<Problems, unknown>) =>
      moment(info.getValue() as string).format("YYYY-MM-DD HH:MM:SS"),
  },
];

const Problems = () => {
  const [openFilter, setOpenFilter] = useState<string | undefined>();
  const statusFilterRef = useRef<HTMLDivElement>(null);
  const isLoading = false;
  const [openProblemForm, setOpenProblemForm] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Problems[] | undefined = [];
  const router = useRouter();

  useEffect(() => {
    if (!openFilter) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target as Node)
      ) {
        setOpenFilter(undefined);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openFilter]);

  if (isLoading) {
    return <TableLoader />;
  }
  if (!isLoading && (!data || data?.length < 1)) {
    return (
      <EmptyState
        title="No Problem created yet"
        // action={
        //   <CButton
        //     onClick={() => router.push("/incident/tickets/create")}
        //     className="w-fit  bg-IMSLightGreen text-white hover:bg-IMSGreen shadow-none"
        //   >
        //     Create New Problem <Plus />
        //   </CButton>
        // }
      />
    );
  }

  const handleRowClick = (ticket: Problems) => {
    console.log(ticket);
    router.push(`/incident/changes-problems/problems/${ticket.id}`);
  };

  return (
    <div className=" px-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className=" text-xl font-bold">Problems</p>
        <div className="flex items-center gap-4">
          <div className="relative" ref={statusFilterRef}>
            <CButton
              onClick={() =>
                setOpenFilter((prev) =>
                  prev === "status" ? undefined : "status"
                )
              }
              className="w-fit shadow-none border-green hover:bg-green hover:text-white dark:text-white border bg-transparent text-green"
            >
              <IoFilterOutline />
              Filter by Status
              <ChevronDown />
            </CButton>
            {/* click outside to close */}
            {openFilter && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 text-sm rounded-md shadow-lg">
                {[
                  { label: "Open", value: "open" },
                  { label: "Closed", value: "closed" },
                  { label: "In Progress", value: "in-progress" },
                  { label: "On Hold", value: "on-hold" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      // setStatusFilter(option.value);
                      setOpenFilter(undefined);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-gray-900 first:rounded-t-md last:rounded-b-md"
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Table data={data} columns={columns} onRowClick={handleRowClick} />

      <Modal onClose={() => setOpenProblemForm(false)} isOpen={openProblemForm}>
        <ProblemForm onClose={() => setOpenProblemForm(false)} />
      </Modal>
    </div>
  );
};

export default Problems;
