"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { initSocket } from "@/lib/api/socket";
import { useFetch } from "./useFetch";
import { endpoint } from "@/lib/api/endpoint";

export interface AgentParticipant {
  agentId: string;
  displayName: string;
  status: "ACTIVE" | "IDLE" | "FAILED";
  lastActiveAt: string;
  step?: string;
  detail?: string;
}

export interface ResolutionRequest {
  ticketId: string;
  ticketRef: string;
  summary: string;
  approvalId: string;
  governanceDecisionId: string;
  requestedBy: string;
  requestedByType: "HUMAN" | "AGENT";
  agentName?: string;
  resolutionSummary: string;
  rootCause?: string;
  isCodeRelated: boolean;
  prUrl?: string;
  prNumber?: number;
  prBranch?: string;
  requestMerge: boolean;
  requiresApproval: boolean;
}

interface UseAgentPresenceReturn {
  agents: AgentParticipant[];
  activeAgents: AgentParticipant[];
  pendingResolution: ResolutionRequest | null;
  clearPendingResolution: () => void;
}

/**
 * Subscribes to agent presence socket events for a given incident.
 * Receives: agent:joined, agent:idle, agent:failed, agent:left, agent:progress,
 *           incident:resolution_requested.
 */
export function useAgentPresence(ticketId?: string | null): UseAgentPresenceReturn {
  const { get } = useFetch();
  const [agents, setAgents] = useState<AgentParticipant[]>([]);
  const [pendingResolution, setPendingResolution] = useState<ResolutionRequest | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Load initial AI participants
  useEffect(() => {
    if (!ticketId) return;
    get(`${endpoint.incident_workspace.presence}/${ticketId}/ai-participants`).then((res) => {
      if (res.success) {
        const rows = (res.data?.data ?? res.data ?? []) as Array<{
          agentId: string; displayName: string; status: string; lastActiveAt: string;
        }>;
        setAgents(rows.map((r) => ({
          agentId: r.agentId,
          displayName: r.displayName,
          status: r.status as AgentParticipant["status"],
          lastActiveAt: r.lastActiveAt,
        })));
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId) return;

    const socket = initSocket();
    socketRef.current = socket;

    const handleAgentJoined = (payload: { ticketId: string; agentId: string; displayName: string; status: string; joinedAt: string }) => {
      if (payload.ticketId !== ticketId) return;
      setAgents((prev) => {
        const filtered = prev.filter((a) => a.agentId !== payload.agentId);
        return [...filtered, {
          agentId: payload.agentId,
          displayName: payload.displayName,
          status: payload.status as AgentParticipant["status"],
          lastActiveAt: payload.joinedAt,
        }];
      });
    };

    const handleAgentProgress = (payload: { ticketId: string; agentId: string; displayName: string; step: string; detail: string | null; at: string }) => {
      if (payload.ticketId !== ticketId) return;
      setAgents((prev) => prev.map((a) =>
        a.agentId === payload.agentId
          ? { ...a, status: "ACTIVE", step: payload.step, detail: payload.detail ?? undefined, lastActiveAt: payload.at }
          : a
      ));
    };

    const handleAgentIdle = (payload: { ticketId: string; agentId: string; idleAt: string }) => {
      if (payload.ticketId !== ticketId) return;
      setAgents((prev) => prev.map((a) =>
        a.agentId === payload.agentId ? { ...a, status: "IDLE", lastActiveAt: payload.idleAt, step: undefined, detail: undefined } : a
      ));
    };

    const handleAgentFailed = (payload: { ticketId: string; agentId: string; failedAt: string }) => {
      if (payload.ticketId !== ticketId) return;
      setAgents((prev) => prev.map((a) =>
        a.agentId === payload.agentId ? { ...a, status: "FAILED", lastActiveAt: payload.failedAt, step: undefined } : a
      ));
    };

    const handleAgentLeft = (payload: { ticketId: string; agentId: string }) => {
      if (payload.ticketId !== ticketId) return;
      setAgents((prev) => prev.filter((a) => a.agentId !== payload.agentId));
    };

    const handleResolutionRequested = (payload: ResolutionRequest) => {
      if (payload.ticketId !== ticketId && (payload as any).ticketRef !== ticketId) return;
      if (payload.requiresApproval) {
        setPendingResolution(payload);
      }
    };

    socket.on("agent:joined", handleAgentJoined);
    socket.on("agent:progress", handleAgentProgress);
    socket.on("agent:idle", handleAgentIdle);
    socket.on("agent:failed", handleAgentFailed);
    socket.on("agent:left", handleAgentLeft);
    socket.on("incident:resolution_requested", handleResolutionRequested);

    return () => {
      socket.off("agent:joined", handleAgentJoined);
      socket.off("agent:progress", handleAgentProgress);
      socket.off("agent:idle", handleAgentIdle);
      socket.off("agent:failed", handleAgentFailed);
      socket.off("agent:left", handleAgentLeft);
      socket.off("incident:resolution_requested", handleResolutionRequested);
    };
  }, [ticketId]);

  const clearPendingResolution = useCallback(() => setPendingResolution(null), []);

  const activeAgents = agents.filter((a) => a.status === "ACTIVE");

  return { agents, activeAgents, pendingResolution, clearPendingResolution };
}
