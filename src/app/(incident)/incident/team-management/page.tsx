"use client";
import ProgressBar from "@/components/ezra/ProgressBar";
import CButton from "@/components/ui/Cbutton";
import EmptyState from "@/components/ui/EmptyState";
import InviteTeamMember from "@/components/ui/InviteTeamMember";
import TableLoader from "@/components/ui/LoaderUI/TableLoader";
import Modal from "@/components/ui/Modal";
import { Table } from "@/components/ui/table";
import useMember, { Member } from "@/hooks/useMember";
import { CellContext } from "@tanstack/react-table";
import React, { ReactNode, useState } from "react";

const Page = () => {
  const { data: members, isLoading } = useMember();
  const [openInvite, setOpenInvite] = useState(false);
  const columns = [
    {
      accessorKey: "name",
      header: () => <span className="font-semibold">Name</span>,
      cell: (info: CellContext<Member, unknown>) => (
        <p>
          {info.row.original.firstname} {info.row.original.lastname}
        </p>
      ),
    },

    {
      accessorKey: "email",
      header: () => <span className="font-semibold">Email</span>,
      cell: (info: CellContext<Member, unknown>) => (
        <div className=" truncate text-nowrap">{info.getValue() as string}</div>
      ),
    },
    {
      accessorKey: "role",
      header: () => <span className="font-semibold">Role</span>,
      cell: (info: CellContext<Member, unknown>) => (
        <div className="">{info.getValue() as string}</div>
      ),
    },
    {
      accessorKey: "activity",
      header: () => <span className="font-semibold">Last Action</span>,
      cell: (info: CellContext<Member, unknown>) => (
        <div className="">{info.getValue() as string}</div>
      ),
    },

    {
      accessorKey: "Action",
      header: () => <span className="font-semibold">Action</span>,
      cell: () => (
        <div className=" p-2 rounded-md gap-2 bg-gray-200 text-center dark:text-black">
          View Details
        </div>
      ),
    },
  ];

  let content: ReactNode;
  if (isLoading) {
    content = <TableLoader />;
  } else if (!isLoading && (!members || members?.length < 1)) {
    content = (
      <EmptyState
        title="You have no team memeber yet"
        action={
          <CButton
            onClick={() => setOpenInvite(true)}
            className="w-fit  bg-IMSLightGreen text-white hover:bg-IMSGreen shadow-none"
          >
            Invite Member
          </CButton>
        }
      />
    );
  } else if (!isLoading && members && members?.length > 0) {
    content = (
      <div>
        <div className="flex items-center justify-between">
          <p className=" text-xl">Team Member</p>
          <CButton
            onClick={() => setOpenInvite(true)}
            className="w-fit  bg-IMSLightGreen text-white hover:bg-IMSGreen shadow-none"
          >
            Invite Member
          </CButton>
        </div>
        <Table data={members} columns={columns} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <p className=" text-lg font-bold"> Team Management </p>
      <div className=" p-4 rounded-lg bg-white border border-neutral-200 flex flex-col gap-3">
        <p className="text-lg font-semibold">Available Seats</p>
        <p className=" text-2xl font-semibold">4/8</p>
        <ProgressBar color="bg-IMSLightGreen" value={40} />
      </div>
      <div className="">{content}</div>

      <Modal isOpen={openInvite} onClose={() => setOpenInvite(false)}>
        <InviteTeamMember />
      </Modal>
    </div>
  );
};

export default Page;
