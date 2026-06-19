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
