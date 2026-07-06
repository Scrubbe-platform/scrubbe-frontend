import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { ServerApiKey, CreatedApiKey, toUiKey } from "../types/apiKeys";

const QUERY_KEY = ["api-keys"] as const;

// ── List ──────────────────────────────────────────────────────────────────────

export function useApiKeys() {
  const { get } = useFetch();

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await get(endpoint.api_key.get);
      if (!res.success) throw new Error(String(res.data ?? "Failed to load API keys"));
      const serverKeys: ServerApiKey[] = res.data?.data ?? res.data ?? [];
      return serverKeys.map(toUiKey);
    },
  });
}

// ── Create ────────────────────────────────────────────────────────────────────

export function useCreateApiKey() {
  const { post } = useFetch();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      environment: "PRODUCTION" | "DEVELOPMENT";
      scopes: string[];
      expiresAt?: string;
    }) => {
      const res = await post(endpoint.api_key.create, payload);
      if (!res.success) throw new Error(String(res.data ?? "Failed to create API key"));
      const created: CreatedApiKey = res.data?.data ?? res.data;
      return created;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// ── Rotate ────────────────────────────────────────────────────────────────────

export function useRotateApiKey() {
  const { post } = useFetch();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await post(`${endpoint.api_key.rotate}/${id}/rotate`);
      if (!res.success) throw new Error(String(res.data ?? "Failed to rotate API key"));
      const result: { id: string; key: string } = res.data?.data ?? res.data;
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// ── Revoke (suspend — sets isActive:false, reversible via update) ─────────────

export function useRevokeApiKey() {
  const { post } = useFetch();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await post(`${endpoint.api_key.revoke}/${id}/revoke`);
      if (!res.success) throw new Error(String(res.data ?? "Failed to suspend API key"));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// ── Update (rename or reactivate) ─────────────────────────────────────────────

export function useUpdateApiKey() {
  const { put } = useFetch();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; isActive?: boolean };
    }) => {
      const res = await put(`${endpoint.api_key.update}/${id}`, data);
      if (!res.success) throw new Error(String(res.data ?? "Failed to update API key"));
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// ── Delete (permanent revoke) ─────────────────────────────────────────────────

export function useDeleteApiKey() {
  const { remove } = useFetch();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await remove(endpoint.api_key.delete, id);
      if (!res.success) throw new Error(String(res.data ?? "Failed to delete API key"));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
