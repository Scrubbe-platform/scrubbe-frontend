/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ReactNode, useEffect, useState } from "react";
import { BsInfoCircleFill } from "react-icons/bs";
import { FaBook, FaPaperPlane, FaTools } from "react-icons/fa";
import { PiListChecksBold } from "react-icons/pi";
import { GrAnnounce } from "react-icons/gr";
import { IoCheckmarkCircle, IoSearch } from "react-icons/io5";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import Select from "../ui/select";
import TextArea from "../ui/text-area";
import Input from "../ui/input";
import useAuthStore from "@/lib/stores/auth.store";
import CButton from "../ui/Cbutton";
import { ArrowLeft, ArrowRight, Loader } from "lucide-react";
import { FiCheck, FiX } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { usePostMortermForm } from "@/lib/stores/post-morterm";
import { toast } from "sonner";
import { FaRegFilePdf } from "react-icons/fa6";
import { Ticket } from "@/types";

const resolutionSteps = [
  {
    name: "Basic Details",
    value: "basic",
    Icon: BsInfoCircleFill,
  },
  {
    name: "Root Cause Analysis",
    value: "analysis",
    Icon: IoSearch,
  },
  {
    name: "Resolution Details",
    value: "resolution",
    Icon: FaTools,
  },
  {
    name: "Knowledge Base Draft",
    value: "draft",
    Icon: FaBook,
  },
  {
    name: "Follow-Up Actions",
    value: "follow-up",
    Icon: PiListChecksBold,
  },
  {
    name: "Stakeholder Communication",
    value: "stakeholder",
    Icon: GrAnnounce,
  },
  {
    name: "Review & Submit",
    value: "review",
    Icon: IoCheckmarkCircle,
  },
];
type PostMortemProps = {
  ticket: Ticket;
  onClose: () => void;
};
const PostMortem = ({ ticket, onClose }: PostMortemProps) => {
  const [steps, setSteps] = useState("basic");

  let content: ReactNode;

  switch (steps) {
    case "basic":
      content = <BasicDetails setSteps={setSteps} ticket={ticket} />;
      break;
    case "analysis":
      content = <Analysis setSteps={setSteps} ticket={ticket} />;
      break;
    case "resolution":
      content = <Resolution setSteps={setSteps} ticket={ticket} />;
      break;
    case "draft":
      content = <Draft setSteps={setSteps} ticket={ticket} />;
      break;
    case "follow-up":
      content = <Followup setSteps={setSteps} ticket={ticket} />;
      break;
    case "stakeholder":
      content = <Stakeholder setSteps={setSteps} ticket={ticket} />;
      break;
    case "review":
      content = <Review ticket={ticket} onClose={onClose} />;
      break;
    default:
      break;
  }

  console.log({ steps });
  return (
    <div className="flex min-h-[700px] overflow-hidden">
      <div className="min-w-[250px] border-r dark:border-neutral-600 border-neutral-200 relative bg-IMSGreen p-4">
        <p className=" text-lg font-semibold text-white ">Resolution Steps</p>

        <div className="w-full mt-5 pr-3 ">
          {resolutionSteps.map(({ Icon, name, value }) => (
            <div
              key={value}
              onClick={() => setSteps(value)}
              className={` cursor-pointer ${
                value === steps ? "bg-white/10 text-white " : "text-neutral-200"
              }  flex flex-row gap-3 items-center p-3 w-full rounded-md`}
            >
              <Icon size={18} />
              <p className=" text-sm">{name}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 w-full overscroll-y-scroll min-h-[700px]">
        {content}
      </div>
    </div>
  );
};

type Props = {
  setSteps: (step: string) => void;
  ticket: Ticket;
};

export default PostMortem;

const BasicDetails = ({ setSteps, ticket }: Props) => {
  const formScheme = z.object({
    template: z.string().nonempty({ message: "template is required" }),
    incidentId: z.string().nonempty(),
    reason: z.string().nonempty({ message: "reason is required" }),
    priority: z.string().nonempty({ message: "priority is required" }),
    reporter: z.string().nonempty({ message: "username is required" }),
    impactedSystem: z.string().optional(),
  });
  type FormType = z.infer<typeof formScheme>;
  const { user } = useAuthStore();
  const {
    control,
    reset,
    formState: { errors },
  } = useForm<FormType>({
    resolver: zodResolver(formScheme),
  });

  useEffect(() => {
    if (user || ticket) {
      console.log("id", ticket.ticketId);
      reset({
        impactedSystem: ticket.affectedSystem,
        incidentId: ticket?.ticketId,
        priority: ticket.priority,
        reporter: `${user?.firstName} ${user?.lastName}`,
        reason: ticket.reason,
      });
    }
  }, [reset, user, ticket]);
  return (
    <div className=" w-full">
      <h1 className="text-2xl font-bold dark:text-white text-black mb-3 ">
        Basic Details
      </h1>
      <Controller
        name="incidentId"
        control={control}
        render={({ field }) => (
          <Input
            label="Incident ID"
            {...field}
            error={errors.template?.message}
            className=" text-black dark:text-white"
            readOnly
          />
        )}
      />

      <Controller
        name="reason"
        control={control}
        render={({ field }) => (
          <TextArea
            label="Description"
            rows={4}
            {...field}
            className="w-full bg-transparent  border border-gray-300 rounded-md p-2 text-sm "
            error={errors.reason?.message}
            readOnly
          />
        )}
      />
      <Controller
        name="priority"
        control={control}
        render={({ field }) => (
          <Select
            label="Priority"
            options={[
              { label: "SELECT PRIORITY", value: "" },
              { label: "Low", value: "LOW" },
              { label: "Medium", value: "MEDIUM" },
              { label: "High", value: "HIGH" },
              { label: "Critical", value: "CRITICAL" },
            ]}
            {...field}
            error={errors.priority?.message}
            className=" text-black dark:text-white"
          />
        )}
      />
      <Controller
        name="impactedSystem"
        control={control}
        render={({ field }) => (
          <Input
            label="Impacted System"
            placeholder=""
            {...field}
            error={errors.impactedSystem?.message}
            className=" text-black dark:text-white"
          />
        )}
      />

      <Controller
        name="reporter"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="Reporter"
            readOnly
            error={errors.reporter?.message}
            className=" text-black dark:text-white"
          />
        )}
      />

      <div className="flex gap-2 justify-end">
        {/* <CButton
            type="button"
            className="w-fit bg-green "
          >
            Close
          </CButton> */}
        <CButton
          type="button"
          className="w-fit bg-green"
          onClick={() => setSteps("analysis")}
        >
          Next <ArrowRight />
        </CButton>
        {/* <CButton
          type="submit"
          className="w-fit bg-green"
          onClick={handleSubmit(handleNext)}
        >
          Next <ArrowRight />
        </CButton> */}
      </div>
    </div>
  );
};
const Analysis = ({ setSteps, ticket }: Props) => {
  const [selectedWhy, setSelectedWhy] = useState<number | null>();
  // const [gaps, setGaps] = useState(["Alert Missing", "Monitoring Gap"]);
  // const [gap, setGap] = useState("");
  const { get } = useFetch();
  const { updateForm } = usePostMortermForm();
  const rootCauseAnalysisSchema = z.object({
    causeCategory: z
      .string({
        required_error: "Please select a cause category.",
      })
      .min(1, "Please select a cause category."), // Ensure a value is selected
    rootCause: z.string().min(1, "Root cause is required."),
    fiveWhys: z.object({
      why1: z.string().min(1, "Why 1 is required."),
      why2: z.string().min(1, "Why 2 is required."),
      why3: z.string().min(1, "Why 3 is required."),
      why4: z.string().min(1, "Why 4 is required."),
      why5: z.string().min(1, "Why 5 is required."),
    }),
  });

  type IFormType = z.infer<typeof rootCauseAnalysisSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(rootCauseAnalysisSchema),
  });

  // const handleRemoveGap = (index: number) => {
  //   setGaps((prev: string[]) => {
  //     const value = prev.filter((_, idx) => index !== idx);
  //     return value;
  //   });
  // };
  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ["five-why"],
    queryFn: async () => {
      const res = await get(
        endpoint.incident_ticket.postmorterm.five_why + "/" + ticket.id
      );
      console.log({ res });
      if (res.success) {
        return res.data;
      }
      return [];
    },
    refetchOnWindowFocus: false,
  });

  const onSubmit = (data: IFormType) => {
    // Handle form submission logic here
    updateForm({ value: { rootCauseAnalysis: data } });
    setSteps("resolution");
  };

  console.log("data", { errors });

  return (
    <div>
      <div className=" overflow-y-auto h-[600px]">
        <h1 className="text-2xl font-bold dark:text-white text-black">
          Root Cause Analysis
        </h1>
        <br />
        <Controller
          name="causeCategory"
          control={control}
          render={({ field }) => (
            <Select
              label="Cause Category"
              options={[
                { value: "", label: "Select Category" },
                { value: "SOFTWARE_BUG", label: "Software Bug" },
                { value: "NETWORK_ISSUE", label: "Network Issue" },
                { value: "HUMAN_ERROR", label: "Human Error" },
                { value: "DATA_BREACH", label: "Data Breach" },
              ]}
              {...field} // Pass all field props (value, onChange, etc.)
              error={errors.causeCategory?.message}
            />
          )}
        />

        {/* 2. Root Cause Text Area */}
        <Controller
          name="rootCause"
          control={control}
          render={({ field }) => (
            <TextArea
              label="Root Cause"
              {...field}
              error={errors.rootCause?.message}
            />
          )}
        />

        {/* 3. Five Whys */}
        <div className="space-y-2">
          <p className="dark:text-white text-sm font-medium">5 Whys</p>

          {isLoading || isRefetching ? (
            <div className="space-y-4 mb-8 max-h-[500px] overflow-y-auto ">
              <div className=" h-12 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.53s]" />
              <div className=" h-12 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.32s]" />
              <div className=" h-12 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.16s]" />
              <div className=" h-12 rounded-md bg-gray-100 animate-pulse-dot" />
              <div className=" h-12 rounded-md bg-gray-100 animate-pulse-dot" />
            </div>
          ) : (
            <div className="space-y-2">
              {["why1", "why2", "why3", "why4", "why5"].map((why, index) => (
                <div key={index}>
                  {
                    <>
                      <div
                        onClick={() => setSelectedWhy(index)}
                        className="dark:text-white text-base cursor-pointer font-medium p-3 rounded-md bg-neutral-50 dark:bg-subDark border dark:border-none border-neutral-200"
                      >
                        Why {index + 1}:{data?.[why]}
                      </div>
                      {selectedWhy === index && (
                        <div className="p-3 border dark:border-zinc-600 rounded-b-lg">
                          <Controller
                            name={`fiveWhys.${why}` as any}
                            control={control}
                            render={({ field }) => <TextArea {...field} />}
                          />
                        </div>
                      )}
                    </>
                  }
                </div>
              ))}
            </div>
          )}
        </div>
        {errors.fiveWhys && (
          <p className="mt-2 text-red-500 text-sm">
            All 5 &quot;Why&quot; fields are required.
          </p>
        )}

        {/* <div className=" mt-2">
        <label
          className="block text-sm font-medium mb-1.5 dark:text-white"
          htmlFor="stakeholders"
        >
          Detection Gap
        </label>
        <div className=" p-2 border border-gray-300 rounded-md">
          <input
            value={gap}
            onChange={(e) => setGap(e.target.value)}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                if (gap) {
                  setGaps((prev) => [...prev, gap]);
                  setGap("");
                }
              }
            }}
            className="w-full text-sm dark:bg-zinc-500 border-zinc-200 border rounded-md p-2 mb-2 dark:text-white"
          />
          <div className="flex flex-wrap items-center gap-2">
            {gaps.map((s, index) => (
              <span
                key={index}
                className="flex items-center space-x-1 bg-green/10 text-green text-xs font-semibold px-2 py-1 rounded-full"
              >
                <span>{s}</span>
                <button
                  onClick={() => handleRemoveGap(index)}
                  className="text-green hover:text-blue-600 focus:outline-none"
                >
                  <FiX size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div> */}
      </div>

      <div className="flex gap-2 justify-end my-4">
        <CButton
          type="button"
          className="w-fit bg-green "
          onClick={() => setSteps("basic")}
        >
          <ArrowLeft /> Previous
        </CButton>
        <CButton
          onClick={handleSubmit(onSubmit)}
          type="submit"
          className="w-fit bg-green"
        >
          Next <ArrowRight />
        </CButton>
      </div>
    </div>
  );
};

