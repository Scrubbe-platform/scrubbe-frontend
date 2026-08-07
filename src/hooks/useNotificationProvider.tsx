import { initSocket } from "@/lib/api/socket";
import { useNotification } from "@/lib/stores/notification.store";
import { useIncidentBannerStore } from "@/lib/stores/incidentBanner.store";
import { useEffect } from "react";

const useNotificationProvider = () => {
  const { addNotification, clearNotification, notification } =
    useNotification();
  const socket = initSocket();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });
    socket.on("incidentNotification", (data) => {
      addNotification(data);
      // The backend doesn't yet send a reliable "this is a brand-new
      // incident" flag on every event — only fall back to treating it as
      // one when `kind` doesn't say otherwise (e.g. a comment/status update).
      const looksLikeNewIncident =
        !data?.kind || /creat|new|raise/i.test(String(data.kind));
      if (looksLikeNewIncident && (data?.incidentId || data?.ticketId)) {
        useIncidentBannerStore.getState().show({
          id: data.incidentId,
          ticketId: data.ticketId ?? data.incidentId,
          title: data.title ?? data.summary ?? "New incident detected",
          priority: data.priority,
          source: "AUTO",
          link: data.link,
        });
      }
    });
    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });
    // Cleanup function to disconnect the socket and remove listeners
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);
  return {
    notification,
    addNotification,
    clearNotification,
  };
};

export default useNotificationProvider;
