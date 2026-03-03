"use client";
import * as React from "react";
import Input from "./input";
import { BsEyeSlash } from "react-icons/bs";
import { EyeIcon } from "lucide-react";

interface PasswordRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

interface PasswordInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange"
  > {
  label?: string;
  showRequirements?: boolean;
  error?: string;
  value: string;
  onValueChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(
  ({
    label = "Password",
    showRequirements = true,
    onValidationChange,
    error,
    value,
    onValueChange,
    ...props
  }) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [requirements, setRequirements] = React.useState<
      PasswordRequirement[]
    >([
      {
        label: "At least 8 characters",
        regex: /.{8,}/,
        met: false,
      },
      {
        label: "At least one uppercase letter",
        regex: /[A-Z]/,
        met: false,
      },
      {
        label: "At least one lowercase letter",
        regex: /[a-z]/,
        met: false,
      },
      {
        label: "At least one number",
        regex: /[0-9]/,
        met: false,
      },
      {
        label: "At least one special character",
        regex: /[!@#$%^&*(),.?":{}|<>]/,
        met: false,
      },
    ]);

    // Update requirements whenever value changes
    React.useEffect(() => {
      const updatedRequirements = requirements.map((req) => ({
        ...req,
        met: req.regex.test(value),
      }));
      setRequirements(updatedRequirements);

      // Check if all requirements are met
      const isValid = updatedRequirements.every((req) => req.met);
      onValidationChange?.(isValid);
    }, [value, onValidationChange]);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange(e.target.value);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            label={label}
            value={value}
            onChange={handlePasswordChange}
            // className={className}
            {...props}
            labelClassName="text-white"
            className="text-white"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-[70%] -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            {showPassword ? (
              <BsEyeSlash className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        )}

        {showRequirements && (
          <div className="mt-2 space-y-1">
            {requirements.map((requirement, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    requirement.met
                      ? "bg-primary-500"
                      : "bg-zinc-300 dark:bg-zinc-600"
                  }`}
                />
                <span
                  className={`${
                    requirement.met
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {requirement.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
