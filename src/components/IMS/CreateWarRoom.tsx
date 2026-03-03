import React, { useState } from "react";
import CButton from "../ui/Cbutton";

const CreateWarRoom = ({ onClose }: { onClose: () => void }) => {
  const [platform, setPlatform] = useState("slack");
  return (
    <div className=" space-y-4">
      <p className=" font-semibold">Create a War Room?</p>
      <p className=" text-base">
        You’ve marked this incident as Critical. Would you like 11pce to
        automatically create a war room for faster coordination?
      </p>
      <p className=" text-base">
        Choose where you will want the war room to be created
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <label htmlFor="slack" className="flex items-center gap-2">
          <input
            id="slack"
            checked={platform === "slack"}
            onChange={() => {
              setPlatform("slack");
            }}
            type="radio"
          />
          <p className=" text-base">Slack</p>
        </label>
        <label htmlFor="google-meet" className="flex items-center gap-2">
          <input
            id="google-meet"
            checked={platform === "google-meet"}
            onChange={() => {
              setPlatform("google-meet");
            }}
            type="radio"
          />
          <p className=" text-base">Google Meet</p>
        </label>
        <label htmlFor="teams" className="flex items-center gap-2">
          <input
            id="teams"
            checked={platform === "teams"}
            onChange={() => {
              setPlatform("teams");
            }}
            type="radio"
          />
          <p className=" text-base">Microsoft Team</p>
        </label>
        <label htmlFor="zoom" className="flex items-center gap-2">
          <input
            id="zoom"
            checked={platform === "zoom"}
            onChange={() => {
              setPlatform("zoom");
            }}
            type="radio"
          />
          <p className=" text-base">Zoom</p>
        </label>
      </div>

      <div className="flex gap-3 justify-end items-center">
        <CButton
          onClick={onClose}
          className=" border border-IMSLightGreen bg-transparent text-IMSLightGreen hover:text-white w-fit"
        >
          No, Later
        </CButton>
        <CButton className=" w-fit">Create War Room</CButton>
      </div>
    </div>
  );
};

export default CreateWarRoom;
