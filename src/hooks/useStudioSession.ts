"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { initSocket } from "@/lib/api/socket";

export interface SessionParticipant {
  id: string;
  userId: string;
  role: string;
  lastActiveAt: string;
}

export interface SessionMessage {
  id: string;
  sessionId: string;
  senderId: string | null;
  senderType: "USER" | "AGENT";
  role: "user" | "assistant";
  content: string;
  actions: Array<{ type: string; label: string; id: string | null; url: string | null }>;
  followUps: string[];
  senderName?: string;
  createdAt: string;
}

export interface StudioSession {
  id: string;
  title: string;
  businessId: string;
  createdById: string;
  participants: SessionParticipant[];
  messages: SessionMessage[];
}

/**
 * Connects to a shared Command Studio session via Socket.IO.
 * Mirrors the join/leave lifecycle pattern from useIncidentPresence —
 * one socket per mounted hook instance, disconnected on unmount or when
 * sessionId changes.
 *
 * Pass null for sessionId to stay disconnected (e.g. when in personal mode).
 */
export function useStudioSession(sessionId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [session, setSession] = useState<StudioSession | null>(null);
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [agentThinking, setAgentThinking] = useState(false);
  const [agentThinkingBy, setAgentThinkingBy] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      // Reset all state when disconnected
      setSession(null);
      setMessages([]);
      setParticipants([]);
      setTypingUsers(new Set());
      setAgentThinking(false);
      setAgentThinkingBy(null);
      setConnected(false);
      return;
    }

    const socket = initSocket();
    socketRef.current = socket;

    const join = () => {
      setConnected(true);
      socket.emit("studio:join", { sessionId });
    };

    const handleSessionJoined = ({ session: s }: { session: StudioSession }) => {
      setSession(s);
      setMessages(s.messages ?? []);
      setParticipants(s.participants ?? []);
    };

    const handleParticipantsUpdated = ({ participants: p }: { participants: SessionParticipant[] }) => {
      setParticipants(p);
    };

    const handleMessageCreated = ({ message }: { message: SessionMessage }) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        return exists ? prev : [...prev, message];
      });
    };

    const handleAgentThinking = ({ triggeredBy }: { triggeredBy: { userId: string; name: string } }) => {
      setAgentThinking(true);
      setAgentThinkingBy(triggeredBy?.name ?? null);
    };

    const handleAgentDone = () => {
      setAgentThinking(false);
      setAgentThinkingBy(null);
    };

    const handleUserTyping = ({ userId: uid, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (isTyping) {
          next.add(uid);
        } else {
          next.delete(uid);
        }
        return next;
      });
    };

    const handleDisconnect = () => setConnected(false);

    socket.on("connect", join);
    socket.on("disconnect", handleDisconnect);
    socket.on("studio:session_joined", handleSessionJoined);
    socket.on("studio:participants_updated", handleParticipantsUpdated);
    socket.on("studio:message_created", handleMessageCreated);
    socket.on("studio:agent_thinking", handleAgentThinking);
    socket.on("studio:agent_done", handleAgentDone);
    socket.on("studio:user_typing", handleUserTyping);

    // Join immediately if already connected
    if (socket.connected) {
      join();
    }

    return () => {
      socket.emit("studio:leave", { sessionId });
      socket.off("connect", join);
      socket.off("disconnect", handleDisconnect);
      socket.off("studio:session_joined", handleSessionJoined);
      socket.off("studio:participants_updated", handleParticipantsUpdated);
      socket.off("studio:message_created", handleMessageCreated);
      socket.off("studio:agent_thinking", handleAgentThinking);
      socket.off("studio:agent_done", handleAgentDone);
      socket.off("studio:user_typing", handleUserTyping);
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [sessionId]);

  const sendMessage = useCallback(
    (message: string, context?: { incidentId?: string }) => {
      if (!socketRef.current || !sessionId) return;
      socketRef.current.emit("studio:send_message", { sessionId, message, context });
    },
    [sessionId],
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!socketRef.current || !sessionId) return;
      socketRef.current.emit("studio:typing", { sessionId, isTyping });
    },
    [sessionId],
  );

  return {
    session,
    messages,
    participants,
    typingUsers,
    agentThinking,
    agentThinkingBy,
    connected,
    sendMessage,
    sendTyping,
  };
}
