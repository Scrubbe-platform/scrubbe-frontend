import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
  flexRender,
} from "@tanstack/react-table";
import EmptyState from "./EmptyState";

interface TableProps<TData> extends React.HTMLAttributes<HTMLTableElement> {
  data?: TData[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  headerClassName?: string;
  rowClassName?: string | ((data: TData) => string);
  cellClassName?: string | ((data: TData, columnId: string) => string);
  onRowClick?: (data: TData) => void;
}

const Table = <TData extends object>({
  data,
  columns,
  className,
  headerClassName,
  rowClassName,
  cellClassName,
  onRowClick,
  ...props
}: TableProps<TData>) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  return (
    <div className="overflow-x-auto rounded-lg bg-white dark:bg-[#0A1635]">
      {data && data.length < 1 ? (
        <EmptyState title="No Items yet" />
      ) : (
        <table
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        >
          {/* ── Head ── */}
          <thead className="bg-zinc-100 dark:bg-[#374151] text-black dark:text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-zinc-300 dark:border-zinc-600 transition-colors data-[state=selected]:bg-zinc-100 dark:data-[state=selected]:bg-zinc-800"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      "h-12 px-4 text-left align-middle font-semibold text-xs uppercase tracking-wider [&:has([role=checkbox])]:pr-0",
                      headerClassName,
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-1"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{ asc: " 🔼", desc: " 🔽" }[
                          header.column.getIsSorted() as string
                        ] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* ── Body ── */}
          <tbody className="[&_tr:last-child]:border-0 bg-white dark:bg-[#1F2937] text-black dark:text-white min-h-[600px]">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  "border-b border-zinc-300 dark:border-zinc-600 transition-colors",
                  "hover:bg-zinc-50 dark:hover:bg-zinc-700/40",
                  "data-[state=selected]:bg-zinc-100 dark:data-[state=selected]:bg-zinc-800",
                  typeof rowClassName === "function"
                    ? rowClassName(row.original)
                    : rowClassName,
                  onRowClick && "cursor-pointer",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn(
                      "p-4 align-middle [&:has([role=checkbox])]:pr-0",
                      typeof cellClassName === "function"
                        ? cellClassName(row.original, cell.column.id)
                        : cellClassName,
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export { Table };
