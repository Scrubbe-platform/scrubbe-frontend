// AssignAnalyst.tsx

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaTrashAlt, FaPlus } from "react-icons/fa";
import CButton from "../ui/Cbutton";
import Select from "../ui/select";
import Input from "../ui/input";
import useMember from "@/hooks/useMember";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { querykeys } from "@/lib/constant";

// Zod schema for form validation
const schema = z.object({
  date: z.string().min(1, "Start Date is required."),
  teamMembers: z
    .array(
      z.object({
        member: z.string().min(1, "Member selection is required."),
        startTime: z.string().min(1, "Start Time is required."),
        endTime: z.string().min(1, "End Time is required."),
      })
    )
    .min(1, "At least one team member is required."),
});

type formType = z.infer<typeof schema>;
// Mock data for team member options

type Props = {
  onClose: () => void;
  previousMember?:
    | {
        email: string;
        firstName: string;
        lastName: string;
        member: string;
        startTime: string;
        endTime: string;
      }[]
    | null;
  date: string;
};
// Main Component
const AssignAnalyst = ({ onClose, date, previousMember }: Props) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      date: "",
      teamMembers: [{ member: "", startTime: "", endTime: "" }],
    },
  });

  const { data: members } = useMember();
  const { post } = useFetch();
  const [loading, setloading] = useState(false);
  const queryClient = useQueryClient();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "teamMembers",
  });

  const onSubmit = async (data: formType) => {
    setloading(true);
    const res = await post(endpoint.on_call.assign_member, data);
    setloading(false);
    if (res.success) {
      toast.success(`Team member has been assigned for ${data.date}`);
      queryClient.refetchQueries({ queryKey: [querykeys.GET_ALL_ASSIGN] });
      close();
      return;
    } else {
      toast.error(JSON.stringify(res.data) ?? "Something went wrong");
    }
  };

  useEffect(() => {
    setValue("date", date);
    if (previousMember) {
      setValue(
        "teamMembers",
        previousMember?.map((value) => ({
          endTime: value.endTime,
          startTime: value.startTime,
          member: value.member,
        }))
      );
    }
  }, [date, previousMember]);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Assign Analyst
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="py-6">
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <Input
              label="Start Date"
              placeholder="mm/dd/yy"
              {...field}
              type="date"
              error={errors.date?.message}
            />
          )}
        />

        {/* Dynamic Team Members Section */}
        <div className="mt-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4"
            >
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Team member
                </label>
                {fields.length > 1 && (
                  <CButton
                    className=" w-fit shadow-none border border-red-500 bg-transparent hover:bg-transparent text-red-500 "
                    type="button"
                    onClick={() => remove(index)}
                  >
                    <FaTrashAlt className="inline-block mr-1" />
                    delete
                  </CButton>
                )}
              </div>

              <Controller
                name={`teamMembers.${index}.member`}
                control={control}
                render={({ field: selectField }) => (
                  <Select
                    label=""
                    options={[
                      { value: "", label: "Select team member" },
                      ...(members?.map((member) => ({
                        value: member.id,
                        label: member.email,
                      })) ?? []),
                    ]}
                    {...selectField}
                    error={errors.teamMembers?.[index]?.member?.message}
                  />
                )}
              />

              <div className="grid grid-cols-2 gap-3 mt-2">
                <Controller
                  name={`teamMembers.${index}.startTime`}
                  control={control}
                  render={({ field: timeField }) => (
                    <Input
                      {...timeField}
                      type="time"
                      placeholder="start"
                      error={errors.teamMembers?.[index]?.startTime?.message}
                    />
                  )}
                />
                <Controller
                  name={`teamMembers.${index}.endTime`}
                  control={control}
                  render={({ field: timeField }) => (
                    <Input
                      {...timeField}
                      type="time"
                      placeholder="end"
                      error={errors.teamMembers?.[index]?.endTime?.message}
                    />
                  )}
                />
              </div>
            </div>
          ))}
          <CButton
            type="button"
            onClick={() => append({ member: "", startTime: "", endTime: "" })}
            className="mt-2 w-fit border border-IMSLightGreen text-IMSLightGreen bg-transparent hover:bg-transparent shadow-none flex items-center text-sm font-medium "
          >
            <FaPlus className="mr-1" />
            select another member
          </CButton>
        </div>

        {/* AI Suggestion */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          AI Suggestion : No specific recommendation for this date
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <CButton
            className="border border-IMSLightGreen text-IMSLightGreen bg-transparent hover:bg-transparent w-fit"
            type="button"
            onClick={onClose}
          >
            Close
          </CButton>
          <CButton
            className="text-white bg-IMSLightGreen hover:bg-IMSDarkGreen w-fit"
            type="submit"
            isLoading={loading}
          >
            Assign
          </CButton>
        </div>
      </form>
    </div>
  );
};

export default AssignAnalyst;
