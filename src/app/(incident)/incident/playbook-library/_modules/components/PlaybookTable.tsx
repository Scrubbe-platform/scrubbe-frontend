import React from "react";
import { useRouter } from "next/navigation";
import { Copy, ArchiveRestore, Archive, MoreVertical } from "lucide-react";
import Dropdown from "@/components/ui/Dropdown";
import { Playbook } from "../types";

const STATUS_CLS: Record<Playbook["status"], string> = {
  Active: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  Draft: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Disabled: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400",
  Archived: "bg-transparent text-zinc-500 border border-dashed border-zinc-300 dark:text-zinc-500 dark:border-zinc-700",
};

function StatusBadge({ status }: { status: Playbook["status"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CLS[status]}`}
    >
      {status}
    </span>
  );
}

interface PlaybookTableProps {
  rows: Playbook[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onDuplicate: (id: string) => void;
  onArchiveToggle: (id: string) => void;
}

export default function PlaybookTable({
  rows,
  total,
  page,
  pageSize,
  loading,
  onPageChange,
  onDuplicate,
  onArchiveToggle,
}: PlaybookTableProps): React.JSX.Element {
  const router = useRouter();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="shadow-sm shadow-light rounded-xl bg-white dark:bg-zinc-900/40 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800">
              {[
                "Name",
                "Service",
                "Status",
                "Execution mode",
                "Owner",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-[10.5px] font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500 px-3.5 py-2.5 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.id}
                onClick={() =>
                  router.push(`/incident/playbook-library/${p.id}`)
                }
                className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 cursor-pointer transition-colors dark:border-zinc-800 dark:hover:bg-zinc-900/40"
              >
                <td className="px-3.5 py-3 text-[13.5px] text-zinc-700 dark:text-zinc-300">
                  {p.name}
                </td>
                <td className="px-3.5 py-3 text-sm text-zinc-700 whitespace-nowrap dark:text-zinc-400">
                  {p.service}
                </td>
                <td className="px-3.5 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-3.5 py-3 text-sm text-zinc-700 whitespace-nowrap dark:text-zinc-400">
                  {p.mode}
                </td>
                <td className="px-3.5 py-3 text-sm text-zinc-700 dark:text-zinc-400">{p.owner}</td>
                <td
                  className="px-3.5 py-3 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Dropdown
                    position="left"
                    align="left"
                    trigger={
                      <button className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800">
                        <MoreVertical size={15} />
                      </button>
                    }
                    items={[
                      {
                        value: "open",
                        label: "Open playbook",
                        onClick: () =>
                          router.push(`/incident/playbook-library/${p.id}`),
                      },
                      {
                        value: "dup",
                        label: "Duplicate",
                        icon: <Copy size={14} />,
                        onClick: () => onDuplicate(p.id),
                      },
                      {
                        value: "arc",
                        label: p.status === "Archived" ? "Restore" : "Archive",
                        icon:
                          p.status === "Archived" ? (
                            <ArchiveRestore size={14} />
                          ) : (
                            <Archive size={14} />
                          ),
                        onClick: () => onArchiveToggle(p.id),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="py-14 text-center text-zinc-500 dark:text-zinc-500">
            <h3 className="font-semibold text-zinc-800 mb-1 dark:text-zinc-200">
              {loading ? "Loading playbooks…" : "No playbooks match"}
            </h3>
            <p className="text-sm">
              {loading
                ? "Fetching your playbooks from the server."
                : "Adjust the filters or search terms, or create a playbook for this scenario."}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3.5 px-4 py-3 border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60">
        <span className="text-xs text-zinc-500 dark:text-zinc-500">
          Showing {start}–{end} of {total} playbooks
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="min-w-[30px] h-[30px] rounded-md border border-zinc-200 text-xs text-zinc-500 disabled:opacity-40 hover:border-zinc-900 hover:text-zinc-900 disabled:hover:border-zinc-200 disabled:hover:text-zinc-500 transition-colors dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-zinc-100 dark:hover:text-zinc-100 dark:disabled:hover:border-zinc-700 dark:disabled:hover:text-zinc-500"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => onPageChange(n)}
              className={`min-w-[30px] h-[30px] rounded-md border text-xs font-mono transition-colors ${
                n === page
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-zinc-100 dark:hover:text-zinc-100"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="min-w-[30px] h-[30px] rounded-md border border-zinc-200 text-xs text-zinc-500 disabled:opacity-40 hover:border-zinc-900 hover:text-zinc-900 disabled:hover:border-zinc-200 disabled:hover:text-zinc-500 transition-colors dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-zinc-100 dark:hover:text-zinc-100 dark:disabled:hover:border-zinc-700 dark:disabled:hover:text-zinc-500"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
