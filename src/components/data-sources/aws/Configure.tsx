"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiInfo, FiChevronDown } from "react-icons/fi";
import CodeHighlighter from "@/lib/highlightjs/CodeHighlighter";

// Zod schema for form validation
const awsConfigSchema = z.object({
  accessKey: z.string().min(1, "Access key is required"),
  secretKey: z.string().min(1, "Secret key is required"),
  region: z.string().min(1, "Region is required"),
  host: z.string().min(1, "Host is required"),
  port: z
    .string()
    .min(1, "Port is required")
    .regex(/^\d+$/, "Port must be a number"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  database: z.string().min(1, "Database is required"),
  table: z.string().min(1, "Table is required"),
  schema: z.string().min(1, "Schema is required"),
  frequency: z.string().min(1, "Frequency is required"),
});

type AwsConfigForm = z.infer<typeof awsConfigSchema>;

const Configure: React.FC = () => {
  const [showSchemaExample, setShowSchemaExample] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AwsConfigForm>({
    resolver: zodResolver(awsConfigSchema),
    defaultValues: {
      accessKey: "",
      secretKey: "",
      region: "",
      host: "",
      port: "",
      username: "",
      password: "",
      database: "",
      table: "",
      schema: "",
      frequency: "disabled",
    },
  });

  const onSubmit = async (data: AwsConfigForm) => {
    try {
      console.log("Form data:", data);
      // Handle save logic here
      // await saveAwsConfiguration(data);
    } catch (error) {
      console.error("Error saving configuration:", error);
    }
  };

  const renderInput = (
    name: keyof AwsConfigForm,
    label: string,
    placeholder: string,
    type: string = "text"
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          errors[name] ? "border-red-500" : "border-gray-300"
        }`}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-500">{errors[name]?.message}</p>
      )}
    </div>
  );

  return (
    <div className="w-full h-full bg-white p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        Aws Configuration
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="gap-y-4 flex flex-col justify-between h-full"
      >
        {/* Access Key and Secret Key Row */}
        <div className=" flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            {renderInput("accessKey", "Access key", "AWS access key")}
            {renderInput(
              "secretKey",
              "Secret key",
              "AWS secret key",
              "password"
            )}
          </div>

          {/* Region and Host Row */}
          <div className="grid grid-cols-2 gap-4">
            {renderInput("region", "Region", "eg, US-east-1")}
            {renderInput("host", "Host", "eg, db.example.com")}
          </div>

          {/* Port and Username Row */}
          <div className="grid grid-cols-2 gap-4">
            {renderInput("port", "Port", "eg, 5432")}
            {renderInput("username", "Username", "eg, Scrubble_user")}
          </div>

          {/* Password and Database Row */}
          <div className="grid grid-cols-2 gap-4">
            {renderInput("password", "Password", "Enter password", "password")}
            {renderInput("database", "Database", "eg, enterprise_logs")}
          </div>

          {/* Table and Schema Row */}
          <div className="grid grid-cols-2 gap-4">
            {renderInput("table", "Table", "eg, Fraud-alerts")}
            {renderInput("schema", "Schema", "eg, public")}
          </div>

          {/* Ingestion Schedule Section */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Ingestion Schedule
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  {...register("frequency")}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                    errors.frequency ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="disabled">Disabled</option>
                  <option value="5sec">Every 5 seconds</option>
                  <option value="1hour">Every 1 hour</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="customdates">Custom Dates</option>
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.frequency && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.frequency.message}
                </p>
              )}

              <div className="flex items-center mt-2 text-sm text-gray-600">
                <FiInfo className="mr-2 text-blue-500" />
                <span>Five seconds is recommended</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSchemaExample(!showSchemaExample)}
              className="flex items-center mt-4 text-blue-600 hover:text-blue-800 text-sm"
            >
              <FiChevronDown
                className={`mr-1 transform transition-transform ${
                  showSchemaExample ? "rotate-180" : ""
                }`}
              />
              View Schema example below
            </button>

            {showSchemaExample && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Json</h3>
                <CodeHighlighter
                  language="json"
                  code={`{
  "host": "db.example.com",
  "port": 5432,
  "username": "scrubbe_user",
  "password": "****",
  "database": "enterprise_logs",
  "table": "fraud_alerts",
  "schema": "public"
}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="mb-10">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Configure;
