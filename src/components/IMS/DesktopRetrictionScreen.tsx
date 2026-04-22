"use client";
import React from "react";
import { Check, Lock, Monitor, Smartphone, Slash } from "lucide-react";

const DesktopRestrictionScreen = () => {
  return (
    <div className="min-h-screen  flex flex-col items-center justify-center p-5 font-sans">
      {/* Main Content Card */}
      <div className="w-full max-w-[400px] bg-[#050b18] border border-white/5 rounded-[24px] p-8 flex flex-col items-center text-center shadow-2xl mb-10">
        {/* Device Illustration */}
        <div className="relative flex items-center justify-center mb-8 w-full py-4">
          {/* Desktop Icon */}
          <div className="relative">
            <Monitor
              size={120}
              strokeWidth={1.5}
              className="text-cyan-400 opacity-90"
            />
            <div className="absolute inset-0 flex items-center justify-center mb-4">
              <Lock size={32} fill="currentColor" className="text-cyan-400" />
            </div>
          </div>

          {/* Mobile Icon Overlay */}
          <div className="relative -ml-6 mt-8">
            <div className="bg-[#050b18] p-1 rounded-xl">
              <div className="relative border-2 border-cyan-400 rounded-2xl p-2 h-24 w-14 flex items-center justify-center">
                <div className="absolute top-1.5 w-6 h-1 bg-cyan-400/30 rounded-full" />
                <div className="relative flex items-center justify-center">
                  <Smartphone size={32} className="text-cyan-400 opacity-40" />
                  <Slash
                    size={24}
                    className="absolute text-cyan-400"
                    strokeWidth={3}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-white text-[22px] font-bold mb-3 tracking-tight">
          Scrubbe is optimized for desktop
        </h1>

        <p className="text-slate-400 text-[15px] leading-relaxed mb-8 px-2">
          For the best experience and full access to all features, Please use a
          desktop device
        </p>

        <div className="w-full space-y-4 text-left">
          <p className="text-white font-bold text-[15px] mb-4">
            On mobile you can :
          </p>

          <ul className="space-y-4">
            <ListItem text="View active incidents" />
            <ListItem text="Review proposed actions" />
            <ListItem text="Approve & merge or reject fixes" />
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      {/* <div className="w-full max-w-[400px] flex flex-col gap-3 mb-10">
        <button className="w-full py-4 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          Open Mobile View
        </button>
        <button className="w-full py-4 bg-transparent border border-cyan-400/60 text-cyan-400 font-bold rounded-xl hover:bg-cyan-400/5 transition-all active:scale-95">
          Continue to Desktop View
        </button>
      </div> */}

      {/* Footer Alert Box */}
      <div className="w-full max-w-[400px] bg-[#050b18] border border-white/5 rounded-2xl p-5 flex gap-4 items-start">
        <div className="bg-cyan-400/10 p-2 rounded-lg">
          <Lock size={18} className="text-cyan-400" />
        </div>
        <p className="text-[13px] text-slate-300 leading-snug">
          Some features are restricted on mobile to ensure safe and effective
          operations
        </p>
      </div>
    </div>
  );
};

const ListItem = ({ text }: { text: string }) => (
  <li className="flex items-center gap-3">
    <div className="shrink-0 flex items-center justify-center">
      <Check size={18} className="text-emerald-500" strokeWidth={3} />
    </div>
    <span className="text-slate-300 text-[15px] font-medium">{text}</span>
  </li>
);

export default DesktopRestrictionScreen;
