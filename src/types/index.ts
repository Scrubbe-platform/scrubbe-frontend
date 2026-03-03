import { IncidentFormValues } from "@/components/IncidentTicket/NewCreateIncident";
import { IncidentData } from "@/lib/stores/post-morterm";

export type Ticket = {
  id: string;
  ticketId: string;
  reason: string;
  userName: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status:
    | "OPEN"
    | "CLOSED"
    | "ACKNOWLEDGED"
    | "INVESTIGATION"
    | "MITIGATED"
    | "RESOLVED";
  assignedToEmail: string;
  score: number;
  createdAt: string;
  recommendedActions: string[];
  riskScore: number;
  businessId: string;
  slaStatus: string;
  template: string;
  MTTR: string;
  category: string;
  subCategory: string;
  affectedSystem: string;
  ResolveIncident: IncidentData;
  description: string;
  slaBreachType: string;
  slaResponseHalfNotified: boolean;
  slaResolveHalfNotified: boolean;
  slaResponseBreachNotified: boolean;
  slaResolveBreachNotified: boolean;
  slaSeverity: string;
  slaResponseTimeMinutes: number;
  slaResolveTimeMinutes: number;
  mttrTargetAck: string;
  mttrTargetResolve: string;
  mttrResponseHalfNotified: boolean;
  mttrResolveHalfNotified: boolean;
  mttrResponseBreachNotified: boolean;
  mttrResolveBreachNotified: boolean;
  comments?: {
    authorId: string;
    authorType: string;
    content: string;
    createdAt: string;
    id: string;
    isInternal: false;
  }[];
  assignedTo: {
    email: string;
    firstName: string;
    id: string;
    lastName: string;
  };
};

export type Tticket = {
  id: string;
  ticketId: string;
  createdAt:string
} & IncidentFormValues

export interface Assignment {
  date: string;
  teamMembers: {
    email: string;
    firstName: string;
    lastName: string;
    member: string;
    startTime: string;
    endTime: string;
  }[];
}
