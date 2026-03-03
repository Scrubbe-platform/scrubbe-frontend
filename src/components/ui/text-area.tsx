"use client";

import { Info } from "lucide-react";
import React from "react";
import { RiInformationLine } from "react-icons/ri";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  isLoading?: boolean;
  type?: string;
  icon?: React.ReactNode;
  labelClassName?: string;
  info?: string;
}

const TextArea = ({
  label,
  error,
  isLoading = false,
  icon,
  className = "",
  labelClassName = "",
  info,
  ...props
}: TextareaProps) => {
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={props.id}
          className={`flex gap-2 items-center dark:text-white mb-2 text-sm font-medium ${
            isLoading ? "text-gray-500" : "text-gray-700"
          } ${labelClassName}`}
        >
          {icon && <div className="">{icon}</div>}
          {label} {props.required && "*"}
          {info && (
            <div className="group relative">
              <RiInformationLine className=" text-IMSLightGreen cursor-pointer" />
              <div className="group-hover:block hidden absolute -top-[60px] -left-[90px] text-center  w-[200px] rounded-lg p-3 bg-black bg-opacity-80 text-white z-50 ">
                {info}
              </div>
            </div>
          )}
        </label>
      )}
      <div className="relative">
        <textarea
          className={`w-full dark:text-white bg-transparent px-3 text-sm py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isLoading
              ? "border-gray-400 bg-gray-50 opacity-70 cursor-not-allowed"
              : "border-gray-400"
          } ${error ? "border-red-500" : ""} ${className}`}
          disabled={isLoading}
          rows={4}
          {...props}
        />

        {/* {icon && !isPasswordType && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {icon}
          </div>
        )} */}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex gap-1 items-center">
          {" "}
          <Info size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

export default TextArea;
