/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { customAxios } from "@/lib/api/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClusterEnrichment {
  id: string;
  clusterId: string;
  businessId: string;
  scope: "MEMBER_ONLY" | "CLUSTER_WIDE" | "CONDITIONAL";
  key: string;
  value: unknown;
  source?: string;
  origin: "MEMBER" | "CLUSTER_FANOUT";
  fingerprint?: string;
  createdAt: string;
}

export interface Cluster {
  id: string;
  businessId: string;
  anchorIncidentId?: string;
  memberIds: string[];
  bindingDimension?: Record<string, unknown>;
  state: "FORMING" | "ACTIVE" | "RESOLVING" | "RESOLVED" | "DISSOLVED";
  canonicalResolution?: {
    rootCause: string;
    remediation: string;
    confidence: number;
    setBy?: string;
    setAt?: string;
  };
  sharedRisk?: unknown;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  enrichments: ClusterEnrichment[];
}

export interface CreateClusterInput {
  anchorIncidentId: string;
  bindingDimension?: Record<string, unknown>;
  memberIds?: string[];
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

// ─── useCreateCluster ─────────────────────────────────────────────────────────

export function useCreateCluster() {
  const [state, setState] = useState<MutationState<Cluster>>({
    data: null,
    loading: false,
    error: null,
  });

  const createCluster = useCallback(async (input: CreateClusterInput) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await customAxios.post<{ success: boolean; data: Cluster }>(
        "/clusters",
        input
      );
      const result = response.data.data;
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.detail ??
        "Failed to create cluster";
      setState({ data: null, loading: false, error: msg });
      throw new Error(msg);
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, createCluster, reset };
}

// ─── useCluster ───────────────────────────────────────────────────────────────

export function useCluster(id: string | null | undefined): QueryState<Cluster> {
  const [state, setState] = useState<Omit<QueryState<Cluster>, "refetch">>({
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
      .get<{ success: boolean; data: Cluster }>(`/clusters/${id}`)
      .then((res) => {
        if (!cancelled) setState({ data: res.data.data, loading: false, error: null });
      })
      .catch((err: any) => {
        if (!cancelled) {
          const msg = err?.response?.data?.message ?? "Failed to fetch cluster";
          setState({ data: null, loading: false, error: msg });
        }
      });

    return () => { cancelled = true; };
  }, [id, tick]);

  return { ...state, refetch };
}

// ─── useClusters ──────────────────────────────────────────────────────────────

export function useClusters(anchorIncidentId?: string): QueryState<Cluster[]> & { total: number } {
  const [state, setState] = useState<Omit<QueryState<Cluster[]>, "refetch"> & { total: number }>({
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
    if (anchorIncidentId) params.anchorIncidentId = anchorIncidentId;

    customAxios
      .get<{ success: boolean; clusters: Cluster[]; total: number }>("/clusters", { params })
      .then((res) => {
        if (!cancelled) {
          setState({
            data: res.data.clusters ?? [],
            loading: false,
            error: null,
            total: res.data.total ?? 0,
          });
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          const msg = err?.response?.data?.message ?? "Failed to fetch clusters";
          setState({ data: null, loading: false, error: msg, total: 0 });
        }
      });

    return () => { cancelled = true; };
  }, [anchorIncidentId, tick]);

  return { ...state, refetch };
}

// ─── useAddClusterMember ──────────────────────────────────────────────────────

export function useAddClusterMember() {
  const [state, setState] = useState<MutationState<Cluster>>({
    data: null,
    loading: false,
    error: null,
  });

  const addMember = useCallback(async (clusterId: string, incidentId: string) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await customAxios.post<{ success: boolean; data: Cluster }>(
        `/clusters/${clusterId}/members`,
        { incidentId }
      );
      const result = response.data.data;
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to add cluster member";
      setState({ data: null, loading: false, error: msg });
      throw new Error(msg);
    }
  }, []);

  return { ...state, addMember };
}

// ─── useSetCanonicalResolution ────────────────────────────────────────────────

export function useSetCanonicalResolution() {
  const [state, setState] = useState<MutationState<Cluster>>({
    data: null,
    loading: false,
    error: null,
  });

  const setResolution = useCallback(
    async (
      clusterId: string,
      data: { rootCause: string; remediation: string; confidence: number }
    ) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await customAxios.post<{ success: boolean; data: Cluster }>(
          `/clusters/${clusterId}/canonical-resolution`,
          data
        );
        const result = response.data.data;
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? "Failed to set canonical resolution";
        setState({ data: null, loading: false, error: msg });
        throw new Error(msg);
      }
    },
    []
  );

  return { ...state, setResolution };
}
