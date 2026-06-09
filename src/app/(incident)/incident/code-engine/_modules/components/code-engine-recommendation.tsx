"use client";

import { useState } from "react";
import { DiffEditor } from "@monaco-editor/react";

type ViewMode = "original" | "diff";

interface Props {
  original?: string;
  suggested?: string;
  filename?: string;
  language?: string;
  incidentId?: string;
  service?: string;
  environment?: string;
  severity?: string;
  confidence?: number;
  prNumber?: string;
  prTitle?: string;
  playbook?: string;
  patternMatch?: string;
  onApprove?: () => void;
  onDecline?: () => void;
}

const DEFAULT_ORIGINAL = `import { NextRequest, NextResponse } from "next/server"
import { verifyJwt } from "@/services/jwt.service"

export async function authMiddleware(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1]
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const payload = await verifyJwt(token)
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const res = NextResponse.next()
  res.headers.set("x-user-id", payload.sub)
  return res
}`;

const DEFAULT_SUGGESTED = `import { NextRequest, NextResponse } from "next/server"
import { verifyJwt } from "@/services/jwt.service"

export async function authMiddleware(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1]
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const payload = await verifyJwt(token, {
    algorithms: ["RS256"],
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  })
  if (!payload) return NextResponse.json({
    error: "Invalid or expired token",
    code: "AUTH_TOKEN_INVALID",
  }, { status: 401 })

  const res = NextResponse.next()
  res.headers.set("x-user-id", payload.sub)
  res.headers.set("x-deploy-version", process.env.DEPLOY_VERSION ?? "unknown")
  return res
}`;

export default function CodeEngineRecommendation({
  original = DEFAULT_ORIGINAL,
  suggested = DEFAULT_SUGGESTED,
  filename = "src/middleware/auth.ts",
  language = "typescript",
  incidentId = "INC-9204",
  service = "checkout-api",
  environment = "production",
  severity = "P1",
  confidence = 0.91,
  prNumber = "#2847",
  prTitle = "fix(auth): enforce RS256 + issuer validation [INC-9204]",
  onApprove,
  onDecline,
}: Props) {
  const [view, setView] = useState<ViewMode>("diff");
  const [sideBySide, setSideBySide] = useState(false);

  const tabs: { id: ViewMode; label: string; badge: string }[] = [
    { id: "original", label: "Failed PR", badge: "3 issues" },
    { id: "diff", label: "Ezra Suggestion", badge: "+14 −7" },
  ];

  return (
    <div className="flex flex-col h-[600px] rounded-xl border border-zinc-500 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 overflow-hidden text-[13px]">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-4 h-10 border-b border-zinc-100 dark:border-zinc-800 shrink-0 bg-zinc-50 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold border border-red-200 dark:border-red-500/25 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/8">
            {incidentId}
          </span>
          <span className="text-zinc-500 dark:text-zinc-400 hidden md:block">
            {service}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-400 hidden md:block">
            {environment}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold border border-red-200 dark:border-red-500/25 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/8">
            {severity}
          </span>
        </div>
        <div className="items-center gap-3 hidden md:flex">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Action proposed
          </span>
          <span className="text-[11px] text-black dark:text-zinc-500">
            14:22:07 UTC
          </span>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="flex items-stretch border-b border-zinc-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900 pl-1">
        {tabs.map((t) => {
          const active = view === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`flex items-center gap-2 px-4 h-9 text-[12px] font-medium border-b-2 transition-colors ${
                active
                  ? "border-zinc-800 dark:border-zinc-200 text-black dark:text-zinc-100"
                  : "border-transparent text-black hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              {t.id === "original" && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              )}
              {t.id === "diff" && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
              {t.label}
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium hidden md:block ${
                  active && t.id === "original"
                    ? "bg-red-50 dark:bg-red-500/10 text-red-500"
                    : active && t.id === "diff"
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-zinc-100 dark:bg-zinc-800 text-black"
                }`}
              >
                {t.badge}
              </span>
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-1.5 pr-4 text-[11px] text-black dark:text-zinc-500 hidden md:flex">
          <span>{filename}</span>
          <span>·</span>
          <span>conf: {confidence}</span>
        </div>
      </div>

      {/* ── Subbar ── */}
      {view === "diff" && (
        <div className="hidden md:flex items-center justify-between px-4 py-1.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-black dark:text-zinc-500">
            <span className="text-amber-500"> </span>
            <span>
              {filename} → Ezra fix (PR {prNumber})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              +14 −7
            </span>
            <label className="flex items-center gap-1.5 text-[11px] text-black cursor-pointer">
              <input
                type="checkbox"
                checked={sideBySide}
                onChange={(e) => setSideBySide(e.target.checked)}
                className="accent-zinc-600"
              />
              Side by side
            </label>
          </div>
        </div>
      )}

      {/* ── Editor ── */}
      <div className="flex-1 overflow-hidden">
        <DiffEditor
          height="100%"
          language={language}
          original={view === "original" ? original : original}
          modified={view === "original" ? original : suggested}
          theme="vs-dark"
          options={{
            readOnly: true,
            renderSideBySide: view === "diff" ? sideBySide : false,
            minimap: { enabled: false },
            fontSize: 12,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      {/* ── Footer ── */}
      <div className="hidden md:block shrink-0 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-stretch divide-x divide-zinc-100 dark:divide-zinc-800">
          {/* Confidence */}
          <div className="flex items-center gap-3 px-5 py-3">
            <span className="text-[18px] font-semibold text-black dark:text-zinc-100">
              {confidence}
            </span>
            <div>
              <div className="w-20 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-1.5">
                <div
                  className="h-full bg-zinc-700 dark:bg-zinc-300 rounded-full transition-all"
                  style={{ width: `${Math.round(confidence * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-black dark:text-zinc-500">
                High · auto-PR eligible
              </p>
            </div>
          </div>

          {/* PR title */}
          <div className="flex items-center px-5 py-3 flex-1 min-w-0">
            <p className="text-[12px] text-black dark:text-zinc-500 truncate">
              {prTitle}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 px-5 py-3 shrink-0">
            <button
              onClick={onApprove}
              className="px-4 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black text-[12px] font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors"
            >
              ✓ Approve & merge
            </button>
            <button
              onClick={onDecline}
              className="px-4 py-1.5 rounded-lg border border-zinc-500 dark:border-zinc-700 text-black dark:text-zinc-400 text-[12px] font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              ✕ Decline
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-5 py-1.5 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-black dark:text-zinc-500">
          <div className="flex items-center gap-4">
            <span> Ezra Code Engine</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Action proposed
            </span>
            <span>Governed · Audited · Safe</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{filename}</span>
            <span>TypeScript</span>
          </div>
        </div>
      </div>
    </div>
  );
}
