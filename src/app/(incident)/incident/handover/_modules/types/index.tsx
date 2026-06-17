// types/handover.ts

export type Severity = "Critical" | "High" | "Medium" | "Low";
export type Status = "Active" | "Scheduled" | "Completed";

export interface Incident {
  id: string;
  title: string;
}

export interface Handover {
  id: string;
  date: string; // ISO string preferred from backend, formatted on frontend
  primaryIncident: Incident;
  additionalIncidentsCount: number;
  totalIncidents: number;
  severity: Severity;
  status: Status;
  owner: string;
  transferTime: string; // UTC string
}

export interface ScheduleRule {
  id: string;
  time: string;
  fromRegion: string;
  toRegion: string;
  recurrence: string;
}

export interface ArchiveItem {
  id: string;
  title: string;
  team: string;
  incidentCount: number;
  status: Status;
  date: string;
  time: string;
}
