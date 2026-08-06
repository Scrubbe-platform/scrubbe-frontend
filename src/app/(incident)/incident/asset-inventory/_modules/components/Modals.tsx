"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button1";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import {
  Asset, Benchmark, CATEGORY_DEFS, CLOUDS, ENVIRONMENTS, OWNERS, PolicyDef, REGIONS,
  benchmarksFor, createAsset,
} from "./assetInventory.data";

function ModalShell({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="p-4">
      <h3 className="text-[18px] font-bold text-black dark:text-zinc-100">{title}</h3>
      {sub && <p className="mt-1.5 text-[13.5px] text-black/60 dark:text-zinc-400">{sub}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}
function Foot({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex justify-end gap-2.5">{children}</div>;
}

/* ───────────────────── Connect provider ───────────────────── */

export function ConnectProviderModal({ onDiscovered, onClose }: { onDiscovered: (assets: Asset[], provider: string) => void; onClose: () => void }) {
  const [stage, setStage] = useState<"pick" | "connecting" | "done">("pick");
  const [provider, setProvider] = useState("");
  const [count, setCount] = useState(0);

  function connect(p: string) {
    setProvider(p);
    setStage("connecting");
    setTimeout(() => {
      const n = 4 + Math.floor(Math.random() * 10);
      const assets: Asset[] = [];
      for (let i = 0; i < n; i++) {
        const def = CATEGORY_DEFS[Math.floor(Math.random() * CATEGORY_DEFS.length)];
        const type = def.types[Math.floor(Math.random() * def.types.length)];
        assets.push(createAsset({
          name: `${p.toLowerCase()}-discovered-${type.toLowerCase().replace(/\s+/g, "-")}-${i}`,
          type, category: def.cat, owner: OWNERS[Math.floor(Math.random() * OWNERS.length)],
          env: ENVIRONMENTS[Math.floor(Math.random() * ENVIRONMENTS.length)],
          cloud: ["Kubernetes", "Terraform"].includes(p) ? CLOUDS[0] : CLOUDS.includes(p) ? p : CLOUDS[0],
          lifecycle: "Provisioned",
        }));
      }
      setCount(n);
      onDiscovered(assets, p);
      setStage("done");
    }, 1400);
  }

  return (
    <ModalShell title="Connect a provider" sub="Discover assets automatically once connected.">
      {stage === "pick" && (
        <div className="flex flex-wrap justify-center gap-2 rounded-lg border border-dashed border-zinc-300 p-6 dark:border-zinc-700">
          {["Kubernetes", "AWS", "Azure", "GCP", "Terraform", "ServiceNow"].map((c) => (
            <Button key={c} variant="outline-dark" size="sm" onClick={() => connect(c)}>{c}</Button>
          ))}
        </div>
      )}
      {stage === "connecting" && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-IMSDarkGreen border-t-transparent" />
          <p className="text-[13px] font-semibold text-black dark:text-zinc-200">Connecting to {provider}…</p>
        </div>
      )}
      {stage === "done" && (
        <div className="py-4 text-center">
          <p className="text-[14px] font-bold text-IMSDarkGreen">Connected to {provider}</p>
          <p className="mt-1.5 text-[13px] text-black/60 dark:text-zinc-400">{count} new assets discovered and added to the inventory.</p>
        </div>
      )}
      <Foot>
        <Button variant="outline-dark" size="sm" onClick={onClose}>{stage === "done" ? "Done" : "Close"}</Button>
      </Foot>
    </ModalShell>
  );
}

/* ───────────────────── Register existing asset ───────────────────── */

export function RegisterAssetModal({ onRegister, onClose }: { onRegister: (a: Asset) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORY_DEFS[0].cat);
  const [type, setType] = useState(CATEGORY_DEFS[0].types[0]);
  const [owner, setOwner] = useState(OWNERS[0]);
  const [env, setEnv] = useState(ENVIRONMENTS[0]);
  const types = CATEGORY_DEFS.find((d) => d.cat === category)?.types ?? [];

  return (
    <ModalShell title="Register existing asset" sub="Manually register an asset not yet discovered automatically.">
      <div className="space-y-4">
        <Input label="Asset name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. returns-api-pod-4f21" />
        <Select
          label="Category"
          value={category}
          onChange={(e: any) => { setCategory(e.target.value); setType(CATEGORY_DEFS.find((d) => d.cat === e.target.value)?.types[0] || ""); }}
          options={CATEGORY_DEFS.map((d) => ({ value: d.cat, label: d.cat }))}
        />
        <Select label="Type" value={type} onChange={(e: any) => setType(e.target.value)} options={types.map((t) => ({ value: t, label: t }))} />
        <Select label="Owner team" value={owner} onChange={(e: any) => setOwner(e.target.value)} options={OWNERS.map((o) => ({ value: o, label: o }))} />
        <Select label="Environment" value={env} onChange={(e: any) => setEnv(e.target.value)} options={ENVIRONMENTS.map((o) => ({ value: o, label: o }))} />
      </div>
      <Foot>
        <Button variant="outline-dark" size="sm" onClick={onClose}>Cancel</Button>
        <Button
          variant="solid" size="sm"
          onClick={() => {
            if (!name.trim()) return;
            onRegister(createAsset({ name: name.trim(), type, category, owner, env }));
          }}
        >
          Add asset
        </Button>
      </Foot>
    </ModalShell>
  );
}

/* ───────────────────── Provision new asset (4-step wizard) ───────────────────── */

interface ProvState {
  category: string; type: string; name: string; cloud: string; region: string;
  env: string; owner: string; size: "Small" | "Standard" | "Large"; benchmarks: string[]; requireTags: boolean;
}
const STEP_LABELS = ["", "What are you provisioning?", "Configuration", "Compliance & benchmarks", "Review & provision"];

export function ProvisionAssetWizard({ onProvision, onClose }: { onProvision: (fields: ProvState) => void; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [prov, setProv] = useState<ProvState>({
    category: "", type: "", name: "", cloud: CLOUDS[0], region: REGIONS[0], env: "Prod", owner: OWNERS[0], size: "Standard", benchmarks: [], requireTags: true,
  });
  const [provisioning, setProvisioning] = useState(false);

  function set<K extends keyof ProvState>(k: K, v: ProvState[K]) {
    setProv((p) => ({ ...p, [k]: v }));
  }
  const applicable = prov.category ? benchmarksFor(prov.category) : [];

  return (
    <ModalShell title="Provision new asset" sub={`Step ${step} of 4 — ${STEP_LABELS[step]}`}>
      {step === 1 && (
        <>
          <p className="mb-3 text-[13px] text-black/60 dark:text-zinc-400">Choose what kind of asset Scrubbe should provision.</p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {CATEGORY_DEFS.map((d) => (
              <button
                key={d.cat}
                onClick={() => { set("category", d.cat); set("type", d.types[0]); }}
                className={cn(
                  "rounded-md border px-3.5 py-3 text-left text-[13px] font-semibold",
                  prov.category === d.cat ? "border-IMSDarkGreen bg-IMSDarkGreen/10 text-IMSDarkGreen" : "border-zinc-200 text-black dark:border-zinc-700 dark:text-zinc-200",
                )}
              >
                {d.cat}
              </button>
            ))}
          </div>
          {prov.category && (
            <div className="mt-4">
              <Select
                label="Specific type"
                value={prov.type}
                onChange={(e: any) => set("type", e.target.value)}
                options={(CATEGORY_DEFS.find((d) => d.cat === prov.category)?.types ?? []).map((t) => ({ value: t, label: t }))}
              />
            </div>
          )}
          <Foot>
            <Button variant="outline-dark" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="solid" size="sm" disabled={!prov.category} onClick={() => setStep(2)}>Next <ChevronRight size={13} /></Button>
          </Foot>
        </>
      )}
      {step === 2 && (
        <>
          <div className="space-y-4">
            <Input label="Asset name" value={prov.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. checkout-api-pod-9c31" />
            <Select label="Cloud provider" value={prov.cloud} onChange={(e: any) => set("cloud", e.target.value)} options={CLOUDS.map((c) => ({ value: c, label: c }))} />
            <Select label="Region" value={prov.region} onChange={(e: any) => set("region", e.target.value)} options={REGIONS.map((r) => ({ value: r, label: r }))} />
            <Select label="Environment" value={prov.env} onChange={(e: any) => set("env", e.target.value)} options={ENVIRONMENTS.map((e) => ({ value: e, label: e }))} />
            <Select label="Owner team" value={prov.owner} onChange={(e: any) => set("owner", e.target.value)} options={OWNERS.map((o) => ({ value: o, label: o }))} />
            <Select label="Size / tier" value={prov.size} onChange={(e: any) => set("size", e.target.value)} options={["Small", "Standard", "Large"].map((s) => ({ value: s, label: s }))} />
          </div>
          <Foot>
            <Button variant="outline-dark" size="sm" onClick={() => setStep(1)}><ChevronLeft size={13} /> Back</Button>
            <Button variant="solid" size="sm" disabled={!prov.name.trim()} onClick={() => setStep(3)}>Next <ChevronRight size={13} /></Button>
          </Foot>
        </>
      )}
      {step === 3 && (
        <>
          <p className="mb-3 text-[13px] text-black/60 dark:text-zinc-400">Select which compliance benchmarks this asset must be held to.</p>
          {applicable.length ? (
            <div className="space-y-2">
              {applicable.map((b) => (
                <label key={b.id} className="flex cursor-pointer items-center gap-3 rounded-md border border-zinc-200 px-3.5 py-2.5 dark:border-zinc-700">
                  <input
                    type="checkbox"
                    checked={prov.benchmarks.includes(b.id)}
                    onChange={(e) => set("benchmarks", e.target.checked ? [...prov.benchmarks, b.id] : prov.benchmarks.filter((x) => x !== b.id))}
                    className="h-3.5 w-3.5 accent-IMSDarkGreen"
                  />
                  <span className="flex-1 text-[13px] font-medium text-black dark:text-zinc-200">{b.rule}</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10.5px] font-semibold text-black/60 dark:bg-zinc-800 dark:text-zinc-400">{b.standard}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-black/40 dark:text-zinc-500">No benchmarks are defined yet for this category.</p>
          )}
          <label className="mt-4 flex items-center gap-2.5 text-[12.5px] text-black/70 dark:text-zinc-400">
            <input type="checkbox" checked={prov.requireTags} onChange={(e) => set("requireTags", e.target.checked)} className="h-3.5 w-3.5 accent-IMSDarkGreen" />
            Require ownership and cost-center tags before this asset can go live
          </label>
          <Foot>
            <Button variant="outline-dark" size="sm" onClick={() => setStep(2)}><ChevronLeft size={13} /> Back</Button>
            <Button variant="solid" size="sm" onClick={() => setStep(4)}>Review <ChevronRight size={13} /></Button>
          </Foot>
        </>
      )}
      {step === 4 && (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[["Name", prov.name], ["Type", prov.type], ["Category", prov.category], ["Cloud / Region", `${prov.cloud} · ${prov.region}`], ["Environment", prov.env], ["Owner", prov.owner], ["Size", prov.size], ["Benchmarks enforced", String(prov.benchmarks.length)]].map(([k, v]) => (
              <div key={k} className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/40">
                <div className="text-[11px] text-black/40 dark:text-zinc-500">{k}</div>
                <div className="mt-0.5 truncate text-[13px] font-bold text-black dark:text-zinc-100">{v}</div>
              </div>
            ))}
          </div>
          {provisioning && (
            <div className="mt-4 flex items-center gap-2.5 rounded-md border border-zinc-200 px-3.5 py-3 text-[13px] font-semibold text-black dark:border-zinc-700 dark:text-zinc-200">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-IMSDarkGreen border-t-transparent" />
              Provisioning via {prov.cloud} API…
            </div>
          )}
          <Foot>
            <Button variant="outline-dark" size="sm" disabled={provisioning} onClick={() => setStep(3)}><ChevronLeft size={13} /> Back</Button>
            <Button
              variant="solid" size="sm" disabled={provisioning}
              onClick={() => {
                setProvisioning(true);
                setTimeout(() => onProvision(prov), 1300);
              }}
            >
              Provision asset
            </Button>
          </Foot>
        </>
      )}
    </ModalShell>
  );
}

/* ───────────────────── Attach to incident ───────────────────── */

export function AttachIncidentModal({
  assetName, onAttach, onClose,
}: { assetName: string; onAttach: (label: string, priority: string) => void; onClose: () => void }) {
  const [choice, setChoice] = useState("Create new incident");
  const [priority, setPriority] = useState("P2");

  return (
    <ModalShell title="Attach to incident" sub={assetName}>
      <div className="space-y-4">
        <Select
          label="Incident"
          value={choice}
          onChange={(e: any) => setChoice(e.target.value)}
          options={["Create new incident", "SI-042871 — checkout-service rollout", "SI-042755 — payments-api canary"].map((o) => ({ value: o, label: o }))}
        />
        <Select label="Priority" value={priority} onChange={(e: any) => setPriority(e.target.value)} options={["P0", "P1", "P2", "P3"].map((o) => ({ value: o, label: o }))} />
      </div>
      <Foot>
        <Button variant="outline-dark" size="sm" onClick={onClose}>Cancel</Button>
        <Button
          variant="solid" size="sm"
          onClick={() => {
            const label = choice === "Create new incident" ? "SI-" + Math.floor(100000 + Math.random() * 899999) : choice.split(" — ")[0];
            onAttach(label, priority);
          }}
        >
          Attach
        </Button>
      </Foot>
    </ModalShell>
  );
}

/* ───────────────────── Add compliance benchmark ───────────────────── */

export function AddBenchmarkModal({ onAdd, onClose }: { onAdd: (b: Omit<Benchmark, "id" | "enabled">) => void; onClose: () => void }) {
  const [standard, setStandard] = useState("SOC2");
  const [rule, setRule] = useState("");
  const [appliesTo, setAppliesTo] = useState("All");
  const [severity, setSeverity] = useState<"Critical" | "High" | "Medium">("Critical");

  return (
    <ModalShell title="Add compliance benchmark" sub="Define a new rule that determines when an asset is in violation.">
      <div className="space-y-4">
        <Select label="Standard" value={standard} onChange={(e: any) => setStandard(e.target.value)} options={["SOC2", "ISO27001", "PCI-DSS", "GDPR"].map((o) => ({ value: o, label: o }))} />
        <Input label="Rule" value={rule} onChange={(e) => setRule(e.target.value)} placeholder="e.g. Load balancers must terminate TLS 1.2+" />
        <Select label="Applies to" value={appliesTo} onChange={(e: any) => setAppliesTo(e.target.value)} options={["All", ...CATEGORY_DEFS.map((d) => d.cat)].map((o) => ({ value: o, label: o }))} />
        <Select label="Severity" value={severity} onChange={(e: any) => setSeverity(e.target.value)} options={["Critical", "High", "Medium"].map((o) => ({ value: o, label: o }))} />
      </div>
      <Foot>
        <Button variant="outline-dark" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="solid" size="sm" disabled={!rule.trim()} onClick={() => onAdd({ standard, rule: rule.trim(), appliesTo, severity })}>Add benchmark</Button>
      </Foot>
    </ModalShell>
  );
}

/* ───────────────────── Add policy ───────────────────── */

export function AddPolicyModal({ onAdd, onClose }: { onAdd: (p: Omit<PolicyDef, "enabled">) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [scope, setScope] = useState("");
  const [rule, setRule] = useState("");

  return (
    <ModalShell title="Add policy" sub="Define a new enterprise control.">
      <div className="space-y-4">
        <Input label="Policy name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Encryption at rest required" />
        <Input label="Scope" value={scope} onChange={(e) => setScope(e.target.value)} placeholder="e.g. All storage assets" />
        <Input label="Rule" value={rule} onChange={(e) => setRule(e.target.value)} placeholder="e.g. Blocked at provision time if unencrypted" />
      </div>
      <Foot>
        <Button variant="outline-dark" size="sm" onClick={onClose}>Cancel</Button>
        <Button
          variant="solid" size="sm" disabled={!name.trim()}
          onClick={() => onAdd({ name: name.trim(), scope: scope.trim() || "All assets", rule: rule.trim() || "Custom rule" })}
        >
          Add policy
        </Button>
      </Foot>
    </ModalShell>
  );
}

/* ───────────────────── Reassign owner (bulk) ───────────────────── */

export function ReassignOwnerModal({ count, onReassign, onClose }: { count: number; onReassign: (owner: string) => void; onClose: () => void }) {
  const [owner, setOwner] = useState(OWNERS[0]);
  return (
    <ModalShell title="Reassign owner" sub={`${count} asset${count === 1 ? "" : "s"} selected`}>
      <Select label="Owner team" value={owner} onChange={(e: any) => setOwner(e.target.value)} options={OWNERS.map((o) => ({ value: o, label: o }))} />
      <Foot>
        <Button variant="outline-dark" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="solid" size="sm" onClick={() => onReassign(owner)}>Reassign</Button>
      </Foot>
    </ModalShell>
  );
}
