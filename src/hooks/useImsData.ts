"use client";

import { useCallback, useEffect, useState } from "react";
import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";

// ─── Generic fetch helper ─────────────────────────────────────────────────────

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useFetchOnce<T>(url: string | null, deps: any[] = []) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: !!url,
    error: null,
  });

  const refetch = useCallback(async () => {
    if (!url) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await customAxios.get(url);
      const payload = res.data?.data ?? res.data;
      setState({ data: payload, loading: false, error: null });
    } catch (err: any) {
      setState({
        data: null,
        loading: false,
        error: err?.response?.data?.message ?? "Failed to load data",
      });
    }
  }, [url]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps]);

  return { ...state, refetch };
}

// ─── Problems ─────────────────────────────────────────────────────────────────

export interface Problem {
  id: string;
  ticketId?: string;
  title: string;
  summary?: string;
  description?: string;
  priority: string;
  status: string;
  category?: string;
  impact?: string;
  urgency?: string;
  owner?: string;
  assignee?: { name: string; role: string };
  watchers?: number;
  watching?: boolean;
  opened?: string;
  target?: string;
  activity?: string;
  confidence?: number;
  rootcause?: { title: string; body: string };
  workaround?: { active: boolean; text: string };
  incidents?: { id: string; sev: string; desc: string; date: string }[];
  services?: { n: string; i: string; cls: string }[];
  findings?: any[];
  steps?: any[];
  kb?: { published: boolean; autoSync: boolean; articleId: string | null; lastSynced: string | null; verified: boolean };
  createdAt?: string;
}

export function useProblems() {
  return useFetchOnce<Problem[]>(endpoint.problems.get);
}

export function useProblem(id: string | null) {
  return useFetchOnce<Problem>(id ? `${endpoint.problems.getOne}/${id}` : null, [id]);
}

export async function createProblem(payload: Partial<Problem>) {
  const res = await customAxios.post(endpoint.problems.create, payload);
  return res.data?.data ?? res.data;
}

export async function updateProblem(id: string, payload: Partial<Problem>) {
  const res = await customAxios.put(`${endpoint.problems.update}/${id}`, payload);
  return res.data?.data ?? res.data;
}

// ─── Dashboard Metrics ────────────────────────────────────────────────────────

export interface DashboardMetrics {
  totalActive: number;
  resolvedToday: number;
  avgMttr: string;
  activeAgents: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  p1Count?: number;
  p0Count?: number;
}

export function useDashboardMetrics() {
  return useFetchOnce<DashboardMetrics>(endpoint.dashboard.get_metrics);
}

export function useDashboardAnalytics() {
  return useFetchOnce<any>(endpoint.dashboard.get_analytics);
}

// ─── SLA Analytics ────────────────────────────────────────────────────────────

export interface SlaAnalytics {
  breachTrend: { label: string; value: number }[];
  complianceRate: number;
  totalBreaches: number;
  byPriority: Record<string, number>;
  byTeam: Record<string, number>;
}

export function useSlaAnalytics() {
  return useFetchOnce<SlaAnalytics>(endpoint.sla_policies.analytics);
}

// ─── Decisions ────────────────────────────────────────────────────────────────

