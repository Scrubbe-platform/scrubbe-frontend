import { customAxios } from "@/lib/api/axios";
import { endpoint } from "@/lib/api/endpoint";

const unwrap = <T,>(payload: any): T => payload?.data ?? payload;

export interface ConversationSummary {
  id: string;
  otherUserId: string;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
  online: boolean;
}

export interface DirectMessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  editedAt?: string | null;
  deletedAt?: string | null;
}

export const fetchConversations = async (): Promise<ConversationSummary[]> => {
  const res = await customAxios.get(endpoint.direct_messages.conversations);
  return unwrap<ConversationSummary[]>(res.data) ?? [];
};

export const getOrCreateConversation = async (recipientId: string) => {
  const res = await customAxios.post(endpoint.direct_messages.conversations, { recipientId });
  return unwrap<{ id: string; userAId: string; userBId: string }>(res.data);
};

export const fetchConversationMessages = async (conversationId: string): Promise<DirectMessageRecord[]> => {
  const res = await customAxios.get(`${endpoint.direct_messages.conversations}/${conversationId}/messages`);
  return unwrap<DirectMessageRecord[]>(res.data) ?? [];
};

export const markConversationRead = async (conversationId: string): Promise<void> => {
  await customAxios.post(`${endpoint.direct_messages.conversations}/${conversationId}/read`);
};

export const fetchOnlineUserIds = async (): Promise<string[]> => {
  const res = await customAxios.get(endpoint.direct_messages.onlineStatus);
  return unwrap<{ onlineUserIds: string[] }>(res.data)?.onlineUserIds ?? [];
};
