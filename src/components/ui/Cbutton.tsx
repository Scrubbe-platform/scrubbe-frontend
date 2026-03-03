import React, { ReactNode } from "react";
import { Button } from "./button";

const IS_STANDALONE = process.env.NEXT_PUBLIC_IS_STANDALONE === "true";

interface Props {
  isLoading?: boolean;
  onClick?: () => void;
  children: ReactNode;
  type?: "submit" | "button";
  disabled?: boolean;
  className?: string;
}
const CButton = ({
  children,
  isLoading,
  onClick,
  type = "button",
  disabled,
  className,
}: Props) => {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      size={"default"}
      className={`w-full h-10 text-black !py-2 px-3 rounded-md transition-colors disabled:opacity-40 ${
        IS_STANDALONE
          ? "bg-IMSCyan hover:bg-IMSCyan "
          : "bg-blue-600 hover:bg-blue-800"
      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
      ${className}
      `}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-4 w-4 text-black"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {children}
        </div>
      ) : (
        <>{children}</>
      )}
    </Button>
  );
};

export default CButton;
