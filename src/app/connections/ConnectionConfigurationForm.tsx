"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { BiGitRepoForked } from "react-icons/bi";
import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/text-area";
import { apiClient } from "@/lib/api/client";
import { endpoint } from "@/lib/api/endpoint";

type ConnectionCategory =
  | "code_repos"
  | "cicd"
  | "runtime"
  | "datastores"
  | "fraud_metrics";

type ConnectionConfigurationFormProps = {
  integration: string;
  integrationType: string;
  category: ConnectionCategory;
  sectionTitle: string;
  description: string;
  baseUrlLabel: string;
  baseUrlPlaceholder: string;
  credentialLabel: string;
  credentialPlaceholder: string;
  scopeLabel: string;
  scopePlaceholder: string;
  notesPlaceholder: string;
  helperText: string;
  defaultBaseUrl?: string;
  onSuccess?: () => void;
};

type FormState = {
  displayName: string;
  baseUrl: string;
  credential: string;
  scope: string;
  environmentTags: string;
  notes: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message ??
      error.response?.data?.detail ??
      fallback
    );
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function ConnectionConfigurationForm({
  integration,
  integrationType,
  category,
  sectionTitle,
  description,
  baseUrlLabel,
  baseUrlPlaceholder,
  credentialLabel,
  credentialPlaceholder,
  scopeLabel,
  scopePlaceholder,
  notesPlaceholder,
  helperText,
  defaultBaseUrl,
  onSuccess,
}: ConnectionConfigurationFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    displayName: integration,
    baseUrl: defaultBaseUrl ?? "",
    credential: "",
    scope: "",
    environmentTags: "",
    notes: "",
  });

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.displayName.trim()) {
      toast.error("Display name is required");
      return;
    }

    if (!form.credential.trim()) {
      toast.error(`${integration} requires a credential before it can be saved`);
      return;
    }

    setIsSaving(true);

    try {
      const response = await apiClient.post(endpoint.connectors.connections, {
        type: integrationType,
        category,
        displayName: form.displayName.trim(),
        baseUrl: form.baseUrl.trim() || defaultBaseUrl || undefined,
        credential: form.credential.trim(),
        scope: form.scope.trim() || undefined,
        environmentTags: form.environmentTags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        notes: form.notes.trim() || undefined,
      });

      const created = Boolean(response.data?.data?.created);
      toast.success(
        created
          ? `${integration} connection saved`
          : `${integration} connection updated`,
      );

      setForm((current) => ({
        ...current,
        credential: "",
      }));
      onSuccess?.();
    } catch (error) {
      toast.error(
        getErrorMessage(error, `Unable to save the ${integration} connection`),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-lg text-white">{integration}</h2>
      </div>
      <div className="border border-gray-400 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 text-white text-base font-bold">
          <BiGitRepoForked />
          <p>{sectionTitle}</p>
        </div>
        <p className="text-sm text-white">{description}</p>
      </div>

      <div>
        <Input
          label="Display Name"
          placeholder={`eg ${integration} - Core Org`}
          labelClassName="text-white"
          className="text-white"
          value={form.displayName}
          onChange={(event) => updateField("displayName", event.target.value)}
        />
        <Input
          label={baseUrlLabel}
          placeholder={baseUrlPlaceholder}
          labelClassName="text-white"
          className="text-white"
          value={form.baseUrl}
          onChange={(event) => updateField("baseUrl", event.target.value)}
        />
        <Input
          label={credentialLabel}
          placeholder={credentialPlaceholder}
          labelClassName="text-white"
          className="text-white"
          value={form.credential}
          onChange={(event) => updateField("credential", event.target.value)}
        />
        <p className="text-white text-sm pb-4">{helperText}</p>
        <div className="grid grid-cols-2 gap-5">
          <Input
            label={scopeLabel}
            placeholder={scopePlaceholder}
            labelClassName="text-white"
            className="text-white"
            value={form.scope}
            onChange={(event) => updateField("scope", event.target.value)}
          />
          <Input
            label="Environment tags"
            placeholder="eg prod, staging"
            labelClassName="text-white"
            className="text-white"
            value={form.environmentTags}
            onChange={(event) =>
              updateField("environmentTags", event.target.value)
            }
          />
        </div>
        <TextArea
          label="Notes for your team (optional)"
          placeholder={notesPlaceholder}
          labelClassName="text-white"
          className="text-white"
          value={form.notes}
          onChange={(event) => updateField("notes", event.target.value)}
        />
        <CButton type="submit" disabled={isSaving} isLoading={isSaving}>
          Save
        </CButton>
      </div>
    </form>
  );
}
