"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/IMS/DashboardHeader";
import Button from "@/components/ui/Button1";
import useCurrentUserProfile from "@/hooks/useCurrentUserProfile";
import useLogout from "@/hooks/useLogout";
import { useThemeStore } from "@/store/themeStore";
import { downloadText } from "../settings.data";
import {
  USER_SECTIONS,
  USER_SECMAP,
  DEFAULTS,
  STATUSES,
  STORAGE_KEY,
  initials,
} from "./userSettings.data";
import {
  ProfileSection,
  SecuritySection,
  NotificationsSection,
  DashboardSection,
  WorkspaceSection,
  ShortcutsSection,
  AccessibilitySection,
  PrivacySection,
  AppearanceSection,
  AboutSection,
} from "./UserSettingsSections";
import {
  ChangePasswordModal,
  ConfirmModal,
  FeedbackModal,
  FeedbackField,
} from "./UserSettingsModals";

function safeGet<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}
function safeSet(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* storage unavailable */
  }
}
function structuredCloneSafe<T>(v: T): T {
  return typeof structuredClone === "function"
    ? structuredClone(v)
    : JSON.parse(JSON.stringify(v));
}
function roleLabel(role?: string): string {
  if (role === "SUPER_ADMIN") return "Super Admin";
  if (role === "ADMIN") return "Administrator";
  if (role === "USER") return "Team member";
  return "";
}

interface ConfirmCfg {
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
}
interface FeedbackCfg {
  title: string;
  desc?: string;
  fields: FeedbackField[];
  submitLabel?: string;
  successMessage?: string;
}

