import MessagesModal from "@/app/(incident)/incident/handover/_modules/components/MessagesModal";
import Dropdown from "@/components/ui/Dropdown";
import React, { useMemo, useState } from "react";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { useIncidentPresence } from "@/hooks/useIncidentPresence";
import useMember from "@/hooks/useMember";
import useAuthStore from "@/lib/stores/auth.store";

const AVATAR_COLORS = [
  "bg-zinc-900 text-white font-mono",
  "bg-purple-600 text-white font-mono",
  "bg-cyan-700 text-white font-mono",
  "bg-amber-700 text-white font-mono",
  "bg-pink-700 text-white font-mono",
  "bg-emerald-700 text-white font-mono",
];
// Same hash-based color assignment MessagesModal.tsx uses, so a person's
// avatar color is consistent between the two components.
function colorClassFor(id: string) {
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

type Props = {
  title: string;
  ticketId?: string | null;
};

const LiveViewers = ({ title, ticketId }: Props) => {
  const [openChatModal, setOpenChatModal] = useState(false);
  const [chatMemberId, setChatMemberId] = useState<string | undefined>();
  const { user } = useAuthStore();
  const { data: members = [] } = useMember();
  const presenceRows = useIncidentPresence(ticketId);

  const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  const viewers = useMemo(
    () =>
      presenceRows.map((row) => {
        const member = memberMap.get(row.userId);
        const name = member ? `${member.firstname} ${member.lastname}`.trim() : row.userId;
        return {
          userId: row.userId,
          name: name || member?.email || "Unknown",
          role: member?.role ?? "",
          colorClass: colorClassFor(row.userId),
          isYou: row.userId === user?.id,
        };
      }),
    [presenceRows, memberMap, user?.id]
  );

  const openChatWith = (userId: string) => {
    setChatMemberId(userId);
    setOpenChatModal(true);
  };

  return (
    <div>
      <Dropdown
        trigger={
          <div className=" border items-center flex gap-2 p-1 px-2 rounded-md bg-gray-50">
            <div className="flex items-center -space-x-2 select-none">
              {viewers.slice(0, 4).map((viewer) => (
                <div
                  key={viewer.userId}
                  className={`relative h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-2xs dark:border-zinc-950 cursor-pointer transition-transform hover:-translate-y-0.5 z-10 ${viewer.colorClass}`}
                  title={`${viewer.name}${viewer.role ? ` — ${viewer.role}` : ""}`}
                >
                  {viewer.name?.slice(0, 2).toUpperCase()}
                </div>
              ))}
              {viewers.length === 0 && (
                <div className="h-8 w-8 rounded-full border-2 border-white bg-stone-100 text-stone-400 flex items-center justify-center text-[10px] dark:border-zinc-950" />
              )}
              {viewers.length - 4 > 0 && (
                <div className="h-8 w-8 rounded-full border-2 border-white bg-stone-200 text-stone-600 flex items-center justify-center text-[10px] font-bold dark:border-zinc-950 dark:bg-zinc-800 dark:text-zinc-400">
                  +{viewers.length - 4}
                </div>
              )}
            </div>
            <p className="text-sm font-medium">Viewing</p>
          </div>
        }
      >
        <div className="min-w-[270px] px-4 py-4">
          <div>
            <p className="text-base font-bold">{title}</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {viewers.length} team member{viewers.length === 1 ? "" : "s"} · live
            </p>
          </div>

          <div className="mt-3">
            {viewers.length === 0 && (
              <p className="py-3 text-xs text-zinc-400 dark:text-zinc-500">
                No one else is viewing this incident right now.
              </p>
            )}
            {viewers.map((viewer) => (
              <div key={viewer.userId} className="flex justify-between items-center py-2">
                <div className="flex items-end gap-3">
                  <div
                    className={`relative h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-2xs dark:border-zinc-950 cursor-pointer transition-transform hover:-translate-y-0.5 z-10 ${viewer.colorClass}`}
                    title={`${viewer.name}${viewer.role ? ` — ${viewer.role}` : ""}`}
                  >
                    {viewer.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      {viewer.name} {viewer.isYou && "(You)"}
                    </p>
                    {viewer.role && <p className="text-xs">{viewer.role}</p>}
                  </div>
                </div>

                {!viewer.isYou && (
                  <div
                    onClick={() => openChatWith(viewer.userId)}
                    className="cursor-pointer text-sm text-IMSLightGreen border-IMSDarkGreen flex items-center gap-1 border rounded-sm px-2"
                  >
                    <BiMessageRoundedDetail />
                    Message
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Dropdown>

      {openChatModal && (
        <MessagesModal
          onClose={() => setOpenChatModal(false)}
          initialMemberId={chatMemberId}
        />
      )}
    </div>
  );
};

export default LiveViewers;
