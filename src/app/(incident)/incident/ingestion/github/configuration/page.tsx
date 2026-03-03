"use client";
import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import { Checkbox } from "@heroui/react";
import { Copy } from "lucide-react";
import React, { useState } from "react";

// --- Placeholder Components (You would use your actual components here) ---

// --- Main Component ---

const IntegrationSettingsUI = () => {
  const [events, setEvents] = useState<{ [key: string]: boolean }>({
    pushFailure: true,
    pullRequestFailure: false,
    buildFailure: false,
    testFailure: false,
    pipelineTimeout: false,
    deploymentFailure: false,
    securityScanFailure: false,
  });

  const webhookUrl = "https://incidents.scrubbe.com/webhook/abc123";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEventChange = (key: any) => {
    setEvents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      alert("Webhook URL copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white  space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Integration</h1>

      {/* --- Repository Selection --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Repository Selection
        </h2>
        <p className="text-sm text-gray-600">
          Choose one or more repositories to monitor for specific events like
          deployment or build failures.
        </p>

        <div className="space-y-1">
          <label
            htmlFor="repo-select"
            className="block text-sm font-medium text-gray-700"
          >
            Select Repository
          </label>
          <Input
            id="repo-select"
            value="No repository found"
            readOnly
            className="text-gray-500 bg-gray-100 cursor-not-allowed"
          />
          <p className="text-sm text-red-600 pt-1">
            No repositories found - Please connect Github/Gitlab
          </p>
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* --- Events --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Events</h2>
        <p className="text-sm text-gray-600">
          Select CI/CD/pipeline events to monitor, such as build or deployment
          failures, to create incidents.
        </p>

        <div className="grid grid-cols-2 gap-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={events.pushFailure}
              onChange={() => handleEventChange("pushFailure")}
            />
            <span className="text-base"> Push Event Failure</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={events.pushFailure}
              onChange={() => handleEventChange("pushFailure")}
            />
            <span className="text-base"> Push Event Failure</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={events.pushFailure}
              onChange={() => handleEventChange("pushFailure")}
            />
            <span className="text-base"> Push Event Failure</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={events.pushFailure}
              onChange={() => handleEventChange("pushFailure")}
            />
            <span className="text-base"> Push Event Failure</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={events.pushFailure}
              onChange={() => handleEventChange("pushFailure")}
            />
            <span className="text-base"> Push Event Failure</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={events.pushFailure}
              onChange={() => handleEventChange("pushFailure")}
            />
            <span className="text-base"> Push Event Failure</span>
          </div>
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* --- Incident Mapping --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Incident Mapping
        </h2>
        <p className="text-sm text-gray-600">
          Set the default priority for incidents created from selected events
          (P1–P4, where P1 is Critical).
        </p>

        <div className="w-full sm:max-w-xs space-y-1">
          <label
            htmlFor="incident-priority"
            className="block text-sm font-medium text-gray-700"
          >
            Incident Priority
          </label>
          {/* This would typically be a Select component */}
          <Input
            id="incident-priority"
            value="P3-Medium"
            readOnly
            className="text-gray-500 bg-gray-100 cursor-default"
          />
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* --- Webhook Configuration --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Webhook Configuration
        </h2>
        <p className="text-sm text-gray-600">
          Copy the webhook URL and secret token to set up secure event delivery
          in your GitHub/GitLab repository settings.
        </p>

        <div className="space-y-1">
          <label
            htmlFor="webhook-url"
            className="block text-sm font-medium text-gray-700"
          >
            Incident Priority
          </label>
          <div className="flex rounded-md shadow-sm">
            <div className=" max-w-xl w-full">
              <Input
                id="webhook-url"
                value={webhookUrl}
                readOnly
                className="flex-grow rounded-r-none border-r-0 bg-gray-50 text-gray-700 truncate flex-1"
              />
            </div>
            <CButton onClick={handleCopy} className=" w-fit">
              Copy <Copy />
            </CButton>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IntegrationSettingsUI;
