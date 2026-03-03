import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import React, { useState } from "react";

const SlackMessageModal = ({ closeModal }: { closeModal: () => void }) => {
  const [slackChannel, setSlackChannel] = useState("");
  const [message, setMessage] = useState("");
  const handleSave = () => {
    console.log(slackChannel, message);
  };
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold dark:text-white">
        Configure Slack Message
      </h2>
      <Input
        label="Slack Channel"
        placeholder="Enter Slack Channel"
        value={slackChannel}
        onChange={(e) => setSlackChannel(e.target.value)}
      />
      <Input
        label="Message"
        placeholder="Enter Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
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
      </div>
    </div>
  );
};

export default SlackMessageModal;
