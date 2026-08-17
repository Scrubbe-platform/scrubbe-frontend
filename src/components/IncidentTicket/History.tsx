import { fetchIncidentHistory } from "@/lib/incident/incident.api";
import { querykeys } from "@/lib/constant";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import moment from "moment";
import { useIncidentSelection } from "@/hooks/useIncidentSelection";
import useTicketDetails from "@/hooks/useTicketDetails";

type IHistory = {
  action: string;
  actor: string;
  newValue: string;
  oldValue: string;
  timestamp: string;
  comment: string;
};

const History = () => {
  const { incidentId } = useIncidentSelection();
  const { data: ticket } = useTicketDetails();
  const { data, isLoading } = useQuery({
    queryKey: [querykeys.HISTORY, incidentId],
    queryFn: async () =>
      incidentId ? fetchIncidentHistory(incidentId) : ([] as IHistory[]),
    enabled: Boolean(incidentId),
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 mb-8 max-h-[500px] overflow-y-auto">
        <div className="h-8 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.53s]" />
        <div className="h-8 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.32s]" />
        <div className="h-8 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.16s]" />
        <div className="h-8 rounded-md bg-gray-100 animate-pulse-dot" />
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
            : status === "ACKNOWLEDGED"
            ? "bg-emerald-100 text-emerald-500"
            : status === "INVESTIGATION"
            ? "bg-yellow-100 text-yellow-500"
            : status === "MITIGATED"
            ? "bg-orange-100 text-orange-500"
            : status === "RESOLVED"
            ? "bg-blue-100 text-blue-500"
            : "bg-gray-100 text-gray-500"
        )}
      >
        {status || "unknown"}
      </span>
    );
  };

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-transparent dark:bg-dark">
        {ticket?.createdAt ? (
          <div className="text-black dark:text-white py-2 px-2 border rounded-sm text-base">
            <b className="capitalize">Ticket Created: </b>
            <span className="opacity-60">
              at <b>{moment(ticket.createdAt).format("YYYY-MM-DD")}</b>
            </span>
          </div>
        ) : null}

        <div className="gap-2 flex flex-col-reverse">
          {(data as IHistory[] | undefined)?.map((item) => (
            <div
              key={item.timestamp + item.action + item.comment}
              className="text-black dark:text-white py-2 px-2 border rounded-sm text-base"
            >
              <b className="capitalize">{item.action.split("_").join(" ")}: </b>
              <span className="opacity-60">
                By <b>{item.actor}</b>
                {item.action === "status_changed" ? (
                  <span>
                    {" "}
                    from {statusColors(item.oldValue)} to{" "}
                    {statusColors(item.newValue)}
                  </span>
                ) : null}{" "}
                {moment(item.timestamp).fromNow()}
              </span>
            </div>
          ))}
        </div>

        {!isLoading && (!data || data.length === 0) ? (
          <div className="text-black dark:text-white py-6 px-4 border border-dashed rounded-sm text-sm opacity-70">
            No incident history has been recorded yet.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default History;
