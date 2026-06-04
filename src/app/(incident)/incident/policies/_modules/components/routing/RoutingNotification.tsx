"use client";
import React, { useState } from "react";
import FormWrapper from "../FormWrapper";
import { z } from "zod";
import Input from "@/components/ui/input";
import CButton from "@/components/ui/Cbutton";
import { Switch } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import SideModal from "@/components/ui/SideModal";
import { BiInfoCircle } from "react-icons/bi";
import TextArea from "@/components/ui/text-area";
import Select from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";

// ── Data ──────────────────────────────────────────────────────────

const NOTIFICATION_CHANNELS = [
  { title: "Slack",           value: "slack" },
  { title: "Microsoft Teams", value: "teams" },
  { title: "Email",           value: "email" },
  { title: "SMS / Voice",     value: "sms"   },
];

const ONCALL_OPTIONS = [
  { value: "",                  label: "Select..."          },
  { value: "Primary SRE",       label: "Primary SRE"        },
  { value: "Platform On-call",  label: "Platform On-call"   },
  { value: "Payment On-call",   label: "Payment On-call"    },
  { value: "Custom Rotation",   label: "Custom Rotation"    },
];

const ESCALATE_AFTER_OPTIONS = [
  { value: "",           label: "Select..."  },
  { value: "5 minutes",  label: "5 minutes"  },
  { value: "10 minutes", label: "10 minutes" },
  { value: "15 minutes", label: "15 minutes" },
  { value: "30 minutes", label: "30 minutes" },
];

const ESCALATE_TARGET_OPTIONS = [
  { value: "",             label: "Select..."    },
  { value: "Team lead",    label: "Team lead"    },
  { value: "Duty Manager", label: "Duty Manager" },
  { value: "Exec Sponsor", label: "Exec Sponsor" },
];

// ── Schema ────────────────────────────────────────────────────────

const formScheme = z.object({
  name:   z.string().nonempty(),
  enable: z.string(),
  note:   z.string().optional(),
});
type TFormScheme = z.infer<typeof formScheme>;

// ── Component ─────────────────────────────────────────────────────

const RoutingNotification = () => {
  const { post } = useFetch();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [channels, setChannels] = useState<Record<string, boolean>>({
    slack: false, teams: false, email: false, sms: false,
  });

  const { control, handleSubmit, formState: { isValid, errors } } = useForm<TFormScheme>({
    resolver: zodResolver(formScheme),
    mode: "onChange",
    defaultValues: { enable: "true", name: "", note: "" },
  });

  const { mutateAsync: createRule, isPending: saving } = useMutation({
    mutationFn: async (data: TFormScheme) => {
      const res = await post(endpoint.guardrails.create, { ...data, ruleType: "ROUTING", channels });
      if (!res.success) throw new Error(res.data?.message ?? "Failed to save rule");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Routing rule saved");
      queryClient.invalidateQueries({ queryKey: ["guardrails"] });
      setOpenModal(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { mutateAsync: testNotification, isPending: testing } = useMutation({
    mutationFn: async () => {
      const res = await post(endpoint.guardrails.evaluate, { type: "TEST_NOTIFICATION", channels });
      if (!res.success) throw new Error(res.data?.message ?? "Test failed");
      return res.data;
    },
    onSuccess: () => toast.success("Test notification sent"),
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleChannel = (value: string) =>
    setChannels((prev) => ({ ...prev, [value]: !prev[value] }));

  return (
    <div>
      <FormWrapper
        title="B. Routing & notifications"
        subtitle="Make sure the right humans hear about the right incidents."
        label="Scrubbe can notify Slack/Teams/email now, and later integrate deeper paging tools if needed."
        actionText="Configure Routing"
        action={() => setOpenModal(true)}
      >
        <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-4 space-y-4">

          {/* On-call routing */}
          <p className="text-[13px] font-semibold text-black dark:text-zinc-100">
            On-call routing (global default)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Select options={ONCALL_OPTIONS}         label="P1 goes to"                  />
            <Select options={ONCALL_OPTIONS}         label="P2 goes to"                  />
            <Select options={ESCALATE_AFTER_OPTIONS} label="Escalate if not acknowledged" />
            <Select options={ESCALATE_TARGET_OPTIONS}label="Escalate target"              />
          </div>
          <p className="text-[12px] text-black dark:text-zinc-500">
            Routing is policy-only here. Actual on-call rotations can be synced after integrations.
          </p>

          {/* Notification channels */}
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-black dark:text-zinc-100">
                Notification channels
              </p>
              <CButton
                onClick={() => testNotification()}
                disabled={testing}
                className="border border-zinc-500 dark:border-zinc-700 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 w-fit h-8 text-[12px]"
              >
                {testing ? "Sending…" : "Test Notification"}
              </CButton>
            </div>
            <div className="space-y-3">
              {NOTIFICATION_CHANNELS.map(({ title, value }) => (
                <div key={value} className="flex items-center justify-between">
                  <p className="text-[13px] text-black dark:text-zinc-300">{title}</p>
                  <Switch
                    color="success"
                    size="sm"
                    isSelected={channels[value]}
                    onChange={() => toggleChannel(value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </FormWrapper>

      {/* Modal */}
      {openModal && (
        <SideModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          title="Configure routing rule"
          subTitle="Service-scoped overrides for on-call routing."
        >
          <div className="flex flex-col gap-4">

            {/* Info banner */}
            <div className="flex gap-2 items-start rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3">
              <BiInfoCircle className="size-4 text-black dark:text-zinc-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-black dark:text-zinc-200 mb-0.5">Rule type</p>
                <p className="text-[12px] text-black dark:text-zinc-400">Service-scoped overrides come later.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Controller name="name" control={control} render={({ field }) => (
                <Input {...field} placeholder="Pipeline fail in prod — P1" label="Name" error={errors.name?.message} />
              )} />
              <Controller name="enable" control={control} render={({ field }) => (
                <Select {...field} label="Enabled" error={errors.enable?.message} options={[
                  { value: "true",  label: "Enable"  },
                  { value: "false", label: "Disable" },
                ]} />
              )} />
            </div>

            <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-4">
              <p className="text-[13px] font-semibold text-black dark:text-zinc-100 mb-0.5">
                Routing is configured on the main page.
              </p>
              <p className="text-[12px] text-black dark:text-zinc-500">
                Use this drawer for future: service-scoped overrides.
              </p>
            </div>

            <Controller name="note" control={control} render={({ field }) => (
              <TextArea {...field} placeholder="Explain intent so future readers don't guess" label="Note (optional)" />
            )} />

            <div className="flex items-center gap-2 text-[12px] text-black dark:text-zinc-500">
              <BiInfoCircle className="size-4 shrink-0" />
              <p>Rules are evaluated in order. Put stricter rules above looser ones.</p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <CButton
                onClick={() => setOpenModal(false)}
                className="border border-zinc-500 dark:border-zinc-700 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 w-fit"
              >
                Cancel
              </CButton>
              <CButton
                disabled={!isValid || saving}
                isLoading={saving}
                onClick={handleSubmit((data) => createRule(data))}
                className="bg-emerald-500 hover:bg-emerald-600 text-white w-fit border-0"
              >
                Save Rule
              </CButton>
            </div>
          </div>
        </SideModal>
      )}
    </div>
  );
};

export default RoutingNotification;