const Resolution = ({ setSteps }: Props) => {
  const { updateForm } = usePostMortermForm();

  const resolutionDetailsSchema = z.object({
    temporaryFix: z.string().min(1, "Temporary fix is required."),
    permanentFix: z.string().min(1, "Permanent fix is required."),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resolutionDetailsSchema),
    defaultValues: {
      temporaryFix: "",
      permanentFix: "",
    },
  });

  type IFormType = z.infer<typeof resolutionDetailsSchema>;

  const onSubmit = (data: IFormType) => {
    updateForm({
      value: {
        resolutionDetails: {
          ...data,
        },
      },
    });
    setSteps("draft");
  };

  return (
    <div className=" space-y-3">
      <h1 className="text-2xl font-bold dark:text-white text-black">
        Resolution Details
      </h1>

      <div>
        {/* Controller for Temporary Fix */}
        <Controller
          name="temporaryFix"
          control={control}
          render={({ field }) => (
            <TextArea
              label="Temporary Fix"
              {...field}
              error={errors.temporaryFix?.message}
            />
          )}
        />
      </div>
      <div>
        {/* Controller for Permanent Fix */}
        <Controller
          name="permanentFix"
          control={control}
          render={({ field }) => (
            <TextArea
              label="Permanent Fix"
              {...field}
              error={errors.permanentFix?.message}
            />
          )}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <CButton
          type="button"
          className="w-fit bg-green "
          onClick={() => setSteps("analysis")}
        >
          <ArrowLeft /> Previous
        </CButton>
        <CButton
          onClick={handleSubmit(onSubmit)}
          type="submit"
          className="w-fit bg-green"
        >
          Next <ArrowRight />
        </CButton>
      </div>
    </div>
  );
};

