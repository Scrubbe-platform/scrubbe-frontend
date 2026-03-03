"use client";
import { X } from "lucide-react";
import React, { ReactNode, useState } from "react";
import { Button } from "../ui/button";
import SlackParameter from "./SlackParameter";
import EmailParameter from "./EmailParameter";
import SMSParameter from "./SMSParameter";
import TeamsParameter from "./TeamsParameter";
import ZoomParameter from "./ZoomParameter";
import GoogleChatParameter from "./GoogleChatParameter";
import GoogleMeetParameter from "./GoogleMeetParameter";
import OthersParameter from "./OthersParameter";
import WhatsappParameter from "./WhatsappParameter";
import Select from "../ui/select";
import AuditLogs from "./AuditLogs";
import { useRouter, useSearchParams } from "next/navigation";

const settingOptions = [
  {
    id: "slack",
    title: "Slack",
    enable: false,
  },
  {
    id: "email",
    title: "Email",
    enable: false,
  },
  {
    id: "sms",
    title: "SMS",
    enable: false,
  },
  {
    id: "teams",
    title: "Microsoft Team",
    enable: false,
  },
  {
    id: "zoom",
    title: "Zoom",
    enable: false,
  },
  {
    id: "google-chat",
    title: "Google Chat",
    enable: false,
  },
  {
    id: "google-meet",
    title: "Google Meet",
    enable: false,
  },
  {
    id: "whatsapp",
    title: "Whatsapp",
    enable: false,
  },
  {
    id: "other",
    title: "Other",
    enable: false,
  },
];
const AlertSettings = () => {
  const [settings, setSettings] = useState(
    settingOptions.map((prev) => ({
      ...prev,
      severity: "",
      showSeverities: false,
      isConfigure: false,
    }))
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parameter, setParameter] = useState("");
  const [role, setRole] = useState("");
  const searchParams = useSearchParams();
  const path = searchParams.get("to");
  const handleEnableSetting = (id: number) => {
    setSettings((prev) =>
      prev.map((setting, idx) =>
        idx === id ? { ...setting, enable: !setting.enable } : setting
      )
    );
  };
  const handleShowSeverities = (id: number) => {
    setSettings((prev) =>
      prev.map((setting, idx) =>
        idx === id
          ? { ...setting, showSeverities: !setting.showSeverities }
          : setting
      )
    );
  };
  const handleSetSeverity = (
    id: number,
    severity: "high" | "medium" | "low"
  ) => {
    setSettings((prev) =>
      prev.map((setting, idx) =>
        idx === id ? { ...setting, severity: severity as string } : setting
      )
    );
  };

  let content: ReactNode;

  const handleOpenConfigureParams = (id: string) => {
    setIsModalOpen(true);
    console.log(id);
    setParameter(id);
  };

  const handleEnableAll = () => {
    setSettings((prev) => prev.map((prev) => ({ ...prev, enable: true })));
  };
  const handleDisableAll = () => {
    setSettings((prev) => prev.map((prev) => ({ ...prev, enable: false })));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSetParameter = (value: any) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === parameter
          ? { ...setting, parameter: value, isConfigure: true }
          : setting
      )
    );
    setIsModalOpen(false);
  };

  const handleRestoreDefault = () => {};

  switch (parameter) {
    case settingOptions[0].id:
      content = <SlackParameter handleSave={handleSetParameter} />;
      break;
    case settingOptions[1].id:
      content = <EmailParameter handleSave={handleSetParameter} />;
      break;
    case settingOptions[2].id:
      content = <SMSParameter handleSave={handleSetParameter} />;
      break;
    case settingOptions[3].id:
      content = <TeamsParameter handleSave={handleSetParameter} />;
      break;
    case settingOptions[4].id:
      content = <ZoomParameter handleSave={handleSetParameter} />;
      break;
    case settingOptions[5].id:
      content = <GoogleChatParameter handleSave={handleSetParameter} />;
      break;
    case settingOptions[6].id:
      content = <GoogleMeetParameter handleSave={handleSetParameter} />;
      break;
    case settingOptions[7].id:
      content = <WhatsappParameter handleSave={handleSetParameter} />;
      break;
    case settingOptions[8].id:
      content = <OthersParameter handleSave={handleSetParameter} />;
      break;

    default:
      content = <SlackParameter handleSave={handleSetParameter} />;
      break;
  }
  console.log(settings);

  const router = useRouter();
  const handleSaveSettings = () => {
    if (path && path === "ezra") {
      router.push("/ezra/dashboard");
    } else {
      router.push(`/dashboard`);
    }
  };

  const handleSkip = () => {
    if (path && path === "ezra") {
      router.push("/ezra/dashboard");
    } else {
      router.push(`/dashboard`);
    }
  };
  return (
    <div className=" min-h-screen bg-neutral-50">
      <div className="flex flex-col h-full w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className=" flex justify-between items-center ">
          <h1 className="font-bold text-[22px] sm:text-[24px] lg:text-[28px] xl:text-[30px] leading-[130%] tracking-[1%] text-[#1F2937] py-6 ">
            Scrubbe SOAR Alert Settings
          </h1>
          <button
            onClick={handleSkip}
            type="button"
            className="px-4 py-2 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-[16px] font-medium flex items-center space-x-2"
          >
            <span>Skip</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>
        {/* form */}
        <div className=" p-4 sm:p-6 lg:p-8 bg-white rounded-xl w-full h-full flex-col flex gap-y-2">
          <p className=" font-bold text-lg md:text-xl">Notification Channels</p>
          <p>
            Configure notification channels, severity levels, and parameters
          </p>

          {/* Header */}
          <div className="flex md:flex-row flex-col justify-between md:items-center  mt-4">
            <div className=" flex gap-4">
              <p className=" pt-2 font-medium">User Roles:</p>
              <Select
                className=""
                options={[
                  { value: "", label: "Select role" },
                  { value: "Admin", label: "Admin" },
                  { value: "Manager", label: "Manager" },
                  { value: "Analyst", label: "Analyst" },
                  { value: "Viewer", label: "Viewer" },
                ]}
                value={role}
                onChange={(e) =>
                  setRole(() => (e.target as HTMLSelectElement).value)
                }
              />
            </div>

            <div className=" flex items-center gap-3">
              <div
                onClick={handleEnableAll}
                className=" px-3 py-2 flex cursor-pointer items-center gap-4 border border-zinc-300 rounded-md text-zinc-500 "
              >
                <p className=" text-sm">Enable All</p>
              </div>
              <div
                onClick={handleDisableAll}
                className=" px-3 py-2 flex cursor-pointer items-center gap-4 border border-zinc-300 rounded-md text-zinc-500 "
              >
                <p className=" text-sm">Disable All</p>
              </div>
              <div
                onClick={handleRestoreDefault}
                className=" px-3 py-2 flex cursor-pointer items-center gap-4 border border-zinc-300 rounded-md text-zinc-500 "
              >
                <p className=" text-sm">Restore to Default</p>
              </div>
            </div>
          </div>

          <div className="mt-4 w-full overflow-x-auto">
            <div className="min-w-[800px] flex flex-col gap-4">
              {settings.map((setting, index) => (
                <div
                  key={setting.id}
                  className="grid grid-cols-[.6fr,1.4fr,1fr] h-[89px] gap-3 place-content-center px-4 bg-gray-100 rounded-md"
                >
                  <div className="items-center flex flex-row gap-2">
                    <input
                      id={setting.id}
                      type="checkbox"
                      checked={setting.enable ? true : false}
                      onChange={() => handleEnableSetting(index)}
                      className="w-4 h-4  text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label
                      htmlFor={setting.id}
                      className="text-sm font-semibold"
                    >
                      {setting.title}
                    </label>
                  </div>

                  <div className="flex gap-3 w-full justify-center items-center">
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => handleShowSeverities(index)}
                        className="bg-zinc-200 w-fit px-4 py-1 rounded-sm cursor-pointer"
                      >
                        <p className=" text-xs md:text-sm font-semibold text-zinc-500">
                          {setting.showSeverities ? "Hide" : "Show"} severities
                        </p>
                      </div>
                      {setting.showSeverities ? (
                        <div className="flex items-center gap-2">
                          <div className="items-center flex flex-row gap-2">
                            <input
                              id={"high"}
                              type="checkbox"
                              checked={setting.severity === "high"}
                              onChange={() => handleSetSeverity(index, "high")}
                              className="w-4 h-4  text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <label
                              htmlFor={"high"}
                              className="text-sm text-zinc-500 "
                            >
                              High
                            </label>
                          </div>
                          <div className="items-center flex flex-row gap-2">
                            <input
                              id={"medium"}
                              type="checkbox"
                              checked={setting.severity === "medium"}
                              onChange={() =>
                                handleSetSeverity(index, "medium")
                              }
                              className="w-4 h-4  text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <label
                              htmlFor={"medium"}
                              className="text-sm text-zinc-500 "
                            >
                              Medium
                            </label>
                          </div>
                          <div className="items-center flex flex-row gap-2">
                            <input
                              id={"low"}
                              type="checkbox"
                              checked={setting.severity === "low"}
                              onChange={() => handleSetSeverity(index, "low")}
                              className="w-4 h-4  text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <label
                              htmlFor={"low"}
                              className="text-sm text-zinc-500 "
                            >
                              Low
                            </label>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500 font-medium">
                        Parameter:{" "}
                        {setting.isConfigure ? "Configure" : "Not Configured"}
                      </p>
                    </div>
                  </div>

                  <div className="w-full flex items-center gap-3 justify-end">
                    <Button
                      onClick={() => handleOpenConfigureParams(setting.id)}
                      className="shadow-none bg-blue-600 h-[32px]"
                    >
                      Configure Parameter
                    </Button>
                    <Button className="shadow-none border border-blue-600 text-blue-600 h-[32px]">
                      Test Notification
                    </Button>
                  </div>

                  {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-2 sm:p-6 w-full  sm:max-w-2xl mx-2 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-end">
                          <div
                            onClick={() => setIsModalOpen(false)}
                            className="bg-neutral-100 rounded-sm p-1 w-fit"
                          >
                            <X />
                          </div>
                        </div>
                        {content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className=" justify-end mt-10 flex ">
            <Button
              onClick={handleSaveSettings}
              className=" shadow-none bg-blue-600 px-10"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>

      <AuditLogs />
    </div>
  );
};

export default AlertSettings;
