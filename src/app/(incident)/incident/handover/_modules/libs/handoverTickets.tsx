// data/mockHandovers.ts
import { Handover, ScheduleRule, ArchiveItem } from "../types/index";

export const mockHandovers: Handover[] = [
  {
    id: "HO-001283",
    date: "01 Jun 2026",
    primaryIncident: {
      id: "SI-001983",
      title: "Checkout API Production Failure",
    },
    additionalIncidentsCount: 2,
    totalIncidents: 3,
    severity: "Critical",
    status: "Active",
    owner: "London Team",
    transferTime: "18:00 UTC",
  },
  {
    id: "HO-001284",
    date: "01 Jun 2026",
    primaryIncident: { id: "SI-001977", title: "Payments Service Degradation" },
    additionalIncidentsCount: 0,
    totalIncidents: 1,
    severity: "High",
    status: "Active",
    owner: "Platform Team",
    transferTime: "20:00 UTC",
  },
  {
    id: "HO-001285",
    date: "01 Jun 2026",
    primaryIncident: { id: "SI-001969", title: "Search Service Latency" },
    additionalIncidentsCount: 0,
    totalIncidents: 1,
    severity: "High",
    status: "Scheduled",
    owner: "US Team",
    transferTime: "22:00 UTC",
  },
];

export const mockSchedules: ScheduleRule[] = [
  {
    id: "1",
    time: "06:00",
    fromRegion: "Singapore",
    toRegion: "London",
    recurrence: "Daily · APAC to EMEA",
  },
  {
    id: "2",
    time: "14:00",
    fromRegion: "London",
    toRegion: "US East",
    recurrence: "Daily · EMEA to Americas",
  },
  {
    id: "3",
    time: "22:00",
    fromRegion: "US East",
    toRegion: "Singapore",
    recurrence: "Daily · Americas to APAC",
  },
];

export const mockArchive: ArchiveItem[] = [
  {
    id: "HO-001271",
    title: "Database Failover — EU Region",
    team: "Singapore Team",
    incidentCount: 2,
    status: "Completed",
    date: "31 May 2026",
    time: "06:00 UTC",
  },
  {
    id: "HO-001258",
    title: "CDN Cache Invalidation Issue",
    team: "US Team",
    incidentCount: 1,
    status: "Completed",
    date: "30 May 2026",
    time: "14:00 UTC",
  },
];
