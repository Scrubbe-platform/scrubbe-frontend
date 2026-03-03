import React, { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/input";
import CButton from "../ui/Cbutton";

type AddPlaybookProps = {
  isOpen: boolean;
  onClose: () => void;
  playBook?: Playbook;
  isEdit?: boolean;
};

type Playbook = {
  id: string;
  name: string;
  description: string;
  steps?: string;
};

const AddPlaybook = ({
  isOpen,
  onClose,
  playBook: playBookData,
  isEdit = false,
}: AddPlaybookProps) => {
  const [playbook, setPlaybook] = useState<Playbook>(
    playBookData ?? {
      id: "",
      name: "",
      description: "",
      steps: "",
    }
  );

  useEffect(() => {
    if (playBookData && isEdit) {
      setPlaybook(playBookData);
    } else {
      setPlaybook({
        id: "",
        name: "",
        description: "",
        steps: "",
      });
    }
  }, [playBookData, isEdit]);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-8 dark:text-white">
          {isEdit ? "Edit Playbook" : "Add Playbook"}
        </h1>

        <Input
          label="Playbook ID"
          placeholder="Pb5"
          value={playbook?.id}
          onChange={(e) => setPlaybook({ ...playbook, id: e.target.value })}
        />
        <Input
          label="Name"
          placeholder="eg Lock Account"
          value={playbook?.name}
          onChange={(e) => setPlaybook({ ...playbook, name: e.target.value })}
        />
        <div className="space-y-2 relative">
          <p className="dark:text-white font-medium text-sm ">Description</p>
          <textarea
            placeholder="Describe the playbook"
            className="w-full bg-transparent text-white border border-gray-300 rounded-md p-2 text-sm "
            value={playbook?.description}
            onChange={(e) =>
              setPlaybook({ ...playbook, description: e.target.value })
            }
          />
        </div>
        <div className="space-y-2 relative">
          <p className="dark:text-white font-medium text-sm ">Steps</p>
          <textarea
            placeholder="List steps (one per line)"
            className="w-full bg-transparent text-white border border-gray-300 rounded-md p-2 text-sm "
            value={playbook?.steps}
            onChange={(e) =>
              setPlaybook({ ...playbook, steps: e.target.value })
            }
          />
        </div>
        <div className="flex justify-end gap-4">
          <CButton className="w-fit border-colorScBlue border bg-transparent text-colorScBlue">
            Close
          </CButton>
          <CButton className="w-fit">
            {isEdit ? "Edit Playbook" : "Save Playbook"}
          </CButton>
        </div>
      </div>
    </Modal>
  );
};

export default AddPlaybook;
