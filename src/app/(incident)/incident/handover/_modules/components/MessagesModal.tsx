"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  X,
  Search,
  Send,
  AlertCircle,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useMember, { Member } from "@/hooks/useMember";
import { IncidentListItem } from "@/lib/incident/incident.types";
import { useIncidentDetail } from "@/hooks/useIncidentWorkspace";
import useAuthStore from "@/lib/stores/auth.store";
import { initSocket } from "@/lib/api/socket";
import {
  fetchConversations,
  fetchConversationMessages,
  getOrCreateConversation,
  markConversationRead,
  ConversationSummary,
  DirectMessageRecord,
} from "@/lib/direct-messages/direct-messages.api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  senderId: string; // real userId — compared against the current user's id, not a literal "me"
  text: string;
  timestamp: Date;
}

interface Conversation {
  id: string; // DirectConversation id — needed to join the socket room / fetch / send
  memberId: string; // the other participant's userId
  messages: Message[];
  lastMessage: string;
  lastAt: Date;
  unread: number;
  online: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Matches Scrubbe ticket IDs like SI-W27PHJ7.
 * Pattern: "SI-" followed by 6–10 uppercase alphanumeric characters.
 */
const INCIDENT_ID_REGEX = /\b(SI-[A-Z0-9]{6,10})\b/g;

const SEVERITY_COLORS: Record<string, string> = {
  P0: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  P1: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  P2: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  P3: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  P4: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(m: Member) {
  const f = m.firstname?.[0] ?? "";
  const l = m.lastname?.[0] ?? "";
  return (f + l).toUpperCase() || m.email[0].toUpperCase();
}

function fullName(m: Member) {
  const name = `${m.firstname ?? ""} ${m.lastname ?? ""}`.trim();
  return name || m.email;
}

const AVATAR_COLORS = [
  "#16a34a",
  "#0ea5e9",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
];
function avatarColor(id: string) {
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function formatTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  });
}

function groupByDay(messages: Message[]) {
  const groups: { label: string; messages: Message[] }[] = [];
  for (const msg of messages) {
    const today = new Date().toDateString() === msg.timestamp.toDateString();
    const dayLabel = today
      ? "TODAY"
      : msg.timestamp
          .toLocaleDateString([], {
            weekday: "long",
            month: "long",
            day: "numeric",
          })
          .toUpperCase();
    const last = groups[groups.length - 1];
    if (last?.label === dayLabel) {
      last.messages.push(msg);
    } else {
      groups.push({ label: dayLabel, messages: [msg] });
    }
  }
  return groups;
}

// ─── Incident token popover ───────────────────────────────────────────────────

/**
 * Renders a single incident ID token.
 * On hover → fetches the incident via useIncidentDetail and shows a popover card.
 * On click → navigates to /incident/<ticketId>.
 */
function IncidentToken({
  ticketId,
  isMe,
}: {
  ticketId: string;
  isMe: boolean;
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Only fire the query once the user has hovered for 200ms (avoids spamming on mouse-over)
  const handleMouseEnter = useCallback(() => {
    hoverTimerRef.current = setTimeout(() => {
      setShouldFetch(true);
      setHovered(true);
    }, 200);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHovered(false);
  }, []);

  // useIncidentDetail expects an incidentId — here we use ticketId as the lookup key.
  // The hook should be adapted if your API distinguishes between uuid id and ticketId.
  const { data: incident, isLoading } = useIncidentDetail(
    shouldFetch ? ticketId : null, // pass null to skip the query
  );

  const severityKey = incident?.severity ?? incident?.priority ?? "";
  const severityClass = SEVERITY_COLORS[severityKey] ?? SEVERITY_COLORS["P4"];

  return (
    <span className="relative inline-block align-baseline">
      {/* The token itself */}
      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          router.push(`/incident/tickets?id=${incident?.id}`);
        }}
        className={`
          inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[12px] font-semibold
          border transition-all cursor-pointer select-none
          ${
            isMe
              ? "bg-white/20 border-white/30 text-white hover:bg-white/30"
              : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
          }
        `}
      >
        <AlertCircle size={10} className="flex-shrink-0 opacity-70" />
        {ticketId}
        <ArrowUpRight size={9} className="flex-shrink-0 opacity-60" />
      </button>

      {/* Popover card */}
      {hovered && (
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={handleMouseLeave}
          className="absolute z-[9999] bottom-full mb-2 left-0 w-72 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden"
          style={{ minWidth: 260 }}
        >
          {isLoading ? (
            <div className="px-4 py-5 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[12px] text-zinc-500 dark:text-zinc-400">
                Loading incident…
              </span>
            </div>
          ) : incident ? (
            <>
              {/* Popover header */}
              <div className="px-4 pt-3.5 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10.5px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                    {incident.ticketId}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${severityClass}`}
                  >
                    {severityKey || "—"}
                  </span>
                </div>
                <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
                  {incident.title}
                </p>
              </div>

              {/* Popover body */}
              <div className="px-4 py-3 space-y-2">
                {incident.summary && (
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                    {incident.summary}
                  </p>
                )}
                <div className="flex items-center gap-3 pt-0.5">
                  {incident.status && (
                    <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                      Status:{" "}
                      <span className="text-zinc-900 dark:text-zinc-200">
                        {incident.status}
                      </span>
                    </span>
                  )}
                  {incident.service && (
                    <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                      Service:{" "}
                      <span className="text-zinc-900 dark:text-zinc-200">
                        {incident.service}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Popover footer CTA */}
              <button
                onClick={() =>
                  router.push(`/incident/tickets?id=${incident.id}`)
                }
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-800 text-[11.5px] font-semibold text-emerald-600 dark:text-emerald-400 transition-colors"
              >
                View incident
                <ExternalLink size={11} />
              </button>
            </>
          ) : (
            // ticketId not found / error
            <div className="px-4 py-4">
              <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
                Could not load details for{" "}
                <span className="font-semibold text-zinc-600 dark:text-zinc-300">
                  {ticketId}
                </span>
                .
              </p>
            </div>
          )}
        </div>
      )}
    </span>
  );
}

