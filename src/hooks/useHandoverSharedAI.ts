"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { initSocket } from "@/lib/api/socket";

export interface HandoverAIResult {
  handoverId: string;
  queryType: string;
  result: unknown;
  triggeredBy: { userId: string; name: string };
  timestamp: string;
}

/**
 * Multiplayer AI hook for the Handover workspace. When any participant triggers
 * "Catch Me Up", the handover:ai_query socket event is emitted by the caller
 * and the server broadcasts handover:ai_result to all participants in that
 * handover room. This hook subscribes to those broadcasts.
 */
export function useHandoverSharedAI(handoverId?: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [latestResult, setLatestResult] = useState<HandoverAIResult | null>(null);
  const [thinking, setThinking] = useState<{ name: string } | null>(null);

  useEffect(() => {
    if (!handoverId) return;

    const socket = initSocket();
    socketRef.current = socket;

    const joinRoom = () => {
      socket.emit("handover:join", { handoverId });
    };

    const handleThinking = (payload: { handoverId: string; triggeredBy: { userId: string; name: string } }) => {
      if (payload.handoverId !== handoverId) return;
      setThinking({ name: payload.triggeredBy.name });
    };

    const handleResult = (payload: HandoverAIResult) => {
      if (payload.handoverId !== handoverId) return;
      setLatestResult(payload);
      setThinking(null);
    };

    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);
    socket.on("handover:ai_thinking", handleThinking);
    socket.on("handover:ai_result", handleResult);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("handover:ai_thinking", handleThinking);
      socket.off("handover:ai_result", handleResult);
    };
  }, [handoverId]);

  const triggerCatchMeUp = useCallback(() => {
    if (!handoverId) return;
    const socket = socketRef.current ?? initSocket();
    socket.emit("handover:ai_query", { handoverId, queryType: "catch_me_up" });
    setThinking({ name: "You" });
  }, [handoverId]);

  return { triggerCatchMeUp, latestResult, thinking };
}
