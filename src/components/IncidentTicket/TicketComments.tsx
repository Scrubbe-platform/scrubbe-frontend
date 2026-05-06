/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { borderColors, querykeys } from "@/lib/constant";
import { fetchIncidentComments } from "@/lib/incident/incident.api";
import {
  IncidentCommentRecord,
  IncidentDetailRecord,
} from "@/lib/incident/incident.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { ReactNode, useState } from "react";
import moment from "moment";
import EmptyState from "../ui/EmptyState";
import useAuthStore from "@/lib/stores/auth.store";

type Props = {
  ticket: IncidentDetailRecord;
};

const TicketComments = ({ ticket }: Props) => {
  const [comment, setComment] = useState("");
  const { post } = useFetch();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const queryKey = [querykeys.COMMENTS, ticket.id];

  const { data: comments = [], isLoading } = useQuery<IncidentCommentRecord[]>({
    queryKey,
    queryFn: async () => fetchIncidentComments(ticket.id),
    initialData: ticket.comments ?? [],
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: true,
    enabled: !!ticket.id,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (content: string) => {
      const res = await post(endpoint.incident_ticket.send_comment, {
        ticketId: ticket.id,
        content,
      });
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousComments =
        queryClient.getQueryData<IncidentCommentRecord[]>(queryKey);

      queryClient.setQueryData<IncidentCommentRecord[]>(queryKey, (oldData) => [
        ...(oldData ?? []),
        {
          content: comment,
          createdAt: new Date().toISOString(),
          id: String((oldData?.length ?? 0) + 1),
          isInternal: false,
          author: {
            id: user?.id ?? "local-user",
            firstName: user?.firstName ?? "",
            lastName: user?.lastName ?? "",
            profileImage: user?.profileImage ?? null,
          },
        },
      ]);

      return {
        previousComments,
        prevComment: comment,
      };
    },
    onError: (_err, __, context) => {
      queryClient.setQueryData(queryKey, context?.previousComments);
      setComment(context?.prevComment ?? "");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      setComment("");
    },
  });

  const handleSubmitComment = () => {
    if (!comment.trim()) return;
    mutateAsync(comment);
  };

  let content: ReactNode;
  if (isLoading) {
    content = (
      <div className="space-y-4 mb-8 max-h-[500px] overflow-y-auto">
        <div className="h-14 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.53s]" />
        <div className="h-14 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.32s]" />
        <div className="h-14 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.16s]" />
        <div className="h-14 rounded-md bg-gray-100 animate-pulse-dot" />
      </div>
    );
  } else if (comments.length < 1) {
    content = (
      <EmptyState
        title="No Comment yet!"
        description="Be the first to drop a comment for other team members"
      />
    );
  } else {
    content = (
      <div className="space-y-4 mb-8 max-h-[500px] overflow-y-auto">
        {comments.map((entry) => {
          const authorName =
            `${entry.author.firstName} ${entry.author.lastName}`.trim() ||
            "Unknown user";
          const borderColor =
            borderColors[entry.author.firstName?.[0]?.toLowerCase()] ??
            "border-l-4 border-slate-400";

          return (
            <div
              key={entry.id}
              className={`${borderColor} rounded-xl px-6 py-4 shadow-sm`}
            >
              <div className="font-semibold text-base text-white mb-1">
                {entry.content}
              </div>
              <div className="text-gray-500 text-sm justify-between flex">
                <span>By {authorName}</span>
                <span>{moment(entry.createdAt).fromNow()}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-dark min-h-screen">
      {content}
      <div className="my-4">
        <div className="font-semibold text-base text-white mb-2">
          Add comment
        </div>
        <textarea
          className="w-full min-h-[80px] bg-transparent border text-white border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
          placeholder="Enter your comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
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
