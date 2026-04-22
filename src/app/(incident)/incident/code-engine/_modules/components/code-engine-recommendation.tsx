"use client";

import { useState } from "react";
import { DiffEditor } from "@monaco-editor/react";

type ViewMode = "original" | "diff" | "suggested";

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
  prRepo?: string;
  prBranch?: string;
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
  prRepo = "acme-corp/checkout-api",
  prBranch = "ezra/fix-inc-9204 → main",
  playbook = "jwt-algo-constraint-v3",
  patternMatch = "INC-231, INC-187 (×2)",
  onApprove,
  onDecline,
}: Props) {
  const [view, setView] = useState<ViewMode>("diff");
  const [sideBySide, setSideBySide] = useState<boolean>(false);

  const originalContent = view === "suggested" ? suggested : original;
  const modifiedContent = view === "original" ? original : suggested;

  const tabs: { id: ViewMode; label: string; sub: string; badge: string }[] = [
    {
      id: "original",
      label: "FAILED PR",
      sub: `— ${filename.split("/").pop()}`,
      badge: "3 issues",
    },
    {
      id: "diff",
      label: "EZRA SUGGESTION",
      sub: `— PR ${prNumber}`,
      badge: "+14  −7",
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] font-sans text-sm">
      {/* ── TOP NAV ── */}
      <header className="flex items-center justify-between px-4 h-10 bg-[#111] border-b border-neutral-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-red-900 text-red-400 bg-red-950/40 text-[11px] font-bold tracking-wider">
            INCIDENT
          </span>
          <span className="text-neutral-200 font-semibold">{incidentId}</span>
          <span className="text-blue-400 text-xs md:block hidden">
            {service}
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 text-[11px] font-semibold md:block hidden">
            {environment}
          </span>
          <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-400 text-[11px] font-bold">
            {severity}
          </span>
        </div>
        <div className="items-center gap-4 md:flex hidden">
          <span className="flex items-center gap-1.5 text-green-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
            ACTION PROPOSED
          </span>
          <span className="text-neutral-600 text-xs">14:22:07 UTC</span>
        </div>
      </header>

      {/* ── TABS ── */}
      <div className="flex items-stretch bg-[#161616] border-b border-neutral-800 shrink-0 pl-2">
        {tabs.map((t) => {
          const active = view === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`
                flex items-center gap-2 px-4 h-[38px] text-xs font-semibold tracking-wide
                border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0
                ${
                  active
                    ? "border-green-500 text-neutral-200 bg-[#1e1e1e]"
                    : "border-transparent text-neutral-500 hover:text-neutral-300"
                }
              `}
            >
              {t.id === "original" && <span className="text-red-400">○</span>}
              {t.id === "diff" && <span className="text-yellow-400">⚡</span>}
              <span className="uppercase">{t.label}</span>
              <span className="text-neutral-500 font-normal normal-case md:block hidden">
                {t.sub}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold md:block hidden
                ${
                  active && t.id === "original"
                    ? "bg-red-950/60 text-red-400"
                    : ""
                }
                ${
                  active && t.id === "diff"
                    ? "bg-green-950/60 text-green-400"
                    : ""
                }
                ${!active ? "bg-neutral-800 text-neutral-500" : ""}
              `}
              >
                {t.badge}
              </span>
            </button>
          );
        })}

        {/* Tab bar right info */}
        <div className="ml-auto items-center gap-2 pr-4 text-[11px] text-neutral-600 md:flex hidden">
          <span>{filename}</span>
          <span>·</span>
          <span>{incidentId}</span>
          <span>·</span>
          <span className="text-green-500">conf: {confidence}</span>
        </div>
      </div>

      {/* ── FILE SUBBAR ── */}
      {view !== "original" && (
        <div className="md:flex hidden items-center justify-between px-4 py-1.5 bg-[#181818] border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="text-yellow-400">⚡</span>
            <span>
              {filename} → Ezra fix (PR {prNumber})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-green-400">+14 −7</span>
            <span className="px-2 py-0.5 rounded border border-green-900 bg-green-950/40 text-green-400 text-[11px] font-bold">
              EZRA FIX
            </span>
            {view === "diff" && (
              <label className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sideBySide}
                  onChange={(e) => setSideBySide(e.target.checked)}
                  className="accent-green-500"
                />
                Side by side
              </label>
            )}
          </div>
        </div>
      )}

      {/* ── EDITOR ── */}
      <div className="flex-1 overflow-hidden">
        <DiffEditor
          height="100%"
          language={language}
          original={originalContent}
          modified={modifiedContent}
          theme="vs-dark"
          options={{
            readOnly: true,
            renderSideBySide: view === "diff" ? sideBySide : false,
            minimap: { enabled: false },
            fontSize: 13,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      {/* ── FOOTER PANEL ── */}
      <div className="shrink-0 bg-[#161616] border-t border-neutral-800 md:block hidden">
        <div className="flex items-stretch divide-x divide-neutral-800">
          {/* Confidence */}
          <div className="flex items-center gap-3 px-5 py-3">
            <span className="text-2xl font-bold text-green-400">
              {confidence}
            </span>
            <div>
              <div className="w-24 h-1 bg-neutral-800 rounded-full mb-1">
                <div
                  className="h-full bg-green-400 rounded-full"
                  style={{ width: `${Math.round(confidence * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-neutral-500">
                High · auto-PR eligible
              </p>
            </div>
          </div>

          {/* PR title */}
          <div className="flex items-center px-5 py-3 flex-1 min-w-0">
            <p className="text-xs text-neutral-400 truncate">{prTitle}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 px-5 py-3 shrink-0">
            <button
              onClick={onApprove}
              className="px-4 py-2 rounded-md bg-green-500 hover:bg-green-400 text-neutral-900 text-xs font-bold transition-colors"
            >
              ✓ Approve &amp; merge
            </button>
            <button
              onClick={onDecline}
              className="px-4 py-2 rounded-md border border-neutral-700 hover:border-neutral-500 text-neutral-400 hover:text-neutral-200 text-xs font-semibold transition-colors bg-transparent"
            >
              ✕ Decline
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-5 py-1.5 border-t border-neutral-800 text-[11px] text-neutral-600">
          <div className="flex items-center gap-4">
            <span className="text-yellow-500">⚡ Ezra Code Engine</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              ACTION PROPOSED
            </span>
            <span>⊙ Governed · Audited · Safe</span>
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
