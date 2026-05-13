"use client";

import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiX } from "react-icons/fi";
import { MdEmail } from "react-icons/md";
import { toast } from "sonner";
import Input from "@/components/ui/input";
import Switch from "@/components/ui/Switch";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import CButton from "@/components/ui/Cbutton";
import { querykeys } from "@/lib/constant";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/lib/stores/auth.store";

const formSchema = z.object({
  recipients: z
    .array(z.string().email("Invalid email address"))
    .min(1, "At least one recipient is required"),
  enabled: z.boolean(),
});

type FormType = z.infer<typeof formSchema>;

const EmailIntegration: React.FC = () => {
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
    defaultValues: { recipients: [], enabled: true },
    mode: "onChange",
  });

  const { post, get } = useFetch();
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: [querykeys.INTEGRATIONS, user?.id],
    queryFn: async () => {
      const res = await get(
        endpoint.incident_ticket.integrations + "/" + user?.id
      );
      if (res.success) return res.data.data;
      return [];
    },
    enabled: !!user?.id,
  });

  const emailConfig = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data?.find((value: any) => value.provider === "EMAIL SERVICES");
  }, [data]);

  useEffect(() => {
    const recipients = (emailConfig?.config as any)?.recipients;
    if (Array.isArray(recipients) && recipients.length > 0) {
      setValue("recipients", recipients, { shouldValidate: true });
    }
    const enabled = (emailConfig?.config as any)?.enabled;
    if (typeof enabled === "boolean") {
      setValue("enabled", enabled, { shouldValidate: true });
    }
  }, [setValue, emailConfig]);

  const handleAddRecipient = () => {
    const value = newRecipient.trim();
    if (
      z.string().email().safeParse(value).success &&
      !getValues("recipients").includes(value)
    ) {
      setValue("recipients", [...getValues("recipients"), value], {
        shouldValidate: true,
      });
      setNewRecipient("");
    } else {
      toast.error("Please enter a valid email address");
    }
  };

  const removeRecipient = (recipientToRemove: string) => {
    setValue(
      "recipients",
      getValues("recipients").filter((r) => r !== recipientToRemove),
      { shouldValidate: true }
    );
  };

  const onSubmit = async (values: FormType) => {
    setIsLoading(true);
    const res = await post(endpoint.integration.email, values);
    setIsLoading(false);
    if (res.success) {
      queryClient.refetchQueries({
        queryKey: [querykeys.INTEGRATIONS, user?.id],
      });
      return toast.success("Email integration saved!");
    }
    return toast.error("Integration failed");
  };

  return (
    <div>
      <div className="mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <MdEmail size={32} className="text-[#00CAD8]" />
          <h1 className="text-xl font-bold dark:text-white">Email Settings</h1>
        </div>
        <p className="dark:text-white mb-6">
          Configure recipient email addresses for incident notifications.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            name="recipients"
            control={control}
            render={({ field }) => (
              <div>
                <label
                  className="block text-sm font-medium mb-1.5 dark:text-white"
                  htmlFor="email-input"
                >
                  Recipient Email Addresses{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="email-input"
                    placeholder="Add email (e.g., oncall@company.com)"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRecipient();
                      }
                    }}
                  />
                  <CButton
                    type="button"
                    onClick={handleAddRecipient}
                    className="w-fit px-4 shrink-0"
                  >
                    Add
                  </CButton>
                </div>

                <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md min-h-[48px]">
                  {field.value.length < 1 ? (
                    <span className="text-gray-400 text-sm italic">
                      No recipients added yet
                    </span>
                  ) : (
                    field.value.map((r, index) => (
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
                    ))
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

          <Controller
            name="enabled"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium dark:text-white">
                  Enable Email Notifications
                </label>
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            )}
          />

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

export default EmailIntegration;
