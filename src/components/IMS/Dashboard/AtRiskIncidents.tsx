// AtRiskIncidents.tsx

import EmptyState from "@/components/ui/EmptyState";
import React from "react";

interface Incident {
  id: string;
  name: string;
  breachTime: string;
}

interface Props {
  incidents: Incident[];
}

const AtRiskIncidents: React.FC<Props> = ({ incidents }) => {
  return (
    <div className="bg-white p-6 rounded-lg">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        At Risk Incidents
      </h2>

      {/* Incidents List */}
      <div className="space-y-4">
        {incidents && incidents.length > 0 ? (
          <>
            {incidents.map((incident, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="text-gray-700 text-sm">
                  <span className="font-bold">{incident.id}:</span>{" "}
                  {incident.name}
                </div>
                <span className="bg-red-100 text-red-700 font-medium px-3 py-1 rounded-full text-sm">
                  {incident.breachTime}
                </span>
              </div>
            ))}
          </>
        ) : (
          <EmptyState
            title="No Incident at risk yet! "
            description="Add new incident to get started."
          />
        )}
      </div>
    </div>
  );
};

export default AtRiskIncidents;
