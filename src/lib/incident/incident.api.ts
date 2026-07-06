import axios from "axios";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";
import {
  extractIncidentCommentsResponse,
  extractIncidentContextResponse,
  extractIncidentDetailResponse,
  extractIncidentHistoryResponse,
  extractIncidentListResponse,
  extractIncidentMessagesResponse,
  extractIncidentPostMortemsResponse,
} from "./incident.mapper";

export const fetchIncidentList = async () => {
  const response = await customAxios.get(endpoint.incident_ticket.get);
  return extractIncidentListResponse(response.data);
};

export const createIncident = async (payload: Record<string, unknown>) => {
  const response = await customAxios.post(endpoint.incident_ticket.create, payload);
  const incident = extractIncidentDetailResponse(response.data);

  if (!incident) {
    throw new Error("Unable to decode the created incident.");
  }

  return incident;
};

export const updateIncident = async (
  incidentId: string,
  payload: Record<string, unknown>
) => {
  const response = await customAxios.put(
    `${endpoint.incident_ticket.update}/${incidentId}`,
    payload
  );
  const incident = extractIncidentDetailResponse(response.data);

  if (!incident) {
    throw new Error("Unable to decode the updated incident.");
  }

  return incident;
};

const transitionIncidentStatus = async (
  stage: "acknowledge" | "investigate" | "mitigate" | "close",
  incidentId: string
) => {
  const response = await customAxios.post(
    `${endpoint.incident_ticket[stage]}/${incidentId}/${stage}`
  );
  const incident = extractIncidentDetailResponse(response.data);

  if (!incident) {
    throw new Error(`Unable to decode the incident after ${stage}.`);
  }

  return incident;
};

export const acknowledgeIncident = (incidentId: string) =>
  transitionIncidentStatus("acknowledge", incidentId);

export const investigateIncident = (incidentId: string) =>
  transitionIncidentStatus("investigate", incidentId);

export const mitigateIncident = (incidentId: string) =>
  transitionIncidentStatus("mitigate", incidentId);

export const closeIncident = (incidentId: string) =>
  transitionIncidentStatus("close", incidentId);

export interface IncidentAttachmentRecord {
  id: string;
  name: string;
  type: string | null;
  size: number | null;
  createdAt: string;
  downloadUrl?: string;
}

// Uploads a single file directly to S3 via a presigned URL, then confirms the
// upload with the server so it's persisted against the incident.
export const uploadIncidentAttachment = async (
  incidentId: string,
  file: File
): Promise<IncidentAttachmentRecord> => {
  const contentType = file.type || "application/octet-stream";

  const presignResponse = await customAxios.post(
    `${endpoint.incident_ticket.attachments}/${incidentId}/attachments/presign`,
    { name: file.name, type: contentType, size: file.size }
  );
  const { uploadUrl, key } = presignResponse.data?.data ?? presignResponse.data ?? {};
  if (!uploadUrl || !key) {
    throw new Error("Unable to obtain an upload URL for this file.");
  }

  await axios.put(uploadUrl, file, { headers: { "Content-Type": contentType } });

  const confirmResponse = await customAxios.post(
    `${endpoint.incident_ticket.attachments}/${incidentId}/attachments`,
    { key, name: file.name, type: contentType, size: file.size }
  );
  const attachment = confirmResponse.data?.data ?? confirmResponse.data;
  return attachment as IncidentAttachmentRecord;
};

export interface StagedAttachment {
  key: string;
  name: string;
  type: string;
  size: number;
  downloadUrl: string;
}

// Uploads a file directly to S3 before any incident ticket exists yet (the
// manual-create flow's "auto-upload immediately on add" requirement). The
// returned `key` is what gets passed in `attachments` when the incident is
// created — the server adopts it into a real IncidentAttachment row at that
// point. `onProgress` receives 0-100 as the browser reports upload progress.
export const uploadStagingIncidentAttachment = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<StagedAttachment> => {
  const contentType = file.type || "application/octet-stream";

  const presignResponse = await customAxios.post(
    endpoint.incident_ticket.attachments_staging_presign,
    { name: file.name, type: contentType, size: file.size }
  );
  const { uploadUrl, downloadUrl, key } = presignResponse.data?.data ?? presignResponse.data ?? {};
  if (!uploadUrl || !key) {
    throw new Error("Unable to obtain an upload URL for this file.");
  }

  await axios.put(uploadUrl, file, {
    headers: { "Content-Type": contentType },
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });

  return { key, name: file.name, type: contentType, size: file.size, downloadUrl };
};

// Best-effort cleanup for a staged file the user removed before submitting
// the create form. Never throws — an orphaned staging object is harmless.
export const deleteStagingIncidentAttachment = async (key: string): Promise<void> => {
  try {
    await customAxios.delete(endpoint.incident_ticket.attachments_staging_delete, { data: { key } });
  } catch {
    // Best-effort.
  }
};

export const fetchIncidentAttachments = async (
  incidentId: string
): Promise<IncidentAttachmentRecord[]> => {
  const response = await customAxios.get(
    `${endpoint.incident_ticket.attachments}/${incidentId}/attachments`
  );
  return (response.data?.data ?? response.data ?? []) as IncidentAttachmentRecord[];
};

export const deleteIncidentAttachment = async (
  incidentId: string,
  attachmentId: string
) => {
  await customAxios.delete(
    `${endpoint.incident_ticket.attachments}/${incidentId}/attachments/${attachmentId}`
  );
};

export const fetchIncidentDetail = async (incidentId: string) => {
  const response = await customAxios.get(
    `${endpoint.incident_ticket.getTicket}/${incidentId}`
  );
  return extractIncidentDetailResponse(response.data);
};

export const fetchIncidentHistory = async (incidentId: string) => {
  const response = await customAxios.get(
    `${endpoint.incident_ticket.history}/${incidentId}`
  );
  return extractIncidentHistoryResponse(response.data);
};

export const deleteIncident = async (incidentId: string) => {
  await customAxios.delete(`${endpoint.incident_ticket.update}/${incidentId}`);
};

export const fetchIncidentComments = async (incidentId: string) => {
  const response = await customAxios.get(
    `${endpoint.incident_ticket.get_comment}/${incidentId}`
  );
  return extractIncidentCommentsResponse(response.data);
};

export const fetchIncidentMessages = async (incidentId: string) => {
  const response = await customAxios.get(
    `${endpoint.incident_ticket.get_messages}/${incidentId}`
  );
  return extractIncidentMessagesResponse(response.data);
};

export const fetchIncidentContext = async (incidentId: string) => {
  try {
    const response = await customAxios.get(
      `${endpoint.incident_ticket.context_get}/${incidentId}/context`
    );
    return extractIncidentContextResponse(response.data);
  } catch (error) {
    if ((error as { response?: { status?: number } })?.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

export const fetchIncidentPostMortems = async () => {
  const response = await customAxios.get(endpoint.incident_ticket.get_postmortems);
  return extractIncidentPostMortemsResponse(response.data);
};

export const saveIncidentContext = async (
  incidentId: string,
  payload: Record<string, unknown>
) => {
  const response = await customAxios.put(
    `${endpoint.incident_ticket.context_update}/${incidentId}/context`,
    payload
  );
  return extractIncidentContextResponse(response.data);
};
