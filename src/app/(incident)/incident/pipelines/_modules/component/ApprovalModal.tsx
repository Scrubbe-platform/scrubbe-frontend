import React, { useState } from 'react';
import { X } from 'lucide-react';

const ApprovalModal = ({ runId , action="MERGE" , onClose }:{runId:string, action?:string, onClose:() => void}) => {
  const [outcome, setOutcome] = useState<string>(""); // 'Approved' or 'Reject'

  return (
    <div className=" backdrop-blur-sm flex items-center justify-center font-sans">
      <div className="w-full overflow-hidden relative flex flex-col">
        {/* HEADER */}
        <div className="pb-6">
          <h2 className="text-white text-2xl font-bold tracking-tight mb-2">
            Approval required
          </h2>
          <p className="text-white font-black text-sm uppercase tracking-[0.1em]">
            Action: {action} • Run {runId}
          </p>
        </div>

        <div className="space-y-6">
          
          {/* APPROVAL NOTE SECTION */}
          <div className="bg-transparent border border-neutral-400 rounded-lg p-6 space-y-3">
            <h4 className="text-white font-bold text-[15px]">Approval note</h4>
            <p className="text-[#94A3B8] text-xs">Recorded to decision log for audit.</p>
            <textarea 
              placeholder="Why is this safe? What did you validate"
              className="w-full bg-[#0B1224] border border-neutral-400 rounded-xl p-4 text-sm text-[#D1D5DB] placeholder-[#475569] focus:outline-none focus:border-[#00CAD8]/50 min-h-[120px] resize-none transition-all"
            />
          </div>

          {/* APPROVERS SECTION */}
          <div className="bg-transparent border border-neutral-400 rounded-lg p-6 space-y-4">
            <h4 className="text-white font-bold text-[15px]">Approvers</h4>
            <p className="text-[#94A3B8] text-xs leading-relaxed">
              Scrubbe auto-detects your identity via SSO/session. Choose an approval outcome:
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setOutcome('Approved')}
                className={`px-3 py-3 rounded-xl font-bold text-sm border transition-all w-fit ${
                  outcome === 'Approved' 
                    ? 'border-[#00CAD8] bg-[#00CAD8]/10 text-[#00CAD8]' 
                    : 'border-[#00CAD8] text-[#00CAD8] hover:bg-[#00CAD8]/5'
                }`}
              >
                Approved
              </button>
              <button 
                onClick={() => setOutcome('Reject')}
                className={`px-3 py-3 rounded-xl font-bold text-sm border transition-all w-fit ${
                  outcome === 'Reject' 
                    ? 'border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]' 
                    : 'border-[#00CAD8] text-[#00CAD8] hover:bg-[#00CAD8]/5'
                }`}
              >
                Reject
              </button>
            </div>
          </div>

          {/* POLICY GATE SECTION */}
          <div className="bg-transparent border border-neutral-400 rounded-lg p-6 space-y-2">
            <h4 className="text-white font-bold text-[15px]">Policy gate</h4>
            <p className="text-[#94A3B8] text-xs leading-relaxed">
              Merge conflict remediation touches /policy. Requires owning-team approval.
            </p>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-8 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-10 py-3 rounded-xl border border-IMSCyan text-IMSCyan font-bold text-sm "
          >
            Close
          </button>
          <button className="px-10 py-3 rounded-xl bg-IMSCyan text-black font-black text-sm hover:brightness-110 shadow-[0_0_20px_rgba(62,233,255,0.3)] transition-all">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;