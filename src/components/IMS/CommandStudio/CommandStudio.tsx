/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  BookOpen,
  ShieldCheck,
  Send,
  X,
  MoreVertical,
  Pin,
  PencilLine,
  Archive,
  Share2,
  Download,
  Trash2,
  Sparkles,
  ChevronRight,
  MessageSquare,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/IMS/DashboardHeader";
import Modal from "@/components/ui/Modal";
import { useCurrentUser, User } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import {
  AuditEntry,
  BASE_SUGGESTIONS,
  CONVERSATION_SEEDS,
  ConvGroup,
  ConversationSeed,
  GOV_PROMPTS,
  GROUP_ORDER,
  INITIAL_AUDIT,
  NBItem,
  PROMPT_LIBRARY,
  USER,
  incidentFromText,
  openIncidentIds,
  serviceFromText,
} from "./data";
import {
  INTENTS,
  MATCH_ORDER,
  callable,
  entityObj,
  matchIntent,
} from "./intents";
import { CardHandlers, EntityPickCard, RestartClarifyCard } from "./cards";

// ── turn model ────────────────────────────────────────────────────────

type UserTurn = { id: string; kind: "user"; text: string };
type AckTurn = { id: string; kind: "ack"; text: string };
type ClarifyEntityTurn = {
  id: string;
  kind: "clarifyEntity";
  intentId: string;
  entityType: "incident" | "service";
};
type ClarifyRestartTurn = {
  id: string;
  kind: "clarifyRestart";
  target: string;
};
type EzraTurn = {
  id: string;
  kind: "ezra";
  intentId: string;
  entityType?: "incident" | "service" | null;
  entityId?: string | null;
  entityTarget?: string;
  status: "thinking" | "done";
  revealed: number;
};
type ApiTurn = {
  id: string;
  kind: "api";
  status: "thinking" | "done";
  text: string;
  actions: { type: string; label: string; data: Record<string, unknown> }[];
  suggestedFollowUps: string[];
};
type Turn =
  | UserTurn
  | AckTurn
  | ClarifyEntityTurn
  | ClarifyRestartTurn
  | EzraTurn
  | ApiTurn;

interface Conversation {
  id: string;
  title: string;
  group: ConvGroup;
  meta: string;
  pin?: boolean;
  live?: boolean;
  fresh?: boolean;
  focus: { incident: string | null; service: string | null };
  turns: Turn[];
}

// ── helpers ───────────────────────────────────────────────────────────

