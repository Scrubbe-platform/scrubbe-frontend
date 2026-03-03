import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { X } from "lucide-react";
import { useState } from "react";

type Props = {
  onClose: () => void;
};
const AdvancesRuleConfiguration = ({ onClose }: Props) => {
  const [timeWindow, setTimeWindow] = useState("within-10-minutes");
  const [customDateAndTime, setCustomDateAndTime] = useState("");
  const [securityLevel, setSecurityLevel] = useState("low");
  const [customMetric, setCustomMetric] = useState("low");
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-2xl font-bold dark:text-white">
          Advanced Rule Configuration
        </p>
      </div>
      <div className="flex flex-col w-full">
        <Select
          label="Time Window"
          value={timeWindow}
          onChange={(value) => setTimeWindow(value.target.value)}
          options={[
            { label: "Within 10 minutes", value: "within-10-minutes" },
            { label: "Last 24 hours", value: "last-24-hours" },
            { label: "Last 1 hour", value: "last-1-hour" },
            { label: "Last 7 days", value: "last-7-days" },
            { label: "Custom Date and Time ", value: "custom-date-and-time" },
          ]}
          className="w-full dark:text-white"
        />
        {timeWindow === "custom-date-and-time" && (
          <div className="flex gap-2 w-full">
            <Input
              type="datetime-local"
              placeholder="Select Date and Time"
              className="w-full"
              value={customDateAndTime}
              onChange={(value) => setCustomDateAndTime(value.target.value)}
            />
            <div
              onClick={() => setTimeWindow("")}
              className=" pt-3 cursor-pointer"
            >
              <X />
            </div>
          </div>
        )}

        <Select
          label="Security Level"
          value={securityLevel}
          onChange={(value) => setSecurityLevel(value.target.value)}
          options={[
            { label: "Low", value: "low" },
            { label: "Medium", value: "medium" },
            { label: "High", value: "high" },
            { label: "Critical", value: "critical" },
          ]}
        />
        <Select
          label="Custom Metric"
          value={customMetric}
          onChange={(value) => setCustomMetric(value.target.value)}
          options={[
            { label: "Low", value: "low" },
            { label: "Medium", value: "medium" },
            { label: "High", value: "high" },
            { label: "Critical", value: "critical" },
          ]}
        />

        <div className="flex gap-2 justify-end">
          <CButton
            onClick={onClose}
            className=" bg-transparent border border-colorScBlue text-colorScBlue w-fit hover:bg-transparent"
          >
            Close
          </CButton>
          <CButton className="w-fit">Schedule</CButton>
        </div>
      </div>
    </div>
  );
};

export default AdvancesRuleConfiguration;
