"use client";
import React from "react";
import { SETTINGS_DEF } from "./evidenceExplorer.data";
import { displayFont } from "./fonts";

export interface SettingsState { live: boolean; compact: boolean; autoscroll: boolean; reduceMotion: boolean }

const SettingsDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  settings: SettingsState;
  onToggle: (key: keyof SettingsState) => void;
}> = ({ open, onClose, settings, onToggle }) => (
  <>
    <div className={`fixed inset-0 bg-[rgba(20,20,30,0.28)] z-[155] transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} />
    <aside
      className={`fixed top-0 right-0 h-full w-full max-w-[380px] bg-white shadow-2xl z-[160] flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="flex items-center justify-between px-[18px] py-4 border-b border-[#F0EFEA]">
        <h3 className={`${displayFont.className} text-[16px] font-semibold m-0`}>Settings</h3>
        <button onClick={onClose} className="w-[30px] h-[30px] border border-[#E7E6E0] bg-white rounded-[8px] flex items-center justify-center hover:bg-[#F6F6F3]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[15px] h-[15px]"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <div className="px-[18px] py-2 overflow-auto">
        {SETTINGS_DEF.map(([key, title, desc]) => {
          const k = key as keyof SettingsState;
          const on = settings[k];
          return (
            <div key={key} className="flex items-center justify-between gap-3.5 py-3.5 border-b border-[#F0EFEA]">
              <div>
                <b className="block text-[13px] font-semibold">{title}</b>
                <span className="text-[11.5px] text-[#8A8A93]">{desc}</span>
              </div>
              <button
                onClick={() => onToggle(k)}
                className={`relative w-10 h-[23px] rounded-full border shrink-0 transition-colors ${on ? "bg-[#2540F2] border-[#2540F2]" : "bg-[#F1F0EB] border-[#E7E6E0]"}`}
              >
                <span className={`absolute top-[1.5px] left-[1.5px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${on ? "translate-x-[17px]" : ""}`} />
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  </>
);

export default SettingsDrawer;
