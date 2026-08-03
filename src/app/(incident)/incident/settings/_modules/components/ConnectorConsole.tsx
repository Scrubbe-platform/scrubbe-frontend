"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Plus, Settings2, RefreshCw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button1";
import { CONN, CONN_CATS, TINTS, connMeta, hookUrl, randTok } from "./settings.data";
import { Explain, SecretField, TextAreaField, TextField, ToggleRow } from "./SettingsPrimitives";

export interface ConnRecord {
  id: string;
  on: boolean;
  config: Record<string, any>;
  custom?: { name: string; cat: string; blurb: string; inbound?: boolean };
}

export function ConnectorConsole({ list, onChange }: { list: ConnRecord[]; onChange: (list: ConnRecord[]) => void }) {
  const [sub, setSub] = useState<number | null>(null);

  function updateAt(i: number, patch: Partial<ConnRecord>) {
    const next = list.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function updateConfig(i: number, key: string, val: any) {
    const next = list.slice();
    next[i] = { ...next[i], config: { ...next[i].config, [key]: val } };
    onChange(next);
  }
  function addCustom() {
    onChange([...list, {
      id: "custom_" + Math.random().toString(16).slice(2, 7),
      on: false,
      custom: { name: "New integration", cat: "custom", blurb: "Custom connector", inbound: true },
      config: { apiBaseUrl: "", token: "", webhookSecret: "", inHook: randTok("cu") },
    }]);
    setSub(list.length);
  }

  if (sub != null && list[sub]) {
    const rec = list[sub];
    const meta = connMeta(rec.id, rec.custom);
    const [bg, fg] = TINTS[meta.tint];
    return (
      <div>
        <div className="mb-4 -mt-1 flex items-center gap-2.5">
          <Button variant="outline-dark" size="sm" leftIcon={<ChevronLeft size={14} />} onClick={() => setSub(null)}>
            All connectors
          </Button>
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-ibm text-[12px] font-bold", bg, fg)}>{meta.short}</span>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-bold text-black dark:text-zinc-100">{meta.name}</div>
            <div className="truncate text-[11.5px] text-black/50 dark:text-zinc-500">{meta.blurb}</div>
          </div>
        </div>

        <ToggleRow
          title="Connection enabled" desc={`When on, Scrubbe reads from and acts through ${meta.name}.`}
          checked={rec.on} onChange={(v) => updateAt(sub, { on: v })}
        />
        <div className="mb-5 mt-4 text-[11px] font-bold uppercase tracking-wide text-black/40 dark:text-zinc-500">Connection</div>
        {meta.fields.map((f) =>
          f.secret ? (
            <SecretField key={f.k} label={f.label} help={f.help} placeholder={f.ph} value={rec.config[f.k] || ""} onChange={(v) => updateConfig(sub, f.k, v)} />
          ) : f.area ? (
            <TextAreaField key={f.k} label={f.label} help={f.help} value={rec.config[f.k] || ""} onChange={(v) => updateConfig(sub, f.k, v)} mono rows={4} />
          ) : (
            <TextField key={f.k} label={f.label} help={f.help} placeholder={f.ph} value={rec.config[f.k] || ""} onChange={(v) => updateConfig(sub, f.k, v)} />
          ),
        )}

        {meta.events && (
          <>
            <div className="mb-2.5 mt-6 text-[11px] font-bold uppercase tracking-wide text-black/40 dark:text-zinc-500">Event scopes</div>
            <p className="-mt-2 mb-2.5 text-[12px] text-black/50 dark:text-zinc-500">Choose which {meta.name} events Scrubbe ingests.</p>
            <div className="grid grid-cols-2 gap-2">
              {meta.events.map((ev) => {
                const on = (rec.config.events || []).includes(ev);
                return (
                  <button
                    key={ev} type="button"
                    onClick={() => updateConfig(sub, "events", on ? rec.config.events.filter((x: string) => x !== ev) : [...(rec.config.events || []), ev])}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-2.5 py-2 text-[12.5px] font-semibold",
                      on ? "border-IMSDarkGreen bg-IMSDarkGreen/10 text-IMSDarkGreen" : "border-zinc-200 text-black/70 dark:border-zinc-700 dark:text-zinc-400",
                    )}
                  >
                    <span className={cn("flex h-4 w-4 items-center justify-center rounded border", on ? "border-IMSDarkGreen bg-IMSDarkGreen text-white" : "border-zinc-300 dark:border-zinc-600")}>
                      {on && <Zap size={10} />}
                    </span>
                    {ev}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {meta.inbound && (
          <>
            <div className="mb-2.5 mt-6 text-[11px] font-bold uppercase tracking-wide text-black/40 dark:text-zinc-500">Inbound webhook</div>
            <p className="-mt-2 mb-2.5 text-[12px] text-black/50 dark:text-zinc-500">Point {meta.name} at this endpoint to stream signals into Scrubbe.</p>
            <div className="mb-3 flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 font-ibm text-[12px] text-black/70 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-400">
              <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{hookUrl(rec.id, rec.config.inHook)}</code>
              <button
                onClick={() => { navigator.clipboard?.writeText(hookUrl(rec.id, rec.config.inHook)).catch(() => {}); toast.success("Webhook URL copied"); }}
                className="shrink-0 rounded p-1 text-black/40 hover:bg-zinc-200 hover:text-black dark:text-zinc-500 dark:hover:bg-zinc-700"
              >
                <Settings2 size={14} />
              </button>
            </div>
            <SecretField label="Signing secret" help="Verify inbound payloads against this HMAC secret." value={rec.config.webhookSecret || ""} onChange={(v) => updateConfig(sub, "webhookSecret", v)} />
            <Button
              variant="outline-dark" size="sm" className="mt-1" leftIcon={<RefreshCw size={13} />}
              onClick={() => { updateConfig(sub, "inHook", randTok(rec.id.slice(0, 2))); toast.success("New webhook URL generated"); }}
            >
              Regenerate URL
            </Button>
          </>
        )}

        <Button
          variant="outline-green" size="sm" className="mt-6" leftIcon={<Zap size={14} />}
          onClick={() => toast.info(`Testing connection to ${meta.name}…`)}
        >
          Test connection
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Explain>Connect the tools Scrubbe watches and acts through. Open a connector to set endpoints, tokens, event scopes and inbound webhooks.</Explain>
      {CONN_CATS.map((cc) => {
        const items = list.map((r, i) => [r, i] as const).filter(([r]) => connMeta(r.id, r.custom).cat === cc.id);
        if (!items.length) return null;
        return (
          <div key={cc.id} className="mb-1">
            <div className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-black/40 first:mt-0 dark:text-zinc-500">{cc.name}</div>
            {items.map(([rec, i]) => {
              const meta = connMeta(rec.id, rec.custom);
              const [bg, fg] = TINTS[meta.tint];
              return (
                <div key={rec.id} className="mb-2 flex items-center gap-3 rounded-md border border-zinc-200 p-3 hover:border-zinc-300 dark:border-zinc-700">
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-ibm text-[13px] font-bold", bg, fg)}>{meta.short}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-bold text-black dark:text-zinc-100">{meta.name}</div>
                    <div className="truncate text-[11.5px] text-black/50 dark:text-zinc-500">{meta.blurb}</div>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold", rec.on ? "bg-IMSDarkGreen/10 text-IMSDarkGreen" : "border border-zinc-200 text-black/40 dark:border-zinc-700 dark:text-zinc-500")}>
                    {rec.on ? "Connected" : "Not connected"}
                  </span>
                  <button onClick={() => setSub(i)} aria-label={`Configure ${meta.name}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-black/50 hover:border-IMSDarkGreen hover:text-IMSDarkGreen dark:border-zinc-700 dark:text-zinc-500">
                    <Settings2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}
      <button onClick={addCustom} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-zinc-300 py-2.5 text-[12.5px] font-bold text-IMSDarkGreen hover:bg-IMSDarkGreen/10 dark:border-zinc-700">
        <Plus size={14} /> Add integration
      </button>
    </div>
  );
}
