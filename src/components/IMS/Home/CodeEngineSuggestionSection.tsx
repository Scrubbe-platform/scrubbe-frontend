"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { DiffEditor } from "@monaco-editor/react";

// ─────────────────────────────────────────────────────────────────
// Code content
// ─────────────────────────────────────────────────────────────────

const ORIGINAL_CODE = `import { NextRequest, NextResponse } from "next/server"
import { verifyJwt } from "@/services/jwt.service"

export async function authMiddleware(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1]
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const payload = await verifyJwt(token)  // ← no algorithm specified
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  // TODO: add algorithm check — never shipped

  const res = NextResponse.next()
  res.headers.set("x-user-id", payload.sub)
  // deploy version header missing
  return res
}`;

const SUGGESTED_CODE = `import { NextRequest, NextResponse } from "next/server"
import { verifyJwt } from "@/services/jwt.service"

export async function authMiddleware(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1]
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const payload = await verifyJwt(token, {
    algorithms: ["RS256"], // ← Ezra: explicit algorithm enforced
    issuer: process.env.JWT_ISSUER, // ← Ezra: validate issuer
    audience: process.env.JWT_AUDIENCE,
  })
  if (!payload) return NextResponse.json({
    error: "Invalid or expired token",
    code: "AUTH_TOKEN_INVALID",
  }, { status: 401 })

  const res = NextResponse.next()
  res.headers.set("x-user-id", payload.sub)
  res.headers.set("x-deploy-version", process.env.DEPLOY_VERSION ?? "unknown")
  // ← enables rollback correlation in blast radius graph
  return res
}`;

type TabId = "failed" | "suggestion";

// ─────────────────────────────────────────────────────────────────
// Bottom feature cards — white background, dark square icon
// Exactly matching the image: horizontal layout icon-left, text-right
// ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    // Versioned icon: "Av" style symbol
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M2 11L7 2l5 9"
          stroke="#fff"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M4 8h6"
          stroke="#fff"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Versioned from day one",
    desc: "All endpoints under /api/v1/. Breaking changes always get a new version — never in place.",
  },
  {
    // Shield icon
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 1.5L2 4v3.5c0 2.8 2 4.8 5 5.5 3-0.7 5-2.7 5-5.5V4L7 1.5z"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
      </svg>
    ),
    title: "Every call audited",
    desc: "JWT identity tied to the audit trail. Not a config flag — enforced by architecture on every request.",
  },
  {
    // Circle check icon
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle
          cx="7"
          cy="7"
          r="5.5"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M4.5 7l2 2 3-3"
          stroke="#fff"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Idempotent ingestion",
    desc: "Duplicate events from webhook retries are deduped automatically. No double incidents, no extra work.",
  },
  {
    // Terminal > icon
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M2 4l4 3-4 3"
          stroke="#fff"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 10h4"
          stroke="#fff"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "5 SDK languages",
    desc: "TypeScript, Python, Go, Ruby, and cURL. All published to native registries with full type coverage.",
  },
];

// ─────────────────────────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────────────────────────

