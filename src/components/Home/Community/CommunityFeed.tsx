"use client";

import { useState, useRef, useCallback } from "react";
import {
  ThumbsUp,
  MessageCircle,
  BookOpen,
  Bookmark,
  Share2,
  Eye,
  Pin,
  Star,
  X,
  Check,
  Link,
  Twitter,
  Facebook,
  Linkedin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface Reply {
  id: number;
  author: string;
  initials: string;
  avatarColor: string;
  role: string;
  roleBadgeColor: string;
  badges?: { label: string; color: string }[];
  timeAgo: string;
  content: string;
  likes: number;
  isAnswer?: boolean;
}

interface Comment {
  id: number;
  author: string;
  initials: string;
  avatarColor: string;
  role: string;
  roleBadgeColor: string;
  timeAgo: string;
  content: string;
  likes: number;
  replies?: Reply[];
}

interface Reaction {
  emoji: string;
  count: number;
}
interface TrendingTag {
  label: string;
}

interface Post {
  id: number;
  author: string;
  initials: string;
  avatarColor: string;
  role: string;
  roleBadgeColor: string;
  badges?: { label: string; color: string }[];
  pinned?: boolean;
  communityFavourite?: boolean;
  timeAgo: string;
  views: string;
  tags: { label: string; color: string }[];
  title: string;
  titleColor?: string;
  body: string;
  trending?: TrendingTag[];
  reactions: Reaction[];
  commentCount: number;
  comments: Comment[];
  showComments?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────

const POSTS: Post[] = [
  {
    id: 1,
    author: "Paschal Ifediora",
    initials: "PK",
    avatarColor: "bg-teal-500",
    role: "SCRUBBE TEAM",
    roleBadgeColor: "bg-emerald-500 text-white",
    badges: [{ label: "SCRUBBE TEAM", color: "bg-emerald-500 text-white" }],
    pinned: true,
    timeAgo: "3 days ago",
    views: "1.2k",
    tags: [
      {
        label: "GOVERNANCE",
        color: "bg-cyan-100 text-cyan-800 border border-cyan-300",
      },
      {
        label: "INCIDENT",
        color: "bg-red-100 text-red-700 border border-red-300",
      },
    ],
    title:
      "Welcome to the Scrubbe Community — how to get the most from your discussions",
    titleColor: "text-emerald-600",
    body: "This is the place to discuss incident patterns, governance configurations, EAL strategies, connector setups — anything about running reliable systems at scale. We're building Scrubbe alongside you. The team reads every post. Questions get priority. Real post-mortems especially welcome — share the timeline, the config, the outcome.",
    reactions: [
      { emoji: "👍", count: 47 },
      { emoji: "🔥", count: 12 },
      { emoji: "💜", count: 8 },
    ],
    commentCount: 14,
    comments: [
      {
        id: 1,
        author: "Siona Reeves",
        initials: "SR",
        avatarColor: "bg-yellow-400",
        role: "SRE",
        roleBadgeColor: "bg-blue-100 text-blue-700",
        timeAgo: "2 days ago",
        content:
          "Can I set different `policy.maxAutomationLevel` per environment — production at EAL 2, staging at EAL 3?",
        likes: 12,
        replies: [
          {
            id: 1,
            author: "Paschal Ifediora",
            initials: "PK",
            avatarColor: "bg-teal-500",
            role: "TEAM",
            roleBadgeColor: "bg-gray-800 text-white",
            badges: [
              { label: "TEAM", color: "bg-gray-800 text-white" },
              {
                label: "✓ ANSWER",
                color:
                  "bg-emerald-100 text-emerald-700 border border-emerald-300",
              },
            ],
            timeAgo: "2 days ago",
            content:
              "Yes — set a separate Policy entity per environment and configure the ceiling there. EAL = min(playbook, policy, riskClassifier) — the policy ceiling is always honoured. Branch-to-env mapping lives in policy-service config, not in the connector.",
            likes: 0,
            isAnswer: true,
          },
        ],
      },
      {
        id: 2,
        author: "Tobias Kramer",
        initials: "TK",
        avatarColor: "bg-purple-400",
        role: "PLATFORM ENG",
        roleBadgeColor: "bg-gray-100 text-gray-700 border border-gray-200",
        timeAgo: "1 day ago",
        content:
          "We do exactly this. Prod at EAL 2, staging at EAL 3. One gotcha: make sure env labels in your ScrubbEvent schema match the policy entity keys exactly — case sensitive.",
        likes: 18,
      },
    ],
    showComments: true,
  },
  {
    id: 2,
    author: "Julia Weisel",
    initials: "JW",
    avatarColor: "bg-blue-500",
    role: "DEVOPS ENGINEER",
    roleBadgeColor: "bg-gray-100 text-gray-700 border border-gray-200",
    communityFavourite: true,
    timeAgo: "Yesterday",
    views: "2.1k",
    tags: [
      {
        label: "INCIDENT",
        color: "bg-red-100 text-red-700 border border-red-300",
      },
      {
        label: "POST-MORTEM",
        color: "bg-orange-100 text-orange-700 border border-orange-300",
      },
      {
        label: "CONNECTOR",
        color: "bg-purple-100 text-purple-700 border border-purple-300",
      },
    ],
    title:
      "Post-mortem: our first EAL 3 assisted rollback — 4 min MTTR, blast radius blocked auto-exec correctly",
    titleColor: "text-orange-500",
    body: "Checkout service deploy v2.4.1 → 3× error rate in 90 seconds. Scrubbe raised INC-9204, matched the checkout-rollback playbook at 91% confidence. Blast radius: 3 DIRECT services. Gate blocked auto-execute, capped EAL at 2 via riskClassifier. On-call confirmed in Slack. Resolved in 4 minutes. Full timeline, config, and learnings inside",
    trending: [
      { label: "79% MTTR reduction" },
      { label: "EAL 3" },
      { label: "Kubernetes" },
      { label: "GitHub" },
    ],
    reactions: [
      { emoji: "🔥", count: 61 },
      { emoji: "👍", count: 34 },
      { emoji: "🎉", count: 22 },
    ],
    commentCount: 14,
    comments: [],
  },
  {
    id: 3,
    author: "Amara Mensah",
    initials: "AM",
    avatarColor: "bg-green-500",
    role: "SRE LEAD · FINTECH",
    roleBadgeColor: "bg-gray-100 text-gray-700 border border-gray-200",
    timeAgo: "Yesterday",
    views: "2.1k",
    tags: [
      {
        label: "QUESTION",
        color: "bg-amber-100 text-amber-700 border border-amber-300",
      },
    ],
    title:
      "EAL 3 vs EAL 4 for pod restarts in production — what's your team's call after 6 months?",
    titleColor: "text-emerald-600",
    body: "We're 8 weeks in at EAL 2 with 22 consistent resolved outcomes on the pod-restart pattern. Debating whether to move to EAL 3 or go straight to EAL 4. What's your blast radius threshold that triggers the riskClassifier cap? How many resolved outcomes before you felt confident at each level?",
    reactions: [{ emoji: "🔥", count: 61 }],
    commentCount: 14,
    comments: [],
  },
];

const EMOJI_OPTIONS = [
  { emoji: "👍", label: "Like" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "💜", label: "Love" },
  { emoji: "🎉", label: "Celebrate" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
];

// ─────────────────────────────────────────────────────────────────
// Toast notification
// ─────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2 bg-gray-900 text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-xl animate-fade-in"
      onAnimationEnd={onDone}
    >
      <Check size={14} className="text-emerald-400" />
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Share popover
// ─────────────────────────────────────────────────────────────────

function SharePopover({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? window.location.href
      : "https://community.scrubbe.com";
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);

  const shareLinks = [
    {
      label: "Twitter / X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: "hover:text-sky-500",
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:text-blue-600",
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:text-blue-500",
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing silently
    }
  };

  return (
    <div className="absolute bottom-full right-0 mb-2 z-50 w-56">
      <div className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
          <span className="text-[12px] font-bold uppercase tracking-widest text-gray-500">
            Share
          </span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={13} />
          </button>
        </div>

        {/* Copy link */}
        <div className="px-3 py-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Link size={13} className="text-gray-400 shrink-0" />
            <span className="flex-1 text-[11px] text-gray-500 truncate">
              {url}
            </span>
            <button
              onClick={handleCopy}
              className={`text-[11px] font-bold transition-colors shrink-0 ${
                copied
                  ? "text-emerald-600"
                  : "text-gray-700 hover:text-emerald-600"
              }`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Social links */}
        <div className="px-3 py-2">
          {shareLinks.map(({ label, icon: Icon, href, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className={`flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] text-gray-600 font-medium transition-colors hover:bg-gray-50 ${color}`}
            >
              <Icon size={14} />
              {label}
              <ExternalLink size={11} className="ml-auto text-gray-300" />
            </a>
          ))}
        </div>
      </div>
      {/* caret */}
      <div className="w-3 h-3 bg-white border-b border-r border-gray-200 rotate-45 ml-auto mr-4 -mt-1.5 shadow-sm" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Read Full modal
// ─────────────────────────────────────────────────────────────────

function ReadFullModal({ post, onClose }: { post: Post; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex flex-wrap gap-1.5 pr-4">
            {post.tags.map((t, i) => (
              <span
                key={i}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide ${t.color}`}
              >
                {t.label}
              </span>
            ))}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        {/* Modal body */}
        <div className="overflow-y-auto p-6 flex-1">
          <h2
            className={`text-[20px] sm:text-[22px] font-bold leading-snug mb-3 ${
              post.titleColor ?? "text-gray-900"
            }`}
          >
            {post.title}
          </h2>
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <Avatar
              initials={post.initials}
              color={post.avatarColor}
              size="sm"
            />
            <span className="text-[13px] font-semibold text-gray-800">
              {post.author}
            </span>
            <span className="text-[12px] text-gray-400">{post.timeAgo}</span>
            {post.views && (
              <span className="flex items-center gap-1 text-[12px] text-gray-400">
                <Eye size={11} /> {post.views} views
              </span>
            )}
          </div>
          <p className="text-[14px] sm:text-[15px] text-gray-700 leading-relaxed whitespace-pre-line">
            {post.body}
          </p>
          {post.trending && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                Trending topics
              </p>
              <div className="flex flex-wrap gap-2">
                {post.trending.map((t, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-orange-50 text-orange-600 text-[12px] font-semibold rounded-full border border-orange-200"
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────────

function Avatar({
  initials,
  color,
  size = "md",
}: {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const sz =
    size === "sm"
      ? "w-7 h-7 sm:w-8 sm:h-8 text-[10px] sm:text-[11px]"
      : size === "lg"
      ? "w-10 h-10 sm:w-11 sm:h-11 text-[13px] sm:text-[14px]"
      : "w-8 h-8 sm:w-10 sm:h-10 text-[12px] sm:text-[13px]";
  return (
    <div
      className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
    >
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Inline code rendering
// ─────────────────────────────────────────────────────────────────

function InlineContent({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code
            key={i}
            className="px-1 py-0.5 bg-gray-100 text-gray-700 rounded text-[12px] sm:text-[13px] font-mono break-all"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Reaction pill
// ─────────────────────────────────────────────────────────────────

function ReactionPill({
  emoji,
  count,
  active,
  onToggle,
}: {
  emoji: string;
  count: number;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[12px] sm:text-[13px] font-semibold border transition-all cursor-pointer ${
        active
          ? "bg-amber-50 border-amber-300 text-amber-700 scale-105"
          : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:scale-105"
      }`}
    >
      <span>{emoji}</span>
      <span>{active ? count + 1 : count}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Emoji Picker
// ─────────────────────────────────────────────────────────────────

function EmojiPicker({
  onSelect,
  onClose,
}: {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute bottom-full left-0 mb-2 z-50"
      onMouseLeave={onClose}
    >
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-1.5 shadow-lg">
        {EMOJI_OPTIONS.map(({ emoji, label }) => (
          <button
            key={emoji}
            title={label}
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="text-xl sm:text-2xl leading-none w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all hover:scale-125 active:scale-110"
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="w-3 h-3 bg-white border-b border-r border-gray-200 rotate-45 mx-4 -mt-1.5 shadow-sm" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// React button
// ─────────────────────────────────────────────────────────────────

function ReactButton({
  onAddReaction,
}: {
  onAddReaction: (emoji: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = () => {
    if (timeout.current) clearTimeout(timeout.current);
    setShowPicker(true);
  };
  const close = () => {
    timeout.current = setTimeout(() => setShowPicker(false), 150);
  };

  const handleSelect = (emoji: string) => {
    if (myReaction === emoji) {
      setMyReaction(null);
      return;
    }
    setMyReaction(emoji);
    onAddReaction(emoji);
  };

  return (
    <div className="relative" onMouseEnter={open} onMouseLeave={close}>
      {showPicker && (
        <EmojiPicker
          onSelect={handleSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
      <button
        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-[11px] font-bold tracking-wide transition-colors cursor-pointer border-0 ${
          myReaction
            ? "text-amber-600 bg-amber-50"
            : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
        }`}
      >
        {myReaction ? (
          <span className="text-base leading-none">{myReaction}</span>
        ) : (
          <ThumbsUp size={13} />
        )}
        <span className="hidden sm:inline">{myReaction ?? "REACT"}</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Action bar
// ─────────────────────────────────────────────────────────────────

function ActionBar({
  post,
  commentCount,
  onToggleComments,
  showComments,
  onAddReaction,
  saved,
  onSave,
  onReadFull,
}: {
  post: Post;
  commentCount: number;
  onToggleComments: () => void;
  showComments: boolean;
  onAddReaction: (emoji: string) => void;
  saved: boolean;
  onSave: () => void;
  onReadFull: () => void;
}) {
  const [showShare, setShowShare] = useState(false);
  const shareTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openShare = () => {
    if (shareTimeout.current) clearTimeout(shareTimeout.current);
    setShowShare(true);
  };
  const closeShare = () => {
    shareTimeout.current = setTimeout(() => setShowShare(false), 200);
  };

  return (
    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 mt-3 sm:mt-4 gap-2">
      <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
        <ReactButton onAddReaction={onAddReaction} />

        <ActionBtn
          icon={<MessageCircle size={13} />}
          label={`${commentCount} COMMENTS`}
          mobileLabel={`${commentCount}`}
          onClick={onToggleComments}
          active={showComments}
        />

        <ActionBtn
          icon={<BookOpen size={13} />}
          label="READ FULL"
          mobileLabel=""
          onClick={onReadFull}
        />

        <ActionBtn
          icon={
            <Bookmark
              size={13}
              className={saved ? "fill-emerald-600 stroke-emerald-600" : ""}
            />
          }
          label={saved ? "SAVED" : "SAVE"}
          mobileLabel=""
          onClick={onSave}
          active={saved}
        />
      </div>

      {/* Share with popover */}
      <div
        className="relative"
        onMouseEnter={openShare}
        onMouseLeave={closeShare}
      >
        {showShare && (
          <SharePopover
            title={post.title}
            onClose={() => setShowShare(false)}
          />
        )}
        <ActionBtn
          icon={<Share2 size={13} />}
          label="SHARE"
          mobileLabel=""
          active={showShare}
        />
      </div>
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  mobileLabel,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  mobileLabel?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-[11px] font-bold tracking-wide transition-colors cursor-pointer border-0 ${
        active
          ? "text-emerald-600 bg-emerald-50"
          : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {mobileLabel !== undefined && (
        <span className="sm:hidden">{mobileLabel}</span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Reply card
// ─────────────────────────────────────────────────────────────────

function ReplyCard({ reply }: { reply: Reply }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="ml-8 sm:ml-12 mt-3">
      <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
        <div className="flex items-start sm:items-center gap-2 flex-wrap mb-2">
          <Avatar
            initials={reply.initials}
            color={reply.avatarColor}
            size="sm"
          />
          <span className="text-[13px] sm:text-[14px] font-semibold text-gray-900">
            {reply.author}
          </span>
          {reply.badges?.map((b, i) => (
            <span
              key={i}
              className={`text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded ${b.color}`}
            >
              {b.label}
            </span>
          ))}
          <span className="text-[11px] sm:text-[12px] text-gray-400">
            {reply.timeAgo}
          </span>
        </div>
        <p className="text-[13px] sm:text-[14px] text-gray-700 leading-relaxed">
          <InlineContent text={reply.content} />
        </p>
        <button
          onClick={() => setLiked(!liked)}
          className={`mt-2 flex items-center gap-1 text-[12px] font-semibold transition-colors ${
            liked ? "text-amber-500" : "text-gray-400 hover:text-amber-500"
          }`}
        >
          🔥 {liked ? reply.likes + 1 : reply.likes}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Comment card
// ─────────────────────────────────────────────────────────────────

function CommentCard({
  comment,
  onReply,
}: {
  comment: Comment;
  onReply: (author: string) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const replyCount = comment.replies?.length ?? 0;

  return (
    <div className="mb-4">
      <div className="flex gap-2 sm:gap-3">
        <Avatar
          initials={comment.initials}
          color={comment.avatarColor}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-2">
              <span className="text-[13px] sm:text-[14px] font-semibold text-gray-900">
                {comment.author}
              </span>
              <span
                className={`text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded ${comment.roleBadgeColor}`}
              >
                {comment.role}
              </span>
              <span className="text-[11px] sm:text-[12px] text-gray-400">
                {comment.timeAgo}
              </span>
            </div>
            <p className="text-[13px] sm:text-[14px] text-gray-700 leading-relaxed">
              <InlineContent text={comment.content} />
            </p>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-1 text-[12px] sm:text-[13px] font-semibold transition-colors border-0 bg-transparent ${
                  liked
                    ? "text-amber-500"
                    : "text-gray-400 hover:text-amber-500"
                }`}
              >
                🔥 {liked ? comment.likes + 1 : comment.likes}
              </button>
              <button
                onClick={() => onReply(comment.author)}
                className="text-[12px] sm:text-[13px] font-medium text-emerald-600 hover:text-emerald-700 border-0 bg-transparent cursor-pointer transition-colors"
              >
                Reply
              </button>
              {replyCount > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="ml-auto flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showReplies ? (
                    <ChevronUp size={12} />
                  ) : (
                    <ChevronDown size={12} />
                  )}
                  {replyCount} {replyCount === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>
          </div>
          {showReplies &&
            comment.replies?.map((r) => <ReplyCard key={r.id} reply={r} />)}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Comment section
// ─────────────────────────────────────────────────────────────────

function CommentsSection({
  comments,
  count,
}: {
  comments: Comment[];
  count: number;
}) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState(comments);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleReply = (author: string) => {
    setReplyingTo(author);
    setNewComment(`@${author} `);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handlePost = () => {
    if (!newComment.trim()) return;
    const next: Comment = {
      id: Date.now(),
      author: "You",
      initials: "Y",
      avatarColor: "bg-emerald-500",
      role: "MEMBER",
      roleBadgeColor: "bg-gray-100 text-gray-700 border border-gray-200",
      timeAgo: "just now",
      content: newComment.trim(),
      likes: 0,
    };
    setLocalComments((prev) => [...prev, next]);
    setNewComment("");
    setReplyingTo(null);
  };

  return (
    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-5">
      <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
        {count + localComments.filter((c) => c.author === "You").length}{" "}
        COMMENTS
      </p>
      {localComments.map((c) => (
        <CommentCard key={c.id} comment={c} onReply={handleReply} />
      ))}

      {replyingTo && (
        <div className="mb-1.5 flex items-center gap-1.5 text-[12px] text-emerald-600 font-medium">
          <MessageCircle size={12} />
          Replying to <span className="font-bold">@{replyingTo}</span>
          <button
            onClick={() => {
              setReplyingTo(null);
              setNewComment("");
            }}
            className="ml-1 text-gray-400 hover:text-gray-600"
          >
            <X size={11} />
          </button>
        </div>
      )}

      <div className="flex gap-2 sm:gap-3 mt-2">
        <Avatar initials="Y" color="bg-emerald-500" size="md" />
        <div className="flex-1 border border-gray-200 rounded-xl bg-white overflow-hidden min-w-0 focus-within:border-emerald-400 transition-colors">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
            }}
            placeholder="Add a comment..."
            rows={2}
            className="w-full px-3 sm:px-4 pt-3 pb-1 text-[13px] sm:text-[14px] text-gray-700 placeholder-gray-400 resize-none outline-none bg-transparent border-0"
          />
          <div className="flex items-center justify-between px-3 sm:px-4 pb-3 gap-2">
            <span className="text-[10px] sm:text-[11px] text-gray-400 font-mono hidden sm:block">
              ⌘+Enter to post
            </span>
            <button
              onClick={handlePost}
              disabled={!newComment.trim()}
              className="ml-auto flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white text-[12px] sm:text-[13px] font-bold rounded-lg cursor-pointer border-0 hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={12} />
              POST
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Post card
// ─────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
  const [showComments, setShowComments] = useState(post.showComments ?? false);
  const [reactions, setReactions] = useState<Reaction[]>(post.reactions);
  const [activeReactions, setActiveReactions] = useState<Set<string>>(
    new Set()
  );
  const [saved, setSaved] = useState(false);
  const [showReadFull, setShowReadFull] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleAddReaction = useCallback((emoji: string) => {
    setReactions((prev) => {
      const exists = prev.find((r) => r.emoji === emoji);
      return exists
        ? prev.map((r) =>
            r.emoji === emoji ? { ...r, count: r.count + 1 } : r
          )
        : [...prev, { emoji, count: 1 }];
    });
  }, []);

  const handleTogglePill = (emoji: string) => {
    setActiveReactions((prev) => {
      const next = new Set(prev);
      if (next.has(emoji)) {
        next.delete(emoji);
        setReactions((r) =>
          r.map((x) =>
            x.emoji === emoji ? { ...x, count: Math.max(0, x.count - 1) } : x
          )
        );
      } else {
        next.add(emoji);
        setReactions((r) =>
          r.map((x) => (x.emoji === emoji ? { ...x, count: x.count + 1 } : x))
        );
      }
      return next;
    });
  };

  const handleSave = () => {
    setSaved((v) => !v);
    showToast(saved ? "Removed from saved" : "Post saved!");
  };

  return (
    <>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      {showReadFull && (
        <ReadFullModal post={post} onClose={() => setShowReadFull(false)} />
      )}

      <article className="pb-6 sm:pb-8 border-b border-gray-200 last:border-0">
        {/* Author row */}
        <div className="flex items-start sm:items-center gap-2 sm:gap-2.5 mb-3 flex-wrap">
          <Avatar initials={post.initials} color={post.avatarColor} size="md" />
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
            <span className="text-[13px] sm:text-[14px] font-semibold text-gray-900">
              {post.author}
            </span>

            {post.badges?.map((b, i) => (
              <span
                key={i}
                className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md ${b.color}`}
              >
                {b.label}
              </span>
            ))}
            {!post.badges && (
              <span
                className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md ${post.roleBadgeColor}`}
              >
                {post.role}
              </span>
            )}
            {post.pinned && (
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-gray-500">
                <Pin size={10} />{" "}
                <span className="hidden sm:inline">PINNED</span>
              </div>
            )}
            {post.communityFavourite && (
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-red-500">
                <Star size={10} fill="currentColor" />
                <span className="hidden sm:inline">COMMUNITY FAVOURITE</span>
                <span className="sm:hidden">FAV</span>
              </div>
            )}
            <span className="text-[11px] sm:text-[12px] text-gray-400">
              {post.timeAgo}
            </span>
            {post.views && (
              <div className="flex items-center gap-1 text-[11px] sm:text-[12px] text-gray-400">
                <Eye size={11} /> {post.views}
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
          {post.tags.map((t, i) => (
            <span
              key={i}
              className={`text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md tracking-wide ${t.color}`}
            >
              {t.label}
            </span>
          ))}
        </div>

        {/* Title */}
        <h2
          className={`text-[16px] sm:text-[18px] md:text-[20px] font-bold leading-snug mb-2 cursor-pointer hover:underline underline-offset-2 ${
            post.titleColor ?? "text-gray-900"
          }`}
          onClick={() => setShowReadFull(true)}
        >
          {post.title}
        </h2>

        {/* Body */}
        <p className="text-[13px] sm:text-[14px] text-gray-600 leading-relaxed mb-4">
          {post.body}
        </p>

        {/* Trending strip */}
        {post.trending && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4 text-[11px] sm:text-[12px]">
            <span className="text-orange-500 font-bold flex items-center gap-1">
              <span>🔥</span> Trending
            </span>
            {post.trending.map((t, i) => (
              <span key={i} className="text-gray-500 font-medium">
                {t.label}
              </span>
            ))}
          </div>
        )}

        {/* Reaction pills */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
          {reactions.map((r, i) => (
            <ReactionPill
              key={i}
              emoji={r.emoji}
              count={r.count}
              active={activeReactions.has(r.emoji)}
              onToggle={() => handleTogglePill(r.emoji)}
            />
          ))}
        </div>

        {/* Action bar */}
        <ActionBar
          post={post}
          commentCount={post.commentCount}
          onToggleComments={() => setShowComments(!showComments)}
          showComments={showComments}
          onAddReaction={handleAddReaction}
          saved={saved}
          onSave={handleSave}
          onReadFull={() => setShowReadFull(true)}
        />

        {showComments && (
          <div className="mt-3 sm:mt-4">
            <CommentsSection
              comments={post.comments}
              count={post.commentCount}
            />
          </div>
        )}
      </article>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Feed
// ─────────────────────────────────────────────────────────────────

export default function CommunityFeed() {
  return (
    <div className="w-full max-w-[800px] mx-auto border-x border-gray-100 md:p-10 sm:p-6 px-3 py-4">
      <div className="space-y-6 sm:space-y-8">
        {POSTS.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
