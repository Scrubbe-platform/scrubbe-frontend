import CButton from '@/components/ui/Cbutton'
import SideModal from '@/components/ui/SideModal'
import CodeHighlighter from '@/lib/highlightjs/CodeHighlighter'
import { BookMinusIcon, BookOpenText, Flag } from 'lucide-react'
import React, { useState } from 'react'
import { CiWarning } from 'react-icons/ci'
import { GiOpenBook } from 'react-icons/gi'
import { MdOutlineFileDownload } from 'react-icons/md'

const DataModal = () => {
    const [isExport, setIsExport] = useState(false)
    return (
        <>
            <div className='p-4 rounded-xl border border-slate-400 space-y-2 mt-3'>
                <div className=' flex items-center justify-between'>
                    <p className='text-sm'>Data model appendix</p>
                    <button onClick={() => setIsExport(true)} className='px-4 py-1 border border-IMSCyan text-IMSCyan text-xs rounded-lg flex items-center gap-1'><MdOutlineFileDownload size={17} /> Export Type</button>
                </div>
                <p className='text-base font-semibold'>Shared types (MERN-friendly)</p>
                <p className='text-sm pb-2'>This is the “implementation anchor” engineers use to avoid guessing: incident, playbook, policy decision, decision log.</p>

                <div className='grid grid-cols-2 gap-4'>
                    <div className='border border-slate-400 rounded-lg p-3'>
                        <p className='flex items-center gap-2 text-base'>
                            <CiWarning className='text-yellow-400' size={18} /> <span>Incident (core)</span>
                        </p>

                        <div className=' overflow-auto border border-slate-400 p-2 rounded-md mt-2'>
                            <CodeHighlighter language=" text-sm" code={`
 interface Incident {
  id: string;                 // INC-...
  type: "delivery" | "production";
  subtype: string;            // e.g. ci_failure_tests, deploy_failed
  state: "open" | "investigating" | "resolved" | "closed";
  correlationKey: string;     // repo+pr+run+sha (delivery)
  createdAt: string;
  updatedAt: string;
  repo?: string;
  prNumber?: number;
  commitSha?: string;
  signals: SignalBinding[];   // graph edges
  playbookId?: string;
  policyDecision?: PolicyDecision;
  suggestion?: CodeSuggestion;
  timeline?: DecisionLogEntry[];
}
interface SignalBinding {
  kind: "ci_run" | "pr" | "commit" | "logs" | "metrics" | "artifact" | "risk_view";
  ref: string;               // URL or identifier
  label?: string;
}
                `} />
                        </div>
                    </div>
                    <div className='border border-slate-400 rounded-lg p-3'>
                        <p className='flex items-center gap-2 text-base'>
                            <BookOpenText className='text-IMSCyan' size={18} /> <span>Playbook + PolicyDecision</span>
                        </p>

                        <div className=' overflow-auto border border-slate-400 p-2 rounded-md mt-2'>
                            <CodeHighlighter language=" text-sm" code={`
 interface Playbook {
  id: string;                 // PB-...
  name: string;
  kind: "delivery" | "production";
  match: string;              // rule expression, e.g. failureCategory=tests
  allowedActions: ActionType[];
  steps: string[];
  verification: string[];
  version: string;            // semver
  ownerTeam: string;
  createdAt: string;
  updatedAt: string;
}
type ActionType =
  | "comment_pr"
  | "suggest_patch"
  | "rerun_ci"
  | "staging_action"
  | "staging_config"
  | "toggle_feature_flag"
  | "open_runbook";
interface PolicyDecision {
  autoActivate: boolean;
  humanGateRequired: boolean;
  scope: "pr-only" | "staging-only" | "production" | "none";
  confidenceThresholds: { suggest: number; execute: number; production: number; };
  reasons: string[];
}
                `} />
                        </div>
                    </div>
                    <div className='border border-slate-400 rounded-lg p-3'>
                        <p className='flex items-center gap-2 text-base'>
                            <BookMinusIcon className='text-IMSCyan' size={18} /> <span>DecisionLogEntry (timeline source of truth)</span>
                        </p>

                        <div className=' overflow-auto border border-slate-400 p-2 rounded-md mt-2'>
                            <CodeHighlighter language=" text-sm" code={`
 interface DecisionLogEntry {
  id: string;                 // LOG-...
  incidentId: string;
  at: string;                 // ISO timestamp
  actor: "system" | "human";
  actorId?: string;           // userId when human
  kind:
    | "webhook.received"
    | "incident.created"
    | "signals.bound"
    | "playbook.selected"
    | "policy.evaluated"
    | "suggestion.generated"
    | "approval.requested"
    | "approval.granted"
    | "action.executed"
    | "verification.recorded";
  message: string;
  meta?: Record<string, any>; // evidence links, confidence, scope, etc.
}

                `} />
                        </div>
                    </div>
                </div>

            </div>
            <div className='border border-slate-400 rounded-lg p-3 mt-4'>
                <p className='flex items-center gap-2 text-base'>
                    <Flag className='text-IMSCyan' size={18} /> <span>How these interact (one sentence each)</span>
                </p>

                <div className='grid grid-cols-3 gap-3'>
                    <div className='border border-slate-400 rounded-lg p-3 mt-4 text-sm space-y-2'>
                        <p>Incident</p>
                        <p>Container for the failure: state, type, signal bindings, selected playbook.</p>
                    </div>
                    <div className='border border-slate-400 rounded-lg p-3 mt-4 text-sm space-y-2'>
                        <p>Playbook</p>
                        <p>Defines allowed steps/actions and verification requirements for this incident subtype</p>
                    </div>
                    <div className='border border-slate-400 rounded-lg p-3 mt-4 text-sm space-y-2'>
                        <p>Policy Decision</p>
                        <p>Derived at runtime: auto-activate? gates? scope? suppression? blast radius limits.</p>
                    </div>
                </div>
            </div>

            {isExport && (
                <SideModal title='' isOpen={isExport} onClose={() => setIsExport(false)}>
                    <div className='flex flex-col gap-2'>
                        <p className='text-base font-medium'>Type export</p>
                        <p className='font-semibold'>Export shared types</p>
                        <p className='text-sm'>Use this shape across BE/FE to avoid drift.</p>

                        <div className='border border-slate-400 rounded-lg p-3 my-3'>
                            <p className='font-semibold text-base mb-2'>What gets exported</p>
                            <ul className=' list-decimal pl-3 space-y-1 text-sm'>
                                <li>TypeScript interfaces for Incident, Playbook, PolicyDecision, DecisionLogEntry</li>
                                <li>Enums for incident type/subtype, action types, scopes</li>
                                <li>Common ID types for incidentId/playbookId/suggestionId</li>
                            </ul>
                        </div>
                        <div className='border border-slate-400 rounded-lg p-3'>
                            <p className='font-semibold text-base mb-2'>Approval gates</p>
                            <ul className=' list-decimal pl-3 space-y-1 text-sm'>
                                <li>Touched /policy or /infra</li>
                                <li>Suppression/quarantine change</li>
                                <li>Deploy/rollback of any kind</li>
                            </ul>
                        </div>
                        <div className='mt-4'>
                        <CButton className=' w-fit float-end'>
                            Generate Report
                        </CButton>
                        </div>
                    </div>
                </SideModal>)
            }
        </>
    )
}

export default DataModal