const Draft = ({ setSteps, ticket }: Props) => {
  const [tabs, setTabs] = useState<"internal" | "customer">("internal");
  const [tags, setTags] = useState(["Payment api", "500 Error"]);
  const [tag, setTag] = useState("");
  const { updateForm } = usePostMortermForm();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRemoveTag = (index: number) => {
    setTags((prev: string[]) => {
      const value = prev.filter((_, idx) => index !== idx);
      return value;
    });
  };

  const knowledgeDraftSchema = z.object({
    title: z.string().min(1, { message: "Title is required." }),
    summary: z.string().min(1, { message: "Summary is required." }),
    identificationSteps: z
      .string()
      .min(1, { message: "Identification steps are required." }),
    resolutionSteps: z
      .string()
      .min(1, { message: "Resolution steps are required." }),
    preventiveMeasures: z
      .string()
      .min(1, { message: "Preventive measures are required." }),
  });
  type IForm = z.infer<typeof knowledgeDraftSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(knowledgeDraftSchema),
  });

  const onSubmit = (data: IForm) => {
    if (tags.length === 0) {
      setError("root", { message: "At least one tag is required." });
      return;
    }

    const formData = { ...data, tags };

    updateForm({
      value: {
        knowledgeDraft: {
          internalKb: formData,
        },
      },
    });
    setSteps("follow-up");
    // You can now submit this formData to your API
  };

  const { post } = useFetch();
  const handlePublishCustomerKB = async () => {
    if (!title || !summary) {
      toast.error("title and summary are required");
      return;
    }

    const data = {
      title,
      summary,
    };
    setLoading(true);
    const res = await post(
      endpoint.incident_ticket.postmorterm.customer_kb + "/" + ticket.id,
      data
    );
    setLoading(false);
    if (res.success) {
      toast.success("Customer Facing-KB Published");
    } else {
      toast.error("Failed to publish.");
    }
  };
  return (
    <div>
      <h1 className="text-2xl font-bold dark:text-white text-black">
        Knowledge Base Draft
      </h1>
      <div className="flex gap-3 border-b border-gray-300 dark:border-gray-600 mt-3 text-base">
        <div
          className={`px-3 py-2 cursor-pointer text-base ${
            tabs == "internal"
              ? "border-b-2 border-green text-green"
              : " dark:text-white"
          }`}
          onClick={() => setTabs("internal")}
        >
          Internal KB
        </div>
        <div
          className={`px-3 py-2 cursor-pointer text-base ${
            tabs == "customer"
              ? "border-b-2 border-green text-green"
              : " dark:text-white"
          }`}
          onClick={() => setTabs("customer")}
        >
          Customer-Facing KB
        </div>
      </div>

      <div className="mt-3 overflow-y-auto h-[550px] pb-10">
        {tabs === "internal" && (
          <div>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input label="Title" {...field} error={errors.title?.message} />
              )}
            />

            {/* Summary */}
            <Controller
              name="summary"
              control={control}
              render={({ field }) => (
                <TextArea
                  label="Summary"
                  {...field}
                  error={errors.summary?.message}
                />
              )}
            />

            {/* Identification Steps */}
            <Controller
              name="identificationSteps"
              control={control}
              render={({ field }) => (
                <TextArea
                  label="Identification Steps"
                  {...field}
                  error={errors.identificationSteps?.message}
                />
              )}
            />

            {/* Resolution Steps */}
            <Controller
              name="resolutionSteps"
              control={control}
              render={({ field }) => (
                <TextArea
                  label="Resolution Steps"
                  {...field}
                  error={errors.resolutionSteps?.message}
                />
              )}
            />

            {/* Preventive Measures */}
            <Controller
              name="preventiveMeasures"
              control={control}
              render={({ field }) => (
                <TextArea
                  label="Preventive Measures"
                  {...field}
                  error={errors.preventiveMeasures?.message}
                />
              )}
            />

            <div className=" mt-2">
              <label
                className="block text-sm font-medium mb-1.5 dark:text-white"
                htmlFor="stakeholders"
              >
                Tags
              </label>
              <div className=" p-2 border border-gray-300 rounded-md">
                <input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      if (tag) {
                        setTags((prev) => [...prev, tag]);
                        setTag("");
                      }
                    }
                  }}
                  className="w-full text-sm bg-transparent border-zinc-200 border rounded-md p-2 mb-2 dark:text-white "
                />
                <div className="flex flex-wrap items-center gap-2">
                  {tags.map((s, index) => (
                    <span
                      key={index}
                      className="flex items-center space-x-1 bg-green/10 text-green text-xs font-semibold px-2 py-1 rounded-full"
                    >
                      <span>{s}</span>
                      <button
                        onClick={() => handleRemoveTag(index)}
                        className="text-green hover:text-blue-600 focus:outline-none"
                      >
                        <FiX size={12} />
                      </button>
                    </span>
                  ))}
                  {/* Input for adding more stakeholders would go here */}
                </div>
              </div>

              {errors.root && (
                <p className="text-red-500 mt-2 text-sm">
                  At least one tag is required.
                </p>
              )}
            </div>
          </div>
        )}
        {tabs === "customer" && (
          <div>
            <Input
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              label="Title"
            />
            <TextArea
              onChange={(e) => setSummary(e.target.value)}
              value={summary}
              label="Summary"
            />
            <CButton
              onClick={handlePublishCustomerKB}
              className=" w-fit bg-green "
            >
              {loading ? (
                <Loader className=" animate-spin" size={20} />
              ) : (
                <FaPaperPlane size={20} />
              )}
              Public Customer-Facing KB
            </CButton>
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <CButton
          type="button"
          className="w-fit bg-green "
          onClick={() => setSteps("resolution")}
        >
          <ArrowLeft /> Previous
        </CButton>
        <CButton
          type="button"
          className="w-fit bg-green"
          onClick={handleSubmit(onSubmit)}
        >
          Next <ArrowRight />
        </CButton>
      </div>
    </div>
  );
};
const Followup = ({ setSteps }: Props) => {
  const followUpActionsSchema = z.object({
    task: z.string().min(1, { message: "Task is required." }),
    owner: z.string().min(1, { message: "Owner is required." }),
    dueDate: z.string().min(1, { message: "Due date is required." }),
    status: z.string().min(1, { message: "Status is required." }),
    ticketingSystems: z.array(z.string()).min(1, {
      message: "At least one ticketing system must be selected.",
    }),
  });
  const { updateForm } = usePostMortermForm();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(followUpActionsSchema),
    defaultValues: {
      task: "",
      owner: "",
      dueDate: "",
      status: "",
      ticketingSystems: [],
    },
  });

  const Checkbox = ({ label, ...props }: any) => (
    <label>
      <input type="checkbox" {...props} />{" "}
      <span className="dark:text-white text-sm">{label}</span>
    </label>
  );

  const onSubmit = (value: z.infer<typeof followUpActionsSchema>) => {
    updateForm({
      value: {
        followUpActions: value,
      },
    });
    setSteps("stakeholder");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 dark:text-white">
        Follow-Up Actions
      </h2>

      <div className="grid gap-1 items-center">
        <Controller
          name="task"
          control={control}
          render={({ field }) => (
            <Input label="Task *" {...field} placeholder="Patch API" />
          )}
        />
        <Controller
          name="owner"
          control={control}
          render={({ field }) => (
            <Input label="Owner *" {...field} placeholder="Jane Smith" />
          )}
        />
        <Controller
          name="dueDate"
          control={control}
          render={({ field }) => (
            <Input label="Due Date *" type="date" {...field} />
          )}
        />
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              label="Status"
              {...field}
              options={[
                { value: "", label: "Select Status" },
                { value: "NOT_STARTED", label: "Not Started" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "COMPLETED", label: "Completed" },
              ]}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div>
          {errors.task && (
            <p className="text-red-500 text-sm">{errors.task.message}</p>
          )}
        </div>
        <div>
          {errors.owner && (
            <p className="text-red-500 text-sm">{errors.owner.message}</p>
          )}
        </div>
        <div>
          {errors.dueDate && (
            <p className="text-red-500 text-sm">{errors.dueDate.message}</p>
          )}
        </div>
        <div>
          {errors.status && (
            <p className="text-red-500 text-sm">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6 ">
        <div className="font-semibold mb-2 dark:text-white">
          Ticketing Systems
        </div>
        <Controller
          name="ticketingSystems"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <Checkbox
                label="Create Jira Tickets"
                value="JIRA"
                checked={field.value.includes("JIRA")}
                onChange={(e: any) => {
                  if (e.target.checked) {
                    field.onChange([...field.value, e.target.value]);
                  } else {
                    field.onChange(
                      field.value.filter((val) => val !== e.target.value)
                    );
                  }
                }}
              />
              <Checkbox
                label="Create ServiceNow Tickets"
                value="SERVICE_NOW"
                checked={field.value.includes("SERVICE_NOW")}
                onChange={(e: any) => {
                  if (e.target.checked) {
                    field.onChange([...field.value, e.target.value]);
                  } else {
                    field.onChange(
                      field.value.filter((val) => val !== e.target.value)
                    );
                  }
                }}
              />
              <Checkbox
                label="Create Freshdesk Tickets"
                value="FRESH_DESK"
                checked={field.value.includes("FRESH_DESK")}
                onChange={(e: any) => {
                  if (e.target.checked) {
                    field.onChange([...field.value, e.target.value]);
                  } else {
                    field.onChange(
                      field.value.filter((val) => val !== e.target.value)
                    );
                  }
                }}
              />
            </div>
          )}
        />
        {errors.ticketingSystems && (
          <p className="text-red-500 text-sm mt-2">
            {errors.ticketingSystems.message}
          </p>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <CButton
          type="button"
          className="w-fit bg-green "
          onClick={() => setSteps("draft")}
        >
          <ArrowLeft /> Previous
        </CButton>
        <CButton
          type="button"
          className="w-fit bg-green"
          onClick={handleSubmit(onSubmit)}
        >
          Next <ArrowRight />
        </CButton>
      </div>
    </div>
  );
};
const Stakeholder = ({ ticket, setSteps }: Props) => {
  const [channel, setChannel] = useState("SLACK");
  const [stakeholders, setStakeholders] = useState(["Customers", "Regulators"]);
  const [stakeholder, setStakeholder] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const { get, post } = useFetch();
  const [isLoading, setIsLoading] = useState(false);
  const { updateForm } = usePostMortermForm();

  console.log({ channel });
  const getMessage = async () => {
    setIsLoading(true);
    const res = await get(
      endpoint.incident_ticket.postmorterm.stakeholder + "/" + ticket.id
    );
    setIsLoading(false);
    console.log({ res });
    if (res.success) {
      setMessageContent(res.data.message);
    }
  };

  useEffect(() => {
    getMessage();
  }, []);

  const removeStakeholder = (stakeholderToRemove: string) => {
    setStakeholders(stakeholders.filter((s) => s !== stakeholderToRemove));
  };

  const onSubmit = () => {
    const data = {
      communicationChannel: channel ?? "SLACK",
      targetStakeholders: stakeholders ?? ["customer"],
      messageContent: messageContent,
    };
    updateForm({
      value: {
        stakeHolder: data,
      },
    });
    setSteps("review");
  };

  const downloadRCA = async () => {
    try {
      const data = {
        id: ticket.id,
        description: messageContent,
      };
      setIsLoading(true);
      const res = await post(
        endpoint.incident_ticket.postmorterm.generatePDF,
        data,
        { responseType: "blob" }
      );
      setIsLoading(false);

      console.log(res);
      if (res.success) {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `document-${ticket.id}.pdf`);
        document.body.appendChild(link);
        link.click();
        return;
      }
      toast.error("Download failed", {
        description: "Try again to download RCA",
      });
    } catch (error) {
      console.log(error);
      toast.error("Download failed", {
        description: "Try again to download RCA",
      });
    }
  };

  return (
    <div className=" overflow-scroll">
      <div className="">
        <h1 className="text-2xl font-bold dark:text-white text-black">
          Stakeholder Communications
        </h1>

        {/* Form Section */}
        <div className="mb-6 space-y-6 mt-3">
          {/* Communication Channel */}
          <div>
            <div className="relative">
              <Select
                label=" Communication Channel"
                id="channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                options={[
                  {
                    value: "",
                    label: "Select Channel",
                  },
                  {
                    value: "SLACK",
                    label: "Slack",
                  },
                  {
                    value: "EMAIL",
                    label: "Email",
                  },
                  {
                    value: "PUBLIC_ANNOUNCEMENT",
                    label: "Public Announcement",
                  },
                  {
                    value: "CUSTOMER_PORTAL",
                    label: "Customer Portal",
                  },
                ]}
              />
            </div>
          </div>

          {/* Target Stakeholders */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5 dark:text-white"
              htmlFor="stakeholders"
            >
              Target Stakeholders
            </label>
            <div className=" p-2 border border-gray-300 rounded-md">
              <input
                onChange={(e) => setStakeholder(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    setStakeholders((prev) => [...prev, stakeholder]);
                  }
                }}
                className="w-full bg-transparent border-zinc-200 border rounded-md p-2 mb-2 dark:text-white"
              />
              <div className="flex flex-wrap items-center gap-2">
                {stakeholders.map((s, index) => (
                  <span
                    key={index}
                    className="flex items-center space-x-1 bg-green/10 text-green text-xs font-semibold px-2 py-1 rounded-full"
                  >
                    <span>{s}</span>
                    <button
                      onClick={() => removeStakeholder(s)}
                      className="text-green hover:text-blue-600 focus:outline-none"
                    >
                      <FiX size={12} />
                    </button>
                  </span>
                ))}
                {/* Input for adding more stakeholders would go here */}
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div>
            <TextArea
              id="message"
              label=" Message Content"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            />
          </div>
        </div>

        {/* Communication Preview */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h2 className="text-sm font-semibold mb-2">Communication Preview</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
            {`Slack Message:\n${messageContent}`}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <CButton
            onClick={getMessage}
            isLoading={isLoading}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-green text-white font-medium rounded-md  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span>
              {isLoading ? "Generating" : "Re-generate"} Stakeholder Message
              with AI
            </span>
          </CButton>
          <CButton
            onClick={downloadRCA}
            isLoading={isLoading}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-800 font-medium rounded-md hover:bg-gray-200 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <span>Send RCA to Stakeholders</span>
          </CButton>
        </div>

        <div className="flex gap-2 justify-end">
          <CButton
            type="button"
            className="w-fit bg-green "
            onClick={() => setSteps("draft")}
          >
            <ArrowLeft /> Previous
          </CButton>
          <CButton type="button" className="w-fit bg-green" onClick={onSubmit}>
            Next <ArrowRight />
          </CButton>
        </div>
        {/* Communication History */}
      </div>
    </div>
  );
};

