// RecipientForm.tsx
"use client";

import React, { useMemo, useEffect, useState } from "react";
import { z } from "zod";
import { useForm, Controller, get } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiX } from "react-icons/fi";
import { toast } from "sonner";
import Input from "@/components/ui/input";
import Switch from "@/components/ui/Switch";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import CButton from "@/components/ui/Cbutton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { querykeys } from "@/lib/constant";
import useAuthStore from "@/lib/stores/auth.store";

// ---
// 1. Zod Schema for Validation
// ---
const formSchema = z.object({
  recipients: z
    .array(
      z
        .string()
        .regex(
          /^\+\d{10,15}$/,
          "Invalid phone number format. Must start with +"
        )
    )
    .min(1, "At least one recipient is required"),
  enabled: z.boolean(),
});

type FormType = z.infer<typeof formSchema>;

const SMSIntegration: React.FC = () => {
  const [newRecipient, setNewRecipient] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    setValue,
    getValues,
  } = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipients: [],
      enabled: true,
    },
    mode: "onChange",
  });

  const { post } = useFetch();
  const { user } = useAuthStore();
  const { data } = useQuery({
    queryKey: [querykeys.INTEGRATIONS],
    queryFn: async () => {
      const res = await get(
        endpoint.incident_ticket.integrations + "/" + user?.id
      );
      console.log(res);
      if (res.success) {
        return res.data.data;
      }
      return [];
    },
    enabled: !!user?.id,
  });

  const whatsAppConfig = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data?.find((value: any) => value.provider === "WHATSAPP");
  }, [data]);

  useEffect(() => {
    if (whatsAppConfig?.metadata?.recipents.length > 0) {
      setValue("recipients", [...whatsAppConfig?.metadata?.recipents], {
        shouldValidate: true,
      });
    }
  }, [setValue, whatsAppConfig]);
  // ---
  // 2. Helper Functions for Recipient Tags
  // ---
  const handleAddRecipient = () => {
    const value = newRecipient.trim();
    if (
      z
        .string()
        .regex(/^\+\d{10,15}$/)
        .safeParse(value).success &&
      !getValues("recipients").includes(value)
    ) {
      setValue("recipients", [...getValues("recipients"), value], {
        shouldValidate: true,
      });
      setNewRecipient("");
    } else {
      toast.error("Please enter a valid phone number starting with +");
    }
  };

  const removeRecipient = (recipientToRemove: string) => {
    setValue(
      "recipients",
      getValues("recipients").filter((r) => r !== recipientToRemove),
      { shouldValidate: true }
    );
  };

  // ---
  // 3. Form Submission Handler
  // ---
  const onSubmit = async (values: FormType) => {
    setIsLoading(true);
    const res = await post(endpoint.integration.sms, values);
    setIsLoading(false);
    if (res.success) {
      queryClient.refetchQueries({ queryKey: [querykeys.INTEGRATIONS] });
      return toast.success("SMS integration successful!");
    }
    return toast.error("Integration failed");
  };

  return (
    <div className=" ">
      <div className=" mx-auto ">
        <h1 className="text-xl font-bold dark:text-white mb-2">SMS Settings</h1>
        <p className="dark:text-white mb-6">
          Configure the recipients and enable state for your notifications.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Recipients Input */}
          <Controller
            name="recipients"
            control={control}
            render={({ field }) => (
              <div>
                <label
                  className="block text-sm font-medium mb-1.5 dark:text-white"
                  htmlFor="recipients-input"
                >
                  Recipients (Phone Numbers){" "}
                  <span className="text-red-500">*</span>
                </label>
                <div>
                  <div className="flex-1 min-w-[100px]">
                    <Input
                      id="recipients-input"
                      placeholder="Add phone number (e.g., +15551234567)"
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddRecipient();
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md">
                  {field.value.length < 1 ? (
                    <div>
                      <span className="text-gray-400 text-sm italic text-center">
                        No recipients added yet
                      </span>
                    </div>
                  ) : (
                    <>
                      {field.value.map((r, index) => (
                        <span
                          key={index}
                          className="flex items-center space-x-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full"
                        >
                          <span>{r}</span>
                          <button
                            type="button"
                            onClick={() => removeRecipient(r)}
                            className="text-blue-800 hover:text-blue-600 focus:outline-none"
                          >
                            <FiX size={12} />
                          </button>
                        </span>
                      ))}
                    </>
                  )}
                </div>
                {errors.recipients && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.recipients.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Enabled Toggle */}
          <Controller
            name="enabled"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium dark:text-white">
                  Enable Notifications
                </label>
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            )}
          />

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <CButton
              type="submit"
              disabled={!isValid || isLoading}
              isLoading={isLoading}
            >
              Save Settings
            </CButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SMSIntegration;
