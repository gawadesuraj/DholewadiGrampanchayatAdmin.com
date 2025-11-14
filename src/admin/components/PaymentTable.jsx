// admin/components/PaymentTable.jsx

import React from "react";

const statusOptions = ["pending", "approved", "rejected", "needs-info"];

function PaymentTable({
  payments,
  onUpdate,
  selectedStatus,
  setSelectedStatus,
  remarks,
  setRemarks,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300 rounded-lg text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">User ID</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Mobile</th>
            <th className="p-3 text-left">Screenshot</th>
            <th className="p-3 text-left">Submitted On</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Remarks</th>
            <th className="p-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{p.id}</td>
              <td className="p-3 font-mono">{p.user_id}</td>
              <td className="p-3">{p.name}</td>
              <td className="p-3">{p.mobile}</td>
              <td className="p-3">
                <a
                  href={p.screenshot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View
                </a>
              </td>
              <td className="p-3">
                {new Date(p.created_at).toLocaleDateString()}
              </td>
              <td className="p-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    p.status === "approved"
                      ? "bg-green-100 text-green-600"
                      : p.status === "rejected"
                      ? "bg-red-100 text-red-600"
                      : p.status === "needs-info"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {p.status}
                </span>
              </td>
              <td className="p-3 text-gray-700 text-xs">{p.remarks || "—"}</td>
              <td className="p-3 text-center">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-md p-1 text-xs"
                >
                  <option value="">Change</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="border border-gray-300 rounded-md text-xs px-2 py-1 mt-1 w-28"
                />

                <button
                  onClick={() => onUpdate(p.id)}
                  className="bg-primary text-white px-3 py-1 rounded-md text-xs mt-1 hover:bg-primary-dark"
                >
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PaymentTable;
