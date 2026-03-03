import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import SliderThreshold from "@/components/ui/Slider";
import useMember from "@/hooks/useMember";
import React, { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Policy: any[] = [
  // {
  //   name: "Critical outage SLA",
  //   priority: "P1-Critical",
  //   MTTA: "2mins",
  //   MTTAThreshold: "80%",
  //   MTTR: "2mins",
  //   MTTRThreshold: "80%",
  //   uptime_target: "99.5%",
  //   escalation_contact: "Level2",
  //   team: null,
  //   id: "1",
  // },
];
const SlaPolicyBuilder = () => {
  const { data: members } = useMember();
  const [newPolicy, setNewPolicy] = useState(false);

  const PolicyBuilder = ({ isClose }: { isClose?: boolean }) => {
    return (
      <div>
        <div className="grid grid-cols-2 gap-x-4 mt-5">
          <Input label="SLA Name" />
          <Select
            options={[
              { label: "Select Priority", value: "" },
              { label: "P5-Informational", value: "INFORMATIONAL" },
              { label: "P4-Low", value: "LOW" },
              { label: "P3-Medium", value: "MEDIUM" },
              { label: "P2-High", value: "HIGH" },
              { label: "P1-Critical", value: "CRITICAL" },
            ]}
            label="Priority Level"
          />
          <Input label="Response Time (MTTA)" type="time" />
          <SliderThreshold initialValue={50} onChange={() => {}} />
          <Input label="Response Time (MTTA)" type="time" />
          <SliderThreshold initialValue={50} onChange={() => {}} />
          <Select
            options={[
              { label: "Select", value: "" },
              { label: "None", value: "none" },
              { label: "Tier 1", value: "Tier1" },
              { label: "Tier 2", value: "Tier2" },
            ]}
            label="Escalation Contacts"
          />
          <Select
            options={[{ label: "Team member or group", value: "" }].concat(
              members?.map((member) => ({
                label: member.email,
                value: member.email,
              })) ?? []
            )}
            label="Applicable Teams/Client"
          />
          <Input label="Uptime % Target" placeholder="Put Target eg 99.5%" />
        </div>
        <div className="flex justify-end items-center gap-3">
          {isClose && (
            <CButton
              onClick={() => setNewPolicy(false)}
              className="w-fit border bg-transparent hover:text-white text-IMSLightGreen shadow-none"
            >
              Close
            </CButton>
          )}
          <CButton className=" w-fit shadow-none">Save SLA Policy</CButton>
        </div>
      </div>
    );
  };
  return (
    <div className="bg-white">
      <p className=" text-lg font-bold">SLA Policy Builder</p>
      {Policy && Policy.length > 0 ? (
        <div>
          <div className="grid grid-cols-4 gap-4 my-4">
            {Policy.map((policy) => (
              <div
                key={policy.id}
                className=" p-4 rounded-lg bg-neutral-100 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <p className=" text-lg font-medium">SLA Policy Builder</p>
                  <div className=" text-sm text-rose-500 bg-rose-100 border border-rose-500 px-2 rounded-md flex justify-center items-center">
                    Delete
                  </div>
                </div>
                <p className=" text-base">
                  <span className=" font-medium">SLA Name:</span> {policy.name}
                </p>
                <p className=" text-base">
                  <span className=" font-medium">Priority:</span>{" "}
                  {policy.priority}
                </p>

                <p className=" text-base">
                  <span className=" font-medium">MTTA:</span> {policy.MTTA}
                  (threshold:{policy.MTTAThreshold})
                </p>
                <p className=" text-base">
                  <span className=" font-medium">MTTR:</span> {policy.MTTR}
                  (threshold:{policy.MTTRThreshold})
                </p>
                <p className=" text-base">
                  <span className=" font-medium">Uptime Target:</span>{" "}
                  {policy.uptime_target}
                </p>

                <p className=" text-base">
                  <span className=" font-medium">Escalation Contact:</span>{" "}
                  {policy.escalation_contact}
                </p>

                <p className=" text-base">
                  <span className=" font-medium">Team/Client:</span>{" "}
                  {policy.team ?? "N/A"}
                </p>
              </div>
            ))}
          </div>

          {!newPolicy && (
            <div className="">
              <CButton className=" w-fit" onClick={() => setNewPolicy(true)}>
                Create New Policy
              </CButton>
            </div>
          )}

          {newPolicy && <PolicyBuilder isClose />}
        </div>
      ) : (
        <PolicyBuilder />
      )}
    </div>
  );
};

export default SlaPolicyBuilder;
