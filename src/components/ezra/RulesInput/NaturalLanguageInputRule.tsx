"use client";

import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import React, { useState } from "react";
import { X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import AdvancesRuleConfiguration from "@/components/ezra/RulesInput/AdvancesRuleConfiguration";
import ScheduleRuleConfiguration from "@/components/ezra/RulesInput/ScheduleRuleConfiguration";
import SideModal from "@/components/ui/SideModal";
import PreviewDetails from "@/components/ezra/RulesInput/PreviewDetails";
const NaturalLanguageRule = () => {
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [openAdvancedOption, setOpenAdvancedOption] = useState(false);
  const [openSchedule, setOpenSchedule] = useState(false);
  const [openSideModal, setOpenSideModal] = useState(false);

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
          Scrubbe Natural language Rule Input
        </div>
        <CButton
          onClick={() => setOpenSideModal(true)}
          className=" bg-transparent border border-colorScBlue text-colorScBlue w-fit"
        >
          View Detail{" "}
          <span className="text-white text-sm rounded-full bg-red-600 h-5 w-5 flex items-center justify-center ">
            1
          </span>
        </CButton>
      </div>

      <div className="mt-5 dark:bg-dark bg-white p-6  space-y-3 h-full rounded-xl">
        <div className="grid grid-cols-2 gap-x-5">
          <Input
            placeholder="search rule by name or tag"
            label="Search Rule by name or tag*"
            className="w-full bg-transparent dark:text-white"
            labelClassName="dark:text-white"
          />
          <Select
            options={[
              { value: "en", label: "English" },
              { value: "fr", label: "French" },
              { value: "es", label: "Spanish" },
            ]}
            disabled={true}
            label="Select Language"
            className="w-full bg-transparent dark:text-white"
            labelClassName="dark:text-white"
          />
          <Select
            options={[
              { value: "Phishing Detection", label: "Phishing Detection" },
              { value: "Insider Threat", label: "Insider Threat" },
            ]}
            disabled={true}
            label="Load a Template"
            className="w-full bg-transparent dark:text-white"
            labelClassName="dark:text-white"
          />
          <Input
            placeholder="eg Suspicious login Detected"
            label="Rule Name"
            className="w-full bg-transparent dark:text-white"
            labelClassName="dark:text-white"
          />
        </div>

        <div className="space-y-3">
          <p className="dark:text-white font-medium">Allowed Roles</p>
          <div className="flex items-center gap-2">
            <div className="items-center flex flex-row gap-2">
              <input
                id={"admin"}
                type="checkbox"
                checked={allowedRoles.includes("admin")}
                onChange={() =>
                  setAllowedRoles(
                    allowedRoles.includes("admin")
                      ? allowedRoles.filter((role) => role !== "admin")
                      : [...allowedRoles, "admin"]
                  )
                }
                className="w-4 h-4  text-blue-600 bg-transparent checked:bg-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor={"admin"} className="text-sm dark:text-zinc-200 ">
                Admin
              </label>
            </div>
            <div className="items-center flex flex-row gap-2">
              <input
                id={"analyst"}
                type="checkbox"
                checked={allowedRoles.includes("analyst")}
                onChange={() =>
                  setAllowedRoles(
                    allowedRoles.includes("analyst")
                      ? allowedRoles.filter((role) => role !== "analyst")
                      : [...allowedRoles, "analyst"]
                  )
                }
                className="w-4 h-4 text-blue-600 bg-transparent checked:bg-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor={"analyst"}
                className="text-sm dark:text-zinc-200 "
              >
                Analyst
              </label>
            </div>
            <div className="items-center flex flex-row gap-2">
              <input
                id={"viewer"}
                type="checkbox"
                checked={allowedRoles.includes("viewer")}
                onChange={() =>
                  setAllowedRoles(
                    allowedRoles.includes("viewer")
                      ? allowedRoles.filter((role) => role !== "viewer")
                      : [...allowedRoles, "viewer"]
                  )
                }
                className="w-4 h-4  text-blue-600 bg-transparent checked:bg-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor={"viewer"} className="text-sm dark:text-zinc-200 ">
                Viewer
              </label>
            </div>
          </div>
        </div>

        <Input
          placeholder="e.g  If a user logs in more than 5 times from a new location, send an alert"
          label="Natural Language Rule"
          className="w-full bg-transparent dark:text-white"
          labelClassName="dark:text-white"
        />

        <div className="grid grid-cols-2 gap-x-5">
          <Input
            placeholder="search rule by name or tag"
            label="Execution Date and time"
            className="w-full bg-transparent dark:text-white"
            labelClassName="dark:text-white"
          />
          <Select
            options={[
              { value: "en", label: "English" },
              { value: "fr", label: "French" },
              { value: "es", label: "Spanish" },
            ]}
            disabled={true}
            label="Execution Frequency"
            className="w-full bg-transparent dark:text-white"
            labelClassName="dark:text-white"
          />
        </div>

        {/* create a multi input field with a label */}
        <div className="space-y-2">
          <p className="dark:text-white font-medium text-sm">Tags</p>
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

        <div className="space-y-2">
          <p className="dark:text-white font-medium text-sm ">Description</p>
          <textarea
            placeholder="optional description of the rule"
            className="w-full bg-transparent text-white border border-gray-300 rounded-md p-2 text-sm "
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <CButton
            onClick={() => setOpenAdvancedOption(true)}
            className=" w-fit h-[40px]"
          >
            Configure advanced option
          </CButton>
          <CButton className=" w-fit h-[40px]">Save Rules</CButton>
          <CButton className=" w-fit h-[40px]">Test Rule</CButton>
          <CButton
            className=" w-fit h-[40px]"
            onClick={() => setOpenSchedule(true)}
          >
            Schedule Rule
          </CButton>
          <CButton className=" w-fit h-[40px]">Export JSON</CButton>
        </div>

        <div className="flex flex-wrap gap-2">
          <CButton className=" w-fit h-[40px]">Export YAML</CButton>
          <CButton className=" w-fit h-[40px]">Export SOAR Playbook</CButton>
        </div>
      </div>

      {openAdvancedOption && (
        <Modal
          isOpen={openAdvancedOption}
          onClose={() => setOpenAdvancedOption(false)}
        >
          <AdvancesRuleConfiguration
            onClose={() => setOpenAdvancedOption(false)}
          />
        </Modal>
      )}
      {openSchedule && (
        <Modal isOpen={openSchedule} onClose={() => setOpenSchedule(false)}>
          <ScheduleRuleConfiguration onClose={() => setOpenSchedule(false)} />
        </Modal>
      )}

      {openSideModal && (
        <SideModal
          isOpen={openSideModal}
          onClose={() => setOpenSideModal(false)}
          title="Preview Details"
        >
          <PreviewDetails />
        </SideModal>
      )}
    </div>
  );
};

export default NaturalLanguageRule;
