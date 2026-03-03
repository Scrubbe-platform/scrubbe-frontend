import { initSocket } from "@/lib/api/socket";
import { useNotification } from "@/lib/stores/notification.store";
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
      console.log({ data });
      addNotification(data);
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
