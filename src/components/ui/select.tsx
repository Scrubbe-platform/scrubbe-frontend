"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Info } from "lucide-react";
import { RiInformationLine } from "react-icons/ri";

interface SelectProps {
  label?: string;
  error?: string;
  isLoading?: boolean;
  options: { value: any; label: string }[];
  labelClassName?: string;
  info?: string;
  icon?: React.ReactNode;
  className?: string;
  id?: string;
  value?: any;
  defaultValue?: any;
  onChange?: (e: { target: { value: any; name?: string } }) => void;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
}

const DROPDOWN_GAP = 4;
const VIEWPORT_PAD = 8;

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      label,
      error,
      isLoading = false,
      options,
      className = "",
      labelClassName = "",
      info,
      icon,
      value,
      defaultValue,
      onChange,
      name,
      placeholder = "Select…",
      disabled,
      id,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [mounted, setMounted] = useState(false);

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    const isDisabled = isLoading || disabled;

    const selectedOption = options.find(
      (o) => String(o.value) === String(value ?? defaultValue),
    );

    useEffect(() => {
      setMounted(true);
    }, []);

    // ── Compute fixed position from trigger rect ──
    const computePosition = useCallback(() => {
      const el = triggerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PAD;
      const spaceAbove = rect.top - VIEWPORT_PAD;
      const maxHeight = 220;

      const openBelow = spaceBelow >= maxHeight || spaceBelow >= spaceAbove;

      setDropdownStyle({
        position: "fixed",
        left: rect.left,
        width: rect.width,
        maxHeight: Math.min(maxHeight, openBelow ? spaceBelow : spaceAbove),
        ...(openBelow
          ? { top: rect.bottom + DROPDOWN_GAP }
          : { bottom: window.innerHeight - rect.top + DROPDOWN_GAP }),
      });
    }, []);

    // Recompute position when opening
    useLayoutEffect(() => {
      if (!open) return;
      computePosition();
    }, [open, computePosition]);

    // Reposition on scroll/resize while open
    useEffect(() => {
      if (!open) return;
      const handle = () => computePosition();
      window.addEventListener("scroll", handle, true);
      window.addEventListener("resize", handle);
      return () => {
        window.removeEventListener("scroll", handle, true);
        window.removeEventListener("resize", handle);
      };
    }, [open, computePosition]);

    // Close on outside click (check both trigger and portaled list)
    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          triggerRef.current &&
          !triggerRef.current.contains(target) &&
          listRef.current &&
          !listRef.current.contains(target)
        ) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const select = useCallback(
      (opt: { value: any; label: string }) => {
        onChange?.({ target: { value: opt.value, name } });
        setOpen(false);
      },
      [onChange, name],
    );

    // Keyboard navigation
    const onKeyDown = (e: React.KeyboardEvent) => {
      if (isDisabled) return;

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          if (!open) {
            setOpen(true);
            setHighlightedIndex(
              options.findIndex(
                (o) => String(o.value) === String(value ?? defaultValue),
              ),
            );
          } else if (highlightedIndex >= 0) {
            select(options[highlightedIndex]);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!open) {
            setOpen(true);
          } else {
            setHighlightedIndex((i) => (i < options.length - 1 ? i + 1 : 0));
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (!open) {
            setOpen(true);
          } else {
            setHighlightedIndex((i) => (i > 0 ? i - 1 : options.length - 1));
          }
          break;
        case "Escape":
          setOpen(false);
          break;
      }
    };

    // Scroll highlighted item into view
    useEffect(() => {
      if (!open || highlightedIndex < 0 || !listRef.current) return;
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }, [highlightedIndex, open]);

    // Merge forwarded ref with internal ref
    const setTriggerRef = useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
            node;
      },
      [ref],
    );

    // ── Portal dropdown ──
    const dropdown = open && mounted && (
      <div
        ref={listRef}
        role="listbox"
        style={dropdownStyle}
        className="
          z-[9999] overflow-auto
          rounded-lg border border-zinc-200 dark:border-zinc-700
          bg-white dark:bg-zinc-900
          shadow-md shadow-black/8 dark:shadow-black/30
          py-1
        "
      >
        {options.map((opt, i) => {
          const isSelected =
            String(opt.value) === String(value ?? defaultValue);
          const isHighlighted = i === highlightedIndex;

          return (
            <div
              key={opt.value}
              role="option"
              aria-selected={isSelected}
              onClick={() => select(opt)}
              onMouseEnter={() => setHighlightedIndex(i)}
              className={`
                flex items-center gap-2 px-3 py-2 text-sm cursor-pointer
                transition-colors duration-100
                ${isHighlighted ? "bg-zinc-100 dark:bg-zinc-800" : ""}
                ${isSelected ? "text-zinc-900 dark:text-white font-medium" : "text-zinc-700 dark:text-zinc-300"}
              `}
            >
              <span className="flex-1 truncate">{opt.label}</span>
              {isSelected && (
                <Check
                  size={14}
                  className="shrink-0 text-blue-600 dark:text-blue-400"
                />
              )}
            </div>
          );
        })}

        {options.length === 0 && (
          <div className="px-3 py-4 text-sm text-zinc-400 text-center">
            No options available
          </div>
        )}
      </div>
    );

    return (
      <div className="mb-4" ref={containerRef}>
        {label && (
          <label
            htmlFor={id}
            className={`flex gap-2 items-center font-ibm dark:text-white mb-2 text-sm font-medium ${
              isLoading ? "text-gray-500" : "text-black"
            } ${labelClassName}`}
          >
            {icon && <div>{icon}</div>}
            {label}
            {info && (
              <div className="group relative">
                <RiInformationLine className="text-IMSLightGreen cursor-pointer" />
                <div className="group-hover:block hidden absolute -top-[60px] -left-[90px] text-center w-[200px] rounded-lg p-3 bg-black bg-opacity-80 text-white z-50">
                  {info}
                </div>
              </div>
            )}
          </label>
        )}

        {/* Trigger */}
        <button
          ref={setTriggerRef}
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={isDisabled}
          onClick={() => !isDisabled && setOpen((o) => !o)}
          onKeyDown={onKeyDown}
          className={`
            flex items-center justify-between w-full h-[34px] px-3 text-sm
            border rounded-md bg-transparent text-left
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${isDisabled ? "border-[#DDDDDD] bg-gray-50 opacity-70 cursor-not-allowed" : "border-[#DDDDDD] hover:border-zinc-400 cursor-pointer"}
            ${error ? "border-red-500 focus:ring-red-500" : ""}
            ${className}
          `}
        >
          <span
            className={
              selectedOption
                ? "text-zinc-900 dark:text-white truncate"
                : "text-zinc-400 dark:text-zinc-500 truncate"
            }
          >
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            size={14}
            className={`shrink-0 text-zinc-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Portaled dropdown — escapes any overflow ancestor */}
        {mounted && dropdown && createPortal(dropdown, document.body)}

        {error && (
          <p className="text-red-500 text-xs mt-1 flex gap-1 items-center">
            <Info size={14} />
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