export interface Decision {
  id: string;
  title: string;
  description?: string;
  status: string;
  proposedBy?: string;
  approvedBy?: string;
  incidentId?: string;
  risk?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useDecisions(params?: { incidentId?: string; status?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.incidentId) query.set("incidentId", params.incidentId);
  if (params?.status) query.set("status", params.status);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return useFetchOnce<Decision[]>(`${endpoint.decisions.list}${qs ? "?" + qs : ""}`);
}

export function useDecisionLog(incidentId: string | null) {
  return useFetchOnce<Decision[]>(
    incidentId ? `${endpoint.decisions.log}?incidentId=${incidentId}` : null,
    [incidentId]
  );
}

// ─── Blast Radius ─────────────────────────────────────────────────────────────

export interface BlastRadius {
  id?: string;
  incidentId?: string;
  affectedServices: string[];
  userImpact?: number;
  revenueRisk?: string;
  riskLevel?: string;
  impactScore?: number;
  downstreamCount?: number;
}

export function useBlastRadius(incidentId: string | null) {
  return useFetchOnce<BlastRadius>(
    incidentId ? `${endpoint.blast_radius.list}?incidentId=${incidentId}` : null,
    [incidentId]
  );
}

// ─── Investigation Analysis ───────────────────────────────────────────────────

export interface InvestigationAnalysis {
  id?: string;
  incidentId?: string;
  rootCause?: string;
  hypotheses?: { hypothesis: string; confidence: number; supporting: string[] }[];
  recommendations?: string[];
  generatedAt?: string;
  status?: string;
}

export function useInvestigationAnalysis(incidentId: string | null) {
  return useFetchOnce<InvestigationAnalysis>(
    incidentId ? `${endpoint.investigation_analysis.get}/${incidentId}` : null,
    [incidentId]
  );
}

export async function generateInvestigationAnalysis(incidentId: string) {
  const res = await customAxios.post(
    `${endpoint.investigation_analysis.generate}/${incidentId}/generate`
  );
  return res.data?.data ?? res.data;
}

// ─── Role Permissions ─────────────────────────────────────────────────────────

export interface RolePermissionMatrix {
  roles: string[];
  permissions: string[];
  matrix: Record<string, Record<string, boolean>>;
}

export function useRolePermissions() {
  return useFetchOnce<RolePermissionMatrix>(endpoint.role_permissions.matrix);
}

export async function updateRolePermissions(matrix: Partial<RolePermissionMatrix>) {
  const res = await customAxios.put(endpoint.role_permissions.matrix, matrix);
  return res.data?.data ?? res.data;
}

// ─── Guardrails ───────────────────────────────────────────────────────────────

export interface Guardrail {
  id: string;
  name: string;
  description?: string;
  status: string;
  complianceRate?: number;
  violations?: number;
  lastTriggered?: string;
}

export function useGuardrails() {
  return useFetchOnce<Guardrail[]>(endpoint.guardrails.list);
}

export function useGuardrailViolations(params?: { limit?: number }) {
  const qs = params?.limit ? `?limit=${params.limit}` : "";
  return useFetchOnce<any[]>(`${endpoint.guardrails.violations}${qs}`);
}

// ─── Signals ──────────────────────────────────────────────────────────────────

export interface Signal {
  id: string;
  type?: string;
  source?: string;
  summary: string;
  severity?: string;
  status?: string;
  acknowledged?: boolean;
  incidentId?: string;
  timestamp?: string;
  createdAt?: string;
  metadata?: Record<string, any>;
}

export interface SignalStats {
  total: number;
  acknowledged: number;
  suppressed: number;
  errorCount?: number;
  bySource?: Record<string, number>;
  byType?: Record<string, number>;
}

export function useSignals(params?: { incidentId?: string; limit?: number; status?: string }) {
  const query = new URLSearchParams();
  if (params?.incidentId) query.set("incidentId", params.incidentId);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.status) query.set("status", params.status);
  const qs = query.toString();
  return useFetchOnce<Signal[]>(`${endpoint.signals.list}${qs ? "?" + qs : ""}`);
}

export function useSignalStats(params?: { incidentId?: string }) {
  const qs = params?.incidentId ? `?incidentId=${params.incidentId}` : "";
  return useFetchOnce<SignalStats>(`${endpoint.signals.stats}${qs}`);
}

// ─── Service Map ──────────────────────────────────────────────────────────────

export interface ServiceNode {
  id: string;
  name: string;
  status: "healthy" | "degraded" | "critical" | "unknown";
  criticality?: string;
  owner?: string;
  team?: string;
  eal?: string;
  sloTarget?: number;
  activeAlerts?: number;
  dependencyCount?: number;
  environment?: string;
  incidentCount?: number;
  uptime?: number;
  tags?: string[];
}

export function useServiceMap() {
  return useFetchOnce<ServiceNode[]>(endpoint.service_map.list);
}

export function useServiceDetail(id: string | null) {
  return useFetchOnce<ServiceNode>(
    id ? `${endpoint.service_map.getOne}/${id}` : null,
    [id]
  );
}

export function useServiceTopology() {
  return useFetchOnce<{ nodes: ServiceNode[]; edges: any[] }>(endpoint.service_map.topology);
}

export function useServiceDownstreamImpact(id: string | null) {
  return useFetchOnce<any>(
    id ? `${endpoint.service_map.downstreamImpact}/${id}/downstream-impact` : null,
    [id]
  );
}

// ─── Playbooks ────────────────────────────────────────────────────────────────

export interface PlaybookSummary {
  id: string;
  name: string;
  description?: string;
  category?: string;
  status?: string;
  version?: string;
  stepsCount?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  owner?: string;
}

