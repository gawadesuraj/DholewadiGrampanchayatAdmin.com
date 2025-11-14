import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../services/supabaseClient";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import UpdateCertificateModal from "./UpdateCertificateModal";

export default function Certificates() {
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState(null);

  // ✅ Fetch certificate applications (no change needed, select * gets new columns)
  const {
    data: applications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["certificateApplications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificate_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // ✅ Update mutation (status, remarks, payment_verified, optional uploaded certificate)
  const updateCertificate = useMutation({
    // --- CHANGED: Added payment_verified to mutation function ---
    mutationFn: async ({
      id,
      status,
      remarks,
      certificateFile,
      payment_verified, // <-- ADDED
    }) => {
      let issued_url = null;

      // If approved and file is uploaded → store it
      if (status === "approved" && certificateFile) {
        const filePath = `issued_certificates/certificate_${id}_${Date.now()}_${
          certificateFile.name
        }`;
        const { error: uploadError } = await supabase.storage
          .from("certificate_uploads") // Assuming this is your bucket for issued certs too
          .upload(filePath, certificateFile);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from("certificate_uploads")
          .getPublicUrl(filePath);

        issued_url = publicUrl.publicUrl;
      }

      // Update the record
      const { error } = await supabase
        .from("certificate_applications")
        // --- CHANGED: Added payment_verified to update object ---
        .update({ status, remarks, issued_url, payment_verified }) // <-- ADDED
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["certificateApplications"]);
      toast.success("✅ Certificate status updated successfully!");
      setSelectedApplication(null);
    },
    onError: (err) => {
      console.error(err);
      toast.error("❌ Failed to update certificate application.");
    },
  });

  // ✅ Badge helper
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

  // --- ADDED: Badge for payment verification ---
  const getPaymentBadge = (isVerified) => {
    const base = "px-3 py-1 text-xs rounded-full font-medium";
    return isVerified
      ? `${base} bg-green-100 text-green-700`
      : `${base} bg-gray-100 text-gray-700`;
  };

  // ✅ Loading/Error/Empty States
  if (isLoading)
    return (
      <div className="p-8 text-gray-500 flex items-center gap-2">
        <Loader2 className="animate-spin" size={18} /> Loading applications...
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-red-500">
        Error loading certificate applications. Check Supabase connection.
      </div>
    );

  if (!applications?.length)
    return (
      <div className="p-8 text-gray-500">
        No certificate applications found.
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Certificate Applications</h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow border">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border px-4 py-2">User ID</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Mobile</th>
              <th className="border px-4 py-2">Type</th>
              <th className="border px-4 py-2">Purpose</th>
              <th className="border px-4 py-2">Document</th>
              {/* --- ADDED: New Columns --- */}
              <th className="border px-4 py-2">Payment Screenshot</th>
              <th className="border px-4 py-2">Payment Verified</th>
              {/* --- End Added --- */}
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Remarks</th>
              <th className="border px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50 border-t">
                <td className="px-4 py-2">{a.user_id}</td>
                <td className="px-4 py-2">{a.name || "—"}</td>
                <td className="px-4 py-2">{a.mobile || "—"}</td>
                <td className="px-4 py-2">{a.certificate_type || "—"}</td>
                <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
                  {a.purpose || "—"}
                </td>
                <td className="px-4 py-2">
                  {a.document_url ? (
                    <a
                      href={a.document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">No File</span>
                  )}
                </td>

                {/* --- ADDED: New Cells --- */}
                <td className="px-4 py-2">
                  {a.payment_screenshot_url ? (
                    <a
                      href={a.payment_screenshot_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">No File</span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  <span className={getPaymentBadge(a.payment_verified)}>
                    {a.payment_verified ? "Verified" : "Pending"}
                  </span>
                </td>
                {/* --- End Added --- */}

                <td className="px-4 py-2 text-center">
                  <span className={getStatusBadge(a.status)}>
                    {a.status || "pending"}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs text-gray-700">
                  {a.remarks || "—"}
                </td>

                {/* Actions */}
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => setSelectedApplication(a)}
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

      {/* ✅ Modal (Passes the updated mutation function) */}
      <UpdateCertificateModal
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        updateMutation={updateCertificate}
      />
    </div>
  );
}
