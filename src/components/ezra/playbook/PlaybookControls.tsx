import React, { useState } from "react";
import SavePlaybookModal from "./SavePlaybookModal";

type PlaybookControlsProps = {
  onClear: () => void;
  onSave: () => void;
};

const PlaybookControls: React.FC<PlaybookControlsProps> = ({
  onClear,
  onSave,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleSave = () => {
    onSave();
    setIsOpen(false);
  };
  return (
    <div className="flex gap-2 mt-4 dark:text-white">
      <button onClick={onClear} className="border px-3 py-1 rounded">
        Clear
      </button>
      <button className="border px-3 py-1 rounded">Undo</button>
      <button className="border px-3 py-1 rounded">Redo</button>
      <button className=" px-3 py-1 rounded bg-blue-500 text-white">
        Suggest
      </button>
      <button className="bg-blue-500 text-white px-3 py-1 rounded">
        Validate
      </button>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        Save
      </button>
      <button className="bg-blue-500 text-white px-3 py-1 rounded">
        Export
      </button>

      <SavePlaybookModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default PlaybookControls;
