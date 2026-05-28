import React, { useState } from "react";
import { FiEdit2, FiPlus } from "react-icons/fi";
import Modal from "../ui/Modal";
import CButton from "../ui/Cbutton";
import AddPlaybook from "./AddPlaybook";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";
import { useQuery } from "@tanstack/react-query";

type Playbook = {
  id: string;
  name: string;
  description: string;
  steps?: string;
};

type PlaybookResponse = {
  id: string;
  name: string;
  description?: string | null;
  steps?: string[];
};

const MangePlaybook = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { get } = useFetch();
  const [isAddPlaybookOpen, setIsAddPlaybookOpen] = useState(false);
  const [playbook, setPlaybook] = useState<Playbook | undefined>(undefined);
  const [isEdit, setIsEdit] = useState(false);

  const { data: playbooks = [], isLoading } = useQuery<Playbook[]>({
    queryKey: [querykeys.PLAYBOOKS],
    queryFn: async () => {
      const response = await get(endpoint.playbooks.list);
      if (!response.success) {
        return [];
      }

      return ((response.data?.data ?? []) as PlaybookResponse[]).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description ?? "No description provided yet.",
        steps: Array.isArray(item.steps) ? item.steps.join("\n") : "",
      }));
    },
    enabled: isOpen,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-8 dark:text-white">
          Manage Playbooks
        </h1>
        <div className="flex flex-col gap-8 mb-8">
          {isLoading ? (
            <div className="opacity-70 dark:text-white">Loading playbooks...</div>
          ) : playbooks.length === 0 ? (
            <div className="opacity-70 dark:text-white">
              No playbooks yet. Create one to start building live remediation workflows.
            </div>
          ) : (
            playbooks.map((pb) => (
              <div key={pb.id} className="flex items-center justify-between">
                <div>
                  <div className=" font-semibold dark:text-white mb-1">
                    {pb.name}
                  </div>
                  <div className="opacity-70 dark:text-white">
                    {pb.description}
                  </div>
                </div>
                <CButton
                  onClick={() => {
                    setIsAddPlaybookOpen(true);
                    setIsEdit(true);
                    setPlaybook(pb);
                  }}
                  className="flex items-center gap-2 border-2 w-fit bg-transparent border-[#2563eb] text-[#2563eb] rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <FiEdit2 size={24} />
                  Edit
                </CButton>
              </div>
            ))
          )}
        </div>
        <CButton
          onClick={() => {
            setIsAddPlaybookOpen(true);
            setIsEdit(false);
            setPlaybook(undefined);
          }}
          className="w-fit"
        >
          <FiPlus size={24} />
          Add Playbook
        </CButton>
      </div>
      <AddPlaybook
        isOpen={isAddPlaybookOpen}
        onClose={() => setIsAddPlaybookOpen(false)}
        isEdit={isEdit}
        playBook={isEdit ? playbook : undefined}
      />
    </Modal>
  );
};

export default MangePlaybook;
