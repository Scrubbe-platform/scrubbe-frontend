"use client";
import React, { useEffect, useState } from "react";
import SettingWrapper from "../_module/setting-wrapper";
import Select from "@/components/ui/select";
import CButton from "@/components/ui/Cbutton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";

const page = () => {
  const { get, put } = useFetch();
  const queryClient = useQueryClient();

  const [decisionLogRetention, setDecisionLogRetention] = useState("90 days");
  const [artifactRetention, setArtifactRetention] = useState("30 days");
  const [piiRedaction, setPiiRedaction] = useState(true);

  const { data: config } = useQuery({
    queryKey: ["ims-compliance-config"],
    queryFn: async () => {
      const res = await get(endpoint.auth.ims_config);
      if (res.success) return res.data?.data ?? res.data ?? {};
      return {};
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (config) {
      setDecisionLogRetention(config.decisionLogRetention ?? "90 days");
      setArtifactRetention(config.artifactRetention ?? "30 days");
      setPiiRedaction(config.piiRedactionOnExport ?? true);
    }
  }, [config]);

  const { mutateAsync: save, isPending } = useMutation({
    mutationFn: async () => {
      const res = await put(endpoint.auth.ims_config, {
        decisionLogRetention,
        artifactRetention,
        piiRedactionOnExport: piiRedaction,
      });
      if (!res.success) throw new Error(res.data?.message ?? "Failed to save");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Compliance settings saved");
      queryClient.invalidateQueries({ queryKey: ["ims-compliance-config"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <SettingWrapper
        title="Compliance"
        description="Retention, exports, and evidence packs"
        sub="Enable evidence export for audits and regulated teams."
      >
        <div className="grid 2xl:grid-cols-2 gap-4 items-start mb-16 pt-4">
          {/* LEFT COLUMN: RETENTION */}
          <section className="bg-transparent border border-neutral-500 rounded-[24px] p-4 space-y-4">
            <h3 className="text-white font-bold text-[17px] px-1">Retention</h3>

            <div className="space-y-3">
              <label className="text-[#94A3B8] text-sm font-medium ml-1">Decision log retention</label>
              <Select
                value={decisionLogRetention}
                onChange={(e: any) => setDecisionLogRetention(e.target.value)}
                options={[
                  { value: "30 days", label: "30 days" },
                  { value: "90 days", label: "90 days" },
                  { value: "365 days", label: "365 days" },
                  { value: "7 years", label: "7 years" },
                ]}
                className="text-white"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[#94A3B8] text-sm font-medium ml-1">Artifact retention</label>
              <Select
                value={artifactRetention}
                onChange={(e: any) => setArtifactRetention(e.target.value)}
                options={[
                  { value: "off", label: "off" },
                  { value: "30 days", label: "30 days" },
                  { value: "90 days", label: "90 days" },
                ]}
                className="text-white"
              />
            </div>
          </section>

          {/* RIGHT COLUMN: EVIDENCE PACKS */}
          <section className="space-y-6">
            <div className="bg-transparent border border-neutral-500 rounded-[24px] p-4 space-y-6">
              <div className="space-y-1 px-1">
                <h3 className="text-white font-bold text-[17px]">Evidence packs</h3>
                <p className="text-[#64748B] text-sm font-medium">Security defaults applied org-wide.</p>
              </div>

              {/* ONE-CLICK EXPORT CARD */}
              <div className="p-6 border border-neutral-500 rounded-[24px] space-y-5">
                <p className="text-[#D1D5DB] text-sm leading-relaxed">
                  One-click export: incident timeline, approvals, diffs, verification results.
                </p>
                <button className="w-full py-2.5 rounded-xl border border-[#00CAD8] text-[#00CAD8] font-bold text-sm hover:bg-[#00CAD8]/10 transition-all tracking-tight">
                  Configure export destination
                </button>
              </div>

              {/* PII REDACTION TOGGLE */}
              <div
                onClick={() => setPiiRedaction((v) => !v)}
                className="p-6 border border-neutral-500 rounded-[24px] flex justify-between items-center group hover:border-[#4ADE80]/30 transition-all cursor-pointer"
              >
                <div className="space-y-1">
                  <span className="text-white text-[15px] font-bold">PII redaction on export</span>
                  <p className="text-[#64748B] text-sm font-medium">Recommended.</p>
                </div>
                <div
                  className={`w-12 h-6 rounded-full relative shadow-[0_0_10px_rgba(74,222,128,0.2)] transition-colors duration-200 ${
                    piiRedaction ? "bg-[#4ADE80]" : "bg-neutral-500"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                      piiRedaction ? "right-1" : "left-1"
                    }`}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end pt-4">
          <CButton className="px-4 w-fit" onClick={() => save()} isLoading={isPending} disabled={isPending}>
            Save
          </CButton>
        </div>
      </SettingWrapper>
    </div>
  );
};

export default page;
