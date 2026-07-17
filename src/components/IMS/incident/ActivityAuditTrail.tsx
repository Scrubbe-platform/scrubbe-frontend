"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

// 1. ── DIRECT IMPORTS (Adjust these paths to match your project) ──
import {
  IncidentHistoryRecord,
  IncidentCommentRecord,
} from "@/lib/incident/incident.types";
import useAuthStore from "@/lib/stores/auth.store";
import { querykeys } from "@/lib/constant";
import { fetchIncidentComments } from "@/lib/incident/incident.api";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";

// ── Types ────────────────────────────────────────────────────────

interface AuditTrailEntry {
  id: string;
  actor: string;
  initial: string;
  color: string;
  sortTime: number; // Normalized timestamp for unified chronological sorting
  formattedTime: string;
  action: string;
  content: string;
  isOwn: boolean;
  isComment: boolean;
}

const ACTION_LABELS: Record<string, string> = {
  created: "created this incident",
  status_changed: "changed the status",
  updated: "updated the incident",
  resolved: "resolved this incident",
  comment_added: "added a comment",
  assigned: "assigned the incident",
  severity_changed: "changed the severity",
  priority_changed: "changed the priority",
  acknowledged: "acknowledged the incident",
  escalated: "escalated the incident",
};

// ── Helpers ──────────────────────────────────────────────────────

const PALETTE = [
  "#059669",
  "#9333ea",
  "#2563eb",
  "#d97706",
  "#e11d48",
  "#0d9488",
  "#4f46e5",
  "#db2777",
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    const isToday = date.toDateString() === now.toDateString();
    const time = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    let relative = "";
    if (diffMin < 1) relative = "just now";
    else if (diffMin < 60) relative = `${diffMin}m ago`;
    else if (diffMin < 1440) relative = `${Math.floor(diffMin / 60)}h ago`;
    else relative = `${Math.floor(diffMin / 1440)}d ago`;

    const prefix = isToday
      ? "Today"
      : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

    return `${prefix} at ${time} · ${relative}`;
  } catch {
    return ts;
  }
}

// ── Comment Card Component ───────────────────────────────────────

