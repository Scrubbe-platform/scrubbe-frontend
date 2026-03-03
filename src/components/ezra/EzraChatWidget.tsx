// components/EzraChatWidget.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { CgArrowsExpandLeft } from "react-icons/cg";

import { useState, useEffect, useRef, useCallback } from "react";

import { FiSend } from "react-icons/fi";

import { MdOutlineSecurity } from "react-icons/md";

import { ChatMessage } from "./ChatMessage";

import clsx from "clsx";

import { RiCollapseDiagonal2Fill } from "react-icons/ri";

// Markdown imports

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import rehypeRaw from "rehype-raw"; // Still useful for priority colors within markdown

import { getCookie } from "cookies-next";

import { COOKIE_KEYS } from "@/lib/constant";

import CreateIncident from "../IncidentTicket/CreateIncident";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

interface ParsedIncident {
  title: string;

  priority: string;

  description: string;
}

// Map priority levels to Tailwind CSS classes

const priorityColorMap: { [key: string]: string } = {
  CRITICAL: "text-red-500",

  HIGH: "text-orange-500",

  MEDIUM: "text-yellow-500",

  LOW: "text-blue-500",
};

const parseIncidentString = (incidentString: string): ParsedIncident | null => {
  // --- ADD THIS LINE HERE ---

  console.log(
    "Attempting to parse incidentString (raw input):",

    incidentString
  );

  const parseIncidentString = (
    incidentString: string
  ): ParsedIncident | null => {
    const fullIncidentMatch = incidentString.match(
      /\*\*Title:\*\*\s*(.*?)\s*\*\*Priority:\*\*\s*(.*?)\s*\*\*Description:\*\*\s*(.*?)(?=\*\*Title:|\s*---|$)/
    );
    if (fullIncidentMatch) {
      const parsedResult = {
        title: fullIncidentMatch[1].trim(),
        priority: fullIncidentMatch[2].trim().toUpperCase(),
        description: fullIncidentMatch[3].trim(),
      };
      return parsedResult;
    }
    return null;
  };

  console.warn("Failed to parse incident string."); // This will now log when fullIncidentMatch is null

  return null;
};

// Helper component for the typing dots

const TypingDots = () => (
  <span className="inline-flex items-center space-x-1 ml-1 text-gray-400">
    <motion.span
      initial={{ x: -10 }}
      animate={{ x: 0 }}
      transition={{
        type: "tween",
        delay: 0.3,
        duration: 0.5,
        ease: "easeInOut",
        damping: 7,
        repeat: Infinity,
        repeatDelay: 0.4,
        repeatType: "reverse",
      }}
      className="w-2 h-2 bg-blue-300 rounded-full animate-pulse-dot [animation-delay:-0.32s]"
    ></motion.span>

    <span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse-dot [animation-delay:-0.16s]"></span>

    <motion.span
      initial={{ x: 10 }}
      animate={{ x: 0 }}
      transition={{
        type: "tween",
        duration: 0.5,
        ease: "easeInOut",
        damping: 7,
        repeat: Infinity,
        repeatDelay: 0.4,
        repeatType: "reverse",
      }}
      className="w-2 h-2 bg-blue-300 rounded-full animate-pulse-dot"
    ></motion.span>
  </span>
);

