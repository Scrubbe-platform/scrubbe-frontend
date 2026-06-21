import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";

export type PlaybookStepOutcome = {
  id: string;
  stepIndex: number;
  stepName: string;
  status: "PENDING" | "COMPLETED" | "SKIPPED";
  output?: Record<string, unknown> | null;
  performedBy?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
};

export type PlaybookExecution = {
  id: string;
  businessId: string;
  playbookId: string;
  ticketId?: string | null;
  signalId?: string | null;
  status: "TRIGGERED" | "INVESTIGATING" | "REMEDIATING" | "COMPLETED" | "FAILED" | "CANCELLED";
  automationLevel: string;
  confidenceScore: number;
  currentStepIndex: number;
  selectedActionId?: string | null;
  decisionId?: string | null;
  triggeredBy?: string | null;
  notes?: string | null;
  startedAt: string;
  completedAt?: string | null;
  resolutionMinutes?: number | null;
  stepOutcomes: PlaybookStepOutcome[];
  playbook: {
    id?: string;
    name: string;
    automationLevel?: string;
    remediationActions?: Array<{
      actionId: string;
      name: string;
      description: string;
      type: string;
      riskLevel: "LOW" | "MEDIUM" | "HIGH";
      blastRadiusEstimate?: number;
      confidenceScore?: number;
      system?: string;
    }>;
  };
};

export function useActiveExecution(incidentId?: string) {
  const { get } = useFetch();
  return useQuery({
    queryKey: ["playbook-execution-active", incidentId],
    queryFn: async (): Promise<PlaybookExecution | null> => {
      const res = await get(
        `${endpoint.playbooks.executions}?ticketId=${incidentId}&limit=1`
      );
      const execs: PlaybookExecution[] =
        res.data?.data?.executions ?? res.data?.data ?? [];
      return execs[0] ?? null;
    },
    enabled: !!incidentId,
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}

export function useExecutionDetail(executionId?: string | null) {
  const { get } = useFetch();
  return useQuery({
    queryKey: ["playbook-execution-detail", executionId],
    queryFn: async (): Promise<PlaybookExecution | null> => {
      const res = await get(
        `${endpoint.playbooks.executionDetail}/${executionId}`
      );
      return res.data?.data ?? null;
    },
    enabled: !!executionId,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
}
