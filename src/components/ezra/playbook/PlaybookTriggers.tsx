import usePlaybookActionModal from "@/hooks/usePlaybookActionModal";
import React from "react";

type Props = {
  triggers: string[];
};
const PlaybookTriggers = ({ triggers }: Props) => {
  const { handleClickAction, viewModalAction } = usePlaybookActionModal();

  return (
    <div className="flex flex-col gap-2 ">
      <p className="text-lg font-bold dark:text-white">Triggers</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {triggers?.map((action) => (
          <button
            key={action}
            draggable
            onClick={() => handleClickAction(action)}
            onDragStart={(e) => e.dataTransfer.setData("trigger", action)}
            className="border border-colorScBlue px-3 py-2 rounded bg-transparent text-colorScBlue hover:bg-colorScBlue hover:text-white  text-sm"
          >
            {action}
          </button>
        ))}
        <button
          className=" px-3 py-2 rounded bg-colorScBlue text-white text-sm"
          //   onClick={() => setIsModalOpen(true)}
        >
          + Add custom action
        </button>

        {/* <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <AddCustomBuilder onClose={() => setIsModalOpen(false)} />
        </Modal> */}

        {viewModalAction}
      </div>
    </div>
  );
};

export default PlaybookTriggers;
