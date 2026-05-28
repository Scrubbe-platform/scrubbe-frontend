"use client";

import { useState, type ReactNode } from "react";
import { X, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { AnimatePresence, motion } from "framer-motion";
import { FaGithub, FaGitlab } from "react-icons/fa";

function GitHubIcon() {
  return <FaGithub size={24} className="text-[#111827]" />;
}

function GitLabIcon() {
  return <FaGitlab size={24} className="text-[#FC6D26]" />;
}

function MicrosoftIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="1" y="1" width="12" height="12" fill="#F25022" />
      <rect x="15" y="1" width="12" height="12" fill="#7FBA00" />
      <rect x="1" y="15" width="12" height="12" fill="#00A4EF" />
      <rect x="15" y="15" width="12" height="12" fill="#FFB900" />
    </svg>
  );
}

function OktaIcon() {
  return (
    <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#111827]">
      OKTA
    </span>
  );
}

function OneLoginIcon() {
  return (
    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0F172A]">
      1L
    </span>
  );
}

export type SsoSlug =
  | "google"
  | "github"
  | "gitlab"
  | "microsoft-entra-id"
  | "okta"
  | "onelogin";

type StepDef = { title: string; desc: string };
type ProviderConfig = {
  slug: SsoSlug;
  label: string;
  subtitle: string;
  urlSuffix: string;
  steps: StepDef[];
  icon: ReactNode;
};

const makeSteps = (name: string): StepDef[] => [
  {
    title: "Verify your identity",
    desc:
      "You'll be redirected to " +
      name +
      " to authenticate using your corporate credentials.",
  },
  {
    title: "Complete multi-factor authentication",
    desc: "If your organization requires it, complete an MFA challenge (push, biometric, or hardware key).",
  },
  {
    title: "Return to Scrubbe",
    desc: "We'll receive a signed assertion from your IdP and provision a secure session for your workspace.",
  },
];

export const SSO_PROVIDER_CONFIGS: ProviderConfig[] = [
  {
    slug: "google",
    label: "Continue with Google Workspace",
    subtitle: "Sign in with your Google Workspace account",
    urlSuffix: "workspace",
    steps: makeSteps("Google Workspace"),
    icon: <FcGoogle size={28} />,
  },
  {
    slug: "github",
    label: "Continue with GitHub",
    subtitle: "Sign in via your GitHub organization",
    urlSuffix: "workspace",
    steps: makeSteps("GitHub"),
    icon: <GitHubIcon />,
  },
  {
    slug: "gitlab",
    label: "Continue with GitLab",
    subtitle: "Sign in via your GitLab organization",
    urlSuffix: "workspace",
    steps: makeSteps("GitLab"),
    icon: <GitLabIcon />,
  },
  {
    slug: "microsoft-entra-id",
    label: "Continue with Microsoft",
    subtitle: "Sign in via your Microsoft organization",
    urlSuffix: "workspace",
    steps: makeSteps("Microsoft"),
    icon: <MicrosoftIcon />,
  },
  {
    slug: "okta",
    label: "Continue with Okta",
    subtitle: "Sign in via your Okta organization",
    urlSuffix: "workspace",
    steps: makeSteps("Okta"),
    icon: <OktaIcon />,
  },
  {
    slug: "onelogin",
    label: "Continue with OneLogin",
    subtitle: "Sign in via your OneLogin organization",
    urlSuffix: "workspace",
    steps: makeSteps("OneLogin"),
    icon: <OneLoginIcon />,
  },
];

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="w-8 h-8 rounded-full border-2 border-emerald-500 flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: "#f0fdf4" }}
      >
        <span className="text-[13px] font-bold text-emerald-600">{n}</span>
      </div>
      <div>
        <p className="text-[14px] font-bold text-gray-900 mb-0.5">{title}</p>
        <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

interface SsoProviderModalProps {
  providerSlug: SsoSlug | null;
  onClose: () => void;
  onContinue: (workspace: string, slug: SsoSlug) => void;
}

export function SsoProviderModal({
  providerSlug,
  onClose,
  onContinue,
}: SsoProviderModalProps) {
  const [workspace, setWorkspace] = useState("");
  const config = SSO_PROVIDER_CONFIGS.find((p) => p.slug === providerSlug);
  const isOpen = Boolean(providerSlug && config);
  const shortName = config?.label.replace("Continue with ", "") ?? "";

  const handleClose = () => {
    setWorkspace("");
    onClose();
  };

  const handleContinue = () => {
    if (!workspace.trim() || !providerSlug) return;
    onContinue(workspace.trim(), providerSlug);
    setWorkspace("");
  };

  return (
    <AnimatePresence>
      {isOpen && config && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[560px] pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X size={16} className="text-gray-500" />
              </button>

              <div className="p-8">
                <div
                  className="flex items-center gap-4 pb-5 mb-6"
                  style={{ borderBottom: "1px solid #f3f4f6" }}
                >
                  <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                    {config.icon}
                  </div>
                  <div>
                    <h2 className="text-[17px] font-black text-gray-900 leading-snug">
                      {config.label}
                    </h2>
                    <p className="text-[12.5px] text-gray-500 mt-0.5">
                      {config.subtitle}
                    </p>
                  </div>
                </div>

                <div className="space-y-5 mb-7">
                  {config.steps.map((s, i) => (
                    <Step key={i} n={i + 1} title={s.title} desc={s.desc} />
                  ))}
                </div>

                <div
                  className="rounded-xl overflow-hidden mb-4"
                  style={{ border: "1px solid #e5e7eb" }}
                >
                  <div
                    className="px-4 py-2.5"
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      background: "#fafafa",
                    }}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                      Organization workspace
                    </p>
                  </div>
                  <div className="flex items-center bg-white">
                    <input
                      type="text"
                      value={workspace}
                      autoFocus
                      onChange={(e) => setWorkspace(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                      placeholder="your-company"
                      className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
                    />
                    <div
                      className="px-4 py-3 text-sm font-medium text-gray-400 shrink-0"
                      style={{
                        borderLeft: "1px solid #e5e7eb",
                        background: "#f9fafb",
                      }}
                    >
                      {config.urlSuffix}
                    </div>
                  </div>
                  <div
                    className="px-4 py-2"
                    style={{
                      borderTop: "1px solid #f3f4f6",
                      background: "#fafafa",
                    }}
                  >
                    <p className="text-[11.5px] text-gray-400">
                      Enter the Scrubbe workspace or tenant configured by your administrator.
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-start gap-3 rounded-xl px-4 py-3.5 mb-7"
                  style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
                >
                  <Lock
                    size={14}
                    className="text-emerald-600 mt-0.5 shrink-0"
                  />
                  <p className="text-[12.5px] text-emerald-700 leading-relaxed">
                    This redirect uses TLS 1.3 and a signed SAML/OIDC assertion.
                    Scrubbe never sees your password.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-xl text-[14px] font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!workspace.trim()}
                    className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
                    style={{
                      background:
                        "linear-gradient(90deg,#1a2a1a 0%,#14532d 55%,#22c55e 100%)",
                    }}
                  >
                    Continue to {shortName}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
