// RecentPostmortems.tsx

import React from "react";

interface Postmortem {
  id: string;
  title: string;
  published: string;
}

interface Props {
  postmortems: Postmortem[];
}

const RecentPostmortems: React.FC<Props> = ({ postmortems }) => {
  return (
    <div className="bg-white p-6 rounded-lg">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Recent Postmortems (Last 5)
      </h2>

      {/* Postmortems List */}
      <div className="space-y-4">
        {postmortems.map((postmortem, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
          >
            <span className="text-green-600 font-medium text-base">
              {postmortem.id}: {postmortem.title}
            </span>
            <span className="text-gray-500 font-medium text-sm">
              Published : {postmortem.published}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentPostmortems;
