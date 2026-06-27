"use client";

import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { initSocket } from "@/lib/api/socket";
import { useFetch } from "./useFetch";
import { endpoint } from "@/lib/api/endpoint";

export interface IncidentPresenceRow {
  id: string;
  userId: string;
  status: "ONLINE" | "AWAY" | "DISCONNECTED";
  lastHeartbeatAt: string;
}

const HEARTBEAT_INTERVAL_MS = 15_000;

/**
 * Joins the Live Incident Workspace presence room for a ticket and keeps a
 * live list of who's currently viewing it. Mirrors the join/heartbeat/leave
 * lifecycle and socket cleanup pattern already used by Collaboration.tsx —
 * one socket connection per mounted component, torn down on unmount.
 */
export function useIncidentPresence(ticketId?: string | null) {
  const { get } = useFetch();
  const [viewers, setViewers] = useState<IncidentPresenceRow[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!ticketId) return;

    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

    const loadSnapshot = async () => {
      const res = await get(`${endpoint.incident_workspace.presence}/${ticketId}/presence`);
      if (res.success) {
        setViewers((res.data?.data ?? res.data ?? []) as IncidentPresenceRow[]);
      }
    };

    const socket = initSocket();
    socketRef.current = socket;

    const join = () => {
      socket.emit("workspace:join", { ticketId });
      heartbeatTimer = setInterval(() => {
        socket.emit("workspace:heartbeat", { ticketId });
      }, HEARTBEAT_INTERVAL_MS);
    };

    const handleJoined = (payload: { ticketId: string; userId: string }) => {
      if (payload.ticketId !== ticketId) return;
      setViewers((prev) =>
        prev.some((v) => v.userId === payload.userId)
          ? prev
          : [...prev, { id: payload.userId, userId: payload.userId, status: "ONLINE", lastHeartbeatAt: new Date().toISOString() }]
      );
    };

    const handleLeft = (payload: { ticketId: string; userId: string }) => {
      if (payload.ticketId !== ticketId) return;
      setViewers((prev) => prev.filter((v) => v.userId !== payload.userId));
    };

    void loadSnapshot();

    if (socket.connected) join();
    socket.on("connect", join);
    socket.on("workspace:presence_joined", handleJoined);
    socket.on("workspace:presence_left", handleLeft);

    return () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      socket.emit("workspace:leave", { ticketId });
      socket.off("connect", join);
      socket.off("workspace:presence_joined", handleJoined);
      socket.off("workspace:presence_left", handleLeft);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  return viewers;
}
