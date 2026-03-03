// RecurringIssuesTable.tsx

import EmptyState from "@/components/ui/EmptyState";
import React from "react";

interface Issue {
  issue: string;
  count: number;
}

interface Props {
  issues: Issue[];
}

const RecurringIssuesTable: React.FC<Props> = ({ issues }) => {
  return (
    <div className="bg-white p-6 rounded-lg w-full">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Recurring Issues Table (Top 5)
      </h2>

      {/* Issues List */}
      <div className="space-y-4">
        {issues && issues?.length > 0 ? (
          <>
            {issues?.map((issue, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
              >
                <span className="text-gray-700 text-base">{issue?.issue}</span>
                <span className="bg-red-100 text-red-700 font-medium px-3 py-1 rounded-md text-sm">
                  {issue?.count} Incidents
                </span>
              </div>
            ))}
          </>
        ) : (
          <EmptyState
            title="No Recurring Issue "
            description="Add new incident to get started."
          />
        )}
      </div>
    </div>
  );
};

export default RecurringIssuesTable;
