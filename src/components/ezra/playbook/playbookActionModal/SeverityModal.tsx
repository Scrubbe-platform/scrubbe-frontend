import React, { useEffect, useState } from "react";
import Select from "@/components/ui/select";
import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";

const SeverityModal = ({
  closeModal,
  config,
  initialConfig,
}: {
  closeModal: () => void;
  config: (value: unknown) => void;
  initialConfig: {
    field: string;
    operator: string;
    value: string;
  };
}) => {
  const [configuration, setConfiguration] = useState({
    field: "",
    operator: "",
    value: "",
  });
  const handleSave = () => {
    config(configuration);
  };

  useEffect(() => {
    if (initialConfig) {
      setConfiguration(
        initialConfig ?? {
          field: "",
          operator: "",
          value: "",
        }
      );
    }
  }, [initialConfig]);
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold dark:text-white">
        Configure Severity = High
      </h2>
      <Input
        label="Field"
        placeholder="Severity"
        onChange={(value) => {
          setConfiguration((prev) => ({ ...prev, field: value.target.value }));
        }}
        value={configuration.field}
      />
      <Select
        options={[
          { label: "more than >", value: "more than >" },
          { label: "less than <", value: "less than <" },
          { label: "equal to =", value: "equal to =" },
          { label: "not equal !=", value: "not equal !=" },
          { label: "is", value: "is" },
          { label: "in", value: "in" },
          { label: "not in", value: "not in" },
          { label: "exceeds", value: "exceeds" },
          { label: "below", value: "below" },
        ]}
        onChange={(value) => {
          setConfiguration((prev) => ({
            ...prev,
            operator: value.target.value,
          }));
        }}
        value={configuration.operator}
        label="Operator"
      />
      <Input
        label="Value"
        placeholder="High"
        onChange={(value) => {
          setConfiguration((prev) => ({ ...prev, value: value.target.value }));
        }}
        value={configuration.value}
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

export default SeverityModal;
