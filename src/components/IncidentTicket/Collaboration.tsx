"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiPlus, FiSend } from "react-icons/fi";
import moment from "moment";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Socket } from "socket.io-client";
import { initSocket } from "@/lib/api/socket";
import { querykeys } from "@/lib/constant";
import { fetchIncidentMessages } from "@/lib/incident/incident.api";
import {
  IncidentDetailRecord,
  IncidentMessageRecord,
} from "@/lib/incident/incident.types";
import useAuthStore from "@/lib/stores/auth.store";

type Props = {
  ticket: IncidentDetailRecord;
};

const Collaboration = ({ ticket }: Props) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: messages = [], isLoading } = useQuery<IncidentMessageRecord[]>({
    queryKey: [querykeys.MESSAGES, ticket.id],
    queryFn: async () => fetchIncidentMessages(ticket.id),
    initialData: ticket.messages ?? [],
    enabled: Boolean(ticket.id),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!ticket.id) return;

    const socket = initSocket();
    socketRef.current = socket;

    const joinConversation = () => {
      socket.emit("joinConversation", { incidentTicketId: ticket.id });
    };

    const handleNewMessage = (message: IncidentMessageRecord) => {
      queryClient.setQueryData<IncidentMessageRecord[]>(
        [querykeys.MESSAGES, ticket.id],
        (oldData) => {
          const next = oldData ?? [];
          if (next.some((entry) => entry.id === message.id)) {
            return next;
          }

          return [...next, message];
        }
      );
    };

    if (socket.connected) {
      joinConversation();
    }

    socket.on("connect", joinConversation);
    socket.on("newMessage", handleNewMessage);
    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("connect", joinConversation);
      socket.off("newMessage", handleNewMessage);
      socket.off("message:new", handleNewMessage);
      socket.disconnect();
    };
  }, [queryClient, ticket.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socketRef.current || !ticket.id) return;

    socketRef.current.emit("sendMessage", {
      incidentTicketId: ticket.id,
      content: input.trim(),
    });

    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)]">
      {isLoading ? (
        <div className="space-y-4 mb-8 max-h-[500px] overflow-y-auto">
          <div className="h-14 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.53s]" />
          <div className="h-14 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.32s]" />
          <div className="h-14 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.16s]" />
          <div className="h-14 rounded-md bg-gray-100 animate-pulse-dot" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 dark:bg-transparent bg-white">
          {messages.length > 0 ? (
            messages.map((message) => {
              const isMe = message.sender.email === user?.email;
              const senderName =
                `${message.sender.firstName ?? ""} ${message.sender.lastName ?? ""}`.trim() ||
                message.sender.email;

              return (
                <div
                  key={message.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl px-4 py-3 mb-2 ${
                      isMe ? "bg-yellow-50" : "bg-blue-50"
                    }`}
                  >
                    {!isMe ? (
                      <div className="font-medium text-sm text-blue-600 mb-1">
                        {senderName}
                      </div>
                    ) : null}
                    <div className="text-gray-800 text-sm mb-2">
                      {message.content}
                    </div>
                    <div className="text-gray-400 text-xs text-right">
                      {moment(message.createdAt).fromNow()}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
              No collaboration messages have been posted yet.
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="border-t dark:bg-gray-800 bg-white px-4 py-3 flex items-center gap-2">
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
        >
          <FiPlus size={22} />
        </button>
        <input
          className="flex-1 border-none outline-none bg-transparent px-3 py-2 dark:text-white text-gray-700 placeholder-gray-400"
          placeholder="Send message"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSend();
            }
          }}
        />
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          <FiSend size={22} />
        </button>
      </div>
    </div>
  );
};

export default Collaboration;
