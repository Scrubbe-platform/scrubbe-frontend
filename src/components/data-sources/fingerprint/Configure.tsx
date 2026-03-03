"use client";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CodeHighlighter from "@/lib/highlightjs/CodeHighlighter";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import ActiveProject from "./ActiveProject";
import { ChevronLeft } from "lucide-react";
import { useFingerprintDisplay } from "@/lib/fingerprint/fingerprintdisplay";
import Switch from "@/components/ui/Switch";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";

// Zod schema for form validation
const apiConfigSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  environment: z.string().min(1, "Environment is required"),
  domain: z.string().optional(),
  description: z.string().optional(),
});

type FingerPrintConfigForm = z.infer<typeof apiConfigSchema>;

const Configure: React.FC = () => {
  const [showFingerprint, setShowFingerprint] = useState(false);
  const [viewAsJson, setViewAsJson] = useState(false);
  const { formattedItems, fingerprint } = useFingerprintDisplay();
  const [isLoading, setIsLoading] = useState(false);
  const { post } = useFetch();
  console.log(formattedItems);
  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<FingerPrintConfigForm>({
    resolver: zodResolver(apiConfigSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: FingerPrintConfigForm) => {
    try {
      setIsLoading(true);
      const res = await post(
        endpoint.data_source.fingerprint_configuration,
        data
      );
      setIsLoading(false);
      if (res.success) {
        toast.success("New Fingerprint configured");
        return;
      }
      console.log(res.data);
      toast.error(res.data);
    } catch (error) {
      console.error("Error saving configuration:", error);
    }
  };

  const handleGoBack = () => {
    setShowFingerprint(false);
  };

  return (
    <>
      {!showFingerprint && (
        <div className="flex md:w-[1200px] w-full">
          <div className="w-full h-full bg-white p-6 md:flex-[.4]">
            <h1 className="text-xl font-semibold text-gray-900 mb-6">
              Fingerprint Configuration
            </h1>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="gap-y-4 flex flex-col justify-between h-full"
            >
              {/* Client ID and Client Secret Row */}
              <div className="flex flex-col flex-1 gap-2">
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Project Name"
                      placeholder="Customer Portal"
                      {...field}
                      error={errors.name?.message}
                      className="!text-black"
                      labelClassName="!text-black"
                    />
                  )}
                />
                <Controller
                  name="environment"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Environment"
                      options={[
                        { label: "SELECT PROJECT ENVIRONMENT", value: "" },
                        { value: "development", label: "Development" },
                        { value: "production", label: "Production" },
                        { value: "staging", label: "Staging" },
                      ]}
                      {...field}
                      error={errors.environment?.message}
                      className="!text-black"
                      labelClassName="!text-black"
                    />
                  )}
                />

                <Controller
                  name="domain"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Domain (optional)"
                      placeholder="app.customer.com"
                      {...field}
                      error={errors.domain?.message}
                      className="!text-black"
                      labelClassName="!text-black"
                    />
                  )}
                />
                <div className="space-y-2">
                  <p className=" font-medium text-sm ">Description(optional)</p>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={4}
                        placeholder="Device Fingerprint Location Tracker"
                        className="w-full bg-transparent  border border-gray-300 rounded-md p-2 text-sm "
                      />
                    )}
                  />
                </div>

                {/* Ingestion Schedule Section */}
              </div>

              {/* Save Button */}
              <div className="mb-10 space-y-3">
                <button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className={`w-full py-2 px-4 disabled:opacity-50 rounded-md text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-md bg-transparent  font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isLoading ? " cursor-not-allowed" : ""
                  }`}
                >
                  Generate API keys
                </button>
              </div>
            </form>
          </div>
          <div className="flex-[.6] md:block hidden">
            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
              <h2 className="text-xl font-medium text-gray-700 mb-2">
                SDK Integration{" "}
              </h2>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                How to Integrate{" "}
              </h3>
              <CodeHighlighter
                language="json"
                code={`import { useState } from "react"; 
import { Controller, useForm } from "react-hook-form";
  `}
              />
              <p className=" text-sm mt-4">
                Captured data will appear in your fingerprint dashboard
              </p>
            </div>

            <ActiveProject />

            <div className="flex justify-end gap-3 p-4">
              <p
                onClick={() => setShowFingerprint(true)}
                className=" text-colorScBlue underline hover:font-medium font-medium cursor-pointer"
              >
                View Fingerprints
              </p>
              <p className=" text-colorScBlue underline hover:font-medium font-medium">
                View Alerts
              </p>
            </div>
          </div>
        </div>
      )}

      {showFingerprint && (
        <div className="w-full h-full bg-white p-6">
          <div
            onClick={handleGoBack}
            className="flex gap-2 items-center text-gray-500 hover:text-black mb-3 cursor-pointer"
          >
            <ChevronLeft />
            back
          </div>
          {viewAsJson ? (
            <>
              <div className=" w-[600px]">
                <CodeHighlighter
                  language="json"
                  code={JSON.stringify(fingerprint?.data).replaceAll(
                    ",",
                    ",\n"
                  )}
                />
              </div>
            </>
          ) : (
            <>
              <p className=" text-2xl font-medium">
                Instantiated Module: Network Fingerprint Reply
              </p>
              <div className="overflow-x-auto rounded-lg border border-blue-200 mt-3">
                <table className="w-full min-w-[500px]  ">
                  <tbody className=" text-sm md:text-base">
                    <tr className="border-b border-blue-300">
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50 w-1/4 sm:w-1/3">
                        VPN Status
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formattedItems[0].value}
                      </td>
                    </tr>
                    <tr className="border-b border-blue-300">
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50">
                        Device Type
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formattedItems[1].value}
                      </td>
                    </tr>
                    <tr className="border-b border-blue-300">
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50">
                        Timestamp
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formattedItems[4].value}
                      </td>
                    </tr>
                    <tr className="border-b border-blue-300">
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50">
                        OS Model
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formattedItems[5].value}
                      </td>
                    </tr>
                    <tr className="border-b border-blue-300">
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50">
                        IP address
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formattedItems[6].value}
                      </td>
                    </tr>
                    <tr className="border-b border-blue-300">
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50">
                        Region/City
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formattedItems[7].value}-{formattedItems[8].value}
                      </td>
                    </tr>
                    <tr className="border-b border-blue-300">
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50">
                        Browser Information
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formattedItems[9].value}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50">
                        Device Trust Score
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {formattedItems[11].value}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-700 bg-blue-50">
                        Fingerprint ID
                      </td>
                      <td className="py-3 px-4 text-gray-700">fp_wut345jut</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 ">
              View as JSON{" "}
              <Switch checked={viewAsJson} onChange={setViewAsJson} />
            </div>
            <p className=" text-colorScBlue underline hover:font-medium font-medium">
              View Alerts
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Configure;
