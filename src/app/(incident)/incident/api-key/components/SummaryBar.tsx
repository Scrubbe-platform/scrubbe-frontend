// app/platform/api-keys/components/SummaryBar.tsx
import { ApiKey } from "../_modules/types/apiKeys";

export default function SummaryBar({ keys }: { keys: ApiKey[] }) {
  const total = keys.length;
  const active = keys.filter((k) => k.status === "active").length;
  const expired = keys.filter((k) => k.status === "expired").length;
  const revoked = keys.filter((k) => k.status === "revoked").length;

  const metrics = [
    {
      label: "Total Keys",
      val: total,
      meta: "across all types",
      style: "text-zinc-950 dark:text-zinc-100",
    },
    {
      label: "Active",
      val: active,
      meta: "authenticated",
      style: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Expired",
      val: expired,
      meta: "pending rotation",
      style: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Revoked",
      val: revoked,
      meta: "permanently",
      style: "text-red-600 dark:text-red-400",
    },
    {
      label: "Last Activity",
      val: "2 min ago",
      meta: "payments-sdk",
      style: "text-zinc-950 dark:text-zinc-100 font-sans text-base",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-2xs bg-white dark:bg-zinc-900/40">
      {metrics.map((m, i) => (
        <div key={i} className="p-4 border-r last:border-r-0 border-zinc-200 dark:border-zinc-700">
          <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
            {m.label}
          </div>
          <div
            className={`text-2xl font-bold font-mono tracking-tight leading-none ${m.style}`}
          >
            {m.val}
          </div>
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5">{m.meta}</div>
        </div>
      ))}
    </div>
  );
}
