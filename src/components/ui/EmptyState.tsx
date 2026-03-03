// EmptyState.tsx
import React, { ReactNode } from "react";

interface EmptyStateProps {
  /** The title to display in the empty state. */
  title?: string;
  /** A descriptive text to provide more context. */
  description?: string;
  /** An optional image or icon to display. */
  image?: ReactNode;
  /** A button or other action to encourage user interaction. */
  action?: ReactNode;
  /** Custom classes for the main container. */
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data to display",
  description = "Add new data to get started.",
  image,
  action,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center text-gray-500 rounded-lg border border-dashed border-gray-300 bg-dark ${className}`}
    >
      {image && <div className="mb-4 text-white">{image}</div>}
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
