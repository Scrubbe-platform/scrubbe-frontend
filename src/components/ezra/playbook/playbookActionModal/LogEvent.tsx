import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import React, { useEffect, useState } from "react";

const LogEvent = ({
  closeModal,
  config,
  initialConfig,
}: {
  closeModal: () => void;
  config: (value: unknown) => void;
  initialConfig: { ticket: string; summary: string };
}) => {
  const [configuration, setConfiguration] = useState({
    ticket: "scrubbe",
    summary: "",
  });
  const handleSave = () => {
    config(configuration);
  };

  useEffect(() => {
    if (initialConfig) {
      setConfiguration(initialConfig ?? { ticket: "scrubbe", summary: "" });
    }
  }, [initialConfig]);
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold dark:text-white">
        Configure Log Event
      </h2>
      <Select
        options={[
          { label: "Scrubbe", value: "scrubbe" },
          { label: "Jira", value: "jira" },
          { label: "Service now", value: "service now" },
          { label: "Freshdesk", value: "freshdesk" },
        ]}
        value={configuration.ticket}
        onChange={(e) =>
          setConfiguration((prev) => ({ ...prev, ticket: e.target.value }))
        }
        label="Ticket"
      />
      <Input
        label="Ticket Summary"
        placeholder="Low Severity detected"
        value={configuration.summary}
        onChange={(e) =>
          setConfiguration((prev) => ({ ...prev, summary: e.target.value }))
        }
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

export default LogEvent;
