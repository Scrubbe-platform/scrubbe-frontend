import React, { useState } from "react";
import Modal from "../ui/Modal";
import Select from "../ui/select";
import Input from "../ui/input";
import CButton from "../ui/Cbutton";

type AdvanceFilterProps = {
  isOpen: boolean;
  onClose: () => void;
};
const AdvanceFilter = ({ isOpen, onClose }: AdvanceFilterProps) => {
  const [formData, setFormData] = useState({
    priority: "",
    assignee: "",
    fromDate: "",
    toDate: "",
  });

  const handleApplyFilter = () => {
    console.log(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <div className="text-2xl font-bold dark:text-white text-black mb-4">
          Advance Filter
        </div>
        <Select
          options={[
            { label: "All", value: "all" },
            { label: "Low", value: "low" },
            { label: "Medium", value: "medium" },
            { label: "High", value: "high" },
          ]}
          label="Priority"
          value={formData.priority}
          onChange={(e) =>
            setFormData({ ...formData, priority: e.target.value })
          }
        />
        <Select
          options={[
            { label: "All", value: "all" },
            { label: "Analyst 1", value: "analyst1" },
            { label: "Analyst 2", value: "analyst2" },
          ]}
          label="Assignee"
          value={formData.assignee}
          onChange={(e) =>
            setFormData({ ...formData, assignee: e.target.value })
          }
        />

        <Input
          label="From Date"
          type="date"
          value={formData.fromDate}
          onChange={(e) =>
            setFormData({ ...formData, fromDate: e.target.value })
          }
        />
        <Input
          label="To Date"
          type="date"
          value={formData.toDate}
          onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
        />

        <div className="flex justify-end gap-2">
          <CButton
            onClick={onClose}
            className=" bg-transparent w-fit border border-colorScBlue text-colorScBlue hover:text-white"
          >
            Cancel
          </CButton>
          <CButton onClick={handleApplyFilter} className=" w-fit">
            Apply Filter
          </CButton>
        </div>
      </div>
    </Modal>
  );
};

export default AdvanceFilter;
