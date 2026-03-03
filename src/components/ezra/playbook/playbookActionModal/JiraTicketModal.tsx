import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import React, { useState } from "react";

const JiraTicketModal = ({ closeModal }: { closeModal: () => void }) => {
  const [summary, setSummary] = useState("");
  const handleSave = () => {
    console.log(summary);
  };
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold dark:text-white">
        Configure Create Jira Ticket
      </h2>
      <Input
        label="Ticket Summary"
        placeholder="Enter ticket summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />
      <div className="flex gap-2 justify-end">
        <CButton
          onClick={closeModal}
          className=" w-fit border border-colorScBlue bg-transparent hover:bg-colorScBlue hover:text-white"
        >
          Cancel
        </CButton>
        <CButton className=" w-fit" onClick={handleSave}>
          Save
        </CButton>
      </div>{" "}
    </div>
  );
};

export default JiraTicketModal;
