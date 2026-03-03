"use client";
import CButton from "@/components/ui/Cbutton";
import EmptyState from "@/components/ui/EmptyState";
import TextArea from "@/components/ui/text-area";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";
import { Ticket } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const formScheme = z.object({
  title: z.string().nonempty({ message: "title is required" }),
  description: z.string().nonempty({ message: "reason is required" }),
  priority: z.string().nonempty({ message: "priority is required" }),
  impact: z.string().nonempty({ message: "impact is required" }),
  status: z.string().nonempty({ message: "status is required" }),
  proposedFix: z.string().optional(),
  rootCauseNote: z.string().optional(),
  owner: z.string().optional(),
  linkIncident: z.array(z.string()).optional(),
});
const TABS = ["General", "Incident"];
type FormType = z.infer<typeof formScheme>;
const Page = () => {
  const [selectIncident, setSelectIncident] = useState<string[]>([]);
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const { get } = useFetch();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormType>({
    resolver: zodResolver(formScheme),
    mode: "onChange",
  });
  const { data } = useQuery({
    queryKey: [querykeys.INCIDENT_TICKET],
    queryFn: async () => {
      try {
        const res = await get(endpoint.incident_ticket.get);
        if (res.success) {
          return res.data;
        }
        return null;
      } catch (error) {
        console.log(error);
        return null;
      }
    },
    // refetchOnWindowFocus: false,
  });

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

  const handleUpdates = (value: FormType) => {
    console.log(value);
  };
  return (
    <div className="p-4 gap-5 flex flex-col">
      <p className=" text-2xl font-bold">Changes and Problems</p>

      <div className=" bg-white p-3 rounded-md">
        <div
          className="flex items-center gap-1 cursor-pointer w-fit"
          onClick={() => router.back()}
        >
          <ChevronLeft />
          <p className=" font-medium text-base">Problem Details</p>
        </div>

        <div className="grid grid-cols-3 gap-8 border-b border-gray-200 mb-6">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`p-4 text-sm font-medium border-b-2 transition-colors ${
                tab === i
                  ? "border-IMSLightGreen text-IMSLightGreen"
                  : "border-transparent text-gray-500  dark:text-gray-400 hover:text-green"
              }`}
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          key={tab}
        >
          {tab === 0 && (
            <div>
              <div className="space-y-6">
                {/* Incident ID */}
                <div>
                  <h2 className="text-lg font-medium  mb-1">ID:</h2>
                  {/* <p className=" text-base font-light">{id}</p> */}
                </div>

                {/* Date Resolved */}
                <div>
                  <h2 className="text-lg font-medium  mb-1">Title:</h2>
                  <p className=" text-base font-light">
                    {/* {incident?.ResolveIncident.updatedAt} */}
                  </p>
                </div>

                {/* Incident Title */}
                <div>
                  <h2 className="text-lg font-medium  mb-1">Owner:</h2>
                  {/* <p className=" text-base font-light">{incident?.reason}</p> */}
                </div>

                {/* Incident Description */}
                <div>
                  <h2 className="text-lg font-medium  mb-1">Status:</h2>
                  {/* <p className=" text-base font-light">{incident?.description}</p> */}
                </div>

                {/* Priority */}
                <div>
                  <h2 className="text-lg font-medium  mb-1">Priority:</h2>
                  {/* <p className=" text-base font-light">{incident?.priority}</p> */}
                </div>

                {/* Assigned to */}
                <div>
                  <h2 className="text-lg font-medium  mb-1">Impact:</h2>
                  <p className=" text-base font-light">
                    {/* {incident?.assignedToEmail ?? "N/A"} */}
                  </p>
                </div>
                <div>
                  <h2 className="text-lg font-medium  mb-1">Date:</h2>
                  <p className=" text-base font-light">
                    {/* {incident?.assignedToEmail ?? "N/A"} */}
                  </p>
                </div>
              </div>
            </div>
          )}
          {tab === 1 && (
            <div>
              <form onSubmit={handleSubmit(handleUpdates)}>
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

                <Controller
                  name="rootCauseNote"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      label="Root Cause Notes:"
                      rows={4}
                      {...field}
                      placeholder="Enter root cause analysis"
                      className="w-full bg-transparent dark:!text-white !text-black border border-gray-300 rounded-md p-2 text-sm "
                      error={errors.rootCauseNote?.message}
                    />
                  )}
                />
                <Controller
                  name="proposedFix"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      label="Proposed Fix:"
                      rows={4}
                      {...field}
                      placeholder="Enter Proposed Fix"
                      className="w-full bg-transparent dark:!text-white !text-black border border-gray-300 rounded-md p-2 text-sm "
                      error={errors.proposedFix?.message}
                    />
                  )}
                />

                <div className=" flex justify-end gap-5">
                  <CButton type="submit" className=" w-fit px-6">
                    Update
                  </CButton>
                </div>
              </form>
            </div>
          )}

          {/* Collaboration Tab */}
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
