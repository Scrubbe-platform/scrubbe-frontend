import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import React, { useState } from "react";

const BlockIpModal = ({
  closeModal,
  initialConfig,
  config,
}: {
  closeModal: () => void;
  config: (value: unknown) => void;
  initialConfig: Record<string, string>;
}) => {
  const [ipAddress, setIpAddress] = useState(initialConfig?.ipAddress ?? "");

  const handleSave = () => {
    const data = {
      ipAddress,
    };
    config(data);
  };
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold dark:text-white">Configure Block IP</h2>
      <Input
        label="IP Address"
        placeholder="192.168.1.1"
        value={ipAddress}
        onChange={(e) => setIpAddress(e.target.value)}
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

export default BlockIpModal;
