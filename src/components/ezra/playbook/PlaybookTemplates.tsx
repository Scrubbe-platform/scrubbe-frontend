import { playbookTemplate } from "@/lib/constant/index";
import React from "react";

type PlaybookTemplatesProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleLoadPlaybook: (value: any) => void;
};

const PlaybookTemplates: React.FC<PlaybookTemplatesProps> = ({
  handleLoadPlaybook,
}) => (
  <div className="flex flex-col gap-2">
    <p className="text-lg font-bold dark:text-white">Templates</p>
    <div className="flex gap-4 mb-6">
      {playbookTemplate?.map((tpl) => (
        <div
          key={tpl.title}
          className="border rounded-lg p-4 w-64 dark:bg-subDark bg-gray-50 flex flex-col justify-between"
        >
          <div>
            <div className="font-semibold mb-2 dark:text-white">
              {tpl.title}
            </div>
            <div className="text-sm mb-4 dark:text-white">
              Respond to unauthorized access attempts with severity-based
              actions.
            </div>
          </div>
          <button
            className="bg-blue-500 text-white rounded px-3 py-1"
            onClick={() => handleLoadPlaybook(tpl)}
          >
            Load
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default PlaybookTemplates;
