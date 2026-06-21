"use client"
import React, { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import { Table } from '@/components/ui/table';
import { useActivitySelector } from './_modules/state/useActivitySelector';
import { usePipelineFilter } from './_modules/state/usePipelineFilter';
import SideModal from '@/components/ui/SideModal';
import RunDetailPanel from './_modules/component/RunDetailPanel';
import { useQuery } from '@tanstack/react-query';
import { useFetch } from '@/hooks/useFetch';
import { endpoint } from '@/lib/api/endpoint';
import { querykeys } from '@/lib/constant';

const columnHelper = createColumnHelper();

const ActivityTable = () => {
  const { get } = useFetch();

  const { data: apiData } = useQuery({
    queryKey: [querykeys.PIPELINES],
    queryFn: async () => {
      const res = await get(endpoint.pipelines.list);
      if (res.success) return res.data?.data?.runs ?? [];
      return [];
    },
    refetchOnWindowFocus: false,
  });

  const { search, statusFilter } = usePipelineFilter();

  const filteredData = useMemo(() => {
    const rows: any[] = apiData ?? [];
    return rows.filter((row) => {
      if (statusFilter !== 'all' && row.status?.type !== statusFilter) return false;
      if (!search.trim()) return true;
      const needle = search.trim().toLowerCase();
      return [row.repoName, row.repoPath, row.service, row.run, row.metadata?.pr]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle));
    });
  }, [apiData, search, statusFilter]);

  const columns = useMemo(() => [
    // COLUMN 1: RUN
    columnHelper.accessor('run', {
      header: 'Run',
      cell: (info:any) => (
        <div className="py-4">
          <p className="text-white font-medium text-sm">{info.getValue()}</p>
          <p className="text-[#64748B] text-xs mt-1">{info.row.original.timestamp}</p>
        </div>
      ),
    }),

    // COLUMN 2: REPO / SERVICE
    columnHelper.accessor('repoName', {
      header: 'Repo / Service',
      cell: (info:any) => (
        <div className="py-4 space-y-2">
          <div>
            <p className="text-white font-bold text-sm">{info.getValue()}</p>
            <p className="text-[#64748B] text-xs">{info.row.original.repoPath}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag text={info.row.original.metadata.pr} />
            <Tag text={info.row.original.metadata.sha} />
            <Tag text={info.row.original.metadata.env} />
          </div>
        </div>
      ),
    }),

    // COLUMN 3: STATUS
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const { label, type, subLabel } = info.getValue();
        return (
          <div className="py-4 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1F2937] bg-[#0B1224]">
              <div className={`w-2 h-2 rounded-full ${type === 'error' ? 'bg-[#EF4444]' : 'bg-[#F59E0B]'}`} />
              <span className="text-xs text-white capitalize">{label}</span>
            </div>
            {subLabel && (
              <div className="px-3 py-1 rounded-full border border-[#1F2937] bg-transparent w-max">
                <span className="text-[10px] text-[#94A3B8] font-bold uppercase">{subLabel}</span>
              </div>
            )}
          </div>
        );
      },
    }),

    // COLUMN 4: TRIGGER
    columnHelper.accessor('trigger', {
      header: 'Trigger',
      cell: (info:any) => (
        <div className="py-4 max-w-[200px]">
          <p className="text-white font-bold text-sm">{info.getValue().title}</p>
          <p className="text-[#94A3B8] text-xs mt-1 leading-relaxed">
            {info.getValue().description}
          </p>
        </div>
      ),
    }),

    // COLUMN 5: EVIDENCE
    columnHelper.accessor('evidence', {
      header: 'Evidence',
      cell: (info:any) => {
        const evidence = info.getValue();
        return (
          <div className="py-4 space-y-2">
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <EvidenceButton text="run URL" url={evidence.runUrl} />
              <EvidenceButton text="logs URL" url={evidence.logsUrl} />
            </div>
            <div className="bg-[#0B1224] border border-[#1F2937] px-3 py-1 rounded-md w-max">
              <span className="text-[10px] text-[#64748B] font-mono tracking-tight">
                {evidence.incidentId ? `incident ${evidence.incidentId}` : "no linked incident"}
              </span>
            </div>
          </div>
        );
      },
    }),
  ], []);

  const  {setActivity,activity} = useActivitySelector()
  const [open, setOpen] = useState(false)
const handleSelect = (item:any) => {
    setActivity(item)
    setOpen(true)
}
  return (
    <div>
        <Table
            data={filteredData as any}
            columns={columns as any}
            onRowClick={handleSelect}
        />

        {
            open && activity && 
            <SideModal onClose={() => {
                setOpen(false) 
                setActivity(undefined)
            }} 
            isOpen={open}
            title=''
            >
                <RunDetailPanel data={activity} onClose={() => {
                setOpen(false) 
                setActivity(undefined)
            }} />
            </SideModal>
        }
    </div>
  );
};

/* --- ATOMS --- */

const Tag = ({ text }:{text:string}) => (
  <span className="px-2 py-0.5 rounded bg-[#0B1224] border border-[#1F2937] text-[10px] text-[#94A3B8] font-mono">
    {text}
  </span>
);

const EvidenceButton = ({ text, url }:{text:string, url?: string}) => (
  <button
    type="button"
    disabled={!url}
    onClick={() => url && window.open(url, "_blank", "noopener,noreferrer")}
    className="px-2 py-1 rounded bg-[#0B1224] border border-[#1F2937] text-[10px] text-[#94A3B8] hover:text-white hover:border-[#64748B] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
  >
    {text}
  </button>
);

export default ActivityTable;