const Review = ({
  ticket,
  onClose,
}: {
  ticket: Ticket;
  onClose: () => void;
}) => {
  const { formValue } = usePostMortermForm();
  const { post } = useFetch();
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async () => {
    console.log(JSON.stringify(formValue, null, 2));
    setIsLoading(true);
    const res = await post(
      endpoint.incident_ticket.postmorterm.resolve + "/" + ticket.id,
      formValue
    );
    setIsLoading(false);
    console.log({ res });
    if (res.success) {
      toast.success("Incident Resolved Successful");
      onClose();
    } else {
      toast.success("Incident Couldn't Resolve, Try again!");
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        Review & Submit
      </h1>

      {/* Checklist Section */}
      <div className="space-y-4 text-sm">
        <div className="flex items-center space-x-2 text-green-700 font-medium">
          <FiCheck size={20} className="stroke-current" />
          <span>RCA Complete</span>
        </div>
        <div className="flex items-center space-x-2 text-green-700 font-medium">
          <FiCheck size={20} className="stroke-current" />
          <span>KB Draft Ready</span>
        </div>
        <div className="flex items-center space-x-2 text-green-700 font-medium">
          <FiCheck size={20} className="stroke-current" />
          <span>Follow-Up Tasks Assigned</span>
        </div>
        <div className="flex items-center space-x-2 text-red-700 font-medium">
          <FiX size={20} className="stroke-current" />
          <span>Stakeholder Communications Sent</span>
        </div>
      </div>

      {/* Buttons Section */}
      <div className="mt-8 flex justify-end space-x-4">
        <CButton className="flex w-fit items-center gap-2 text-sm px-6 py-3 bg-green  font-semibold rounded-md hover:bg-green text-white transition-colors">
          <FaRegFilePdf size={16} /> Export to PDF
        </CButton>
        <CButton
          isLoading={isLoading}
          onClick={handleSubmit}
          className="!px-6 !py-3 bg-IMSLightGreen text-sm w-fit text-white font-semibold rounded-md hover:bg-gray-500 transition-colors"
        >
          Save RCA & Close
        </CButton>
      </div>
    </div>
  );
};
