"use client";

import { Info } from "lucide-react";
import React, { useState } from "react";
import { RiInformationLine } from "react-icons/ri";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isLoading?: boolean;
  type?: string;
  icon?: React.ReactNode;
  labelClassName?: string;
  info?: string;
}

const Input = ({
  label,
  error,
  isLoading = false,
  type = "text",
  icon,
  className = "",
  labelClassName = "",
  info,
  ...props
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";

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
        <input
          type={isPasswordType ? (showPassword ? "text" : "password") : type}
          className={`w-full read-only:opacity-70 dark:text-white bg-transparent h-[42px] px-3 text-sm py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isLoading
              ? "border-gray-300 bg-gray-50 opacity-70 cursor-not-allowed"
              : "border-gray-400"
          } ${error ? "border-red-500" : ""} ${className}`}
          disabled={isLoading}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
              isLoading ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex gap-1 items-center pt-1">
          {" "}
          <Info size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