let seq = 0;
const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function nowStamp() {
  const d = new Date();
  return `today · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function titleFrom(text: string) {
  let t = text.trim().replace(/\s+/g, " ");
  if (t.length > 40) t = t.slice(0, 40).replace(/\s\S*$/, "") + "…";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function entOf(turn: EzraTurn): any {
  return turn.entityTarget !== undefined
    ? turn.entityTarget
    : entityObj(turn.entityType ?? null, turn.entityId ?? null);
}

function buildSeedConversation(def: ConversationSeed): Conversation {
  const focus = {
    incident: null as string | null,
    service: null as string | null,
  };
  const turns: Turn[] = [];
  (def.seed ?? []).forEach((step) => {
    turns.push({ id: newId("t"), kind: "user", text: step.u });
    const intent = INTENTS[step.i];
    let entityId: string | null = null;
    if (intent.entity && step.ent) {
      entityId = step.ent;
      if (intent.entity === "incident") {
        focus.incident = step.ent;
        const inc = entityObj("incident", step.ent) as any;
        focus.service = inc?.service ?? focus.service;
      } else {
        focus.service = step.ent;
      }
    }
    const ent = entOf({ entityType: intent.entity, entityId } as EzraTurn);
    const steps = callable(intent.reason, ent) ?? [];
    turns.push({
      id: newId("t"),
      kind: "ezra",
      intentId: step.i,
      entityType: intent.entity,
      entityId,
      status: "done",
      revealed: steps.length,
    });
  });
  return {
    id: newId("c"),
    title: def.title,
    group: def.group,
    meta: def.meta,
    pin: def.pin,
    live: def.live,
    fresh: false,
    focus,
    turns,
  };
}

// ── component ─────────────────────────────────────────────────────────

export default function CommandStudio() {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    CONVERSATION_SEEDS.map(buildSeedConversation),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [convFilter, setConvFilter] = useState("");
  const [audit, setAudit] = useState<AuditEntry[]>(INITIAL_AUDIT);
  const [input, setInput] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [modal, setModal] = useState<
    | { kind: "none" }
    | { kind: "palette" }
    | { kind: "library" }
    | { kind: "audit" }
    | { kind: "convMenu"; id: string }
    | { kind: "rename"; id: string }
    | { kind: "share"; id: string }
    | { kind: "exportConv"; id: string }
    | { kind: "delete"; id: string }
  >({ kind: "none" });

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { post } = useFetch();

  const { execute: getUser } = useCurrentUser();
  const [currentUser, setCurrentUser] = useState<User | null>();

  useEffect(() => {
    (async () => {
      const resp = await getUser();
      setCurrentUser(resp as User);
    })();
  }, []);

  const currentUserName =
    [currentUser?.firstName, currentUser?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || USER;
  const currentUserInitials =
    (
      (currentUser?.firstName?.[0] ?? "") + (currentUser?.lastName?.[0] ?? "")
    ).toUpperCase() || "U";

  const activeConv = conversations.find((c) => c.id === activeId);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversations, activeId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setModal((m) =>
          m.kind === "none" ? { kind: "palette" } : { kind: "none" },
        );
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1700);
  }

  function addAudit(action: string, result: string) {
    setAudit((prev) => [
      { actor: currentUserName, action, result, when: nowStamp() },
      ...prev,
    ]);
  }

  function updateConv(id: string, fn: (c: Conversation) => Conversation) {
    setConversations((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));
  }

  function appendTurn(convId: string, turn: Turn) {
    updateConv(convId, (c) => ({ ...c, turns: [...c.turns, turn] }));
  }

  function setFocus(convId: string, type: "incident" | "service", id: string) {
    updateConv(convId, (c) => {
      const focus = { ...c.focus };
      if (type === "incident") {
        focus.incident = id;
        const inc = entityObj("incident", id) as any;
        focus.service = inc?.service ?? focus.service;
      } else {
        focus.service = id;
      }
      return { ...c, focus };
    });
  }

  // ── sending / dispatch ────────────────────────────────────────────

  function send(rawText: string) {
    const text = rawText.trim();
    if (!text) return;
    let convId = activeId;
    const exists = convId ? conversations.some((c) => c.id === convId) : false;
    if (!convId || !exists) {
      convId = newId("c");
      const conv: Conversation = {
        id: convId,
        title: titleFrom(text),
        group: "Today",
        meta: "just now",
        fresh: false,
        focus: { incident: null, service: null },
        turns: [],
      };
      setConversations((prev) => [conv, ...prev]);
      setActiveId(convId);
    } else {
      updateConv(convId, (c) =>
        c.fresh && c.title === "New conversation"
          ? {
              ...c,
              title: titleFrom(text),
              meta: "just now",
              fresh: false,
              live: false,
            }
          : c,
      );
    }
    appendTurn(convId, { id: newId("t"), kind: "user", text });
    dispatch(convId, text);
  }

  function dispatch(convId: string, text: string) {
    void runApiIntent(convId, text);
  }

  async function runApiIntent(convId: string, text: string) {
    const turnId = newId("t");
    const conv = conversations.find((c) => c.id === convId);

    // Build conversation history from existing turns (last 10)
    const historyTurns = (conv?.turns ?? []).slice(-20);
    const conversationHistory: { role: "user" | "assistant"; content: string }[] = [];
    for (const t of historyTurns) {
      if (t.kind === "user") conversationHistory.push({ role: "user", content: t.text });
      else if (t.kind === "api" && t.status === "done") conversationHistory.push({ role: "assistant", content: t.text });
      else if (t.kind === "ack") conversationHistory.push({ role: "assistant", content: t.text });
    }

    appendTurn(convId, {
      id: turnId,
      kind: "api",
      status: "thinking",
      text: "",
      actions: [],
      suggestedFollowUps: [],
    });

    const context = {
      incidentId: conv?.focus.incident ?? undefined,
      serviceId: conv?.focus.service ?? undefined,
    };

    const resp = await post(endpoint.command_studio.chat, {
      message: text,
      conversationHistory: conversationHistory.slice(-10),
      context,
    });

    if (resp.success && resp.data) {
      const data = resp.data as {
        text: string;
        actions: { type: string; label: string; data: Record<string, unknown> }[];
        suggestedFollowUps: string[];
      };
      updateConv(convId, (c) => ({
        ...c,
        turns: c.turns.map((t) =>
          t.id === turnId && t.kind === "api"
            ? { ...t, status: "done" as const, text: data.text, actions: data.actions ?? [], suggestedFollowUps: data.suggestedFollowUps ?? [] }
            : t,
        ),
      }));
    } else {
      const errMsg = typeof resp.data === "string" ? resp.data : "Ezra encountered an error. Please try again.";
      updateConv(convId, (c) => ({
        ...c,
        turns: c.turns.map((t) =>
          t.id === turnId && t.kind === "api"
            ? { ...t, status: "done" as const, text: errMsg, actions: [], suggestedFollowUps: [] }
            : t,
        ),
      }));
    }
  }

  async function runIntent(
    convId: string,
    intentId: string,
    entityType: "incident" | "service" | null,
    entityId: string | null,
    overrideTarget?: string,
  ) {
    const intent = INTENTS[intentId];
    const ent =
      overrideTarget !== undefined
        ? overrideTarget
        : entityObj(entityType, entityId);
    const turnId = newId("t");
    appendTurn(convId, {
      id: turnId,
      kind: "ezra",
      intentId,
      entityType,
      entityId,
      entityTarget: overrideTarget,
      status: "thinking",
      revealed: 0,
    });
    const steps = callable(intent.reason, ent) ?? [];
    for (let k = 0; k < steps.length; k++) {
      await sleep(220);
      updateConv(convId, (c) => ({
        ...c,
        turns: c.turns.map((t) =>
          t.id === turnId && t.kind === "ezra" ? { ...t, revealed: k + 1 } : t,
        ),
      }));
    }
    await sleep(200);
    if (intent.auditOnRun)
      addAudit(intent.auditOnRun.action, intent.auditOnRun.result);
    updateConv(convId, (c) => ({
      ...c,
      turns: c.turns.map((t) =>
        t.id === turnId && t.kind === "ezra" ? { ...t, status: "done" } : t,
      ),
    }));
  }

  function handlePickEntity(
    convId: string,
    intentId: string,
    entityType: "incident" | "service",
    entId: string,
    label: string,
  ) {
    appendTurn(convId, { id: newId("t"), kind: "user", text: label });
    setFocus(convId, entityType, entId);
    if (intentId === "restart") {
      appendTurn(convId, {
        id: newId("t"),
        kind: "clarifyRestart",
        target: entId,
      });
    } else {
      void runIntent(convId, intentId, entityType, entId);
    }
  }

  function handleConfirmRestart(
    convId: string,
    target: string,
    env: string,
    cluster: string,
  ) {
    appendTurn(convId, {
      id: newId("t"),
      kind: "user",
      text: `${env} · ${cluster}`,
    });
    void runIntent(
      convId,
      "restartPreview",
      null,
      null,
      `${target} · ${cluster}`,
    );
  }

  function makeHandlers(convId: string): CardHandlers {
    return {
      onSend: (t: string) => send(t),
      onAck: (text: string, entry?: { action: string; result: string }) => {
        appendTurn(convId, { id: newId("t"), kind: "ack", text });
        if (entry) addAudit(entry.action, entry.result);
        showToast("Done");
      },
      onToast: (msg: string, entry?: { action: string; result: string }) => {
        showToast(msg);
        if (entry) addAudit(entry.action, entry.result);
      },
      onOpenAudit: () => setModal({ kind: "audit" }),
    };
  }

  // ── conversation list actions ─────────────────────────────────────

  function newConversation() {
    const existingFresh = conversations.find(
      (c) => c.fresh && c.turns.length === 0,
    );
    if (existingFresh) {
      setActiveId(existingFresh.id);
      return;
    }
    const conv: Conversation = {
      id: newId("c"),
      title: "New conversation",
      group: "Today",
      meta: "now",
      fresh: true,
      focus: { incident: null, service: null },
      turns: [],
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setConvFilter("");
  }

  function togglePin(id: string) {
    const c = conversations.find((x) => x.id === id);
    if (!c) return;
    const willPin = c.group !== "Pinned";
    updateConv(id, (conv) => ({
      ...conv,
      group: willPin ? "Pinned" : "Today",
      pin: willPin,
      meta: willPin ? "pinned" : "just now",
    }));
    addAudit(
      `${willPin ? "Pinned" : "Unpinned"} conversation · ${c.title}`,
      "Allowed",
    );
    setModal({ kind: "none" });
    showToast(willPin ? "Pinned" : "Unpinned");
  }

  function toggleArchive(id: string) {
    const c = conversations.find((x) => x.id === id);
    if (!c) return;
    const willArchive = c.group !== "Archived";
    updateConv(id, (conv) => ({
      ...conv,
      group: willArchive ? "Archived" : "Today",
      pin: false,
      meta: willArchive ? "archived" : "just now",
    }));
    addAudit(
      `${willArchive ? "Archived" : "Unarchived"} conversation · ${c.title}`,
      "Allowed",
    );
    setModal({ kind: "none" });
    showToast(willArchive ? "Archived" : "Unarchived");
  }

  function renameConversation(id: string, value: string) {
    const v = value.trim();
    if (!v) return;
    updateConv(id, (conv) => ({ ...conv, title: v, fresh: false }));
    addAudit(`Renamed conversation → ${v}`, "Allowed");
    setModal({ kind: "none" });
    showToast("Renamed");
  }

  function deleteConversation(id: string) {
    const c = conversations.find((x) => x.id === id);
    if (!c) return;
    const wasActive = activeId === id;
    const remaining = conversations.filter((x) => x.id !== id);
    setConversations(remaining);
    addAudit(`Deleted conversation · ${c.title}`, "Allowed");
    setModal({ kind: "none" });
    showToast("Deleted");
    if (wasActive) setActiveId(remaining[0]?.id ?? null);
  }

  // ── suggestions ───────────────────────────────────────────────────

  const suggestions: NBItem[] = useMemo(() => {
    if (!activeConv)
      return BASE_SUGGESTIONS.map((s) => ({ label: s, send: s }));
    for (let i = activeConv.turns.length - 1; i >= 0; i--) {
      const t = activeConv.turns[i];
      if (t.kind === "api" && t.status === "done" && t.suggestedFollowUps.length > 0) {
        return t.suggestedFollowUps.map((s) => ({ label: s, send: s }));
      }
      if (t.kind === "clarifyEntity" || t.kind === "clarifyRestart")
        return BASE_SUGGESTIONS.map((s) => ({ label: s, send: s }));
      if (t.kind === "ezra" && t.status === "done") {
        const intent = INTENTS[t.intentId];
        const next = callable(intent.next, entOf(t));
        return next && next.length
          ? next
          : BASE_SUGGESTIONS.map((s) => ({ label: s, send: s }));
      }
    }
    return BASE_SUGGESTIONS.map((s) => ({ label: s, send: s }));
  }, [activeConv]);

  // ── render ─────────────────────────────────────────────────────────

  const showHero = !activeConv || activeConv.turns.length === 0;
  const filteredConvs = conversations.filter(
    (c) =>
      !convFilter.trim() ||
      c.title.toLowerCase().includes(convFilter.trim().toLowerCase()),
  );

  function autosize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  return (
    <div className="flex h-screen flex-col font-ibm dark:bg-zinc-950">
      <Header title="Command Studio" />

      <div className="flex items-center justify-end border-t border-zinc-200 gap-2 bg-white px-4 py-2.5 shadow-sm shadow-light dark:bg-zinc-950 sm:px-6">
        <button
          onClick={() => setModal({ kind: "palette" })}
          className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-[12.5px] text-black transition-colors hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-300 dark:hover:border-emerald-500/50 dark:hover:text-emerald-400"
        >
          <Search size={14} /> Search &amp; commands
          <span className="rounded border border-zinc-300 px-1.5 py-0.5 font-mono text-[10px] text-black dark:border-zinc-700 dark:text-zinc-500">
            ⌘K
          </span>
        </button>
        <button
          onClick={() => setModal({ kind: "library" })}
          title="Team prompt library"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 text-black transition-colors hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-emerald-500/50 dark:hover:text-emerald-400"
        >
          <BookOpen size={15} />
        </button>
        <button
          onClick={() => setModal({ kind: "audit" })}
          title="Audit log"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 text-black transition-colors hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-emerald-500/50 dark:hover:text-emerald-400"
        >
          <ShieldCheck size={15} />
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 sm:p-5 lg:grid-cols-[360px_1fr]">
        {/* Conversations sidebar */}
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl bg-white shadow-sm shadow-light dark:bg-zinc-900/40">
          <div className="space-y-2.5 p-3">
            <button
              onClick={newConversation}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-emerald-700"
            >
              <Plus size={15} /> New conversation
            </button>
            <div className="relative">
              <Search
                size={13}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-black dark:text-zinc-500"
              />
              <input
                value={convFilter}
                onChange={(e) => setConvFilter(e.target.value)}
                placeholder="Search conversations…"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pl-8 pr-2.5 text-[12.5px] text-black placeholder:text-zinc-400 focus:border-emerald-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200"
              />
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto px-2 pb-4">
            {!filteredConvs.length && (
              <p className="px-2.5 py-4 text-[12.5px] text-black dark:text-zinc-500">
                No conversations match <b>“{convFilter}”</b>.
              </p>
            )}
            {GROUP_ORDER.map((group) => {
              const items = filteredConvs.filter((c) => c.group === group);
              if (!items.length) return null;
              return (
                <div key={group}>
                  <div className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
                    {group}
                  </div>
                  {items.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          setActiveId(c.id);
                      }}
                      className={cn(
                        "group relative cursor-pointer rounded-lg px-2.5 py-2 pr-7",
                        c.id === activeId
                          ? "bg-emerald-50 dark:bg-emerald-500/10"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60",
                      )}
                    >
                      <div
                        className={cn(
                          "truncate text-[13px] text-black dark:text-zinc-200",
                          c.id === activeId && "font-semibold",
                        )}
                      >
                        {c.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10.5px] text-black dark:text-zinc-500">
                        {c.pin && (
                          <Pin
                            size={9}
                            className="text-emerald-600 dark:text-emerald-400"
                          />
                        )}
                        {c.live && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        )}
                        {c.pin ? "pinned" : c.live ? "live" : c.meta}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModal({ kind: "convMenu", id: c.id });
                        }}
                        className="absolute right-1 top-1.5 flex h-6 w-6 items-center justify-center rounded text-black opacity-0 transition-opacity hover:bg-zinc-200 group-hover:opacity-100 dark:text-zinc-500 dark:hover:bg-zinc-700"
                      >
                        <MoreVertical size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Thread + composer */}
        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl bg-white shadow-sm shadow-light dark:bg-zinc-900/40">
          <div className="flex-1 overflow-y-auto px-5 py-2 sm:px-8">
            {showHero ? (
              <div className="mx-auto max-w-2xl py-8">
                <h1 className="mb-2.5 mt-5 text-[30px] font-semibold leading-tight tracking-tight text-black dark:text-zinc-100">
                  {greeting()}, {currentUser?.firstName || "there"}.
                </h1>
                <p className="mb-6 max-w-md text-[15px] text-black dark:text-zinc-400">
                  Ask me to create incidents, set up integrations, run analysis,
                  or get any information about your production estate — I have
                  access to everything in your tenant.
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {BASE_SUGGESTIONS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-left text-[13.5px] text-black transition-colors hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-zinc-800 dark:bg-transparent dark:text-zinc-200 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/5"
                    >
                      {p}
                      <ChevronRight
                        size={14}
                        className="shrink-0 text-black dark:text-zinc-500"
                      />
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setModal({ kind: "library" })}
                  className="mt-4 flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  <BookOpen size={13} /> Browse the team prompt library →
                </button>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl">
                {activeConv?.turns.map((turn) => {
                  const convId = activeConv.id;
                  if (turn.kind === "user") {
                    return (
                      <div
                        key={turn.id}
                        className="flex justify-end gap-3 py-3"
                      >
                        <div className="max-w-[78%] rounded-2xl rounded-br-sm border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-[14px] text-black dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-100">
                          {turn.text}
                        </div>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-300 font-mono text-[11px] font-semibold text-black dark:border-zinc-700 dark:text-zinc-300">
                          DO
                        </div>
                      </div>
                    );
                  }
                  if (turn.kind === "ack") {
                    return (
                      <div key={turn.id} className="flex gap-3 py-3">
                        <EzraAvatar />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-black dark:text-zinc-500">
                            Ezra
                          </div>
                          <p className="max-w-md text-[14px] text-black dark:text-zinc-200">
                            {turn.text}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  if (turn.kind === "clarifyEntity") {
                    const label =
                      turn.entityType === "incident"
                        ? `Which incident do you mean? ${openIncidentIds().length} are open right now.`
                        : "Which service do you mean?";
                    return (
                      <div key={turn.id} className="flex gap-3 py-3">
                        <EzraAvatar />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-black dark:text-zinc-500">
                            Ezra
                          </div>
                          <p className="max-w-md text-[14px] text-black dark:text-zinc-200">
                            {label}
                          </p>
                          <EntityPickCard
                            entityType={turn.entityType}
                            onPick={(id, lbl) =>
                              handlePickEntity(
                                convId,
                                turn.intentId,
                                turn.entityType,
                                id,
                                lbl,
                              )
                            }
                          />
                        </div>
                      </div>
                    );
                  }
                  if (turn.kind === "clarifyRestart") {
                    return (
                      <div key={turn.id} className="flex gap-3 py-3">
                        <EzraAvatar />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-black dark:text-zinc-500">
                            Ezra
                          </div>
                          <RestartClarifyCard
                            target={turn.target}
                            onConfirm={(env, cluster) =>
                              handleConfirmRestart(
                                convId,
                                turn.target,
                                env,
                                cluster,
                              )
                            }
                          />
                        </div>
                      </div>
                    );
                  }
                  // api turn — real backend response
                  if (turn.kind === "api") {
                    return (
                      <div key={turn.id} className="flex gap-3 py-4">
                        <EzraAvatar />
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-black dark:text-zinc-500">
                            Ezra
                          </div>
                          {turn.status === "thinking" ? (
                            <div className="mb-2.5 max-w-sm rounded-lg bg-zinc-50 px-3.5 py-2.5 dark:bg-zinc-900/60">
                              <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-black dark:text-zinc-500">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                Thinking…
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="mb-2 max-w-xl whitespace-pre-wrap text-[14px] text-black dark:text-zinc-200">
                                {turn.text}
                              </p>
                              {turn.actions.length > 0 && (
                                <div className="mb-3 space-y-1.5">
                                  {turn.actions.map((a, i) => (
                                    <div key={i} className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-[12.5px] dark:border-emerald-500/20 dark:bg-emerald-500/5">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                      <span className="font-medium text-emerald-700 dark:text-emerald-400">{a.label}</span>
                                      {(a.data as any)?.ticketId && (
                                        <span className="ml-auto font-mono text-[11px] text-black dark:text-zinc-500">{String((a.data as any).ticketId)}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {turn.suggestedFollowUps.length > 0 && (
                                <NextBest
                                  items={turn.suggestedFollowUps.map((s) => ({ label: s, send: s }))}
                                  onSend={send}
                                />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // ezra (local intent fallback — unused in production but kept for dev)
                  const intent = INTENTS[turn.intentId];
                  const ent = entOf(turn);
                  const steps = callable(intent.reason, ent) ?? [];
                  const prose =
                    turn.status === "done"
                      ? callable(intent.prose, ent)
                      : undefined;
                  const handlers = makeHandlers(convId);
                  const next =
                    turn.status === "done"
                      ? (callable(intent.next, ent) ?? [])
                      : [];
                  return (
                    <div key={turn.id} className="flex gap-3 py-4">
                      <EzraAvatar />
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-black dark:text-zinc-500">
                          Ezra
                        </div>
                        <ReasoningBlock
                          steps={steps}
                          revealed={
                            turn.status === "done"
                              ? steps.length
                              : turn.revealed
                          }
                          done={turn.status === "done"}
                        />
                        {turn.status === "done" && (
                          <>
                            {prose && (
                              <p className="mb-1 max-w-md text-[14px] text-black dark:text-zinc-200">
                                {prose}
                              </p>
                            )}
                            {intent.build(ent, handlers, audit)}
                            <NextBest items={next} onSend={send} />
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={threadEndRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-zinc-200 px-5 py-3 dark:border-zinc-800 sm:px-8">
            <div className="mx-auto max-w-2xl">
              <div
                className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5"
                style={{ scrollbarWidth: "none" }}
              >
                <button
                  onClick={() => setModal({ kind: "library" })}
                  className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-dashed border-emerald-300 px-3 py-1.5 text-[12px] text-emerald-600 transition-colors hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                >
                  <BookOpen size={12} /> Prompt library
                </button>
                {suggestions.slice(0, 6).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s.send)}
                    className="shrink-0 whitespace-nowrap rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[12px] text-black transition-colors hover:border-emerald-400 hover:text-emerald-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:border-emerald-500/50 dark:hover:text-emerald-400"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="flex items-end gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 focus-within:border-emerald-400 dark:border-zinc-700 dark:bg-transparent">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    autosize();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const v = input;
                      setInput("");
                      requestAnimationFrame(autosize);
                      send(v);
                    }
                  }}
                  placeholder="Ask Ezra about your incidents, services, deployments…"
                  className="max-h-[140px] flex-1 resize-none bg-transparent py-1 text-[14.5px] text-black placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
                />
                <button
                  onClick={() => {
                    const v = input;
                    setInput("");
                    requestAnimationFrame(autosize);
                    send(v);
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors hover:bg-emerald-700"
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="mt-2 text-center text-[10.5px] text-black dark:text-zinc-500">
                Ezra answers only within{" "}
                <b className="text-black dark:text-zinc-400">your tenant</b>'s
                boundary and your permissions. Actions require approval where
                operational rules apply.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── modals ───────────────────────────────────────────────── */}
      <Modal
        isOpen={modal.kind !== "none"}
        onClose={() => setModal({ kind: "none" })}
      >
        {modal.kind === "palette" && (
          <CommandPalette
            conversations={conversations}
            onClose={() => setModal({ kind: "none" })}
            onSend={send}
            onJump={setActiveId}
            onOpenLibrary={() => setModal({ kind: "library" })}
            onOpenAudit={() => setModal({ kind: "audit" })}
            onNewConversation={newConversation}
            onExport={(id) => setModal({ kind: "exportConv", id })}
            activeId={activeId}
          />
        )}
        {modal.kind === "library" && (
          <PromptLibrary
            onPick={(p) => {
              setModal({ kind: "none" });
              send(p);
            }}
          />
        )}
        {modal.kind === "audit" && <AuditLog audit={audit} />}
        {modal.kind === "convMenu" && (
          <ConvMenu
            conv={conversations.find((c) => c.id === modal.id)}
            onPin={() => togglePin(modal.id)}
            onRename={() => setModal({ kind: "rename", id: modal.id })}
            onArchive={() => toggleArchive(modal.id)}
            onShare={() => setModal({ kind: "share", id: modal.id })}
            onExport={() => setModal({ kind: "exportConv", id: modal.id })}
            onDelete={() => setModal({ kind: "delete", id: modal.id })}
          />
        )}
        {modal.kind === "rename" && (
          <RenameForm
            initial={conversations.find((c) => c.id === modal.id)?.title ?? ""}
            onSave={(v) => renameConversation(modal.id, v)}
            onCancel={() => setModal({ kind: "none" })}
          />
        )}
        {modal.kind === "share" && (
          <ShareForm
            id={modal.id}
            onCopy={() =>
              addAudit(
                `Shared conversation · ${conversations.find((c) => c.id === modal.id)?.title ?? ""}`,
                "Allowed",
              )
            }
            showToast={showToast}
          />
        )}
        {modal.kind === "exportConv" && (
          <ExportSheet
            onPick={(kind) => {
              setModal({ kind: "none" });
              if (kind === "pdf") {
                addAudit("Exported conversation to PDF", "Allowed");
                showToast("Preparing PDF…");
              } else if (kind === "incident") {
                addAudit("Attached conversation to incident", "Allowed");
                showToast("Attached to incident record");
              } else {
                addAudit("Exported conversation to Slack", "Allowed");
                showToast("Posted to #payments-platform");
              }
            }}
          />
        )}
        {modal.kind === "delete" && (
          <DeleteConfirm
            title={conversations.find((c) => c.id === modal.id)?.title ?? ""}
            onCancel={() => setModal({ kind: "none" })}
            onConfirm={() => deleteConversation(modal.id)}
          />
        )}
      </Modal>

      {/* Toast */}
      <div
        className={cn(
          "pointer-events-none fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-lg bg-black px-4 py-2.5 font-mono text-[12.5px] text-white shadow-lg transition-all duration-200",
          toast ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        {toast}
      </div>
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────

const EzraAvatar = () => (
  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-[13px] font-semibold text-white">
    E
  </div>
);

function ReasoningBlock({
  steps,
  revealed,
  done,
}: {
  steps: string[];
  revealed: number;
  done: boolean;
}) {
  if (!steps.length) return null;
  return (
    <div
      className={cn(
        "mb-2.5 max-w-sm rounded-lg bg-zinc-50 px-3.5 py-2.5 dark:bg-zinc-900/60",
        done && "opacity-60",
      )}
    >
      <div className="mb-1.5 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-black dark:text-zinc-500">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-emerald-500",
            !done && "animate-pulse",
          )}
        />
        {done ? "Investigation complete" : "Investigating"}
      </div>
      {steps.slice(0, revealed).map((s, i) => (
        <div
          key={i}
          className="flex items-center gap-2 py-0.5 font-mono text-[11.5px] text-black dark:text-zinc-400"
        >
          <span className="text-emerald-600 dark:text-emerald-400">
            {i === steps.length - 1 ? "…" : "✓"}
          </span>
          {s}
        </div>
      ))}
    </div>
  );
}

function NextBest({
  items,
  onSend,
}: {
  items: NBItem[];
  onSend: (t: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="mt-3 max-w-md rounded-xl border-l-4 border-l-emerald-500 bg-gradient-to-b from-white to-zinc-50 p-3.5 shadow-sm shadow-light dark:border-l-emerald-500/70 dark:from-zinc-900/40 dark:to-zinc-900/60">
      <div className="mb-1.5 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
        <Sparkles size={13} /> Next best actions
      </div>
      {items.map((a, i) => (
        <button
          key={i}
          onClick={() => onSend(a.send)}
          className="flex w-full items-center gap-3 rounded-lg border-b border-zinc-100 px-1.5 py-2 text-left last:border-b-0 hover:bg-zinc-100/70 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
        >
          <span className="flex-1 text-[13px] text-black dark:text-zinc-200">
            {a.label}
          </span>
          {a.meta && (
            <span
              className={cn(
                "whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[10.5px]",
                a.urgent
                  ? "border-rose-200 text-rose-600 dark:border-rose-500/30 dark:text-rose-400"
                  : "border-zinc-300 text-black dark:border-zinc-700 dark:text-zinc-400",
              )}
            >
              {a.meta}
            </span>
          )}
          <ChevronRight
            size={14}
            className="shrink-0 text-black dark:text-zinc-500"
          />
        </button>
      ))}
    </div>
  );
}

function ConvMenu({
  conv,
  onPin,
  onRename,
  onArchive,
  onShare,
  onExport,
  onDelete,
}: {
  conv?: Conversation;
  onPin: () => void;
  onRename: () => void;
  onArchive: () => void;
  onShare: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  if (!conv) return null;
  const pinned = conv.group === "Pinned";
  const archived = conv.group === "Archived";
  const items = [
    { label: pinned ? "Unpin" : "Pin to top", icon: Pin, onClick: onPin },
    { label: "Rename", icon: PencilLine, onClick: onRename },
    {
      label: archived ? "Unarchive" : "Archive",
      icon: Archive,
      onClick: onArchive,
    },
    { label: "Share", icon: Share2, onClick: onShare },
    { label: "Export", icon: Download, onClick: onExport },
  ];
  return (
    <div className="p-2">
      <div className="mb-1 flex items-center gap-2 border-b border-zinc-100 px-2 pb-3 dark:border-zinc-800">
        <span className="truncate text-[15px] font-semibold text-black dark:text-zinc-100">
          {conv.title}
        </span>
      </div>
      <div className="py-1">
        {items.map(({ label, icon: Icon, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-[13.5px] text-black hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/60"
          >
            <Icon size={15} className="text-black dark:text-zinc-500" />
            {label}
          </button>
        ))}
      </div>
      <p className="px-2.5 pb-2 pt-1 text-[11.5px] text-black dark:text-zinc-500">
        Sharing and export stay inside your tenant boundary.
      </p>
      <div className="border-t border-zinc-100 pt-1 dark:border-zinc-800">
        <button
          onClick={onDelete}
          className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-[13.5px] text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
        >
          <Trash2 size={15} /> Delete conversation
        </button>
      </div>
    </div>
  );
}

function RenameForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: string;
  onSave: (v: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <div className="p-4">
      <h3 className="mb-3 text-[16px] font-semibold text-black dark:text-zinc-100">
        Rename conversation
      </h3>
      <input
        autoFocus
        value={value}
        maxLength={80}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSave(value)}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-[14px] text-black focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 px-3.5 py-2 text-[12.5px] text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(value)}
          className="rounded-lg bg-emerald-600 px-3.5 py-2 text-[12.5px] font-medium text-white hover:bg-emerald-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function ShareForm({
  id,
  onCopy,
  showToast,
}: {
  id: string;
  onCopy: () => void;
  showToast: (m: string) => void;
}) {
  const link = `https://acme.scrubbe.app/studio/c/${id}`;
  return (
    <div className="p-4">
      <h3 className="mb-3 text-[16px] font-semibold text-black dark:text-zinc-100">
        Share conversation
      </h3>
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[12px] text-black dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
        <ShieldCheck
          size={14}
          className="shrink-0 text-emerald-600 dark:text-emerald-400"
        />
        Anyone in <b className="text-black dark:text-zinc-200">your tenant</b>{" "}
        with Incident access can open this.
      </div>
      <div className="flex gap-2">
        <input
          readOnly
          value={link}
          className="flex-1 truncate rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2 font-mono text-[11.5px] text-black dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400"
        />
        <button
          onClick={() => {
            if (navigator.clipboard)
              navigator.clipboard.writeText(link).catch(() => {});
            onCopy();
            showToast("Link copied");
          }}
          className="shrink-0 rounded-lg bg-emerald-600 px-3.5 py-2 text-[12.5px] font-medium text-white hover:bg-emerald-700"
        >
          Copy link
        </button>
      </div>
      <p className="mt-3 text-[11.5px] text-black dark:text-zinc-500">
        Sharing is tenant-scoped — members of other tenants can never open it.
      </p>
    </div>
  );
}

