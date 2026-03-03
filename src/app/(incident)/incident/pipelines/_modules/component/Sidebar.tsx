"use client"
import React, { ReactNode } from 'react';
import { AlertTriangle, GitPullRequest, Zap, CheckCircle2 } from 'lucide-react';
  
const systemActivity = [
    {
      category: "Needs approval",
      items: [
        { id: 131, type: "pr", title: "Approve PR#131", subtitle: "Scrubbe/control-plane", environment: "", status: "Approve", icon: "alert" },
        { id: 132, type: "deploy", title: "Approve Deploy#132", subtitle: "Scrubbe/payments-api", environment: "staging", status: "Approve", icon: "alert" }
      ]
    },
    {
      category: "Delivery Failures",
      items: [
        { id: 128, type: "pr", title: "PR#128", subtitle: "Scrubbe/payments-api",environment: "", status: "Failed", icon: "git" },
        { id: 129, type: "pr", title: "PR #129", subtitle: "scrubbe/api-gateway",environment: "", status: "Failed", icon: "git" },
        { id: 131, type: "pr", title: "PR #131", subtitle: "scrubbe/control-plane", environment: "", status: "Approve", icon: "alert" }
      ]
    },
   
  ];

 const health = [{
    category: "Listener health",
    items: [
      { id: 'webhook', title: "Webhook Ingestion", subtitle: "p95 240ms • error 0.2%", status: "Failed", icon: "git" },
      { id: 'connector', title: "Connector", subtitle: "2 connected • 1 pending", status: "Failed", icon: "zap" },
      { id: 'policy', title: "Policy engine", subtitle: "Balanced • gates active", status: "Approve", icon: "check" }
    ]
  }]

  
  
  const iconMap:Record<string, ReactNode> = {
    alert: <AlertTriangle size={18} />,
    git: <GitPullRequest size={18} />,
    zap: <Zap size={18} />,
    check: <CheckCircle2 size={18} />
  };
  
  const Sidebar = () => {
    return (
      <div className="w-full max-w-md bg-[#030D25] p-6 rounded-xl text-white font-sans">
        {systemActivity.map((group, groupIdx) => (
          <div key={group.category}>
            <h3 className="text-[17px] font-bold mb-4">{group.category}</h3>
            
            <div className="space-y-3">
              {group.items.map((item) => (
                <div 
                  key={item.id}
                  className={`flex justify-between items-center p-3 rounded-2xl transition-all 
                    ${""
                    // (item?.highlighted)
                      // ? "border border-IMSCyan bg-gradient-to-t from-[#004B571A] to-[#0074834D]" 
                      // : "hover:bg-white/5"
                  }
                      `}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-white opacity-90">
                      {iconMap[item.icon]}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none mb-1">{item.title}</p>
                      <p className="text-[11px] text-[#94A3B8]">
                        {item.subtitle} {item?.type ? `• ${item?.type}` : ''} {item?.environment ? `• ${item?.environment}` : ''}
                      </p>
                    </div>
                  </div>
  
                  <button className={`
                    px-3 py-1 rounded-full text-[10px] font-bold border
                    ${item.status === 'Approve' 
                      ? 'border-[#00CAD8] text-[#00CAD8]' 
                      : 'border-[#EF4444] text-[#EF4444]'}
                  `}>
                    {item.status}
                  </button>
                </div>
              ))}
            </div>
  
            {/* Render divider if not the last section */}
            {/* {groupIdx < systemActivity.length - 1 && ( */}
              <div className="h-px bg-[#1F2937] my-6" />
            {/* )} */}
          </div>
        ))}
        {health.map((group, groupIdx) => (
          <div key={group.category}>
            <h3 className="text-[17px] font-bold mb-4">{group.category}</h3>
            
            <div className="space-y-3">
              {group.items.map((item) => (
                <div 
                  key={item.id}
                  className={`flex justify-between items-center p-3 rounded-2xl transition-all 
                    ${""
                    // (item?.highlighted)
                      // ? "border border-IMSCyan bg-gradient-to-t from-[#004B571A] to-[#0074834D]" 
                      // : "hover:bg-white/5"
                  }
                      `}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-white opacity-90">
                      {iconMap[item.icon]}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none mb-1">{item.title}</p>
                      <p className="text-[11px] text-[#94A3B8]">
                        {item.subtitle} 
                      </p>
                    </div>
                  </div>
  
                  <button className={`
                    px-3 py-1 rounded-full text-[10px] font-bold border
                    ${item.status === 'Approve' 
                      ? 'border-[#00CAD8] text-[#00CAD8]' 
                      : 'border-[#EF4444] text-[#EF4444]'}
                  `}>
                    {item.status}
                  </button>
                </div>
              ))}
            </div>
  
            {/* Render divider if not the last section */}
            {groupIdx < systemActivity.length - 1 && (
              <div className="h-px bg-[#1F2937] my-6" />
            )}
          </div>
        ))}
  
        <p className="mt-8 text-[11px] text-[#64748B] leading-relaxed">
          Pipelines are governed by <span className="text-white font-medium">Policies + Playbooks</span>. <br />
          Approvals and merges are audited.
        </p>
      </div>
    );
  };

  export default Sidebar