export default function EzraCodeEngineSection() {
  const [activeTab, setActiveTab] = useState<TabId>("failed");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const editorOriginal = ORIGINAL_CODE;
  const editorModified =
    activeTab === "failed" ? ORIGINAL_CODE : SUGGESTED_CODE;

  return (
    <div ref={ref} className="w-full bg-gray-50">
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        <div className="border border-gray-200 bg-white rounded-2xl overflow-hidden">
          {/* ── TOP INFO ROW ── */}
          <div className="p-8 pb-0">
            <div className="max-w-xl">
              <p className="text-[13px] font-semibold text-emerald-500 mb-3">
                Code Engine
              </p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif font-bold text-gray-950 leading-[1.2] mb-4"
                style={{ fontSize: "clamp(24px, 2.8vw, 28px)" }}
              >
                Intelligence that reads your code, not just your alerts.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="text-[14px] text-gray-500 leading-relaxed"
              >
                When Ezra identifies a code-level root cause, it surfaces a
                targeted diff against the affected file — with confidence score,
                playbook provenance, and a one-click PR to the source repo.
                Every suggestion is traceable to the incident that triggered it.
              </motion.p>
            </div>
          </div>

          {/* ── CODE ENGINE BLOCK ── */}
          <div className="mt-6" style={{ background: "#0d1117" }}>
            {/* Nav bar */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 border-b"
              style={{ background: "#161b22", borderColor: "#30363d" }}
            >
              <span className="text-[12px] font-bold text-white">
                SI-2378904
              </span>
              <span className="text-[11px] text-blue-400">checkout-api</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-900/60 text-blue-300">
                production
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-900/60 text-red-400">
                P1
              </span>
            </div>

            {/* Tab bar */}
            <div
              className="flex items-center border-b"
              style={{ background: "#161b22", borderColor: "#30363d" }}
            >
              <button
                onClick={() => setActiveTab("failed")}
                className="flex items-center gap-2 px-4 py-2.5 text-[12px] font-semibold cursor-pointer border-none bg-transparent"
                style={{
                  color: activeTab === "failed" ? "#f87171" : "#6b7280",
                  borderBottom:
                    activeTab === "failed"
                      ? "2px solid #f87171"
                      : "2px solid transparent",
                }}
              >
                ○ FAILED PR — auth.ts
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-900/50 text-red-400">
                  3 issues
                </span>
              </button>

              <button
                onClick={() => setActiveTab("suggestion")}
                className="flex items-center gap-2 px-4 py-2.5 text-[12px] font-semibold cursor-pointer border-none bg-transparent"
                style={{
                  color: activeTab === "suggestion" ? "#4ade80" : "#6b7280",
                  borderBottom:
                    activeTab === "suggestion"
                      ? "2px solid #4ade80"
                      : "2px solid transparent",
                }}
              >
                ⚡ EZRA SUGGESTION — PR #2847
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-900/40 text-green-400">
                  +14
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-900/40 text-red-400">
                  -7
                </span>
              </button>
            </div>

            {/* File info bar */}
            <div
              className="flex items-center justify-between px-4 py-2 border-b text-[11px]"
              style={{ background: "#0d1117", borderColor: "#30363d" }}
            >
              <span className="text-gray-400">
                ○{" "}
                {activeTab === "failed"
                  ? "src/middleware/auth.ts — original (broken)"
                  : "src/middleware/auth.ts — Ezra suggestion"}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">
                  {activeTab === "failed"
                    ? "HEAD~1 · 3 failures"
                    : "conf: 0.91"}
                </span>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold border"
                  style={{
                    color: activeTab === "failed" ? "#f87171" : "#4ade80",
                    borderColor: activeTab === "failed" ? "#7f1d1d" : "#166534",
                  }}
                >
                  {activeTab === "failed" ? "FAILED PR" : "SUGGESTED"}
                </span>
              </div>
            </div>

            {/* CI bar */}
            {activeTab === "failed" ? (
              <div
                className="px-4 py-2 text-[11px]"
                style={{
                  background: "#1c0a0a",
                  borderLeft: "3px solid #ef4444",
                }}
              >
                <p className="text-red-400 font-bold mb-1">
                  CI · 3 checks failed
                </p>
                <p className="text-red-300/70">
                  auth.algorithm.test → FAIL — no algorithm constraint
                </p>
                <p className="text-red-300/70">
                  auth.issuer.test → FAIL — issuer not validated
                </p>
                <p className="text-red-300/70">
                  deploy.version.test → FAIL — header missing
                </p>
              </div>
            ) : (
              <div
                className="px-4 py-2 text-[11px]"
                style={{
                  background: "#052e16",
                  borderLeft: "3px solid #22c55e",
                }}
              >
                <p className="text-green-400 font-bold mb-1">
                  ✓ CI · ALL CHECKS PASSED
                </p>
                <p className="text-green-300/70">auth.algorithm.test → PASS</p>
                <p className="text-green-300/70">auth.issuer.test → PASS</p>
                <p className="text-green-300/70">deploy.version.test → PASS</p>
              </div>
            )}

            {/* Editor + sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px]">
              <div style={{ height: 420 }}>
                <DiffEditor
                  height="100%"
                  language="typescript"
                  original={editorOriginal}
                  modified={editorModified}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    renderSideBySide: false,
                    minimap: { enabled: false },
                    fontSize: 12,
                    lineHeight: 20,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    scrollbar: { vertical: "hidden" },
                    renderLineHighlight: "none",
                    contextmenu: false,
                    folding: false,
                  }}
                />
              </div>

              {/* Sidebar */}
              <div
                className="flex flex-col overflow-y-auto text-[12px]"
                style={{
                  background: "#161b22",
                  borderLeft: "1px solid #30363d",
                }}
              >
                {activeTab === "failed" ? (
                  <div className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Root Cause Analysis
                    </p>
                    <p className="font-bold text-yellow-400 mb-2">
                      JWT alg:none attack surface
                    </p>
                    <p className="text-gray-400 leading-relaxed mb-4 text-[11px]">
                      verifyJwt() called without an explicit algorithm
                      constraint. An attacker can forge tokens using alg:none —
                      bypassing signature verification entirely.
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Issues detected
                    </p>
                    {[
                      "No algorithm constraint",
                      "Issuer not validated",
                      "Deploy version header missing",
                    ].map((i) => (
                      <p key={i} className="text-red-400 mb-1 text-[11px]">
                        ⊗ {i}
                      </p>
                    ))}
                    <div className="border-t border-[#30363d] my-3" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Incident
                    </p>
                    {[
                      ["ID", "SI-2378904", "#58a6ff"],
                      ["Service", "checkout-api", "#d1d5db"],
                      ["Environment", "production", "#d1d5db"],
                      ["Severity", "P1", "#d1d5db"],
                    ].map(([k, v, c]) => (
                      <div key={k} className="flex justify-between mb-1.5">
                        <span className="text-gray-500 text-[11px]">{k}</span>
                        <span className="text-[11px]" style={{ color: c }}>
                          {v}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between mb-1.5">
                      <span className="text-gray-500 text-[11px]">
                        Deploy version
                      </span>
                      <span className="text-[11px] text-red-400">
                        v2.4.1 OFFENDING
                      </span>
                    </div>
                    <div className="border-t border-[#30363d] my-3" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                      CI Status
                    </p>
                    <div
                      className="rounded p-2.5 text-[11px]"
                      style={{
                        background: "#1c0a0a",
                        border: "1px solid #7f1d1d",
                      }}
                    >
                      <p className="text-red-400 font-bold mb-1">
                        3 checks failed
                      </p>
                      <p className="text-red-300/70">
                        auth.algorithm.test → FAIL
                      </p>
                      <p className="text-red-300/70">auth.issuer.test → FAIL</p>
                      <p className="text-red-300/70">
                        deploy.version.test → FAIL
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("suggestion")}
                      className="w-full mt-4 py-2.5 rounded text-[12px] font-bold text-black border-none cursor-pointer hover:brightness-110"
                      style={{ background: "#f59e0b" }}
                    >
                      View Ezra's fix →
                    </button>
                    <p className="text-[10px] text-gray-600 text-center mt-2">
                      Root cause logged to audit trail
                    </p>
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                      Confidence Score
                    </p>
                    <p className="text-[32px] font-black text-green-400 leading-none mb-1">
                      0.91
                    </p>
                    <div className="h-1 bg-gray-700 rounded mb-1">
                      <div className="h-full w-[91%] bg-green-400 rounded" />
                    </div>
                    <p className="text-[11px] text-gray-500 mb-3">
                      High - auto-PR eligible
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Suggested Sources
                    </p>
                    {[
                      ["Playbook", "jwt-algo-constraint-v3"],
                      ["Pattern Match", "SI-231, SI-187 (x2)"],
                      ["Incident", "SI-231"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between mb-1.5">
                        <span className="text-gray-500 text-[11px]">{k}</span>
                        <span className="text-gray-300 text-[11px] text-right max-w-[130px]">
                          {v}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-[#30363d] my-3" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Pull Request
                    </p>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[18px] font-black text-white">
                        #24567
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-900/40 text-green-400 border border-green-800">
                        open
                      </span>
                    </div>
                    <p className="text-gray-300 text-[11px] mb-1">
                      fix(auth): enforce RS256 + issuer validation [SI-920]
                    </p>
                    <p className="text-gray-500 text-[11px] mb-0.5">
                      acme-corp/checkout-api
                    </p>
                    <p className="text-blue-400 text-[11px] mb-4 underline cursor-pointer">
                      github.com/acme/checkout-api/pull/2847
                    </p>
                    <button
                      className="w-full py-2.5 rounded text-[12px] font-bold text-black border-none cursor-pointer mb-2 hover:brightness-110"
                      style={{ background: "#22c55e" }}
                    >
                      Approve and Merge
                    </button>
                    <button
                      className="w-full py-2.5 rounded text-[12px] font-bold text-white border-none cursor-pointer hover:brightness-110"
                      style={{ background: "#ef4444" }}
                    >
                      Decline Suggestion
                    </button>
                    <p className="text-[10px] text-gray-600 text-center mt-2">
                      Every action linked to audit trail
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
