// @typescript-eslint/no-explicit-any
"use client";
import React from "react";
import { Info } from "lucide-react";
import { RiInformationLine } from "react-icons/ri";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  isLoading?: boolean;
  options: { value: any; label: string }[];
  labelClassName?: string;
  info?: string;
  icon?: React.ReactNode;
}

const Select = ({
  label,
  error,
  isLoading = false,
  options,
  className = "",
  labelClassName = "",
  info,
  icon,
  ...props
}: SelectProps) => {
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
          {label}{" "}
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
      <div
        className={`w-full dark:text-white  h-[42px] bg-transparent text-sm px-3 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isLoading
            ? "border-gray-400 bg-gray-50 opacity-70 cursor-not-allowed"
            : "border-gray-400"
        } ${error ? "border-red-500" : ""} ${className}`}
      >
        <select
          className="w-full bg-transparent h-full rounded-md outline-none"
          disabled={isLoading}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className={`text-black`}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex gap-1 items-center">
          <Info size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
