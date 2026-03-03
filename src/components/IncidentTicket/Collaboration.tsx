"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiPlus } from "react-icons/fi";
import { initSocket } from "@/lib/api/socket";
import moment from "moment";
import useAuthStore from "@/lib/stores/auth.store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";
import { Socket } from "socket.io-client";
import { Ticket } from "@/types";

type Message = {
  id: string;
  content: string;
  sender: {
    id: string;
    email: string;
  };
  createdAt: string;
};

type Props = {
  ticket: Ticket;
};

const Collaboration = ({ ticket }: Props) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { get } = useFetch();
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  // 1. Fetch initial messages using TanStack Query
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: [querykeys.MESSAGES, ticket?.id],
    queryFn: async () => {
      const res = await get(
        endpoint.incident_ticket.get_messages + "/" + ticket.id
      );
      return res.data;
    },
    enabled: !!ticket?.id, // Ensure the query only runs when a ticket is available
  });

  // 2. Use a single useEffect for socket management
  useEffect(() => {
    // Correctly initialize socket and store it in ref
    const socket = initSocket();
    socketRef.current = socket;

    if (ticket) {
      socket.on("connect", () => {
        console.log("Connected to socket server");
        socket.emit("joinConversation", { incidentTicketId: ticket?.id });
        socket.emit("joinBusinessRoom", {
          businessId: ticket?.businessId,
        });
      });
    }

    // Use a single "newMessage" listener
    socket.on("newMessage", (message: Message) => {
      // Update the TanStack Query cache directly with the new message
      queryClient.setQueryData<Message[]>(
        [querykeys.MESSAGES, ticket?.id],
        (oldData) => {
          if (!oldData) return [message];
          // Ensure no duplicate messages are added
          return [...oldData.filter((m) => m.id !== message.id), message];
        }
      );
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });

    // Cleanup function to disconnect the socket and remove listeners
    return () => {
      socket.disconnect();
    };
  }, [ticket, queryClient]); // Add get and queryClient as dependencies for correct closure

  // 3. Scroll to the bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socketRef.current) return;
    console.log("Send the message");
    // Send message via socket
    socketRef.current.emit("sendMessage", {
      incidentTicketId: ticket?.id,
      content: input,
    });

    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Messages */}
      {isLoading ? (
        <div className="space-y-4 mb-8 max-h-[500px] overflow-y-auto ">
          <div className=" h-14 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.53s]" />
          <div className=" h-14 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.32s]" />
          <div className=" h-14 rounded-md bg-gray-100 animate-pulse-dot [animation-delay:-0.16s]" />
          <div className=" h-14 rounded-md bg-gray-100 animate-pulse-dot" />
        </div>
      ) : (
        <div className="flex-1 flex-grow overflow-y-auto px-4 py-2 space-y-4 dark:bg-transparent bg-white">
          {messages.map((msg) => {
            const isMe = msg.sender.email === user?.email;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[60%] rounded-xl px-4 py-2 mb-2 ${
                    isMe ? "bg-yellow-50" : "bg-blue-50"
                  }`}
                >
                  {!isMe && (
                    <div className="font-medium text-sm text-blue-600 mb-1">
                      {msg.sender.email}
                    </div>
                  )}
                  <div className="text-gray-800 text-sm mb-2">
                    {msg.content}
                  </div>
                  <div className="text-gray-400 text-xs text-right">
                    {moment(msg.createdAt).fromNow()}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}
      {/* Input Bar */}
      <div className="border-t dark:bg-gray-800 bg-white px-4 py-3 flex items-center gap-2">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
          <FiPlus size={22} />
        </button>
        <input
          className="flex-1 border-none outline-none bg-transparent px-3 py-2 dark:text-white text-gray-700 placeholder-gray-400"
          placeholder="Send Message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleSend}
        >
          <FiSend size={22} />
        </button>
      </div>
    </div>
  );
};

export default Collaboration;
