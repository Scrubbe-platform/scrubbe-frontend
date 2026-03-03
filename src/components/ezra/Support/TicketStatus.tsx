import React from "react";

const statusLogs = [
  {
    id: "SCR-001",
    timeStamp: "2025-05-22 09:00",
    status: "Open",
  },
  {
    id: "SCR-002",
    timeStamp: "2025-05-22 09:00",
    status: "In Progress",
  },
  {
    id: "SCR-003",
    timeStamp: "2025-05-22 09:00",
    status: "Cancel",
  },
];

const TicketStatus = () => {
  return (
    <div className="border border-[#61A5F9] rounded-lg overflow-hidden">
      <table className="w-full">
        {/* Table Header */}
        <thead className="bg-[#EFF6FF]">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b border-[#61A5F9]">
              Time Stamp
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b border-[#61A5F9] border-l ">
              Event
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b border-[#61A5F9] border-l ">
              Status
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="bg-white divide-y divide-[#61A5F9]">
          {statusLogs.length > 0 ? (
            statusLogs.map((log, index) => (
              <tr
                key={log.id || index}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-gray-900 border-r border-[#61A5F9]">
                  {log.id}
                </td>

                <td className="px-6 py-4 text-sm text-gray-900 border-r border-[#61A5F9]">
                  {log.timeStamp}
                </td>
                <td className="px-6 py-4 text-sm border-r border-[#61A5F9]">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full`}
                  >
                    {log.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={3}
                className="px-6 py-8 text-center text-sm text-gray-500"
              >
                No logs available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TicketStatus;
