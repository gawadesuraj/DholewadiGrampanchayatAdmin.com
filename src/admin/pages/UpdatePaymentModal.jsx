// src/admin/pages/UpdatePaymentModal.jsx

import React, { useState, useEffect } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "react-toastify";

// Define the limit in bytes (256 * 1024)
const MAX_FILE_SIZE_BYTES = 262144;

export default function UpdatePaymentModal({
  payment,
  onClose,
  updateMutation,
}) {
  // ✅ Local state for the form inside the modal
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);

  // This effect "resets" the form every time the 'payment' prop changes
  useEffect(() => {
    if (payment) {
      setStatus(payment.status || "pending");
      setRemarks(payment.remarks || "");
      setReceiptFile(null); // Always clear the file input
    }
  }, [payment]);

  // Don't render the modal if no payment is selected
  if (!payment) return null;

  // ✅ Local submit handler
  const handleSubmit = () => {
    // Client-side validation
    if (status === "approved" && !receiptFile) {
      toast.warn("Please upload a receipt file for approval.");
      return;
    }

    // Call the mutation passed from the parent
    updateMutation.mutate({
      id: payment.id,
      status,
      remarks,
      receiptFile,
    });
  };

  // Get loading state from the mutation hook
  const { isPending } = updateMutation;

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      {/* Modal Content */}
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Manage Payment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Read-only Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200 text-sm space-y-1">
          <p>
            <strong>User:</strong> {payment.name || "N/A"} ({payment.user_id})
          </p>
          <p>
            <strong>Mobile:</strong> {payment.mobile || "N/A"}
          </p>
          <p>
            <strong>Screenshot:</strong>{" "}
            {payment.screenshot_url ? (
              <a
                href={payment.screenshot_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                View Screenshot
              </a>
            ) : (
              "N/A"
            )}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="needs-info">Needs Info</option>
            </select>
          </div>

          {/* Remarks */}
          <div>
            <label
              htmlFor="remarks"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Remarks (Optional)
            </label>
            <textarea
              id="remarks"
              placeholder="Add remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* File Upload (Conditional) */}
          {status === "approved" && (
            <div>
              {/* ✅ MODIFIED: Added size limit to label */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Receipt (Max 256KB)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer bg-gray-100 px-3 py-2 rounded-md border hover:bg-gray-200">
                <Upload size={16} className="text-gray-600" />
                <span className="text-gray-700">
                  {receiptFile ? receiptFile.name : "Choose file..."}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  // ✅ MODIFIED: Added validation logic
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return; // User cancelled

                    // Check file size
                    if (file.size > MAX_FILE_SIZE_BYTES) {
                      toast.error(
                        `❌ File is too large. Must be under 256 KB.`
                      );
                      e.target.value = null; // Clear the file input
                      setReceiptFile(null); // Clear the state
                    } else {
                      // File is valid
                      setReceiptFile(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
              {receiptFile && (
                <p className="text-xs text-green-600 mt-1">
                  File selected: {receiptFile.name}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button
              onClick={onClose}
              disabled={isPending}
              className="bg-gray-200 text-gray-800 px-4 py-2 text-sm rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition"
            >
              {isPending && <Loader2 className="animate-spin" size={16} />}
              {isPending ? "Updating..." : "Submit Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
