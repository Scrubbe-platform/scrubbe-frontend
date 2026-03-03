// components/ChatMessage.tsx
import React, { useState } from "react";
import CreateIncident from "../IncidentTicket/CreateIncident";

interface ChatMessageProps {
  type: "ai" | "user";
  children: React.ReactNode;
  timestamp?: string;
  className?: string;
  showAction?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  type,
  children,
  timestamp,
  className,
}) => {
  const [openCreateIncident, setOpenCreateIncident] = useState(false);

  const isAI = type === "ai";
  const bubbleClasses = isAI
    ? "bg-transparent text-white  max-w-4xl rounded-bl-none"
    : "bg-gray-700 text-gray-100  max-w-2xl rounded-br-none ml-auto";

  return (
    <div
      className={`flex ${
        isAI ? "justify-start" : "justify-end"
      } mb-4 animate-fade-in ${className}`}
    >
      <div className={` p-4 rounded-lg text-base shadow-md ${bubbleClasses}`}>
        {children}
        {timestamp && (
          <div
            className={`mt-2 text-xs ${
              isAI ? "text-blue-200" : "text-gray-300"
            } text-right`}
          >
            {timestamp}
          </div>
        )}

        {/* {showAction && isAI && (
          <button
            onClick={() => setOpenCreateIncident(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <HiOutlineExclamationCircle className="text-xl" />
            <span>Raise Incident</span>
          </button>
        )} */}
      </div>

      {isAI && (
        <CreateIncident
          isModal={true}
          isOpen={openCreateIncident}
          onClose={() => setOpenCreateIncident(false)}
        />
      )}
    </div>
  );
};
