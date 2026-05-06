"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import useAuthStore from "@/lib/stores/auth.store";
import { toast } from "sonner";
import CButton from "@/components/ui/Cbutton";
import { User, Calendar, Clock, Plus } from "lucide-react";

const Page = () => {
  const { get, post } = useFetch();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ userId: "", startDate: "", endDate: "" });

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["on-call-assignments"],
    queryFn: async () => {
      const res = await get(endpoint.on_call.get_all_assign);
      if (res.success) return res.data?.data ?? res.data ?? [];
      return [];
    },
  });

  const { mutateAsync: assign, isPending: assigning } = useMutation({
    mutationFn: async () => {
      const res = await post(endpoint.on_call.assign_member, {
        userId: form.userId || user?.id,
        startDate: form.startDate,
        endDate: form.endDate,
      });
      if (!res.success) throw new Error(res.data ?? "Failed to assign");
      return res.data;
    },
    onSuccess: () => {
      toast.success("On-call assignment saved");
      queryClient.invalidateQueries({ queryKey: ["on-call-assignments"] });
      setShowForm(false);
      setForm({ userId: "", startDate: "", endDate: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">On-Call Schedule</h1>
          <p className="text-[#64748B] text-sm mt-1">
            Manage on-call assignments and rotations.
          </p>
        </div>
        <CButton onClick={() => setShowForm(!showForm)} className="w-fit flex items-center gap-2">
          <Plus size={16} /> Assign Member
        </CButton>
      </div>

      {showForm && (
        <div className="border border-neutral-600 rounded-2xl p-6 space-y-4 bg-[#0B1224]">
          <h3 className="text-white font-bold">New Assignment</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[#94A3B8] text-xs font-medium uppercase tracking-wider">User ID</label>
              <input
                className="w-full bg-transparent border border-neutral-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00CAD8]"
                placeholder="User ID or leave blank for yourself"
                value={form.userId}
                onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] text-xs font-medium uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                className="w-full bg-transparent border border-neutral-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00CAD8]"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#94A3B8] text-xs font-medium uppercase tracking-wider">End Date</label>
              <input
                type="date"
                className="w-full bg-transparent border border-neutral-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00CAD8]"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <CButton
              onClick={() => setShowForm(false)}
              className="w-fit bg-transparent border border-neutral-600 text-white shadow-none hover:bg-neutral-800"
            >
              Cancel
            </CButton>
            <CButton
              onClick={() => assign()}
              isLoading={assigning}
              disabled={assigning || !form.startDate || !form.endDate}
              className="w-fit"
            >
              Save
            </CButton>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-neutral-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="border border-neutral-700 rounded-2xl p-12 text-center space-y-3">
          <Calendar size={40} className="text-[#64748B] mx-auto" />
          <p className="text-white font-medium">No on-call assignments yet</p>
          <p className="text-[#64748B] text-sm">Click "Assign Member" to create the first rotation.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(assignments as any[]).map((a: any) => (
            <div
              key={a.id}
              className="border border-neutral-700 rounded-2xl p-5 flex items-center justify-between hover:border-[#00CAD8]/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0B1224] border border-[#00CAD8]/30 flex items-center justify-center">
                  <User size={18} className="text-[#00CAD8]" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {a.user?.firstName
                      ? `${a.user.firstName} ${a.user.lastName ?? ""}`
                      : a.userId ?? "Unknown"}
                  </p>
                  <p className="text-[#64748B] text-xs">{a.user?.email ?? ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-[#94A3B8]">
                  <Clock size={14} />
                  <span>
                    {a.startDate
                      ? new Date(a.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "—"}{" "}
                    →{" "}
                    {a.endDate
                      ? new Date(a.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "—"}
                  </span>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    a.isActive
                      ? "border-[#4ADE80]/40 text-[#4ADE80] bg-[#4ADE80]/10"
                      : "border-neutral-600 text-[#64748B]"
                  }`}
                >
                  {a.isActive ? "Active" : "Scheduled"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
