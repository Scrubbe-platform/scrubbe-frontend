import React from "react";

const ticketText =
  "Ticket #SCR-001 (High, SOAR Alerts) submitted by John Doe on May 23, 2025, 11:31 PM BST";

const RecentSubmission = () => {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 max-w-2xl mx-auto">
      <div className="space-y-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border-l-4 border-blue-200 rounded-lg p-5 text-gray-800 shadow-sm"
          >
            {ticketText}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentSubmission;
