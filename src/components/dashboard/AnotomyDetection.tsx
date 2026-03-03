"use client";
import { Button } from "@/components/ui/button";
import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { X } from "lucide-react";
import React, { useState } from "react";

const AnotomyDetection = () => {
  const [timeWindow, setTimeWindow] = useState("within-10-minutes");
  const [customDateAndTime, setCustomDateAndTime] = useState("");
  const [triggerAction, setTriggerAction] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      (e.key === "Enter" || e.key === ",") &&
      tagInput.trim() !== "" &&
      !tags.includes(tagInput.trim())
    ) {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleRemoveTag = (idx: number) => {
    setTags(tags.filter((_, i) => i !== idx));
  };
  return (
    <div className="p-4">
      <div className=" flex justify-between items-center">
        <div className="text-2xl font-bold dark:text-white text-black">
          Customizable Anomaly Detection Dashboard
        </div>
      </div>
      <div className="mt-5 dark:bg-dark bg-white p-6  space-y-5 h-full rounded-xl">
        <div className="grid grid-cols-2 gap-x-5">
          <Input
            placeholder="coding rule"
            label="Search Rule by name or tag"
            className="w-full bg-transparent dark:text-white"
            labelClassName="dark:text-white"
          />
          <Select
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
            label="Filter by Severity"
            className="w-full bg-transparent dark:text-white"
            labelClassName="dark:text-white"
          />
        </div>
        <div className="relative">
          <Select
            options={[
              { value: "user", label: "User" },
              { value: "IP", label: "IP" },
              { value: "device", label: "Device" },
              { value: "role", label: "Role" },
            ]}
            label="Entity Type"
            className="w-full bg-transparent dark:text-white"
            labelClassName="dark:text-white"
          />

          <Button
            className=" bg-transparent border border-red-500 text-red-500 absolute right-0 top-[-10px]"
            size="sm"
          >
            Remove field
          </Button>
        </div>

        <div className="relative">
          <Input
            placeholder="eg. johndoe@gmail.com,jane@gmail.com"
            label="User ID/Email"
            className="w-full bg-transparent dark:text-white"
            labelClassName="dark:text-white"
          />
          <Button
            className=" bg-transparent border border-red-500 text-red-500 absolute right-0 top-[-10px]"
            size="sm"
          >
            Remove field
          </Button>
        </div>

        <div className="relative">
          <Select
            options={[
              { value: "Login Attempts", label: "Login Attempts" },
              { value: "Data Download Size", label: "Data Download Size" },
              { value: "API Call Volume", label: "API Call Volume" },
              { value: "New Location", label: "New Location" },
              { value: "Time of Access", label: "Time of Access" },
              {
                value: "Unusual Login Location",
                label: "Unusual Login Location",
              },
              {
                value: "Multiple Failed Login Attempts",
                label: "Multiple Failed Login Attempts",
              },
              {
                value: "High Value Transaction Spike",
                label: "High Value Transaction Spike",
              },
              {
                value: "Login During Unusual Hours",
                label: "Login During Unusual Hours",
              },
              {
                value: "Sudden Spike in API Calls",
                label: "Sudden Spike in API Calls",
              },
              {
                value: "New Device + Transaction",
                label: "New Device + Transaction",
              },
              {
                value: "Multiple Accounts from One IP",
                label: "Multiple Accounts from One IP",
              },
              { value: "Multiple Chargebacks", label: "Multiple Chargebacks" },
              { value: "Large Data Exports", label: "Large Data Exports" },
              {
                value: "Rapid Deposit- Withdrawal",
                label: "Rapid Deposit- Withdrawal",
              },
              {
                value: "Excessive Password Resets",
                label: "Excessive Password Resets",
              },
              {
                value: "Device Fingerprint Reuse",
                label: "Device Fingerprint Reuse",
              },
              {
                value: "Inconsistent KYC submissions",
                label: "Inconsistent KYC submissions",
              },
              {
                value: "Velocity of Risky Actions",
                label: "Velocity of Risky Actions",
              },
              {
                value: "Unauthorized Admin Role Assignment",
                label: "Unauthorized Admin Role Assignment",
              },
            ]}
            label="Monitor Metrics"
            className="w-full bg-transparent dark:text-white"
            labelClassName="dark:text-white"
          />

          <Button
            className=" bg-transparent border border-red-500 text-red-500 absolute right-0 top-[-10px]"
            size="sm"
          >
            Remove field
          </Button>
          <p className="text-sm dark:text-gray-300 text-gray-600">
            Tracks the number of log in attempts by the user
          </p>
        </div>

        <div className="relative">
          <Select
            options={[
              { value: ">", label: ">" },
              { value: "<", label: "<" },
              { value: "==", label: "==" },
              { value: "!=", label: "!=" },
              { value: "in", label: "in" },
              { value: "not in", label: "not in" },
              { value: "is", label: "is" },
            ]}
            label="Condition"
            className="w-full bg-transparent dark:text-white"
            labelClassName="dark:text-white"
          />

          <Button
            className=" bg-transparent border border-red-500 text-red-500 absolute right-0 top-[-10px]"
            size="sm"
          >
            Remove field
          </Button>
          <Input placeholder="e.g 3, 1000, US, true" />
          <p className="text-sm dark:text-gray-300 text-gray-600">
            IF Login attempts &gt; 3
          </p>
        </div>

        <div className="relative">
          <Select
            options={[
              { label: "Within 10 minutes", value: "within-10-minutes" },
              { label: "Last 24 hours", value: "last-24-hours" },
              { label: "Last 1 hour", value: "last-1-hour" },
              { label: "Last 7 days", value: "last-7-days" },
              { label: "Custom Date and Time ", value: "custom-date-and-time" },
            ]}
            value={timeWindow}
            onChange={(value) => setTimeWindow(value.target.value)}
            label="Condition"
            className="w-full bg-transparent dark:text-white"
            labelClassName="dark:text-white"
          />
          <Button
            className=" bg-transparent border border-red-500 text-red-500 absolute right-0 top-[-10px]"
            size="sm"
          >
            Remove field
          </Button>
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
                className=" pt-3 cursor-pointer dark:text-white"
              >
                <X />
              </div>
            </div>
          )}{" "}
        </div>

        <div className="space-y-3 relative">
          <Button
            className=" bg-transparent border border-red-500 text-red-500 absolute right-0 "
            size="sm"
          >
            Remove field
          </Button>
          <p className="dark:text-white font-medium">Trigger Action</p>
          <div className="flex items-center gap-2">
            <div className="items-center flex flex-row gap-2">
              <input
                id={"send alert"}
                type="checkbox"
                checked={triggerAction.includes("send alert")}
                onChange={() =>
                  setTriggerAction(
                    triggerAction.includes("send alert")
                      ? triggerAction.filter((role) => role !== "send alert")
                      : [...triggerAction, "send alert"]
                  )
                }
                className="w-4 h-4  text-blue-600 bg-transparent checked:bg-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor={"send alert"}
                className="text-sm dark:text-zinc-200 "
              >
                Send Alert
              </label>
            </div>
            <div className="items-center flex flex-row gap-2">
              <input
                id={"tag as suspicious"}
                type="checkbox"
                checked={triggerAction.includes("tag as suspicious")}
                onChange={() =>
                  setTriggerAction(
                    triggerAction.includes("tag as suspicious")
                      ? triggerAction.filter(
                          (role) => role !== "tag as suspicious"
                        )
                      : [...triggerAction, "tag as suspicious"]
                  )
                }
                className="w-4 h-4 text-blue-600 bg-transparent checked:bg-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor={"tag as suspicious"}
                className="text-sm dark:text-zinc-200 "
              >
                Tag as Suspicious
              </label>
            </div>
            <div className="items-center flex flex-row gap-2">
              <input
                id={"notify analyst"}
                type="checkbox"
                checked={triggerAction.includes("notify analyst")}
                onChange={() =>
                  setTriggerAction(
                    triggerAction.includes("notify analyst")
                      ? triggerAction.filter(
                          (role) => role !== "notify analyst"
                        )
                      : [...triggerAction, "notify analyst"]
                  )
                }
                className="w-4 h-4  text-blue-600 bg-transparent checked:bg-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor={"notify analyst"}
                className="text-sm dark:text-zinc-200 "
              >
                Notify Analyst
              </label>
            </div>

            <div className="items-center flex flex-row gap-2">
              <input
                id={"auto qurantine"}
                type="checkbox"
                checked={triggerAction.includes("auto qurantine")}
                onChange={() =>
                  setTriggerAction(
                    triggerAction.includes("notify analyst")
                      ? triggerAction.filter(
                          (role) => role !== "auto qurantine"
                        )
                      : [...triggerAction, "auto qurantine"]
                  )
                }
                className="w-4 h-4  text-blue-600 bg-transparent checked:bg-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor={"auto qurantine"}
                className="text-sm dark:text-zinc-200 "
              >
                Auto Quarantine
              </label>
            </div>
          </div>

          <div className="space-y-2 relative">
            <Button
              className=" bg-transparent border border-red-500 text-red-500 absolute right-0 "
              size="sm"
            >
              Remove field
            </Button>
            <p className="dark:text-white font-medium text-sm">Rule Tags</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="flex items-center border-1 border-colorScBlue text-colorScBlue px-2 py-2 rounded-lg text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="ml-2 text-white bg-colorScBlue h-5 w-5 rounded-full flex items-center justify-center hover:text-red- focus:outline-none"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Add a tag and press Enter or comma"
              className="w-full bg-transparent dark:text-white border border-gray-300 rounded-md p-2 h-[48px] text-sm"
            />
          </div>

          <div className="space-y-2 relative">
            <Button
              className=" bg-transparent border border-red-500 text-red-500 absolute right-0 top-[-10px]"
              size="sm"
            >
              Remove field
            </Button>
            <p className="dark:text-white font-medium text-sm ">Description</p>
            <textarea
              placeholder="optional description of the rule"
              className="w-full bg-transparent text-white border border-gray-300 rounded-md p-2 text-sm "
            />
          </div>
        </div>
      </div>

      <div className="mt-5 dark:bg-dark bg-white p-6  space-y-5 h-full rounded-xl">
        <div className="text-2xl font-bold dark:text-white text-black">
          Add Custom Field
        </div>
        <Input
          placeholder="Enter field name (e.g custom Metrics)"
          label="Field Name"
          className="w-full bg-transparent dark:text-white"
          labelClassName="dark:text-white"
        />
        <Select
          options={[
            { value: "text input", label: "Text Input" },
            { value: "number input", label: "Number Input" },
            { value: "dropdown", label: "Dropdown" },
            { value: "text area", label: "Text Area" },
          ]}
          label="Input Type"
          className="w-full bg-transparent dark:text-white"
          labelClassName="dark:text-white"
        />

        <CButton className="w-fit">Add Field</CButton>
      </div>

      <div className="mt-5 dark:bg-dark bg-white p-6  space-y-5 h-full rounded-xl">
        <div className="text-2xl font-bold dark:text-white text-black">
          Add Custom Monitored Metric
        </div>
        <Input
          placeholder="Enter metric name "
          label="Metric Name"
          className="w-full bg-transparent dark:text-white"
          labelClassName="dark:text-white"
        />
        <Input
          placeholder="Enter description "
          label="Metric Description"
          className="w-full bg-transparent dark:text-white"
          labelClassName="dark:text-white"
        />
        <Select
          options={[
            { value: ">", label: ">" },
            { value: "<", label: "<" },
            { value: "==", label: "==" },
            { value: "!=", label: "!=" },
            { value: "in", label: "in" },
            { value: "not in", label: "not in" },
            { value: "is", label: "is" },
          ]}
          label="Select Condition"
          className="w-full bg-transparent dark:text-white"
          labelClassName="dark:text-white"
        />
        <Select
          options={[
            { value: ">", label: ">" },
            { value: "<", label: "<" },
            { value: "==", label: "==" },
            { value: "!=", label: "!=" },
            { value: "in", label: "in" },
            { value: "not in", label: "not in" },
            { value: "is", label: "is" },
          ]}
          label="Add context"
          className="w-full bg-transparent dark:text-white"
          labelClassName="dark:text-white"
        />

        <CButton className="w-fit">Add Metric</CButton>
      </div>

      <div className="flex flex-wrap gap-2 mt-7">
        <CButton className=" w-fit h-[40px]">Test Rule</CButton>
        <CButton className=" w-fit h-[40px]">Save Rules</CButton>
        <CButton className=" w-fit h-[40px]">Apply Bulk Rule</CButton>
        <CButton className=" w-fit h-[40px]">Raise an Incident</CButton>
      </div>
    </div>
  );
};

export default AnotomyDetection;
