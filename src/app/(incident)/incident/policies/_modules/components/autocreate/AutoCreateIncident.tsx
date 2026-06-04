"use client";
import { useState } from "react";
import FormWrapper from "../FormWrapper";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { CellContext } from "@tanstack/react-table";
import CButton from "@/components/ui/Cbutton";
import { Switch } from "@heroui/react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SideModal from "@/components/ui/SideModal";
import { BiInfoCircle } from "react-icons/bi";
import TextArea from "@/components/ui/text-area";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";

// ── Schema ────────────────────────────────────────────────────────

const formScheme = z.object({
  name:           z.string().nonempty(),
  enable:         z.boolean(),
  triggerSource:  z.string().nonempty(),
  condition:      z.string().nonempty(),
  state:          z.string().nonempty(),
  environment:    z.string().nonempty(),
  deduplication:  z.string().nonempty(),
  severity:       z.string().nonempty(),
  note:           z.string().optional(),
});
type TFormScheme = z.infer<typeof formScheme>;

// ── Component ─────────────────────────────────────────────────────

const AutoCreateIncident = () => {
  const { get, post, remove } = useFetch();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [codeEngineActions, setCodeEngineActions] = useState([
    { label: "Allow suggest fix on P1/P2",   value: false },
    { label: "Auto-open PR (never merge)",    value: false },
    { label: "Only in staging by default",   value: false },
  ]);

  const { data: rules = [] } = useQuery({
    queryKey: ["guardrails", "auto-create"],
    queryFn: async () => {
      const res = await get(endpoint.guardrails.list + "?ruleType=AUTO_CREATE");
      return res.success ? (res.data?.data?.guardrails ?? res.data?.data ?? []) as any[] : [] as any[];
    },
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: createRule, isPending: saving } = useMutation({
    mutationFn: async (data: TFormScheme) => {
      const res = await post(endpoint.guardrails.create, {
        name: data.name, description: data.condition, ruleType: "AUTO_CREATE",
        triggerSource: data.triggerSource, condition: data.condition,
        state: data.state, environment: data.environment,
        deduplication: data.deduplication, severity: data.severity,
        enable: data.enable, note: data.note,
      });
      if (!res.success) throw new Error(res.data?.message ?? "Failed to save rule");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Auto-create rule saved");
      queryClient.invalidateQueries({ queryKey: ["guardrails", "auto-create"] });
      setOpenModal(false);
      reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { mutateAsync: deleteRule } = useMutation({
    mutationFn: async (id: string) => {
      const res = await remove(endpoint.guardrails.delete, id);
      if (!res.success) throw new Error("Failed to delete");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Rule deleted");
      queryClient.invalidateQueries({ queryKey: ["guardrails", "auto-create"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { control, handleSubmit, formState: { isValid, errors }, reset } = useForm<TFormScheme>({
    resolver: zodResolver(formScheme),
    mode: "onChange",
    defaultValues: {
      enable: true, environment: "production", condition: "",
      deduplication: "", state: "", triggerSource: "",
      name: "", note: "", severity: "P1",
    },
  });

  const toggleCodeEngineAction = (label: string) =>
    setCodeEngineActions((prev) =>
      prev.map((item) => item.label === label ? { ...item, value: !item.value } : item)
    );

  const columns = [
    { accessorKey: "name",                header: () => <span className="font-semibold">Trigger</span>,   cell: (info: CellContext<Record<string, any>, unknown>) => info.getValue() },
    { accessorKey: "config.condition",    header: () => <span className="font-semibold">Condition</span>, cell: (info: CellContext<Record<string, any>, unknown>) => <div className="truncate max-w-sm">{info.getValue() as string}</div> },
    { accessorKey: "config.state",        header: () => <span className="font-semibold">Then</span>,      cell: (info: CellContext<Record<string, any>, unknown>) => <div className="truncate max-w-sm">{info.getValue() as string}</div> },
    { accessorKey: "config.deduplication",header: () => <span className="font-semibold">Dedup</span>,     cell: (info: CellContext<Record<string, any>, unknown>) => info.getValue() as string },
    {
      accessorKey: "Action",
      header: () => <span className="font-semibold">Action</span>,
      cell: (info: CellContext<Record<string, any>, unknown>) => (
        <CButton
          onClick={() => deleteRule((info.row.original as any).id)}
          className="border border-red-200 dark:border-red-500/25 bg-transparent hover:bg-red-50 dark:hover:bg-red-500/8 text-red-500 dark:text-red-400"
        >
          Delete
        </CButton>
      ),
    },
  ];

  return (
    <div>
      <FormWrapper
        title="C. Auto-create incidents"
        subtitle="When should Scrubbe create an incident automatically?"
        label='Rules here connect the dots: pipeline failure → incident severity. This prevents "every red build" turning into noise.'
        actionText="Add auto-create rule"
        action={() => setOpenModal(true)}
      >
        <div className="space-y-3">
          <Table columns={columns} data={rules} />

          {/* Deduplication */}
          <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-4 space-y-3">
            <div>
              <p className="text-[13px] font-semibold text-black dark:text-zinc-100 mb-0.5">Deduplication</p>
              <p className="text-[12px] text-black dark:text-zinc-500">Avoid duplicate incidents for the same service & deploy.</p>
            </div>
            <Select options={[
              { value: "Service + env ( default )",    label: "Service + env (default)"      },
              { value: "Service + env + pipeline",     label: "Service + env + pipeline"     },
              { value: "Commit SHA",                   label: "Commit SHA"                   },
              { value: "Disabled",                     label: "Disabled"                     },
            ]} />
          </div>

          {/* SLA defaults */}
          <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-4 space-y-3">
            <div>
              <p className="text-[13px] font-semibold text-black dark:text-zinc-100 mb-0.5">Incident SLA defaults</p>
              <p className="text-[12px] text-black dark:text-zinc-500">Sets the resolution countdown per severity.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="P1" defaultValue="60m" />
              <Input label="P2" defaultValue="4h"  />
              <Input label="P3" defaultValue="24h" />
              <Input label="P4" defaultValue="72h" />
            </div>
          </div>

          {/* Code Engine actions */}
          <div className="rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40 p-4 space-y-3">
            <div>
              <p className="text-[13px] font-semibold text-black dark:text-zinc-100 mb-0.5">Code Engine actions</p>
              <p className="text-[12px] text-black dark:text-zinc-500">Policy for what remediation paths are allowed by default.</p>
            </div>
            <div className="space-y-3">
              {codeEngineActions.map((action) => (
                <div key={action.label} className="flex items-center justify-between">
                  <p className="text-[13px] text-black dark:text-zinc-300">{action.label}</p>
                  <Switch size="sm" color="success" isSelected={action.value} onChange={() => toggleCodeEngineAction(action.label)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </FormWrapper>

      {openModal && (
        <SideModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          title="Add auto-create rule"
          subTitle="When should Scrubbe auto-raise an incident?"
        >
          <div className="space-y-4">

            {/* Info banner */}
            <div className="flex gap-2 items-start rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3">
              <BiInfoCircle className="size-4 text-black dark:text-zinc-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-black dark:text-zinc-200 mb-0.5">Rule type</p>
                <p className="text-[12px] text-black dark:text-zinc-400">
                  Evaluates triggers (pipelines / alerts / risk) to auto-create incidents.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Controller name="name" control={control} render={({ field }) => (
                <Input {...field} placeholder="Pipeline fail in prod — P1" label="Name" error={errors.name?.message} />
              )} />
              <Controller name="enable" control={control} render={({ field }) => (
                <Select
                  options={[{ value: "true", label: "Enable" }, { value: "false", label: "Disable" }]}
                  label="Enabled"
                  value={field.value ? "true" : "false"}
                  onChange={(e: any) => field.onChange(e.target.value === "true")}
                  error={errors.enable?.message}
                />
              )} />
              <Controller name="triggerSource" control={control} render={({ field }) => (
                <Select {...field} label="Trigger Source" error={errors.triggerSource?.message} options={[
                  { value: "CI/CD pipeline",     label: "CI/CD pipeline"     },
                  { value: "Monitoring alert",    label: "Monitoring alert"   },
                  { value: "Fraud / risk engine", label: "Fraud / risk engine"},
                  { value: "Runtime anomaly",     label: "Runtime anomaly"    },
                ]} />
              )} />
              <Controller name="condition" control={control} render={({ field }) => (
                <Input {...field} placeholder="e.g. >5% for 5m" label="Condition" error={errors.condition?.message} />
              )} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Controller name="severity" control={control} render={({ field }) => (
                <Select {...field} label="Create Severity" error={errors.severity?.message} options={[
                  { value: "P1", label: "P1" }, { value: "P2", label: "P2" },
                  { value: "P3", label: "P3" }, { value: "P4", label: "P4" },
                ]} />
              )} />
              <Controller name="state" control={control} render={({ field }) => (
                <Select {...field} label="Default state" error={errors.state?.message} options={[
                  { value: "open",          label: "Open"          },
                  { value: "investigating", label: "Investigating"  },
                ]} />
              )} />
              <Controller name="deduplication" control={control} render={({ field }) => (
                <Select {...field} label="Dedup window" error={errors.deduplication?.message} options={[
                  { value: "15 minutes", label: "15 minutes" },
                  { value: "30 minutes", label: "30 minutes" },
                  { value: "60 minutes", label: "60 minutes" },
                  { value: "4 hours",    label: "4 hours"    },
                ]} />
              )} />
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

export default AutoCreateIncident;