function CommentCard({
  entry,
  onDelete,
}: {
  entry: AuditTrailEntry;
  onDelete?: (id: string) => void;
}) {
  return (
    <div
      className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 px-4 py-3.5"
      style={{ borderLeftWidth: 3, borderLeftColor: entry.color }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold"
          style={{ backgroundColor: entry.color }}
        >
          {entry.initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">
              {entry.actor}
            </span>
            {entry.isOwn && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                you
              </span>
            )}
            {!entry.isComment && (
              <span className="text-[12px] text-zinc-500 dark:text-zinc-400">
                {entry.action}
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
            {entry.formattedTime}
          </p>
        </div>

        {/* {entry.isComment && entry.isOwn && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            className="p-1.5 rounded-md text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )} */}
      </div>

      {entry.content && (
        <p className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-[1.7] whitespace-pre-wrap">
          {entry.content?.split("_")?.join(" ")}
        </p>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────

interface ActivityAuditTrailProps {
  ticket: {
    id: string;
    comments?: IncidentCommentRecord[];
    history?: IncidentHistoryRecord[]; // 👈 Extracted from here instead of separate prop
  };
}

const ActivityAuditTrail: React.FC<ActivityAuditTrailProps> = ({ ticket }) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [comment, setComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { post } = useFetch();

  // Fallbacks for current user information
  const currentUserFullName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Local User";
  const currentUserInitials = getInitials(currentUserFullName) || "LU";

  const queryKey = [querykeys.COMMENTS, ticket.id];

  // 1. Fetch Comments Query Hook
  const { data: comments = [] } = useQuery<IncidentCommentRecord[]>({
    queryKey,
    queryFn: async () => fetchIncidentComments(ticket.id),
    initialData: ticket.comments ?? [],
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: true,
    enabled: !!ticket.id,
  });

  // 2. Submit Comments Mutation Hook (Optimistic Updates)
  const { mutateAsync: sendCommentMutation, isPending } = useMutation({
    mutationFn: async (content: string) => {
      const res = await post(endpoint.incident_ticket.send_comment, {
        ticketId: ticket.id,
        content,
      });
      return res.data;
    },
    onMutate: async (newCommentContent) => {
      await queryClient.cancelQueries({ queryKey });
      const previousComments =
        queryClient.getQueryData<IncidentCommentRecord[]>(queryKey);

      queryClient.setQueryData<IncidentCommentRecord[]>(queryKey, (oldData) => [
        ...(oldData ?? []),
        {
          id: `local-${Date.now()}`,
          content: newCommentContent,
          createdAt: new Date().toISOString(),
          isInternal: false,
          author: {
            id: user?.id ?? "local-user",
            firstName: user?.firstName ?? "",
            lastName: user?.lastName ?? "",
            profileImage: user?.profileImage ?? null,
          },
        },
      ]);

      setComment(""); // Optimistically clear input immediately
      return { previousComments };
    },
    onError: (_err, __, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(queryKey, context.previousComments);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // 3. Merges and Chronologically Sorts History Logs + Live Comments
  const blendedEntries = useMemo(() => {
    const historyList = ticket.history ?? [];

    const parsedHistory: AuditTrailEntry[] = historyList.map((event) => {
      const name = event.actor || "System";
      const actionLabel =
        ACTION_LABELS[event.action] || event.action.replace(/_/g, " ");

      let content = "";
      if (event.action === "comment_added") {
        content = event.comment || "";
      } else if (event.oldValue && event.newValue) {
        content = `${event?.action || "Field"}: ${event.oldValue} → ${event.newValue}`;
      } else if (event.newValue) {
        content = `${event?.action || "Value"}: ${event.newValue}`;
      } else if (event.comment) {
        content = event.comment;
      }

      return {
        id: event.id,
        actor: name,
        initial: getInitials(name) || "SYS",
        color: getColor(name),
        sortTime: new Date(event.timestamp).getTime() || 0,
        formattedTime: formatTimestamp(event.timestamp),
        action: actionLabel,
        content,
        isOwn: name === currentUserFullName,
        isComment: event.action === "comment_added",
      };
    });

    const parsedComments: AuditTrailEntry[] = comments.map((comm) => {
      const name =
        `${comm.author.firstName} ${comm.author.lastName}`.trim() ||
        "Unknown Author";
      return {
        id: comm.id,
        actor: name,
        initial: getInitials(name) || "UN",
        color: getColor(name),
        sortTime: new Date(comm.createdAt).getTime() || 0,
        formattedTime: formatTimestamp(comm.createdAt),
        action: "added a comment",
        content: comm.content,
        isOwn: comm.author.id === user?.id || name === currentUserFullName,
        isComment: true,
      };
    });

    // Merge both streams & sort by descending timestamp (newest first)
    return [...parsedHistory, ...parsedComments].sort(
      (a, b) => b.sortTime - a.sortTime,
    );
  }, [ticket.history, comments, currentUserFullName, user?.id]);

  const handleAddComment = async () => {
    const text = comment.trim();
    if (!text || isPending) return;
    try {
      await sendCommentMutation(text);
    } catch (err) {
      console.error("Mutation failed:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const hasMore = blendedEntries.length > 4;
  const visibleEntries = isExpanded
    ? blendedEntries
    : blendedEntries.slice(0, 4);

  return (
    <div className="w-full mx-auto p-4 font-ibm ">
      <div className="space-y-3">
        {/* Input area */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="flex items-start gap-3 p-4 pb-0">
            <div
              className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold mt-0.5"
              style={{ backgroundColor: getColor(currentUserFullName) }}
            >
              {currentUserInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100">
                  {currentUserFullName}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                  you
                </span>
              </div>
            </div>
          </div>
          <div className="px-4 pb-3 pt-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a comment..."
              rows={3}
              disabled={isPending}
              className="w-full text-[13px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 bg-transparent resize-none outline-none leading-[1.7] disabled:opacity-50"
            />
            <div className="flex items-center justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleAddComment}
                disabled={!comment.trim() || isPending}
                className="rounded-md border border-emerald-600 px-4 py-1.5 text-[12px] font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? "Adding..." : "Add Comment"}
              </button>
            </div>
          </div>
        </div>

        {/* Trail Feed List */}
        {visibleEntries.length > 0 ? (
          <>
            {visibleEntries.map((entry) => (
              <CommentCard key={entry.id} entry={entry} />
            ))}

            {hasMore && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600 hover:text-emerald-700 py-2 px-4 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      Show less <ChevronUp size={15} />
                    </>
                  ) : (
                    <>
                      Load more ({blendedEntries.length - 4}){" "}
                      <ChevronDown size={15} />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg py-8 text-center text-sm text-zinc-400">
            No activity yet. Add a comment to start.
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityAuditTrail;
