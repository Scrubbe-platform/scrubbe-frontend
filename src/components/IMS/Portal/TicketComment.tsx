/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFetch } from "@/hooks/useFetch";
import { querykeys } from "@/lib/constant";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import moment from "moment";
import { MdVerified } from "react-icons/md";
import { Ticket } from "@/types";
import EmptyState from "@/components/ui/EmptyState";
import CButton from "@/components/ui/Cbutton";

type Props = {
  ticket: Ticket;
};
const TicketComments = ({ ticket }: Props) => {
  const [comment, setComment] = useState("");
  const { post } = useFetch();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (content: string) => {
      const res = await post(`/customer/${ticket.id}/comments`, {
        content,
      });
      return res.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [querykeys.INCIDENT_DETAIL] });
      setComment("");
    },
  });

  const handleSubmitComment = () => {
    mutateAsync(comment);
  };

  let content: ReactNode;

  if (ticket?.comments && ticket?.comments?.length < 1) {
    content = (
      <EmptyState
        title="No Comment yet!"
        description="Be the first to drop a comment for other team members"
      />
    );
  }
  if (ticket?.comments && ticket?.comments?.length > 0) {
    content = (
      <div className="space-y-4 mb-8 max-h-[500px] overflow-y-auto">
        {ticket?.comments?.map((c) => (
          <div
            key={c.id}
            className={`dark:bg-gray-800 bg-white border-l-4 border-green-400 rounded-xl px-6 py-4 shadow-sm`}
          >
            <div className="font-semibold text-base dark:text-white text-gray-800 mb-1">
              {c.content}
            </div>
            <div className="text-gray-500 text-sm justify-between flex ">
              <span className="flex items-center gap-1">
                By {c.authorType}
                {c.authorType === "CUSTOMER" && (
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
    <div className="dark:bg-gray-900 bg-gray-50 rounded-2xl p-6">
      {content}
      <div className="my-4">
        <div className="font-semibold text-base dark:text-white text-gray-800 mb-2">
          Add comment
        </div>
        <textarea
          className="w-full min-h-[80px] bg-transparent border dark:text-white border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none text-gray-800"
          placeholder="Enter your comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="flex justify-end gap-4 mt-6">
          <button
            className="px-8 text-sm py-2 rounded-lg border border-green text-green dark:text-white dark:bg-transparent bg-white font-medium dark:hover:bg-blue-800 hover:bg-blue-50 transition-colors"
            type="button"
          >
            Close
          </button>
          <CButton
            className="px-8 py-2 disabled:opacity-50 w-fit rounded-lg bg-green text-white font-medium hover:bg-green transition-colors"
            disabled={isPending}
            onClick={handleSubmitComment}
          >
            Add Comment
          </CButton>
        </div>
      </div>
    </div>
  );
};

export default TicketComments;
