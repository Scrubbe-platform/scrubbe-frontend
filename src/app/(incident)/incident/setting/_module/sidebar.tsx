"use client"
import React from 'react';
import { 
  Building2, Users2, GitBranch, Bell, 
  ListTodo, ShieldCheck, Database, Sparkles, 
  Lock, CheckCircle2, Sliders, Download, Upload, 
  Command 
} from 'lucide-react';
import { PiPlug } from 'react-icons/pi';
import { usePathname, useRouter } from 'next/navigation';

const Sidebar = () => {
  const navItems = [
    { icon: <Building2 size={18} className='text-yellow-400' />, path: "/incident/setting", label: 'Organization', active: true },
    { icon: <Users2 size={18} className='text-indigo-400' />, path: "/incident/setting/roles", label: 'User & Roles' },
    { icon: <PiPlug size={18} className='text-pink-400'/>, path: "/incident/setting/integrations", label: 'Integrations' },
    { icon: <GitBranch size={18} className='text-orange-400' />, path: "/incident/setting/ingestion", label: 'CI/CD & PR Ingestion' },
    { icon: <Bell size={18} className='text-emerald-400'/>, path: "/incident/setting/notification", label: 'Notifications' },
    { icon: <ListTodo size={18} className='text-lime-400'/>, path: "/incident/setting/defaults", label: 'Defaults' },
    { icon: <ShieldCheck size={18} className='text-cyan-400'/>, path: "/incident/setting/policies", label: 'Policies', margin: 'mt-8' },
    { icon: <Database size={18} className='text-lime-400'/>, path: "/incident/setting/code-engine", label: 'Code & Engine' },
    { icon: <Sparkles size={18} className='text-cyan-400'/>, path: "/incident/setting/ezra", label: 'Ezra' },
    { icon: <Lock size={18} className='text-lime-400'/>, path: "/incident/setting/security", label: 'Security & SSO' },
    { icon: <CheckCircle2 size={18} className='text-red-400'/>, path: "/incident/setting/compliance", label: 'Compliance' },
    { icon: <Sliders size={18} className='text-lime-400'/>, path: "/incident/setting/features-flags", label: 'Features Flags' },
  ];

  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="w-[320px] min-h-screen bg-[#030D25] text-[#D1D5DB] p-6 flex flex-col font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-[13px] font-bold uppercase tracking-wider text-white">Navigation</h2>
        <Command size={18} className="text-[#94A3B8]" />
      </div>
      <p className="text-[14px] text-[#94A3B8] mb-8">Admin-only configuration</p>

      {/* NAVIGATION ITEMS */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item, idx) => {
            const active = pathname === item.path
         return <div
            key={idx}
            onClick={() => router.push(item.path)}
            className={`
              flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 
              ${item.margin || ''}
              ${active
                ? 'bg-[#0B1224] border-[1.5px] border-[#00CAD8] text-white bg-gradient-to-t from-[#004B571A] to-[#0074834D]' 
                : 'hover:bg-[#0B1224] text-[#94A3B8] hover:text-white border-[1.5px] border-transparent'
              }
            `}
          >
            <span className={active ? 'text-[#00CAD8]' : 'text-[#64748B]'}>
              {item.icon}
            </span>
            <span className="text-[15px] font-medium">{item.label}</span>
          </div>
})}
      </nav>

      {/* FOOTER BUTTONS */}
      <div className=" space-y-3 mt-4">
        <button className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border-[1.5px] border-[#00CAD8] text-[#00CAD8] font-bold text-[14px] hover:bg-[#00CAD8]/5 transition-colors">
          <Download size={18} />
          Export Settings (JSON)
        </button>
        <button className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border-[1.5px] border-[#00CAD8] text-[#00CAD8] font-bold text-[14px] hover:bg-[#00CAD8]/5 transition-colors">
          <Upload size={18} />
          Import Settings
        </button>
      </div>
    </div>
  );
};

export default Sidebar;