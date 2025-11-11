// Admin/src/admin/pages/grievances/GrievancesList.jsx

import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { toast } from "react-toastify";

export default function GrievancesList() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  const statusOptions = [
    { value: "new", label: "🟢 New" },
    { value: "in_progress", label: "🟡 In Progress" },
    { value: "resolved", label: "✅ Resolved" },
    { value: "rejected", label: "❌ Rejected" },
  ];

  // 🧭 Fetch grievances
  async function fetchGrievances() {
    setLoading(true);
    const { data, error } = await supabase
      .from("grievances")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Failed to load grievances.");
    } else {
      setGrievances(data || []);
    }
    setLoading(false);
  }

  // ⚙️ Realtime listener
  useEffect(() => {
    fetchGrievances();

    const channel = supabase
      .channel("realtime-grievances-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "grievances" },
        (payload) => {
          setGrievances((prev) => {
            if (payload.eventType === "INSERT")
              return [payload.new, ...prev];
            if (payload.eventType === "UPDATE")
              return prev.map((g) => (g.id === payload.new.id ? payload.new : g));
            if (payload.eventType === "DELETE")
              return prev.filter((g) => g.id !== payload.old.id);
            return prev;
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ✏️ Update grievance status
  async function handleStatusChange(id, newStatus) {
    setUpdating(id);

    const { error } = await supabase
      .from("grievances")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error(error);
      toast.error("Failed to update status.");
    } else {
      toast.success("Status updated successfully!");
    }

    setUpdating(null);
  }

  // 🧮 Filter grievances
  const filtered =
    filter === "all"
      ? grievances
      : grievances.filter((g) => g.status === filter);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Grievance Management</h1>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          onClick={fetchGrievances}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center text-gray-500">Loading grievances...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 mt-10">
          No grievances found for this filter.
        </p>
      ) : (
        <div className="overflow-x-auto border rounded-xl shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Citizen Name</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Type</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr
                  key={g.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 font-medium text-gray-800">#{g.id}</td>
                  <td className="p-3">{g.name}</td>
                  <td className="p-3">{g.subject}</td>
                  <td className="p-3 text-gray-600">
                    {g.grievance_type || "-"}
                  </td>
                  <td className="p-3 text-gray-600">
                    {g.phone || "-"}
                    <br />
                    {g.email && (
                      <span className="text-xs text-gray-400">{g.email}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        g.status === "resolved"
                          ? "bg-green-100 text-green-700"
                          : g.status === "in_progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : g.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {g.status ? g.status.replace("_", " ") : "New"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <select
                      value={g.status || "new"}
                      onChange={(e) => handleStatusChange(g.id, e.target.value)}
                      disabled={updating === g.id}
                      className="border rounded-md px-2 py-1 text-xs focus:ring-2 focus:ring-primary"
                    >
                      {statusOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
