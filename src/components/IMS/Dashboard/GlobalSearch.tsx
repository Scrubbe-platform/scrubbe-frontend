"use client";
import React, { useEffect, useState } from "react";
import {
  Search, Clock, FileText, AlertTriangle, ShieldCheck,
  Zap, RotateCcw, Link2, ChevronRight, ChartBar,
  Shield, Check, Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { HiCodeBracket } from "react-icons/hi2";
import { LuSettings } from "react-icons/lu";
import { RiDeleteBin7Line, RiLogoutCircleRLine } from "react-icons/ri";
import { MdOutlineBarChart, MdOutlineModeEdit } from "react-icons/md";

// ── GlobalSearch ──────────────────────────────────────────────────

const GlobalSearch = () => {
  const [activeTab, setActiveTab] = useState("Incidents");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") {} };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="bg-white dark:bg-zinc-950 flex flex-col">

      {/* Search input */}
      <div className="px-4 pt-4 pb-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-zinc-500" />
          <input
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-500 dark:border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-[12px] text-black dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors"
            placeholder="Search incidents, policies, agents…"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 border-b border-zinc-100 dark:border-zinc-800">
        {["Incidents", "Dashboards", "Policy"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-[12px] font-semibold transition-colors relative ${
              activeTab === tab
                ? "text-black dark:text-zinc-100"
                : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-700 dark:bg-zinc-300 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "Incidents"  && <Incident />}
        {activeTab === "Dashboards" && <Dashboards />}
        {activeTab === "Policy"     && <Policy />}
      </div>

      {/* Footer shortcuts */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shortcut keys={["↑", "↓"]} label="nav"     />
          <Shortcut keys={["↵"]}       label="run"     />
          <Shortcut keys={["Tab"]}     label="preview" />
          <Shortcut keys={["ESC"]}     label="close"   />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-black dark:text-zinc-500">13 results</span>
          <button className="px-2.5 py-1 border border-zinc-500 dark:border-zinc-700 rounded text-[10px] font-medium text-black dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            Audit Logs
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Tab panels ────────────────────────────────────────────────────

const Incident = () => (
  <div className="max-h-[460px] overflow-y-auto p-4 space-y-5 custom-scrollbar">
    <Section label="Recently used">
      <CommandItem icon={<Clock size={15} />}        title="Test Policy Against Incident"  desc="Dry-run policy on selected incident"       />
      <CommandItem icon={<Clock size={15} />}        title="Run Root Cause Agent"           desc="Starts RCA analysis on incident data"      />
      <CommandItem icon={<Clock size={15} />}        title="Analyze Incident"               desc="Full diagnosis on current incident"        />
      <CommandItem icon={<Clock size={15} />}        title="Generate Fix Proposal"          desc="AI generates full remediation plan"        />
    </Section>
    <Section label="Incident">
      <CommandItem icon={<ChartBar size={15} />}     title="View Incident Timeline"         desc="Full event sequence & timestamps"          />
      <CommandItem icon={<FileText size={15} />}     title="Open Logs"                      desc="Raw log stream for this incident"          />
      <CommandItem icon={<AlertTriangle size={15} />}title="Update Severity"                desc="Change incident priority level"            />
    </Section>
    <Section label="Agents">
      <CommandItem icon={<ShieldCheck size={15} />}  title="Run Verification Agent"         desc="Validate fix resolved the incident"        />
      <CommandItem icon={<RotateCcw size={15} />}    title="Run Log Analysis Agent"         desc="Deep parse logs for anomaly patterns"      />
    </Section>
    <Section label="Remediation">
      <CommandItem icon={<Zap size={15} />}          title="Execute Fix"                    desc="Apply generated fix to affected server"    />
      <CommandItem icon={<RotateCcw size={15} />}    title="Roll back Fix"                  desc="Revert last applied fix immediately"       />
      <CommandItem icon={<Link2 size={15} />}        title="Full Remediation Chain"         desc="RCA → Fix Proposal → Verify automated"    />
    </Section>
  </div>
);

const Dashboards = () => {
  const router = useRouter();
  return (
    <div className="max-h-[460px] overflow-y-auto p-4 space-y-5 custom-scrollbar">
      <Section label="Recently used">
        <CommandItem icon={<Clock size={15} />}        title="Test Policy Against Incident"  desc="Dry-run policy on selected incident"  />
        <CommandItem icon={<Clock size={15} />}        title="Run Root Cause Agent"           desc="Starts RCA analysis on incident data" />
        <CommandItem icon={<Clock size={15} />}        title="Analyze Incident"               desc="Full diagnosis on current incident"   />
        <CommandItem icon={<Clock size={15} />}        title="Generate Fix Proposal"          desc="AI generates full remediation plan"   />
      </Section>
      <Section label="Navigation">
        <CommandItem icon={<Clock size={15} />}        title="Go to Incidents"   desc="Open incidents list view"               onClick={() => router.push("/incident/tickets")}  />
        <CommandItem icon={<Shield size={15} />}       title="Open Policies"     desc="Manage remediation policies"            onClick={() => router.push("/incident/policies")} />
        <CommandItem icon={<HiCodeBracket size={15} />}title="Open Agents"       desc="View all agent configuration"          />
        <CommandItem icon={<LuSettings size={15} />}   title="Open Settings"     desc="Platform settings & preferences"        onClick={() => router.push("/incident/settings")} />
      </Section>
      <Section label="Agents">
        <CommandItem icon={<Check size={15} />}        title="Generate Fix Proposal" desc="Create a new fix proposal" />
      </Section>
      <Section label="Remediation">
        <CommandItem icon={<Zap size={15} />}              title="Execute Fix"   desc="Apply generated fix to affected server" />
        <CommandItem icon={<RiLogoutCircleRLine size={15} />}title="Roll back Fix" desc="Revert last applied fix immediately"   />
      </Section>
    </div>
  );
};

const Policy = () => {
  const router = useRouter();
  return (
    <div className="max-h-[460px] overflow-y-auto p-4 space-y-5 custom-scrollbar">
      <Section label="Recently used">
        <CommandItem icon={<Clock size={15} />} title="Test Policy Against Incident" desc="Dry-run policy on selected incident"  />
        <CommandItem icon={<Clock size={15} />} title="Run Root Cause Agent"          desc="Starts RCA analysis on incident data" />
        <CommandItem icon={<Clock size={15} />} title="Analyze Incident"              desc="Full diagnosis on current incident"   />
        <CommandItem icon={<Clock size={15} />} title="Generate Fix Proposal"         desc="AI generates full remediation plan"   />
      </Section>
      <Section label="Policies">
        <CommandItem icon={<Plus size={15} />}               title="Create New Policy"       desc="Craft a new remediation policy"              />
        <CommandItem icon={<MdOutlineModeEdit size={15} />}  title="Edit Active Policy"      desc="Modify an existing policy rule"              />
        <CommandItem icon={<MdOutlineBarChart size={15} />}  title="View Policy Audit Log"   desc="History of policy triggers & blocks"         />
        <CommandItem icon={<LuSettings size={15} />}         title="Enable Disabled Policy"  desc="Activate a currently disabled policy"        />
        <CommandItem icon={<RiDeleteBin7Line size={15} />}   title="Delete Draft Policy"     desc="Permanently remove a draft policy"           />
      </Section>
      <Section label="Navigation">
        <CommandItem icon={<Clock size={15} />}  title="Go to Incidents" desc="Open incidents list view"      onClick={() => router.push("/incident/tickets")} />
        <CommandItem icon={<Shield size={15} />} title="Go to Dashboard" desc="Manage remediation policies"   onClick={() => router.push("/incident")}         />
      </Section>
    </div>
  );
};

// ── Helper components ─────────────────────────────────────────────

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <h3 className="text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500 px-2 mb-2">
      {label}
    </h3>
    <div className="space-y-0.5">{children}</div>
  </div>
);

const CommandItem = ({
  icon, title, desc, onClick,
}: {
  icon: React.ReactNode; title: string; desc: string; onClick?: () => void;
}) => (
  <div
    onClick={() => onClick ? onClick() : toast.info("Coming Soon")}
    className="group flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 bg-white dark:bg-transparent transition-colors cursor-pointer"
  >
    <div className="w-8 h-8 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-black dark:text-zinc-500 shrink-0 group-hover:border-zinc-200 dark:group-hover:border-zinc-700 transition-colors">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[12px] font-semibold text-black dark:text-zinc-200 leading-tight">{title}</p>
      <p className="text-[11px] text-black dark:text-zinc-500 leading-tight mt-0.5">{desc}</p>
    </div>
    <ChevronRight size={13} className="text-zinc-300 dark:text-black opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
  </div>
);

const Shortcut = ({ keys, label }: { keys: string[]; label: string }) => (
  <div className="flex items-center gap-1.5">
    <div className="flex gap-0.5">
      {keys.map((k) => (
        <kbd key={k} className="min-w-[18px] h-5 flex items-center justify-center px-1 rounded border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[10px] font-mono text-black dark:text-zinc-400">
          {k}
        </kbd>
      ))}
    </div>
    <span className="text-[10px] text-black dark:text-zinc-500 uppercase tracking-wide">{label}</span>
  </div>
);

export default GlobalSearch;