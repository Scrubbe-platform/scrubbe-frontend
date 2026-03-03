import React, { useState } from "react";
import { FiEdit2, FiPlus } from "react-icons/fi";
import Modal from "../ui/Modal";
import CButton from "../ui/Cbutton";
import AddPlaybook from "./AddPlaybook";

const playbooks = [
  {
    id: "1",
    name: "Lock Account",
    description: "Locks a compromised user account",
  },
  {
    id: "2",
    name: "Run Malware Scan",
    description: "Initiates a malware scan on affected systems",
  },
  {
    id: "3",
    name: "Notify User",
    description: "Sends a notification to the user",
  },
  {
    id: "4",
    name: "Quarantine Email",
    description: "Quarantines suspicious emails",
  },
];

type Playbook = {
  id: string;
  name: string;
  description: string;
  steps?: string;
};

const MangePlaybook = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [isAddPlaybookOpen, setIsAddPlaybookOpen] = useState(false);
  const [playbook, setPlaybook] = useState<Playbook | undefined>(undefined);
  const [isEdit, setIsEdit] = useState(false);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-8 dark:text-white">
          Manage Playbooks
        </h1>
        <div className="flex flex-col gap-8 mb-8">
          {playbooks.map((pb) => (
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
          ))}
        </div>
        <CButton
          onClick={() => {
            setIsAddPlaybookOpen(true);
            setIsEdit(false);
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
