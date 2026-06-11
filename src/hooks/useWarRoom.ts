/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { customAxios } from "@/lib/api/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WarRoomDecision {
  id: string;
  warRoomId: string;
  action: string;
  decidedBy: string;
  reason?: string;
  outcome?: string;
  createdAt: string;
}

export interface WarRoom {
  id: string;
  businessId: string;
  incidentId?: string;
  state: "REQUESTED" | "PROVISIONING" | "READY" | "DEGRADED" | "ARCHIVING" | "ARCHIVED" | "FAILED";
  provider: string;
  meetingUrl?: string;
  channelRef?: string;
  principals: string[];
  reason?: string;
  createdBy?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
  decisions: WarRoomDecision[];
}

export interface CreateWarRoomInput {
  incidentId?: string;
  provider?: string;
  reason?: string;
  principals?: string[];
  priority?: string;
}

interface MutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── useCreateWarRoom ─────────────────────────────────────────────────────────

export function useCreateWarRoom() {
  const [state, setState] = useState<MutationState<{ warRoomId: string; state: string }>>({
    data: null,
    loading: false,
    error: null,
  });

  const createWarRoom = useCallback(async (input: CreateWarRoomInput) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await customAxios.post<{ success: boolean; data: { warRoomId: string; state: string } }>(
        "/api/v1/warrooms",
        input
      );
      const result = response.data.data;
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.detail ??
        "Failed to create war room";
      setState({ data: null, loading: false, error: msg });
      throw new Error(msg);
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, createWarRoom, reset };
}

// ─── useWarRoom ───────────────────────────────────────────────────────────────

export function useWarRoom(id: string | null | undefined): QueryState<WarRoom> {
  const [state, setState] = useState<Omit<QueryState<WarRoom>, "refetch">>({
    data: null,
    loading: false,
    error: null,
  });

  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setState((s) => ({ ...s, loading: true, error: null }));

    customAxios
      .get<{ success: boolean; data: WarRoom }>(`/api/v1/warrooms/${id}`)
      .then((res) => {
        if (!cancelled) setState({ data: res.data.data, loading: false, error: null });
      })
      .catch((err: any) => {
        if (!cancelled) {
          const msg = err?.response?.data?.message ?? "Failed to fetch war room";
          setState({ data: null, loading: false, error: msg });
        }
      });

    return () => { cancelled = true; };
  }, [id, tick]);

  return { ...state, refetch };
}

// ─── useWarRooms ──────────────────────────────────────────────────────────────

export function useWarRooms(incidentId?: string): QueryState<WarRoom[]> & { total: number } {
  const [state, setState] = useState<Omit<QueryState<WarRoom[]>, "refetch"> & { total: number }>({
    data: null,
    loading: false,
    error: null,
    total: 0,
  });

  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    setState((s) => ({ ...s, loading: true, error: null }));

    const params: Record<string, string> = {};
    if (incidentId) params.incidentId = incidentId;

    customAxios
      .get<{ success: boolean; warRooms: WarRoom[]; total: number }>("/api/v1/warrooms", { params })
      .then((res) => {
        if (!cancelled) {
          setState({
            data: res.data.warRooms ?? [],
            loading: false,
            error: null,
            total: res.data.total ?? 0,
          });
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          const msg = err?.response?.data?.message ?? "Failed to fetch war rooms";
          setState({ data: null, loading: false, error: msg, total: 0 });
        }
      });

    return () => { cancelled = true; };
  }, [incidentId, tick]);

  return { ...state, refetch };
}

// ─── useProvisionWarRoom ──────────────────────────────────────────────────────

export function useProvisionWarRoom() {
  const [state, setState] = useState<MutationState<WarRoom>>({
    data: null,
    loading: false,
    error: null,
  });

  const provision = useCallback(async (warRoomId: string) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await customAxios.post<{ success: boolean; data: WarRoom }>(
        `/api/v1/warrooms/${warRoomId}/provision`
      );
      const result = response.data.data;
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to provision war room";
      setState({ data: null, loading: false, error: msg });
      throw new Error(msg);
    }
  }, []);

  return { ...state, provision };
}

// ─── useCaptureWarRoomDecision ────────────────────────────────────────────────

export function useCaptureWarRoomDecision() {
  const [state, setState] = useState<MutationState<WarRoomDecision>>({
    data: null,
    loading: false,
    error: null,
  });

  const captureDecision = useCallback(
    async (warRoomId: string, decision: { action: string; reason?: string; outcome?: string }) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await customAxios.post<{ success: boolean; data: WarRoomDecision }>(
          `/api/v1/warrooms/${warRoomId}/decisions`,
          decision
        );
        const result = response.data.data;
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? "Failed to capture decision";
        setState({ data: null, loading: false, error: msg });
        throw new Error(msg);
      }
    },
    []
  );

  return { ...state, captureDecision };
}
