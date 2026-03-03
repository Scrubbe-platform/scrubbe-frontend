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
    state: {
      sorting,
    },
  });

  return (
    <div className="overflow-x-auto dark:bg-background bg-[#0A1635] rounded-lg">
      {data && data.length < 1 ? (
        <>
          <EmptyState title="No Items yet"/>
        </>
      ) : (
        <table
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        >
          <thead className="text-white bg-[#374151]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="dark:border-zinc-600 border-zinc-300 transition-colors  data-[state=selected]:bg-zinc-100  dark:data-[state=selected]:bg-zinc-800"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "h-12 px-4 text-left align-middle font-semibold [&:has([role=checkbox])]:pr-0 ",
                        headerClassName
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? "cursor-pointer select-none flex items-center gap-1"
                              : "",
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{ asc: " 🔼", desc: " 🔽" }[
                            header.column.getIsSorted() as string
                          ] ?? null}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="[&_tr:last-child]:border-0 dark:bg-[#1F2937] dark:text-white">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  "border-b dark:border-zinc-600 border-zinc-300 transition-colors  data-[state=selected]:bg-zinc-100  dark:data-[state=selected]:bg-zinc-800",
                  typeof rowClassName === "function"
                    ? rowClassName(row.original)
                    : rowClassName,
                  onRowClick && "cursor-pointer"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn(
                      "p-4 align-middle [&:has([role=checkbox])]:pr-0",
                      typeof cellClassName === "function"
                        ? cellClassName(row.original, cell.column.id)
                        : cellClassName
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
