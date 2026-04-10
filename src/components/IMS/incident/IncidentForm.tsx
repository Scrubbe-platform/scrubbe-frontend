import { z } from "zod";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Info } from "lucide-react";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import TextArea from "@/components/ui/text-area";

// --- Schema Definitions ---
export const raiseIncidentSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(100),
  service: z
    .string()
    .min(1, "Please select an affected service")
    .refine((val) => val !== "select-service", "Please select a valid service"),
  environment: z.string().min(1, "Environment is required"),
  severity: z.enum(["P0", "P1", "P2", "P3", "P4"], {
    required_error: "Please select a severity level",
  }),
  description: z.string().min(20, "Please provide a more detailed description"),
  firstNoticed: z.string().min(1, "Selection required"),
  recentChange: z.string().optional(),
  customerImpact: z.string().min(1, "Impact status required"),
  businessImpact: z.string().optional(),
  assignTo: z.string().min(1, "Please assign a lead"),
  notifyChannels: z.string().min(1, "Select at least one channel"), // Adjusted to string if using single select
  warRoom: z.boolean().default(false).optional(),
  attachments: z.array(z.any()).optional(),
});

type RaiseIncidentFormValues = z.infer<typeof raiseIncidentSchema>;

const FormSection = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-4">
    {children}
  </div>
);

const RaiseIncidentModal = ({ onClose }: { onClose?: () => void }) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RaiseIncidentFormValues>({
    resolver: zodResolver(raiseIncidentSchema),
    defaultValues: {
      severity: "P2",
      environment: "Production",
      customerImpact: "unknown",
      title: "",
      description: "",
      firstNoticed: "alert-alarm-fired",
      assignTo: "",
      warRoom: false,
      notifyChannels: "sre-oncall-pagerduty",
    },
  });

  const watchedTitle = watch("title");
  const watchedEnv = watch("environment");
  const watchedSeverity = watch("severity");

  const onSubmit = async (data: RaiseIncidentFormValues) => {
    // Artificial delay for UX
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Creating Incident:", data);
  };

  const status = {
    P0: "border-red-500 text-red-500",
    P1: "border-red-600 text-red-600",
    P2: "border-orange-500 text-orange-500",
    P3: "border-yellow-500 text-yellow-500",
    P4: "border-blue-500 text-blue-500",
  };

  const statusLabel: Record<string, string> = {
    P0: "Full outage",
    P1: "Critical impact",
    P2: "Major degradation",
    P3: "Minor impact",
    P4: "Informational",
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-[#050b18] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-start sticky top-0 bg-[#050b18] z-20">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Raise Incident
            </h2>
            <p className="text-slate-500 text-sm">
              Manual raise · enters the same governance pipeline as
              auto-detected incidents{" "}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-4">
          <FormSection>
            <div className="space-y-6">
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Incident Title *"
                    placeholder="Brief description of what's failing"
                    error={errors.title?.message}
                  />
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="service"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Affected Service *"
                      error={errors.service?.message}
                      options={[
                        { value: "select-service", label: "Select service..." },
                        {
                          value: "checkout-service",
                          label: "checkout-service",
                        },
                        { value: "payments-api", label: "payments-api" },
                        { value: "auth-service", label: "auth-service" },
                        { value: "api-gateway", label: "api-gateway" },
                      ]}
                    />
                  )}
                />
                <Controller
                  name="environment"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Environment *"
                      error={errors.environment?.message}
                      options={[
                        { value: "Production", label: "Production" },
                        { value: "Staging", label: "Staging" },
                        { value: "Development", label: "Development" },
                      ]}
                    />
                  )}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">
                  Severity *
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {["P0", "P1", "P2", "P3", "P4"].map((sev) => (
                    <Controller
                      key={sev}
                      name="severity"
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          onClick={() => field.onChange(sev)}
                          className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                            field.value === sev
                              ? `${status[sev]}`
                              : "bg-white/5 border-white/10 text-slate-400 hover:border-white/30"
                          }`}
                        >
                          <span className="font-bold">{sev}</span>
                          <span className="text-[10px] uppercase opacity-60 text-slate-400">
                            {statusLabel[sev]}
                          </span>
                        </button>
                      )}
                    />
                  ))}
                </div>
                {errors.severity && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.severity.message}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection>
            <div className="space-y-6">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    label="What is happening? *"
                    placeholder="Describe the symptoms..."
                    error={errors.description?.message}
                    rows={4}
                  />
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="firstNoticed"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="What did you notice first? *"
                      error={errors.firstNoticed?.message}
                      options={[
                        {
                          value: "alert-alarm-fired",
                          label: "Alert / alarm fired",
                        },
                        { value: "customer-report", label: "Customer report" },
                        { value: "latency-spike", label: "Latency spike" },
                      ]}
                    />
                  )}
                />
                <Controller
                  name="recentChange"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} label="Recent change? (optional)" />
                  )}
                />
                <Controller
                  name="customerImpact"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Customer Impact *"
                      error={errors.customerImpact?.message}
                      options={[
                        { value: "unknown", label: "Unknown" },
                        {
                          value: "partial-degradation",
                          label: "Partial degradation",
                        },
                        {
                          value: "full-service-outage",
                          label: "Full service outage",
                        },
                      ]}
                    />
                  )}
                />
                <Controller
                  name="businessImpact"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Business Impact (£/min)"
                      placeholder="Estimate"
                    />
                  )}
                />
              </div>
            </div>
          </FormSection>

          <FormSection>
            <div className="grid grid-cols-2 gap-6">
              <Controller
                name="assignTo"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Assign To *"
                    error={errors.assignTo?.message}
                    options={[
                      { value: "alice-chen", label: "Alice Chen (SRE Lead)" },
                      {
                        value: "paschal-ifediora",
                        label: "Paschal Ifediora (SRE Lead)",
                      },
                    ]}
                  />
                )}
              />
              <Controller
                name="notifyChannels"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Notify Channels *"
                    error={errors.notifyChannels?.message}
                    options={[
                      {
                        value: "sre-oncall-pagerduty",
                        label: "#sre-oncall + PagerDuty",
                      },
                      { value: "no-notification", label: "No notification" },
                    ]}
                  />
                )}
              />
            </div>
          </FormSection>

          {/* Real-time Preview */}
          <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-3xl p-8 mt-8">
            <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-4 block">
              Incident Preview
            </span>
            <h3 className="text-2xl font-bold text-white mb-2 break-words">
              {watchedTitle || "Incident title will appear here..."}
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              {watchedEnv} · {watchedSeverity}
            </p>
            <div className="flex items-start gap-2 text-slate-500 text-xs">
              <Info size={14} className="mt-0.5 shrink-0" />
              <p>Scrubbe will automatically correlate signals once raised.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-8 sticky bottom-0 bg-[#050b18] py-4 z-20 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-xl bg-cyan-400 text-[#050b18] font-bold hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              {isSubmitting ? "Creating..." : "Save and update incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseIncidentModal;