export function usePlaybooks(params?: { status?: string; category?: string }) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.category) query.set("category", params.category);
  const qs = query.toString();
  return useFetchOnce<PlaybookSummary[]>(`${endpoint.playbooks.list}${qs ? "?" + qs : ""}`);
}

export function usePlaybookDetail(id: string | null) {
  return useFetchOnce<any>(
    id ? `${endpoint.playbooks.getOne}/${id}` : null,
    [id]
  );
}

export function usePlaybookStats() {
  return useFetchOnce<any>(endpoint.playbooks.stats);
}

// ─── Ezra Analysis ───────────────────────────────────────────────────────────

export interface EzraAnalysis {
  id?: string;
  incidentId?: string;
  rootCauseHypothesis?: string;
  derivedSeverity?: string;
  confidence?: number;
  recommendedAction?: string;
  reports?: { title: string; content: string }[];
  createdAt?: string;
}

export function useEzraAnalysis(incidentId: string | null) {
  return useFetchOnce<EzraAnalysis>(
    incidentId ? `${endpoint.ezra.analysis}/${incidentId}` : null,
    [incidentId]
  );
}

export function useEzraAnalyses(params?: { limit?: number }) {
  const qs = params?.limit ? `?limit=${params.limit}` : "";
  return useFetchOnce<EzraAnalysis[]>(`${endpoint.ezra.analyses}${qs}`);
}

// ─── Assignment Groups ────────────────────────────────────────────────────────

export interface AssignmentGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  memberCount?: number;
  members?: { userId: string; role: string; name?: string; email?: string }[];
  createdAt?: string;
}

export function useAssignmentGroups() {
  return useFetchOnce<AssignmentGroup[]>(endpoint.assignment_groups.list);
}

export function useAssignmentGroupDetail(id: string | null) {
  return useFetchOnce<AssignmentGroup>(id ? `${endpoint.assignment_groups.getOne}/${id}` : null, [id]);
}

export async function createAssignmentGroup(payload: Partial<AssignmentGroup>) {
  const res = await customAxios.post(endpoint.assignment_groups.create, payload);
  return res.data?.data ?? res.data;
}

export async function updateAssignmentGroup(id: string, payload: Partial<AssignmentGroup>) {
  const res = await customAxios.put(`${endpoint.assignment_groups.update}/${id}`, payload);
  return res.data?.data ?? res.data;
}

export async function deleteAssignmentGroup(id: string) {
  const res = await customAxios.delete(`${endpoint.assignment_groups.delete}/${id}`);
  return res.data;
}

export async function addGroupMember(groupId: string, userId: string, role = "MEMBER") {
  const res = await customAxios.post(`${endpoint.assignment_groups.addMember}/${groupId}/members`, { userId, role });
  return res.data?.data ?? res.data;
}

export async function removeGroupMember(groupId: string, userId: string) {
  const res = await customAxios.delete(`${endpoint.assignment_groups.removeMember}/${groupId}/members/${userId}`);
  return res.data;
}

// ─── Incident Relationships ───────────────────────────────────────────────────

export interface IncidentRelationship {
  id: string;
  parentId: string;
  childId: string;
  type: "CAUSED_BY" | "DUPLICATE_OF" | "RELATED_TO" | "BLOCKED_BY";
  createdAt?: string;
}

export function useIncidentRelationships(incidentId: string | null) {
  return useFetchOnce<{ parents: IncidentRelationship[]; children: IncidentRelationship[]; related: IncidentRelationship[] }>(
    incidentId ? `${endpoint.incident_relationships.list}/${incidentId}/relationships` : null,
    [incidentId]
  );
}

export async function createIncidentRelationship(
  incidentId: string,
  targetIncidentId: string,
  type: IncidentRelationship["type"]
) {
  const res = await customAxios.post(`${endpoint.incident_relationships.create}/${incidentId}/relationships`, {
    targetIncidentId,
    type,
  });
  return res.data?.data ?? res.data;
}

export async function deleteIncidentRelationship(incidentId: string, relationshipId: string) {
  const res = await customAxios.delete(`${endpoint.incident_relationships.delete}/${incidentId}/relationships/${relationshipId}`);
  return res.data;
}

// ─── Assets ───────────────────────────────────────────────────────────────────

export interface Asset {
  id: string;
  name: string;
  type: string;
  category?: string;
  status: "HEALTHY" | "DEGRADED" | "CRITICAL" | "UNKNOWN" | "DECOMMISSIONED";
  environment?: string;
  region?: string;
  owner?: string;
  team?: string;
  serviceId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  lastSeenAt?: string;
  createdAt?: string;
}