export function EzraChatWidget() {
  const [messages, setMessages] = useState<
    Array<{
      type: "ai" | "user";
      content: string | JSX.Element;
      timestamp: string;
      id: number;
      isLoading?: boolean;
      action?: boolean;
    }>
  >([]);

  const [currentInputMessage, setCurrentInputMessage] = useState("");
  const [isEzraResponding, setIsEzraResponding] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [openCreateIncident, setOpenCreateIncident] = useState(false);
  const searchParams = useSearchParams();
  const modal = searchParams.get("modal");

  const router = useRouter();

  // console.log({ messages }); // Keep this for overall message state

  const removeQuery = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete("modal");

    router.replace(`?${newSearchParams.toString()}`);
  };

  // useEffect(() => {
  //   const greetingMessage = {
  //     type: "ai" as const,
  //     content:
  //       "Hi there! I'm Ezra, your AI assistant for log and event analysis. What can I help you with today?",
  //     timestamp: "",
  //     id: 1,
  //   };

  //   setMessages([greetingMessage]);
  // }, []);

  useEffect(() => {
    if (Boolean(modal) === true) {
      setOpenCreateIncident(true);
    }
  }, [modal]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isEzraResponding]);

  const handleStreamedResponse = useCallback(async (prompt: string) => {
    setIsEzraResponding(true);

    const tempEzraMessageId = Date.now() + Math.random();

    setMessages((prev) => [
      ...prev,

      {
        type: "ai",

        content: "", // Start with empty content, stream will fill it

        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",

          minute: "2-digit",

          hour12: false,
        }),

        id: tempEzraMessageId,

        isLoading: true,
      },
    ]);

    try {
      const token = getCookie(COOKIE_KEYS.TOKEN);

      setShowAction(false);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/ezra/incidents/summary`,

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({ prompt: prompt }),
        }
      );

      if (!response.ok || !response.body) {
        let errorMessage = `HTTP error! status: ${response.status}`;

        try {
          const errorBody = await response.text();

          if (errorBody) {
            errorMessage += ` - ${errorBody.substring(0, 100)}`;
          }
        } catch (e) {
          // Ignore
        }

        throw new Error(errorMessage);
      }

      const reader = response.body.getReader();

      const decoder = new TextDecoder("utf-8");

      let currentBuffer = ""; // Accumulates chunks

      let renderedContent = ""; // Stores the final, rendered Markdown for incidents

      let unparsedText = "";

      // Stores text that hasn't been fully parsed into an incident yet

      const updateMessageContent = (
        newContent: string,
        isStillLoading: boolean,
        isAction?: boolean
      ) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempEzraMessageId
              ? {
                  ...msg,
                  content: newContent,
                  isLoading: isStillLoading,
                  action: isAction,
                }
              : msg
          )
        );
      };

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        currentBuffer += chunk; // Add raw chunk to buffer

        if (currentBuffer.includes("ACTION: raise_incident")) {
          setShowAction(true);
          currentBuffer = currentBuffer
            .replace("ACTION: raise_incident", "")
            .trim();
        }

        // Process any complete incidents from the buffer

        const tempParts = currentBuffer.split(/(?=\s*---)/); // Lookahead to split before --- but keep --- for later processing if needed

        // If the last part is incomplete, keep it in the buffer for next chunk

        if (!currentBuffer.endsWith("---") && tempParts.length > 0) {
          unparsedText = tempParts.pop() || "";
        } else {
          unparsedText = "";
        }

        // Process all complete parts

        for (const part of tempParts) {
          if (part.trim()) {
            const cleanedPart = part.trim();

            if (cleanedPart.startsWith("---")) {
              // This is just a delimiter, skip or add a visual separator if desired

              renderedContent += "\n\n---\n\n";

              continue;
            }

            const parsed = parseIncidentString(cleanedPart);

            console.log({ parsed });

            if (parsed) {
              const priorityClass =
                priorityColorMap[parsed.priority] || "text-gray-300";

              const formattedIncident = `

**Title:** ${parsed.title}
**Priority:** <span class="${priorityClass} font-semibold">${parsed.priority}</span>
**Description:** ${parsed.description}
`.trim();

              renderedContent += formattedIncident + "\n\n"; // Add formatted incident
            } else {
              // If a part looks like an incident but fails to parse, it might be incomplete

              // For now, we'll append it as raw text if it doesn't match the full incident pattern

              // For truly robust parsing, you might need a more stateful parser.

              renderedContent += cleanedPart + "\n\n";
            }
          }
        }
        currentBuffer = unparsedText; // Keep only the incomplete part in the buffer
        // Update UI with all rendered incidents + any unparsed text currently in buffer
        updateMessageContent(renderedContent + currentBuffer, true);
      }

      // After stream ends, process any remaining content in the buffer one last time

      // This handles the very last incident if it wasn't followed by '---'

      if (currentBuffer.trim()) {
        const parsed = parseIncidentString(currentBuffer.trim());

        console.log({ parsed });

        if (parsed) {
          const priorityClass =
            priorityColorMap[parsed.priority] || "text-gray-300";

          const formattedIncident = `

**Title:** ${parsed.title}
**Priority:** <span class="${priorityClass} font-semibold">${parsed.priority}</span>
**Description:** ${parsed.description}
`.trim();

          renderedContent += formattedIncident;
        } else {
          renderedContent += currentBuffer.trim(); // Add remaining raw text
        }
      }

      console.log(renderedContent);

      // Final update with isLoading set to false

      updateMessageContent(renderedContent, false, showAction);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Streaming failed:", error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempEzraMessageId
            ? {
                ...msg,
                content: `I'm sorry, I encountered an error during streaming: ${
                  error?.message || "Failed to get incident data."
                }. Please try again later.`,

                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsEzraResponding(false);
    }
  }, []);

  const handleSendMessage = (userMessageContent: string) => {
    if (userMessageContent.trim() === "" || isEzraResponding) return;

    const newMessage = {
      type: "user" as const,

      content: userMessageContent,

      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",

        minute: "2-digit",

        hour12: false,
      }),

      id: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);

    setCurrentInputMessage("");

    handleStreamedResponse(userMessageContent);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    handleSendMessage(currentInputMessage);
  };

  return (
    <div
      className={clsx(
        "flex flex-col bg-dark text-gray-100 rounded-xl overflow-hidden ease-soft-spring duration-200 transition-all",

        {
          "absolute inset-0 h-screen": fullScreen,

          "h-[600px]": !fullScreen,
        }
      )}
    >
      {/* Header */}

      <div className="bg-[#172554] p-4 shadow-lg flex items-center justify-between ">
        <div className="flex items-center">
          <MdOutlineSecurity className="text-blue-200 text-xl mr-3" />

          <h1 className="text-xl font-bold text-white">
            Ezra, your on-demand AI security agent{" "}
          </h1>
        </div>

        <div
          onClick={() => setFullScreen((prev) => !prev)}
          className="p-2 cursor-pointer text-gray-300 hover:text-white transition-colors"
          title={fullScreen ? "Collapse" : "Expand"}
        >
          {fullScreen ? (
            <RiCollapseDiagonal2Fill size={20} />
          ) : (
            <CgArrowsExpandLeft size={20} />
          )}
        </div>
      </div>

      {/* Chat Messages Area */}

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages && messages.length > 0 ? (
          <>
            {messages.map((msg, index) => (
              <>
                <ChatMessage
                  key={msg.id}
                  type={msg.type}
                  timestamp={msg.timestamp}
                  showAction={showAction && index === messages.length - 1}
                >
                  {msg.type === "ai" ? (
                    <div className="prose prose-invert max-w-none text-gray-100">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="mb-2" {...props} />
                          ),

                          strong: ({ node, ...props }) => (
                            <strong
                              className="font-bold text-blue-200"
                              {...props}
                            />
                          ),

                          a: ({ node, ...props }) => (
                            <Link
                              href={props.href ?? ""}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-4 text-sm cursor-pointer rounded-full transition-colors"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {(msg.content as string)

                          .replace(/^ACTION:\s*\w+\s*$/gm, "")

                          .trim()}
                      </ReactMarkdown>

                      {/* Conditionally render TypingDots component after Markdown */}

                      {msg.isLoading && <TypingDots />}
                    </div>
                  ) : (
                    msg.content
                  )}
                </ChatMessage>
              </>
            ))}
          </>
        ) : (
          <div className="w-full h-full justify-center items-center flex-col flex">
            <div className=" bg-[#111827] gap-2 px-6 py-2 text-6xl text-white rounded-3xl font-bold flex items-center">
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                whileInView={{
                  opacity: [
                    0.5, 0, 0.5, 0.8, 0.2, 0.8, 1, 0.5, 0, 0.5, 0.8, 0.2, 0.8,
                    1,
                  ], // An array of opacity values for the flicker effect
                  y: 0,
                }}
                transition={{
                  duration: 2,
                  delay: 0.2,
                  ease: "circInOut",
                  type: "spring",
                  damping: 8,
                  stiffness: 50,
                }}
              >
                Ezra Ai
              </motion.p>
              <motion.img
                initial={{
                  x: 200,
                  opacity: 0,
                  rotate: 180,
                }}
                whileInView={{
                  x: 0,
                  opacity: 1,
                  rotate: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: 2,
                  ease: "easeIn",
                  type: "spring",
                  damping: 8,
                  stiffness: 50,
                }}
                src="/ezrastar1.svg"
                alt="ezrastar1.svg"
                className=" size-20"
              />
              {/* <PiStarFourFill className=" text-blue-500" size={22} /> */}
            </div>
            <motion.p
              initial={{ y: 40, opacity: 0 }}
              whileInView={{
                y: 0,
                opacity: 1,
              }}
              transition={{
                duration: 2,
                delay: 2.5,
                ease: "circInOut",
                type: "tween",
                damping: 8,
                stiffness: 50,
              }}
              className=" text-center"
            >
              Hi there! I&apos;m Ezra, your AI assistant for log and event
              analysis. <br /> What can I help you with today?
            </motion.p>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Chat Input Area */}

      <div className="bg-dark p-4 border-t border-gray-700">
        <form
          onSubmit={handleInputSubmit}
          className="flex items-center space-x-3"
        >
          <div className="p-2 bg-blue-600 rounded-full flex-shrink-0">
            <MdOutlineSecurity className="text-white text-xl" />
          </div>

          <input
            id="chatInput"
            name="chatInput"
            type="text"
            value={currentInputMessage}
            onChange={(e) => setCurrentInputMessage(e.target.value)}
            placeholder="Ask Ezra to summarise incidents for today"
            className="flex-1 p-3 rounded-full bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-500 transition-all duration-200"
          />

          <button
            type="submit"
            className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 flex-shrink-0"
            aria-label="Send message"
            disabled={isEzraResponding}
          >
            <FiSend className="text-white text-xl" />
          </button>
        </form>
      </div>
      <a href="" target="_blank"></a>
      <CreateIncident
        isModal={true}
        isOpen={openCreateIncident}
        onClose={() => {
          removeQuery();
          setOpenCreateIncident(false);
        }}
      />
    </div>
  );
}
