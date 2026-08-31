"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Search, Shield, Check } from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface GuardValDef {
  def: number; min: number; max: number; unit: string; pre: string; suf: string;
}

export interface GuardItem {
  key:    string;
  label:  string;
  use:    string;
  val?:   GuardValDef;
  intel?: boolean;
}

interface AddGuardPanelProps {
  isOpen:     boolean;
  addedKeys:  Set<string>;
  onAdd:      (key: string) => void;
  onClose:    () => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

// ─── GUARD CATALOG ───────────────────────────────────────────────────────────

const GUARD_CATALOG: { sec: string; items: GuardItem[] }[] = [
  { sec:"HUMAN RESPONSE", items:[
    { key:"ack",              label:"Incident acknowledged",          use:"A human already picked it up. Skip actions so the rule doesn't race the responder." },
    { key:"responderActive",  label:"Responder active",               use:"An engineer is actively investigating. Checked via war-room presence and timeline activity.", val:{def:5,min:1,max:1440,unit:"min",pre:"within last",suf:"min"} },
    { key:"ownerAssigned",    label:"Owner assigned",                 use:"An owner is already set. Skip routing actions that would replace or duplicate ownership." },
    { key:"teamAssigned",     label:"Owning team assigned",           use:"A team already owns this incident. Avoid re-assigning." },
    { key:"icAssigned",       label:"Incident commander assigned",    use:"An IC is in place — leadership is handling the incident already." },
  ]},
  { sec:"INCIDENT STATE", items:[
    { key:"warRoomExists",    label:"War room already exists",        use:"A war room is open. Skip the Start War Room action to prevent duplicates." },
    { key:"playbookAttached", label:"Playbook already attached",      use:"A playbook is already running. Skip the Attach Playbook action." },
    { key:"linkedToParent",   label:"Linked to a parent incident",    use:"Already linked to a mother — skip root-cause and investigation actions." },
    { key:"statusChanged",    label:"Status is no longer Open",       use:"Investigation has already started or the incident has moved on." },
    { key:"approvalGranted",  label:"Approval already granted",       use:"Sign-off is already cleared — avoid prompting for approval a second time." },
  ]},
  { sec:"SYSTEM & SIGNAL", items:[
    { key:"automationRunning",label:"Another automation running",     use:"A concurrent automation is already handling this incident. Prevent collisions." },
    { key:"similarActive",    label:"Similar incident active",        use:"A sufficiently-similar incident is already open. Skip incident-creation actions.", val:{def:90,min:1,max:100,unit:"%",pre:"similarity >",suf:"%"} },
    { key:"serviceHealthy",   label:"Service is healthy",             use:"The service has recovered before the rule fires. Skip remediation actions." },
    { key:"signalCleared",    label:"Triggering signal cleared",      use:"The metric spike or alert that triggered the rule has resolved." },
    { key:"inChangeWindow",   label:"Within approved change window",  use:"Disruption is expected — suppress notifications and escalations inside planned windows." },
  ]},
  { sec:"OVERRIDE", items:[
    { key:"execOverride",     label:"Executive override enabled",     use:"Leadership has intentionally paused automation. Respect the override." },
  ]},
  { sec:"INTELLIGENT · EZRA", items:[
    { key:"opConfidence",     label:"Humans are already in control",  use:"Ezra weighs war-room presence, active responders, recent findings, timeline updates and a drafted resolution to produce a human-control confidence score.", val:{def:80,min:1,max:100,unit:"%",pre:"confidence >",suf:"%"}, intel:true },
  ]},
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function AddGuardPanel({ isOpen, addedKeys, onAdd, onClose }: AddGuardPanelProps): React.JSX.Element | null {
  const [search, setSearch] = useState<string>("");
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: MouseEvent): void => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    setTimeout(() => document.addEventListener("click", fn, true), 0);
    return () => document.removeEventListener("click", fn, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = search.toLowerCase();
  const filtered = GUARD_CATALOG.map(g => ({
    ...g,
    items: g.items.filter(it =>
      !q ||
      it.label.toLowerCase().includes(q) ||
      it.use.toLowerCase().includes(q)
    ),
  })).filter(g => g.items.length > 0);

  return (
    <div ref={ref} className="absolute left-0 top-[calc(100%+8px)] z-50 w-[440px] max-h-[520px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center">
            <Shield size={14} className="text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <div className="text-[13.5px] font-bold text-zinc-900 dark:text-zinc-100">Add suppression guard</div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500">Skip actions when these conditions are true</div>
          </div>
        </div>
        <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <X size={15} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input type="text" placeholder="Search guards…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-[12.5px] border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 dark:text-zinc-200 outline-none focus:border-indigo-400 focus:bg-white dark:focus:bg-zinc-900 transition-colors" />
        </div>
      </div>

      {/* Guard list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center text-[12.5px] text-zinc-400 dark:text-zinc-500 italic py-8">No guards match &quot;{search}&quot;</div>
        ) : filtered.map(g => (
          <div key={g.sec}>
            {/* Section header */}
            <div className={`text-[10px] font-black tracking-widest uppercase mb-2 pb-1.5 border-b ${g.sec === "INTELLIGENT · EZRA" ? "text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-500/20" : "text-zinc-400 dark:text-zinc-500 border-zinc-100 dark:border-zinc-800"}`}>
              {g.sec}
            </div>
            <div className="space-y-1.5">
              {g.items.map(item => {
                const isAdded = addedKeys.has(item.key);
                return (
                  <button key={item.key} type="button"
                    disabled={isAdded}
                    onClick={() => { if (!isAdded) { onAdd(item.key); } }}
                    className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl border transition-all group ${
                      isAdded
                        ? "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-100 dark:border-zinc-800 opacity-60 cursor-not-allowed"
                        : item.intel
                        ? "border-teal-100 dark:border-teal-500/20 bg-gradient-to-r from-teal-50/60 to-white dark:from-teal-500/10 dark:to-zinc-900 hover:border-teal-200 dark:hover:border-teal-500/30 hover:bg-teal-50/80 dark:hover:bg-teal-500/10 cursor-pointer"
                        : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:border-zinc-200 dark:hover:border-zinc-700 cursor-pointer"
                    }`}>
                    {/* Icon */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${item.intel ? "bg-teal-100 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20" : "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"}`}>
                      {isAdded
                        ? <Check size={13} className="text-emerald-500 dark:text-emerald-400" />
                        : <Shield size={13} className={item.intel ? "text-teal-600 dark:text-teal-400" : "text-zinc-500 dark:text-zinc-400"} />}
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[13px] font-semibold ${item.intel ? "text-teal-700 dark:text-teal-400" : "text-zinc-800 dark:text-zinc-100"}`}>
                          {item.label}
                        </span>
                        {isAdded && (
                          <span className="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            Added
                          </span>
                        )}
                        {item.intel && !isAdded && (
                          <span className="text-[10px] font-bold tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 px-1.5 py-0.5 rounded">
                            Ezra
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-zinc-400 dark:text-zinc-500 leading-relaxed mt-0.5">{item.use}</p>
                      {item.val && !isAdded && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                          <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">{item.val.pre} {item.val.def}{item.val.suf}</span>
                          <span className="text-zinc-400 dark:text-zinc-500">· configurable after adding</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60">
        <p className="text-[11.5px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
          Guards are evaluated before actions run. When{" "}
          <span className="font-semibold text-zinc-600 dark:text-zinc-300">any</span> (or{" "}
          <span className="font-semibold text-zinc-600 dark:text-zinc-300">all</span>) are active, the rule steps aside without firing.
        </p>
      </div>
    </div>
  );
}
