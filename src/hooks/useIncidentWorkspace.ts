"use client";

import { querykeys } from "@/lib/constant";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  fetchIncidentComments,
  fetchIncidentContext,
  fetchIncidentDetail,
  fetchIncidentHistory,
  fetchIncidentMessages,
} from "@/lib/incident/incident.api";
import { deriveIncidentStats } from "@/lib/incident/incident.mapper";
import { useIncidentList } from "./useIncidentList";
import { useIncidentSelection } from "./useIncidentSelection";

export const useIncidentDetail = (incidentId?: string | null) => {
  return useQuery({
    queryKey: [querykeys.INCIDENT_DETAIL, incidentId],
    queryFn: async () => (incidentId ? fetchIncidentDetail(incidentId) : null),
    enabled: Boolean(incidentId),
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useIncidentWorkspace = () => {
  const selection = useIncidentSelection();
  const listQuery = useIncidentList();
  const detailQuery = useIncidentDetail(selection.incidentId);

  const [historyQuery, commentsQuery, messagesQuery, contextQuery] = useQueries({
    queries: [
      {
        queryKey: [querykeys.HISTORY, selection.incidentId],
        queryFn: async () =>
          selection.incidentId ? fetchIncidentHistory(selection.incidentId) : [],
        enabled: Boolean(selection.incidentId),
        refetchOnWindowFocus: false,
      },
      {
        queryKey: [querykeys.COMMENTS, selection.incidentId],
        queryFn: async () =>
          selection.incidentId ? fetchIncidentComments(selection.incidentId) : [],
        enabled: Boolean(selection.incidentId),
        refetchOnWindowFocus: false,
      },
      {
        queryKey: [querykeys.MESSAGES, selection.incidentId],
        queryFn: async () =>
          selection.incidentId ? fetchIncidentMessages(selection.incidentId) : [],
        enabled: Boolean(selection.incidentId),
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["INCIDENT_CONTEXT", selection.incidentId],
        queryFn: async () =>
          selection.incidentId ? fetchIncidentContext(selection.incidentId) : null,
        enabled: Boolean(selection.incidentId),
        refetchOnWindowFocus: false,
      },
    ],
  });

  const incidents = listQuery.data?.incidents ?? [];
  const stats = deriveIncidentStats(incidents);
  const selectedIncident = detailQuery.data ?? null;
  const hasSelection = Boolean(selection.incidentId);
  const detailStatusCode = (
    detailQuery.error as { response?: { status?: number } } | null
  )?.response?.status;
  const isSelectionInvalid =
    hasSelection &&
    !detailQuery.isLoading &&
    !detailQuery.isFetching &&
    (!selectedIncident || detailStatusCode === 404);

  return {
    ...selection,
    incidents,
    pagination: listQuery.data?.pagination,
    stats,
    selectedIncident,
    history: historyQuery.data ?? [],
    comments: commentsQuery.data ?? [],
    messages: messagesQuery.data ?? [],
    context: contextQuery.data ?? null,
    isListLoading: listQuery.isLoading,
    isSelectionLoading:
      detailQuery.isLoading ||
      historyQuery.isLoading ||
      commentsQuery.isLoading ||
      messagesQuery.isLoading ||
      contextQuery.isLoading,
    isSelectionInvalid,
    listQuery,
    detailQuery,
    historyQuery,
    commentsQuery,
    messagesQuery,
    contextQuery,
  };
};
