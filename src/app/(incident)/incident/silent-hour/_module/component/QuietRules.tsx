import React, { useState } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import SideModal from '@/components/ui/SideModal';
import QuietRuleForm from './QuietRuleForm';


const QuietRules = () => {
    const [open, setOpen] = useState(false)
  return (
    <div className=" bg-[#030D25] p-8 text-slate-300 antialiased border border-cyan-400/40 rounded-lg">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-white tracking-tight">
              Team-specific quiet rules
            </h1>
            <p className="text-sm text-slate-400">
              Custom quiet & suppression per team
            </p>
            <p className="text-sm text-slate-400">
              Override global/rotation rules for individual teams or services
            </p>
          </div>
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2.5 text-base rounded-lg border border-cyan-500/50 bg-cyan-500/5 text-cyan-400 font-semibold hover:bg-cyan-500/10 transition-colors">
            <Plus size={18} />
            <span>Add Team Rule</span>
          </button>
        </div>

        {/* MAIN CONTAINER */}
        <div className="rounded-2xl border border-white/40 p-6 space-y-4">
          
          {/* GROUP HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-semibold text-white">Git providers</h2>
            <ArrowRight size={16} className="text-slate-500" />
          </div>

          {/* RULE CARD 1: FRONTEND PLATFORM */}
          <RuleCard 
            title="Frontend Platform"
            badge="Frontend"
            badgeColor="text-cyan-400 border-cyan-400/30 bg-cyan-400/5"
            rows={[
              { label: "Quiet window", value: "21:00 - 08:00", rightValue: "Suppression" },
              { label: "P2 & below silenced", value: "Rotation Link", rightValue: "Frontend Primary" },
              { label: "Exceptions", value: "3 dates" }
            ]}
          />

          {/* RULE CARD 2: CORE PAYMENTS */}
          <RuleCard 
            title="Core Payments"
            badge="Critical"
            badgeColor="text-rose-500 border-rose-500/30 bg-rose-500/5"
            rows={[
              { label: "Quiet window", value: "Never quiet (P0/P1 always noisy)", rightValue: "Suppression" },
              { label: "Only p3+ at night", value: "Rotation Link", rightValue: "Payments Secondary" },
              { label: "Exceptions", value: "1 dates" }
            ]}
          />

          {/* FOOTER NOTE */}
          <p className="text-center text-xs text-slate-500 pt-4">
            Team-specific rules override global and rotation defaults when conflicts occur.
          </p>
        </div>
      </div>

      { 
      open &&
        <SideModal title='Add Team-Specific Quiet Rule' isOpen={open} onClose={() => setOpen(false)}>
            <QuietRuleForm onClose={() => setOpen(false)}/>
        </SideModal>
      }
    </div>
  );
};

interface RuleRow {
  label: string;
  value: string;
  rightValue?: string;
}

const RuleCard = ({ title, badge, badgeColor, rows }: { 
  title: string, 
  badge: string, 
  badgeColor: string, 
  rows: RuleRow[] 
}) => {
  return (
    <div className="rounded-xl border border-white/40 p-5 hover:border-white/20 transition-all">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-slate-200">{title}</h3>
        <span className={`px-3 py-0.5 rounded-full border text-xs font-medium ${badgeColor}`}>
          {badge}
        </span>
      </div>
      
      <div className="space-y-1.5">
        {rows.map((row, idx) => (
          <div key={idx} className="grid grid-cols-3 text-[13px]">
            <span className="text-slate-500">{row.label}</span>
            <span className="text-slate-400 text-center">{row.value}</span>
            <span className="text-slate-400 text-right">{row.rightValue}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuietRules;