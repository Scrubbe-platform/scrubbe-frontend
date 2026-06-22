"use client";

import React, { useEffect } from "react";
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
  // Initialize Tiptap core with extensions matching your toolbar features
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
    // Inject styling directly into the editable surface area
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none p-3.5 text-xs font-normal text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-950 min-h-[220px] outline-none leading-relaxed overflow-y-auto",
        placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      // Emit clean HTML output strings back to react-hook-form Controller loop
      onChange(editor.getHTML());
    },
  });

  // Sync editor content if form values change from parent resets or initial loads
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  // Formatting action wrapper for the custom link extension trigger
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

  // Helper utility to apply dynamic active text styles to your buttons
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
      {/* Real Formatting Bar Layout Control Wrapper */}
      <div className="flex items-center gap-1 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 px-3 py-1.5 select-none">
        {/* Format Select dropdown menu block */}
        <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          Paragraph <ChevronDown size={11} />
        </div>

        <div className="w-[1px] h-3.5 bg-zinc-200 dark:bg-zinc-700 mx-1.5" />

        {/* Bold Action Button */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass("bold")}
          title="Bold"
        >
          <Bold size={13} />
        </button>

        {/* Italic Action Button */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass("italic")}
          title="Italic"
        >
          <Italic size={13} />
        </button>

        {/* Underline Action Button */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnClass("underline")}
          title="Underline"
        >
          <UnderlineIcon size={13} />
        </button>

        {/* Strikethrough Action Button */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={btnClass("strike")}
          title="Strikethrough"
        >
          <Strikethrough size={13} />
        </button>

        <div className="w-[1px] h-3.5 bg-zinc-200 dark:bg-zinc-700 mx-1.5" />

        {/* Paragraph Alignment Actions button */}
        <button
          type="button"
          className="p-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
          title="Align Left"
        >
          <AlignLeft size={13} />
        </button>

        {/* Custom Anchor Link Integration Action Button */}
        <button
          type="button"
          onClick={setLink}
          className={btnClass("link")}
          title="Insert Hyperlink Link"
        >
          <Link2 size={13} />
        </button>
      </div>

      {/* Tiptap Rich Text Surface Component Node */}
      <EditorContent editor={editor} />
    </div>
  );
}
