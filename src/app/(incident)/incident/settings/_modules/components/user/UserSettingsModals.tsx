"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/text-area";
import Select from "@/components/ui/select";
import Button from "@/components/ui/Button1";
import { useChangePassword } from "@/lib/api";

function ModalShell({
  isOpen,
  onClose,
  title,
  desc,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="sm:max-w-md">
      <div className="p-4">
        <h3 className="text-[18px] font-bold text-black dark:text-zinc-100">
          {title}
        </h3>
        {desc && (
          <p className="mt-1.5 text-[13.5px] text-black/60 dark:text-zinc-400">
            {desc}
          </p>
        )}
        <div className="mt-5">{children}</div>
      </div>
    </Modal>
  );
}

/* ───────────────────── confirm ───────────────────── */

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  body,
  confirmLabel = "Confirm",
  danger,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
}) {
  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title={title} desc={body}>
      <div className="flex justify-end gap-2.5">
        <Button variant="outline-dark" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant={danger ? "outline-green" : "solid"}
          size="sm"
          className={danger ? "!border-rose-300 !text-rose-600 hover:!bg-rose-50" : ""}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </ModalShell>
  );
}

/* ───────────────────── change password ───────────────────── */

export function ChangePasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { execute, isLoading } = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function reset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function submit() {
    if (!currentPassword || !newPassword) {
      toast.error("Fill in both password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    const res = await execute({ currentPassword, newPassword });
    if (res !== null) {
      reset();
      onClose();
    }
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Change password"
      desc="Use a strong password you don't use anywhere else."
    >
      <div className="space-y-4">
        <Input
          label="Current password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <div className="mt-5 flex justify-end gap-2.5">
        <Button variant="outline-dark" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="solid" size="sm" disabled={isLoading} onClick={() => void submit()}>
          {isLoading ? "Changing…" : "Change password"}
        </Button>
      </div>
    </ModalShell>
  );
}

/* ───────────────────── feedback / support / report ───────────────────── */

export interface FeedbackField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select";
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export function FeedbackModal({
  isOpen,
  onClose,
  title,
  desc,
  fields,
  submitLabel = "Submit",
  successMessage = "Thanks — this was sent",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  desc?: string;
  fields: FeedbackField[];
  submitLabel?: string;
  successMessage?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  function set(key: string, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  function submit() {
    for (const f of fields) {
      if (f.required && !(values[f.key] || "").trim()) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    setValues({});
    onClose();
    toast.success(successMessage);
  }

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title={title} desc={desc}>
      <div className="space-y-4">
        {fields.map((f) => {
          const val = values[f.key] || "";
          if (f.type === "textarea")
            return (
              <TextArea
                key={f.key}
                label={f.label}
                placeholder={f.placeholder}
                rows={4}
                value={val}
                onChange={(e) => set(f.key, e.target.value)}
              />
            );
          if (f.type === "select")
            return (
              <Select
                key={f.key}
                label={f.label}
                value={val || f.options?.[0] || ""}
                onChange={(e: any) => set(f.key, e.target.value)}
                options={(f.options || []).map((o) => ({ value: o, label: o }))}
              />
            );
          return (
            <Input
              key={f.key}
              label={f.label}
              placeholder={f.placeholder}
              value={val}
              onChange={(e) => set(f.key, e.target.value)}
            />
          );
        })}
      </div>
      <div className="mt-5 flex justify-end gap-2.5">
        <Button variant="outline-dark" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="solid" size="sm" onClick={submit}>
          {submitLabel}
        </Button>
      </div>
    </ModalShell>
  );
}
