import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import moment from "moment";
import { useParams } from "next/navigation";
import useTicketDetails from "@/hooks/useTicketDetails";
import { IoWarning } from "react-icons/io5";

type IHistory = {
  action: string;
  actor: string;
  newValue: string;
  oldValue: string;
  timestamp: string;
  comment: string;
};

const History = () => {
  const { id } = useParams();
  const { get } = useFetch();
  const { data: ticket } = useTicketDetails();
  const { data, isLoading } = useQuery({
    queryKey: [querykeys.HISTORY],
    queryFn: async () => {
      const res = await get(
        (endpoint.incident_ticket.history + "/" + id) as string
      );
      console.log({ res });
      if (res.success) {
        return res.data.data;
      }

      return null;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 mb-8 max-h-[500px] overflow-y-auto ">
        <div className=" h-8 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.53s]" />
        <div className=" h-8 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.32s]" />
        <div className=" h-8 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.16s]" />
        <div className=" h-8 rounded-md bg-gray-100 animate-pulse-dot" />
      </div>
    );
  }

  const statusColors = (status: string) => {
    return (
      <span
        className={clsx(
          "px-3 py-1 rounded-md capitalize text-sm",
          status === "OPEN"
            ? "bg-red-100 text-red-500"
            : status === "CLOSED"
            ? "bg-green-100 text-green-500"
            : status === "IN_PROGRESS"
            ? "bg-indigo-100 text-indigo-500"
            : "bg-yellow-100 text-yellow-500"
        )}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 dark:bg-transparent bg-dark">
        <div className="text-white py-2 px-2 border rounded-sm text-base">
          <b className=" capitalize">Ticket Created: </b>
          <span className="opacity-60">
            at <b>{moment(ticket?.createdAt).format("YYYY-MM-DD")}</b>{" "}
          </span>
        </div>
        <div className="gap-2 flex flex-col-reverse">
          {(data?.history as IHistory[])?.map((item, id) => (
            <div
              key={id}
              className="text-white py-2 px-2 border rounded-sm text-base"
            >
              <b className=" capitalize">
                {item?.action.split("_").join(" ")}:{" "}
              </b>
              <span className="opacity-60">
                By <b>{item?.actor}</b>{" "}
                {item?.action === "status_changed" ? (
                  <span>
                    {" "}
                    from {statusColors(item?.oldValue)} to{" "}
                    {statusColors(item?.newValue)}
                  </span>
                ) : null}{" "}
                {moment(item?.timestamp).fromNow()}
              </span>
            </div>
          ))}
        </div>

        {/* <div>
          {ticket?.mttrResponseBreachNotified && (
            <div className="dark:text-white py-2 px-2 border rounded-sm text-base flex items-center gap-1">
              <IoWarning className=" text-red-500" /> Mean Time to Response
              Breached: at{" "}
              <b>
                {moment(ticket?.mttrTargetAck).format("YYYY-MM-DD, HH:mm a")}
              </b>
            </div>
          )}
        </div>
        <div>
          {ticket?.mttrResolveBreachNotified && (
            <div className="dark:text-white py-2 px-2 border rounded-sm text-base flex items-center gap-1">
              <IoWarning className=" text-red-500" /> Mean Time to Resolve
              Breached: at{" "}
              <b>
                {moment(ticket?.mttrTargetResolve).format(
                  "YYYY-MM-DD, HH:mm a"
                )}
              </b>
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default History;