function ExportSheet({
  onPick,
}: {
  onPick: (kind: "pdf" | "incident" | "slack") => void;
}) {
  const items: { label: string; kind: "pdf" | "incident" | "slack" }[] = [
    { label: "Export to PDF", kind: "pdf" },
    { label: "Attach to incident record", kind: "incident" },
    { label: "Send to Slack · #payments-platform", kind: "slack" },
  ];
  return (
    <div className="p-2">
      <h3 className="px-2.5 pb-2 pt-2 text-[16px] font-semibold text-black dark:text-zinc-100">
        Export conversation
      </h3>
      {items.map((it) => (
        <button
          key={it.kind}
          onClick={() => onPick(it.kind)}
          className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-[13.5px] text-black hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/60"
        >
          <Download size={15} className="text-black dark:text-zinc-500" />
          {it.label}
        </button>
      ))}
    </div>
  );
}

function DeleteConfirm({
  title,
  onCancel,
  onConfirm,
}: {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="p-4">
      <h3 className="mb-1.5 text-[16px] font-semibold text-black dark:text-zinc-100">
        Delete conversation
      </h3>
      <p className="text-[13px] text-black dark:text-zinc-300">
        Delete <b>“{title}”</b>?
      </p>
      <p className="mt-1 text-[12.5px] text-black dark:text-zinc-500">
        This removes it from the archive. It can't be undone.
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 px-3.5 py-2 text-[12.5px] text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-[12.5px] font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:bg-transparent dark:text-rose-400 dark:hover:bg-rose-500/10"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function PromptLibrary({ onPick }: { onPick: (p: string) => void }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  return (
    <div>
      <div className="flex items-center gap-2 border-b border-zinc-100 p-3 dark:border-zinc-800">
        <Search size={15} className="text-black dark:text-zinc-500" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter prompts…"
          className="flex-1 bg-transparent text-[14px] text-black placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
        />
      </div>
      <div className="max-h-[60vh] overflow-y-auto p-2">
        {PROMPT_LIBRARY.map((g) => {
          const items = g.items.filter(
            (p) => !query || p.toLowerCase().includes(query),
          );
          if (!items.length) return null;
          return (
            <div key={g.cat}>
              <div className="px-2.5 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-widest text-black dark:text-zinc-500">
                {g.cat}
              </div>
              {items.map((p) => {
                const gov = GOV_PROMPTS.has(p);
                return (
                  <button
                    key={p}
                    onClick={() => onPick(p)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2.5 text-left text-[13.5px] text-black hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/60"
                  >
                    <span>{p}</span>
                    {gov ? (
                      <span className="whitespace-nowrap rounded-full border border-rose-200 px-2 py-0.5 font-mono text-[10px] text-rose-600 dark:border-rose-500/30 dark:text-rose-400">
                        blocked demo
                      </span>
                    ) : (
                      <ChevronRight
                        size={14}
                        className="shrink-0 text-black dark:text-zinc-500"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AuditLog({ audit }: { audit: AuditEntry[] }) {
  return (
    <div>
      <div className="border-b border-zinc-100 p-4 dark:border-zinc-800">
        <h3 className="text-[16px] font-semibold text-black dark:text-zinc-100">
          Audit log
        </h3>
        <p className="font-mono text-[11px] text-black dark:text-zinc-500">
          Your tenant · tenant-scoped
        </p>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        {audit.map((a, i) => {
          const denied = /deny|denied/i.test(a.result);
          const pending = /pending/i.test(a.result);
          return (
            <div
              key={i}
              className="flex items-start justify-between gap-4 border-b border-zinc-100 px-4 py-3 last:border-b-0 dark:border-zinc-800"
            >
              <div>
                <div className="text-[13px] text-black dark:text-zinc-200">
                  {a.action}
                </div>
                <div className="text-[11px] text-black dark:text-zinc-500">
                  {a.actor}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    "font-mono text-[11px]",
                    denied
                      ? "text-rose-600 dark:text-rose-400"
                      : pending
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  {a.result}
                </div>
                <div className="font-mono text-[10px] text-black dark:text-zinc-500">
                  {a.when}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CommandPalette({
  conversations,
  activeId,
  onClose,
  onSend,
  onJump,
  onOpenLibrary,
  onOpenAudit,
  onNewConversation,
  onExport,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onClose: () => void;
  onSend: (t: string) => void;
  onJump: (id: string) => void;
  onOpenLibrary: () => void;
  onOpenAudit: () => void;
  onNewConversation: () => void;
  onExport: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);

  const commands = useMemo(() => {
    const list: {
      label: string;
      kind: string;
      icon: LucideIcon;
      run: () => void;
    }[] = [
      {
        label: "New conversation",
        kind: "action",
        icon: Plus,
        run: () => {
          onClose();
          onNewConversation();
        },
      },
      {
        label: "Open prompt library",
        kind: "action",
        icon: BookOpen,
        run: () => {
          onClose();
          onOpenLibrary();
        },
      },
      {
        label: "Open audit log",
        kind: "action",
        icon: ShieldCheck,
        run: () => {
          onClose();
          onOpenAudit();
        },
      },
      {
        label: "Export conversation",
        kind: "action",
        icon: Download,
        run: () => {
          onClose();
          onExport(activeId ?? conversations[0]?.id ?? "");
        },
      },
    ];
    PROMPT_LIBRARY.forEach((g) =>
      g.items.forEach((p) =>
        list.push({
          label: p,
          kind: "ask",
          icon: MessageSquare,
          run: () => {
            onClose();
            onSend(p);
          },
        }),
      ),
    );
    conversations.forEach((c) =>
      list.push({
        label: `Go to · ${c.title}`,
        kind: "jump",
        icon: ChevronRight,
        run: () => {
          onClose();
          onJump(c.id);
        },
      }),
    );
    return list;
  }, [
    conversations,
    activeId,
    onClose,
    onSend,
    onJump,
    onOpenLibrary,
    onOpenAudit,
    onNewConversation,
    onExport,
  ]);

  const filtered = commands.filter(
    (c) => !q.trim() || c.label.toLowerCase().includes(q.trim().toLowerCase()),
  );
  const selected = Math.min(sel, Math.max(0, filtered.length - 1));

  return (
    <div>
      <div className="flex items-center gap-2 border-b border-zinc-100 p-3 dark:border-zinc-800">
        <Search size={15} className="text-black dark:text-zinc-500" />
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel((s) => Math.min(s + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel((s) => Math.max(s - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              filtered[selected]?.run();
            }
          }}
          placeholder="Search commands, prompts, conversations…"
          className="flex-1 bg-transparent text-[14.5px] text-black placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
        />
      </div>
      <div className="max-h-[60vh] overflow-y-auto p-2">
        {!filtered.length && (
          <p className="px-2.5 py-6 text-center text-[12.5px] text-black dark:text-zinc-500">
            No matches.
          </p>
        )}
        {filtered.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              onMouseEnter={() => setSel(i)}
              onClick={() => c.run()}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5",
                i === selected
                  ? "bg-emerald-50 dark:bg-emerald-500/10"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60",
              )}
            >
              <Icon
                size={15}
                className={cn(
                  "shrink-0",
                  i === selected
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-black dark:text-zinc-500",
                )}
              />
              <span className="flex-1 truncate text-[13.5px] text-black dark:text-zinc-200">
                {c.label}
              </span>
              <span className="rounded-full border border-zinc-200 px-2 py-0.5 font-mono text-[10px] text-black dark:border-zinc-700 dark:text-zinc-500">
                {c.kind}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
