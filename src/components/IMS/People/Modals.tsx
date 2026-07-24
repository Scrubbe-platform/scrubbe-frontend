"use client";

import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import Select from "@/components/ui/select";
import { PasswordField } from "./sections";
import { genPassword } from "./utils";

const ROLE_OPTIONS = ["Responder", "Platform Engineer", "Incident Commander", "Engineering Manager", "Service Owner", "Executive", "Administrator"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-black dark:text-zinc-500">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-[13.5px] text-black focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

function ModalFoot({ children }: { children: React.ReactNode }) {
  return <div className="mt-5 flex justify-end gap-2">{children}</div>;
}
function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg border border-zinc-300 px-3.5 py-2 text-[12.5px] text-black hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
      {children}
    </button>
  );
}
function PrimaryBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg bg-emerald-600 px-3.5 py-2 text-[12.5px] font-medium text-white hover:bg-emerald-700">
      {children}
    </button>
  );
}

export interface BulkInviteData {
  emails: string[];
  role: string;
}

export function InviteForm({ onSend, onCancel, sending }: { onSend: (d: BulkInviteData) => void; onCancel: () => void; sending?: boolean }) {
  const [emailsText, setEmailsText] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0]);

  const emails = emailsText
    .split(/[\n,]+/)
    .map((v) => v.trim())
    .filter(Boolean);

  return (
    <div className="p-4">
      <h3 className="text-[16px] font-semibold text-black dark:text-zinc-100">Invite people</h3>
      <p className="mt-1 text-[12px] text-black dark:text-zinc-400">
        Paste one or more emails separated by commas or line breaks. Each person gets a sign-in link scoped to <b className="text-black dark:text-zinc-200">your tenant</b>, recorded in the audit trail.
      </p>
      <div className="mt-4">
        <Field label="Email addresses">
          <textarea
            value={emailsText}
            onChange={(e) => setEmailsText(e.target.value)}
            rows={4}
            placeholder="jane@company.com, sam@company.com"
            className={cn(inputCls, "resize-y font-mono text-[13px]")}
          />
        </Field>
        <p className="mt-1.5 text-[11px] text-black dark:text-zinc-500">{emails.length ? `${emails.length} email${emails.length > 1 ? "s" : ""} ready to invite` : "No emails yet"}</p>
      </div>
      <div className="mt-3.5">
        <Field label="Role for these invites">
          <Select value={role} onChange={(e) => setRole(e.target.value)} options={ROLE_OPTIONS.map((r) => ({ value: r, label: r }))} />
        </Field>
      </div>
      <ModalFoot>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
        <PrimaryBtn onClick={() => emails.length > 0 && !sending && onSend({ emails, role })}>{sending ? "Sending…" : "Send Invites"}</PrimaryBtn>
      </ModalFoot>
    </div>
  );
}

export function AdminSignInForm({ onAuthenticate, onCancel }: { onAuthenticate: () => void; onCancel: () => void }) {
  const [email, setEmail] = useState("admin@company.com");
  const [password, setPassword] = useState("demo-password");
  const [code, setCode] = useState("204 815");

  return (
    <div className="p-4">
      <div className="mb-1 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/10">
          <ShieldCheck size={17} className="text-sky-600 dark:text-sky-400" />
        </span>
        <div>
          <h3 className="text-[16px] font-semibold text-black dark:text-zinc-100">Admin sign-in</h3>
          <p className="text-[12px] text-black dark:text-zinc-400">Step-up authentication unlocks administrative actions on every profile.</p>
        </div>
      </div>
      <div className="mt-4 space-y-3.5">
        <Field label="Administrator email">
          <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Password">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Authenticator code">
          <input value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} />
          <p className="mt-1.5 text-[11px] text-black dark:text-zinc-500">This elevated session lasts 15 minutes and is written to the audit trail.</p>
        </Field>
      </div>
      <ModalFoot>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
        <PrimaryBtn onClick={onAuthenticate}>Authenticate</PrimaryBtn>
      </ModalFoot>
    </div>
  );
}

export function ChangePasswordForm({ onSave, onCancel }: { onSave: (newPw: string) => void; onCancel: () => void }) {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function save() {
    if (newPw.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (newPw !== confirm) {
      setError("New passwords don't match");
      return;
    }
    onSave(newPw);
  }

  return (
    <div className="p-4">
      <h3 className="text-[16px] font-semibold text-black dark:text-zinc-100">Change your password</h3>
      <p className="mt-1 text-[12px] text-black dark:text-zinc-400">Choose a new password for your own account.</p>
      <div className="mt-4 space-y-3.5">
        <Field label="Current password">
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••" className={inputCls} />
        </Field>
        <Field label="New password">
          <PasswordField value={newPw} onChange={setNewPw} onGenerate={(pw) => setConfirm(pw)} placeholder="At least 8 characters" reveal />
        </Field>
        <Field label="Confirm new password">
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter new password" className={inputCls} />
          <p className="mt-1.5 text-[11px] text-black dark:text-zinc-500">
            {error || "Use at least 8 characters. Generating a password fills both fields so you can copy it. You'll stay signed in on this device."}
          </p>
        </Field>
      </div>
      <ModalFoot>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
        <PrimaryBtn onClick={save}>Update password</PrimaryBtn>
      </ModalFoot>
    </div>
  );
}

export function AdminResetPasswordForm({ personName, onSave, onCancel }: { personName: string; onSave: (pw: string) => void; onCancel: () => void }) {
  const [pw, setPw] = useState(() => genPassword());
  const [error, setError] = useState("");

  return (
    <div className="p-4">
      <h3 className="text-[16px] font-semibold text-black dark:text-zinc-100">Reset password</h3>
      <p className="mt-1 text-[12px] text-black dark:text-zinc-400">
        Set a new password for <b className="text-black dark:text-zinc-200">{personName}</b>. This is recorded in the audit trail.
      </p>
      <div className="mt-4">
        <Field label="New password">
          <PasswordField value={pw} onChange={setPw} reveal />
          <p className="mt-1.5 text-[11px] text-black dark:text-zinc-500">
            {error || "Share this securely. The person is signed out of active sessions and prompted to set their own password and MFA on next sign-in."}
          </p>
        </Field>
      </div>
      <ModalFoot>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
        <PrimaryBtn
          onClick={() => {
            if (pw.length < 8) {
              setError("Password must be at least 8 characters");
              return;
            }
            onSave(pw);
          }}
        >
          Set password
        </PrimaryBtn>
      </ModalFoot>
    </div>
  );
}
