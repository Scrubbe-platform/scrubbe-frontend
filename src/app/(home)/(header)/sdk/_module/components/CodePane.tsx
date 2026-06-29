// components/developer/CodePane.tsx
import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CodePaneProps {
  fileName: string;
  langLabel: string;
  codeText: string;
}

export default function CodePane({
  fileName,
  langLabel,
  codeText,
}: CodePaneProps) {
  const [copied, setCopied] = useState(false);
  const lines = codeText.trim().split("\n");

  const triggerCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950 shadow-2xs">
      {/* Pane Header Control bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-xs font-mono text-zinc-500">
        <span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
          {fileName}
        </span>
        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
            {langLabel}
          </span>
          <button
            type="button"
            onClick={triggerCopy}
            className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white font-sans font-medium transition-colors"
          >
            {copied ? (
              <Check size={12} className="text-emerald-500" />
            ) : (
              <Copy size={11} />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Line Numbers + Code Table Canvas */}
      <div className="overflow-x-auto bg-white dark:bg-zinc-950 p-2">
        <table className="w-full border-collapse text-left font-mono text-[12.5px] leading-[21px]">
          <tbody>
            {lines.map((lineText, idx) => (
              <tr
                key={idx}
                className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/20 group"
              >
                <td className="w-10 pr-4 pl-2 text-right text-zinc-400 select-none font-mono text-xs border-r border-zinc-100 dark:border-zinc-900">
                  {idx + 1}
                </td>
                <td className="pl-4 pr-3 text-zinc-800 dark:text-zinc-300 whitespace-pre">
                  {lineText || "\u200b"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
