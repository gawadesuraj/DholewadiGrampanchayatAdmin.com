import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function UpdateCertificateModal({
  application,
  onClose,
  updateMutation,
}) {
  const [status, setStatus] = useState("pending");
  const [remarks, setRemarks] = useState("");
  const [certificateFile, setCertificateFile] = useState(null);

  // --- ADDED: State for payment verification ---
  const [paymentVerified, setPaymentVerified] = useState(false);

  // Effect to populate state when modal opens
  useEffect(() => {
    if (application) {
      setStatus(application.status || "pending");
      setRemarks(application.remarks || "");
      // --- ADDED: Set payment verification state ---
      setPaymentVerified(application.payment_verified || false);

      setCertificateFile(null); // Reset file input
    }
  }, [application]);

  if (!application) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      id: application.id,
      status,
      remarks,
      certificateFile,
      // --- ADDED: Pass payment_verified to mutation ---
      payment_verified: paymentVerified,
    });
  };

  const isSubmitting = updateMutation.isLoading;

  return (
    // Basic Modal Structure (backdrop)
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      {/* Modal Content */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl"
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b">
            <h3 className="text-xl font-semibold">Manage Application</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* User Info */}
            <div>
              <p>
                <strong>User:</strong> {application.name} ({application.user_id}
                )
              </p>
              <p>
                <strong>Mobile:</strong> {application.mobile}
              </p>
              <p>
                <strong>Type:</strong> {application.certificate_type}
              </p>
              <p>
                <strong>Purpose:</strong> {application.purpose}
              </p>
            </div>

            {/* --- ADDED: Links to view documents --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href={application.document_url}
                target="_blank"
                rel="noreferrer"
                className="text-center w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-blue-600 hover:bg-gray-50"
              >
                View Supporting Document
              </a>
              <a
                href={application.payment_screenshot_url}
                target="_blank"
                rel="noreferrer"
                className="text-center w-full px-4 py-2 border border-blue-600 bg-blue-50 rounded-md text-sm text-blue-700 font-medium hover:bg-blue-100"
              >
                View Payment Screenshot
              </a>
            </div>

            {/* --- ADDED: Payment Verification Checkbox --- */}
            <div className="border-t pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded text-blue-600"
                  checked={paymentVerified}
                  onChange={(e) => setPaymentVerified(e.target.checked)}
                />
                <span className="font-medium text-gray-800">
                  Payment Verified
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-7">
                Check this box to confirm the payment has been received.
              </p>
            </div>

            {/* Status Update */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium mb-1">
                Application Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="pending">Pending</option>
                <option value="needs-info">Needs Info</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Remarks (optional)
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Add remarks for the user (e.g., reason for rejection)"
              />
            </div>

            {/* Upload Issued Certificate (if approved) */}
            {status === "approved" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Upload Issued Certificate (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setCertificateFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center gap-3 p-4 bg-gray-50 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={16} />}
              {isSubmitting ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
