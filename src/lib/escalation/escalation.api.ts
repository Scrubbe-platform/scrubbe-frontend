import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";
import {
  ActiveEscalationRecord,
  AutoEscalationRuleRecord,
  EscalationPolicyRecord,
  EscalationStepRecord,
  OnCallConfigRecord,
} from "@/app/(incident)/incident/on-call/_module/types/oncall-type";

const unwrap = <T,>(payload: any): T => payload?.data ?? payload;

// ── Policies ────────────────────────────────────────────────────────

export const fetchEscalationPolicies = async (): Promise<EscalationPolicyRecord[]> => {
  const res = await customAxios.get(endpoint.escalation.policies);
  return unwrap<EscalationPolicyRecord[]>(res.data) ?? [];
};

export const createEscalationPolicy = async (payload: {
  name: string;
  severities: string[];
  autoEscalate: boolean;
  warRoomOnFinalStep: boolean;
  steps: EscalationStepRecord[];
}): Promise<EscalationPolicyRecord> => {
  const res = await customAxios.post(endpoint.escalation.policies, payload);
  return unwrap<EscalationPolicyRecord>(res.data);
};

export const updateEscalationPolicy = async (
  id: string,
  payload: Partial<{
    name: string;
    severities: string[];
    autoEscalate: boolean;
    warRoomOnFinalStep: boolean;
    isActive: boolean;
    steps: EscalationStepRecord[];
  }>
): Promise<EscalationPolicyRecord> => {
  const res = await customAxios.put(`${endpoint.escalation.policies}/${id}`, payload);
  return unwrap<EscalationPolicyRecord>(res.data);
};

export const deleteEscalationPolicy = async (id: string): Promise<void> => {
  await customAxios.delete(`${endpoint.escalation.policies}/${id}`);
};

// ── Auto-escalation rules ──────────────────────────────────────────

export const fetchAutoEscalationRules = async (): Promise<AutoEscalationRuleRecord[]> => {
  const res = await customAxios.get(endpoint.escalation.rules);
  return unwrap<AutoEscalationRuleRecord[]>(res.data) ?? [];
};

export const createAutoEscalationRule = async (payload: {
  name: string;
  enabled?: boolean;
  matchType?: "ALL" | "ANY";
  conditions: unknown;
  action: unknown;
  order?: number;
}): Promise<AutoEscalationRuleRecord> => {
  const res = await customAxios.post(endpoint.escalation.rules, payload);
  return unwrap<AutoEscalationRuleRecord>(res.data);
};

export const updateAutoEscalationRule = async (
  id: string,
  payload: Partial<{
    name: string;
    enabled: boolean;
    matchType: "ALL" | "ANY";
    conditions: unknown;
    action: unknown;
    order: number;
  }>
): Promise<AutoEscalationRuleRecord> => {
  const res = await customAxios.put(`${endpoint.escalation.rules}/${id}`, payload);
  return unwrap<AutoEscalationRuleRecord>(res.data);
};

export const deleteAutoEscalationRule = async (id: string): Promise<void> => {
  await customAxios.delete(`${endpoint.escalation.rules}/${id}`);
};

// ── Config / timeout matrix ────────────────────────────────────────

export const fetchOnCallConfig = async (): Promise<OnCallConfigRecord> => {
  const res = await customAxios.get(endpoint.escalation.config);
  return unwrap<OnCallConfigRecord>(res.data);
};

export const updateOnCallConfig = async (
  payload: Partial<{
    autoEscalateEnabled: boolean;
    warRoomTriggerEnabled: boolean;
    channelsAutoCreate: boolean;
    smsFallback: boolean;
    offHoursStrict: boolean;
    timeoutMatrix: Record<string, number[]>;
  }>
): Promise<OnCallConfigRecord> => {
  const res = await customAxios.patch(endpoint.escalation.config, payload);
  return unwrap<OnCallConfigRecord>(res.data);
};

// ── Active escalation tracking ─────────────────────────────────────

export const fetchActiveEscalations = async (): Promise<ActiveEscalationRecord[]> => {
  const res = await customAxios.get(endpoint.escalation.active);
  return unwrap<ActiveEscalationRecord[]>(res.data) ?? [];
};

export const fetchEscalationForTicket = async (
  ticketId: string
): Promise<ActiveEscalationRecord | null> => {
  try {
    const res = await customAxios.get(`${endpoint.escalation.forTicket}/${ticketId}`);
    return unwrap<ActiveEscalationRecord>(res.data);
  } catch (error) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// ── Roster assignment edit/remove ──────────────────────────────────

export const updateOnCallAssignment = async (
  memberId: string,
  payload: { userId?: string; startTime?: string; endTime?: string }
) => {
  const res = await customAxios.patch(`${endpoint.on_call.update_assignment}/${memberId}`, payload);
  return unwrap<any>(res.data);
};

export const removeOnCallAssignment = async (memberId: string): Promise<void> => {
  await customAxios.delete(`${endpoint.on_call.remove_assignment}/${memberId}`);
};
