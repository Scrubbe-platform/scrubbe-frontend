import React, { useState } from 'react';
import { Search, Info } from 'lucide-react';
import { ActivityItem } from '../type';
import SideModal from '@/components/ui/SideModal';
import ApprovalModal from './ApprovalModal';

const RunDetailPanel = ({ data, onClose }: { data: ActivityItem, onClose: () => void }) => {
 
    const { details, metadata, evidence, trigger, run, repoPath, service } = data;
    const [openRequestApproval, setOpenRequestApproval] = useState(false)
    return (
        <div className="w-full h-screen text-white flex flex-col overflow-y-auto custom-scrollbar">
            {/* HEADER */}
            <div className="p-6 sticky top-0 z-10">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold">Run detail</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={14} />
                        <input
                            placeholder="Investigate"
                            className="bg-[#0B1224] border border-[#1F2937] rounded-md py-1.5 pl-9 pr-3 text-xs w-32 focus:outline-none"
                        />
                    </div>
                </div>
                <p className="text-xs font-mono">
                    {repoPath} • pr • {metadata.pr}
                </p>
            </div>

            <div className="p-4 space-y-4">
                {/* METADATA SECTION */}
                <section className="bg-transparent border border-zinc-400 rounded-2xl p-5 space-y-3">
                    <MetaRow label="RUN" value={run} />
                    <MetaRow label="REPO" value={repoPath} />
                    <MetaRow label="SERVICE" value={service} />
                    <MetaRow label="TRIGGER" value={`${metadata.pr} • ${metadata.sha.split(' ')[1]}`} />
                    <MetaRow label="INCIDENT" value={`${evidence.incidentId} • ${details.incidentStatus}`} />
                </section>

                {/* STAGES SECTION */}
                <section className="bg-transparent border border-zinc-400 rounded-2xl p-5">
                    <h4 className="font-bold text-sm mb-2">Stages</h4>
                    <p className="text-white text-xs mb-4 leading-relaxed">
                        Click a stage to open logs. Failed stages indicate primary evidence.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {details.stages.map((s: any) => (
                            <StageBadge key={s.name} name={s.name} status={s.status} />
                        ))}
                    </div>
                </section>

                {/* CODE ENGINE INFO */}
                <section className="bg-transparent border border-zinc-400 rounded-2xl p-5 space-y-3">
                    <div className="flex flex-wrap gap-2">
                        <Tag text={`Code Engine : ${details.codeEngine.id}`} />
                        <Tag text={`Confidence: ${details.codeEngine.confidence}`} />
                        <Tag text={`Risk ${details.codeEngine.risk}`} />
                        <Tag text={details.codeEngine.paths} />
                    </div>
                </section>

                {/* AFFECTED FILES */}
                <section className="bg-transparent border border-zinc-400 rounded-2xl p-5">
                    <h4 className="font-bold text-sm mb-4">Affected Files</h4>
                    <div className="bg-[#0B1224] border border-[#1F2937] rounded-full px-4 py-1.5 w-max">
                        <span className="text-xs text-[#94A3B8] font-mono">{details.affectedFiles[0]}</span>
                    </div>
                </section>

                {/* APPROVAL GATE */}
                <section className="bg-transparent border border-zinc-400 rounded-2xl p-5 space-y-4">
                    <h4 className="font-bold text-sm">Approval gate</h4>
                    <p className="text-[#94A3B8] text-xs leading-relaxed">{details.gateReason}</p>
                    <div className="flex gap-3">
                        <button onClick={() => setOpenRequestApproval(true)} className="flex-1 border border-[#00CAD8] text-[#00CAD8] font-bold py-2.5 rounded-xl text-sm hover:bg-[#00CAD8]/5">
                            Request approval
                        </button>
                        <button className="flex-1 border border-[#00CAD8] text-[#00CAD8] font-bold py-2.5 rounded-xl text-sm hover:bg-[#00CAD8]/5">
                            View Policy
                        </button>
                    </div>
                </section>

                {/* ANALYST ACTIONS */}
                <section className="bg-transparent border border-zinc-400 rounded-2xl p-5 flex flex-col gap-3">
                    <h4 className="font-bold text-sm mb-4">Analyst actions</h4>
                    <ActionButton text="Open Investigation" />
                    <ActionButton text="Review in code engine" />
                    <ActionButton text="Open run url" />
                </section>
            </div>

            <>
                {
                    openRequestApproval && <SideModal title='' onClose={() => setOpenRequestApproval(false)} isOpen={openRequestApproval}>
                        <ApprovalModal runId={run} onClose={() => setOpenRequestApproval(false)} />
                    </SideModal>
                }
            </>
        </div>
    );
};

/* --- UI COMPONENTS --- */

const MetaRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between items-center text-[11px]">
        <span className="text-white font-bold uppercase tracking-wider">{label}</span>
        <span className="text-white font-mono">{value}</span>
    </div>
);

const StageBadge = ({ name, status }: { name: string, status: string }) => {
    const dotColor = status === 'error' ? 'bg-[#EF4444]' : status === 'warning' ? 'bg-[#F59E0B]' : 'bg-[#10B981]';
    return (
        <div className="flex items-center gap-2 bg-[#0B1224] border border-[#1F2937] rounded-full px-3 py-1 text-xs">
            <div className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span className="text-[#D1D5DB]">{name}</span>
        </div>
    );
};

const Tag = ({ text }: { text: string }) => (
    <div className="bg-transparent border border-zinc-500 rounded-full px-3 py-1.5 text-[11px] text-[#94A3B8]">
        {text}
    </div>
);

const ActionButton = ({ text, onClick }: { text: string, onClick?: () => void }) => (
    <button onClick={onClick} className="w-fit text-left border border-[#00CAD8] text-[#00CAD8] font-bold py-2 px-4 rounded-2xl text-base hover:bg-[#00CAD8]/5 transition-all">
        {text}
    </button>
);

export default RunDetailPanel;