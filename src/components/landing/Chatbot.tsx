"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
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
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────
interface KnowledgeItem {
  title: string;
  content: string;
}
interface KnowledgeBase {
  [key: string]: KnowledgeItem;
}
interface ChatMessage {
  text: string;
  isUser: boolean;
}

// ─── Quick-action items ───────────────────────────────────────────
const quickActions = [
  { label: "LEARN ABOUT SCRUBBE", icon: HelpCircle, topic: "About Scrubbe" },
  { label: "SEE PRICING PLANS", icon: CreditCard, topic: "Pricing" },
  { label: "BOOK DEMO", icon: Calendar, topic: "Book Demo" },
  { label: "START FREE TRIAL", icon: ShieldCheck, topic: "Contact Us" },
];

// ─── Nav tags ─────────────────────────────────────────────────────
const navTags = [
  "WHAT IS SCRUBBE?",
  "PRICING",
  "BOOK DEMO",
  "SIGN UP",
  "HOW EZRA WORKS",
  "INTEGRATIONS",
];

// ─── Knowledge base ───────────────────────────────────────────────
const scrubbeKnowledge: KnowledgeBase = {
  about: {
    title: "About Scrubbe",
    content:
      "Scrubbe is an advanced SIEM and SOAR platform designed to help organizations detect, analyze, and respond to security threats in real-time. Our platform integrates with your existing security infrastructure to provide comprehensive visibility and automated response capabilities.",
  },
  features: {
    title: "Key Features",
    content:
      "• Real-time threat detection\n• Automated incident response\n• AI-powered analytics\n• Customizable dashboards\n• Comprehensive log management\n• Compliance reporting\n• Threat intelligence integration\n• Case management workflow",
  },
  documentation: {
    title: "Documentation",
    content:
      "Our comprehensive documentation includes installation guides, API references, integration tutorials, and best practices. Would you like me to direct you to a specific section?",
  },
  pricing: {
    title: "Pricing",
    content:
      "Scrubbe offers flexible pricing plans:\n• Starter: For small teams and startups\n• Professional: For mid-sized organizations\n• Enterprise: For large organizations with advanced needs\n\nPlease contact our sales team for detailed pricing information.",
  },
  contact: {
    title: "Contact Us",
    content: "You can reach our support team at support@scrubbe.com",
  },
  installation: {
    title: "Installation Guide",
    content:
      "Scrubbe can be deployed on-premises or in the cloud. Installation typically takes 2–4 hours. Our team can provide guided installation services if needed.",
  },
  integrations: {
    title: "Integrations",
    content:
      "Scrubbe integrates with:\n• Firewall solutions (Cisco, Palo Alto, Fortinet)\n• Endpoint protection platforms\n• Cloud providers (AWS, Azure, GCP)\n• Identity providers\n• Vulnerability scanners\n• Threat intelligence feeds",
  },
  faq: {
    title: "Frequently Asked Questions",
    content:
      "Common questions:\n• How long does implementation take?\n• Is training provided?\n• What kind of support is available?\n• How often are updates released?\n\nWhat specific question can I help you with?",
  },
};

const processInput = (input: string): string => {
  const l = input.toLowerCase();
  if (l.includes("about") || l.includes("what is") || l.includes("scrubbe"))
    return scrubbeKnowledge.about.content;
  if (
    l.includes("feature") ||
    l.includes("capabilities") ||
    l.includes("what can")
  )
    return scrubbeKnowledge.features.content;
  if (l.includes("doc") || l.includes("guide") || l.includes("manual"))
    return scrubbeKnowledge.documentation.content;
  if (
    l.includes("price") ||
    l.includes("cost") ||
    l.includes("plan") ||
    l.includes("pricing")
  )
    return scrubbeKnowledge.pricing.content;
  if (l.includes("contact") || l.includes("support") || l.includes("talk"))
    return scrubbeKnowledge.contact.content;
  if (l.includes("install") || l.includes("deploy") || l.includes("setup"))
    return scrubbeKnowledge.installation.content;
  if (
    l.includes("integrat") ||
    l.includes("connect") ||
    l.includes("work with")
  )
    return scrubbeKnowledge.integrations.content;
  if (l.includes("faq") || l.includes("question") || l.includes("common"))
    return scrubbeKnowledge.faq.content;
  if (l.includes("demo") || l.includes("book"))
    return "You can book a demo at scrubbe.com/demo or email us at hello@scrubbe.com — our team will get back to you within one business day.";
  if (l.includes("trial") || l.includes("free"))
    return "Start your free trial at scrubbe.com/signup — no credit card required. You'll get full access for 14 days.";
  if (l.includes("thank"))
    return "You're welcome! Anything else I can help you with?";
  if (l.includes("bye") || l.includes("goodbye"))
    return "Thanks for chatting! Feel free to come back anytime. Have a great day!";
  return "I'm not sure I understand. You can ask me about Scrubbe's features, pricing, documentation, integrations, or how to book a demo.";
};

