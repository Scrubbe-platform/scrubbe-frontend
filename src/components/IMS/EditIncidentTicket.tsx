import React, { useEffect, useRef, useState } from "react";
import { z } from "zod";
import CButton from "../ui/Cbutton";
import { Controller, useForm } from "react-hook-form";
import TextArea from "../ui/text-area";
import { IoDocumentTextSharp, IoLocation } from "react-icons/io5";
import { TiSpanner } from "react-icons/ti";
import { useFetch } from "@/hooks/useFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import { querykeys } from "@/lib/constant";
import useTicketDetails from "@/hooks/useTicketDetails";
import { AiFillInfoCircle } from "react-icons/ai";
import Select from "../ui/select";
import {
  FaUser,
  FaToolbox,
  FaBolt,
  FaExclamation,
  FaArrowAltCircleUp,
  FaFolder,
} from "react-icons/fa";
import { HiOutlinePaperClip } from "react-icons/hi";
import { RiInformationLine } from "react-icons/ri";
import Input from "../ui/input";
import PostMortem from "../IncidentTicket/PostMortem";
import clsx from "clsx";
import Modal from "../ui/Modal";
import { Calendar, Clock } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { Ticket } from "@/types";
import CreateWarRoom from "./CreateWarRoom";

const formScheme = z.object({
  source: z.string().nonempty({ message: "source is required" }),
  category: z.string().nonempty({ message: "category is required" }),
  subCategory: z.string().nonempty({ message: "sub category is required" }),
  reason: z.string().nonempty({ message: "reason is required" }),
  description: z.string().nonempty({ message: "reason is required" }),
  priority: z.string().nonempty({ message: "priority is required" }),
  impact: z.string().nonempty({ message: "impact is required" }),
  status: z.string().nonempty({ message: "status is required" }),
  suggestionFix: z.string().optional(),
  assignedTo: z.string().optional(),
  escalation: z.string().optional(),
  affectedSystem: z.string().optional(),
  username: z.string().nonempty({ message: "username is required" }),
});

type FormType = z.infer<typeof formScheme>;

