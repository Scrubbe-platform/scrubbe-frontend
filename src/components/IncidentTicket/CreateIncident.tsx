"use client";
import React, { useEffect, useRef, useState } from "react";
import Modal from "../ui/Modal";
import CButton from "../ui/Cbutton";
import Select from "../ui/select";
import Input from "../ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { querykeys } from "@/lib/constant";
import { useRouter, useSearchParams } from "next/navigation";
import TextArea from "../ui/text-area";
import {
  IoChevronBack,
  IoDocumentTextSharp,
  IoLocation,
} from "react-icons/io5";
import { AiFillInfoCircle } from "react-icons/ai";
import { RiInformationLine } from "react-icons/ri";
import {
  FaArrowAltCircleUp,
  FaBolt,
  FaExclamation,
  FaFolder,
  FaToolbox,
  FaUser,
} from "react-icons/fa";
import { TiSpanner } from "react-icons/ti";
import { HiOutlinePaperClip } from "react-icons/hi";
import { Calendar, Clock } from "lucide-react";
import useAuthStore from "@/lib/stores/auth.store";
import clsx from "clsx";

type CreateIncidentProps = {
  isOpen: boolean;
  onClose: () => void;
  isModal: boolean;
};
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
  userName: z.string().nonempty({ message: "userName is required" }),
  incidentId: z.string().nonempty(),
});

type FormType = z.infer<typeof formScheme>;

const MTTR: { [key: string]: { label: string; value: number } } = {
  CRITICAL: { label: "Average response time-15 minutes", value: 900 },
  HIGH: { label: "Average response time-30 minutes", value: 1800 },
  MEDIUM: { label: "Average response time-2 hours", value: 7200 },
  LOW: { label: "Average response time-4 hours", value: 14400 },
};

