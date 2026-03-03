import Modal from "@/components/ui/Modal";
import React, { useState } from "react";
import AddCustomBuilder from "./AddCustomBuilder";
import usePlaybookActionModal from "@/hooks/usePlaybookActionModal";

type PlaybookActionsProps = {
  actions: string[];
};

const PlaybookActions: React.FC<PlaybookActionsProps> = ({ actions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { handleClickAction, viewModalAction } = usePlaybookActionModal();

  return (
    <div className="flex flex-col gap-2 ">
      <p className="text-lg font-bold dark:text-white">Actions</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {actions.map((action) => (
          <button
            key={action}
            draggable
            onClick={() => handleClickAction(action)}
            onDragStart={(e) => e.dataTransfer.setData("action", action)}
            className="border border-colorScBlue px-3 py-2 rounded bg-transparent text-colorScBlue hover:bg-colorScBlue hover:text-white  text-sm"
          >
            {action}
          </button>
        ))}
        <button
          className=" px-3 py-2 rounded bg-colorScBlue text-white text-sm"
          onClick={() => setIsModalOpen(true)}
        >
          + Add custom action
        </button>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <AddCustomBuilder onClose={() => setIsModalOpen(false)} />
        </Modal>

        {viewModalAction}
      </div>
    </div>
  );
};
export default PlaybookActions;
