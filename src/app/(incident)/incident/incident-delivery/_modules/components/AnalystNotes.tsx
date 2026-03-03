import SideModal from '@/components/ui/SideModal';
import React, { useState } from 'react';
import AnalystNote from './Modal/AnalystNote';

/**
 * Interface for Analyst Note data structure
 * to ensure strict type safety across the evidence pack.
 */
interface AnalystNote {
  id: string;
  author: string;
  timestamp: string;
  content: string;
}

interface AnalystNotesProps {
  notes?: AnalystNote[];
  onAddNote?: () => void;
}

const AnalystNotes: React.FC<AnalystNotesProps> = ({ notes = [], onAddNote }) => {
  const [isAnalystNote, setIsAnalystNote] = useState(false)
  return (
    <div className=" p-5 border border-IMSCyan/40 rounded-xl text-slate-300 bg-gradient-to-b from-[#0074834D] to-[#004B571A] flex items-start justify-center">
      <div className="w-full">

        {/* Header Section */}
        <div className="flex justify-between items-start mb-3 w-full">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white tracking-tight">Analyst notes</h2>

          </div>

          <button
            onClick={() => setIsAnalystNote(true)}
            className="px-4 py-1.5 border border-cyan-500 text-cyan-500 rounded-lg text-sm font-bold w-fit">
            Add analyst note

          </button>

        </div>
        <p className="text-base text-slate-300 font-medium">
          Notes include author + timestamp and become part of the evidence pack.
        </p>
        {/* Notes Container */}
        <div className="bg-black border border-slate-500 rounded-2xl p-6 mt-4 shadow-inner min-h-[80px] flex items-center">
          {notes.length === 0 ? (
            <p className="text-lg text-slate-400 font-medium italic">
              No analyst notes yet.
            </p>
          ) : (
            <div className="w-full space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                    <span>{note.author}</span>
                    <span>{note.timestamp}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {isAnalystNote &&
        <SideModal isOpen={isAnalystNote} onClose={() => setIsAnalystNote(false)} title={'Analyst Note'} subTitle='Add note (author + timestamp)'>
          <AnalystNote />
        </SideModal>
      }
    </div>
  );
};

export default AnalystNotes;