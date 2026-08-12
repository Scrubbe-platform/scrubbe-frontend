"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Header from "@/components/IMS/DashboardHeader";
import WarRoomList from "./WarRoomList";
import WarRoomDetail, { type SummaryActionKind } from "./WarRoomDetail";
import WarRoomDrawer, { type DrawerState } from "./WarRoomDrawer";
import {
  CURRENT_USER, INITIAL_ROOMS, classify, isAgent, nextFollowUpId,
  type FollowUp, type FollowUpType, type WarRoom,
} from "./warRoomLibrary.data";

export default function WarRoomLibrary() {
  const [rooms, setRooms] = useState<WarRoom[]>(INITIAL_ROOMS);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<DrawerState>(null);

  const room = roomId ? rooms.find((r) => r.wr === roomId) ?? null : null;

  function openRoom(wr: string) {
    setRoomId(wr);
    setDrawer(null);
    window.scrollTo({ top: 0 });
  }
  function backToList() {
    setRoomId(null);
    setDrawer(null);
    window.scrollTo({ top: 0 });
  }

  function updateCap(id: string, updater: (c: FollowUp) => FollowUp) {
    if (!roomId) return;
    setRooms((prev) => prev.map((r) => (r.wr !== roomId ? r : { ...r, caps: r.caps.map((c) => (c.id === id ? updater(c) : c)) })));
  }

  function approve(id: string) {
    if (!room) return;
    const cap = room.caps.find((c) => c.id === id);
    if (!cap?.approval) return;
    const role = cap.approval.role;
    updateCap(id, (c) => ({ ...c, approval: c.approval ? { ...c.approval, state: "approved" } : c.approval, status: "motion" }));
    toast.success(`${id} approved by ${role}`);
  }

  function run(id: string) {
    if (!room) return;
    const cap = room.caps.find((c) => c.id === id);
    if (!cap) return;
    if (cap.approval && cap.approval.state !== "approved") { toast.warning(`Needs ${cap.approval.role} approval first`); return; }
    if (cap.status === "done") return;
    updateCap(id, (c) => ({ ...c, status: "motion" }));
    toast(`${isAgent(cap.owner) ? cap.owner : "Agent"} is applying ${id}`);
    setTimeout(() => {
      updateCap(id, (c) => ({ ...c, status: "done", plan: "Applied and validated automatically. Recorded to operational memory." }));
      toast.success(`${id} completed automatically`);
    }, 1300);
  }

  function markDone(id: string) {
    updateCap(id, (c) => ({ ...c, status: "done" }));
    toast.success(`${id} marked done`);
  }

  function capture(text: string): { id: string; type: FollowUpType } | null {
    if (!roomId) return null;
    const target = rooms.find((r) => r.wr === roomId);
    if (!target) return null;
    const c = classify(text);
    const id = nextFollowUpId(target);
    const newCap: FollowUp = {
      id, type: c.type, text: text.length > 90 ? text.slice(0, 88) + "…" : text,
      by: CURRENT_USER, at: "now", quote: text, src: `${CURRENT_USER}, just now`,
      did: c.did, target: c.target, owner: c.owner, status: c.status, plan: c.plan,
    };
    setRooms((prev) => prev.map((r) => (r.wr === roomId ? { ...r, caps: [newCap, ...r.caps] } : r)));
    return { id, type: c.type };
  }

  function confirmAction(kind: SummaryActionKind) {
    if (!room) return;
    setDrawer(null);
    const msg = kind === "ticket" ? `Incident ticket raised from ${room.wr}` : kind === "kb" ? `Added to the knowledge base from ${room.wr}` : `Updated the problem record from ${room.wr}`;
    toast.success(msg);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-ibm">
      <Header title={room ? `War rooms / ${room.wr}` : "War rooms"} />
      {room ? (
        <WarRoomDetail
          key={room.wr}
          room={room}
          onBack={backToList}
          onOpenCap={(id) => setDrawer({ mode: "cap", id })}
          onSummaryAction={(kind) => setDrawer({ mode: "action", kind })}
          onCapture={capture}
        />
      ) : (
        <WarRoomList rooms={rooms} onOpen={openRoom} />
      )}
      <WarRoomDrawer room={room} drawer={drawer} onClose={() => setDrawer(null)} onApprove={approve} onRun={run} onMarkDone={markDone} onConfirmAction={confirmAction} />
    </div>
  );
}