export function useAssets(params?: { type?: string; status?: string; environment?: string; limit?: number; offset?: number }) {
  const query = new URLSearchParams();
  if (params?.type) query.set("type", params.type);
  if (params?.status) query.set("status", params.status);
  if (params?.environment) query.set("environment", params.environment);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));
  const qs = query.toString();
  return useFetchOnce<{ data: Asset[]; total: number; byStatus: Record<string, number> }>(
    `/assets${qs ? "?" + qs : ""}`
  );
}

export function useAssetSummary() {
  return useFetchOnce<{ total: number; byType: Record<string, number>; byStatus: Record<string, number>; criticalCount: number }>(endpoint.assets.stats);
}

// ─── Settings Users ───────────────────────────────────────────────────────────

export interface SettingsUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  lastLogin?: string;
  status?: string;
}

export function useSettingsUsers() {
  return useFetchOnce<SettingsUser[]>(endpoint.incident_ticket.get_members);
}

export async function inviteUser(email: string, role: string) {
  const res = await customAxios.post(endpoint.auth.invite_member, { email, role });
  return res.data?.data ?? res.data;
}

export async function updateUserRole(userId: string, role: string) {
  const res = await customAxios.patch(`/business/members/${userId}/role`, { role });
  return res.data?.data ?? res.data;
}

// ─── Dashboard Analytics (extended) ──────────────────────────────────────────

export function useDashboardSloAnalytics() {
  return useFetchOnce<any>("/dashboard/analytics/slo");
}

export function useDashboardAgentAnalytics() {
  return useFetchOnce<any>("/dashboard/analytics/agents");
}

export function useDashboardCostAnalytics() {
  return useFetchOnce<any>("/dashboard/analytics/costs");
}

export function useDashboardGovernanceAnalytics() {
  return useFetchOnce<any>("/dashboard/analytics/governance");
}

export function useDashboardEalAnalytics() {
  return useFetchOnce<any>("/dashboard/analytics/eal");
}

export function useDashboardLiveFeed(params?: { limit?: number }) {
  const qs = params?.limit ? `?limit=${params.limit}` : "";
  return useFetchOnce<any[]>(`/dashboard/live-feed${qs}`);
}

// ─── Incident Templates ───────────────────────────────────────────────────────

export interface IncidentTemplate {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  version?: number;
  status: "DRAFT" | "ACTIVE" | "DEPRECATED" | "ARCHIVED";
  incidentType?: string;
  category?: string;
  tags?: string[];
  triggers?: any[];
  agentPackage?: any;
  fingerprint?: any;
  learningEnabled?: boolean;
  autoGenerated?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  executionCount?: number;
  successRate?: number;
}

export function useIncidentTemplates(params?: { status?: string; type?: string; category?: string }) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.type) query.set("type", params.type);
  if (params?.category) query.set("category", params.category);
  const qs = query.toString();
  return useFetchOnce<{ data: IncidentTemplate[]; total: number }>(
    `/incident-templates${qs ? "?" + qs : ""}`
  );
}

export function useIncidentTemplateDetail(id: string | null) {
  return useFetchOnce<IncidentTemplate>(id ? `/incident-templates/${id}` : null, [id]);
}

export function useIncidentTemplateAnalytics(id: string | null) {
  return useFetchOnce<any>(id ? `/incident-templates/${id}/analytics` : null, [id]);
}

export function useTemplateRecommendations() {
  const [state, setState] = useState<FetchState<any[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    customAxios
      .post(endpoint.incident_templates.recommend, {})
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setState({ data: Array.isArray(data) ? data : [], loading: false, error: null });
      })
      .catch(() => {
        setState({ data: [], loading: false, error: null });
      });
  }, []);

  return { ...state, refetch: () => {} };
}

export async function publishTemplate(id: string) {
  const res = await customAxios.post(`/incident-templates/${id}/publish`);
  return res.data?.data ?? res.data;
}

export async function approveRecommendation(id: string, notes?: string) {
  const res = await customAxios.post(`/incident-templates/recommendations/${id}/approve`, { notes });
  return res.data?.data ?? res.data;
}

export async function rejectRecommendation(id: string, notes: string) {
  const res = await customAxios.post(`/incident-templates/recommendations/${id}/reject`, { notes });
  return res.data?.data ?? res.data;
}