// ─── Main component ───────────────────────────────────────────────
const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimised, setIsMinimised] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const firstOpenRef = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const addMessage = useCallback((text: string, isUser = false) => {
    setMessages((prev) => [...prev, { text, isUser }]);
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    const userText = input;
    setInput("");
    addMessage(userText, true);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(processInput(userText));
    }, 900 + Math.random() * 700);
  }, [input, addMessage]);

  const handleQuickAction = (topic: string) => {
    addMessage(topic, true);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(processInput(topic));
    }, 900);
  };

  const handleClearChat = () => {
    setMessages([]);
    firstOpenRef.current = true;
    setTimeout(() => {
      addMessage(
        "Hi 👋 I'm Ezra, Scrubbe's AI agent. I can help you understand how Scrubbe works, find the right pricing plan, book a demo, or get you signed up. What brings you here today?"
      );
    }, 300);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && firstOpenRef.current) {
      firstOpenRef.current = false;
      setTimeout(() => {
        addMessage(
          "Hi 👋 I'm Ezra, Scrubbe's AI agent. I can help you understand how Scrubbe works, find the right pricing plan, book a demo, or get you signed up. What brings you here today?"
        );
      }, 300);
    }
  }, [isOpen, addMessage]);

  const hasConversation = messages.length > 0;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {/* ── Chat panel ── */}
      <div
        className={`flex flex-col w-[340px] sm:w-[380px] rounded-2xl overflow-hidden shadow-2xl border border-zinc-700
          transition-all duration-300 origin-bottom-right
          ${
            isOpen
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none"
          }
          ${isMinimised ? "h-[56px]" : "h-[580px]"}
        `}
        style={{ background: "#111" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-white tracking-wide">
              EZRA
            </p>
            <p className="text-[11px] text-emerald-400 font-mono tracking-widest uppercase">
              Scrubbe AI · Online
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
            {/* ── Nav tags ── */}
            <div className="flex flex-wrap gap-1.5 px-4 py-3 bg-white border-b border-zinc-200 flex-shrink-0">
              {navTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleQuickAction(tag)}
                  className="px-2.5 py-1 text-[10px] font-bold tracking-wide border border-zinc-300 rounded text-zinc-700 hover:bg-zinc-100 hover:border-zinc-400 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* ── Chat body ── */}
            <div
              ref={chatBodyRef}
              className="flex-1 overflow-y-auto px-4 py-4 bg-white flex flex-col gap-3"
            >
              {/* Ezra avatar spark */}
              {messages.length > 0 && (
                <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 self-start">
                  <Sparkles size={16} className="text-emerald-400" />
                </div>
              )}

              {/* Messages */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[88%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed
                    ${
                      msg.isUser
                        ? "bg-zinc-900 text-white self-end rounded-br-sm"
                        : "bg-zinc-100 text-zinc-800 self-start rounded-bl-sm"
                    }`}
                >
                  {msg.text.split("\n").map((line, j) => (
                    <div key={j}>{line}</div>
                  ))}
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

              {/* Quick actions — shown only when no conversation yet */}
              {!hasConversation && (
                <div className="flex flex-col gap-2 mt-2">
                  {quickActions.map(({ label, icon: Icon, topic }) => (
                    <button
                      key={label}
                      onClick={() => handleQuickAction(topic)}
                      className="flex items-center gap-3 px-4 py-3 border border-zinc-200 rounded-xl text-left hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-500 group-hover:border-zinc-400 transition-colors">
                        <Icon size={15} />
                      </div>
                      <span className="flex-1 text-[11px] font-bold tracking-widest text-zinc-700 uppercase">
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
            </div>

            {/* ── Footer ── */}
            <div className="px-4 pt-3 pb-2 bg-white border-t border-zinc-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask Ezra anything about Scrubbe..."
                  className="flex-1 px-4 py-2.5 text-[13px] border border-zinc-200 rounded-xl focus:outline-none focus:border-emerald-400 placeholder:text-zinc-400 text-zinc-800"
                />
                <button
                  onClick={handleSend}
                  className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center hover:bg-zinc-700 transition-colors shrink-0"
                  aria-label="Send"
                >
                  <Send size={15} className="text-emerald-400" />
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleClearChat}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors font-mono tracking-wide"
                >
                  <X size={10} />
                  CLEAR CHAT
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Toggle button ── */}
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
