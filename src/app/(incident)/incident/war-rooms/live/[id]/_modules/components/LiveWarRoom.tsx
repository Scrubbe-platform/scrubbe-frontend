"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Info,
  Loader2,
  Pencil,
  Plus,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SideModal from "@/components/ui/SideModal";
import Header from "@/components/IMS/DashboardHeader";
import { useIncidentDetail } from "@/hooks/useIncidentWorkspace";
import { useCaptureWarRoomDecision, useWarRooms } from "@/hooks/useWarRoom";
import useAuthStore from "@/lib/stores/auth.store";
import { Avatar, SeverityPill } from "./LiveWarRoomPrimitives";
import CommunicationsPanel from "./CommunicationsPanel";
import {
  CAP_LABEL,
  INITIAL_ERR_PATH,
  PARTICIPANTS,
  PHASES,
  RECO,
  RECOVERY_STEPS,
  SCRIPT,
  fmtElapsed,
  formatStarted,
  isAgent,
  parseElapsedLabel,
  roleOf,
  shortWrCode,
  statusTone,
  type CapturedItem,
  type Participant,
  type ScriptStep,
  type StreamMessage,
} from "./liveWarRoom.data";

type RecoState = "hidden" | "pending" | "running" | "done" | "dismissed";

function nowClock() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LiveWarRoom({ incidentId }: { incidentId: string }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const CURRENT_USER =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "You";

  const { data: incident, isLoading: incidentLoading } =
    useIncidentDetail(incidentId);
  const {
    data: warRooms,
    loading: warRoomsLoading,
    refetch: refetchWarRooms,
  } = useWarRooms(incidentId);
  const { captureDecision } = useCaptureWarRoomDecision();

  const activeWarRoom = useMemo(() => {
    if (!warRooms?.length) return null;
    return [...warRooms].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
  }, [warRooms]);

  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [typingWho, setTypingWho] = useState<string | null>(null);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [caps, setCaps] = useState<CapturedItem[]>([]);
  const [reco, setReco] = useState<RecoState>("hidden");
  const [errPath, setErrPath] = useState<number[]>(INITIAL_ERR_PATH);
  const [vitals, setVitals] = useState({
    req: "~3,900",
    lat: "2.9s",
    suc: "93.2%",
  });
  const [resolved, setResolved] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(() =>
    parseElapsedLabel(incident?.elapsedLabel),
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const scriptStarted = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const streamEndRef = useRef<HTMLDivElement>(null);

  function appendMessage(m: StreamMessage) {
    setMessages((prev) => [...prev, m]);
  }
  function addCapture(c: CapturedItem) {
    setCaps((prev) => [c, ...prev]);
  }
  async function logDecision(action: string, outcome?: string) {
    if (!activeWarRoom) return;
    try {
      await captureDecision(activeWarRoom.id, { action, outcome });
    } catch {
      /* non-blocking demo action */
    }
  }

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, typingWho]);

  useEffect(() => {
    if (!activeWarRoom || scriptStarted.current) return;
    scriptStarted.current = true;
    const svc =
      incident?.service || incident?.affectedSystem || "the affected service";
    const label = incident?.title || incident?.reason || "this incident";
    appendMessage({
      who: "Ezra",
      at: nowClock(),
      text: `War room opened for ${incident?.ticketId ?? "this incident"} — ${String(label).toLowerCase()}. Pulling in the on-call and the response agents.`,
    });
    appendMessage({
      who: "Logs Agent",
      at: nowClock(),
      finding: true,
      crit: true,
      text: `Elevated error rate detected on ${svc}. Investigating the trigger now.`,
    });
    appendMessage({
      who: "Sarah Okafor",
      at: nowClock(),
      text: "On it. What changed in the last hour? Let's find the trigger before we touch anything.",
    });

    const scriptTimers = timers.current;
    SCRIPT.forEach((step: ScriptStep) => {
      const timer = setTimeout(() => runStep(step), step.t);
      scriptTimers.push(timer);
    });
    return () => {
      scriptTimers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWarRoom]);

  function runStep(step: ScriptStep) {
    if (step.kind === "typing") {
      setTypingWho(step.who);
      return;
    }
    setTypingWho(null);
    appendMessage({
      who: step.who,
      text: step.text!,
      finding: step.finding,
      crit: step.crit,
      at: nowClock(),
    });
    if (step.capture) addCapture(step.capture);
    if (typeof step.setPhase === "number") setPhaseIdx(step.setPhase);
    if (step.showReco) setReco("pending");
  }

  useEffect(() => {
    if (reco !== "pending") return;
    const id = setInterval(() => {
      setErrPath((prev) => {
        const last = prev[prev.length - 1];
        const jitter = Math.random() * 0.4 - 0.2;
        const next = Math.max(6.2, Math.min(7.4, last + jitter));
        const arr = [...prev, next];
        if (arr.length > 16) arr.shift();
        return arr;
      });
    }, 2500);
    return () => clearInterval(id);
  }, [reco]);

  useEffect(() => {
    if (resolved) return;
    const id = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [resolved]);

  function pushErr(v: number) {
    setErrPath((prev) => {
      const arr = [...prev, v];
      if (arr.length > 16) arr.shift();
      return arr;
    });
  }

  function approveReco() {
    if (reco !== "pending") return;
    setReco("running");
    appendMessage({
      who: CURRENT_USER,
      at: nowClock(),
      text: "Approved — roll back dep-8842.",
    });
    appendMessage({
      kind: "sys",
      at: nowClock(),
      text: `${CURRENT_USER} approved the rollback of dep-8842`,
    });
    addCapture({
      type: "modification",
      text: "Rolled back deploy dep-8842 on checkout-api",
      by: "Deployment Agent",
      did: "logged to the change record",
    });
    setPhaseIdx(2);
    void logDecision("approve-rollback", RECO.why);
    timers.current.push(
      setTimeout(() => setTypingWho("Deployment Agent"), 800),
    );
    timers.current.push(
      setTimeout(() => {
        setTypingWho(null);
        appendMessage({
          who: "Deployment Agent",
          at: nowClock(),
          text: "Rollback applied. dep-8842 reverted across all checkout-api pods.",
        });
      }, 1800),
    );

    let i = 0;
    const rec = setInterval(() => {
      if (i >= RECOVERY_STEPS.length) {
        clearInterval(rec);
        finishRecovery();
        return;
      }
      pushErr(RECOVERY_STEPS[i]);
      i++;
    }, 700);
  }

  function finishRecovery() {
    setPhaseIdx(3);
    appendMessage({
      who: "Logs Agent",
      at: nowClock(),
      text: "5xx rate falling — 6.8% down to baseline. Checkout success back to 99.6%.",
    });
    timers.current.push(
      setTimeout(() => {
        appendMessage({
          who: "Ezra",
          at: nowClock(),
          text: "Error rate is back to baseline and holding. You're clear to resolve when ready — I'll write the summary and carry the captured items into the war room library.",
        });
        setReco("done");
        pushErr(0.3);
        setVitals({ req: "~120", lat: "0.4s", suc: "99.6%" });
        toast.success("Impact recovered — ready to resolve");
      }, 900),
    );
  }

  function dismissReco() {
    if (reco !== "pending") return;
    setReco("dismissed");
    toast("Recommendation dismissed");
  }

  function resolveWarRoom() {
    if (reco !== "done" && phaseIdx < 3) {
      toast.warning(
        "Mitigation still in progress — resolve once impact has recovered",
      );
      return;
    }
    if (resolved) return;
    setResolved(true);
    setPhaseIdx(4);
    appendMessage({
      kind: "sys",
      ok: true,
      at: nowClock(),
      text: `${CURRENT_USER} resolved ${incident?.ticketId ?? "the incident"} · war room saved to the library with ${caps.length} follow-ups`,
    });
    void logDecision("resolve", `${caps.length} follow-ups captured`);
    toast.success(
      `War room resolved — saved to the library with ${caps.length} follow-ups`,
    );
  }

  function setPhaseManual(i: number) {
    setPhaseIdx(i);
    appendMessage({
      kind: "sys",
      at: nowClock(),
      text: `${CURRENT_USER} set the status to ${PHASES[i]}`,
    });
    setDrawerOpen(false);
    toast.success(`Status updated to ${PHASES[i]}`);
    void logDecision("set-phase", PHASES[i]);
  }

  function send() {
    const text = draft.trim();
    if (!text) return;
    appendMessage({ who: CURRENT_USER, at: nowClock(), text });
    setDraft("");
  }

  function askEzra(kind: "status" | "impact") {
    appendMessage({
      who: CURRENT_USER,
      at: nowClock(),
      text:
        kind === "impact" ? "What's the impact right now?" : "Ezra, status?",
    });
    timers.current.push(setTimeout(() => setTypingWho("Ezra"), 300));
    timers.current.push(
      setTimeout(() => {
        setTypingWho(null);
        const err = errPath[errPath.length - 1];
        const txt =
          kind === "impact"
            ? `Right now: 5xx error rate ${err.toFixed(1)}%, roughly ${resolved ? "120" : "3,900"} requests affected in the last ten minutes, checkout success ${resolved ? "99.6" : "93.2"}%. ${reco === "done" ? "Impact has recovered." : "Still above threshold."}`
            : `We're in "${PHASES[phaseIdx]}". ${reco === "pending" ? "A rollback of dep-8842 is recommended and waiting on approval." : reco === "running" ? "Rollback of dep-8842 is applying now." : reco === "done" ? "Rollback is complete and impact has recovered — clear to resolve." : "Awaiting the next action."} ${caps.length} follow-ups captured so far.`;
        appendMessage({ who: "Ezra", at: nowClock(), text: txt });
      }, 1100),
    );
  }

  const errNow = errPath[errPath.length - 1];

  const roster = useMemo<Participant[]>(() => {
    const humans = PARTICIPANTS.filter((p) => !isAgent(p.n));
    const agents = PARTICIPANTS.filter((p) => isAgent(p.n));
    const alreadyListed = humans.some((p) => p.n === CURRENT_USER);
    const me: Participant[] = alreadyListed
      ? []
      : [{ n: CURRENT_USER, p: "on" }];
    return [...me, ...humans, ...agents];
  }, [CURRENT_USER]);
  const hereCount = roster.length;

  if (incidentLoading || warRoomsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[13px] text-zinc-400">
        <Loader2 size={16} className="mr-2 animate-spin" />
        Loading war room…
      </div>
    );
  }
  if (!incident) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <p className="text-[14px] font-semibold text-zinc-500">
          Incident not found.
        </p>
        <button
          type="button"
          onClick={() => router.push("/incident/tickets")}
          className="text-[13px] font-semibold text-[#1B4DFF] hover:underline"
        >
          Back to incidents
        </button>
      </div>
    );
  }

  const status = statusTone(resolved ? "RESOLVED" : incident.status);
  const wrCode = activeWarRoom
    ? shortWrCode(activeWarRoom.id)
    : shortWrCode(incidentId);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-ibm">
      <Header title="War Room" />

      <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-6 py-6">
        <button
          type="button"
          onClick={() => router.push(`/incident/tickets?id=${incidentId}`)}
          className="inline-flex w-fit items-center gap-1 rounded-lg border border-zinc-200 dark:border-white/15 bg-white dark:bg-grayscrubbe-900 px-3 py-1.5 text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5"
        >
          <ChevronLeft size={15} />
          back
        </button>

        <div className="flex flex-wrap items-start gap-4 rounded-xl bg-white dark:bg-grayscrubbe-900 p-5 shadow-sm shadow-light">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-[12px] text-zinc-400">
                {wrCode} · {incident.ticketId}
              </span>
              <span
                className={cn(
                  "inline-flex h-6 items-center rounded-full border px-2.5 text-[11.5px] font-semibold",
                  status.className,
                )}
              >
                {status.label}
              </span>
            </div>
            <h1 className="mt-1.5 font-ibm text-[24px] font-bold leading-tight tracking-tight">
              {incident.title || incident.reason || "Untitled incident"}
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-3.5 text-[12.5px] text-zinc-500">
              <SeverityPill
                sev={incident.severity || incident.priority || "P2"}
              />
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={13} className="text-zinc-400" />
                {formatStarted(incident.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2.5">
            <div className="text-right">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                Elapsed
              </div>
              <div className="font-mono text-[22px] font-bold tabular-nums">
                {fmtElapsed(elapsedSec)}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                disabled={!activeWarRoom}
                className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/15 px-3 text-[12.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5 disabled:opacity-50"
              >
                Update status
              </button>
              <button
                type="button"
                onClick={resolveWarRoom}
                disabled={resolved || !activeWarRoom}
                className="inline-flex h-[34px] items-center gap-1.5 rounded-lg bg-IMSLightGreen px-3 text-[12.5px] font-bold text-white disabled:opacity-50"
              >
                Resolve incident
              </button>
            </div>
          </div>
        </div>

        {!activeWarRoom ? (
          <div className="mx-auto w-full max-w-[520px] py-8">
            <h2 className="text-center font-ibm text-[17px] font-bold">
              Set up this war room
            </h2>
            <p className="mt-1.5 text-center text-[13px] text-zinc-500">
              Pick a platform to provision the channel. The live room opens the
              moment it&apos;s ready.
            </p>
            <div className="mt-5">
              <CommunicationsPanel
                incidentId={incidentId}
                ticketId={incident.ticketId}
                priority={incident.priority}
                warRoom={null}
                onDeclared={refetchWarRooms}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] items-start gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex h-[calc(100vh-320px)] min-h-[480px] flex-col overflow-hidden rounded-xl bg-white dark:bg-grayscrubbe-900 shadow-sm shadow-light">
                <div className="flex items-center gap-2.5 border-b border-zinc-200 dark:border-white/10 px-4 py-3">
                  <h2 className="text-[13.5px] font-bold">War room</h2>
                  <span className="ml-auto flex items-center gap-2">
                    <span className="flex items-center">
                      {roster.slice(0, 6).map((p, i) => (
                        <span
                          key={p.n}
                          className="rounded-full ring-2 ring-white dark:ring-grayscrubbe-900"
                          style={{ marginLeft: i === 0 ? 0 : -6 }}
                        >
                          <Avatar name={p.n} size={22} />
                        </span>
                      ))}
                    </span>
                    <span className="text-[11.5px] font-semibold text-zinc-400">
                      {hereCount} here
                    </span>
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex flex-col gap-3.5">
                    {messages.map((m, i) => (
                      <MessageRow key={i} m={m} me={CURRENT_USER} />
                    ))}
                    {typingWho && (
                      <div className="flex items-center gap-2.5 text-[12px] text-zinc-400">
                        <Avatar name={typingWho} size={26} />
                        <span>{typingWho} is analyzing</span>
                        <span className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="h-1 w-1 animate-pulse rounded-full bg-zinc-400"
                              style={{ animationDelay: `${i * 0.2}s` }}
                            />
                          ))}
                        </span>
                      </div>
                    )}
                    <div ref={streamEndRef} />
                  </div>
                </div>
                <div className="border-t border-zinc-200 dark:border-white/10 p-2.5">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => askEzra("status")}
                      className="h-[27px] rounded-full border border-zinc-200 dark:border-white/15 px-2.5 text-[11.5px] font-semibold text-zinc-500 hover:border-[#1B4DFF] hover:text-[#1B4DFF]"
                    >
                      Ask Ezra for status
                    </button>
                    <button
                      type="button"
                      onClick={() => askEzra("impact")}
                      className="h-[27px] rounded-full border border-zinc-200 dark:border-white/15 px-2.5 text-[11.5px] font-semibold text-zinc-500 hover:border-[#1B4DFF] hover:text-[#1B4DFF]"
                    >
                      What&apos;s the impact?
                    </button>
                  </div>
                  <div className="flex items-end gap-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] p-2">
                    <Avatar name={CURRENT_USER} size={24} />
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                      placeholder="Message the war room…"
                      rows={1}
                      className="min-h-[20px] max-h-[90px] flex-1 resize-none bg-transparent py-0.5 text-[13px] outline-none placeholder:text-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={send}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-IMSLightGreen text-white"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <CommunicationsPanel
                incidentId={incidentId}
                ticketId={incident.ticketId}
                priority={incident.priority}
                warRoom={activeWarRoom}
                onDeclared={refetchWarRooms}
              />
            </div>

            <div className="flex flex-col gap-3.5">
              <div className="rounded-2xl bg-white dark:bg-grayscrubbe-900 shadow-sm shadow-light">
                <div className="flex items-center gap-2 px-4 py-3">
                  <h3 className="text-[13px] font-bold">Live impact</h3>
                  <span className="ml-auto text-[11px] text-zinc-400">
                    updated {nowClock()}
                  </span>
                </div>
                <div className="border-t border-zinc-100 dark:border-white/5 px-4 py-4">
                  <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                    <Vital
                      label="5xx Error Rate"
                      value={`${errNow.toFixed(1)}%`}
                      trend={resolved ? "recovered" : "climbing"}
                      trendDir={resolved ? "down" : "up"}
                    />
                    <Vital
                      label="Affected Requests"
                      value={vitals.req}
                      trend="last 10 min"
                    />
                    <Vital
                      label="P95 Latency"
                      value={vitals.lat}
                      trend={resolved ? "back to normal" : "elevated"}
                      trendDir={resolved ? "down" : "up"}
                    />
                    <Vital
                      label="Checkout Success"
                      value={vitals.suc}
                      trend={resolved ? "recovered" : "dropping"}
                      trendDir={resolved ? "up" : "down"}
                    />
                  </div>
                </div>
                <div className="flex gap-2 border-t border-zinc-100 dark:border-white/5 px-4 py-3 text-[11.5px] leading-relaxed text-zinc-500">
                  <Info size={13} className="mt-0.5 shrink-0 text-zinc-400" />
                  <span>
                    {resolved
                      ? "Impact has recovered and is holding at baseline."
                      : "Error rate above the 1% alert threshold. Agents are correlating the cause."}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-white dark:bg-grayscrubbe-900 shadow-sm shadow-light">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-white/5 px-3.5 py-2.5">
                  <Sparkles size={14} className="text-[#1B4DFF]" />
                  <h3 className="text-[12px] font-bold">Recommended action</h3>
                </div>
                <div className="p-3.5">
                  {reco === "hidden" && (
                    <p className="text-[12.5px] leading-relaxed text-zinc-400">
                      Ezra is still correlating the cause. A recommended action
                      will appear here as soon as there&apos;s a high-confidence
                      match.
                    </p>
                  )}
                  {reco === "pending" && (
                    <div className="rounded-lg border border-[#D3DEFF] dark:border-[#1B4DFF]/30 bg-gradient-to-b from-[#FBFCFF] to-[#F4F7FF] dark:from-[#1B4DFF]/10 dark:to-transparent p-3.5">
                      <div className="flex items-center gap-2 text-[12.5px] font-bold">
                        <Sparkles size={14} className="text-[#1B4DFF]" />
                        Ezra recommends
                      </div>
                      <div className="mt-2.5 text-[14px] font-bold tracking-tight">
                        {RECO.action}
                      </div>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                        {RECO.why}
                      </p>
                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
                        <Sparkles size={12} className="text-[#1B4DFF]" />
                        Confidence{" "}
                        <b className="text-[#1B4DFF]">{RECO.confidence}%</b> ·
                        needs your approval
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={approveReco}
                          className="inline-flex h-[31px] items-center gap-1.5 rounded-lg bg-black dark:bg-white px-2.5 text-[12px] font-bold text-white dark:text-black"
                        >
                          Approve rollback
                        </button>
                        <button
                          type="button"
                          onClick={dismissReco}
                          className="inline-flex h-[31px] items-center rounded-lg border border-zinc-200 dark:border-white/15 px-2.5 text-[12px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5"
                        >
                          Not now
                        </button>
                      </div>
                    </div>
                  )}
                  {reco === "running" && (
                    <div className="flex items-center gap-2.5 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] p-3.5 text-[12.5px] text-zinc-600 dark:text-zinc-300">
                      <Loader2
                        size={15}
                        className="shrink-0 animate-spin text-[#1B4DFF]"
                      />
                      <span>
                        Deployment Agent is rolling back <b>dep-8842</b>…
                      </span>
                    </div>
                  )}
                  {reco === "done" && (
                    <div className="flex items-center gap-2 rounded-lg border border-IMSLightGreen/25 bg-IMSLightGreen/10 p-3.5 text-[12.5px] font-semibold text-IMSLightGreen">
                      <Check size={15} />
                      Rollback complete · impact recovered
                    </div>
                  )}
                  {reco === "dismissed" && (
                    <p className="text-[12.5px] leading-relaxed text-zinc-400">
                      Recommendation dismissed. The room can propose another
                      action, or ask Ezra to re-evaluate.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-white dark:bg-grayscrubbe-900 shadow-sm shadow-light">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-white/5 px-3.5 py-2.5">
                  <h3 className="text-[12px] font-bold">In the room</h3>
                  <span className="ml-auto text-[11px] font-bold text-zinc-400">
                    {hereCount} active
                  </span>
                </div>
                <div className="flex flex-col p-1.5">
                  {roster.map((p) => (
                    <div
                      key={p.n}
                      className="flex items-center gap-2.5 px-2 py-1.5"
                    >
                      <Avatar
                        name={p.n}
                        size={26}
                        showPresence
                        presence={p.p}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] font-semibold">
                          {p.n}
                        </span>
                        <span className="block text-[11px] text-zinc-400">
                          {p.n === CURRENT_USER && !roleOf(p.n)
                            ? "You"
                            : roleOf(p.n)}
                        </span>
                      </span>
                      {p.ic ? (
                        <span className="rounded-md bg-[#EDF1FF] dark:bg-[#1B4DFF]/15 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-[#1B4DFF]">
                          Commander
                        </span>
                      ) : isAgent(p.n) ? (
                        <span className="rounded-md bg-zinc-100 dark:bg-white/5 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-zinc-500">
                          AI agent
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white dark:bg-grayscrubbe-900 shadow-sm shadow-light">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-white/5 px-3.5 py-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md border border-[#1B4DFF]/30 text-[#1B4DFF]">
                    <Plus size={12} />
                  </span>
                  <h3 className="text-[12px] font-bold">
                    Captured for follow-up
                  </h3>
                  <span className="ml-auto text-[11px] font-bold text-zinc-400">
                    {caps.length}
                  </span>
                </div>
                <div className="p-3.5">
                  {caps.length === 0 ? (
                    <p className="text-[12px] text-zinc-400">
                      Nothing captured yet. As the room surfaces findings, Ezra
                      pulls out the follow-ups automatically.
                    </p>
                  ) : (
                    <div className="flex flex-col">
                      {caps.map((c, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex gap-2.5 py-2",
                            i !== 0 &&
                              "border-t border-zinc-100 dark:border-white/5",
                          )}
                        >
                          <span className="mt-0.5 h-fit shrink-0 rounded-md border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-zinc-500">
                            {CAP_LABEL[c.type]}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[12px] font-medium leading-snug">
                              {c.text}
                            </span>
                            <span className="mt-0.5 block text-[10.5px] text-zinc-400">
                              {c.by} · {c.did}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-2.5 flex gap-1.5 border-t border-zinc-100 dark:border-white/5 pt-2.5 text-[11.5px] leading-snug text-zinc-500">
                    <ChevronRight
                      size={14}
                      className="mt-0.5 shrink-0 text-[#1B4DFF]"
                    />
                    <span>
                      These carry into the war room library the moment this
                      incident resolves.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <SideModal
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Update incident status"
        subTitle={incident.ticketId}
      >
        <div className="flex flex-col gap-2">
          {PHASES.map((p, i) => (
            <button
              key={p}
              type="button"
              onClick={() => setPhaseManual(i)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border p-3 text-left",
                i === phaseIdx
                  ? "border-[#1B4DFF] bg-[#EDF1FF] dark:bg-[#1B4DFF]/10"
                  : "border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20",
              )}
            >
              <span
                className={cn(
                  "h-4 w-4 shrink-0 rounded-full border-2",
                  i === phaseIdx
                    ? "border-[#1B4DFF] bg-[#1B4DFF]"
                    : "border-zinc-300 dark:border-white/20",
                )}
              />
              <span className="text-[13px] font-semibold">{p}</span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-zinc-400">
          Ezra advances the phase automatically as the response progresses. You
          can override it here — the room is notified.
        </p>
        <div className="mt-5 flex justify-end border-t border-zinc-200 dark:border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/15 px-3.5 text-[12.5px] font-semibold hover:bg-zinc-50 dark:hover:bg-white/5"
          >
            <X size={13} />
            Close
          </button>
        </div>
      </SideModal>
    </div>
  );
}

function Vital({
  label,
  value,
  trend,
  trendDir,
}: {
  label: string;
  value: string;
  trend: string;
  trendDir?: "up" | "down";
}) {
  return (
    <div>
      <div className="text-[11.5px] text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="mt-0.5 font-ibm text-[19px] font-bold tabular-nums tracking-tight">
        {value}
      </div>
      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
        {trendDir === "up" && <ChevronUp size={11} />}
        {trendDir === "down" && <ChevronDown size={11} />}
        {trend}
      </div>
    </div>
  );
}

function MessageRow({ m, me }: { m: StreamMessage; me: string }) {
  if (m.kind === "sys") {
    return (
      <div className="flex items-center justify-center gap-2.5 text-[11.5px] font-semibold text-zinc-400">
        <span className="h-px max-w-[60px] flex-1 bg-zinc-200 dark:bg-white/10" />
        {m.ok && <Check size={12} className="text-IMSLightGreen" />}
        <span className={m.ok ? "text-IMSLightGreen" : undefined}>
          {m.text}
        </span>
        <span className="h-px max-w-[60px] flex-1 bg-zinc-200 dark:bg-white/10" />
      </div>
    );
  }
  const isMe = m.who === me;
  return (
    <div className="flex gap-2.5">
      <Avatar name={m.who!} size={30} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] font-bold">{m.who}</span>
          <span className="text-[11px] text-zinc-400">{roleOf(m.who!)}</span>
        </div>
        {m.finding ? (
          <div className="mt-1.5 rounded-lg bg-zinc-50 dark:bg-white/[0.03] p-2.5">
            <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wide text-zinc-400">
              Finding
            </div>
            <div className="text-[12.5px] leading-snug">{m.text}</div>
          </div>
        ) : (
          <div
            className={cn(
              "mt-0.5 text-[13px] leading-snug",
              isMe
                ? "text-black dark:text-white"
                : "text-zinc-600 dark:text-zinc-300",
            )}
          >
            {m.text}
          </div>
        )}
      </div>
    </div>
  );
}
