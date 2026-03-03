import usePlaybookActionModal from "@/hooks/usePlaybookActionModal";
import React from "react";

type Props = {
  metrics: string[];
  selectedMetric: string | null;
};
const PlaybookMetrics = ({ metrics, selectedMetric }: Props) => {
  const { handleClickAction, viewModalAction } = usePlaybookActionModal();

  return (
    <div className="flex flex-col gap-2 ">
      <p className="text-lg font-bold dark:text-white">Metrics</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {metrics?.map((action) => {
          const isDisabled = selectedMetric && selectedMetric !== action;
          return (
            <button
              key={action}
              draggable={!isDisabled}
              disabled={!!isDisabled}
              onClick={() => !isDisabled && handleClickAction(action)}
              onDragStart={
                !isDisabled
                  ? (e) => e.dataTransfer.setData("metric", action)
                  : undefined
              }
              className={
                isDisabled
                  ? "border border-colorScBlue px-3 py-2 rounded bg-transparent text-colorScBlue text-sm opacity-50 cursor-not-allowed"
                  : "border border-colorScBlue px-3 py-2 rounded bg-transparent text-colorScBlue hover:bg-colorScBlue hover:text-white text-sm"
              }
            >
              {action}
            </button>
          );
        })}
        <button className=" px-3 py-2 rounded bg-colorScBlue text-white text-sm">
          + Add custom action
        </button>
        {viewModalAction}
      </div>
    </div>
  );
};

export default PlaybookMetrics;
