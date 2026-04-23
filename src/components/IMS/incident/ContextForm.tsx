import { z } from "zod";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload } from "lucide-react";
import Select from "@/components/ui/select";
import Input from "@/components/ui/input";
import TextArea from "@/components/ui/text-area";

// Mocking your existing components
export const incidentContextSchema = z.object({
  customerImpact: z.string().min(1, "Customer impact is required"),
  externalCommunication: z.string().min(1, "Selection is required"),
  incidentCommander: z.string().min(1, "Incident commander is required"),
  businessImpact: z.coerce.number().min(0, "Must be a positive number"),
  additionalContext: z.string().min(10, "Please provide more detail"),
  labels: z.array(z.string()).min(1, "Add at least one tag"),
  relatedIncidents: z.string().optional(),
  runbookOverrideUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  escalateTo: z.string().min(1, "Escalation target is required"),
  attachments: z
    .array(z.any())
    .refine(
      (files) => files.length > 0,
      "At least one screenshot or log is required"
    )
    .optional(),
});

export type IncidentContextFormValues = z.infer<typeof incidentContextSchema>;

const AddContextForm = () => {
  const [tagInput, setTagInput] = useState("");

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IncidentContextFormValues>({
    resolver: zodResolver(incidentContextSchema),
    defaultValues: {
      labels: ["db-pool", "Deployment", "Checkout"],
      businessImpact: 1800,
      customerImpact: "Partial degradation - Checkout affected",
      externalCommunication: "Not required",
      incidentCommander: "Alice Shen ( SRE Lead )",
      escalateTo: "Service Owner + Change Manager",
    },
  });

  const currentTags = watch("labels");

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!currentTags.includes(tagInput.trim())) {
        setValue("labels", [...currentTags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      "labels",
      currentTags.filter((t) => t !== tagToRemove)
    );
  };

  const onSubmit = (data: IncidentContextFormValues) => {
    console.log("Form Data:", data);
  };

  return (
    <div className="p-6 ">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" p-8 rounded-xl text-slate-300  border border-white/5"
      >
        <h2 className="text-xl font-semibold mb-8 text-white/90">
          Add Context - Enrich signals
        </h2>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {/* Row 1 */}
          <Controller
            name="customerImpact"
            control={control}
            render={({ field }) => (
              <Select
                options={[
                  { value: "", label: "Select impact" },
                  { value: "No customer impact", label: "No customer impact" },
                  {
                    value: "Partial degradation - checkout affected",
                    label: "Partial degradation - checkout affected",
                  },
                  {
                    value: "Full service outage",
                    label: "Full service outage",
                  },
                  {
                    value: "Data integrity risk",
                    label: "Data integrity risk",
                  },
                ]}
                {...field}
                label="Customer Impact"
                error={errors.customerImpact?.message}
              />
            )}
          />
          <Controller
            name="externalCommunication"
            control={control}
            render={({ field }) => (
              <Select
                options={[
                  { value: "Not required", label: "Not required" },
                  {
                    value: "Status page update pending",
                    label: "Status page update pending",
                  },
                  { value: "Status page update", label: "Status page update" },
                  {
                    value: "Customer email send",
                    label: "Customer email send",
                  },
                ]}
                {...field}
                label="External Communication"
                error={errors.externalCommunication?.message}
              />
            )}
          />

          {/* Row 2 */}
          <Controller
            name="incidentCommander"
            control={control}
            render={({ field }) => (
              <Select
                options={[]}
                {...field}
                label="Incident Commander"
                error={errors.incidentCommander?.message}
              />
            )}
          />
          <Controller
            name="businessImpact"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                label="Business impact (£/min)"
                error={errors.businessImpact?.message}
              />
            )}
          />

          {/* Additional Context - Full Width */}
          <div className="col-span-2">
            <Controller
              name="additionalContext"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  label="Additional Context"
                  rows={3}
                  error={errors.additionalContext?.message}
                />
              )}
            />
          </div>

          {/* Labels / Tags */}
          <div className="col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
              Labels / Tags
            </label>
            <div className="flex flex-wrap items-center gap-2 p-2 bg-[#0a0f1d] border border-white/10 rounded-lg focus-within:border-green-500/50 transition-all">
              {currentTags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded text-sm text-slate-300"
                >
                  {tag}
                  <X
                    size={14}
                    className="cursor-pointer hover:text-red-400"
                    onClick={() => removeTag(tag)}
                  />
                </span>
              ))}
              <input
                className="bg-transparent border-none outline-none text-sm p-1 flex-1 min-w-[150px]"
                placeholder="Add tag + enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
            {errors.labels && (
              <p className="text-red-500 text-xs mt-1">
                {errors.labels.message}
              </p>
            )}
          </div>

          {/* Related Incidents */}
          <div className="col-span-2">
            <Controller
              name="relatedIncidents"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Related Incidents"
                  placeholder="SI-0002310, SI-0001870"
                />
              )}
            />
          </div>

          {/* Row 4 */}
          <Controller
            name="runbookOverrideUrl"
            control={control}
            render={({ field }) => (
              <Input {...field} label="Runbook Override URL" />
            )}
          />
          <Controller
            name="escalateTo"
            control={control}
            render={({ field }) => (
              <Select
                options={[]}
                {...field}
                label="Escalate to"
                error={errors.escalateTo?.message}
              />
            )}
          />

          <div className="col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
              Evidence & Attachments
            </label>

            <Controller
              name="attachments"
              control={control}
              render={({ field }) => (
                <div
                  className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center bg-white/[0.02] transition-all cursor-pointer
          ${
            errors.attachments
              ? "border-red-500/50 bg-red-500/5"
              : "border-white/10 hover:bg-white/[0.04]"
          }
        `}
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      field.onChange(files);
                    }}
                  />

                  <Upload
                    className={`${
                      errors.attachments ? "text-red-400" : "text-slate-500"
                    } mb-4`}
                    size={32}
                  />

                  <p className="text-sm font-medium text-slate-300">
                    {field.value?.length
                      ? `${field.value.length} files selected`
                      : "Attach Screenshots, Logs, Dashboards"}
                  </p>

                  <p className="text-xs text-slate-500 mt-2">
                    PNG, JPG, PDF, .Log, .txt, .json, .yami - max 25MB per file
                  </p>

                  {errors.attachments && (
                    <p className="text-red-500 text-xs mt-4 font-bold uppercase tracking-tight">
                      {errors.attachments.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-10">
          <button
            type="button"
            className="px-4 py-2.5 text-sm rounded-lg border border-green-400 text-green-400 font-semibold hover:bg-green-400/5 transition-all"
          >
            Save as draft
          </button>
          <button
            type="submit"
            className="px-4 py-2.5 text-sm rounded-lg bg-green-400 text-[#050b18] font-bold hover:bg-green-300 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          >
            Save and update incident
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddContextForm;
