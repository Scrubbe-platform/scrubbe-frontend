/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { borderColors, querykeys } from "@/lib/constant";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { ReactNode, useEffect, useState } from "react";
import moment from "moment";
import EmptyState from "../ui/EmptyState";
import useAuthStore from "@/lib/stores/auth.store";
import { MdVerified } from "react-icons/md";
import {Ticket, Tticket } from "@/types";

type Comments = {
  id: string;
  content: string;
  createdAt: string;
  firstname: string;
  lastname: string;
  isBusinessOwner: boolean;
};

type Props = {
  ticket: Tticket;
};
const TicketComments = ({ ticket }: Props) => {
  const [comment, setComment] = useState("");
  const { post, get } = useFetch();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const {
    data: comments,
    isLoading,
    refetch,
  } = useQuery<Comments[]>({
    queryKey: [querykeys.COMMENTS],
    queryFn: async () => {
      const res = await get(
        `${endpoint.incident_ticket.get_comment}/${ticket?.id}`
      );
      if (res.success) {
        return res.data;
      }
      return [];
    },
    refetchOnWindowFocus: false,
    // refetchInterval: 10000,
    refetchIntervalInBackground: true,
    enabled: !!ticket?.id,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (content: string) => {
      const res = await post(
        `${endpoint.incident_ticket.send_comment}/${ticket.id}`,
        {
          content,
        }
      );
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [querykeys.COMMENTS] });
      const previousComments = queryClient.getQueryData<Comments[]>([
        querykeys.COMMENTS,
      ]);
      if (previousComments) {
        queryClient.setQueryData<Comments[]>(
          [querykeys.COMMENTS],
          (oldData) => [
            ...(oldData ?? []),
            {
              content: comment,
              createdAt: new Date(Date.now()).toISOString(),
              firstname: user?.firstName ?? "",
              lastname: user?.lastName ?? "",
              id: String((oldData?.length ?? 0) + 1),
              isBusinessOwner: false,
            },
          ]
        );
      }
      const previous = {
        previousComments,
        prevComment: comment,
      };
      return { previous };
    },
    onError: (err, __, context) => {
      queryClient.setQueryData(["posts"], context?.previous.previousComments);
      setComment(context?.previous.prevComment ?? "");
      console.log("error", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [querykeys.COMMENTS] });
      setComment("");
    },
  });

  const handleSubmitComment = () => {
    mutateAsync(comment);
  };

  useEffect(() => {
    refetch();
  }, []);

  let content: ReactNode;
  if (isLoading) {
    content = (
      <div className="space-y-4 mb-8 max-h-[500px] overflow-y-auto ">
        <div className=" h-14 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.53s]" />
        <div className=" h-14 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.32s]" />
        <div className=" h-14 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.16s]" />
        <div className=" h-14 rounded-md bg-gray-100 animate-pulse-dot" />
      </div>
    );
  }
  if (!isLoading && comments && comments?.length < 1) {
    content = (
      <EmptyState
        title="No Comment yet!"
        description="Be the first to drop a comment for other team members"
      />
    );
  }
  if (!isLoading && comments && comments?.length > 0) {
    content = (
      <div className="space-y-4 mb-8 max-h-[500px] overflow-y-auto">
        {comments?.map((c: Comments) => (
          <div
            key={c.id}
            className={` ${
              borderColors[c.firstname?.[0]?.toLowerCase()]
            } rounded-xl px-6 py-4 shadow-sm`}
          >
            <div className="font-semibold text-base text-white  mb-1">
              {c.content}
            </div>
            <div className="text-gray-500 text-sm justify-between flex ">
              <span className="flex items-center gap-1">
                By {c.firstname} {c.lastname}{" "}
                {c.isBusinessOwner && (
                  <MdVerified className=" text-purple-500" />
                )}
              </span>{" "}
              <span>{moment(c.createdAt).fromNow()}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className=" rounded-2xl p-6 bg-dark min-h-screen">
      {content}
      <div className="my-4">
        <div className="font-semibold text-base text-white mb-2">
          Add comment
        </div>
        <textarea
          className="w-full min-h-[80px] bg-transparent border text-white border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none "
          placeholder="Enter your comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="flex justify-end gap-4 mt-6">
          
          <button
            className="px-8 py-2 disabled:opacity-50 rounded-lg bg-green text-white font-medium hover:bg-green transition-colors"
            disabled={isPending}
            onClick={handleSubmitComment}
          >
            Add Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketComments;
