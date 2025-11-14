// pages/events/EventsList.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteEvent, fetchEvents } from "../../services/api";
import { toast } from 'react-toastify';

export default function EventsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchEvents();
        setItems(data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onDelete(id) {
    if (!confirm("Delete this event?")) return;
    try {
      await deleteEvent(id);
      setItems(prev => prev.filter(x => x.id !== id));
      toast.success('Event deleted successfully!');
    } catch (error) {
      toast.error('Error deleting event: ' + error.message);
    }
  }

  if (loading) return <div>Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Events</h1>
        <button onClick={() => navigate("/admin/events/new")} className="px-3 py-2 border rounded-md">New</button>
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Published</th>
              <th className="text-left p-3">Updated</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(e => (
              <tr key={e.id} className="border-t">
                <td className="p-3">{e.title}</td>
                <td className="p-3">{e.date}</td>
                <td className="p-3">{e.is_published ? "Yes" : "No"}</td>
                <td className="p-3">{e.updated_at?.slice(0,19).replace('T',' ')}</td>
                <td className="p-3 text-right space-x-2">
                  <Link to={`/admin/events/${e.id}`} className="px-2 py-1 border rounded-md">Edit</Link>
                  <button onClick={() => onDelete(e.id)} className="px-2 py-1 border rounded-md">Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td className="p-3" colSpan={5}>No items</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
