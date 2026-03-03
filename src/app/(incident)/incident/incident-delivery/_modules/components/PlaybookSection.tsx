import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import SideModal from '@/components/ui/SideModal';
import Playbook from './Modal/Playbook';

const PlaybookSection = () => {
  const [isPlaybook, setIsPlaybook] = useState(false)
  return (
    <div className=" p-5 text-white border border-IMSCyan/40 rounded-xl w-full bg-gradient-to-b from-[#0074834D] to-[#004B571A] flex items-start justify-center">
      <div className='w-full'>

        {/* Header Area */}
        <div className="flex justify-between items-start mb-6 ">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white tracking-tight">Playbook</h2>
            <div className="space-y-2">
              <p className="text-xl text-slate-300 font-medium">Matched delivery playbook</p>
              <p className="text-lg text-slate-400 font-medium">Defines safe steps and verification patterns.</p>
            </div>
          </div>

          <button onClick={() => setIsPlaybook(true)} className="flex items-center gap-2 px-6 py-2 border border-cyan-400 text-cyan-400 rounded-xl text-lg font-bold hover:bg-cyan-400/10 transition-all duration-200">
            Open
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-black border border-slate-800 rounded-2xl p-6 mt-8 shadow-inner">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-100">
              Merge Conflict Remediation
            </h3>
            <p className="text-base text-slate-400 font-medium">
              Resolve conflicts safely; propose resolution patch as PR.
            </p>

            {/* Badges */}
            <div className="flex gap-3 pt-2">
              <div className="px-4 py-1.5 rounded-full border border-slate-700 text-sm font-bold text-slate-300 flex items-center">
                Steps : 5
              </div>
              <div className="px-4 py-1.5 rounded-full border border-slate-700 text-sm font-bold text-slate-300 flex items-center">
                default steps : pr-only
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPlaybook &&
        <SideModal isOpen={isPlaybook} onClose={() => setIsPlaybook(false)} title={'Playbook'} subTitle='Active playbook'>
          <Playbook />
        </SideModal>
      }
    </div>
  );
};

export default PlaybookSection;