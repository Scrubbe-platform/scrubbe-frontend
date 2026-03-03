import React from "react";

const socData = [
  {
    timestamp: "(2025-05-31 13:45:00)",
    incident: "Phishing email detected",
    source: "Microsoft 365",
    priority: "High",
    action: "Block Sender, Notify User",
  },
  {
    timestamp: "(2025-05-31 14:01:00)",
    incident: "Failed Login Attempt",
    source: "Okta",
    priority: "High",
    action: "Block IP, Reset Password",
  },
  {
    timestamp: "(2025-05-31 14:03:36)",
    incident: "Suspicious File Download",
    source: "Crowdstrike",
    priority: "Medium",
    action: "Quarantine File, Scan Endpoint",
  },
  {
    timestamp: "(2025-05-31 14:06:00)",
    incident: "Anomalous Traffic",
    source: "Cisco Umbrella",
    priority: "Low",
    action: "Monitor, Update Rules",
  },
];

const integrations = [
  { name: "ProgesSQL", icon: "/postgres.png" },
  { name: "Amazon", icon: "/amazon.svg" },
  { name: "Azure", icon: "/azure.png" },
  { name: "GCP", icon: "/gcp.png" },
  { name: "Okta", icon: "/okta.png" },
  { name: "Splunk>", icon: null },
  { name: "Crowdstrike", icon: "/crowdstrike.png" },
  { name: "Cisco", icon: "/cisco.png" },
  { name: null, icon: "/servicenow.png" },
  { name: "50+more", icon: null },
];

const LiveSOC = () => {
  return (
    <section className="w-full py-16 px-2 sm:px-6 md:px-12 relative">
      <div className="h-[400px] w-[400px] rounded-full bg-colorScBlue/20 absolute top-[-20px] left-[-20px] z-0 blur-3xl" />
      <div className="max-w-7xl mx-auto z-10 relative flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-2">
          Live SOC Analyst Dashboard
        </h2>
        <div className="w-24 h-1 bg-teal-400 mx-auto mb-6 rounded-full" />
        <p className="text-zinc-200 text-center mb-8 max-w-2xl">
          Monitor incidents in real-time with Ezra&apos;s AI-driven dashboard,
          prioritizing alerts and recommending actions.
        </p>
        <div className="w-full overflow-x-auto mb-12">
          <table className="min-w-full border-separate border-spacing-0 rounded-b-none rounded-xl overflow-hidden dashboard-table bg-subDarkEzra">
            <thead>
              <tr className="bg-blue-500 text-white ">
                <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
                <th className="px-4 py-3 text-left font-semibold">Incident</th>
                <th className="px-4 py-3 text-left font-semibold">Source</th>
                <th className="px-4 py-3 text-left font-semibold">Priority</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {socData.map((row, idx) => (
                <tr key={idx} className={"bg-subDarkEzra text-white"}>
                  <td className="px-4 py-3 border-b border-r border-blue-500 whitespace-nowrap">
                    {row.timestamp}
                  </td>
                  <td className="px-4 py-3 border-b border-r border-blue-500 whitespace-nowrap">
                    {row.incident}
                  </td>
                  <td className="px-4 py-3 border-b border-r border-blue-500 whitespace-nowrap">
                    {row.source}
                  </td>
                  <td className="px-4 py-3 border-b border-r border-blue-500 whitespace-nowrap">
                    {row.priority}
                  </td>
                  <td className="px-4 py-3 border-b border-blue-500 whitespace-nowrap">
                    {row.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2 mt-8">
          Unleash Your SOC&apos;s Potential
        </h3>
        <div className="w-24 h-1 bg-teal-400 mx-auto mb-4 rounded-full" />
        <p className="text-zinc-200 text-center mb-8 max-w-2xl">
          Join leading enterprises using Ezra with integrations including:
        </p>
        <div className="w-full flex flex-wrap justify-center gap-4 md:gap-6">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="bg-white border border-zinc-700 rounded-lg px-6 gap-2 flex items-center min-w-[120px] h-[50px] shadow-md"
            >
              {/* Icon placeholder */}
              {integration.icon && (
                <div className="w-full h-8  flex items-center justify-center">
                  {/* TODO: Insert icon here */}

                  <img
                    src={integration.icon}
                    alt={integration.name ?? "servicenow"}
                    className="object-cover w-full h-8"
                  />
                </div>
              )}
              {integration.name && (
                <span className="text-black  font-medium text-base text-center">
                  {integration.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveSOC;
