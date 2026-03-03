import React, { ReactNode } from 'react';
import { Check } from 'lucide-react';
import CButton from '@/components/ui/Cbutton';
import { TiSpanner, TiSpannerOutline } from 'react-icons/ti';
import { IoDocumentOutline } from 'react-icons/io5';
import { HiOutlineCube } from 'react-icons/hi';

const PricingAndAddons = () => {
  const tiers = ['Observe', 'Govern', 'Execute', 'Enterprise'];

  const features = [
    { name: 'Unified incident ingestion', values: ['check', 'check', 'check', 'check'] },
    { name: 'Signal Graph (view/edit)', values: ['View', 'Edit', 'Edit', 'Edit + Template'] },
    { name: 'Ezra summaries + evidence', values: ['check', 'check', 'check (board-ready)', 'check (custom)'] },
    { name: 'Policy Engine', values: ['dash', 'check', 'check', 'check + Multi-org'] },
    { name: 'Playbook editor + canonical library', values: ['View', 'check', 'check', 'check + Custom'] },
    { name: 'Auto-activation', values: ['dash', 'Delivery + limited', 'Delivery + prod', 'Full'] },
    { name: 'Code Engine execution', values: ['dash', 'Staging', 'Prod (gated)', 'Prod + custom'] },
    { name: 'Governed executions metering', values: ['Limited', 'Included', 'Higher included', 'Custom'] },
    { name: 'Decision Log + export', values: ['Read', 'check', 'check', 'check + Retention'] },
    { name: 'Enterprise controls', values: ['dash', 'Basic', 'Advanced', 'Full'] },
  ];

  const renderCell = (val: string) => {
    if (val.startsWith('check')) {
      return (
        <div className="flex items-center gap-2">
          <Check className="text-emerald-400 w-5 h-5" />
          {val.length > 5 && <span className="text-gray-300 text-sm">{val.replace('check ', '')}</span>}
        </div>
      );
    }
    if (val === 'dash') {
      return <span className="text-rose-500 text-xl">—</span>;
    }
    return <span className="text-gray-300 text-sm">{val}</span>;
  };


  const Card = ({ body, subtitle, title, icon }: { subtitle: string, title: string, body: string | ReactNode, icon?: ReactNode }) => {
    return <div
      className={`min-h-[100px] bg-[#030D25] text-white from-[#0074834D] to-[#004B571A] border rounded-xl transition-all border-IMSCyan/40 overflow-clip p-3`}>
      <p className="text-sm flex items-center gap-1">{icon} {subtitle}</p>
      <p className="text-sm font-semibold mt-1">{title}</p>
      <div className="text-sm">{body}</div>
    </div>
  }

  return (
    <div className="bg-dark text-white p-8 min-h-screen font-sans">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <p className="text-white text-lg mb-2">Feature comparison</p>
        <h1 className="text-5xl font-bold mb-2 font-bigshotOne">What you get, and why it matters</h1>
        <p className="text-gray-400">Hover the dotted terms for definitions.</p>
      </div>

      {/* Table Container */}
      <div className="max-w-7xl mx-auto overflow-x-auto border border-slate-800 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#007483]">
              <th className="p-4 font-semibold border-r border-slate-700/50">Capability</th>
              {tiers.map((tier) => (
                <th key={tier} className="p-4 font-semibold">
                  {tier}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {features.map((feature, idx) => (
              <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                <td className="p-4 border-r border-slate-800">
                  <span className="border-b border-dotted border-gray-500 cursor-help">
                    {feature.name}
                  </span>
                </td>
                {feature.values.map((val, i) => (
                  <td key={i} className="p-4">
                    {renderCell(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="max-w-7xl mx-auto mt-12">
        <div className='grid grid-cols-2 gap-5'>
          <div className='border border-zinc-500 rounded-xl p-3'>
            <p className='text-sm'>Metering</p>
            <p className='text-2xl font-bigshotOne'>Governed executions (not tickets)</p>
            <p className='text-sm'>A governed execution is the atomic unit of value in Scrubbe.</p>

            <div className='grid grid-cols-2 gap-3 mt-4'>
              <Card title='Includes 20,000 executions / month' subtitle='Govern (illustrative)' body="Overage: £120 per extra 1,000" />
              <Card title='Includes 80,000 executions / month' subtitle='Executive (illustrative)' body="Overage: £120 per extra 1,000" />
            </div>

            <div className='mt-4 space-x-3'>
              <CButton className="bg-IMSCyan text-dark w-fit px-4">
                Use estimator
              </CButton>
              <CButton className="border-IMSCyan border bg-transparent hover:bg-transparent text-IMSCyan w-fit px-4">
                Understand metering
              </CButton>
            </div>
          </div>
          <div className='border border-zinc-500 rounded-xl p-3 flex flex-col justify-between'>
            <div>
              <p className='text-sm'>Why this works</p>
              <p className='text-2xl font-bigshotOne'>Clean expansion + clean incentives</p>
              <ul className='text-sm space-y-2'>
                <li className='flex items-center gap-1'>
                  <Check className="text-emerald-400 w-5 h-5" />
                  No “incident inflation” incentives
                </li>
                <li className='flex items-center gap-1'>
                  <Check className="text-emerald-400 w-5 h-5" />
                  Maps to actual system authority
                </li>
                <li className='flex items-center gap-1'>
                  <Check className="text-emerald-400 w-5 h-5" />
                  Investors understand the metric
                </li>
                <li className='flex items-center gap-1'>
                  <Check className="text-emerald-400 w-5 h-5" />
                  Customers feel ROI as automation grows
                </li>
              </ul>
            </div>
            <CButton className="bg-IMSCyan text-dark w-fit px-4">
              Talk to Sales
            </CButton>
          </div>
        </div>

        <div className='border border-zinc-500 rounded-xl p-3 mt-12'>
          <p className='text-sm'>Enterprise</p>
          <p className='text-2xl font-bigshotOne'>Procurement-ready governance</p>
          <p className='text-sm'>Deployment flexibility, deeper compliance exports, and multi-org policy ownership.</p>

          <div className='grid grid-cols-3 gap-4 mt-6'>

            <Card body={
              <ul className="text-sm space-y-1 mt-1">
                <li>SSO/SAML • SCIM</li>
                <li>RBAC + custom roles</li>
                <li>Multi-org governance boundaries</li>
              </ul>
            }
              subtitle='Identity & access'
              title=''
              icon={<TiSpannerOutline className='size-4 text-IMSCyan' />}
            />

            <Card body={
              <ul className="text-sm space-y-1 mt-1">
                <li>Evidence packs (exportable)</li>
                <li>Retention + immutable logs</li>
                <li>Approval workflows</li>
              </ul>
            }
              subtitle='Compliance & audit'
              title=''
              icon={<IoDocumentOutline className='size-4 text-IMSCyan' />}
            />
            <Card body={
              <ul className="text-sm space-y-1 mt-1">
                <li>VPC / private cloud options</li>
                <li>On-prem (select)</li>
                <li>Dedicated support + SLAs</li>
              </ul>
            }
              subtitle='Deployment'
              title=''
              icon={<HiOutlineCube className='size-4 text-orange-400' />}
            />

          </div>
        </div>

      
      </div>
    </div>
  );
};

export default PricingAndAddons;