"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { initSocket } from "@/lib/api/socket";

export type AIQueryType =
  | "ezra_analysis"
  | "five_whys"
  | "ai_suggestion"
  | "stakeholder_msg"
  | "investigation";

export interface ThinkingState {
  queryType: AIQueryType;
  triggeredBy: { userId: string; name: string };
}

export interface AIResultEvent {
  ticketId: string;
  queryType: AIQueryType;
  result: unknown;
  triggeredBy: { userId: string; name: string };
  timestamp: string;
}

/**
 * Multiplayer AI hook — any component on an incident surface can call
 * triggerAI() and every other participant in the ticket room will see the
 * result broadcast in real-time via incident:ai_result.
 *
 * The hook manages its own socket connection (or reuses an existing one via
 * initSocket which is idempotent) and cleans up on unmount.
 */
export function useSharedAI(ticketId?: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [results, setResults] = useState<Record<string, AIResultEvent>>({});
  const [thinking, setThinking] = useState<ThinkingState | null>(null);

  useEffect(() => {
    if (!ticketId) return;

    const socket = initSocket();
    socketRef.current = socket;

    const joinRoom = () => {
      socket.emit("incident:join", ticketId);
    };

    const handleThinking = (payload: ThinkingState & { ticketId: string }) => {
      if (payload.ticketId !== ticketId) return;
      setThinking({ queryType: payload.queryType, triggeredBy: payload.triggeredBy });
    };

    const handleResult = (payload: AIResultEvent) => {
      if (payload.ticketId !== ticketId) return;
      setResults((prev) => ({ ...prev, [payload.queryType]: payload }));
      setThinking((prev) =>
        prev?.queryType === payload.queryType ? null : prev
      );
    };

    const handleError = (payload: { ticketId: string; queryType: AIQueryType }) => {
      if (payload.ticketId !== ticketId) return;
      setThinking((prev) =>
        prev?.queryType === payload.queryType ? null : prev
      );
    };

    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);
    socket.on("incident:ai_thinking", handleThinking);
    socket.on("incident:ai_result", handleResult);
    socket.on("incident:ai_error", handleError);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("incident:ai_thinking", handleThinking);
      socket.off("incident:ai_result", handleResult);
      socket.off("incident:ai_error", handleError);
    };
  }, [ticketId]);

  const triggerAI = useCallback(
    (queryType: AIQueryType, payload?: Record<string, unknown>) => {
      if (!ticketId) return;
      const socket = socketRef.current ?? initSocket();
      socket.emit("incident:ai_query", { ticketId, queryType, payload });
    },
    [ticketId]
  );

  const getResult = useCallback(
    (queryType: AIQueryType): AIResultEvent | undefined => results[queryType],
    [results]
  );

  const isThinking = useCallback(
    (queryType?: AIQueryType): boolean =>
      queryType ? thinking?.queryType === queryType : thinking !== null,
    [thinking]
  );

  const whoIsThinking = useCallback(
    (): ThinkingState | null => thinking,
    [thinking]
  );

  return { triggerAI, getResult, isThinking, whoIsThinking, results };
}
