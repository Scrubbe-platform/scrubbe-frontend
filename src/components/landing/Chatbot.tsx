"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { Components } from "react-markdown";
import {
  HelpCircle,
  CreditCard,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Send,
  Minus,
  X,
  Sparkles,
  UserCheck,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  escalated?: boolean;
}

// ─── Markdown component map ───────────────────────────────────────────────────

const mdComponents: Components = {
  a: ({ href, children }) => (
    <a
      href={href ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="text-emerald-600 underline underline-offset-2 hover:text-emerald-800 font-medium break-all"
    >
      {children}
    </a>
  ),
  h1: ({ children }) => (
    <p className="font-bold text-[15px] mt-2 mb-1">{children}</p>
  ),
  h2: ({ children }) => (
    <p className="font-bold text-[14px] mt-1.5 mb-0.5">{children}</p>
  ),
  h3: ({ children }) => (
    <p className="font-semibold text-[13px] mt-1 mb-0.5">{children}</p>
  ),
  p: ({ children }) => (
    <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-black">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-zinc-700">{children}</em>,
  ul: ({ children }) => <ul className="my-1.5 space-y-0.5">{children}</ul>,
  ol: ({ children }) => (
    <ol className="my-1.5 space-y-0.5 pl-4 list-decimal">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="flex gap-1.5 items-start leading-relaxed">
      <span className="mt-[7px] shrink-0 w-1.5 h-1.5 rounded-full bg-zinc-500" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  code: ({ children, className }) => {
    const isBlock = Boolean(className);
    return isBlock ? (
      <pre className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-[11px] overflow-x-auto my-2 font-mono leading-relaxed">
        <code>{children}</code>
      </pre>
    ) : (
      <code className="bg-zinc-200 rounded px-1 py-0.5 text-[11px] font-mono">
        {children}
      </code>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-emerald-400 pl-3 italic text-zinc-600 my-1.5">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-2 rounded-lg border border-zinc-200 text-[12px]">
      <table className="w-full border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-zinc-100">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-zinc-200 px-3 py-2 font-semibold text-left whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-zinc-100 px-3 py-1.5">{children}</td>
  ),
  hr: () => <hr className="my-2 border-zinc-200" />,
};

// ─── Reference link resolver ──────────────────────────────────────────────────

function getRefLink(text: string): { href: string; label: string } {
  const t = text.toLowerCase();
  // Pricing — only when pricing/cost is the actual topic
  if (
    /how much (does|is|will)|pricing plan|compare plan|which plan|subscription cost|billing|per month|per seat|what (does it|will it) cost/.test(
      t,
    )
  )
    return {
      href: "https://scrubbe.com/pricing",
      label: "scrubbe.com/pricing",
    };
  // Demo booking — only when actively booking or requesting a demo
  if (
    /book a demo|schedule a demo|request a demo|book your demo|talk to (our )?sales|schedule.*walkthrough/.test(
      t,
    )
  )
    return { href: "https://scrubbe.com/demo", label: "scrubbe.com/demo" };
  // Signup — only when directing someone to start
  if (
    /(sign up|create an account|start your (free )?trial|get started for free|14.day (free )?trial) at/.test(
      t,
    )
  )
    return { href: "https://scrubbe.com/signup", label: "scrubbe.com/signup" };
  // Docs / API — only explicit doc references
  if (/api\.scrubbe\.com|docs\.scrubbe\.com/.test(t))
    return { href: "https://docs.scrubbe.com", label: "docs.scrubbe.com" };
  // Auth pages
  if (
    /scrubbe\.com\/login|scrubbe\.com\/signup|sign(in|up) (page|at scrubbe)/.test(
      t,
    )
  )
    return { href: "https://scrubbe.com/login", label: "scrubbe.com/login" };
  // Status page
  if (/status\.scrubbe\.com|platform status/.test(t))
    return { href: "https://status.scrubbe.com", label: "status.scrubbe.com" };
  // Default — always anchor to homepage
  return { href: "https://scrubbe.com", label: "scrubbe.com" };
}

// ─── AI message bubble with full markdown + reference link ───────────────────

function MarkdownMessage({ text }: { text: string }) {
  const ref = getRefLink(text);
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[13.5px] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={mdComponents}
        >
          {text}
        </ReactMarkdown>
      </div>
      <a
        href={ref.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-800 font-mono tracking-wide transition-colors w-fit border-t border-zinc-200 pt-1.5 mt-0.5"
      >
        <ExternalLink size={10} className="shrink-0" />
        {ref.label}
      </a>
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.scrubbe.com/api/v1";
const CONV_KEY = "scrubbe_chat_conv_id";
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 min — matches server session timeout

const quickActions = [
  {
    label: "LEARN ABOUT SCRUBBE",
    icon: HelpCircle,
    topic: "What is Scrubbe and what does it do?",
  },
  {
    label: "SEE PRICING PLANS",
    icon: CreditCard,
    topic: "What pricing plans does Scrubbe offer?",
  },
  { label: "BOOK A DEMO", icon: Calendar, topic: "How can I book a demo?" },
  {
    label: "START FREE TRIAL",
    icon: ShieldCheck,
    topic: "How do I start a free trial?",
  },
];

const navTags = [
  { label: "WHAT IS SCRUBBE?", topic: "What is Scrubbe?" },
  { label: "PRICING", topic: "What are the pricing plans?" },
  { label: "BOOK DEMO", topic: "How do I book a demo?" },
  { label: "SIGN UP", topic: "How do I sign up or start a free trial?" },
  { label: "HOW EZRA WORKS", topic: "How does Ezra, the AI engine, work?" },
  { label: "INTEGRATIONS", topic: "What integrations does Scrubbe support?" },
];

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiCreateConversation(): Promise<string> {
  const res = await fetch(`${API_BASE}/chat/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel: "widget" }),
  });
  if (!res.ok) throw new Error("Failed to create conversation");
  const body = await res.json();
  return body.data.conversationId as string;
}

async function apiSendMessage(
  conversationId: string,
  content: string,
): Promise<{ content: string; escalated: boolean; intentClass: string }> {
  const res = await fetch(
    `${API_BASE}/chat/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    },
  );
  if (!res.ok) throw new Error("Message send failed");
  const body = await res.json();
  return body.data;
}

async function apiEscalate(conversationId: string): Promise<void> {
  await fetch(`${API_BASE}/chat/conversations/${conversationId}/escalate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reason: "User requested human agent via chat widget",
    }),
  });
}

// ─── Session storage helpers ──────────────────────────────────────────────────

function loadConvId(): string | null {
  try {
    const raw = sessionStorage.getItem(CONV_KEY);
    if (!raw) return null;
    const { id, ts } = JSON.parse(raw) as { id: string; ts: number };
    if (Date.now() - ts > SESSION_TTL_MS) {
      sessionStorage.removeItem(CONV_KEY);
      return null;
    }
    return id;
  } catch {
    return null;
  }
}

function saveConvId(id: string) {
  try {
    sessionStorage.setItem(CONV_KEY, JSON.stringify({ id, ts: Date.now() }));
  } catch {}
}

function clearConvId() {
  try {
    sessionStorage.removeItem(CONV_KEY);
  } catch {}
}

// ─── Main Component ───────────────────────────────────────────────────────────

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimised, setIsMinimised] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const [initError, setInitError] = useState(false);

  const chatBodyRef = useRef<HTMLDivElement>(null);
  const firstOpenRef = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Lazily create / restore a conversation when the widget first opens
  const ensureConversation = useCallback(async (): Promise<string> => {
    if (convId) return convId;

    const restored = loadConvId();
    if (restored) {
      setConvId(restored);
      return restored;
    }

    const newId = await apiCreateConversation();
    saveConvId(newId);
    setConvId(newId);
    return newId;
  }, [convId]);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && firstOpenRef.current) {
      firstOpenRef.current = false;
      setTimeout(() => {
        setMessages([
          {
            id: "welcome",
            text: "Hi there! I'm **Ezra**, Scrubbe's AI assistant.\n\nI can answer questions about Scrubbe's features, pricing, integrations, and getting started. What can I help you with today?",
            isUser: false,
          },
        ]);
      }, 300);
    }
  }, [isOpen]);

  const addMessage = useCallback((msg: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: crypto.randomUUID() }]);
  }, []);

  const handleSend = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || isTyping) return;
      setInput("");
      addMessage({ text: content, isUser: true });
      setIsTyping(true);

      try {
        const cid = await ensureConversation();
        const reply = await apiSendMessage(cid, content);
        setIsTyping(false);
        addMessage({
          text: reply.content,
          isUser: false,
          escalated: reply.escalated,
        });
        if (reply.escalated) setIsEscalated(true);
      } catch {
        setIsTyping(false);
        setInitError(true);
        addMessage({
          text: "I'm having trouble connecting right now. Please try again in a moment, or reach us directly at support@scrubbe.com.",
          isUser: false,
        });
      }
    },
    [input, isTyping, addMessage, ensureConversation],
  );

  const handleTalkToHuman = useCallback(async () => {
    try {
      const cid = await ensureConversation();
      await apiEscalate(cid);
    } catch {}
    setIsEscalated(true);
    addMessage({
      text: "I've connected you with our support team. Someone will follow up with you at your account email shortly. In the meantime, feel free to keep asking me questions about Scrubbe.",
      isUser: false,
    });
  }, [addMessage, ensureConversation]);

  const handleClearChat = useCallback(() => {
    clearConvId();
    setConvId(null);
    setMessages([]);
    setIsEscalated(false);
    setInitError(false);
    firstOpenRef.current = true;
    setTimeout(() => {
      setMessages([
        {
          id: "welcome",
          text: "Hi there! I'm **Ezra**, Scrubbe's AI assistant.\n\nI can answer questions about Scrubbe's features, pricing, integrations, and getting started. What can I help you with today?",
          isUser: false,
        },
      ]);
    }, 300);
  }, []);

  const hasConversation = messages.length > 0;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {/* ── Chat panel ─────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={`flex flex-col w-[340px] sm:w-[380px] rounded-2xl overflow-hidden shadow-2xl border border-zinc-700
            transition-all duration-300 origin-bottom-right
            ${isMinimised ? "h-[56px]" : "h-[580px]"}
          `}
          style={{ background: "#111" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-white tracking-wide">
                EZRA
              </p>
              <p className="text-[11px] text-emerald-400 font-mono tracking-widest uppercase">
                {isEscalated ? "Support Agent Notified" : "Scrubbe AI · Online"}
              </p>
            </div>
            <button
              onClick={() => setIsMinimised(!isMinimised)}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Minimise"
            >
              <Minus size={14} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          {!isMinimised && (
            <>
              {/* Nav tags */}
              <div className="flex flex-wrap gap-1.5 px-4 py-3 bg-white border-b border-zinc-200 flex-shrink-0">
                {navTags.map(({ label, topic }) => (
                  <button
                    key={label}
                    onClick={() => handleSend(topic)}
                    className="px-2.5 py-1 text-[10px] font-bold tracking-wide border border-zinc-300 rounded text-black hover:bg-zinc-100 hover:border-zinc-400 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Chat body */}
              <div
                ref={chatBodyRef}
                className="flex-1 overflow-y-auto px-4 py-4 bg-white flex flex-col gap-3"
              >
                {/* Ezra avatar */}
                {messages.length > 0 && (
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 self-start">
                    <Sparkles size={16} className="text-emerald-400" />
                  </div>
                )}

                {/* Messages */}
                {messages.map((msg) => (
                  <div key={msg.id} className="flex flex-col gap-1">
                    <div
                      className={`max-w-[88%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed
                        ${
                          msg.isUser
                            ? "bg-zinc-900 text-white self-end rounded-br-sm"
                            : "bg-zinc-100 text-black self-start rounded-bl-sm"
                        }`}
                    >
                      {msg.isUser ? (
                        msg.text
                      ) : (
                        <MarkdownMessage text={msg.text} />
                      )}
                    </div>
                    {/* Escalation badge */}
                    {msg.escalated && !msg.isUser && (
                      <div className="flex items-center gap-1.5 self-start px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                        <UserCheck
                          size={11}
                          className="text-amber-600 shrink-0"
                        />
                        <span className="text-[10px] text-amber-700 font-medium">
                          Support team notified
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-1 px-4 py-3 bg-zinc-100 rounded-2xl rounded-bl-sm w-fit self-start">
                    {[0, 1, 2].map((n) => (
                      <span
                        key={n}
                        className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${n * 120}ms` }}
                      />
                    ))}
                  </div>
                )}

                {/* Quick actions — only when no conversation yet */}
                {!hasConversation && (
                  <div className="flex flex-col gap-2 mt-2">
                    {quickActions.map(({ label, icon: Icon, topic }) => (
                      <button
                        key={label}
                        onClick={() => handleSend(topic)}
                        className="flex items-center gap-3 px-4 py-3 border border-zinc-200 rounded-xl text-left hover:bg-zinc-50 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center shrink-0 text-black group-hover:border-zinc-400 transition-colors">
                          <Icon size={15} />
                        </div>
                        <span className="flex-1 text-[11px] font-bold tracking-widest text-black uppercase">
                          {label}
                        </span>
                        <ChevronRight
                          size={14}
                          className="text-emerald-500 shrink-0"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Connection error banner */}
                {initError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-[12px] text-red-700">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>
                      Connection issue — responses may be delayed. Email us at
                      support@scrubbe.com.
                    </span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 pt-3 pb-2 bg-white border-t border-zinc-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask Ezra anything about Scrubbe..."
                    disabled={isTyping}
                    className="flex-1 px-4 py-2.5 text-[13px] border border-zinc-200 rounded-xl focus:outline-none focus:border-emerald-400 placeholder:text-zinc-400 text-black disabled:opacity-50"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={isTyping || !input.trim()}
                    className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center hover:bg-zinc-700 transition-colors shrink-0 disabled:opacity-40"
                    aria-label="Send"
                  >
                    <Send size={15} className="text-emerald-400" />
                  </button>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <button
                    onClick={handleTalkToHuman}
                    className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-800 transition-colors font-mono tracking-wide"
                  >
                    <UserCheck size={10} />
                    TALK TO SUPPORT
                  </button>
                  <button
                    onClick={handleClearChat}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors font-mono tracking-wide"
                  >
                    <X size={10} />
                    CLEAR
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Toggle button ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimised(false);
        }}
        className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-700 flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none border border-zinc-700"
        aria-label="Open Ezra chat"
      >
        <Sparkles size={20} className="text-emerald-400" />
      </button>
    </div>
  );
};

export default Chatbot;