const priorityColors = (priority: string) => {
  return (
    <div className="flex items-center gap-2 ">
      <div
        className={clsx(
          "px-3 py-1 text-xs rounded-md capitalize",
          priority === "CRITICAL"
            ? "bg-red-100 text-red-500"
            : priority === "HIGH"
            ? "text-orange-500 bg-orange-100"
            : priority === "MEDIUM"
            ? "bg-yellow-100 text-yellow-500"
            : priority === "LOW"
            ? "bg-blue-100 text-blue-500"
            : "bg-gray-100 text-gray-500"
        )}
      >
        {priority}
      </div>
    </div>
  );
};
const EditIncidentTicket = () => {
  const { put, get } = useFetch();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [uploadedLogo, setUploadedLogo] = useState<File | null>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useTicketDetails();
  const ticket = data as Ticket;
  const [openPostMortem, setOpenPostMortem] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<FormType>({
    resolver: zodResolver(formScheme),
    mode: "onChange",
  });
  const [openWarRoom, setOpenWarRoom] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      // const validTypes = ["image/jpeg", "image/png"];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (file.size > maxSize) {
        return;
      }

      // Set the uploaded logo for immediate local preview
      setUploadedLogo(file);

      // Also update the store (this will handle base64 conversion asynchronously)
    }
  };

  const { data: members } = useQuery<
    { firstname: string; lastname: string; email: string }[]
  >({
    queryKey: [querykeys.GET_MEMBERS],
    queryFn: async () => {
      try {
        const res = await get(endpoint.incident_ticket.get_members);
        console.log({ memeber: res });
        if (res.success) {
          return res.data;
        }
        return [];
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ data }: { data: FormType }) => {
      try {
        const newData = {
          ...data,
          incidentId: ticket?.id,
        };
        if (data.status === "CLOSED" || data.status === "RESOLVED") {
          newData.status = ticket.status;
        }
        const res = await put(endpoint.incident_ticket.create, newData);
        if (res.success) {
          toast.success("Incident ticket updated successfully");
          queryClient.refetchQueries({ queryKey: [querykeys.INCIDENT_TICKET] });
          if (data.status === "RESOLVED" || data.status === "CLOSED") {
            setOpenPostMortem(true);
            return;
          }
          if (data.priority === "CRITICAL") {
            setOpenWarRoom(true);
          }
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to update incident ticket");
      }
    },
  });

  console.log({ errors });

  const handleUpdateTicket = (data: FormType) => {
    mutateAsync({ data });
  };

  useEffect(() => {
    if (ticket) {
      Object.entries(ticket).map(([key, value]) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue(key as any, value ?? "")
      );
      setValue("username", ticket.userName ?? "");

      setValue("assignedTo", ticket?.assignedToEmail ?? "");
    }
  }, [ticket]);

  const statusColor: { [key: string]: string } = {
    OPEN: "bg-blue-500",
    ACKNOWLEDGED: "bg-cyan-500",
    INVESTIGATION: "bg-amber-500",
    MITIGATED: "bg-orange-500",
    RESOLVED: "bg-emerald-500",
    CLOSED: "bg-gray-500",
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto w-full flex flex-col gap-5 animate-pulse">
        <div className="h-6 w-[60%] rounded-md bg-gray-200" />
        <div className="grid grid-cols-5 gap-4">
          <div className="h-6 w-full rounded-md bg-gray-200" />
          <div className="h-6 w-full rounded-md bg-gray-200" />
          <div className="h-6 w-full rounded-md bg-gray-200" />
          <div className="h-6 w-full rounded-md bg-gray-200" />
          <div className="h-6 w-full rounded-md bg-gray-200" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
            <div className="h-6 w-[40%] rounded-md bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit(handleUpdateTicket)}
        className="p-4 space-y-5 shadow-md mt-6 rounded-xl"
      >
        <div>
          <label
            className={` dark:text-white mb-2 text-sm font-medium flex items-center gap-2`}
          >
            <AiFillInfoCircle className=" text-neutral-700" />
            Status
          </label>

          <div className="flex items-center mb-3">
            {[
              { label: "Open", value: "OPEN" },
              { label: "Acknowledge", value: "ACKNOWLEDGED" },
              { label: "Investigation", value: "INVESTIGATION" },
              { label: "Mitigated", value: "MITIGATED" },
              { label: "Resolved", value: "RESOLVED" },
              { label: "Closed", value: "CLOSED" },
            ].map((status) => (
              <div
                key={status.value}
                className={`px-3 flex items-center text-sm rounded-sm pr-10 status-clip h-[30px] ${
                  status.value === watch("status")
                    ? statusColor[status.value] + " text-white"
                    : "bg-gray-200"
                }`}
              >
                {status.label}
              </div>
            ))}
          </div>

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                options={[
                  { label: "Select status ", value: "" },
                  { label: "Open", value: "OPEN" },
                  { label: "Acknowledge", value: "ACKNOWLEDGED" },
                  { label: "Investigation", value: "INVESTIGATION" },
                  { label: "Mitigated", value: "MITIGATED" },
                  { label: "Resolved", value: "RESOLVED" },
                  { label: "Closed", value: "CLOSED" },
                ]}
                {...field}
                error={errors.status?.message}
                className=" text-black dark:text-white"
              />
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="source"
            control={control}
            render={({ field }) => (
              <Select
                label="Source"
                icon={<IoLocation />}
                info="Select the source of the incident report"
                options={[
                  { label: "Select Source ", value: "" },
                  { label: "Email", value: "EMAIL" },
                  { label: "Slack", value: "SLACK" },
                  { label: "Portal", value: "PORTAL" },
                  { label: "Phone", value: "PHONE" },
                  { label: "Other", value: "OTHERS" },
                ]}
                {...field}
                error={errors.source?.message}
                className=" text-black dark:text-white"
              />
            )}
          />

          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <Input
                icon={<IoDocumentTextSharp />}
                label="Short Description"
                info="Provide a brief description of the incident"
                placeholder="Brief description of the incident"
                {...field}
                error={errors.reason?.message}
                className=" text-black dark:text-white"
              />
            )}
          />

          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <Input
                icon={<FaUser />}
                label="Affected User"
                info="Enter the name or ID of the affected user"
                placeholder="User name or ID"
                {...field}
                error={errors.username?.message}
                className=" text-black dark:text-white"
              />
            )}
          />
          <Controller
            name="affectedSystem"
            control={control}
            render={({ field }) => (
              <Input
                icon={<FaToolbox />}
                info="List affect services or system"
                label="Affected Services"
                placeholder="Email, Database"
                {...field}
                error={errors.affectedSystem?.message}
                className=" text-black dark:text-white"
              />
            )}
          />
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                label="Category"
                info="Select incident category"
                icon={<FaFolder />}
                options={[
                  { label: "Select Category", value: "" },
                  { label: "Fraud", value: "Fraud" },
                  { label: "System", value: "System" },
                  { label: "User Report", value: "User Report" },
                  { label: "Others", value: "Others" },
                ]}
                {...field}
                error={errors.category?.message}
                className=" text-black dark:text-white"
              />
            )}
          />
          <Controller
            name="subCategory"
            control={control}
            render={({ field }) => (
              <Select
                label="Sub-category"
                info="Select incident sub-category"
                icon={<FaFolder />}
                options={[
                  { label: "Select Sub Category", value: "" },
                  {
                    label: "Authentication Issue",
                    value: "Authentication Issue",
                  },
                  {
                    label: "Performance degradation",
                    value: "Performance degradation",
                  },
                  { label: "Security Breech", value: "Security Breech" },
                  { label: "Others", value: "Others" },
                ]}
                {...field}
                error={errors.subCategory?.message}
                className=" text-black dark:text-white"
              />
            )}
          />
          <Input
            icon={<Calendar size={16} />}
            label="Date Opened"
            error={errors.affectedSystem?.message}
            // value={new Date(ticket?.createdAt ?? "")
            //   ?.toISOString()
            //   ?.split("T")
            //   ?.join(" ")}
            className=" text-black dark:text-white"
            readOnly
          />

          <Input
            icon={<Clock size={16} />}
            info="Time taken to raise the incident"
            label="Time taken to raise incident"
            error={errors.affectedSystem?.message}
            className=" text-black dark:text-white"
            value={formatTime(Number(ticket?.MTTR))}
            readOnly
          />

          <div className=" col-span-2 grid grid-cols-2 gap-4">
            <div className=" space-y-2">
              {priorityColors(watch("impact"))}
              <Controller
                name="impact"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Impact"
                    icon={<FaBolt />}
                    info="Select the impact of the incident"
                    options={[
                      { label: "Select Impact", value: "" },
                      { label: "Low", value: "LOW" },
                      { label: "Medium", value: "MEDIUM" },
                      { label: "High", value: "HIGH" },
                      { label: "Critical", value: "CRITICAL" },
                    ]}
                    {...field}
                    error={errors.impact?.message}
                    className=" text-black dark:text-white"
                  />
                )}
              />
            </div>

            <div className=" space-y-2">
              {priorityColors(watch("priority"))}
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Priority"
                    info="Select the priority level resolution"
                    icon={<FaExclamation />}
                    options={[
                      { label: "Select Priority", value: "" },
                      { label: "P5-Informational", value: "INFORMATIONAL" },
                      { label: "P4-Low", value: "LOW" },
                      { label: "P3-Medium", value: "MEDIUM" },
                      { label: "P2-High", value: "HIGH" },
                      { label: "P1-Critical", value: "CRITICAL" },
                    ]}
                    {...field}
                    error={errors.priority?.message}
                    className=" text-black dark:text-white"
                  />
                )}
              />
            </div>
          </div>

          <Controller
            name="escalation"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Escalation"
                info="Select escalation level if needed"
                icon={<FaArrowAltCircleUp />}
                options={[
                  { label: "Select", value: "" },
                  { label: "None", value: "none" },
                  { label: "Tier 1", value: "Tier1" },
                  { label: "Tier 2", value: "Tier2" },
                ]}
                error={errors.assignedTo?.message}
                className=" text-black dark:text-white"
              />
            )}
          />
          <Controller
            name="assignedTo"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                icon={<FaUser />}
                label="Assignee"
                info="Assign to a team member"
                options={[{ label: "Team member or group", value: "" }].concat(
                  members?.map((member) => ({
                    label: member.email,
                    value: member.email,
                  })) ?? []
                )}
                error={errors.assignedTo?.message}
                className=" text-black dark:text-white"
              />
            )}
          />

          <div className="space-y-4">
            <label className="flex gap-2 items-center text-sm font-medium text-gray-700 dark:text-white ">
              <HiOutlinePaperClip /> Attachment
              <div className="group relative">
                <RiInformationLine className=" text-IMSLightGreen cursor-pointer" />
                <div className="group-hover:block hidden absolute -top-[60px] -left-[90px] text-center  w-[200px] rounded-lg p-3 bg-black bg-opacity-80 text-white z-50 ">
                  Upload relevent files or logs
                </div>
              </div>
            </label>
            {/* Upload Area */}
            {!uploadedLogo ? (
              <div
                className="flex text-sm border-zinc-200 border rounded-md h-[42px] overflow-clip"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className=" flex items-center justify-center h-full bg-emerald-100 text-emerald-600 px-2">
                  Choose File
                </span>
                <span className=" px-2 flex items-center h-full dark:text-white">
                  No file chosen yet
                </span>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {uploadedLogo?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {uploadedLogo
                          ? `${(uploadedLogo.size / 1024).toFixed(1)} KB`
                          : "Image file"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedLogo(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextArea
              label="Description"
              info="Provide a detailed account of the incident"
              icon={<IoDocumentTextSharp />}
              rows={4}
              {...field}
              placeholder="Provide a detailed account of the incident including any  relevant context or observations "
              className="w-full bg-transparent dark:!text-white !text-black border border-gray-300 rounded-md p-2 text-sm "
              error={errors.description?.message}
            />
          )}
        />

        <Controller
          name="suggestionFix"
          control={control}
          render={({ field }) => (
            <TextArea
              label="Suggestion Fix"
              info="Suggested potential solutions or actions to resolve the incident"
              icon={<TiSpanner />}
              rows={4}
              {...field}
              placeholder="Suggest Potential solutions  or actions to resolve the incident "
              className="w-full bg-transparent dark:!text-white !text-black border border-gray-300 rounded-md p-2 text-sm "
              error={errors.suggestionFix?.message}
            />
          )}
        />

        <div className="animated-gradient p-[2px] rounded-3xl w-fit">
          <div className=" bg-[#111827] gap-2 px-6 py-2 text-white rounded-3xl font-medium text-sm flex items-center">
            Get AI Powered Suggestion
            <img src="/ezrastar1.svg" alt="ezrastar1.svg" className=" size-4" />
            {/* <PiStarFourFill className=" text-blue-500" size={22} /> */}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <CButton
            type="button"
            onClick={() => router.back()}
            className="w-fit border border-IMSLightGreen shadow-none hover:bg-IMSLightGreen hover:text-white text-IMSLightGreen dark:border-gray-700 bg-transparent"
          >
            Back
          </CButton>

          <CButton
            isLoading={isPending}
            disabled={!isValid}
            type="submit"
            className="w-fit  bg-IMSLightGreen text-white hover:bg-IMSGreen shadow-none"
          >
            Save Changes
          </CButton>
        </div>
      </form>
      <Modal
        onClose={() => setOpenPostMortem(false)}
        isOpen={openPostMortem}
        className="!p-0"
      >
        <PostMortem onClose={() => setOpenPostMortem(false)} ticket={ticket} />
      </Modal>

      <Modal isOpen={openWarRoom} onClose={() => setOpenWarRoom(false)}>
        <CreateWarRoom onClose={() => setOpenWarRoom(false)} />
      </Modal>
    </div>
  );
};

export default EditIncidentTicket;
