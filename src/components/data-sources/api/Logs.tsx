interface LogEntry {
  id: string;
  timeStamp: string;
  event: string;
  status: "Successful" | "Failed" | "Pending" | "Warning";
}

interface LogsProps {
  logs?: LogEntry[];
}

const Logs: React.FC<LogsProps> = ({ logs = [] }) => {
  // Sample data for demonstration - replace with actual API data
  const sampleLogs: LogEntry[] = [
    {
      id: "1",
      timeStamp: "2025-05-22 09:00",
      event: "Data Ingestion Started",
      status: "Successful",
    },
    {
      id: "2",
      timeStamp: "2025-05-22 09:00",
      event: "Processed 500mb",
      status: "Successful",
    },
  ];

  const displayLogs = logs.length > 0 ? logs : sampleLogs;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "successful":
        return "text-green-600 bg-green-50";
      case "failed":
        return "text-red-600 bg-red-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "warning":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="w-full h-auto bg-white p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Postgres Log</h1>
      </div>

      {/* Table Container */}
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
            {displayLogs.length > 0 ? (
              displayLogs.map((log, index) => (
                <tr
                  key={log.id || index}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 border-r border-[#61A5F9]">
                    {log.timeStamp}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 border-r border-[#61A5F9]">
                    {log.event}
                  </td>
                  <td className="px-6 py-4 text-sm border-r border-[#61A5F9]">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        log.status
                      )}`}
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
    </div>
  );
};

export default Logs;