const CreateIncident = ({ isOpen, onClose, isModal }: CreateIncidentProps) => {
  const { post, get } = useFetch();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const modal = searchParams.get("modal");
  const description = searchParams.get("description");
  const priority = searchParams.get("priority");
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormType>({
    resolver: zodResolver(formScheme),
  });
  const [uploadedLogo, setUploadedLogo] = useState<File | null>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [acknowledge, setAcknowledge] = useState(false);
  const { user } = useAuthStore();

  console.log("error", errors);

  // const removeQuery = () => {
  //   const newSearchParams = new URLSearchParams(searchParams.toString());
  //   newSearchParams.delete("modal");
  //   newSearchParams.delete("description");
  //   newSearchParams.delete("priority");
  //   newSearchParams.delete("title");

  //   router.replace(`?${newSearchParams.toString()}`);
  // };

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["CREATE-INCIDENT"],
    mutationFn: async ({ data }: { data: FormType }) => {
      try {
        const formData = {
          ...data,
          userId: user?.id,
          MTTR: String(elapsedTime),
        };
        const res = await post(endpoint.incident_ticket.create, formData);
        if (res.success) {
          toast.success("Incident ticket created successfully");
          queryClient.refetchQueries({ queryKey: [querykeys.INCIDENT_TICKET] });
          // removeQuery();
          if (isModal) {
            onClose();
          } else {
            router.back();
          }

          return;
        }
        toast.success("Incident was not created");
      } catch (error) {
        console.log(error);
        toast.error("Failed to create incident ticket");
      }
    },
  });

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
  });

  const { data: newIncidentId } = useQuery({
    queryKey: [querykeys.GET_INCIDENT_ID],
    queryFn: async () => {
      try {
        const res = await get(endpoint.incident_ticket.get_incident_id);
        console.log(newIncidentId);
        if (res.success) {
          setValue("incidentId", res.data.ticketId);
          setValue("status", "OPEN");
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

  const createIncidentTicket = async (value: FormType) => {
    mutateAsync({ data: value });
  };

  useEffect(() => {
    if (Boolean(modal) === true) {
      setValue("priority", String(priority));
      setValue("reason", String(description));
    }
  }, [modal, description, priority]);

  const statusColor: { [key: string]: string } = {
    OPEN: "bg-blue-500",
    ACKNOWLEDGED: "bg-cyan-500",
    INVESTIGATION: "bg-amber-500",
    MITIGATED: "bg-orange-500",
    RESOLVED: "bg-emerald-500",
    CLOSED: "bg-gray-500",
  };

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

  useEffect(() => {
    // Set up the interval to run every 1000 milliseconds (1 second)
    const intervalId = setInterval(() => {
      if (acknowledge === false) {
        setElapsedTime((prevTime) => prevTime + 1);
      }
    }, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [acknowledge]); // The empty dependency array ensures this effect runs only once on mount

  // Format the elapsed time into HH:MM:SS format
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => String(num).padStart(2, "0");

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const handleAck = () => {
    setAcknowledge(true);
    setValue("status", "ACKNOWLEDGED");
    toast.success("Incident Acknowledge", {
      description: "Complete form and create incident",
    });
  };

  const content = (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <div className="text-xl font-semibold dark:text-white text-black">
          Create and Manage new critical Incidents
        </div>
      </div>
      <form
        onSubmit={handleSubmit(createIncidentTicket)}
        className={` space-y-5  mt-6 rounded-xl ${isModal ? "p-0" : "p-4"}`}
      >
        {!isModal && (
          <div
            className="flex items-center gap-2 cursor-pointer text-sm w-fit"
            onClick={() => router.back()}
          >
            <IoChevronBack />
            Back
          </div>
        )}
        <div className=" justify-between flex ">
          <h1 className="text-xl font-bold dark:text-white text-black">
            Incident ID ({newIncidentId?.ticketId})
          </h1>
          <p
            className={` text-xl font-semibold flex items-center gap-2 ${
              elapsedTime >= MTTR[watch("priority")]?.value &&
              watch("priority") !== "INFORMATIONAL"
                ? "text-red-500"
                : "text-emerald-500"
            }`}
          >
            MTTR {formatTime(elapsedTime)}
            <div className="group relative">
              <RiInformationLine className=" text-IMSLightGreen cursor-pointer" />
              <div className="group-hover:block text-sm hidden absolute -top-[60px] right-0 text-center  w-[200px] rounded-lg p-3 bg-black bg-opacity-80 text-white z-50 ">
                Time taken to raise the incident
              </div>
            </div>
          </p>
        </div>
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
            name="userName"
            control={control}
            render={({ field }) => (
              <Input
                icon={<FaUser />}
                label="Affected User"
                info="Enter the name or ID of the affected user"
                placeholder="User name or ID"
                {...field}
                error={errors.userName?.message}
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
            value={new Date(Date.now()).toISOString().split("T").join(" ")}
            className=" text-black dark:text-white"
            readOnly
          />

          <Input
            icon={<Clock size={16} />}
            info="Time taken to raise the incident"
            label="Time taken to raise incident"
            className=" text-black dark:text-white"
            value={formatTime(elapsedTime)}
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
              <div className="flex items-center gap-2">
                {priorityColors(watch("priority"))}{" "}
                <p className="text-sm ">{`${
                  MTTR[watch("priority")]?.label ?? ""
                }`}</p>
              </div>
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
            <label className="flex gap-2 items-center text-sm font-medium text-gray-700 ">
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
                <span className=" px-2 flex items-center h-full">
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
          <div className=" cursor-pointer bg-[#111827] gap-2 px-6 py-2 text-white rounded-3xl font-medium text-sm flex items-center">
            Get AI Powered Suggestion
            <img src="/ezrastar1.svg" alt="ezrastar1.svg" className=" size-4" />
            {/* <PiStarFourFill className=" text-blue-500" size={22} /> */}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <CButton
            type="button"
            className="w-fit border border-IMSLightGreen shadow-none hover:bg-IMSLightGreen hover:text-white text-IMSLightGreen dark:border-gray-700 bg-transparent"
          >
            Preview Details
          </CButton>
          <CButton
            type="button"
            onClick={handleAck}
            disabled={acknowledge}
            className="w-fit border border-IMSLightGreen shadow-none hover:bg-IMSLightGreen hover:text-white text-IMSLightGreen dark:border-gray-700 bg-transparent"
          >
            Acknowledge
          </CButton>
          <CButton
            isLoading={isPending}
            type="submit"
            className="w-fit  bg-IMSLightGreen text-white hover:bg-IMSGreen shadow-none"
          >
            Create Incident
          </CButton>
        </div>
      </form>
    </div>
  );

  if (isModal) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        {content}
      </Modal>
    );
  }
  return content;
};

export default CreateIncident;
