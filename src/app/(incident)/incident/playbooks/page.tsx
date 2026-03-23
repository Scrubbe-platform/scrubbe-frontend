/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { FileCode, ShieldCheck, Plus, ChevronRight } from "lucide-react";
import { HiOutlineBookOpen } from "react-icons/hi";
import { AiOutlineMenu } from "react-icons/ai";
import { RiGitBranchLine } from "react-icons/ri";
import { GrTest } from "react-icons/gr";
import { FaPlane } from "react-icons/fa6";
import { RxLightningBolt } from "react-icons/rx";
import { MdInsertLink } from "react-icons/md";
import { CiWarning } from "react-icons/ci";
import { Shield } from "lucide-react";
import CButton from "@/components/ui/Cbutton";
import Modal from "@/components/ui/Modal";
import SideModal from "@/components/ui/SideModal";
import TextArea from "@/components/ui/text-area";
import Input from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import moment from "moment";

type Playbook = {
  id: string;
  name: string;
  description?: string;
  incidentType?: string;
  status?: string;
  version?: number;
  steps?: string[];
  verificationRequirements?: string[];
  allowedActions?: string[];
  riskNotes?: string;
  evidenceInputs?: string[];
  createdAt?: string;
};

export default function PlaybooksPage() {
  const { get, post, put } = useFetch();
  const queryClient = useQueryClient();
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditSteps, setOpenEditSteps] = useState(false);
  const [openConfigureAction, setOpenConfigureAction] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editSteps, setEditSteps] = useState("");
  const [editVerification, setEditVerification] = useState("");
  const [editRiskNotes, setEditRiskNotes] = useState("");
  const [activeTab, setActiveTab] = useState("playbook");

  const { data: playbooks, isLoading } = useQuery<Playbook[]>({
    queryKey: ["playbooks"],
    queryFn: async () => {
      const res = await get(endpoint.playbooks.list);
      if (res.success) return (res.data?.data ?? []) as Playbook[];
      return [];
    },
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: createPlaybook, isPending: creating } = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const res = await post(endpoint.playbooks.create, data);
      if (!res.success) throw new Error(res.data?.message ?? "Failed to create playbook");
      return res.data?.data ?? res.data;
    },
    onSuccess: (pb) => {
      toast.success("Playbook created");
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      setOpenNewModal(false);
      setNewName("");
      setNewDescription("");
      setSelectedPlaybook(pb);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { mutateAsync: publishPlaybook, isPending: publishing } = useMutation({
    mutationFn: async (id: string) => {
      const res = await post(`${endpoint.playbooks.publish}/${id}/publish`, {});
      if (!res.success) throw new Error(res.data?.message ?? "Failed to publish");
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      toast.success("Playbook published");
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { mutateAsync: updatePlaybook, isPending: updating } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Playbook> }) => {
      const res = await put(`${endpoint.playbooks.update}/${id}`, data);
      if (!res.success) throw new Error(res.data?.message ?? "Failed to update");
      return res.data?.data ?? res.data;
    },
    onSuccess: (pb) => {
      toast.success("Playbook updated");
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      setSelectedPlaybook(pb);
      setOpenEditSteps(false);
      setOpenConfigureAction(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSelectPlaybook = (pb: Playbook) => {
    setSelectedPlaybook(pb);
    setEditSteps((pb.steps ?? []).join("\n"));
    setEditVerification((pb.verificationRequirements ?? []).join("\n"));
    setEditRiskNotes(pb.riskNotes ?? "");
  };

  const handleSaveSteps = () => {
    if (!selectedPlaybook) return;
    updatePlaybook({
      id: selectedPlaybook.id,
      data: {
        steps: editSteps.split("\n").filter(Boolean),
        verificationRequirements: editVerification.split("\n").filter(Boolean),
      },
    });
  };

  const handleSaveActions = () => {
    if (!selectedPlaybook) return;
    updatePlaybook({
      id: selectedPlaybook.id,
      data: { riskNotes: editRiskNotes },
    });
  };

  const displayedPlaybook = selectedPlaybook ?? playbooks?.[0] ?? null;
  const displayedSteps = displayedPlaybook?.steps ?? [
    "Collect failing test names + stack traces from CI logs.",
    "Map failures to recent changes (commit SHA, touched files).",
    "Generate minimal patch suggestion with explanation and confidence score.",
    "Rerun CI and compare results (pass/fail, flake rate).",
    "Escalate to owners if repeated failures persist.",
  ];
  const displayedVerification = displayedPlaybook?.verificationRequirements ?? [
    "CI rerun passes on the same commit SHA.",
    "No new failing jobs introduced.",
    "Flake rate decreases or remains stable.",
  ];
  const displayedActions = displayedPlaybook?.allowedActions ?? [
    "Post PR Comment",
    "Propose patch (Code Engine)",
    "Rerun CI",
  ];
  const displayedInputs = displayedPlaybook?.evidenceInputs ?? [
    "CI logs",
    "Failing test names",
    "Commit SHA",
    "PR context",
    "Artifacts URL",
  ];

  const tabs = [
    { label: "Playbook", value: "playbook" },
    { label: "Road Map", value: "road_map" },
    { label: "Trust & Safety", value: "trust_safety" },
    { label: "Data Model", value: "data_model" },
  ];

  return (
    <div className="bg-dark min-h-screen p-10 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between">
        <div className="space-y-2 text-white">
          <p className="text-base font-medium">Scrubbe • Playbooks</p>
          <p className="text-base font-medium">Playbook Control Surface + Roadmap Add-ons</p>
          <p className="max-w-md text-sm">This page extends the Playbook Editor with add-ons: Roadmap (v1→v3), Trust/Safety philosophy, and a Data Model appendix.</p>
        </div>
        <div className="flex-col flex items-end gap-3">
          <div className="flex items-center gap-2 text-white">
            <div className="text-sm flex items-center gap-2 border border-neutral-300 rounded-sm px-2 py-1">
              <HiOutlineBookOpen className="size-4 text-yellow-400" /> Playbooks define what
            </div>
            <div className="text-sm flex items-center gap-2 border border-neutral-300 rounded-sm px-2 py-1">
              <ShieldCheck className="size-4 text-yellow-400" /> Policies decide when/how
            </div>
            <div className="text-sm flex items-center gap-2 border border-neutral-300 rounded-sm px-2 py-1">
              <FileCode className="size-4 text-yellow-400" /> Decision Log proves why
            </div>
          </div>
          <CButton
            className="w-fit"
            disabled={!displayedPlaybook || publishing}
            isLoading={publishing}
            onClick={() => displayedPlaybook && publishPlaybook(displayedPlaybook.id)}
          >
            Publish Playbook Version
          </CButton>
        </div>
      </div>

      {/* Body */}
      <div className="flex items-start gap-5">
        {/* Sidebar */}
        <div className="w-[300px] min-h-[80vh] bg-darkEzra p-4 text-white flex flex-col gap-3">
          <div className="flex flex-row justify-between">
            <p className="text-sm">Playbook library</p>
            <CButton
              onClick={() => setOpenNewModal(true)}
              className="border border-IMSCyan w-fit gap-2 bg-transparent hover:bg-transparent text-IMSCyan"
            >
              <Plus /> New
            </CButton>
          </div>

          <p className="text-sm">Canonical playbooks</p>

          <div className="mt-2 flex-1 space-y-2">
            {isLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            )}
            {!isLoading && (playbooks ?? []).length === 0 && (
              <p className="text-xs text-slate-500 text-center pt-4">No playbooks yet. Create one to get started.</p>
            )}
            {(playbooks ?? []).map(pb => (
              <div
                key={pb.id}
                onClick={() => handleSelectPlaybook(pb)}
                className={`border rounded-xl p-3 space-y-2 cursor-pointer ${displayedPlaybook?.id === pb.id ? "border-IMSCyan" : "border-gray-500 hover:border-white"}`}
              >
                <div className="flex justify-between">
                  <p className="text-sm font-medium max-w-[140px] truncate">{pb.name}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${pb.incidentType === "delivery" ? "bg-IMSCyan" : "bg-yellow-400"} text-black px-2 py-1 rounded-lg capitalize h-fit font-medium text-xs`}>
                      {pb.incidentType ?? "general"}
                    </span>
                    <ChevronRight className="size-3" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 truncate">{pb.description ?? ""}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="flex text-sm justify-between gap-2">
              <span>Add-ons</span>
              <span>Required for enterprise trust</span>
            </p>
            <div className="text-sm flex items-center gap-3 px-1">
              <FaPlane size={16} className="text-yellow-400" /> <p>Road map (v1-v3)</p>
            </div>
            <div className="text-sm flex items-center gap-3 px-1">
              <ShieldCheck size={16} className="text-fuchsia-500" /> <p>Trust Model</p>
            </div>
            <div className="text-sm flex items-center gap-3 px-1">
              <ShieldCheck size={16} className="text-fuchsia-500" /> <p>Data Model Appendix</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="border bg-darkEzra border-IMSCyan/45 rounded-xl p-5 flex-1 min-h-[500px] text-white">
          <div className="flex justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Playbook</p>
              <p className="text-sm">{displayedPlaybook?.name ?? "CI Test Failure Remediation"}</p>
              <p className="text-xs">{displayedPlaybook?.description ?? "Diagnose failing tests, propose minimal patch, rerun CI, verify stability."}</p>
            </div>
            <div className="flex gap-4">
              <CButton className="border border-IMSCyan text-IMSCyan bg-transparent hover:bg-transparent w-fit">
                <AiOutlineMenu /> View attachment rules
              </CButton>
              <CButton className="border border-IMSCyan text-IMSCyan bg-transparent hover:bg-transparent w-fit">
                v{displayedPlaybook?.version ?? 1} <RiGitBranchLine /> Versioning
              </CButton>
              <CButton className="border border-IMSCyan text-IMSCyan bg-transparent hover:bg-transparent w-fit">
                <GrTest /> Test Match
              </CButton>
            </div>
          </div>

          <div className="flex border-b border-neutral-300 mt-4">
            {tabs.map(({ label, value }) => (
              <div
                key={value}
                onClick={() => setActiveTab(value)}
                className={`border-b-2 ${activeTab !== value ? "border-transparent" : "border-IMSCyan"} py-3 flex-1 text-sm text-center cursor-pointer`}
              >
                {label}
              </div>
            ))}
          </div>

          {activeTab === "playbook" && (
            <div className="flex gap-5 mt-4">
              {/* Steps panel */}
              <div className="p-4 rounded-xl border border-neutral-400 flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Steps</p>
                  <button
                    className="px-4 py-1 border border-IMSCyan text-IMSCyan text-xs rounded-lg"
                    onClick={() => {
                      setEditSteps(displayedSteps.join("\n"));
                      setEditVerification(displayedVerification.join("\n"));
                      setOpenEditSteps(true);
                    }}
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm font-semibold">Operational steps + safe defaults</p>
                <p className="text-sm">Playbooks define allowed actions and verification steps. Policies decide if execution is permitted.</p>
                <ul className="list-decimal pl-3 space-y-1 text-sm">
                  {displayedSteps.map((step, i) => <li key={i}>{step}</li>)}
                </ul>
                <div className="border border-gray-500 rounded-lg p-4 mt-3">
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 text-orange-500" />
                    <p className="text-sm font-medium">Verification requirements</p>
                  </div>
                  <ul className="list-disc pl-4 text-sm">
                    {displayedVerification.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              </div>

              {/* Actions panel */}
              <div className="p-4 rounded-xl border border-neutral-500 flex-1 flex flex-col gap-1 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm">Allowed actions</p>
                  <button
                    onClick={() => {
                      setEditRiskNotes(displayedPlaybook?.riskNotes ?? "");
                      setOpenConfigureAction(true);
                    }}
                    className="px-4 py-1 border border-IMSCyan text-IMSCyan text-xs rounded-lg"
                  >
                    Configure
                  </button>
                </div>
                <p className="text-sm font-semibold">What this playbook permits</p>
                <p className="text-sm">These are the only actions the orchestration engine may consider for this playbook.</p>
                <div className="flex flex-wrap gap-3 items-center">
                  {displayedActions.map(action => (
                    <div key={action} className="text-sm border rounded-xl border-slate-300 flex items-center gap-2 p-1 px-2">
                      <RxLightningBolt size={17} className="text-yellow-400" /> <span>{action}</span>
                    </div>
                  ))}
                </div>
                <div className="border rounded-xl border-slate-400 text-sm p-3 space-y-2">
                  <p className="flex items-center gap-2">
                    <CiWarning className="text-green" size={18} /> <span>Risk / approval notes</span>
                  </p>
                  <p>{displayedPlaybook?.riskNotes ?? "PR-only by default. If patch touches /policy or /infra → approval required."}</p>
                </div>
                <div className="border rounded-xl border-slate-400 text-sm p-3 space-y-2">
                  <p className="flex items-center gap-2">
                    <MdInsertLink className="text-IMSCyan" size={18} /> <span>Evidence inputs (required)</span>
                  </p>
                  <div className="flex flex-wrap gap-3 items-center">
                    {displayedInputs.map(input => (
                      <div key={input} className="text-sm border rounded-xl border-slate-300 flex items-center gap-2 p-1 px-2">
                        <MdInsertLink className="text-IMSCyan" size={17} /> <span>{input}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "road_map" && (
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <h3 className="font-bold text-white">Roadmap (v1 → v3)</h3>
              <div className="space-y-2">
                <p className="font-semibold">v1 — Foundation:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400"><li>CI/CD failure auto-detection</li><li>Playbook matching by signal type</li><li>Manual approval gates</li></ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">v2 — Intelligence:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400"><li>Ezra-powered root cause analysis</li><li>Auto-remediation with RBAC guardrails</li><li>Decision log and audit trail</li></ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">v3 — Enterprise:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400"><li>Multi-env routing and policy enforcement</li><li>SLO-aware escalations</li><li>SCIM provisioning integration</li></ul>
              </div>
            </div>
          )}

          {activeTab === "trust_safety" && (
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <h3 className="font-bold text-white">Trust & Safety Philosophy</h3>
              <p>All automated actions in Scrubbe run through a strict policy evaluation pipeline before execution. No code is changed, no rollback is triggered, and no alert is suppressed without explicit policy approval.</p>
              <ul className="list-disc pl-4 space-y-2 text-slate-400">
                <li><strong className="text-white">Principle of least privilege:</strong> Playbooks only request the minimum permissions needed.</li>
                <li><strong className="text-white">Audit trail:</strong> Every action is logged in the Decision Log with actor, timestamp, policy evaluation result.</li>
                <li><strong className="text-white">Break-glass:</strong> Any admin can halt automated execution at any time.</li>
                <li><strong className="text-white">Human-in-the-loop:</strong> High-impact actions always require explicit human approval.</li>
              </ul>
            </div>
          )}

          {activeTab === "data_model" && (
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <h3 className="font-bold text-white">Data Model Appendix</h3>
              <div className="space-y-3">
                <div className="border border-white/10 rounded-lg p-3 font-mono text-xs text-slate-400 space-y-1">
                  <p className="text-white font-bold">Playbook</p>
                  <p>id, name, description, incidentType, status, version</p>
                  <p>steps: string[], verificationRequirements: string[]</p>
                  <p>allowedActions: string[], evidenceInputs: string[]</p>
                  <p>riskNotes: string, businessId: string</p>
                </div>
                <div className="border border-white/10 rounded-lg p-3 font-mono text-xs text-slate-400 space-y-1">
                  <p className="text-white font-bold">PlaybookExecution</p>
                  <p>id, playbookId, incidentId, status, currentStep</p>
                  <p>steps: ExecutionStep[], selectedAction: string</p>
                  <p>completedAt, cancelledAt, triggeredBy</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Playbook Modal */}
      <Modal isOpen={openNewModal} onClose={() => setOpenNewModal(false)}>
        <div className="p-4 space-y-4">
          <p className="text-white text-lg font-bold">New Playbook</p>
          <Input
            label="Name"
            labelClassName="text-white"
            className="text-white"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. CI Test Failure Remediation"
          />
          <div className="space-y-1">
            <label className="text-white text-sm">Description</label>
            <TextArea
              rows={3}
              value={newDescription}
              onChange={(e: any) => setNewDescription(e.target.value)}
              placeholder="What does this playbook do?"
            />
          </div>
          <div className="flex justify-end gap-3">
            <CButton onClick={() => setOpenNewModal(false)} className="w-fit bg-transparent border border-IMSCyan text-IMSCyan hover:bg-transparent">Cancel</CButton>
            <CButton
              className="w-fit"
              isLoading={creating}
              disabled={creating || !newName.trim()}
              onClick={() => createPlaybook({ name: newName, description: newDescription })}
            >
              Create
            </CButton>
          </div>
        </div>
      </Modal>

      {/* Edit Steps Modal */}
      {openEditSteps && (
        <SideModal title="" onClose={() => setOpenEditSteps(false)} isOpen={openEditSteps}>
          <div className="flex flex-col gap-2">
            <p className="text-base font-medium">Edit steps</p>
            <p className="font-semibold">Steps and verification</p>
            <p className="text-sm">Keep steps short, and make verification explicit.</p>
            <div className="border border-slate-400 rounded-lg p-3 my-3 space-y-2">
              <p className="font-semibold text-base">Steps</p>
              <p className="text-sm font-medium text-slate-300">One line per step. These define the operational flow.</p>
              <TextArea rows={6} value={editSteps} onChange={(e: any) => setEditSteps(e.target.value)} />
            </div>
            <div className="border border-slate-400 rounded-lg p-3 my-3 space-y-2">
              <p className="font-semibold text-base">Verification requirements</p>
              <p className="text-sm font-medium text-slate-300">These must be recorded in the decision log when actions run.</p>
              <TextArea rows={6} value={editVerification} onChange={(e: any) => setEditVerification(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3 items-center">
              <CButton onClick={() => setOpenEditSteps(false)} className="px-6 w-fit bg-transparent text-IMSCyan border border-IMSCyan hover:bg-transparent">Cancel</CButton>
              <CButton className="px-6 w-fit" isLoading={updating} disabled={updating || !displayedPlaybook} onClick={handleSaveSteps}>Save</CButton>
            </div>
          </div>
        </SideModal>
      )}

      {/* Configure Action Modal */}
      {openConfigureAction && (
        <SideModal title="" onClose={() => setOpenConfigureAction(false)} isOpen={openConfigureAction}>
          <div className="flex flex-col gap-2">
            <p className="text-base font-medium">Configure action</p>
            <p className="font-semibold">Allowed actions and safety notes</p>
            <p className="text-sm">Define what is permitted; policies will gate execution.</p>
            <div className="border border-slate-400 rounded-lg p-3 my-3 space-y-2">
              <p className="font-semibold text-base">Risk/approval notes</p>
              <p className="text-sm font-medium text-slate-300">Describe when approval is required and who owns it.</p>
              <TextArea rows={6} value={editRiskNotes} onChange={(e: any) => setEditRiskNotes(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3">
              <CButton onClick={() => setOpenConfigureAction(false)} className="px-6 w-fit bg-transparent text-IMSCyan border border-IMSCyan hover:bg-transparent">Cancel</CButton>
              <CButton className="px-6 w-fit" isLoading={updating} disabled={updating || !displayedPlaybook} onClick={handleSaveActions}>Save</CButton>
            </div>
          </div>
        </SideModal>
      )}
    </div>
  );
}
