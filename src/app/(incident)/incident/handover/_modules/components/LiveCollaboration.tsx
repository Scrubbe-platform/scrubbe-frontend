"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, UserPlus, Send, X } from "lucide-react";
import InviteModal from "./InviteModal";
import { useParams } from "next/navigation";

// types/collab.ts

export interface CollabViewer {
  initials: string;
  name: string;
  role: string;
  department: string;
  colorClass: string;
  isYou?: boolean;
}

export interface ChatMessage {
  id: string;
  initials: string;
  name: string;
  avatarColor: string;
  text: string;
  timestamp: string;
}

const MOCK_VIEWERS: CollabViewer[] = [
  {
    initials: "PI",
    name: "Paschal I.",
    role: "Incident Commander",
    department: "Platform Eng",
    colorClass: "bg-zinc-900 text-white font-mono",
    isYou: true,
  },
  {
    initials: "AR",
    name: "Aisha R.",
    role: "Incoming Commander",
    department: "On-Call / SRE",
    colorClass: "bg-purple-600 text-white font-mono",
  },
  {
    initials: "DK",
    name: "Dev K.",
    role: "Senior SRE",
    department: "On-Call / SRE",
    colorClass: "bg-cyan-700 text-white font-mono",
  },
  {
    initials: "MF",
    name: "Mo F.",
    role: "Platform Engineer",
    department: "Platform Eng",
    colorClass: "bg-amber-700 text-white font-mono",
  },
  {
    initials: "SN",
    name: "Sara N.",
    role: "Engineering Manager",
    department: "Management",
    colorClass: "bg-pink-700 text-white font-mono",
  },
];

const BOT_RESPONSES = [
  "Confirmed — flagging that for the incoming SRE team.",
  "Got it. Adding a note to the handover.",
  "Acknowledged. Will ensure the On-Call team sees this before transfer.",
  "Noted. Should we update the task list?",
];

