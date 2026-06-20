import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";
import {
  HandoverAutomationRuleRecord,
  HandoverRecord,
  HandoverScheduleRecord,
  HandoverTaskRecord,
} from "@/app/(incident)/incident/handover/_modules/types/index";

const unwrap = <T,>(payload: any): T => payload?.data ?? payload;

// ── Handovers ───────────────────────────────────────────────────────

export const fetchHandovers = async (filters?: { status?: string; search?: string }): Promise<HandoverRecord[]> => {
  const res = await customAxios.get(endpoint.handover.base, { params: filters });
  return unwrap<HandoverRecord[]>(res.data) ?? [];
};

export const fetchHandoverById = async (id: string): Promise<HandoverRecord> => {
  const res = await customAxios.get(`${endpoint.handover.base}/${id}`);
  return unwrap<HandoverRecord>(res.data);
};

export const createHandover = async (payload: {
  shiftType?: string;
  shiftWindowStart: string;
  shiftWindowEnd: string;
  transferAt: string;
  currentOwnerLabel: string;
  currentCommanderId?: string | null;
  nextOwnerLabel: string;
  nextCommanderId?: string | null;
  scheduleId?: string | null;
  incidentIds?: string[];
  primaryIncidentId?: string;
  initialNotes?: string;
}): Promise<HandoverRecord> => {
  const res = await customAxios.post(endpoint.handover.base, payload);
  return unwrap<HandoverRecord>(res.data);
};

export const updateHandover = async (
  id: string,
  payload: Partial<{
    transferAt: string;
    currentOwnerLabel: string;
    currentCommanderId: string | null;
    nextOwnerLabel: string;
    nextCommanderId: string | null;
  }>
): Promise<HandoverRecord> => {
  const res = await customAxios.patch(`${endpoint.handover.base}/${id}`, payload);
  return unwrap<HandoverRecord>(res.data);
};

export class TransferBlockedError extends Error {
  blockingTasks: { id: string; title: string }[];
  constructor(message: string, blockingTasks: { id: string; title: string }[]) {
    super(message);
    this.blockingTasks = blockingTasks;
  }
}

export const transferHandover = async (
  id: string,
  payload: { confirmationNote?: string; force?: boolean }
): Promise<HandoverRecord> => {
  try {
    const res = await customAxios.post(`${endpoint.handover.base}/${id}/transfer`, payload);
    return unwrap<HandoverRecord>(res.data);
  } catch (error) {
    const response = (error as { response?: { status?: number; data?: any } })?.response;
    if (response?.status === 422 && response.data?.blockingTasks) {
      throw new TransferBlockedError(response.data.message ?? "Transfer blocked", response.data.blockingTasks);
    }
    throw error;
  }
};

export const attachHandover = async (
  id: string,
  payload: { targetHandoverId: string; primaryStrategy?: "KEEP_TARGET" | "MAKE_SOURCE_PRIMARY"; mergeNote?: string }
): Promise<HandoverRecord> => {
  const res = await customAxios.post(`${endpoint.handover.base}/${id}/attach`, payload);
  return unwrap<HandoverRecord>(res.data);
};

export const refreshEzraBrief = async (id: string): Promise<{ ezraBrief: HandoverRecord["ezraBrief"]; ezraBriefAt: string }> => {
  const res = await customAxios.post(`${endpoint.handover.base}/${id}/ezra/refresh`);
  return unwrap(res.data);
};

// ── Incidents ───────────────────────────────────────────────────────

export const addHandoverIncident = async (
  id: string,
  payload: { incidentId: string; isPrimary?: boolean; contextNotes?: string }
): Promise<HandoverRecord> => {
  const res = await customAxios.post(`${endpoint.handover.base}/${id}/incidents`, payload);
  return unwrap<HandoverRecord>(res.data);
};

export const removeHandoverIncident = async (id: string, linkId: string): Promise<HandoverRecord> => {
  const res = await customAxios.delete(`${endpoint.handover.base}/${id}/incidents/${linkId}`);
  return unwrap<HandoverRecord>(res.data);
};

// ── Notes ───────────────────────────────────────────────────────────

export const addHandoverNote = async (id: string, payload: { body: string; isCommander?: boolean }) => {
  const res = await customAxios.post(`${endpoint.handover.base}/${id}/notes`, payload);
  return unwrap(res.data);
};

// ── Tasks ───────────────────────────────────────────────────────────

export const addHandoverTask = async (
  id: string,
  payload: { title: string; assigneeLabel?: string; dueAt?: string; priority?: string }
): Promise<HandoverTaskRecord> => {
  const res = await customAxios.post(`${endpoint.handover.base}/${id}/tasks`, payload);
  return unwrap<HandoverTaskRecord>(res.data);
};

export const updateHandoverTask = async (
  id: string,
  taskId: string,
  payload: { status: "PENDING" | "COMPLETED" | "WAIVED" }
): Promise<HandoverTaskRecord> => {
  const res = await customAxios.patch(`${endpoint.handover.base}/${id}/tasks/${taskId}`, payload);
  return unwrap<HandoverTaskRecord>(res.data);
};

// ── Schedules ───────────────────────────────────────────────────────

export const fetchHandoverSchedules = async (): Promise<HandoverScheduleRecord[]> => {
  const res = await customAxios.get(endpoint.handover.schedules);
  return unwrap<HandoverScheduleRecord[]>(res.data) ?? [];
};

export const createHandoverSchedule = async (payload: {
  scheduleType?: string;
  label?: string;
  transferTime: string;
  fromLabel: string;
  toLabel: string;
  groupId?: string;
}): Promise<HandoverScheduleRecord> => {
  const res = await customAxios.post(endpoint.handover.schedules, payload);
  return unwrap<HandoverScheduleRecord>(res.data);
};

export const updateHandoverSchedule = async (
  id: string,
  payload: Partial<{ label: string; transferTime: string; fromLabel: string; toLabel: string; isActive: boolean }>
): Promise<HandoverScheduleRecord> => {
  const res = await customAxios.patch(`${endpoint.handover.schedules}/${id}`, payload);
  return unwrap<HandoverScheduleRecord>(res.data);
};

export const deleteHandoverSchedule = async (id: string): Promise<void> => {
  await customAxios.delete(`${endpoint.handover.schedules}/${id}`);
};

// ── Automation rules ────────────────────────────────────────────────

export const fetchHandoverAutomationRule = async (): Promise<HandoverAutomationRuleRecord> => {
  const res = await customAxios.get(endpoint.handover.automation);
  return unwrap<HandoverAutomationRuleRecord>(res.data);
};

export const updateHandoverAutomationRule = async (
  payload: Partial<HandoverAutomationRuleRecord>
): Promise<HandoverAutomationRuleRecord> => {
  const res = await customAxios.patch(endpoint.handover.automation, payload);
  return unwrap<HandoverAutomationRuleRecord>(res.data);
};
