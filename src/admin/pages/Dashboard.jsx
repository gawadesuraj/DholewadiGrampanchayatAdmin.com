// src/admin/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { fetchEvents } from "../services/api";

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

  const [events, setEvents] = useState({
    upcoming: [],
    past: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        // News count
        const { count: newsCount, error: newsError } = await supabase
          .from("news")
          .select("*", { count: "exact", head: true });
        if (newsError) throw newsError;

        // Grievances count
        const { count: grievanceCount, error: grievanceError } = await supabase
          .from("grievances")
          .select("*", { count: "exact", head: true });
        if (grievanceError) throw grievanceError;

        // Photos count
        const { count: photosCount, error: photosError } = await supabase
          .from("photos")
          .select("*", { count: "exact", head: true });
        if (photosError) throw photosError;

        // Tax payments
        const { data: taxPayments, error: paymentError } = await supabase
          .from("tax_payments")
          .select("status");
        if (paymentError) throw paymentError;

        const totalPayments = taxPayments?.length || 0;
        const pending = taxPayments?.filter((p) => p.status === "pending")
          ?.length;
        const approved = taxPayments?.filter((p) => p.status === "approved")
          ?.length;
        const rejected = taxPayments?.filter((p) => p.status === "rejected")
          ?.length;

        setCounts({
          news: newsCount || 0,
          grievances: grievanceCount || 0,
          taxPayments: totalPayments,
          photos: photosCount || 0,
          pending: pending || 0,
          approved: approved || 0,
          rejected: rejected || 0,
        });

        // Fetch events & categorize
        const eventsData = await fetchEvents();
        const today = new Date().toISOString().split("T")[0];

        const upcoming = eventsData
          .filter((event) => event.date >= today)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5);

        const past = eventsData
          .filter((event) => event.date < today)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);

        setEvents({ upcoming, past });
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
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* News */}
            <div className="p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition">
              <div className="text-sm text-gray-500">News</div>
              <div className="text-3xl font-bold text-primary">
                {counts.news}
              </div>
              <div className="text-xs text-gray-400 mt-1">Total items</div>
            </div>

            {/* Grievances */}
            <div className="p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition">
              <div className="text-sm text-gray-500">Grievances</div>
              <div className="text-3xl font-bold text-primary">
                {counts.grievances}
              </div>
              <div className="text-xs text-gray-400 mt-1">Total items</div>
            </div>

            {/* Photos */}
            <div className="p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition">
              <div className="text-sm text-gray-500">Photos</div>
              <div className="text-3xl font-bold text-primary">
                {counts.photos}
              </div>
              <div className="text-xs text-gray-400 mt-1">Gallery images</div>
            </div>

            {/* Tax Payments */}
            <div className="p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition">
              <div className="text-sm text-gray-500">Tax Payments</div>
              <div className="text-3xl font-bold text-primary">
                {counts.taxPayments}
              </div>
              <div className="text-xs text-gray-400 mt-1">Total payments</div>
            </div>

            {/* Pending */}
            <div className="p-4 bg-yellow-50 rounded-xl border shadow-sm hover:shadow-md transition">
              <div className="text-sm text-gray-500">Pending</div>
              <div className="text-3xl font-bold text-yellow-600">
                {counts.pending}
              </div>
              <div className="text-xs text-gray-400 mt-1">Awaiting approval</div>
            </div>

            {/* Approved */}
            <div className="p-4 bg-green-50 rounded-xl border shadow-sm hover:shadow-md transition">
              <div className="text-sm text-gray-500">Approved</div>
              <div className="text-3xl font-bold text-green-600">
                {counts.approved}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Successfully verified
              </div>
            </div>

            {/* Rejected */}
            <div className="p-4 bg-red-50 rounded-xl border shadow-sm hover:shadow-md transition">
              <div className="text-sm text-gray-500">Rejected</div>
              <div className="text-3xl font-bold text-red-600">
                {counts.rejected}
              </div>
              <div className="text-xs text-gray-400 mt-1">Marked invalid</div>
            </div>
          </div>

          {/* Events Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Upcoming Events */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
              {events.upcoming.length > 0 ? (
                <div className="space-y-3">
                  {events.upcoming.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-gray-500">
                          {event.date} {event.time && `at ${event.time}`}
                        </div>
                        {event.venue && (
                          <div className="text-xs text-gray-400">
                            {event.venue}
                          </div>
                        )}
                      </div>

                      <div
                        className={`text-xs px-2 py-1 rounded ${
                          event.is_published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {event.is_published ? "Published" : "Draft"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  No upcoming events
                </div>
              )}
            </div>

            {/* Past Events */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">Recent Past Events</h2>
              {events.past.length > 0 ? (
                <div className="space-y-3">
                  {events.past.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-gray-500">
                          {event.date} {event.time && `at ${event.time}`}
                        </div>
                        {event.venue && (
                          <div className="text-xs text-gray-400">
                            {event.venue}
                          </div>
                        )}
                      </div>

                      <div
                        className={`text-xs px-2 py-1 rounded ${
                          event.is_published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {event.is_published ? "Published" : "Draft"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No past events</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
