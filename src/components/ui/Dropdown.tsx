"use client";

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

type DropdownAlign = "left" | "right";
type DropdownPosition = "bottom" | "top" | "left" | "right";

interface DropdownProps {
  items?: DropdownItem[];
  children?: ReactNode;
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

const GAP = 8; // px gap between trigger and menu (was mt-2/mb-2/ml-2/mr-2)
const VIEWPORT_PADDING = 8; // keep menu at least this far from viewport edges

interface MenuStyle {
  position: "fixed";
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
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
  children,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue,
  );
  const [menuStyle, setMenuStyle] = useState<MenuStyle | null>(null);
  const [mounted, setMounted] = useState(false);

  const activeValue = value !== undefined ? value : internalValue;

  const selectedItem =
    items?.find(
      (item): item is Extract<DropdownItem, { type?: "item" }> =>
        (!item.type || item.type === "item") && item.value === activeValue,
    ) ?? null;

  // triggerRef wraps just the trigger now (menu is portaled out of this tree)
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Compute fixed-position coordinates from the trigger's viewport rect ──
  // Using left/right/top/bottom offsets (rather than translate) means we
  // don't need to know the menu's own size up front.
  const computePosition = () => {
    const el = triggerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const style: MenuStyle = { position: "fixed" };

    // Primary axis: which side of the trigger the menu opens on
    switch (position) {
      case "top":
        style.bottom = window.innerHeight - rect.top + GAP;
        break;
      case "left":
        style.right = window.innerWidth - rect.left + GAP;
        break;
      case "right":
        style.left = rect.right + GAP;
        break;
      case "bottom":
      default:
        style.top = rect.bottom + GAP;
        break;
    }

    // Cross axis
    if (position === "top" || position === "bottom") {
      if (align === "right") {
        style.right = window.innerWidth - rect.right;
      } else {
        style.left = rect.left;
      }
    } else {
      // left / right position: align controls top-edge vs bottom-edge alignment
      if (align === "right") {
        style.bottom = window.innerHeight - rect.bottom;
      } else {
        style.top = rect.top;
      }
    }

    setMenuStyle(style);
  };

  // Recompute the instant the menu opens (before paint, to avoid flicker)
  useLayoutEffect(() => {
    if (!open) return;
    computePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, position, align]);

  // Once the menu has real dimensions, flip/clamp it if it doesn't fit
  useLayoutEffect(() => {
    if (!open || !menuRef.current || !triggerRef.current) return;

    const menuRect = menuRef.current.getBoundingClientRect();
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    setMenuStyle((prev) => {
      if (!prev) return prev;
      const next = { ...prev };

      if (position === "top" && menuRect.top < VIEWPORT_PADDING) {
        // not enough room above — flip to open downward instead
        delete next.bottom;
        next.top = triggerRect.bottom + GAP;
      } else if (
        position === "bottom" &&
        menuRect.bottom > vh - VIEWPORT_PADDING
      ) {
        // not enough room below — flip to open upward instead
        delete next.top;
        next.bottom = vh - triggerRect.top + GAP;
      }

      if (position === "left" && menuRect.left < VIEWPORT_PADDING) {
        delete next.right;
        next.left = triggerRect.right + GAP;
      } else if (
        position === "right" &&
        menuRect.right > vw - VIEWPORT_PADDING
      ) {
        delete next.left;
        next.right = vw - triggerRect.left + GAP;
      }

      // Clamp horizontally so the menu never runs off the left/right edge
      if (typeof next.left === "number" && menuRect.width) {
        const maxLeft = vw - menuRect.width - VIEWPORT_PADDING;
        if (next.left > maxLeft) {
          next.left = Math.max(VIEWPORT_PADDING, maxLeft);
        }
      }

      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    menuStyle?.top,
    menuStyle?.bottom,
    menuStyle?.left,
    menuStyle?.right,
  ]);

  // Reposition on scroll/resize while open (capture:true catches scroll on any ancestor)
  useEffect(() => {
    if (!open) return;
    const handle = () => computePosition();
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close on outside click (menu is portaled, so check both trigger and menu)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
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

  const menuNode = open && menuStyle && (
    <div
      ref={menuRef}
      role="menu"
      style={menuStyle}
      className={[
        "z-[1000] min-w-[180px] w-max max-w-xs",
        "bg-white dark:bg-neutral-900",
        "border border-neutral-200 dark:border-neutral-700",
        "rounded-xl shadow-lg shadow-black/10 dark:shadow-black/40",
        "py-1 overflow-hidden",
        menuClassName,
      ].join(" ")}
    >
      {items ? (
        <>
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
        </>
      ) : (
        <>{children}</>
      )}
    </div>
  );

  return (
    <div ref={triggerRef} className={`relative inline-block  ${className}`}>
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

      {/* ── Menu (portaled to <body> so table/card overflow can never clip it) ── */}
      {mounted && menuNode && createPortal(menuNode, document.body)}
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
