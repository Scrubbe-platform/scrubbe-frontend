import {
  UserRound,
  ShieldCheck,
  Bell,
  LayoutDashboard,
  Briefcase,
  Keyboard,
  Accessibility,
  Lock,
  Palette,
  Info,
  LucideIcon,
} from "lucide-react";

export interface UserSection {
  id: string;
  name: string;
  icon: LucideIcon;
  desc: string;
}

export const USER_SECTIONS: UserSection[] = [
  { id: "profile", name: "Profile", icon: UserRound, desc: "Manage your personal account information." },
  { id: "security", name: "Security", icon: ShieldCheck, desc: "Everything related to protecting your account." },
  { id: "notifications", name: "Notifications", icon: Bell, desc: "Choose exactly how and when you're notified." },
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, desc: "Customize your workspace and default views." },
  { id: "workspace", name: "Incident workspace", icon: Briefcase, desc: "Your personal workflow preferences inside an incident." },
  { id: "shortcuts", name: "Keyboard shortcuts", icon: Keyboard, desc: "Customize your keyboard shortcuts." },
  { id: "accessibility", name: "Accessibility", icon: Accessibility, desc: "Make Scrubbe easier to see and navigate." },
  { id: "privacy", name: "Data & privacy", icon: Lock, desc: "Download your data and manage your privacy." },
  { id: "appearance", name: "Appearance", icon: Palette, desc: "Personalize the look and feel." },
  { id: "about", name: "About", icon: Info, desc: "Version, docs and support." },
];
export const USER_SECMAP: Record<string, UserSection> = {};
USER_SECTIONS.forEach((s) => (USER_SECMAP[s.id] = s));

export const STATUSES: Record<string, string> = {
  Available: "#0BA678",
  Busy: "#E5484D",
  Focusing: "#7C3AED",
  Away: "#F5A623",
  Offline: "#8992A2",
};

export const DEFAULTS: Record<string, any> = {
  profile: {
    fullName: "",
    jobTitle: "",
    department: "",
    team: "",
    email: "",
    phone: "",
    timezone: "Africa/Lagos (GMT+1)",
    language: "English (UK)",
    dateFormat: "DD/MM/YYYY · 24-hour",
    workStart: "09:00",
    workEnd: "18:00",
    status: "Available",
    bio: "",
    photo: null as string | null,
  },
  security: {
    mfa: false,
    passkeys: [] as { name: string; added: string }[],
    keys: [] as { name: string; added: string }[],
    recoveryLeft: 0,
    sessions: [] as {
      device: string;
      browser: string;
      last: string;
      current: boolean;
    }[],
    logins: [] as { type: "ok" | "warn" | "bad"; place: string; when: string }[],
  },
  notifications: {
    incidents: {
      assigned: true,
      mentioned: true,
      slaApproaching: true,
      p0: true,
      warRoom: true,
      resolved: false,
      reopened: true,
      investigation: false,
      playbook: false,
      approval: true,
    },
    channels: {
      email: true,
      slack: true,
      teams: false,
      push: true,
      sms: false,
      browser: true,
    },
    frequency: "Instant",
    quietOn: false,
    quietStart: "20:00",
    quietEnd: "07:00",
  },
  dashboard: {
    landing: "My Incidents",
    sortBy: "Priority",
    pageSize: "25",
    pinned: [] as string[],
    recent: [] as string[],
  },
  workspace: {
    timelineOrder: "Newest first",
    autoRefresh: "30 sec",
    expand: {
      evidence: true,
      timeline: true,
      recommendations: false,
      aiSummary: true,
    },
    badges: {
      sla: true,
      slo: true,
      elapsed: true,
      confidence: true,
      quality: false,
      operational: true,
    },
  },
  shortcuts: {
    list: [
      { act: "Open search", keys: "⌘ K" },
      { act: "Create incident", keys: "C" },
      { act: "Open command console", keys: "⌘ /" },
      { act: "Assign incident", keys: "A" },
      { act: "Open timeline", keys: "T" },
      { act: "Toggle dark mode", keys: "⌘ D" },
    ],
  },
  accessibility: {
    highContrast: false,
    largeFonts: false,
    reduceMotion: false,
    screenReader: false,
    keyboardNav: true,
    colorBlind: "Off",
  },
  privacy: {},
  appearance: {
    density: "Comfortable",
    animations: true,
  },
  about: {},
};

export const PAGES = [
  "My Incidents",
  "Tickets",
  "Problems",
  "Service Catalog",
  "Signal Graph",
  "Playbook Library",
  "Code Engine",
  "Control Panel",
  "On-call",
  "Handover",
  "People",
];

export function initials(name: string): string {
  return (
    (name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?"
  );
}

export function fmtTime(t?: string): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  const hh = ((h + 11) % 12) + 1;
  return hh + (m ? ":" + String(m).padStart(2, "0") : "") + " " + ap;
}

export function deviceGlyph(dev: string): "mobile" | "desktop" {
  const d = dev.toLowerCase();
  if (d.includes("iphone") || d.includes("android") || d.includes("mobile"))
    return "mobile";
  return "desktop";
}

export const STORAGE_KEY = "scrubbe.user-settings.v1";
