import React, { useEffect, useState } from "react";
import {
  Search,
  X,
  Command,
  Clock,
  Play,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Zap,
  History,
  RotateCcw,
  Link2,
  ChevronRight,
  Terminal,
  ChartBar,
  Shield,
  Check,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { HiCodeBracket } from "react-icons/hi2";
import { LuSettings } from "react-icons/lu";
import { RiDeleteBin7Line, RiLogoutCircleRLine } from "react-icons/ri";
import { MdOutlineBarChart, MdOutlineModeEdit } from "react-icons/md";

const GlobalSearch = () => {
  const [activeTab, setActiveTab] = useState("Incidents");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        console.log("Escape key pressed!");
        // Add your logic here (e.g., close a modal)
      }
    };

    // Attach the listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up the listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <div className="bg-dark">
      {/* NAVIGATION TABS */}
      <div className="relative w-fit">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          className="bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-xs w-64 focus:outline-none focus:border-white/20"
          placeholder="Global Search"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex px-4 pt-2 border-b border-white/30 w-full ">
        {["Incidents", "Dashboards", "Policy"].map((tab) => (
          <div key={tab} className="w-full text-center">
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-base font-bold transition-all relative ${
                activeTab === tab
                  ? "text-cyan-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      {activeTab === "Incidents" && <Incident />}
      {activeTab === "Dashboards" && <Dashboards />}
      {activeTab === "Policy" && <Policy />}

      {/* BOTTOM SHORTCUT BAR */}
      <div className="bg-[#080d1a] border-t border-white/10 p-3 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shortcut keys={["↑", "↓"]} label="nav" />
          <Shortcut keys={["↵"]} label="run" />
          <Shortcut keys={["Tab"]} label="Preview" />
          <Shortcut keys={["⇧", "↵"]} label="Chain" />
          <Shortcut keys={["ESC"]} label="Close" />
        </div>
        <div className="flex items-center gap-4 ml-2">
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
            13 results
          </span>
          <button className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[8px] font-bold text-cyan-400 hover:bg-cyan-500/20 transition-all">
            Audit Logs
          </button>
        </div>
      </div>
    </div>
  );
};

// --- TABS SECTION ---
const Incident = () => {
  return (
    <div className="max-h-[500px] overflow-y-auto p-4 space-y-6 custom-scrollbar">
      <Section label="Recently used">
        <CommandItem
          icon={<Clock size={16} className="text-IMSCyan" />}
          title="Test Policy Against Incident"
          desc="Dry-run policy on selected incident"
        />
        <CommandItem
          icon={<Clock size={16} className="text-IMSCyan" />}
          title="Run Root Cause Agent"
          desc="Starts RCA analysis on incident data"
        />
        <CommandItem
          icon={<Clock size={16} className="text-IMSCyan" />}
          title="Analyze Incident"
          desc="Full diagnosis on current incident"
        />
        <CommandItem
          icon={<Clock size={16} className="text-IMSCyan" />}
          title="Generate Fix Proposal"
          desc="AI generates full remediation plan"
        />
      </Section>

      <Section label="Incident">
        <CommandItem
          icon={<ChartBar size={16} className="text-red-400" />}
          title="View Incident Timeline"
          desc="Full event sequence & timestamps"
        />
        <CommandItem
          icon={<FileText size={16} className="text-red-400" />}
          title="Open Logs"
          desc="Raw log stream for this incident"
        />
        <CommandItem
          icon={<AlertTriangle size={16} className="text-red-400" />}
          title="Update Severity"
          desc="Change incident priority level"
        />
      </Section>

      <Section label="Agents">
        <CommandItem
          icon={<ShieldCheck size={16} className="text-emerald-400" />}
          title="Run Verification Agent"
          desc="Validate fix resolved the incident"
        />
        <CommandItem
          icon={<RotateCcw size={16} className="text-indigo-400" />}
          title="Run Log Analysis Agent"
          desc="Deep parse logs for anomaly patterns"
        />
      </Section>

      <Section label="Remediation">
        <CommandItem
          icon={<Zap size={16} className="text-yellow-400" />}
          title="Execute Fix"
          desc="Apply generated fix to affected server"
        />
        <CommandItem
          icon={<RotateCcw size={16} className="text-rose-400" />}
          title="Roll back Fix"
          desc="Revert last applied fix immediately"
        />
        <CommandItem
          icon={<Link2 size={16} className="text-lime-400" />}
          title="Full Remediation Chain"
          desc="RCA -> Fix Proposal -> Verify automated"
        />
      </Section>
    </div>
  );
};

const Dashboards = () => {
  const router = useRouter();
  return (
    <div className="max-h-[500px] overflow-y-auto p-4 space-y-6 custom-scrollbar">
      <Section label="Recently used">
        <CommandItem
          icon={<Clock size={16} className="text-IMSCyan" />}
          title="Test Policy Against Incident"
          desc="Dry-run policy on selected incident"
        />
        <CommandItem
          icon={<Clock size={16} className="text-IMSCyan" />}
          title="Run Root Cause Agent"
          desc="Starts RCA analysis on incident data"
        />
        <CommandItem
          icon={<Clock size={16} className="text-IMSCyan" />}
          title="Analyze Incident"
          desc="Full diagnosis on current incident"
        />
        <CommandItem
          icon={<Clock size={16} className="text-IMSCyan" />}
          title="Generate Fix Proposal"
          desc="AI generates full remediation plan"
        />
      </Section>

      <Section label="Navigation">
        <CommandItem
          icon={<Clock size={16} className="text-IMSCyan" />}
          title="Go to Incidents"
          desc="Open incidents list view"
          onClick={() => router.push("/incident/tickets")}
        />
        <CommandItem
          icon={<Shield size={16} className="text-IMSCyan" />}
          title="Open Policies"
          desc="Manage remediation policies"
          onClick={() => router.push("/incident/policies")}
        />
        <CommandItem
          icon={<HiCodeBracket size={16} className="text-IMSCyan" />}
          title="Open Agents"
          desc="View all agent configuration"
        />
        <CommandItem
          icon={<LuSettings size={16} className="text-IMSCyan" />}
          title="Open Settings"
          desc="Platform settings & Preferences"
          onClick={() => router.push("/incident/settings")}
        />
      </Section>

      <Section label="Agents">
        <CommandItem
          icon={<Check size={16} className="text-emerald-400" />}
          title="Generate Fix Proposal"
          desc="Create a new fix proposal"
        />
      </Section>

      <Section label="Remediation">
        <CommandItem
          icon={<Zap size={16} className="text-yellow-400" />}
          title="Execute Fix"
          desc="Apply generated fix to affected server"
        />
        <CommandItem
          icon={<RiLogoutCircleRLine size={16} className="text-yellow-400" />}
          title="Roll back Fix"
          desc="Revert last applied fix immediately"
        />
      </Section>
    </div>
  );
};

const Policy = () => {
  const router = useRouter();
  return (
    <div className="max-h-[500px] overflow-y-auto p-4 space-y-6 custom-scrollbar">
      <Section label="Recently used">
        <CommandItem
          icon={<Clock size={16} className="text-IMSCyan" />}
          title="Test Policy Against Incident"
          desc="Dry-run policy on selected incident"
        />
        <CommandItem
          icon={<Clock size={16} className="text-IMSCyan" />}
          title="Run Root Cause Agent"
          desc="Starts RCA analysis on incident data"
        />
        <CommandItem
          icon={<Clock size={16} className="text-IMSCyan" />}
          title="Analyze Incident"
          desc="Full diagnosis on current incident"
        />
        <CommandItem
          icon={<Clock size={16} className="text-IMSCyan" />}
          title="Generate Fix Proposal"
          desc="AI generates full remediation plan"
        />
      </Section>

      <Section label="Policies">
        <CommandItem
          icon={<Plus size={16} className="text-IMSCyan" />}
          title="Create New Policy"
          desc="Craft a new remediation policy"
        />
        <CommandItem
          icon={<MdOutlineModeEdit size={16} className="text-IMSCyan" />}
          title="Edit Active Policy"
          desc="Modify an existing policy rule"
        />
        <CommandItem
          icon={<MdOutlineBarChart size={16} className="text-IMSCyan" />}
          title="View Policy Audit Log"
          desc="History of policy triggers & blocks"
        />
        <CommandItem
          icon={<LuSettings size={16} className="text-IMSCyan" />}
          title="Enable DIsabled Policy"
          desc="Activate a currently diaabled policy"
        />
        <CommandItem
          icon={<RiDeleteBin7Line size={16} className="text-IMSCyan" />}
          title="Delete Draft Policy"
          desc="Permanently remove a draft policy"
        />
      </Section>

      <Section label="Navigation">
        <CommandItem
          icon={<Clock size={16} className="text-IMSCyan" />}
          title="Go to Incidents"
          desc="Open incidents list view"
          onClick={() => router.push("/incident/tickets")}
        />
        <CommandItem
          icon={<Shield size={16} className="text-IMSCyan" />}
          title="Go to Dashboard"
          desc="Manage remediation policies"
          onClick={() => router.push("/incident")}
        />
      </Section>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const Section = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2">
      {label}
    </h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const CommandItem = ({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick?: () => void;
}) => (
  <div
    onClick={() => {
      if (onClick) {
        onClick();
      } else {
        toast.info("Coming Soon");
      }
    }}
    className="group flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/[0.03] bg-darkEzra transition-all cursor-pointer"
  >
    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-bold text-slate-200">{title}</h4>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
    <ChevronRight
      size={14}
      className="text-slate-700 opacity-0 group-hover:opacity-100 transition-all"
    />
  </div>
);

const Shortcut = ({ keys, label }: { keys: string[]; label: string }) => (
  <div className="flex items-center gap-2">
    <div className="flex gap-1">
      {keys.map((k) => (
        <kbd
          key={k}
          className="min-w-[18px] h-5 flex items-center justify-center px-1 rounded border border-white/20 bg-white/5 text-[10px] font-mono text-slate-400"
        >
          {k}
        </kbd>
      ))}
    </div>
    <span className="text-xs text-slate-600 uppercase tracking-tight">
      {label}
    </span>
  </div>
);

export default GlobalSearch;
