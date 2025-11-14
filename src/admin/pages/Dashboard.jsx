// src/admin/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function Dashboard() {
  const [counts, setCounts] = useState({
    news: 0,
    grievances: 0,
    taxPayments: 0,
    photos: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        // 📰 Count total news items
        const { count: newsCount, error: newsError } = await supabase
          .from("news")
          .select("*", { count: "exact", head: true });
        if (newsError) throw newsError;

        // 📋 Count total grievances
        const { count: grievanceCount, error: grievanceError } = await supabase
          .from("grievances")
          .select("*", { count: "exact", head: true });
        if (grievanceError) throw grievanceError;

        // 📸 Count total photos
        const { count: photosCount, error: photosError } = await supabase
          .from("photos")
          .select("*", { count: "exact", head: true });
        if (photosError) throw photosError;

        // 💰 Count total tax payments
        const { data: taxPayments, error: paymentError } = await supabase
          .from("tax_payments")
          .select("status");
        if (paymentError) throw paymentError;

        const totalPayments = taxPayments?.length || 0;
        const pending = taxPayments?.filter(
          (p) => p.status === "pending"
        )?.length;
        const approved = taxPayments?.filter(
          (p) => p.status === "approved"
        )?.length;
        const rejected = taxPayments?.filter(
          (p) => p.status === "rejected"
        )?.length;

        setCounts({
          news: newsCount || 0,
          grievances: grievanceCount || 0,
          taxPayments: totalPayments,
          photos: photosCount || 0,
          pending: pending || 0,
          approved: approved || 0,
          rejected: rejected || 0,
        });
      } catch (err) {
        console.error("Error fetching dashboard counts:", err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {loading ? (
        <div className="text-gray-500">Loading data...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* 📰 News Card */}
          <div className="p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition">
            <div className="text-sm text-gray-500">News</div>
            <div className="text-3xl font-bold text-primary">{counts.news}</div>
            <div className="text-xs text-gray-400 mt-1">Total items</div>
          </div>

          {/* 📋 Grievances Card */}
          <div className="p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition">
            <div className="text-sm text-gray-500">Grievances</div>
            <div className="text-3xl font-bold text-primary">
              {counts.grievances}
            </div>
            <div className="text-xs text-gray-400 mt-1">Total items</div>
          </div>

          {/* 📸 Photos Card */}
          <div className="p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition">
            <div className="text-sm text-gray-500">Photos</div>
            <div className="text-3xl font-bold text-primary">{counts.photos}</div>
            <div className="text-xs text-gray-400 mt-1">Gallery images</div>
          </div>

          {/* 💰 Tax Payments Total */}
          <div className="p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition">
            <div className="text-sm text-gray-500">Tax Payments</div>
            <div className="text-3xl font-bold text-primary">
              {counts.taxPayments}
            </div>
            <div className="text-xs text-gray-400 mt-1">Total payments</div>
          </div>

          {/* 🟡 Pending */}
          <div className="p-4 bg-yellow-50 rounded-xl border shadow-sm hover:shadow-md transition">
            <div className="text-sm text-gray-500">Pending</div>
            <div className="text-3xl font-bold text-yellow-600">
              {counts.pending}
            </div>
            <div className="text-xs text-gray-400 mt-1">Awaiting approval</div>
          </div>

          {/* 🟢 Approved */}
          <div className="p-4 bg-green-50 rounded-xl border shadow-sm hover:shadow-md transition">
            <div className="text-sm text-gray-500">Approved</div>
            <div className="text-3xl font-bold text-green-600">
              {counts.approved}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Successfully verified
            </div>
          </div>

          {/* 🔴 Rejected */}
          <div className="p-4 bg-red-50 rounded-xl border shadow-sm hover:shadow-md transition">
            <div className="text-sm text-gray-500">Rejected</div>
            <div className="text-3xl font-bold text-red-600">
              {counts.rejected}
            </div>
            <div className="text-xs text-gray-400 mt-1">Marked invalid</div>
          </div>
        </div>
      )}
    </div>
  );
}