export default function LiveCollaborationSection() {
  // 1. Structural Panel States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const params = useParams<{ id: string }>();
  const handoverId = params?.id as string;
  // 2. Chat Feed History Array Initialization
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      initials: "DK",
      name: "Dev K.",
      avatarColor: "bg-cyan-700",
      text: "joined the handover",
      timestamp: "12:14 UTC",
    },
    {
      id: "2",
      initials: "AR",
      name: "Aisha R.",
      avatarColor: "bg-purple-600",
      text: "added a note about the rollback verification window",
      timestamp: "12:19 UTC",
    },
    {
      id: "3",
      initials: "MF",
      name: "Mo F.",
      avatarColor: "bg-amber-700",
      text: "approved task: Collect and tag all evidence",
      timestamp: "12:28 UTC",
    },
    {
      id: "4",
      initials: "PI",
      name: "You",
      avatarColor: "bg-zinc-900",
      text: "ran Ezra Catch Me Up",
      timestamp: "12:31 UTC",
    },
  ]);

  const feedScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the live feed timeline down whenever messages sync or typing frames trigger
  useEffect(() => {
    if (feedScrollRef.current) {
      feedScrollRef.current.scrollTop = feedScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Helper function to extract a formatted live UTC timestamp string
  const getUTCTimestamp = () => {
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, "0");
    const m = String(now.getUTCMinutes()).padStart(2, "0");
    return `${h}:${m} UTC`;
  };

  // 3. Simulated Response Automation Workflow Loop
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      initials: "PI",
      name: "You",
      avatarColor: "bg-zinc-900",
      text: inputText.trim(),
      timestamp: getUTCTimestamp(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    // Simulate real-time remote user typing response chain
    setTimeout(() => {
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        const randomAnswer =
          BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];

        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          initials: "AR",
          name: "Aisha R.",
          avatarColor: "bg-purple-600",
          text: randomAnswer,
          timestamp: getUTCTimestamp(),
        };

        setMessages((prev) => [...prev, botResponse]);
      }, 1800); // Exact 1800ms text production simulation window
    }, 600); // Delay before indicator activates
  };

  return (
    <div className="w-full space-y-4">
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        handoverId={handoverId}
      />

      {/* ── COLLAB BAR PANEL ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-4">
          {/* Overlapping Viewers Avatar Stack */}
          <div className="flex items-center -space-x-2 select-none">
            {MOCK_VIEWERS.slice(0, 4).map((viewer, idx) => (
              <div
                key={idx}
                className={`relative h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-2xs dark:border-zinc-950 cursor-pointer transition-transform hover:-translate-y-0.5 z-10 ${viewer.colorClass}`}
                title={`${viewer.name} — ${viewer.role}`}
              >
                {viewer.initials}
                {/* Real-time online pulse pinpoint anchor indicator */}
                {(viewer.isYou || idx === 1 || idx === 3) && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white bg-green-500 dark:border-zinc-950" />
                )}
              </div>
            ))}
            <div className="h-8 w-8 rounded-full border-2 border-white bg-stone-200 text-stone-600 flex items-center justify-center text-[10px] font-bold dark:border-zinc-950 dark:bg-zinc-800 dark:text-zinc-400">
              +2
            </div>
          </div>

          {/* Running Operational Context Status Subtext strings */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs font-semibold text-green-700 dark:text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              5 team members viewing live
            </div>
            <div className="text-[11px] text-stone-400 dark:text-zinc-500 mt-0.5">
              Aisha R. is editing handover notes…
            </div>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex-1 sm:flex-none inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-3.5 text-xs font-semibold transition-all ${
              isChatOpen
                ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-400"
                : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            <MessageSquare size={13} />
            {isChatOpen ? "Close Chat" : "Open Chat"}
          </button>

          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            className="flex-1 sm:flex-none inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            <UserPlus size={13} />
            Invite
          </button>
        </div>
      </div>

      {/* ── COLLAB FEED DRAWER PANE ── */}
      {isChatOpen && (
        <div className="rounded-xl border border-stone-200 bg-stone-50/50 overflow-hidden shadow-xs dark:border-zinc-800 dark:bg-zinc-900/10 animate-fadeIn">
          {/* Feed Container Header */}
          <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              <MessageSquare size={14} className="text-stone-400" />
              Live Collaboration Feed
            </div>
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="rounded p-0.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
            >
              <X size={14} />
            </button>
          </div>

          {/* Messages Timeline Scrolling Canvas block */}
          <div
            ref={feedScrollRef}
            className="max-h-[240px] overflow-y-auto p-4 space-y-3.5 divide-y divide-stone-100/50 dark:divide-zinc-900/40"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-start gap-3 pt-3.5 first:pt-0"
              >
                {/* Initials Avatar Badge */}
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center font-mono text-[9px] font-black text-white shrink-0 shadow-2xs mt-0.5 ${msg.avatarColor}`}
                >
                  {msg.initials}
                </div>

                {/* Content Stream String text markup */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed">
                    <strong className="font-bold text-stone-900 dark:text-white mr-1">
                      {msg.name}
                    </strong>
                    {msg.text}
                  </div>
                  <div className="mt-0.5 font-mono text-[9px] text-stone-400 dark:text-zinc-500">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {/* Simulated Typist Indicator Row Frame */}
            {isTyping && (
              <div className="flex items-center gap-3 pt-3.5">
                <div className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-mono text-[9px] font-black shadow-2xs shrink-0">
                  AR
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 border border-stone-100 shadow-2xs dark:bg-zinc-950 dark:border-zinc-900">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce" />
                  </div>
                  <span className="text-[11px] text-stone-400 font-medium dark:text-zinc-500 ml-1">
                    Aisha R. is typing…
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Form Inline Sender Footer */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 border-t border-stone-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Send a message to the team…"
              className="h-9 flex-1 rounded-lg border border-stone-200 bg-stone-50 px-3 text-[13px] text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-zinc-700 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white shadow-2xs hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white transition-all"
            >
              <Send size={12} />
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
