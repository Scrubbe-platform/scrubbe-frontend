import Input from "@/components/ui/input";
import CButton from "@/components/ui/Cbutton";
import React, { useEffect, useState } from "react";

const SendAlertModal = ({
  closeModal,
  config,
  initialConfig,
}: {
  closeModal: () => void;
  config: (value: unknown) => void;
  initialConfig: {
    type: string;
    channel: string;
    email: string;
    message: string;
  };
}) => {
  const [alertConfiguration, setAlertConfiguration] = useState({
    type: "email",
    channel: "",
    email: "",
    message: "",
  });
  const handleSave = () => {
    const data = alertConfiguration;
    config(data);
    closeModal();
  };
  useEffect(() => {
    if (initialConfig) {
      setAlertConfiguration(
        initialConfig ?? {
          type: "email",
          channel: "",
          email: "",
          message: "",
        }
      );
    }
  }, [initialConfig]);
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold dark:text-white">
        Configure Send Alert
      </h2>
      <div className="flex gap-3 items-center">
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="email-type"
            name="type"
            value="email"
            checked={alertConfiguration.type === "email"}
            onChange={(e) => {
              setAlertConfiguration((prev) => ({
                ...prev,
                type: e.target.value as "email" | "slack",
              }));
            }}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
          />
          <label
            htmlFor="email-type"
            className="text-sm text-gray-700 dark:text-white"
          >
            Send through email
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="slack-type"
            name="type"
            value="slack"
            checked={alertConfiguration.type === "slack"}
            onChange={(e) => {
              setAlertConfiguration((prev) => ({
                ...prev,
                type: e.target.value as "email" | "slack",
              }));
            }}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
          />
          <label
            htmlFor="slack-type"
            className="text-sm text-gray-700 dark:text-white"
          >
            Send through slack
          </label>
        </div>
      </div>
      <>
        {alertConfiguration.type == "email" ? (
          <Input
            label="Recipient Email"
            placeholder="admin@scrubble.com"
            value={alertConfiguration.email}
            onChange={(e) =>
              setAlertConfiguration((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
          />
        ) : (
          <Input
            label="Slack Channel"
            placeholder="enter slack channel"
            value={alertConfiguration.channel}
            onChange={(e) =>
              setAlertConfiguration((prev) => ({
                ...prev,
                channel: e.target.value,
              }))
            }
          />
        )}
      </>
      <div className="space-y-2 -mt-2">
        <p className="dark:text-white font-medium text-sm ">Message</p>
        <textarea
          rows={4}
          placeholder="Enter message"
          value={alertConfiguration.message}
          onChange={(e) =>
            setAlertConfiguration((prev) => ({
              ...prev,
              message: e.target.value,
            }))
          }
          className="w-full bg-transparent dark:text-white border border-gray-300 rounded-md p-2 text-sm "
        />
      </div>
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

export default SendAlertModal;
