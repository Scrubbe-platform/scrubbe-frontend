"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Select from "@/components/ui/select";
import {
  CLOUDS,
  ENVIRONMENTS,
  LANGUAGES,
  OWNERS,
  REGIONS,
  RUNTIMES,
  SERVICES,
  ServiceRecord,
} from "./serviceCatalog.data";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-black dark:text-zinc-500">{label}</label>
      {children}
    </div>
  );
}
const inputCls = "w-full rounded-lg border border-zinc-300 px-3 py-2 text-[13.5px] text-black focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

function ModalTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[16px] font-semibold text-black dark:text-zinc-100">{children}</h3>;
}
function ModalFoot({ children }: { children: React.ReactNode }) {
  return <div className="mt-5 flex justify-end gap-2">{children}</div>;
}
function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg border border-zinc-300 px-3.5 py-2 text-[12.5px] text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
      {children}
    </button>
  );
}
function PrimaryBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg bg-emerald-600 px-3.5 py-2 text-[12.5px] font-medium text-white hover:bg-emerald-700">
      {children}
    </button>
  );
}

const toOptions = (arr: readonly string[]) => arr.map((v) => ({ value: v, label: v }));
const OWNER_OPTIONS = [{ value: "Unassigned", label: "Unassigned" }, ...toOptions(OWNERS)];
const TIER_OPTIONS = [
  { value: "0", label: "Tier 0 — Business critical" },
  { value: "1", label: "Tier 1 — High" },
  { value: "2", label: "Tier 2 — Moderate" },
  { value: "3", label: "Tier 3 — Low" },
];

export interface ServicePatch {
  name: string;
  owner: string;
  tier: number;
  env: string;
  runtime: string;
  cloud: string;
  region: string;
  lang: string;
  version: string;
}

interface FieldState {
  name: string; setName: (v: string) => void;
  owner: string; setOwner: (v: string) => void;
  tier: string; setTier: (v: string) => void;
  env: string; setEnv: (v: string) => void;
  runtime: string; setRuntime: (v: string) => void;
  cloud: string; setCloud: (v: string) => void;
  region: string; setRegion: (v: string) => void;
  lang: string; setLang: (v: string) => void;
  version: string; setVersion: (v: string) => void;
}

function ServiceFormFields(f: FieldState) {
  return (
    <div className="mt-4 space-y-3.5">
      <Field label="Name">
        <input value={f.name} onChange={(e) => f.setName(e.target.value)} className={inputCls} placeholder="e.g. Checkout" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Owner team">
          <Select value={f.owner} onChange={(e) => f.setOwner(e.target.value)} options={OWNER_OPTIONS} />
        </Field>
        <Field label="Business criticality">
          <Select value={f.tier} onChange={(e) => f.setTier(e.target.value)} options={TIER_OPTIONS} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Environment">
          <Select value={f.env} onChange={(e) => f.setEnv(e.target.value)} options={toOptions(ENVIRONMENTS)} />
        </Field>
        <Field label="Runtime">
          <Select value={f.runtime} onChange={(e) => f.setRuntime(e.target.value)} options={toOptions(RUNTIMES)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cloud">
          <Select value={f.cloud} onChange={(e) => f.setCloud(e.target.value)} options={toOptions(CLOUDS)} />
        </Field>
        <Field label="Region">
          <Select value={f.region} onChange={(e) => f.setRegion(e.target.value)} options={toOptions(REGIONS)} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Language">
          <Select value={f.lang} onChange={(e) => f.setLang(e.target.value)} options={toOptions(LANGUAGES)} />
        </Field>
        <Field label="Version">
          <input value={f.version} onChange={(e) => f.setVersion(e.target.value)} className={inputCls} placeholder="1.0.0" />
        </Field>
      </div>
    </div>
  );
}

export function EditServiceForm({
  service,
  onSave,
  onCancel,
}: {
  service: ServiceRecord;
  onSave: (patch: ServicePatch) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(service.name);
  const [owner, setOwner] = useState(service.owner);
  const [tier, setTier] = useState(String(service.tier));
  const [env, setEnv] = useState(service.env);
  const [runtime, setRuntime] = useState(service.runtime);
  const [cloud, setCloud] = useState(service.cloud);
  const [region, setRegion] = useState(service.region);
  const [lang, setLang] = useState(service.lang);
  const [version, setVersion] = useState(service.version);

  return (
    <div className="p-4">
      <ModalTitle>Edit service</ModalTitle>
      <ServiceFormFields
        name={name} setName={setName}
        owner={owner} setOwner={setOwner}
        tier={tier} setTier={setTier}
        env={env} setEnv={setEnv}
        runtime={runtime} setRuntime={setRuntime}
        cloud={cloud} setCloud={setCloud}
        region={region} setRegion={setRegion}
        lang={lang} setLang={setLang}
        version={version} setVersion={setVersion}
      />
      <ModalFoot>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
        <PrimaryBtn
          onClick={() =>
            name.trim() &&
            onSave({
              name: name.trim(),
              owner,
              tier: Number(tier),
              env,
              runtime,
              cloud,
              region,
              lang,
              version: version.trim() || service.version,
            })
          }
        >
          Save changes
        </PrimaryBtn>
      </ModalFoot>
    </div>
  );
}

export function CreateServiceForm({
  onCreate,
  onCancel,
}: {
  onCreate: (patch: ServicePatch) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [owner, setOwner] = useState(OWNERS[0]);
  const [tier, setTier] = useState("2");
  const [env, setEnv] = useState(ENVIRONMENTS[0]);
  const [runtime, setRuntime] = useState(RUNTIMES[0]);
  const [cloud, setCloud] = useState(CLOUDS[0]);
  const [region, setRegion] = useState(REGIONS[0]);
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [version, setVersion] = useState("1.0.0");

  function submit() {
    const finalName = name.trim();
    if (!finalName) {
      toast.error("Service name can't be empty");
      return;
    }
    if (SERVICES.some((s) => s.name.toLowerCase() === finalName.toLowerCase())) {
      toast.error(`A service named "${finalName}" already exists`);
      return;
    }
    onCreate({
      name: finalName,
      owner,
      tier: Number(tier),
      env,
      runtime,
      cloud,
      region,
      lang,
      version: version.trim() || "1.0.0",
    });
  }

  return (
    <div className="p-4">
      <ModalTitle>Add service</ModalTitle>
      <ServiceFormFields
        name={name} setName={setName}
        owner={owner} setOwner={setOwner}
        tier={tier} setTier={setTier}
        env={env} setEnv={setEnv}
        runtime={runtime} setRuntime={setRuntime}
        cloud={cloud} setCloud={setCloud}
        region={region} setRegion={setRegion}
        lang={lang} setLang={setLang}
        version={version} setVersion={setVersion}
      />
      <ModalFoot>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
        <PrimaryBtn onClick={submit}>Create service</PrimaryBtn>
      </ModalFoot>
    </div>
  );
}
