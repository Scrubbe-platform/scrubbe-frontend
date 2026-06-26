"use client";

import React, { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  Link2,
  ChevronDown,
} from "lucide-react";

// ── Dropdown Template Definition Config Data Mapping ───────────────────
interface EntryTemplate {
  name: string;
  purpose: string;
  questions: string[];
}

const ENTRY_TEMPLATES: Record<string, EntryTemplate> = {
  "Incident Update": {
    name: "Incident Update",
    purpose: "General status update.",
    questions: [
      "What is the current status of the incident?",
      "What changed since the previous update?",
      "Which services or systems remain affected?",
      "Is customer impact increasing, decreasing, or stable?",
      "What investigation activities are currently underway?",
      "When is the next expected update?",
    ],
  },
  "Investigation Finding": {
    name: "Investigation Finding",
    purpose: "Record discoveries made during investigation.",
    questions: [
      "What finding was discovered?",
      "Which system, service, deployment, or component does it relate to?",
      "What evidence supports the finding?",
      "When was the finding discovered?",
      "Does the finding explain observed symptoms?",
      "Does the finding require further validation?",
    ],
  },
  "Customer Impact": {
    name: "Customer Impact",
    purpose: "Capture business consequences.",
    questions: [
      "Which customers are affected?",
      "How many customers are affected?",
      "What functionality is unavailable or degraded?",
      "Is revenue, compliance, or reputation impacted?",
      "What is the estimated business impact?",
      "Has customer impact changed since the last update?",
    ],
  },
  "Timeline Event": {
    name: "Timeline Event",
    purpose: "Create precise event records.",
    questions: [
      "What event occurred?",
      "When did the event occur?",
      "Who performed the action?",
      "Which service or system was involved?",
      "Was the event expected or unexpected?",
      "Did the event improve or worsen the incident?",
    ],
  },
  "Root Cause Evidence": {
    name: "Root Cause Evidence",
    purpose: "Capture evidence contributing to root cause.",
    questions: [
      "What evidence was discovered?",
      "Which signal supports this evidence?",
      "What component appears responsible?",
      "What changed before the incident started?",
      "How confident are you in this evidence?",
      "Does the evidence require further validation?",
    ],
  },
  "Mitigation Action": {
    name: "Mitigation Action",
    purpose: "Document actions taken.",
    questions: [
      "What action was performed?",
      "Why was the action performed?",
      "Who approved the action?",
      "When was the action executed?",
      "What systems were affected?",
      "What was the observed outcome?",
    ],
  },
  "Decision Log": {
    name: "Decision Log",
    purpose: "Record Incident Commander decisions.",
    questions: [
      "What decision was made?",
      "Who made the decision?",
      "What information supported the decision?",
      "What alternatives were considered?",
      "What risks were accepted?",
      "What follow-up actions were assigned?",
    ],
  },
  "Handover Note": {
    name: "Handover Note",
    purpose: "Shift changes.",
    questions: [
      "What is the current incident state?",
      "What work has been completed?",
      "What work remains outstanding?",
      "What risks require monitoring?",
      "What actions should the next responder take?",
      "Who currently owns the incident?",
    ],
  },
  "Executive Update": {
    name: "Executive Update",
    purpose: "Leadership communication.",
    questions: [
      "What happened?",
      "What is the current business impact?",
      "What is being done to resolve the issue?",
      "What is the estimated recovery timeline?",
      "What risks remain?",
      "When is the next executive update?",
    ],
  },
  "Resolution Summary": {
    name: "Resolution Summary",
    purpose: "Incident closure.",
    questions: [
      "What was the root cause?",
      "How was the issue resolved?",
      "What customer impact occurred?",
      "What lessons were learned?",
      "What follow-up actions are required?",
      "Has service been fully restored?",
    ],
  },
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Detail triage context logs, connection states, impact boundaries...",
}: RichTextEditorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("Entry Type");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none p-3.5 text-xs font-normal text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-950 min-h-[220px] outline-none leading-relaxed overflow-y-auto",
        placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync editor if form shifts programmatically from outside
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  // Global document click watcher to close the custom dropdown menu when clicking away
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!editor) return null;

  // ── Inject layout format string directly into Tiptap editor engine ──────
  const handleSelectTemplate = (key: string) => {
    const template = ENTRY_TEMPLATES[key];
    setSelectedType(template.name);
    setDropdownOpen(false);

    // Build functional semantic HTML structured document string layout
    let htmlContent = `<p><strong>Purpose:</strong> ${template.purpose}</p><p></p>`;
    htmlContent += `<p><strong>Questions Checklist:</strong></p><ul>`;
    template.questions.forEach((q) => {
      htmlContent += `<li>${q}</li>`;
    });
    htmlContent += `</ul><p></p>`;

    // Replace document content safely and focus caret input line below it
    editor.chain().focus().setContent(htmlContent).run();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL reference destination:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const btnClass = (markName: string) => `
    p-1 rounded transition-colors duration-150
    ${
      editor.isActive(markName)
        ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
    }
  `;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xs mt-1.5 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-all bg-white dark:bg-zinc-950">
      {/* Dynamic Action Toolbar Bar Layout Area */}
      <div className="flex items-center gap-1 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 px-3 py-1.5 select-none relative">
        {/* Custom Styled Isolated Dropdown Node Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {selectedType}{" "}
            <ChevronDown
              size={11}
              className={
                dropdownOpen
                  ? "rotate-180 transition-transform"
                  : "transition-transform"
              }
            />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-1 w-56 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
              <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 mb-1">
                Select Entry Type
              </div>
              {Object.keys(ENTRY_TEMPLATES).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectTemplate(key)}
                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors font-medium block"
                >
                  {key}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-[1px] h-3.5 bg-zinc-200 dark:bg-zinc-700 mx-1.5" />

        {/* Text Bold Action */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass("bold")}
          title="Bold"
        >
          <Bold size={13} />
        </button>

        {/* Text Italic Action */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass("italic")}
          title="Italic"
        >
          <Italic size={13} />
        </button>

        {/* Text Underline Action */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnClass("underline")}
          title="Underline"
        >
          <UnderlineIcon size={13} />
        </button>

        {/* Text Strikethrough Action */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={btnClass("strike")}
          title="Strikethrough"
        >
          <Strikethrough size={13} />
        </button>

        <div className="w-[1px] h-3.5 bg-zinc-200 dark:bg-zinc-700 mx-1.5" />

        {/* Alignment Placeholders */}
        <button
          type="button"
          className="p-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
          title="Align Left"
        >
          <AlignLeft size={13} />
        </button>

        {/* Anchor Links */}
        <button
          type="button"
          onClick={setLink}
          className={btnClass("link")}
          title="Insert Hyperlink"
        >
          <Link2 size={13} />
        </button>
      </div>

      {/* Primary Editable Writing Surface Layer */}
      <EditorContent editor={editor} />
    </div>
  );
}
