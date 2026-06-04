"use client";
import { X } from "lucide-react";
import React from "react";

interface SideModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  subTitle?: string;
}

const SideModal: React.FC<SideModalProps> = ({
  isOpen, onClose, children, title, subTitle,
}) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[600px] max-w-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            <div className="space-y-0.5">
              <h2 className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-100">
                {title}
              </h2>
              {subTitle && (
                <p className="text-[12px] text-zinc-400 dark:text-zinc-500">{subTitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default SideModal;