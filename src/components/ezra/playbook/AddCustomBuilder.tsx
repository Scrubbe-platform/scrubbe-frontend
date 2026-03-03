import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import usePlaybookBuilderStore from "@/store/slices/playbookBuilder";
import React, { useState } from "react";

interface AddCustomBuilderProps {
  onClose: () => void;
}

const AddCustomBuilder: React.FC<AddCustomBuilderProps> = ({ onClose }) => {
  const [actionName, setActionName] = useState("");
  const { addPlaybookAction } = usePlaybookBuilderStore();

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addPlaybookAction(actionName);
    onClose();
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold dark:text-white">Add Custom Action</h2>
      <Input
        label="Custom action"
        placeholder="eg. unauthorized access"
        value={actionName}
        onChange={(e) => setActionName(e.target.value)}
      />
      <div className="flex gap-2 justify-end">
        <CButton
          onClick={onClose}
          className=" w-fit border border-colorScBlue bg-transparent hover:bg-colorScBlue hover:text-white"
        >
          Cancel
        </CButton>
        <CButton className=" w-fit" type="submit">
          Save
        </CButton>
      </div>
    </form>
  );
};

export default AddCustomBuilder;
