import CButton from "@/components/ui/Cbutton";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import TextArea from "@/components/ui/text-area";
import { useFetch } from "@/hooks/useFetch";
import useMember from "@/hooks/useMember";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";
import { Ticket } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const formScheme = z.object({
  title: z.string().nonempty({ message: "title is required" }),
  description: z.string().nonempty({ message: "reason is required" }),
  priority: z.string().nonempty({ message: "priority is required" }),
  impact: z.string().nonempty({ message: "impact is required" }),
  status: z.string().nonempty({ message: "status is required" }),
  riskLevel: z.string().nonempty({ message: "risk level is required" }),
  rollback: z.string().optional(),
  scheduleDate: z.string().nonempty({ message: "schedule date is required" }),
  owner: z.string().optional(),
  linkIncident: z.array(z.string()).optional(),
});

type FormType = z.infer<typeof formScheme>;

const TABS = ["General", "Incident"];

const ChangeForm = ({ onClose }: { onClose: () => void }) => {
  const [tab, setTab] = useState(0);
  const [selectIncident, setSelectIncident] = useState<string[]>([]);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormType>({
    resolver: zodResolver(formScheme),
    mode: "onChange",
  });
  const router = useRouter();
  const { get } = useFetch();

  const { data } = useQuery({
    queryKey: [querykeys.INCIDENT_TICKET],
    queryFn: async () => {
      try {
        const res = await get(endpoint.incident_ticket.get + `?limit=10000`);
        if (res.success) {
          return res.data.incidents;
        }
        return null;
      } catch (error) {
        console.log(error);
        return null;
      }
    },
    // refetchOnWindowFocus: false,
  });

  const { data: members } = useMember();

  const handleCheckboxChange = (id: string) => {
    const isSelected = selectIncident.find((item) => item === id);
    console.log({ isSelected });
    if (!!isSelected) {
      setSelectIncident(selectIncident.filter((item) => item !== id));
      setValue(
        "linkIncident",
        selectIncident.filter((item) => item !== id)
      );
    } else {
      setSelectIncident((prev) => [...(prev ?? []), id]);
      setValue("linkIncident", [...selectIncident, id]);
    }
  };

  const handleSubmtForm = (value: FormType) => {
    console.log(value);
  };
  return (
    <div>
      <p className=" text-xl font-bold">Create New Problem</p>
      <div className="grid grid-cols-2 gap-8 border-b border-gray-200 mb-6">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`p-4 text-sm font-medium border-b-2 transition-colors ${
              tab === i
                ? "border-IMSLightGreen text-IMSLightGreen"
                : "border-transparent text-gray-500  dark:text-gray-400 hover:text-green"
            }`}
            // onClick={() => setTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(handleSubmtForm)}>
        <>
          {tab === 0 && (
            <>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Title"
                    placeholder="Enter change title"
                    {...field}
                    error={errors.title?.message}
                    className=" text-black dark:text-white"
                  />
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextArea
                    label="Description"
                    rows={4}
                    {...field}
                    placeholder="Describe the change "
                    className="w-full bg-transparent dark:!text-white !text-black border border-gray-300 rounded-md p-2 text-sm "
                    error={errors.description?.message}
                  />
                )}
              />

              <Controller
                name="owner"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Owner"
                    options={[
                      { label: "Team member or group", value: "" },
                    ].concat(
                      members?.map((member) => ({
                        label: member.email,
                        value: member.id,
                      })) ?? []
                    )}
                    error={errors.owner?.message}
                    className=" text-black dark:text-white"
                  />
                )}
              />
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    options={[
                      { label: "Select status ", value: "" },
                      { label: "Planned", value: "PLANNED" },
                      { label: "In-Progress", value: "IN_PROGRESS" },
                      { label: "Completed", value: "COMPLETED" },
                      { label: "Rolled back", value: "ROLLED_BACK" },
                    ]}
                    {...field}
                    label="Status"
                    error={errors.status?.message}
                    className=" text-black dark:text-white"
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
                      { label: "Select Priority", value: "" },
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
                name="impact"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Impact"
                    options={[
                      { label: "Select Impact", value: "" },
                      { label: "Service", value: "SERVICE" },
                      { label: "Department", value: "DEPARTMENT" },
                      { label: "Enterprice", value: "ENTERPRICE" },
                    ]}
                    {...field}
                    error={errors.impact?.message}
                    className=" text-black dark:text-white"
                  />
                )}
              />
              <Controller
                name="scheduleDate"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Scheduled Date"
                    placeholder="dd/mm/yyyy"
                    {...field}
                    type="date"
                    error={errors.title?.message}
                    className=" text-black dark:text-white"
                  />
                )}
              />
              <Controller
                name="riskLevel"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Risk level"
                    options={[
                      { label: "Select risk level", value: "" },
                      { label: "Low", value: "LOW" },
                      { label: "Medium", value: "MEDIUM" },
                      { label: "High", value: "HIGH" },
                    ]}
                    {...field}
                    error={errors.impact?.message}
                    className=" text-black dark:text-white"
                  />
                )}
              />
              <Controller
                name="rollback"
                control={control}
                render={({ field }) => (
                  <TextArea
                    label="Roll back plan"
                    rows={4}
                    {...field}
                    placeholder="Describe rollback plan"
                    className="w-full bg-transparent dark:!text-white !text-black border border-gray-300 rounded-md p-2 text-sm "
                    error={errors.description?.message}
                  />
                )}
              />

              <div className=" flex justify-end gap-5">
                <CButton
                  onClick={onClose}
                  className=" w-fit px-6 bg-transparent border border-IMSLightGreen text-IMSLightGreen hover:text-white shadow-none"
                >
                  Close
                </CButton>
                <CButton
                  disabled={!isValid}
                  onClick={() => setTab(1)}
                  className=" w-fit px-6"
                >
                  Next
                </CButton>
              </div>
            </>
          )}
          {tab === 1 && (
            <>
              <div>
                <div>
                  <p className=" text-base">Select Incidents to link</p>
                  <div className="space-y-4 mb-6 p-3 bg-neutral-100 max-h-[300px] overflow-auto border rounded-md mt-3">
                    {data && data.length > 0 ? (
                      <>
                        {data?.map((incident: Ticket) => (
                          <div
                            key={incident?.id}
                            className="flex items-center space-x-3"
                          >
                            <input
                              type="checkbox"
                              id={incident?.id}
                              checked={selectIncident.includes(incident?.id)}
                              onChange={() =>
                                handleCheckboxChange(incident?.id)
                              }
                              className="h-5 w-5 text-green-500 rounded-md border-gray-300 focus:ring-green-400"
                            />
                            <label
                              htmlFor={incident?.id}
                              className="text-gray-700 select-none cursor-pointer text-base"
                            >
                              {incident?.ticketId} {incident?.reason}
                            </label>
                          </div>
                        ))}
                      </>
                    ) : (
                      <EmptyState
                        title="You have no incident ticket yet"
                        action={
                          <CButton
                            onClick={() =>
                              router.push("/incident/tickets/create")
                            }
                            className="w-fit  bg-IMSLightGreen text-white hover:bg-IMSGreen shadow-none"
                          >
                            Create New Incident <Plus />
                          </CButton>
                        }
                      />
                    )}
                  </div>
                </div>

                <div className=" flex justify-end gap-5">
                  <CButton
                    onClick={() => setTab(0)}
                    className=" w-fit px-6 bg-transparent border border-IMSLightGreen text-IMSLightGreen hover:text-white shadow-none"
                  >
                    Back
                  </CButton>
                  <CButton type="submit" className=" w-fit px-6">
                    Create New Change
                  </CButton>
                </div>
              </div>
            </>
          )}
        </>
      </form>
    </div>
  );
};

export default ChangeForm;
