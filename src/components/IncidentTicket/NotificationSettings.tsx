import React, { useEffect, useRef, useState } from "react";
import Modal from "../ui/Modal";
import { IoWarning } from "react-icons/io5";
import Select from "../ui/select";
import CButton from "../ui/Cbutton";
import CreateIncident from "./CreateIncident";

const NotificationList = [
  {
    id: "1",
    title: "Fraud Alert",
    description: "Notification 1 description",
    createdAt: "2021-01-01 12:00:00",
    name: "John Doe",
  },
  {
    id: "2",
    title: "Suspicious Activity",
    description: "Notification 2 description",
    createdAt: "2021-01-01 12:00:00",
    name: "Jane Doe",
  },
  {
    id: "3",
    title: "Unusual Activity",
    description: "Notification 3 description",
    createdAt: "2021-01-01 12:00:00",
    name: "John Doe",
  },
];

type NotificationSettingsProps = {
  isOpen: boolean;
  onClose: () => void;
};
const NotificationSettings = ({
  isOpen,
  onClose,
}: NotificationSettingsProps) => {
  const [isNotifyIncident, setIsNotifyIncident] = useState(false);
  const [isCreateIncident, setIsCreateIncident] = useState(false);
  const [isMuteAlerts, setIsMuteAlerts] = useState(false);
  const [muteOption, setMuteOption] = useState("");
  const [customDuration, setCustomDuration] = useState("");
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [actionSelected, setActionSelected] = useState<{
    [key: string]: string;
  }>({});
  const statusFilterRef = useRef<HTMLDivElement>(null);

  const handleSelectAction = (action: string, id: string) => {
    if (action === "notify-manager") {
      setIsNotifyIncident(true);
    }
    if (action === "mute-alerts") {
      setIsMuteAlerts(true);
    }
    if (action === "create-incident") {
      setIsCreateIncident(true);
    }
    setDropdownOpenId(null);
    console.log({ action, id });
  };

  useEffect(() => {
    if (!dropdownOpenId) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target as Node)
      ) {
        setDropdownOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpenId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h1 className="text-2xl font-bold dark:text-white">
          Notification Center
        </h1>

        <div className="mt-5">
          {NotificationList.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b border-gray-200 dark:border-gray-700 py-3 last:border-b-0"
            >
              <div className="flex gap-4">
                <div className="text-red-500 dark:bg-red-700/10 bg-red-10 w-10 h-10 rounded-full flex justify-center items-center">
                  <IoWarning size={23} />
                </div>

                <div className="flex flex-col gap-1">
                  <p className="font-bold text-red-500">{item.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <b>{item.name}</b>{" "}
                    <span className="text-black dark:text-white">
                      {item.description}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.createdAt}
                  </p>
                </div>
              </div>

              {/* change this to a menu */}
              <div className="relative">
                <button
                  onClick={() =>
                    setDropdownOpenId((prev) =>
                      prev === item.id ? null : item.id
                    )
                  }
                  className="w-fit min-w-[180px] px-4 py-2 text-left dark:bg-transparent bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between !text-sm !h-10"
                  type="button"
                >
                  <span className={"text-gray-900 dark:text-white"}>
                    {actionSelected[item.id] || "Select Action"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      dropdownOpenId === item.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {dropdownOpenId === item.id && (
                  <div
                    ref={statusFilterRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
                  >
                    {[
                      { label: "Create an incident", value: "create-incident" },
                      { label: "Download as log", value: "download-as-log" },
                      { label: "Notify Manager", value: "notify-manager" },
                      { label: "Mute-alerts", value: "mute-alerts" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          handleSelectAction(option.value, item.id);
                          setActionSelected((prev) => ({
                            ...prev,
                            [item.id]: option.label,
                          }));
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-gray-900 first:rounded-t-md last:rounded-b-md"
                        type="button"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <CButton className="w-fit " onClick={onClose}>
            Close
          </CButton>
        </div>
      </div>

      <CreateIncident
        isModal={true}
        isOpen={isCreateIncident}
        onClose={() => setIsCreateIncident(false)}
      />

      <Modal
        isOpen={isNotifyIncident}
        onClose={() => setIsNotifyIncident(false)}
      >
        <div className="p-4 space-y-5">
          <h1 className="text-2xl font-bold dark:text-white">
            Notify Security Manager/ Analyst
          </h1>

          <p>
            <span className="text-red-500">Channel not configured</span>
            <span className="text-blue-500 cursor-pointer underline">
              Configure in alert center
            </span>
          </p>

          <Select
            options={[
              { label: "Email", value: "email" },
              { label: "SMS", value: "sms" },
            ]}
            label="Channel"
          />

          <div className="flex gap-2 justify-end">
            <CButton
              className="w-fit border hover:text-white border-gray-300 text-colorScBlue dark:border-gray-700 bg-transparent"
              onClick={() => {
                setIsNotifyIncident(false);
              }}
            >
              Close
            </CButton>
            <CButton className="w-fit">Save</CButton>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isMuteAlerts}
        onClose={() => {
          setIsMuteAlerts(false);
          setMuteOption("");
          setCustomDuration("");
        }}
      >
        <div className="p-4 space-y-5">
          <h1 className="text-2xl font-bold dark:text-white">Mute Alerts</h1>
          <Select
            options={[
              { label: "1 hour", value: "1-hour" },
              { label: "6 hours", value: "6-hours" },
              { label: "24 hours", value: "24-hours" },
              { label: "Custom Duration", value: "custom" },
              { label: "False Positive", value: "false-positive" },
              { label: "Known Alert", value: "known-alert" },
            ]}
            label="Mute Option"
            onChange={(e) => setMuteOption(e.target.value)}
            value={muteOption}
          />

          {muteOption === "custom" && (
            <Select
              options={[
                { label: "1", value: "1" },
                { label: "2", value: "2" },
                { label: "3", value: "3" },
                { label: "4", value: "4" },
                { label: "5", value: "5" },
                { label: "6", value: "6" },
                { label: "7", value: "7" },
                { label: "8", value: "8" },
              ]}
              label="Custom Duration"
              onChange={(e) => setCustomDuration(e.target.value)}
              value={customDuration}
            />
          )}

          <div className="flex gap-2 justify-end">
            <CButton
              className="w-fit border hover:text-white border-gray-300 text-colorScBlue dark:border-gray-700 bg-transparent"
              onClick={() => {
                setIsMuteAlerts(false);
                setMuteOption("");
              }}
            >
              Close
            </CButton>
            <CButton className="w-fit">Apply</CButton>
          </div>
        </div>
      </Modal>
    </Modal>
  );
};

export default NotificationSettings;
