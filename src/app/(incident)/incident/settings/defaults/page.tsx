/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect } from "react";
import SettingWrapper from "../_module/setting-wrapper";
import Select from "@/components/ui/select";
import Input from "@/components/ui/input";
import CButton from "@/components/ui/Cbutton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";

type DefaultsFormValues = {
  defaultSeverity: string;
  correlationKey: string;
  autoCloseAfter: string;
  storeBuildLogs: boolean;
  storeArtifacts: boolean;
  slaEnabled: boolean;
  autoEscalate: boolean;
};

const page = () => {
  const { get, put } = useFetch();
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<DefaultsFormValues>({
      defaultValues: {
        defaultSeverity: "P3",
        correlationKey: "repo + pr + runId + sha",
        autoCloseAfter: "never",
        storeBuildLogs: true,
        storeArtifacts: true,
        slaEnabled: false,
        autoEscalate: false,
      },
    });

  const { data: config, isLoading } = useQuery({
    queryKey: ["ims-defaults-config"],
    queryFn: async () => {
      const res = await get(endpoint.auth.ims_config);
      if (res.success) return res.data?.data ?? res.data ?? {};
      return {};
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (config) {
      reset({
        defaultSeverity: config.defaultSeverity ?? "P3",
        correlationKey: config.correlationKey ?? "repo + pr + runId + sha",
        autoCloseAfter: config.autoCloseAfter ?? "never",
        storeBuildLogs: config.storeBuildLogs ?? true,
        storeArtifacts: config.storeArtifacts ?? true,
        slaEnabled: config.slaEnabled ?? false,
        autoEscalate: config.autoEscalate ?? false,
      });
    }
  }, [config, reset]);

  const { mutateAsync: saveConfig, isPending } = useMutation({
    mutationFn: async (data: DefaultsFormValues) => {
      const res = await put(endpoint.auth.ims_config, data);
      if (!res.success) throw new Error(res.data?.message ?? "Failed to save");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Defaults saved");
      queryClient.invalidateQueries({ queryKey: ["ims-defaults-config"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div>
      <SettingWrapper
        title="Defaults"
        description="Opinionated defaults for incident creation"
        sub="These shape what gets auto-filled when Scrubbe raises incidents."
      >
        <form onSubmit={handleSubmit((data) => saveConfig(data))}>
          <div className="space-y-6 pt-5">

            {/* ── SEVERITY MAPPING ── */}
            <section className="bg-transparent border border-zinc-500 dark:border-neutral-500 rounded-[24px] p-4 space-y-4">
              <h3 className="text-black dark:text-white font-bold text-lg">
                Severity mapping
              </h3>
              <div className="space-y-3">
                <label className="text-black dark:text-white text-sm font-medium ml-1">
                  Delivery incidents default severity
                </label>
                <Controller
                  name="defaultSeverity"
                  control={control}
                  render={({ field }) => (
                    <Select
                      className="bg-white dark:bg-[#0B1224] text-black dark:text-white"
                      options={[
                        { value: "P4", label: "P4 - Low"      },
                        { value: "P3", label: "P3 - Medium"   },
                        { value: "P2", label: "P2 - High"     },
                        { value: "P1", label: "P1 - Critical" },
                      ]}
                      value={field.value}
                      onChange={(e: any) => field.onChange(e.target.value)}
                    />
                  )}
                />
                <p className="text-zinc-400 dark:text-[#64748B] text-xs leading-normal italic px-1">
                  Suggestion: keep delivery incidents below P2 unless
                  customer-impact signals are attached.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <ToggleField
                  label="SLA enforcement"
                  desc="Track and enforce SLA policies on incidents."
                  checked={watch("slaEnabled")}
                  onChange={(v) => setValue("slaEnabled", v)}
                />
                <ToggleField
                  label="Auto-escalate"
                  desc="Escalate unacknowledged incidents automatically."
                  checked={watch("autoEscalate")}
                  onChange={(v) => setValue("autoEscalate", v)}
                />
              </div>
            </section>

            {/* ── DEDUPLICATION ── */}
            <section className="bg-transparent border border-zinc-500 dark:border-neutral-500 rounded-[24px] p-4 space-y-6">
              <h3 className="text-black dark:text-white font-bold text-lg">
                Deduplication
              </h3>

              <div className="space-y-3">
                <label className="text-black dark:text-white text-sm font-medium ml-1">
                  Correlation key
                </label>
                <Controller
                  name="correlationKey"
                  control={control}
                  render={({ field }) => (
                    <Input
                      className="bg-white dark:bg-[#0B1224] text-black dark:text-white"
                      placeholder="repo + pr + runId + sha"
                      {...field}
                    />
                  )}
                />
                <p className="text-zinc-400 dark:text-[#64748B] text-xs leading-normal px-1">
                  Controls &quot;one incident vs spam.&quot; Use field names
                  from your webhook payload.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-black dark:text-white text-sm font-medium ml-1">
                  Auto-close delivery incidents after
                </label>
                <Controller
                  name="autoCloseAfter"
                  control={control}
                  render={({ field }) => (
                    <Select
                      className="bg-white dark:bg-[#0B1224] text-black dark:text-white"
                      options={[
                        { value: "never",           label: "Never"            },
                        { value: "24 hours stable", label: "24 hours stable"  },
                        { value: "7 days",          label: "7 days"           },
                      ]}
                      value={field.value}
                      onChange={(e: any) => field.onChange(e.target.value)}
                    />
                  )}
                />
              </div>
            </section>

            {/* ── EVIDENCE CAPTURE ── */}
            <section className="bg-transparent border border-zinc-500 dark:border-neutral-500 rounded-[24px] p-4 space-y-6">
              <h3 className="text-black dark:text-white font-bold text-lg">
                Evidence capture
              </h3>
              <div className="space-y-4">
                <ToggleField
                  label="Store build logs"
                  desc="Keep a cached copy for investigations."
                  checked={watch("storeBuildLogs")}
                  onChange={(v) => setValue("storeBuildLogs", v)}
                />
                <ToggleField
                  label="Store artifacts"
                  desc="Test reports, coverage, SARIF when available."
                  checked={watch("storeArtifacts")}
                  onChange={(v) => setValue("storeArtifacts", v)}
                />
              </div>
            </section>
          </div>

          <div className="pt-5 flex justify-end">
            <CButton
              type="submit"
              className="w-fit px-4"
              isLoading={isPending}
              disabled={isPending || isLoading}
            >
              Save
            </CButton>
          </div>
        </form>
      </SettingWrapper>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// ToggleField
// ─────────────────────────────────────────────────────────────────

const ToggleField = ({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex justify-between items-center p-5 border border-zinc-500 dark:border-neutral-500 rounded-2xl bg-white dark:bg-transparent">
    <div className="space-y-1">
      <span className="text-black dark:text-white text-[15px] font-bold">
        {label}
      </span>
      <p className="text-zinc-400 dark:text-[#64748B] text-xs">{desc}</p>
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
        checked ? "bg-[#4ADE80]" : "bg-zinc-200 dark:bg-neutral-500"
      }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
          checked ? "left-7" : "left-1"
        }`}
      />
    </button>
  </div>
);

export default page;