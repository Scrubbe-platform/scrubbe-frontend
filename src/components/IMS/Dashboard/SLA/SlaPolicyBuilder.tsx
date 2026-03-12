"use client";
import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import SliderThreshold from "@/components/ui/Slider";
import { useFetch } from "@/hooks/useFetch";
import useMember from "@/hooks/useMember";
import { endpoint } from "@/lib/api/endpoint";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";

type SlaPolicy = {
  id: string;
  name: string;
  priority: string;
  responseTimeMinutes: number;
  responseThreshold: number;
  resolveTimeMinutes: number;
  resolveThreshold: number;
  escalationContact?: string;
  applicableTeam?: string;
  uptimeTarget?: number;
};

const EMPTY_FORM = {
  name: "",
  priority: "",
  responseTimeMinutes: 60,
  responseThreshold: 80,
  resolveTimeMinutes: 240,
  resolveThreshold: 80,
  escalationContact: "",
  applicableTeam: "",
  uptimeTarget: "",
};

const SlaPolicyBuilder = () => {
  const { data: members } = useMember();
  const { get, post, remove } = useFetch();
  const queryClient = useQueryClient();
  const [newPolicy, setNewPolicy] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: policies = [] } = useQuery<SlaPolicy[]>({
    queryKey: ["SLA_POLICIES"],
    queryFn: async () => {
      const res = await get(endpoint.sla_policies.get);
      return res.success ? res.data?.data ?? [] : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!form.name || !form.priority) throw new Error("Name and priority are required");
      const payload = {
        ...form,
        responseTimeMinutes: Number(form.responseTimeMinutes),
        resolveTimeMinutes: Number(form.resolveTimeMinutes),
        uptimeTarget: form.uptimeTarget ? Number(form.uptimeTarget) : undefined,
      };
      const res = await post(endpoint.sla_policies.create, payload);
      if (!res.success) throw new Error((res.data as string) ?? "Failed to save SLA policy");
      return res.data;
    },
    onSuccess: () => {
      toast.success("SLA policy saved");
      queryClient.invalidateQueries({ queryKey: ["SLA_POLICIES"] });
      setForm(EMPTY_FORM);
      setNewPolicy(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await remove(endpoint.sla_policies.delete, id);
      if (!res.success) throw new Error((res.data as string) ?? "Failed to delete");
    },
    onSuccess: () => {
      toast.success("SLA policy deleted");
      queryClient.invalidateQueries({ queryKey: ["SLA_POLICIES"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const PolicyBuilder = ({ isClose }: { isClose?: boolean }) => (
    <div>
      <div className="grid grid-cols-2 gap-x-4 mt-5">
        <Input
          label="SLA Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <Select
          label="Priority Level"
          value={form.priority}
          onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
          options={[
            { label: "Select Priority", value: "" },
            { label: "P4-Low", value: "LOW" },
            { label: "P3-Medium", value: "MEDIUM" },
            { label: "P2-High", value: "HIGH" },
            { label: "P1-Critical", value: "CRITICAL" },
          ]}
        />
        <Input
          label="Response Time / MTTA (minutes)"
          type="number"
          value={form.responseTimeMinutes}
          onChange={(e) => setForm((f) => ({ ...f, responseTimeMinutes: Number(e.target.value) }))}
        />
        <SliderThreshold
          initialValue={form.responseThreshold}
          onChange={(v: number) => setForm((f) => ({ ...f, responseThreshold: v }))}
        />
        <Input
          label="Resolve Time / MTTR (minutes)"
          type="number"
          value={form.resolveTimeMinutes}
          onChange={(e) => setForm((f) => ({ ...f, resolveTimeMinutes: Number(e.target.value) }))}
        />
        <SliderThreshold
          initialValue={form.resolveThreshold}
          onChange={(v: number) => setForm((f) => ({ ...f, resolveThreshold: v }))}
        />
        <Select
          label="Escalation Contacts"
          value={form.escalationContact}
          onChange={(e) => setForm((f) => ({ ...f, escalationContact: e.target.value }))}
          options={[
            { label: "Select", value: "" },
            { label: "None", value: "none" },
            { label: "Tier 1", value: "Tier1" },
            { label: "Tier 2", value: "Tier2" },
          ]}
        />
        <Select
          label="Applicable Teams/Client"
          value={form.applicableTeam}
          onChange={(e) => setForm((f) => ({ ...f, applicableTeam: e.target.value }))}
          options={[{ label: "Team member or group", value: "" }].concat(
            members?.map((member) => ({ label: member.email, value: member.email })) ?? []
          )}
        />
        <Input
          label="Uptime % Target"
          placeholder="e.g. 99.5"
          type="number"
          value={form.uptimeTarget}
          onChange={(e) => setForm((f) => ({ ...f, uptimeTarget: e.target.value }))}
        />
      </div>
      <div className="flex justify-end items-center gap-3">
        {isClose && (
          <CButton
            onClick={() => setNewPolicy(false)}
            className="w-fit border bg-transparent hover:text-white text-IMSLightGreen shadow-none"
          >
            Close
          </CButton>
        )}
        <CButton
          className="w-fit shadow-none"
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Saving..." : "Save SLA Policy"}
        </CButton>
      </div>
    </div>
  );

  return (
    <div className="bg-white">
      <p className="text-lg font-bold">SLA Policy Builder</p>
      {policies.length > 0 ? (
        <div>
          <div className="grid grid-cols-4 gap-4 my-4">
            {policies.map((policy) => (
              <div key={policy.id} className="p-4 rounded-lg bg-neutral-100 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-base font-medium">{policy.name}</p>
                  <button
                    onClick={() => deleteMutation.mutate(policy.id)}
                    className="text-sm text-rose-500 bg-rose-100 border border-rose-500 px-2 rounded-md"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm"><span className="font-medium">Priority:</span> {policy.priority}</p>
                <p className="text-sm"><span className="font-medium">MTTA:</span> {policy.responseTimeMinutes}m (threshold: {policy.responseThreshold}%)</p>
                <p className="text-sm"><span className="font-medium">MTTR:</span> {policy.resolveTimeMinutes}m (threshold: {policy.resolveThreshold}%)</p>
                {policy.uptimeTarget && (
                  <p className="text-sm"><span className="font-medium">Uptime Target:</span> {policy.uptimeTarget}%</p>
                )}
                {policy.escalationContact && (
                  <p className="text-sm"><span className="font-medium">Escalation:</span> {policy.escalationContact}</p>
                )}
                <p className="text-sm"><span className="font-medium">Team/Client:</span> {policy.applicableTeam ?? "N/A"}</p>
              </div>
            ))}
          </div>
          {!newPolicy && (
            <CButton className="w-fit" onClick={() => setNewPolicy(true)}>
              Create New Policy
            </CButton>
          )}
          {newPolicy && <PolicyBuilder isClose />}
        </div>
      ) : (
        <PolicyBuilder />
      )}
    </div>
  );
};

export default SlaPolicyBuilder;
