"use client";
import React, { ReactNode, useEffect, useState } from "react";
import SettingWrapper from "../_module/setting-wrapper";
import { GitBranch, LayoutPanelLeft, ShieldCheck } from "lucide-react";
import Select from "@/components/ui/select";
import CButton from "@/components/ui/Cbutton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import { Switch } from "@heroui/react";
import { useRouter } from "next/navigation";

const page = () => {
  const { get, put } = useFetch();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [mergeMethod, setMergeMethod] = useState("Squash");
  const [maxSuggestions, setMaxSuggestions] = useState("3");
  const [postAsPrComment, setPostAsPrComment] = useState(true);
  const [createPatchBranch, setCreatePatchBranch] = useState(true);
  const [requireApprovalBelowThreshold, setRequireApprovalBelowThreshold] = useState(true);
  const [protectedPaths, setProtectedPaths] = useState<string[]>([]);
  const [requiredChecks, setRequiredChecks] = useState<string[]>([]);
  const [editingPaths, setEditingPaths] = useState(false);
  const [editingChecks, setEditingChecks] = useState(false);
  const [newPath, setNewPath] = useState("");
  const [newCheck, setNewCheck] = useState("");

  const { data: config } = useQuery({
    queryKey: ["ims-code-engine-config"],
    queryFn: async () => {
      const res = await get(endpoint.auth.ims_config);
      if (res.success) return res.data?.data ?? res.data ?? {};
      return {};
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (config) {
      setMergeMethod(config.allowedMergeMethod ?? "Squash");
      setMaxSuggestions(String(config.maxSuggestionsPerIncident ?? "3"));
      setPostAsPrComment(config.postSuggestionAsPrComment ?? true);
      setCreatePatchBranch(config.createPatchBranchAutomatically ?? true);
      setRequireApprovalBelowThreshold(config.requireApprovalBelowThreshold ?? true);
      setProtectedPaths(config.protectedPaths ?? ["/policy/**", "/infra/**", "/terraform/**"]);
      setRequiredChecks(config.requiredChecks ?? ["lint", "typecheck", "unit"]);
    }
  }, [config]);

  const { mutateAsync: save, isPending } = useMutation({
    mutationFn: async () => {
      const res = await put(endpoint.auth.ims_config, {
        allowedMergeMethod: mergeMethod,
        maxSuggestionsPerIncident: Number(maxSuggestions),
        postSuggestionAsPrComment: postAsPrComment,
        createPatchBranchAutomatically: createPatchBranch,
        requireApprovalBelowThreshold,
        protectedPaths,
        requiredChecks,
      });
      if (!res.success) throw new Error(res.data?.message ?? "Failed to save");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Code Engine settings saved");
      queryClient.invalidateQueries({ queryKey: ["ims-code-engine-config"] });
      setEditingPaths(false);
      setEditingChecks(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });
 
  return (
    <div>
      <SettingWrapper
        title="Code Engine"
        description="Code suggestions, guarded execution, and merges"
        sub="Where Scrubbe proposes patches and drives PR-based remediation."
      >
        <div className="grid 2xl:grid-cols-2 gap-8 items-start pt-4">
          {/* LEFT — Merge behavior */}
          <section className="space-y-6">
            <div className="bg-transparent border border-zinc-500 dark:border-neutral-500 rounded-[24px] p-6 space-y-6">
              <h3 className="text-black dark:text-white font-bold text-lg px-1">Merge behavior</h3>
 
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-black dark:text-white text-sm font-medium ml-1">Allowed merge method</label>
                  <p className="text-zinc-400 dark:text-[#64748B] text-xs ml-1">Applies when an approval is granted.</p>
                </div>
                <Select
                  className="text-black dark:text-white"
                  value={mergeMethod}
                  onChange={(e: any) => setMergeMethod(e.target.value)}
                  options={[
                    { label: "Squash",        value: "Squash"        },
                    { label: "Merge Commit",  value: "Merge Commit"  },
                    { label: "Rebase",        value: "Rebase"        },
                  ]}
                />
              </div>
 
              {/* Protected paths */}
              <div className="p-5 bg-zinc-50 dark:bg-[#020817] border border-zinc-500 dark:border-neutral-500 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <span className="text-black dark:text-white text-[15px] font-bold">Protected paths</span>
                  <p className="text-zinc-400 dark:text-[#64748B] text-xs">Touching these requires stricter approvals.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {protectedPaths.map((path) => (
                    <PathTag
                      key={path}
                      label={path}
                      onRemove={editingPaths ? () => setProtectedPaths((p) => p.filter((x) => x !== path)) : undefined}
                    />
                  ))}
                </div>
                {editingPaths && (
                  <div className="flex gap-2">
                    <input
                      value={newPath}
                      onChange={(e) => setNewPath(e.target.value)}
                      placeholder="/path/**"
                      className="flex-1 border border-zinc-500 dark:border-neutral-500 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-transparent text-black dark:text-white"
                    />
                    <button
                      onClick={() => {
                        if (newPath.trim()) {
                          setProtectedPaths((p) => [...p, newPath.trim()]);
                          setNewPath("");
                        }
                      }}
                      className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                )}
                <button
                  onClick={() => (editingPaths ? save() : setEditingPaths(true))}
                  disabled={isPending}
                  className="text-[#00CAD8] border border-[#00CAD8] px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#00CAD8]/5 transition-all disabled:opacity-50"
                >
                  {editingPaths ? "Save" : "Edit"}
                </button>
              </div>
            </div>

            {/* Verification requirement */}
            <div className="bg-transparent border border-zinc-500 dark:border-neutral-500 rounded-[24px] p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-black dark:text-white font-bold text-lg">Verification requirement</h3>
                <p className="text-zinc-600 dark:text-white text-sm">Before merge: CI must be green for required checks.</p>
              </div>
              <div className="w-full border border-zinc-500 dark:border-neutral-500 p-3.5 rounded-xl text-sm text-zinc-600 dark:text-[#D1D5DB]">
                required checks: {requiredChecks.join(", ") || "none configured"}
              </div>
              {editingChecks && (
                <div className="flex gap-2">
                  <input
                    value={newCheck}
                    onChange={(e) => setNewCheck(e.target.value)}
                    placeholder="check name"
                    className="flex-1 border border-zinc-500 dark:border-neutral-500 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-transparent text-black dark:text-white"
                  />
                  <button
                    onClick={() => {
                      if (newCheck.trim()) {
                        setRequiredChecks((p) => [...p, newCheck.trim()]);
                        setNewCheck("");
                      }
                    }}
                    className="text-[#00CAD8] border border-[#00CAD8] px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              )}
              <button
                onClick={() => (editingChecks ? save() : setEditingChecks(true))}
                disabled={isPending}
                className="text-[#00CAD8] border border-[#00CAD8] px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#00CAD8]/5 transition-all disabled:opacity-50"
              >
                {editingChecks ? "Save" : "Configure"}
              </button>
            </div>
          </section>
 
          {/* RIGHT — Suggestion generation */}
          <section className="bg-transparent border border-zinc-500 dark:border-neutral-500 rounded-[24px] p-6 space-y-6">
            <h3 className="text-black dark:text-white font-bold text-lg px-1">Suggestion generation</h3>
 
            <div className="space-y-3">
              <label className="text-black dark:text-white text-sm font-medium ml-1">Max suggestions per incident</label>
              <Select
                value={maxSuggestions}
                onChange={(e: any) => setMaxSuggestions(e.target.value)}
                options={[
                  { value: "1", label: "1" },
                  { value: "3", label: "3" },
                  { value: "5", label: "5" },
                ]}
                className="text-black dark:text-white"
              />
            </div>
 
            <div className="space-y-4 pt-2">
              <IconToggleRow icon={<GitBranch size={16} className="text-[#F472B6]" />}    label="Post suggestion as PR comment"                     active={postAsPrComment}                onToggle={() => setPostAsPrComment((v) => !v)}                />
              <IconToggleRow icon={<LayoutPanelLeft size={16} className="text-[#FF7ED4]" />} label="Create patch branch automatically"               active={createPatchBranch}              onToggle={() => setCreatePatchBranch((v) => !v)}              />
              <IconToggleRow icon={<ShieldCheck size={16} className="text-[#FDE047]" />}  label="Require approval when confidence < threshold"      active={requireApprovalBelowThreshold}  onToggle={() => setRequireApprovalBelowThreshold((v) => !v)} />
            </div>
 
            {/* Code Engine UI promo */}
            <div className="mt-8 p-6 bg-zinc-50 dark:bg-[#020817] border border-zinc-500 dark:border-neutral-500 rounded-2xl space-y-4">
              <div className="space-y-1">
                <span className="text-black dark:text-white text-[15px] font-bold">Open Code Engine UI</span>
                <p className="text-zinc-400 dark:text-[#64748B] text-xs leading-normal">Shows diff, affected files, risk, approvals, merge action.</p>
              </div>
              <div className="border border-zinc-500 dark:border-neutral-500 p-3 rounded-xl text-[11px] text-black dark:text-[#D1D5DB] text-center">
                required checks: {requiredChecks.join(", ") || "none configured"}
              </div>
              <button
                onClick={() => router.push("/incident/code-engine")}
                className="w-full py-3 rounded-xl border border-[#00CAD8] text-[#00CAD8] font-bold text-sm hover:bg-[#00CAD8]/5 transition-all"
              >
                Review in Code engine
              </button>
            </div>
          </section>
        </div>
 
        <div className="pt-6 flex justify-end">
          <CButton className="w-fit px-4" onClick={() => save()} isLoading={isPending} disabled={isPending}>
            Save
          </CButton>
        </div>
      </SettingWrapper>
    </div>
  );
};
 
const PathTag = ({ label, onRemove }: { label: string; onRemove?: () => void }) => (
  <span className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-500 dark:border-neutral-500 rounded-lg text-xs text-zinc-600 dark:text-[#D1D5DB] font-mono">
    {label}
    {onRemove && (
      <button onClick={onRemove} className="text-zinc-400 hover:text-red-400">
        ×
      </button>
    )}
  </span>
);
 
const IconToggleRow = ({ icon, label, active, onToggle }: { icon: ReactNode; label: string; active: boolean; onToggle: () => void }) => (
  <div className="flex justify-between items-center group">
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-black dark:text-white text-xs font-medium leading-tight max-w-[140px]">{label}</span>
    </div>
    <Switch color="success" size="sm" isSelected={active} onChange={onToggle} />
  </div>
);
 
export default page;