export default function UserSettings() {
  const user = useCurrentUserProfile();
  const { handleLogout } = useLogout();
  const { theme, setTheme } = useThemeStore();

  const [state, setState] = useState<Record<string, any>>(() =>
    structuredCloneSafe(DEFAULTS),
  );
  const [draft, setDraft] = useState<Record<string, any>>(() =>
    structuredCloneSafe(DEFAULTS),
  );
  const [hydrated, setHydrated] = useState(false);
  const [current, setCurrent] = useState("profile");
  const [dirty, setDirty] = useState(false);

  const [pwOpen, setPwOpen] = useState(false);
  const [confirmCfg, setConfirmCfg] = useState<ConfirmCfg | null>(null);
  const [feedbackCfg, setFeedbackCfg] = useState<FeedbackCfg | null>(null);

  useEffect(() => {
    const saved = safeGet<Record<string, any>>(STORAGE_KEY);
    if (saved) {
      const merged: Record<string, any> = {};
      for (const s of USER_SECTIONS)
        merged[s.id] = {
          ...structuredCloneSafe(DEFAULTS[s.id]),
          ...(saved[s.id] || {}),
        };
      setState(merged);
      setDraft(merged);
    }
    setHydrated(true);
  }, []);

  // Overlay real account fields once the profile loads — after localStorage
  // hydration so a saved local draft isn't clobbered by a slower response.
  useEffect(() => {
    if (!hydrated || !user) return;
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
    const overlay = (base: Record<string, any>) => ({
      ...base,
      profile: {
        ...base.profile,
        fullName: fullName || base.profile.fullName,
        email: user.email || base.profile.email,
        jobTitle: base.profile.jobTitle || roleLabel(user.roles?.[0]),
      },
    });
    setState((prev) => overlay(prev));
    setDraft((prev) => overlay(prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hydrated]);

  function patchSection(section: string, partial: Record<string, any>) {
    setDraft((prev) => ({ ...prev, [section]: { ...prev[section], ...partial } }));
    setDirty(true);
  }
  function setSectionPath(section: string, path: string, val: any) {
    setDraft((prev) => {
      const next = { ...prev };
      next[section] = { ...next[section] };
      const parts = path.split(".");
      let o: any = next[section];
      for (let i = 0; i < parts.length - 1; i++) {
        o[parts[i]] = { ...o[parts[i]] };
        o = o[parts[i]];
      }
      o[parts[parts.length - 1]] = val;
      return next;
    });
    setDirty(true);
  }

  function save() {
    setState(draft);
    safeSet(STORAGE_KEY, draft);
    setDirty(false);
    toast.success("Settings saved");
  }
  function discard() {
    setDraft(state);
    setDirty(false);
    toast("Changes discarded");
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s" && dirty) {
        e.preventDefault();
        save();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, draft]);

  const section = USER_SECMAP[current];
  const d = draft[current];
  const profile = draft.profile;

  function handleDownload(kind: string) {
    if (kind === "profile") {
      downloadText(
        "my-profile.json",
        JSON.stringify(
          {
            fullName: profile.fullName,
            email: profile.email,
            jobTitle: profile.jobTitle,
            department: profile.department,
            phone: profile.phone,
          },
          null,
          2,
        ),
      );
    } else {
      downloadText("my-settings.json", JSON.stringify(state, null, 2));
    }
    toast.success("Download ready");
  }

  function renderSection() {
    const patch = (partial: Record<string, any>) => patchSection(current, partial);
    const setPath = (path: string, val: any) => setSectionPath(current, path, val);
    switch (current) {
      case "profile":
        return <ProfileSection d={d} patch={patch} setPath={setPath} />;
      case "security":
        return (
          <SecuritySection
            d={d}
            patch={patch}
            setPath={setPath}
            onChangePassword={() => setPwOpen(true)}
            onRegenerateCodes={() =>
              setConfirmCfg({
                title: "Regenerate recovery codes",
                body: "Your old codes stop working immediately. Continue?",
                danger: true,
                confirmLabel: "Regenerate",
                onConfirm: () => {
                  patchSection("security", { recoveryLeft: 10 });
                  toast.success("New recovery codes generated");
                },
              })
            }
            onLogoutAll={() =>
              setConfirmCfg({
                title: "Log out everywhere else",
                body: "This ends every session except this device.",
                danger: true,
                confirmLabel: "Log out all",
                onConfirm: () => {
                  patchSection("security", {
                    sessions: draft.security.sessions.filter((s: any) => s.current),
                  });
                  toast.success("All other devices signed out");
                },
              })
            }
          />
        );
      case "notifications":
        return <NotificationsSection d={d} patch={patch} setPath={setPath} />;
      case "dashboard":
        return <DashboardSection d={d} patch={patch} setPath={setPath} />;
      case "workspace":
        return <WorkspaceSection d={d} patch={patch} setPath={setPath} />;
      case "shortcuts":
        return <ShortcutsSection d={d} patch={patch} setPath={setPath} />;
      case "accessibility":
        return <AccessibilitySection d={d} patch={patch} setPath={setPath} />;
      case "privacy":
        return (
          <PrivacySection
            onDownload={handleDownload}
            onDeleteRequest={() =>
              setConfirmCfg({
                title: "Request account deletion",
                body: "This sends a deletion request to your workspace admin. Your access is suspended pending review.",
                danger: true,
                confirmLabel: "Request deletion",
                onConfirm: () => toast.success("Deletion request submitted"),
              })
            }
          />
        );
      case "appearance":
        return (
          <AppearanceSection
            d={d}
            patch={patch}
            setPath={setPath}
            theme={theme}
            setTheme={setTheme}
          />
        );
      case "about":
        return (
          <AboutSection
            onSupport={() =>
              setFeedbackCfg({
                title: "Contact support",
                desc: "Tell us what you need — we usually reply within a few hours.",
                fields: [
                  { key: "subject", label: "Subject", type: "text", required: true, placeholder: "Brief summary of your request" },
                  { key: "category", label: "Category", type: "select", options: ["Account", "Access & sign-in", "Notifications", "Technical problem", "Billing", "Other"] },
                  { key: "message", label: "How can we help?", type: "textarea", required: true, placeholder: "Describe your question or problem…" },
                ],
                submitLabel: "Send request",
                successMessage: "Support request sent",
              })
            }
            onFeedback={() =>
              setFeedbackCfg({
                title: "Send feedback",
                desc: "Tell us what's working or what could be better.",
                fields: [
                  { key: "type", label: "Type of feedback", type: "select", options: ["Idea / suggestion", "Praise", "Something's confusing", "Bug or problem"] },
                  { key: "message", label: "Your feedback", type: "textarea", required: true, placeholder: "Share your thoughts…" },
                ],
                submitLabel: "Send feedback",
                successMessage: "Thanks — your feedback was sent",
              })
            }
            onReport={() =>
              setFeedbackCfg({
                title: "Report an issue",
                desc: "Give us enough detail to reproduce it.",
                fields: [
                  { key: "summary", label: "What happened?", type: "textarea", required: true, placeholder: "Describe what went wrong…" },
                  { key: "severity", label: "Severity", type: "select", options: ["Low", "Medium", "High", "Critical"] },
                ],
                submitLabel: "Submit report",
                successMessage: "Issue reported — thank you",
              })
            }
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-ibm dark:bg-zinc-900/20">
      <Header title="My Settings" />

      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 p-4 pb-28 sm:p-6 lg:grid-cols-[280px_1fr] lg:items-start">
        <aside className="lg:sticky lg:top-6">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm shadow-light dark:bg-zinc-900/40">
            <div className="px-6 py-6 text-center">
              <div className="relative mx-auto mb-3.5 h-[84px] w-[84px]">
                {profile.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photo}
                    alt=""
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-2xl bg-zinc-300 text-[26px] font-bold text-white dark:bg-zinc-700">
                    {initials(profile.fullName)}
                  </div>
                )}
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-[3px] border-white dark:border-zinc-900"
                  style={{ background: STATUSES[profile.status] || STATUSES.Offline }}
                />
              </div>
              <div className="truncate text-[17px] font-bold text-black dark:text-zinc-100">
                {profile.fullName || "—"}
              </div>
              <div className="mt-0.5 truncate text-[13px] text-black/50 dark:text-zinc-500">
                {profile.jobTitle || roleLabel(user?.roles?.[0])}
              </div>
              <button
                type="button"
                onClick={() => setCurrent("profile")}
                className="mt-3.5 inline-flex items-center justify-center rounded-lg border border-IMSDarkGreen/25 bg-IMSDarkGreen/10 px-4 py-1.5 text-[13px] font-semibold text-IMSDarkGreen"
              >
                {profile.status}
              </button>
            </div>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

            <div className="py-2">
              {USER_SECTIONS.map((s) => (
                <React.Fragment key={s.id}>
                  {(s.id === "privacy" || s.id === "about") && (
                    <div className="my-2 h-px bg-zinc-100 dark:bg-zinc-800" />
                  )}
                  <button
                    type="button"
                    onClick={() => setCurrent(s.id)}
                    className={cn(
                      "flex w-full items-center gap-3 border-l-[3px] py-3 pl-[18px] pr-5 text-left text-[14.5px] font-medium transition-colors",
                      s.id === current
                        ? "rounded-r-lg border-IMSDarkGreen bg-IMSDarkGreen/10 font-semibold text-IMSDarkGreen"
                        : "border-transparent text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/60",
                    )}
                  >
                    <s.icon
                      size={19}
                      className={cn(
                        "shrink-0",
                        s.id === current ? "text-IMSDarkGreen" : "text-zinc-400 dark:text-zinc-500",
                      )}
                    />
                    {s.name}
                  </button>
                </React.Fragment>
              ))}
              <div className="my-2 h-px bg-zinc-100 dark:bg-zinc-800" />
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="flex w-full items-center gap-3 border-l-[3px] border-transparent py-3 pl-[18px] pr-5 text-left text-[14.5px] font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              >
                <LogOut size={19} className="shrink-0" />
                Log out
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-5">
            <h1 className="flex items-center gap-2.5 text-[21px] font-bold text-black dark:text-zinc-100">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-IMSDarkGreen/10 text-IMSDarkGreen">
                <section.icon size={18} />
              </span>
              {section.name}
            </h1>
            <p className="mt-1.5 max-w-[64ch] text-[13.5px] text-black/60 dark:text-zinc-400">
              {section.desc}
            </p>
          </div>
          {renderSection()}
        </main>
      </div>

      {dirty && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-2xl bg-black py-2.5 pl-5 pr-2.5 text-white shadow-lg dark:bg-zinc-800">
          <div>
            <div className="text-[13px] font-semibold">Unsaved changes</div>
            <div className="text-[11.5px] opacity-70">Your edits aren't live yet.</div>
          </div>
          <Button
            variant="outline-dark"
            size="sm"
            className="!border-white/25 !bg-transparent !text-white hover:!bg-white/10"
            onClick={discard}
          >
            Discard
          </Button>
          <Button variant="solid" size="sm" onClick={save}>
            Save changes
          </Button>
        </div>
      )}

      <ChangePasswordModal isOpen={pwOpen} onClose={() => setPwOpen(false)} />

      {confirmCfg && (
        <ConfirmModal
          isOpen
          onClose={() => setConfirmCfg(null)}
          title={confirmCfg.title}
          body={confirmCfg.body}
          confirmLabel={confirmCfg.confirmLabel}
          danger={confirmCfg.danger}
          onConfirm={confirmCfg.onConfirm}
        />
      )}

      {feedbackCfg && (
        <FeedbackModal
          isOpen
          onClose={() => setFeedbackCfg(null)}
          title={feedbackCfg.title}
          desc={feedbackCfg.desc}
          fields={feedbackCfg.fields}
          submitLabel={feedbackCfg.submitLabel}
          successMessage={feedbackCfg.successMessage}
        />
      )}
    </div>
  );
}
