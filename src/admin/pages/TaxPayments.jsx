// src/admin/pages/TaxPayments.jsx

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../services/supabaseClient";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import UpdatePaymentModal from "./UpdatePaymentModal"; // ✅ Import the new modal



export default function TaxPayments() {
  const queryClient = useQueryClient();
  
  // ✅ NEW: State to manage which payment is being edited in the modal
  const [selectedPayment, setSelectedPayment] = useState(null);

  // ⛔ REMOVED: All the per-row state is no longer needed
  // const [statusInputs, setStatusInputs] = useState({});
  // const [remarkInputs, setRemarkInputs] = useState({});
  // const [receiptFiles, setReceiptFiles] = useState({});
  // const [fileSelected, setFileSelected] = useState({});

  // ✅ Fetch payments (No changes needed)
  const {
    data: payments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["taxPayments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_payments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // ✅ Update + Upload Mutation
  const updateStatus = useMutation({
    // mutationFn (No changes needed)
    mutationFn: async ({ id, status, remarks, receiptFile }) => {
      let receipt_url = null;
      if (status === "approved" && receiptFile) {
        const filePath = `receipts/receipt_${id}_${Date.now()}_${
          receiptFile.name
        }`;
        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(filePath, receiptFile);
        if (uploadError) throw uploadError;
        const { data: publicUrl } = supabase.storage
          .from("receipts")
          .getPublicUrl(filePath);
        receipt_url = publicUrl.publicUrl;
      }
      const { error } = await supabase
        .from("tax_payments")
        .update({ status, remarks, receipt_url })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["taxPayments"]);
      toast.success("✅ Status updated successfully!");
      // ✅ NEW: Close the modal on success
      setSelectedPayment(null);
    },
    onError: (err) => {
      console.error(err);
      toast.error("❌ Failed to update status or upload receipt.");
    },
  });

  // ⛔ REMOVED: handleUpdate(id) is no longer needed.
  // The modal will have its own submit handler.

  // ✅ UI Helpers (No changes needed)
  const getStatusBadge = (status) => {
    const base = "px-3 py-1 text-xs rounded-full font-medium";
    switch (status) {
      case "approved":
        return `${base} bg-green-100 text-green-700`;
      case "rejected":
        return `${base} bg-red-100 text-red-700`;
      case "needs-info":
        return `${base} bg-yellow-100 text-yellow-800`;
      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  // ✅ Loading/Error/Empty states (No changes needed)
  if (isLoading)
    return (
      <div className="p-8 text-gray-500 flex items-center gap-2">
        <Loader2 className="animate-spin" size={18} /> Loading tax payments...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-red-500">
        Error loading tax payment records. Check Supabase connection.
      </div>
    );
  if (!payments?.length)
    return (
      <div className="p-8 text-gray-500">No tax payment records found.</div>
    );

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Tax Payment Management</h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow border">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border px-4 py-2">User ID</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Mobile</th>
              <th className="border px-4 py-2">Screenshot</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Remarks</th>
              <th className="border px-4 py-2">Receipt</th>
              <th className="border px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 border-t">
                {/* All display <td> cells remain the same */}
                <td className="px-4 py-2">{p.user_id}</td>
                <td className="px-4 py-2">{p.name || "—"}</td>
                <td className="px-4 py-2">{p.mobile || "—"}</td>
                <td className="px-4 py-2">
                  {p.screenshot_url ? (
                    <a
                      href={p.screenshot_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  <span className={getStatusBadge(p.status)}>
                    {p.status || "pending"}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs text-gray-700">
                  {p.remarks || "—"}
                </td>
                <td className="px-4 py-2 text-center">
                  {p.receipt_url ? (
                    <a
                      href={p.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-green-600 underline text-xs"
                    >
                      View Receipt
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>

                {/* ✅ MODIFIED: Admin Actions Cell */}
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => setSelectedPayment(p)}
                    className="bg-indigo-600 text-white px-3 py-1 text-xs rounded hover:bg-indigo-700 transition"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ NEW: Render the modal */}
      {/* It will only appear when selectedPayment is not null */}
      <UpdatePaymentModal
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        updateMutation={updateStatus}
      />
    </div>
  );
}