// ─── Message text renderer ────────────────────────────────────────────────────

/**
 * Splits raw message text into plain segments and incident-ID tokens,
 * then renders them inline.
 */
function MessageText({ text, isMe }: { text: string; isMe: boolean }) {
  // Build an array of { kind: "text" | "incident"; value: string }
  const parts: Array<{ kind: "text" | "incident"; value: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset lastIndex before each call (important for global regex)
  const regex = new RegExp(INCIDENT_ID_REGEX.source, "g");

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ kind: "text", value: text.slice(lastIndex, match.index) });
    }
    parts.push({ kind: "incident", value: match[1] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ kind: "text", value: text.slice(lastIndex) });
  }

  return (
    <span>
      {parts.map((part, i) =>
        part.kind === "incident" ? (
          <IncidentToken key={i} ticketId={part.value} isMe={isMe} />
        ) : (
          <span key={i}>{part.value}</span>
        ),
      )}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  member,
  size = 40,
  online = false,
}: {
  member: Member;
  size?: number;
  online?: boolean;
}) {
  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-semibold text-white select-none"
        style={{ background: avatarColor(member.id), fontSize: size * 0.36 }}
      >
        {initials(member)}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
      )}
    </div>
  );
}

// ─── Conversation list item ───────────────────────────────────────────────────

