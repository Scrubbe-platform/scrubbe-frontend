"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DropdownItem =
  | {
      type?: "item";
      value: string;
      label: string;
      icon?: ReactNode;
      onClick?: () => void;
      disabled?: boolean;
    }
  | { type: "divider" }
  | { type: "label"; label: string };

// Extended to include absolute side alignments
type DropdownAlign = "left" | "right";
type DropdownPosition = "bottom" | "top" | "left" | "right";

interface DropdownProps {
  items: DropdownItem[];
  trigger?:
    | ReactNode
    | ((selected: DropdownItem | null, open: boolean) => ReactNode);
  align?: DropdownAlign;
  position?: DropdownPosition;
  className?: string;
  menuClassName?: string;
  // ── Selection ──────────────────────────────────────────────────────────────
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, item: DropdownItem) => void;
  showSelectedIcon?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dropdown({
  items,
  trigger,
  align = "left",
  position = "bottom",
  className = "",
  menuClassName = "",
  value,
  defaultValue,
  onChange,
  showSelectedIcon = true,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue,
  );

  const activeValue = value !== undefined ? value : internalValue;

  const selectedItem =
    items.find(
      (item): item is Extract<DropdownItem, { type?: "item" }> =>
        (!item.type || item.type === "item") && item.value === activeValue,
    ) ?? null;

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // ── Dynamic Layout Engine ──
  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return {
          position: "bottom-full mb-2",
          align: align === "right" ? "right-0" : "left-0",
        };
      case "left":
        return {
          position: "right-full mr-2",
          align: align === "right" ? "bottom-0" : "top-0",
        };
      case "right":
        return {
          position: "left-full ml-2",
          align: align === "right" ? "bottom-0" : "top-0",
        };
      case "bottom":
      default:
        return {
          position: "top-full mt-2",
          align: align === "right" ? "right-0" : "left-0",
        };
    }
  };

  const layoutClasses = getPositionClasses();

  return (
    <div ref={wrapperRef} className={`relative inline-block ${className}`}>
      {/* ── Trigger ── */}
      <div
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer"
        role="button"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {typeof trigger === "function"
          ? trigger(selectedItem, open)
          : (trigger ?? <DefaultTrigger selected={selectedItem} open={open} />)}
      </div>

      {/* ── Menu ── */}
      {open && (
        <div
          role="menu"
          className={[
            "absolute z-[1000] min-w-[180px] w-max max-w-xs",
            "bg-white dark:bg-neutral-900",
            "border border-neutral-200 dark:border-neutral-700",
            "rounded-xl shadow-lg shadow-black/10 dark:shadow-black/40",
            "py-1 overflow-hidden",
            layoutClasses.position,
            layoutClasses.align,
            menuClassName,
          ].join(" ")}
        >
          {items.map((item, i) => {
            if (item.type === "divider") {
              return (
                <hr
                  key={i}
                  className="my-1 border-neutral-100 dark:border-neutral-800"
                />
              );
            }

            if (item.type === "label") {
              return (
                <div
                  key={i}
                  className="px-3 pt-2 pb-1 text-[10px] font-bold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 select-none"
                >
                  {item.label}
                </div>
              );
            }

            const isSelected = activeValue === item.value;
            return (
              <button
                key={i}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    setInternalValue(item.value);
                    onChange?.(item.value, item);
                    item.onClick?.();
                    setOpen(false);
                  }
                }}
                className={[
                  "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left",
                  "transition-colors duration-150 focus:outline-none",
                  item.disabled
                    ? "opacity-40 cursor-not-allowed text-neutral-400 dark:text-neutral-500"
                    : isSelected
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                      : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus-visible:bg-neutral-50 dark:focus-visible:bg-neutral-800",
                ].join(" ")}
              >
                {item.icon && (
                  <span className="flex-shrink-0 text-neutral-500 dark:text-neutral-400 w-4 h-4 flex items-center justify-center">
                    {item.icon}
                  </span>
                )}
                <span className="flex-1">{item.label}</span>
                {showSelectedIcon && isSelected && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0 text-[#22a156]"
                  >
                    <path
                      d="M2.5 7L5.5 10L11.5 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Default Trigger ─────────────────────────────────────────────────────────

function DefaultTrigger({
  selected,
  open,
}: {
  selected: Extract<DropdownItem, { type?: "item" }> | null;
  open: boolean;
}) {
  return (
    <button
      type="button"
      className={[
        "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors duration-150",
        "bg-white dark:bg-neutral-900",
        "border-neutral-200 dark:border-neutral-700",
        "text-neutral-800 dark:text-neutral-200",
        "hover:bg-neutral-50 dark:hover:bg-neutral-800",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22a156]",
      ].join(" ")}
    >
      {selected?.icon && (
        <span className="w-4 h-4 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
          {selected.icon}
        </span>
      )}
      {selected?.label ?? "Select…"}
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      >
        <path
          d="M2 4L6 8L10 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
