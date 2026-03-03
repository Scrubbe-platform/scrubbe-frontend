"use client";
// components/OnCallCard.tsx
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";
import { Assignment } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";

const OnCallCard: React.FC = () => {
  const { get } = useFetch();
  const router = useRouter();
  const { data } = useQuery<Assignment[] | null>({
    queryKey: [querykeys.GET_ALL_ASSIGN],
    queryFn: async () => {
      const res = await get(endpoint.on_call.get_all_assign);
      console.log(res);
      if (res.success) {
        return res.data.data;
      }
      return null;
    },
  });

  const onCallEngineer: Assignment | undefined = useMemo(() => {
    return data?.find(
      (value) => value.date === moment(new Date()).format("yyyy-MM-DD")
    );
  }, [data]);
  return (
    <div className="flex flex-[.5] flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm h-full">
      <div className="text-gray-500 text-sm font-medium mb-3">
        ON-CALL ENGINEER
      </div>
      {onCallEngineer ? (
        <>
          <div className="flex items-center -space-x-4">
            {onCallEngineer.teamMembers.map((team) => (
              <div key={team.member}>
                <div className=" size-10 rounded-full bg-neutral-700 cursor-pointer flex items-center justify-center mb-3 shadow-md">
                  <span className="font-bold text-white uppercase">
                    {team.firstName[0]}
                    {team.lastName[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm">
              {onCallEngineer.teamMembers[0].firstName}{" "}
              {onCallEngineer.teamMembers[0].lastName}{" "}
              {onCallEngineer.teamMembers.length > 1 && (
                <span
                  onClick={() => router.push("/incident/on-call")}
                  className=" opacity-60 text-IMSLightGreen cursor-pointer hover:opacity-100"
                >
                  +others
                </span>
              )}
            </p>
          </div>
        </>
      ) : (
        <>
          <div
            onClick={() => router.push("/incident/on-call")}
            className=" size-10 rounded-full bg-neutral-700 cursor-pointer flex items-center justify-center mb-3"
          >
            <span className="font-bold text-white">
              <Plus />
            </span>
          </div>
          <p className="text-base">Assign Team</p>
        </>
      )}
    </div>
  );
};

export default OnCallCard;