function ConvoItem({
  conversation,
  member,
  active,
  onClick,
}: {
  conversation: Conversation;
  member: Member;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
        active
          ? "bg-zinc-100 dark:bg-zinc-800"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      }`}
    >
      <Avatar member={member} size={42} online={conversation.online} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-[13.5px] font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {fullName(member)}
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 flex-shrink-0">
            {formatTime(conversation.lastAt)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 truncate flex-1">
            {conversation.lastMessage}
          </p>
          {conversation.unread > 0 && (
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              {conversation.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface MessagesModalProps {
  onClose: () => void;
  /** When set, opens straight into the conversation with this member instead of the first one in the list. */
  initialMemberId?: string;
}

function toMessage(m: DirectMessageRecord): Message {
  return { id: m.id, senderId: m.senderId, text: m.content, timestamp: new Date(m.createdAt) };
}

export default function MessagesModal({ onClose, initialMemberId }: MessagesModalProps) {
  const { user } = useAuthStore();
  const currentUserId = user?.id ?? "";
  const { data: members = [] } = useMember();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null); // memberId of the active conversation
  const [draft, setDraft] = useState("");
  const [typingMemberIds, setTypingMemberIds] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<ReturnType<typeof initSocket> | null>(null);
  const typingStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: summaries = [] } = useQuery<ConversationSummary[]>({
    queryKey: ["dm-conversations"],
    queryFn: fetchConversations,
    refetchOnWindowFocus: false,
  });

  // Conversations keyed by the conversation's real id, hydrated from the
  // summary list plus whatever messages have been fetched/received so far.
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, Message[]>>({});

  const conversations: Conversation[] = useMemo(
    () =>
      summaries.map((s) => ({
        id: s.id,
        memberId: s.otherUserId,
        messages: messagesByConversation[s.id] ?? [],
        lastMessage: s.lastMessage ?? "",
        lastAt: new Date(s.lastMessageAt),
        unread: s.unreadCount,
        online: s.online,
      })),
    [summaries, messagesByConversation]
  );

  const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  // Opening the modal targeting a specific member who doesn't have a
  // conversation yet — get-or-create it, then select it.
  useEffect(() => {
    if (!initialMemberId) return;
    const existing = summaries.find((s) => s.otherUserId === initialMemberId);
    if (existing) {
      setActiveId(initialMemberId);
      return;
    }
    void getOrCreateConversation(initialMemberId).then(() => {
      setActiveId(initialMemberId);
      void queryClient.invalidateQueries({ queryKey: ["dm-conversations"] });
    });
  }, [initialMemberId, summaries, queryClient]);

  useEffect(() => {
    if (!activeId && summaries.length) {
      setActiveId(summaries[0].otherUserId);
    }
  }, [activeId, summaries]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, messagesByConversation]);

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => {
      const m = memberMap.get(c.memberId);
      return m && (fullName(m).toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
    });
  }, [conversations, search, memberMap]);

  const activeConvo = conversations.find((c) => c.memberId === activeId);
  const activeMember = activeId ? memberMap.get(activeId) : undefined;

  // Fetch message history + join the socket room once a conversation becomes active.
  useEffect(() => {
    if (!activeConvo?.id) return;
    const conversationId = activeConvo.id;

    void fetchConversationMessages(conversationId).then((records) => {
      setMessagesByConversation((prev) => ({ ...prev, [conversationId]: records.map(toMessage) }));
    });
    void markConversationRead(conversationId).then(() => {
      void queryClient.invalidateQueries({ queryKey: ["dm-conversations"] });
    });

    const socket = socketRef.current;
    if (!socket) return;
    socket.emit("dm:join", { conversationId });
    socket.emit("dm:read", { conversationId });

    return () => {
      socket.emit("dm:leave", { conversationId });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvo?.id]);

  // One socket connection for the whole modal — message delivery, typing,
  // and online-status updates all flow through it for as long as it's open.
  useEffect(() => {
    const socket = initSocket();
    socketRef.current = socket;

    const handleMessage = (payload: { conversationId: string; message: DirectMessageRecord }) => {
      setMessagesByConversation((prev) => {
        const existing = prev[payload.conversationId] ?? [];
        if (existing.some((m) => m.id === payload.message.id)) return prev;
        return { ...prev, [payload.conversationId]: [...existing, toMessage(payload.message)] };
      });
      void queryClient.invalidateQueries({ queryKey: ["dm-conversations"] });
    };

    const handleTypingStart = (payload: { conversationId: string; userId: string }) => {
      setTypingMemberIds((prev) => new Set(prev).add(payload.userId));
    };
    const handleTypingStop = (payload: { conversationId: string; userId: string }) => {
      setTypingMemberIds((prev) => {
        const next = new Set(prev);
        next.delete(payload.userId);
        return next;
      });
    };
    const handlePresenceChange = () => {
      void queryClient.invalidateQueries({ queryKey: ["dm-conversations"] });
    };

    socket.on("dm:message", handleMessage);
    socket.on("dm:typing_started", handleTypingStart);
    socket.on("dm:typing_stopped", handleTypingStop);
    socket.on("presence:online", handlePresenceChange);
    socket.on("presence:offline", handlePresenceChange);

    return () => {
      socket.off("dm:message", handleMessage);
      socket.off("dm:typing_started", handleTypingStart);
      socket.off("dm:typing_stopped", handleTypingStop);
      socket.off("presence:online", handlePresenceChange);
      socket.off("presence:offline", handlePresenceChange);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = () => {
    const text = draft.trim();
    const conversationId = activeConvo?.id;
    if (!text || !conversationId || !socketRef.current) return;

    socketRef.current.emit("dm:send", { conversationId, content: text });
    socketRef.current.emit("dm:typing_stop", { conversationId });
    setDraft("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
      return;
    }

    const conversationId = activeConvo?.id;
    if (!conversationId || !socketRef.current) return;
    socketRef.current.emit("dm:typing_start", { conversationId });
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
    typingStopTimer.current = setTimeout(() => {
      socketRef.current?.emit("dm:typing_stop", { conversationId });
    }, 2000);
  };

  const isActivePartnerTyping = activeId ? typingMemberIds.has(activeId) : false;
  const groups = activeConvo ? groupByDay(activeConvo.messages) : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative flex w-full max-w-[900px] h-[90vh] max-h-[680px] rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/60 mx-4">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <X size={15} />
        </button>

        {/* ══ LEFT ══════════════════════════════════════════════════════════ */}
        <div className="w-[320px] flex-shrink-0 flex flex-col border-r border-zinc-100 dark:border-zinc-800">
          <div className="px-5 pt-5 pb-4">
            <h2 className="text-[18px] font-bold text-emerald-600 dark:text-emerald-400 mb-3.5">
              Messages
            </h2>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                placeholder="Search team..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[13px] text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-50 dark:divide-zinc-800/60">
            {filtered.length === 0 && (
              <p className="px-5 py-8 text-[13px] text-zinc-400 dark:text-zinc-500 text-center">
                No conversations found.
              </p>
            )}
            {filtered.map((convo) => {
              const m = memberMap.get(convo.memberId);
              if (!m) return null;
              return (
                <ConvoItem
                  key={convo.memberId}
                  conversation={convo}
                  member={m}
                  active={activeId === convo.memberId}
                  onClick={() => setActiveId(convo.memberId)}
                />
              );
            })}
          </div>
        </div>

        {/* ══ RIGHT ═════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeMember ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <Avatar member={activeMember} size={36} online={activeConvo?.online} />
                <div>
                  <p className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {fullName(activeMember)}
                    {activeMember.role && (
                      <span className="ml-1.5 text-[12px] font-normal text-zinc-400 dark:text-zinc-500">
                        — {activeMember.role}
                      </span>
                    )}
                  </p>
                  <p
                    className={`text-[11.5px] font-medium ${activeConvo?.online ? "text-emerald-500" : "text-zinc-400 dark:text-zinc-500"}`}
                  >
                    {activeConvo?.online ? "Active now" : "Offline"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {groups.map((group) => (
                  <div key={group.label}>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                      <span className="text-[10.5px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500">
                        {group.label}
                      </span>
                      <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                    </div>

                    <div className="space-y-3">
                      {group.messages.map((msg) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`max-w-[75%] px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed ${
                                isMe
                                  ? "bg-emerald-600 dark:bg-emerald-700 text-white rounded-br-sm"
                                  : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-700 rounded-bl-sm"
                              }`}
                            >
                              {/* ← Rich text renderer with incident ID detection */}
                              <MessageText text={msg.text} isMe={isMe} />
                            </div>
                            <div
                              className={`flex items-center gap-1 mt-1 ${isMe ? "flex-row-reverse" : ""}`}
                            >
                              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                                {formatTime(msg.timestamp)}
                              </span>
                              {isMe && (
                                <svg
                                  width="13"
                                  height="9"
                                  viewBox="0 0 13 9"
                                  fill="none"
                                  className="text-emerald-500"
                                >
                                  <path
                                    d="M1 4.5L4.5 8L12 1"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {isActivePartnerTyping && (
                <p className="px-5 pb-1 text-[11.5px] text-zinc-400 dark:text-zinc-500 italic">
                  {fullName(activeMember)} is typing…
                </p>
              )}

              {/* Input */}
              <div className="px-4 py-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-end gap-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 focus-within:border-zinc-300 dark:focus-within:border-zinc-600 transition-colors">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    placeholder="Type a message... (try SI-W27PHJ7)"
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none resize-none text-[13.5px] text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 py-0.5 leading-relaxed max-h-[120px]"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!draft.trim()}
                    className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-700 disabled:text-zinc-400 dark:disabled:text-zinc-500 text-white flex items-center justify-center flex-shrink-0 transition-colors mb-0.5"
                  >
                    <Send size={15} />
                  </button>
                </div>
                <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500 mt-1.5 pl-1">
                  Enter to send · Shift+Enter for new line · Incident IDs (e.g.
                  SI-W27PHJ7) are auto-linked
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Send size={20} className="text-zinc-400" />
              </div>
              <p className="text-[14px] font-semibold text-zinc-700 dark:text-zinc-300">
                No conversation selected
              </p>
              <p className="text-[13px] text-zinc-400 dark:text-zinc-500">
                Pick a team member from the list to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
